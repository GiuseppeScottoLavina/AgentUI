/**
 * @fileoverview au-input - MD3 Text Field Component
 * 
 * Usage: <au-input type="text" placeholder="Enter text" variant="filled"></au-input>
 * 
 * Features:
 * - Native focus handling via CSS :focus-within
 * - Animated underline indicator
 * - Supports all input types
 */

import { AuElement, define } from '../core/AuElement.js';
import { html, safe, escapeHTML } from '../core/utils.js';

// Input types that always show a native browser placeholder (dd/mm/yyyy, --:--:-- etc.)
const ALWAYS_FLOAT_TYPES = ['date', 'time', 'datetime-local', 'month', 'week'];

export class AuInput extends AuElement {
    static baseClass = 'au-input';
    static cssFile = 'input';
    static observedAttributes = ['type', 'placeholder', 'value', 'disabled', 'variant', 'size', 'label'];

    /**
     * Self-documenting component for AI agents
     */

    /** @type {HTMLInputElement|null} */
    #input = null;

    render() {
        // Idempotent: if already rendered, just update references and listeners
        if (this.querySelector('.au-input__field')) {
            this.#input = this.querySelector('input');
            this.#updateClasses();
            this.#updateValueState();
            this.#setupListeners();  // Always re-attach listeners (AbortController clears on disconnect)
            return;
        }

        const type = this.attr('type', 'text');
        const placeholder = this.attr('placeholder', '');
        const label = this.attr('label', '');
        const value = this.attr('value', '');

        // Use label for floating label, fallback to placeholder
        const labelText = label || placeholder;

        // Never show native placeholder when using floating label
        // Only show if explicitly no label is provided AND no placeholder
        const showNativePlaceholder = !labelText;

        // AGENT VALIDATION: Input must have a label
        if (!labelText && !this.getAttribute('aria-label')) {
            this.logError('A11Y_MISSING_LABEL', 'Input must have a label or aria-label attribute.');
        }

        // Generate unique ID for label-input association (accessibility)
        const inputId = this.id ? `${this.id}__field` : `au-input-${Math.random().toString(36).substring(2, 9)}`;


        this.innerHTML = html`
            ${labelText ? html`<label class="au-input__label" for="${inputId}">${labelText}</label>` : ''}
            <input 
                class="au-input__field"
                id="${inputId}"
                type="${type}"
                ${showNativePlaceholder ? safe(`placeholder="${escapeHTML(placeholder)}"`) : ''}
                ${!labelText ? safe(`aria-label="${escapeHTML(placeholder || 'Text input')}"`) : ''}
                value="${value}"
                ${this.has('disabled') ? 'disabled' : ''}
            />
        `;

        this.#input = this.querySelector('input');
        this.#updateClasses();
        this.#updateValueState();
        this.#setupListeners();
    }

    #setupListeners() {
        if (!this.#input) return;

        // Forward events
        this.listen(this.#input, 'input', (e) => {
            this.#updateValueState();
            this.emit('au-input', { value: e.target.value });
        });

        this.listen(this.#input, 'focus', () => {
            this.emit('au-focus');
        });

        this.listen(this.#input, 'blur', () => {
            this.#updateValueState();
            this.emit('au-blur');
        });
    }

    #updateValueState() {
        const type = this.attr('type', 'text');
        if (ALWAYS_FLOAT_TYPES.includes(type) || this.#input?.value) {
            this.classList.add('has-value');
        } else {
            this.classList.remove('has-value');
        }
    }

    update(attr, newValue, oldValue) {
        if (!this.#input) return;

        switch (attr) {
            case 'value':
                this.#input.value = newValue ?? '';
                this.#updateValueState();
                break;
            case 'placeholder':
                this.#input.placeholder = newValue ?? '';
                break;
            case 'type':
                this.#input.type = newValue ?? 'text';
                this.#updateValueState();
                break;
            case 'disabled':
                this.#input.disabled = this.has('disabled');
                break;
        }

        this.#updateClasses();
    }

    #updateClasses() {
        const variant = this.attr('variant', 'outlined');
        const size = this.attr('size', 'md');

        // Preserve custom classes while updating component classes
        const baseClasses = ['au-input', `au-input--${variant}`, `au-input--${size}`];
        baseClasses.forEach(cls => this.classList.add(cls));

        // Remove old variant/size classes
        Array.from(this.classList).forEach(cls => {
            if (cls.startsWith('au-input--') && !baseClasses.includes(cls)) {
                this.classList.remove(cls);
            }
        });

        if (this.has('disabled')) {
            this.classList.add('is-disabled');
        } else {
            this.classList.remove('is-disabled');
        }
    }

    // Expose input value
    get value() {
        return this.#input?.value ?? '';
    }

    set value(v) {
        if (this.#input) {
            this.#input.value = v;
            this.#updateValueState();
        }
    }

    focus() {
        this.#input?.focus();
    }

    clear() {
        this.value = '';
    }
}

define('au-input', AuInput);
