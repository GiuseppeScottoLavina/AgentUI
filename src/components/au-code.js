/**
 * @fileoverview au-code - Code Block Component with Syntax Highlighting
 * 
 * Usage: <au-code language="html">...</au-code>
 */

import { AuElement, define } from '../core/AuElement.js';
import { html, safe } from '../core/utils.js';

/**
 * Code block with built-in syntax highlighting and copy-to-clipboard.
 *
 * @class
 * @extends AuElement
 * @element au-code
 */
export class AuCode extends AuElement {
    static baseClass = 'au-code';
    /** @type {string[]} */
    static observedAttributes = ['language'];

    /**
     * ML2: Reusable element for HTML entity decoding.
     * Replaces DOMParser which creates a full HTMLDocument per render.
     * Using a div is safe: setting innerHTML on a detached element
     * does not execute scripts. Reading textContent is pure text extraction.
     */
    static #decoder = null;

    /** @private */
    static #decodeEntities(html) {
        if (typeof document === 'undefined') return html;
        if (!AuCode.#decoder) {
            AuCode.#decoder = document.createElement('div');
        }
        AuCode.#decoder.innerHTML = html;
        const decoded = AuCode.#decoder.textContent;
        AuCode.#decoder.innerHTML = ''; // Clear for GC
        return decoded;
    }


    #originalCode = null;

    /** @override */
    connectedCallback() {
        super.connectedCallback();
        // Store original code before render
        if (!this.#originalCode && !this.querySelector('.au-code__content')) {
            this.#originalCode = this.textContent;
        }
    }

    /** @override */
    render() {
        // Idempotent: skip if already rendered
        if (this.querySelector('.au-code__content')) {
            return;
        }

        const language = this.attr('language', 'html');

        // Get raw code - use innerHTML to preserve any pre-escaped entities
        // textContent would decode &lt; to < which we don't want
        const rawCode = this.#originalCode || this.innerHTML;

        // First decode any HTML entities that might already be in the content
        // This handles cases where the HTML source uses &lt; &gt; etc.
        // ML2: Use reusable textarea instead of DOMParser (avoids full HTMLDocument allocation per render)
        const decodedCode = AuCode.#decodeEntities(rawCode);

        // Dedent: remove common leading whitespace from all lines
        const dedentedCode = this.#dedent(decodedCode);

        // Auto-indent: apply proper code formatting based on language
        const formattedCode = this.#autoIndent(dedentedCode, language);

        // Store formatted version for copy button
        const copyableCode = formattedCode;

        // Now escape for display - only &, <, > need escaping for code
        // Do NOT escape quotes as they are safe inside <code> elements
        const escaped = formattedCode
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Basic syntax highlighting
        const highlighted = this.#highlight(escaped, language);

        // R1 Security: sanitize highlighted output — only allow au-code__* span tags.
        // If highlight regex somehow produces unexpected HTML, this catches it.
        const sanitizedHighlighted = this.#sanitizeHighlighted(highlighted);

        this.innerHTML = html`
            <div class="au-code__header">
                <span class="au-code__language">${language.toUpperCase()}</span>
                <button class="au-code__copy" title="Copy code">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                    </svg>
                </button>
            </div>
            <pre class="au-code__pre"><code class="au-code__content">${safe(sanitizedHighlighted)}</code></pre>
        `;

        this.#applyStyles();
        this.#setupCopyButton(copyableCode);
    }

    /**
     * R1 Security: Validate highlighted HTML output.
     * Only allow <span class="au-code__*"> opening/closing tags.
     * Any other HTML tag is escaped to prevent mXSS.
     * @param {string} highlightedHtml - Output from #highlight()
     * @returns {string} Sanitized highlighted HTML
     */
    /** @private */
    #sanitizeHighlighted(highlightedHtml) {
        // Allow only: <span class="au-code__..."> and </span>
        // Escape any other tags that could have been introduced by regex mutation
        return highlightedHtml.replace(/<(\/?)([^>]*)>/g, (match, slash, content) => {
            // Allow closing </span>
            if (slash === '/' && content.trim() === 'span') return match;
            // Allow opening <span class="au-code__...">
            if (!slash && /^span\s+class="au-code__[a-z]+"$/.test(content.trim())) return match;
            // Escape everything else
            return match.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        });
    }

    /** @private */
    #highlight(code, language) {
        // Shared marker helper to avoid regex self-matching
        // IMPORTANT: Uses Unicode Private Use Area characters + letters to avoid
        // collision with number regex which matches \b\d+\b
        const createHighlighter = () => {
            const markers = [];
            let markerIndex = 0;

            const addMarker = (content, className) => {
                // Create a truly unique marker that no highlighting regex can match:
                // Encode the index as a single Unicode PUA character (offset by 0xE100)
                // This way there are NO digits or word characters in the marker at all
                const idx = markerIndex++;
                const markerChar = String.fromCharCode(0xE100 + idx);
                const start = String.fromCharCode(0xE000);
                const end = String.fromCharCode(0xE001);
                const marker = start + markerChar + end;
                markers.push({ marker, content, className });
                return marker;
            };

            const resolveMarkers = (result) => {
                for (const { marker, content, className } of markers) {
                    result = result.replace(marker, `<span class="${className}">${content}</span>`);
                }
                return result;
            };

            return { addMarker, resolveMarkers };
        };

        // HTML highlighting
        if (language === 'html' || language === 'xml') {
            const { addMarker, resolveMarkers } = createHighlighter();
            let result = code;

            // HTML comments: <!-- ... -->
            result = result.replace(/(&lt;!--[\s\S]*?--&gt;)/g, (match) =>
                addMarker(match, 'au-code__comment'));

            // DOCTYPE
            result = result.replace(/(&lt;!DOCTYPE[^&]*&gt;)/gi, (match) =>
                addMarker(match, 'au-code__keyword'));

            // Strings (attribute values)
            result = result.replace(/("[^"]*")/g, (match) =>
                addMarker(match, 'au-code__string'));

            // Attributes (name= pattern)
            result = result.replace(/(\s)([\w-]+)(=)/g, (match, space, attr, eq) =>
                `${space}${addMarker(attr, 'au-code__attr')}${eq}`);

            // Tags
            result = result.replace(/(&lt;\/?)([\w-]+)/g, (match, bracket, tag) =>
                `${bracket}${addMarker(tag, 'au-code__tag')}`);

            return resolveMarkers(result);
        }

        // JavaScript highlighting
        if (language === 'javascript' || language === 'js' || language === 'typescript' || language === 'ts') {
            const { addMarker, resolveMarkers } = createHighlighter();
            let result = code;

            // Multi-line comments /* ... */
            result = result.replace(/(\/\*[\s\S]*?\*\/)/g, (match) =>
                addMarker(match, 'au-code__comment'));

            // Single-line comments
            result = result.replace(/(\/\/.*)/g, (match) =>
                addMarker(match, 'au-code__comment'));

            // Template literals (backticks)
            result = result.replace(/(`[^`]*`)/g, (match) =>
                addMarker(match, 'au-code__string'));

            // Strings
            result = result.replace(/('[^']*'|"[^"]*")/g, (match) =>
                addMarker(match, 'au-code__string'));

            // Numbers (including decimals and scientific notation)
            result = result.replace(/\b(\d+\.?\d*(?:e[+-]?\d+)?)\b/gi, (match) =>
                addMarker(match, 'au-code__number'));

            // Keywords (expanded list)
            result = result.replace(/\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|extends|import|export|from|default|async|await|new|this|super|typeof|instanceof|in|of|try|catch|finally|throw|yield|static|get|set)\b/g, (match) =>
                addMarker(match, 'au-code__keyword'));

            // Boolean/null/undefined
            result = result.replace(/\b(true|false|null|undefined|NaN|Infinity)\b/g, (match) =>
                addMarker(match, 'au-code__builtin'));

            // Function names (word followed by parenthesis)
            result = result.replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g, (match, name) =>
                addMarker(name, 'au-code__function'));

            return resolveMarkers(result);
        }

        // CSS highlighting
        if (language === 'css' || language === 'scss' || language === 'sass') {
            const { addMarker, resolveMarkers } = createHighlighter();
            let result = code;

            // Comments
            result = result.replace(/(\/\*[\s\S]*?\*\/)/g, (match) =>
                addMarker(match, 'au-code__comment'));

            // Strings
            result = result.replace(/('[^']*'|"[^"]*")/g, (match) =>
                addMarker(match, 'au-code__string'));

            // At-rules (@media, @keyframes, etc.)
            result = result.replace(/(@[\w-]+)/g, (match) =>
                addMarker(match, 'au-code__keyword'));

            // Property values with units
            result = result.replace(/\b(\d+\.?\d*)(px|em|rem|%|vh|vw|s|ms|deg|fr)\b/g, (match, num, unit) =>
                `${addMarker(num, 'au-code__number')}${addMarker(unit, 'au-code__builtin')}`);

            // Numbers without units
            result = result.replace(/\b(\d+\.?\d*)\b/g, (match) =>
                addMarker(match, 'au-code__number'));

            // Hex colors
            result = result.replace(/(#[0-9a-fA-F]{3,8})\b/g, (match) =>
                addMarker(match, 'au-code__string'));

            // CSS properties (word followed by colon)
            result = result.replace(/\b([\w-]+)\s*:/g, (match, prop) =>
                `${addMarker(prop, 'au-code__attr')}:`);

            // Selectors (. # or element at start of line or after comma/brace)
            result = result.replace(/(^|[{,\s])([.#]?[\w-]+)(?=\s*[{,])/gm, (match, before, selector) =>
                `${before}${addMarker(selector, 'au-code__tag')}`);

            return resolveMarkers(result);
        }

        // JSON highlighting
        if (language === 'json') {
            const { addMarker, resolveMarkers } = createHighlighter();
            let result = code;

            // Strings (keys will be handled separately)
            result = result.replace(/("[^"]*")\s*:/g, (match, key) =>
                `${addMarker(key, 'au-code__attr')}:`);

            // String values
            result = result.replace(/:\s*("[^"]*")/g, (match, val) =>
                `: ${addMarker(val, 'au-code__string')}`);

            // Numbers
            result = result.replace(/:\s*(-?\d+\.?\d*)/g, (match, num) =>
                `: ${addMarker(num, 'au-code__number')}`);

            // Booleans and null
            result = result.replace(/\b(true|false|null)\b/g, (match) =>
                addMarker(match, 'au-code__builtin'));

            return resolveMarkers(result);
        }

        // Shell/Bash highlighting
        if (language === 'bash' || language === 'sh' || language === 'shell') {
            const { addMarker, resolveMarkers } = createHighlighter();
            let result = code;

            // Comments
            result = result.replace(/(#.*)/g, (match) =>
                addMarker(match, 'au-code__comment'));

            // Strings
            result = result.replace(/('[^']*'|"[^"]*")/g, (match) =>
                addMarker(match, 'au-code__string'));

            // Variables $VAR and ${VAR}
            result = result.replace(/(\$\{?\w+\}?)/g, (match) =>
                addMarker(match, 'au-code__attr'));

            // Common commands
            result = result.replace(/\b(cd|ls|echo|cat|grep|find|sudo|npm|npx|bun|node|git|curl|wget|mkdir|rm|cp|mv|chmod|chown)\b/g, (match) =>
                addMarker(match, 'au-code__keyword'));

            // Flags
            result = result.replace(/(\s)(--?[\w-]+)/g, (match, space, flag) =>
                `${space}${addMarker(flag, 'au-code__builtin')}`);

            return resolveMarkers(result);
        }

        // No highlighting for unknown languages
        return code;
    }

    /**
     * Remove common leading whitespace from all lines.
     * @private
     */
    #dedent(code) {
        // Split into lines
        let lines = code.split('\n');

        // Remove leading empty lines
        while (lines.length > 0 && lines[0].trim() === '') {
            lines.shift();
        }
        // Remove trailing empty lines
        while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
            lines.pop();
        }

        if (lines.length === 0) return '';

        // Find minimum indent across ALL non-empty lines
        let minIndent = Infinity;
        for (const line of lines) {
            // Skip empty lines when calculating min indent
            if (line.trim() === '') continue;

            const match = line.match(/^(\s*)/);
            const indent = match ? match[1].length : 0;
            minIndent = Math.min(minIndent, indent);
        }

        // If no common indent found, return as-is
        if (minIndent === Infinity || minIndent === 0) {
            return lines.join('\n');
        }

        // Remove exactly minIndent spaces from start of each line
        return lines.map(line => {
            if (line.trim() === '') return ''; // Keep empty lines as empty
            return line.slice(minIndent);
        }).join('\n');
    }

    /**
     * Bracket-counting auto-indenter.
     * @private
     */
    #autoIndent(code, language) {
        const INDENT = '    '; // 4 spaces
        const lines = code.split('\n');
        const result = [];
        let indentLevel = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Skip empty lines
            if (line === '') {
                result.push('');
                continue;
            }

            // Calculate bracket changes for this line
            let openBrackets = 0;
            let closeBrackets = 0;

            if (language === 'html') {
                // HTML: count opening/closing tags
                // Opening: <tag> or <tag attr>
                // Closing: </tag> or self-closing />
                const openTags = (line.match(/<[a-zA-Z][^>]*(?<!\/)\s*>/g) || []).length;
                const closeTags = (line.match(/<\/[^>]+>/g) || []).length;
                const selfClosing = (line.match(/<[^>]+\/>/g) || []).length;
                openBrackets = openTags - selfClosing;
                closeBrackets = closeTags;
            } else {
                // JS/CSS/JSON: count { and }
                // Avoid counting brackets inside strings (basic heuristic)
                let inString = false;
                let stringChar = '';
                for (let j = 0; j < line.length; j++) {
                    const char = line[j];
                    const prev = j > 0 ? line[j - 1] : '';

                    if ((char === '"' || char === "'" || char === '`') && prev !== '\\') {
                        if (!inString) {
                            inString = true;
                            stringChar = char;
                        } else if (char === stringChar) {
                            inString = false;
                        }
                    }

                    if (!inString) {
                        if (char === '{' || char === '[' || char === '(') openBrackets++;
                        if (char === '}' || char === ']' || char === ')') closeBrackets++;
                    }
                }
            }

            // Determine if line starts with closing bracket (decrease indent BEFORE this line)
            const startsWithClose = language === 'html'
                ? line.startsWith('</')
                : /^[}\]\)]/.test(line);

            // Apply closing brackets that start the line BEFORE indenting
            if (startsWithClose && closeBrackets > 0) {
                indentLevel = Math.max(0, indentLevel - 1);
                closeBrackets--; // Already accounted for
            }

            // Add the indented line
            result.push(INDENT.repeat(indentLevel) + line);

            // Update indent level for next line
            // Net change: opens increase, closes decrease
            indentLevel = Math.max(0, indentLevel + openBrackets - closeBrackets);
        }

        return result.join('\n');
    }

    /** @private */
    #applyStyles() {
        this.style.display = 'block';
        this.style.background = 'var(--md-sys-color-surface-container-highest)';

        // Skip border-radius when embedded in au-example for seamless integration
        const isEmbedded = this.closest('au-example');
        if (isEmbedded) {
            // Only top corners flat to align with header, bottom stays rounded
            this.style.borderTopLeftRadius = '0';
            this.style.borderTopRightRadius = '0';
            this.style.borderBottomLeftRadius = 'var(--md-sys-shape-corner-medium)';
            this.style.borderBottomRightRadius = 'var(--md-sys-shape-corner-medium)';
        } else {
            this.style.borderRadius = 'var(--md-sys-shape-corner-medium)';
        }

        this.style.overflow = 'hidden';
        this.style.fontFamily = "'Fira Code', 'Consolas', monospace";
        this.style.fontSize = '13px';

        const header = this.querySelector('.au-code__header');
        if (header) {
            header.style.display = 'flex';
            header.style.justifyContent = 'space-between';
            header.style.alignItems = 'center';
            header.style.padding = '8px 16px';
            header.style.background = 'var(--md-sys-color-surface-container)';
            header.style.borderBottom = '1px solid var(--md-sys-color-outline-variant)';
        }

        const lang = this.querySelector('.au-code__language');
        if (lang) {
            lang.style.fontSize = '11px';
            lang.style.fontWeight = '600';
            lang.style.color = 'var(--md-sys-color-primary)';
            lang.style.letterSpacing = '0.5px';
        }

        const copyBtn = this.querySelector('.au-code__copy');
        if (copyBtn) {
            copyBtn.style.background = 'transparent';
            copyBtn.style.border = 'none';
            copyBtn.style.cursor = 'pointer';
            copyBtn.style.color = 'var(--md-sys-color-on-surface-variant)';
            copyBtn.style.padding = '4px';
            copyBtn.style.borderRadius = '4px';
            copyBtn.style.display = 'flex';
            copyBtn.style.transition = 'all 0.2s ease';
        }

        const pre = this.querySelector('.au-code__pre');
        if (pre) {
            pre.style.margin = '0';
            pre.style.padding = '16px';
            pre.style.overflow = 'auto';
            pre.style.maxHeight = '400px';
        }

        const content = this.querySelector('.au-code__content');
        if (content) {
            content.style.color = 'var(--md-sys-color-on-surface)';
        }

        // P2.1 perf fix: inject syntax highlighting styles once (not per render)
        if (!AuCode._stylesInjected) {
            AuCode._stylesInjected = true;
            const style = document.createElement('style');
            style.id = 'au-code-styles';
            style.textContent = `
            .au-code__tag { color: var(--md-sys-color-primary); }
            .au-code__attr { color: var(--md-sys-color-tertiary); }
            .au-code__string { color: var(--md-sys-color-secondary); }
            .au-code__keyword { color: var(--md-sys-color-primary); font-weight: 500; }
            .au-code__comment { color: var(--md-sys-color-outline); font-style: italic; }
            .au-code__number { color: var(--md-sys-color-error); }
            .au-code__function { color: var(--md-sys-color-tertiary); }
            .au-code__builtin { color: var(--md-sys-color-primary); font-weight: 500; }
            .au-code__copy:hover { 
                background: var(--md-sys-color-primary-container) !important;
                color: var(--md-sys-color-on-primary-container) !important;
            }
            .au-code__copy:active {
                background: var(--md-sys-color-primary) !important;
                color: var(--md-sys-color-on-primary) !important;
                transform: scale(0.95);
            }
            .au-code__copy.copied {
                background: #c8e6c9 !important;
                color: #1b5e20 !important;
            }
        `;
            document.head.appendChild(style);
        }
    }

    /** @private */
    #setupCopyButton(originalCode) {
        const btn = this.querySelector('.au-code__copy');
        if (btn) {
            this.listen(btn, 'click', async () => {
                try {
                    await navigator.clipboard.writeText(originalCode.trim());
                    // Add copied class for visual feedback
                    btn.classList.add('copied');
                    btn.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    `;
                    this.setTimeout(() => {
                        btn.classList.remove('copied');
                        btn.innerHTML = `
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                            </svg>
                        `;
                    }, 2000);
                } catch (e) {
                    console.error('Copy failed:', e);
                }
            });
        }
    }
}

define('au-code', AuCode);
