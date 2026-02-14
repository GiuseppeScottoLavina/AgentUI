/**
 * @fileoverview au-textarea - Multi-line Text Input Component
 * 
 * Usage: <au-textarea placeholder="Enter description" rows="4"></au-textarea>
 */

import { AuElement, define } from '../core/AuElement.js';
import { html } from '../core/utils.js';

export class AuTextarea extends AuElement {
    static baseClass = 'au-textarea';
    static cssFile = 'input';
    static observedAttributes = ['placeholder', 'rows', 'disabled', 'readonly', 'name'];

    #textarea = null;

    render() {
        // Idempotent HTML structure creation
        if (!this.querySelector('.au-textarea__field')) {
            const placeholder = this.attr('placeholder', '');
            const rows = this.attr('rows', '4');
            const disabled = this.has('disabled') ? 'disabled' : '';
            const readonly = this.has('readonly') ? 'readonly' : '';
            const name = this.attr('name', '');

            this.innerHTML = html`
                <textarea 
                    class="au-textarea__field"
                    placeholder="${placeholder}"
                    aria-label="${placeholder || 'Text area'}"
                    rows="${rows}"
                    name="${name}"
                    ${disabled}
                    ${readonly}
                ></textarea>
            `;

            // Styles (only apply once when creating)
            this.style.display = 'block';
            this.style.position = 'relative';
        }

        // Always get reference (for both new and pre-rendered cases)
        this.#textarea = this.querySelector('textarea');

        // Apply styles to native textarea
        this.#textarea.style.width = '100%';
        this.#textarea.style.padding = '12px 16px';
        this.#textarea.style.fontSize = 'var(--md-sys-typescale-body-large-size, 16px)';
        this.#textarea.style.fontFamily = 'inherit';
        this.#textarea.style.border = '1px solid var(--md-sys-color-outline)';
        this.#textarea.style.borderRadius = 'var(--md-sys-shape-corner-small, 4px)';
        this.#textarea.style.background = 'var(--md-sys-color-surface-container-highest, var(--md-sys-color-surface))';
        this.#textarea.style.color = 'var(--md-sys-color-on-surface)';
        this.#textarea.style.resize = 'vertical';
        this.#textarea.style.transition = 'border-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard)';
        this.#textarea.style.outline = 'none';
        this.#textarea.style.boxSizing = 'border-box';

        // Focus styles - use box-shadow to avoid layout shift (no border-width change)
        this.listen(this.#textarea, 'focus', () => {
            this.#textarea.style.borderColor = 'var(--md-sys-color-primary)';
            this.#textarea.style.boxShadow = 'inset 0 0 0 1px var(--md-sys-color-primary)';
        });

        this.listen(this.#textarea, 'blur', () => {
            this.#textarea.style.borderColor = 'var(--md-sys-color-outline)';
            this.#textarea.style.boxShadow = 'none';
        });

        // Forward events (always attach - AbortController prevents duplicates)
        this.listen(this.#textarea, 'input', (e) => {
            this.emit('au-input', { value: e.target.value });
        });

        this.listen(this.#textarea, 'change', (e) => {
            this.emit('au-change', { value: e.target.value });
        });
    }

    get value() {
        return this.#textarea?.value || '';
    }

    set value(v) {
        if (this.#textarea) {
            this.#textarea.value = v;
        }
    }

    focus() {
        this.#textarea?.focus();
    }
}

define('au-textarea', AuTextarea);
