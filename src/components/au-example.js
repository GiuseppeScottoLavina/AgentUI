/**
 * @fileoverview au-example - Interactive Example Card Component
 * 
 * Usage:
 * <au-example title="Basic checkbox">
 *   <div slot="demo">
 *     <au-checkbox checked>Example</au-checkbox>
 *   </div>
 *   <div slot="code">
 *     <au-checkbox checked>Example</au-checkbox>
 *   </div>
 * </au-example>
 */

import { AuElement, define } from '../core/AuElement.js';
import { html, safe, escapeHTML } from '../core/utils.js';

/**
 * Interactive example card that displays a live demo alongside its source code.
 * Extracts content from `demo` and `code` slots, renders a toggle-able view.
 *
 * @class
 * @extends AuElement
 * @element au-example
 * @slot demo - Live component demonstration area.
 * @slot code - HTML source code to display (falls back to demo innerHTML).
 */
export class AuExample extends AuElement {
    static baseClass = 'au-example';
    static observedAttributes = ['title'];


    /** @private Whether the code panel is currently visible. */
    #showCode = false;

    /** @override */
    render() {
        const title = this.attr('title', 'Example');
        const demoSlot = this.querySelector('[slot="demo"]');
        const codeSlot = this.querySelector('[slot="code"]');

        // Extract content BEFORE modifying DOM
        const demoContent = demoSlot ? demoSlot.innerHTML : '';
        // For code, use textContent to get the decoded text (handles pre-escaped content)
        // If there's a code slot, use it; otherwise use the demo slot's outerHTML
        const codeContent = codeSlot
            ? codeSlot.textContent
            : (demoSlot ? demoSlot.innerHTML : '');

        // Remove original slots to prevent duplicate event handlers
        // The slots contain interactive elements (buttons with onclick) that would overlap
        if (demoSlot) demoSlot.remove();
        if (codeSlot) codeSlot.remove();

        // CRITICAL: Pre-escape and prettify code content BEFORE creating au-code element
        // This ensures au-code has content when connectedCallback runs (which triggers render)
        const normalizedCode = this.#prettifyHTML(codeContent);
        const escapedCode = escapeHTML(normalizedCode);

        this.innerHTML = html`
            <div class="au-example__card">
                <div class="au-example__header">
                    <span class="au-example__title">${title}</span>
                    <div class="au-example__actions">
                        <button class="au-example__btn" data-action="link" title="Copy link">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                            </svg>
                        </button>
                        <button class="au-example__btn" data-action="code" title="View source">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="16 18 22 12 16 6"/>
                                <polyline points="8 6 2 12 8 18"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="au-example__demo">
                    ${safe(demoContent)}
                </div>
                <div class="au-example__code" style="display: none;">
                    <au-code language="html">${safe(escapedCode)}</au-code>
                </div>
            </div>
        `;

        this.#applyStyles();
        // Event delegation handled by AuElement.#setupEventDelegation()
        // See handleAction() method below
    }


    // escapeHTML used here for code display (entity-encoding < > & for code blocks), not XSS

    /**
     * Pretty-prints HTML with proper indentation
     * Lightweight implementation, no dependencies
     * @param {string} html - The HTML string to format
     * @returns {string} - Formatted HTML with proper indentation
     */
    #prettifyHTML(html) {
        // Self-closing tags that don't need closing
        const selfClosing = new Set([
            'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
            'link', 'meta', 'param', 'source', 'track', 'wbr'
        ]);

        // Inline tags that shouldn't break to new line
        const inline = new Set([
            'a', 'abbr', 'b', 'bdo', 'br', 'cite', 'code', 'dfn', 'em',
            'i', 'kbd', 'q', 's', 'samp', 'small', 'span', 'strong',
            'sub', 'sup', 'u', 'var'
        ]);

        let result = '';
        let indent = 0;
        const indentStr = '    '; // 4 spaces

        // Normalize: remove existing whitespace between tags
        const normalized = html
            .replace(/>\s+</g, '><')
            .replace(/\s+/g, ' ')
            .trim();

        // Split by tags while keeping tags in result
        const tokens = normalized.split(/(<[^>]+>)/g).filter(t => t.trim());

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i].trim();
            if (!token) continue;

            const isTag = token.startsWith('<');
            const isClosing = token.startsWith('</');
            const isSelfClosing = token.endsWith('/>') ||
                (isTag && selfClosing.has(token.match(/<\/?(\w+)/)?.[1]?.toLowerCase()));

            if (isClosing) {
                indent = Math.max(0, indent - 1);
            }

            // Get tag name if it's a tag
            const tagName = isTag ? token.match(/<\/?(\w+)/)?.[1]?.toLowerCase() : null;
            const isInline = tagName && inline.has(tagName);

            // Add content
            if (isTag) {
                if (!isInline || isClosing) {
                    if (result && !result.endsWith('\n')) {
                        result += '\n';
                    }
                    result += indentStr.repeat(indent) + token;
                } else {
                    result += token;
                }
            } else {
                // Text content - add inline
                result += token;
            }

            // Increase indent after opening tag (not self-closing, not inline)
            if (isTag && !isClosing && !isSelfClosing && !isInline) {
                indent++;
            }
        }

        return result.trim();
    }

    /**
     * Apply Material Design 3 inline styles to the example card structure.
     * @private
     */
    #applyStyles() {
        this.style.display = 'block';
        this.style.marginBottom = '24px';

        const card = this.querySelector('.au-example__card');
        if (card) {
            card.style.background = 'var(--md-sys-color-surface)';
            card.style.border = '1px solid var(--md-sys-color-outline-variant)';
            card.style.borderRadius = 'var(--md-sys-shape-corner-large)';
            // Note: Do NOT use overflow:hidden - it clips the code block
        }

        const header = this.querySelector('.au-example__header');
        if (header) {
            header.style.display = 'flex';
            header.style.justifyContent = 'space-between';
            header.style.alignItems = 'center';
            header.style.padding = '12px 16px';
            header.style.borderBottom = '1px solid var(--md-sys-color-outline-variant)';
            header.style.background = 'var(--md-sys-color-surface-container-low)';
            header.style.borderRadius = 'var(--md-sys-shape-corner-large) var(--md-sys-shape-corner-large) 0 0';
        }

        const title = this.querySelector('.au-example__title');
        if (title) {
            title.style.fontWeight = '500';
            title.style.fontSize = 'var(--md-sys-typescale-title-small-size)';
            title.style.color = 'var(--md-sys-color-on-surface)';
            // 2026: Proper text overflow handling
            // min-width: 0 is CRITICAL for flexbox children to allow shrinking below content size
            title.style.minWidth = '0';
            title.style.overflow = 'hidden';
            title.style.textOverflow = 'ellipsis';
            title.style.whiteSpace = 'nowrap';
        }

        const actions = this.querySelector('.au-example__actions');
        if (actions) {
            actions.style.display = 'flex';
            actions.style.gap = '4px';
        }

        const btns = this.querySelectorAll('.au-example__btn');
        btns.forEach(btn => {
            btn.style.background = 'transparent';
            btn.style.border = 'none';
            btn.style.cursor = 'pointer';
            btn.style.padding = '8px';
            btn.style.borderRadius = '50%';
            btn.style.color = 'var(--md-sys-color-on-surface-variant)';
            btn.style.display = 'flex';
            btn.style.alignItems = 'center';
            btn.style.justifyContent = 'center';
            btn.style.transition = 'all 0.2s ease';
        });

        const demo = this.querySelector('.au-example__demo');
        if (demo) {
            // 2026: Proper containment - demo area MUST contain its content
            demo.style.boxSizing = 'border-box';
            demo.style.width = '100%';
            demo.style.maxWidth = '100%';
            demo.style.padding = '24px';
            // Flexbox with wrap for responsive layout
            demo.style.display = 'flex';
            demo.style.flexWrap = 'wrap';
            demo.style.gap = '16px';
            demo.style.alignItems = 'center';
            demo.style.justifyContent = 'flex-start';
            // No overflow clipping - content wraps naturally

            // Force interactive children to wrap properly instead of shrinking
            // IMPORTANT: Layout containers (au-stack, au-grid) must NOT have flex-shrink: 0
            // They need to shrink to contain their children properly
            const layoutContainers = new Set(['AU-STACK', 'AU-GRID', 'AU-LAYOUT']);
            Array.from(demo.children).forEach(child => {
                if (!layoutContainers.has(child.tagName)) {
                    child.style.flexShrink = '0';
                }
            });
        }

        const codeBlock = this.querySelector('.au-example__code');
        if (codeBlock) {
            codeBlock.style.borderTop = '1px solid var(--md-sys-color-outline-variant)';
        }

        // Style the au-code element for seamless integration
        const muCode = this.querySelector('.au-example__code au-code');
        if (muCode) {
            // Only zero TOP corners - bottom corners should stay rounded (set by au-code itself)
            muCode.style.borderTopLeftRadius = '0';
            muCode.style.borderTopRightRadius = '0';
            muCode.style.maxHeight = '400px';
            muCode.style.overflow = 'auto';

            // Also remove border-radius from the au-code header (HTML badge area)
            const muCodeHeader = muCode.querySelector('.au-code__header');
            if (muCodeHeader) {
                muCodeHeader.style.borderRadius = '0';
            }
        }

        // Add hover styles
        const style = document.createElement('style');
        style.textContent = `
            .au-example__btn:hover {
                background: var(--md-sys-color-surface-container-high) !important;
                color: var(--md-sys-color-primary) !important;
            }
            .au-example__btn.active {
                background: var(--md-sys-color-primary-container) !important;
                color: var(--md-sys-color-on-primary-container) !important;
            }
        `;
        if (!document.querySelector('#au-example-styles')) {
            style.id = 'au-example-styles';
            document.head.appendChild(style);
        }
    }

    /**
     * 2026: Handle delegated actions from AuElement.
     * Called automatically by base class event delegation.
     */
    handleAction(action, target, event) {
        if (action === 'code') {
            const codeBlock = this.querySelector('.au-example__code');
            if (codeBlock) {
                this.#showCode = !this.#showCode;
                codeBlock.style.display = this.#showCode ? 'block' : 'none';
                target.classList.toggle('active', this.#showCode);

                // Scroll code block into view when shown
                if (this.#showCode) {
                    // Double rAF ensures layout is complete before measuring
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            // Find the scrollable container (.au-layout-main in demo)
                            const scrollContainer = this.closest('.au-layout-main') ||
                                document.querySelector('.au-layout-main') ||
                                document.documentElement;

                            const codeRect = codeBlock.getBoundingClientRect();
                            const containerRect = scrollContainer.getBoundingClientRect?.() ||
                                { top: 0, bottom: window.innerHeight };

                            // Only scroll if code block is below viewport
                            if (codeRect.bottom > containerRect.bottom) {
                                const scrollOffset = codeRect.bottom - containerRect.bottom + 20;
                                scrollContainer.scrollBy({
                                    top: scrollOffset,
                                    behavior: 'smooth'
                                });
                            }
                        });
                    });
                }
            }
        } else if (action === 'link') {
            this.#copyLink(target);
        }
    }

    /**
     * Copy the current page URL to the clipboard.
     * @private
     * @param {HTMLElement} btn - The button element that triggered the copy.
     */
    async #copyLink(btn) {
        const url = window.location.href;
        try {
            await navigator.clipboard.writeText(url);
            btn.style.color = 'var(--md-sys-color-primary)';
            this.setTimeout(() => {
                btn.style.color = '';
            }, 2000);
        } catch (e) {
            console.error('Copy failed:', e);
        }
    }
}

define('au-example', AuExample);
