/**
 * @fileoverview au-radio - Radio Button Group Component
 * 
 * Usage:
 * <au-radio-group name="size" value="md">
 *   <au-radio value="sm">Small</au-radio>
 *   <au-radio value="md">Medium</au-radio>
 *   <au-radio value="lg">Large</au-radio>
 * </au-radio-group>
 */

import { AuElement, define } from '../core/AuElement.js';
import { html } from '../core/utils.js';
import { createRipple } from '../core/ripple.js';

/**
 * MD3 Radio Button Group managing exclusive selection.
 *
 * @class
 * @extends AuElement
 * @element au-radio-group
 * @fires au-change - When value changes, detail: `{ value, source }`
 * @slot default - `<au-radio>` children
 */
export class AuRadioGroup extends AuElement {
    static baseClass = 'au-radio-group';
    static cssFile = 'radio';
    /** @type {string[]} */
    static observedAttributes = ['name', 'value'];

    /** @override */
    connectedCallback() {
        super.connectedCallback();
        // Accessibility: set role
        this.setAttribute('role', 'radiogroup');

        // Guard: defer click activation to prevent re-render loops.
        this._initializing = true;
        queueMicrotask(() => { this._initializing = false; });

        // Ripple effect on pointerdown
        this.listen(this, 'pointerdown', (e) => {
            let radio = e.target;
            while (radio && radio.tagName !== 'AU-RADIO') {
                radio = radio.parentElement;
            }
            if (radio && !radio.hasAttribute('disabled')) {
                createRipple(radio, e);
            }
        });

        this.listen(this, 'click', (e) => {
            if (this._initializing) return;

            // Find the clicked radio - could be nested span
            let radio = e.target;
            while (radio && radio.tagName !== 'AU-RADIO') {
                radio = radio.parentElement;
            }

            if (radio && !radio.hasAttribute('disabled')) {
                this.select(radio.getAttribute('value'));
            }
        });
    }

    /** @override */
    render() {
        this.style.display = 'flex';
        this.style.flexDirection = 'column';
        this.style.gap = '8px';

        // Defer selection update to ensure children are fully upgraded
        // Use setTimeout(0) instead of queueMicrotask - microtasks run before
        // custom element upgrades, setTimeout runs after
        this.setTimeout(() => this.#updateSelection(), 0);
    }

    /** @override */
    update(attr, newValue, oldValue) {
        if (attr === 'value') {
            this.#updateSelection();
        }
    }

    /** @private */
    #updateSelection() {
        const currentValue = this.attr('value', '');
        this.querySelectorAll('au-radio').forEach(radio => {
            const isSelected = radio.attr('value') === currentValue;
            if (isSelected) {
                radio.setAttribute('checked', '');
            } else {
                radio.removeAttribute('checked');
            }
        });
    }

    /**
     * Select a value and emit change.
     * @param {string} value
     */
    select(value) {
        this.setAttribute('value', value);
        this.emit('au-change', { value, source: 'user' });
    }

    get value() {
        return this.attr('value', '');
    }

    set value(v) {
        this.setAttribute('value', v);
    }
}

/**
 * Individual radio button within an `<au-radio-group>`.
 *
 * @class
 * @extends AuElement
 * @element au-radio
 */
export class AuRadio extends AuElement {
    static baseClass = 'au-radio';
    /** @type {string[]} */
    static observedAttributes = ['value', 'checked', 'disabled', 'label'];

    #labelText = '';
    #rendered = false;

    /** @override */
    connectedCallback() {
        super.connectedCallback();
        // Accessibility: set role and keyboard navigation
        this.setAttribute('role', 'radio');
        this.setupActivation(() => {
            const group = this.closest('au-radio-group');
            if (group) group.select(this.getAttribute('value'));
        });
    }

    /** @override */
    render() {
        // Read label only once to avoid losing it after innerHTML
        if (!this.#rendered) {
            this.#labelText = this.attr('label', '') || this.textContent.trim();
            this.#rendered = true;
        }

        this.innerHTML = html`
            <span class="au-radio__circle">
                <span class="au-radio__dot"></span>
            </span>
            <span class="au-radio__label">${this.#labelText}</span>
        `;

        this.style.display = 'inline-flex';
        this.style.alignItems = 'center';
        this.style.gap = '12px';  /* MD3: 12dp gap */
        this.style.cursor = this.has('disabled') ? 'not-allowed' : 'pointer';
        this.style.userSelect = 'none';
        this.style.minHeight = '48px';  /* MD3: 48dp touch target */
        this.style.padding = '0 4px';  /* Touch-friendly padding */

        this.#updateState();
    }

    /** @override */
    update(attr, newValue, oldValue) {
        // For checked changes, just update visuals without full re-render
        if (attr === 'checked' || attr === 'disabled') {
            this.#updateState();
        } else if (attr === 'label') {
            this.#labelText = newValue;
            const labelEl = this.querySelector('.au-radio__label');
            if (labelEl) labelEl.textContent = newValue;
        }
    }

    /** @private */
    #updateState() {
        const circle = this.querySelector('.au-radio__circle');
        const dot = this.querySelector('.au-radio__dot');
        const label = this.querySelector('.au-radio__label');
        const isChecked = this.has('checked');
        const isDisabled = this.has('disabled');

        // Update cursor
        this.style.cursor = isDisabled ? 'not-allowed' : 'pointer';

        if (circle) {
            circle.style.width = '20px';
            circle.style.height = '20px';
            circle.style.borderRadius = '50%';
            circle.style.display = 'flex';
            circle.style.alignItems = 'center';
            circle.style.justifyContent = 'center';
            circle.style.transition = 'border-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard)';

            // MD3 disabled state
            if (isDisabled) {
                circle.style.border = '2px solid color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent)';
            } else {
                circle.style.border = `2px solid ${isChecked ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline)'}`;
            }
        }

        if (dot) {
            dot.style.width = '10px';
            dot.style.height = '10px';
            dot.style.borderRadius = '50%';
            dot.style.transform = isChecked ? 'scale(0.5)' : 'scale(0)';
            dot.style.transition = 'transform var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard)';

            // MD3 disabled state
            if (isDisabled) {
                dot.style.background = 'color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent)';
            } else {
                dot.style.background = 'var(--md-sys-color-primary)';
            }
        }

        if (label) {
            label.style.color = isDisabled ? 'color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent)' : 'var(--md-sys-color-on-surface)';
        }

        // Accessibility: update ARIA states
        this.setAttribute('aria-checked', String(isChecked));
        this.setAttribute('aria-disabled', String(isDisabled));
        this.setAttribute('tabindex', isDisabled ? '-1' : '0');
    }
}

define('au-radio-group', AuRadioGroup);
define('au-radio', AuRadio);
