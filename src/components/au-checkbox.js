/**
 * @fileoverview au-checkbox - Checkbox Component with MD3 Indeterminate Support
 * 
 * Usage: 
 *   <au-checkbox name="agree" checked>I agree</au-checkbox>
 *   <au-checkbox indeterminate>Parent task</au-checkbox>
 * 
 * States:
 *   - Unchecked: empty box
 *   - Checked: checkmark drawn with stroke animation
 *   - Indeterminate: horizontal line (set programmatically, cleared on user click)
 */

import { AuElement, define } from '../core/AuElement.js';
import { html } from '../core/utils.js';
import { createRipple } from '../core/ripple.js';

export class AuCheckbox extends AuElement {
    static baseClass = 'au-checkbox';
    static cssFile = 'checkbox';
    static observedAttributes = ['checked', 'disabled', 'name', 'label', 'indeterminate'];

    #input = null;

    connectedCallback() {
        super.connectedCallback();
        // Accessibility: set role and keyboard navigation
        this.setAttribute('role', 'checkbox');
        this.setupActivation(() => this.toggle());

        // Guard: defer click activation to prevent re-render loops.
        // When innerHTML replaces DOM, new elements are created while click events
        // still propagate. This prevents processing clicks during initialization.
        this._initializing = true;
        queueMicrotask(() => { this._initializing = false; });

        this.listen(this, 'pointerdown', (e) => {
            if (!this.isDisabled) {
                createRipple(this, e);
            }
        });
        this.listen(this, 'click', () => {
            if (!this.isDisabled && !this._initializing) {
                this.toggle();
            }
        });
    }

    render() {
        // Idempotent: skip if already rendered
        if (this.querySelector('.au-checkbox__box')) {
            this.#updateState();
            return;
        }

        const label = this.attr('label', '') || this.textContent;
        // SVG with both checkmark and indeterminate line paths
        this.innerHTML = html`
            <span class="au-checkbox__box">
                <svg class="au-checkbox__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <path class="au-checkbox__check" d="M4 12l6 6L20 6"/>
                    <line class="au-checkbox__indeterminate" x1="5" y1="12" x2="19" y2="12"/>
                </svg>
            </span>
            <span class="au-checkbox__label">${label}</span>
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

    update(attr, newValue, oldValue) {
        this.#updateState();
    }

    #updateState() {
        const box = this.querySelector('.au-checkbox__box');
        const icon = this.querySelector('.au-checkbox__icon');
        const checkPath = this.querySelector('.au-checkbox__check');
        const indeterminateLine = this.querySelector('.au-checkbox__indeterminate');
        const label = this.querySelector('.au-checkbox__label');

        const isDisabled = this.has('disabled');
        const isChecked = this.has('checked');
        const isIndeterminate = this.has('indeterminate');

        // Visual priority: indeterminate > checked > unchecked
        const isFilled = isChecked || isIndeterminate;

        this.style.cursor = isDisabled ? 'not-allowed' : 'pointer';

        if (box) {
            box.style.width = '18px';  /* MD3: 18dp container */
            box.style.height = '18px';
            box.style.borderRadius = '2px';  /* MD3: 2dp corner radius */
            box.style.display = 'flex';
            box.style.alignItems = 'center';
            box.style.justifyContent = 'center';
            box.style.transition = 'all var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard)';
            box.style.flexShrink = '0';

            if (isDisabled) {
                box.style.border = `2px solid color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent)`;
                box.style.background = isFilled ? 'color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent)' : 'transparent';
            } else {
                box.style.border = `2px solid ${isFilled ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline)'}`;
                box.style.background = isFilled ? 'var(--md-sys-color-primary)' : 'transparent';
            }
        }

        if (icon) {
            icon.style.width = '14px';
            icon.style.height = '14px';
            icon.style.color = isDisabled ? 'var(--md-sys-color-surface)' : 'var(--md-sys-color-on-primary)';
        }

        // Checkmark animation (GPU accelerated stroke-dashoffset)
        if (checkPath) {
            const pathLength = 24;
            checkPath.style.strokeDasharray = pathLength;
            checkPath.style.strokeDashoffset = (isChecked && !isIndeterminate) ? '0' : pathLength;
            checkPath.style.transition = 'stroke-dashoffset 200ms var(--md-sys-motion-easing-standard, ease-out)';
        }

        // Indeterminate line animation (GPU accelerated stroke-dashoffset)
        if (indeterminateLine) {
            const lineLength = 14;
            indeterminateLine.style.strokeDasharray = lineLength;
            indeterminateLine.style.strokeDashoffset = isIndeterminate ? '0' : lineLength;
            indeterminateLine.style.transition = 'stroke-dashoffset 200ms var(--md-sys-motion-easing-standard, ease-out)';
        }

        if (label) {
            label.style.color = isDisabled ? 'color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent)' : 'var(--md-sys-color-on-surface)';
        }

        // Accessibility: update ARIA states
        this.setAttribute('aria-checked', isIndeterminate ? 'mixed' : String(isChecked));
        this.setAttribute('aria-disabled', String(isDisabled));
        this.setAttribute('tabindex', isDisabled ? '-1' : '0');
    }

    toggle() {
        // User click always clears indeterminate and toggles checked
        if (this.has('indeterminate')) {
            this.removeAttribute('indeterminate');
        }

        if (this.has('checked')) {
            this.removeAttribute('checked');
        } else {
            this.setAttribute('checked', '');
        }
        this.emit('au-change', {
            checked: this.has('checked'),
            indeterminate: false,
            source: 'user'
        });
    }

    get checked() {
        return this.has('checked');
    }

    set checked(v) {
        if (v) {
            this.setAttribute('checked', '');
        } else {
            this.removeAttribute('checked');
        }
    }

    get indeterminate() {
        return this.has('indeterminate');
    }

    set indeterminate(v) {
        if (v) {
            this.setAttribute('indeterminate', '');
        } else {
            this.removeAttribute('indeterminate');
        }
    }
}

define('au-checkbox', AuCheckbox);
