/**
 * @fileoverview au-switch - Toggle Switch Component
 * 
 * Usage: <au-switch checked></au-switch>
 */

import { AuElement, define } from '../core/AuElement.js';
import { html } from '../core/utils.js';
import { createRipple } from '../core/ripple.js';

/**
 * MD3 Toggle Switch component.
 *
 * @class
 * @extends AuElement
 * @element au-switch
 * @fires au-change - When toggled, detail: `{ checked, source }`
 */
export class AuSwitch extends AuElement {
    static baseClass = 'au-switch';
    static cssFile = 'switch';
    /** @type {string[]} */
    static observedAttributes = ['checked', 'disabled', 'label'];

    /** @override */
    connectedCallback() {
        super.connectedCallback();
        // Accessibility: set role and keyboard navigation
        this.setAttribute('role', 'switch');
        this.setupActivation(() => this.toggle());

        // Guard: defer click activation to prevent re-render loops.
        // When innerHTML replaces DOM, new elements are created while click events
        // still propagate. This prevents processing clicks during initialization.
        this._initializing = true;
        queueMicrotask(() => { this._initializing = false; });

        this.listen(this, 'pointerdown', (e) => {
            if (!this.isDisabled) {
                const stateLayer = this.querySelector('.au-switch__state-layer');
                if (stateLayer) createRipple(stateLayer, e, { centered: true, eventTarget: this });
            }
        });
        this.listen(this, 'click', () => {
            if (!this.isDisabled && !this._initializing) {
                this.toggle();
            }
        });
    }

    /** @override */
    render() {
        // Idempotent: skip if already rendered  
        if (this.querySelector('.au-switch__track')) {
            this.#updateState();
            return;
        }

        const label = this.attr('label', '') || this.textContent;
        this.innerHTML = html`
            <span class="au-switch__track">
                <span class="au-switch__state-layer">
                    <span class="au-switch__thumb"></span>
                </span>
            </span>
            ${label ? html`<span class="au-switch__label">${label}</span>` : ''}
        `;

        this.style.display = 'inline-flex';
        this.style.alignItems = 'center';
        this.style.gap = '12px';
        this.style.cursor = this.has('disabled') ? 'not-allowed' : 'pointer';

        this.#updateState();
    }

    /** @override */
    update(attr, newValue, oldValue) {
        this.#updateState();
    }

    /** @private */
    #updateState() {
        const track = this.querySelector('.au-switch__track');
        const stateLayer = this.querySelector('.au-switch__state-layer');
        const thumb = this.querySelector('.au-switch__thumb');
        const isChecked = this.has('checked');
        const isDisabled = this.has('disabled');

        // Update cursor
        this.style.cursor = isDisabled ? 'not-allowed' : 'pointer';

        if (track) {
            track.style.width = '52px';
            track.style.height = '32px';
            track.style.borderRadius = '16px';
            track.style.position = 'relative';
            track.style.transition = 'background var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard)';

            // MD3 disabled state
            if (isDisabled) {
                track.style.background = 'color-mix(in srgb, var(--md-sys-color-on-surface) 12%, transparent)';
            } else {
                track.style.background = isChecked
                    ? 'var(--md-sys-color-primary)'
                    : 'var(--md-sys-color-surface-container-highest)';
            }
        }

        // MD3: 40dp state layer centered on thumb, following thumb position
        if (stateLayer) {
            const stateLayerLeft = isChecked ? 20 : -2;  // Center 40dp layer on thumb
            stateLayer.style.cssText = `
                width: 40px; height: 40px;
                border-radius: 50%;
                position: absolute;
                top: -4px;
                left: ${stateLayerLeft}px;
                display: flex; align-items: center; justify-content: center;
                overflow: hidden;
                transition: left var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized);
            `;
        }

        if (thumb) {
            // MD3: Thumb is 16dp when off, 24dp when on
            const thumbSize = isChecked ? 24 : 16;

            thumb.style.width = `${thumbSize}px`;
            thumb.style.height = `${thumbSize}px`;
            thumb.style.borderRadius = `${thumbSize / 2}px`;
            thumb.style.transition = 'all var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-emphasized)';

            // MD3 disabled state
            if (isDisabled) {
                thumb.style.background = 'color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent)';
                thumb.style.boxShadow = 'none';
            } else {
                thumb.style.background = isChecked
                    ? 'var(--md-sys-color-on-primary)'
                    : 'var(--md-sys-color-outline)';
                thumb.style.boxShadow = 'var(--md-sys-elevation-level1)';
            }
        }

        // Style label if present
        const label = this.querySelector('.au-switch__label');
        if (label) {
            label.style.color = isDisabled ? 'color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent)' : 'var(--md-sys-color-on-surface)';
        }

        // Accessibility: update ARIA states
        this.setAttribute('aria-checked', String(isChecked));
        this.setAttribute('aria-disabled', String(isDisabled));
        this.setAttribute('tabindex', isDisabled ? '-1' : '0');
        // Set aria-label from label text or attribute
        const labelText = label?.textContent || this.attr('label', '');
        if (labelText) this.setAttribute('aria-label', labelText);
    }

    /** Toggle the switch state. */
    toggle() {
        if (this.has('checked')) {
            this.removeAttribute('checked');
        } else {
            this.setAttribute('checked', '');
        }
        this.emit('au-change', { checked: this.has('checked'), source: 'user' });
    }

    /**
     * Whether the switch is checked.
     * @type {boolean}
     */
    get checked() {
        return this.has('checked');
    }

    /** @param {boolean} v */
    set checked(v) {
        if (v) {
            this.setAttribute('checked', '');
        } else {
            this.removeAttribute('checked');
        }
    }
}

define('au-switch', AuSwitch);
