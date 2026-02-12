/**
 * au-prompt-ui.js - AI Agent Prompt UI Components
 * 
 * Specialized components for AI agent interfaces:
 * - au-prompt-input: Enhanced text input with submit button and loading states
 * - au-code-block: Syntax-highlighted code display with copy button
 * - au-agent-toolbar: Action buttons for AI responses (copy, regenerate, etc.)
 * - au-message-bubble: Chat message bubbles with role-based styling
 * 
 * @example
 * <au-prompt-input placeholder="Ask anything..." loading></au-prompt-input>
 * 
 * <au-message-bubble role="user">
 *   How do I sort an array?
 * </au-message-bubble>
 * 
 * <au-message-bubble role="assistant">
 *   Here's how to sort an array:
 *   <au-code-block language="javascript">
 *     const sorted = array.sort((a, b) => a - b);
 *   </au-code-block>
 *   <au-agent-toolbar></au-agent-toolbar>
 * </au-message-bubble>
 */

import { AuElement, define } from '../core/AuElement.js';
import { escapeHTML } from '../core/utils.js';

// ============================================
// AU-PROMPT-INPUT
// ============================================
export class AuPromptInput extends AuElement {
    static get observedAttributes() {
        return ['placeholder', 'loading', 'disabled', 'multiline'];
    }

    static baseClass = 'au-prompt-input';
    static cssFile = 'prompt-ui';


    constructor() {
        super();
        this._value = '';
    }

    get placeholder() {
        return this.getAttribute('placeholder') || 'Type a message...';
    }

    get loading() {
        return this.hasAttribute('loading');
    }

    set loading(val) {
        if (val) this.setAttribute('loading', '');
        else this.removeAttribute('loading');
    }

    get disabled() {
        return this.hasAttribute('disabled');
    }

    get multiline() {
        return this.hasAttribute('multiline');
    }

    get value() {
        return this._value;
    }

    set value(val) {
        this._value = val;
        const input = this.querySelector('.au-prompt-input-field');
        if (input) input.value = val;
    }

    connectedCallback() {
        super.connectedCallback();
        this.render();
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (this.isConnected && oldVal !== newVal) {
            this.render();
        }
    }

    _submit() {
        if (this.loading || this.disabled || !this._value.trim()) return;

        this.dispatchEvent(new CustomEvent('au-submit', {
            bubbles: true,
            detail: { value: this._value.trim() }
        }));
    }

    _handleKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey && !this.multiline) {
            e.preventDefault();
            this._submit();
        } else if (e.key === 'Enter' && e.metaKey) {
            e.preventDefault();
            this._submit();
        }
    }

    render() {
        const isTextarea = this.multiline;
        const safePlaceholder = escapeHTML(this.placeholder);

        this.innerHTML = `
            <div class="au-prompt-input-container ${this.loading ? 'au-prompt-input-loading' : ''}">
                ${isTextarea
                ? `<textarea class="au-prompt-input-field" placeholder="${safePlaceholder}" ${this.disabled ? 'disabled' : ''}></textarea>`
                : `<input class="au-prompt-input-field" type="text" placeholder="${safePlaceholder}" ${this.disabled ? 'disabled' : ''} />`
            }
                <button class="au-prompt-input-submit" ${this.disabled || this.loading ? 'disabled' : ''}>
                    ${this.loading
                ? '<div class="au-prompt-input-spinner"></div>'
                : '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>'
            }
                </button>
            </div>
        `;

        const input = this.querySelector('.au-prompt-input-field');
        const submitBtn = this.querySelector('.au-prompt-input-submit');

        input.value = this._value;
        this.listen(input, 'input', (e) => {
            this._value = e.target.value;
            this.dispatchEvent(new CustomEvent('au-input', {
                bubbles: true,
                detail: { value: this._value }
            }));
        });
        this.listen(input, 'keydown', (e) => this._handleKeydown(e));
        this.listen(submitBtn, 'click', () => this._submit());
    }
}

// ============================================
// AU-CODE-BLOCK
// ============================================
export class AuCodeBlock extends AuElement {
    static get observedAttributes() {
        return ['language', 'filename'];
    }

    static baseClass = 'au-code-block';

    constructor() {
        super();
    }

    get language() {
        return this.getAttribute('language') || 'text';
    }

    get filename() {
        return this.getAttribute('filename');
    }

    connectedCallback() {
        super.connectedCallback();
        this.render();
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (this.isConnected && oldVal !== newVal) {
            this.render();
        }
    }

    async _copy() {
        const code = this.textContent.trim();
        try {
            await navigator.clipboard.writeText(code);
            const btn = this.querySelector('.au-code-block-copy-btn');
            btn.textContent = '✓ Copied';
            this.setTimeout(() => {
                btn.textContent = 'Copy';
            }, 2000);
        } catch (e) {
            console.error('Failed to copy:', e);
        }
    }

    render() {
        const code = this.textContent.trim();

        this.innerHTML = `
            <div class="au-code-block-container">
                <div class="au-code-block-header">
                    ${this.filename
                ? `<span class="au-code-block-filename">${this.filename}</span>`
                : `<span class="au-code-block-language">${this.language}</span>`
            }
                    <button class="au-code-block-copy-btn">Copy</button>
                </div>
                <pre class="au-code-block-pre"><code>${escapeHTML(code)}</code></pre>
            </div>
        `;

        this.listen(this.querySelector('.au-code-block-copy-btn'), 'click', () => this._copy());
    }

    // Using centralized escapeHTML from core/utils.js for XSS safety
}

// ============================================
// AU-AGENT-TOOLBAR
// ============================================
export class AuAgentToolbar extends AuElement {
    static get observedAttributes() {
        return ['actions'];
    }

    static baseClass = 'au-agent-toolbar';

    constructor() {
        super();
    }

    get actions() {
        const attr = this.getAttribute('actions');
        return attr ? attr.split(',').map(a => a.trim()) : ['copy', 'regenerate', 'thumbsUp', 'thumbsDown'];
    }

    connectedCallback() {
        super.connectedCallback();
        this.render();
    }



    render() {
        const actionButtons = {
            copy: { icon: '📋', label: 'Copy' },
            regenerate: { icon: '🔄', label: 'Regenerate' },
            thumbsUp: { icon: '👍', label: 'Good response' },
            thumbsDown: { icon: '👎', label: 'Poor response' },
            edit: { icon: '✏️', label: 'Edit' },
            share: { icon: '↗️', label: 'Share' }
        };

        const buttons = this.actions
            .filter(a => actionButtons[a])
            .map(a => `
                <button class="au-agent-toolbar-btn" data-action="${a}" title="${actionButtons[a].label}">
                    ${actionButtons[a].icon}
                </button>
            `).join('');

        this.innerHTML = buttons;
    }

    /**
     * Handle actions from AuElement's centralized event delegation
     */
    handleAction(action, target, event) {
        this.dispatchEvent(new CustomEvent('au-action', {
            bubbles: true,
            detail: { action }
        }));
    }
}

// ============================================
// AU-MESSAGE-BUBBLE
// ============================================
export class AuMessageBubble extends AuElement {
    static get observedAttributes() {
        return ['role', 'avatar', 'name', 'timestamp'];
    }

    static baseClass = 'au-message-bubble';

    constructor() {
        super();
        this._originalContent = null;
    }

    get role() {
        return this.getAttribute('role') || 'user';
    }

    get avatar() {
        return this.getAttribute('avatar');
    }

    get name() {
        return this.getAttribute('name') || (this.role === 'user' ? 'You' : 'Assistant');
    }

    get timestamp() {
        return this.getAttribute('timestamp');
    }

    connectedCallback() {
        super.connectedCallback();
        // Capture original children before render
        if (!this._originalContent) {
            this._originalContent = Array.from(this.childNodes);
        }
        this.render();
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (this.isConnected && oldVal !== newVal) {
            this.render();
        }
    }

    render() {
        const isUser = this.role === 'user';
        const defaultAvatar = isUser ? '👤' : '🤖';
        const roleClass = isUser ? 'au-message-bubble-user' : 'au-message-bubble-assistant';

        // Create structure
        const message = document.createElement('div');
        message.className = `au-message-bubble-message ${roleClass}`;

        // Avatar
        const avatar = document.createElement('div');
        avatar.className = `au-message-bubble-avatar ${roleClass}`;
        if (this.avatar) {
            const img = document.createElement('img');
            img.src = this.avatar;
            img.alt = this.name;
            avatar.appendChild(img);
        } else {
            avatar.textContent = defaultAvatar;
        }
        message.appendChild(avatar);

        // Content wrapper
        const content = document.createElement('div');
        content.className = 'au-message-bubble-content';

        // Header
        const header = document.createElement('div');
        header.className = `au-message-bubble-header ${roleClass}`;
        const nameSpan = document.createElement('span');
        nameSpan.className = 'au-message-bubble-name';
        nameSpan.textContent = this.name;
        header.appendChild(nameSpan);
        if (this.timestamp) {
            const timestampSpan = document.createElement('span');
            timestampSpan.className = 'au-message-bubble-timestamp';
            timestampSpan.textContent = this.timestamp;
            header.appendChild(timestampSpan);
        }
        content.appendChild(header);

        // Bubble with original content
        const bubble = document.createElement('div');
        bubble.className = `au-message-bubble-bubble ${roleClass}`;
        if (this._originalContent) {
            this._originalContent.forEach(child => bubble.appendChild(child.cloneNode(true)));
        }
        content.appendChild(bubble);

        message.appendChild(content);

        // Set HTML
        this.innerHTML = '';
        this.appendChild(message);
    }
}

// Register all components
if (!customElements.get('au-prompt-input')) {
    customElements.define('au-prompt-input', AuPromptInput);
}
if (!customElements.get('au-code-block')) {
    customElements.define('au-code-block', AuCodeBlock);
}
if (!customElements.get('au-agent-toolbar')) {
    customElements.define('au-agent-toolbar', AuAgentToolbar);
}
if (!customElements.get('au-message-bubble')) {
    customElements.define('au-message-bubble', AuMessageBubble);
}
