/**
 * @fileoverview au-button - MD3 Button Component
 * 
 * Usage: <au-button variant="primary" size="md">Label</au-button>
 */

import { AuElement, define } from '../core/AuElement.js';
import { createRipple } from '../core/ripple.js';
import { escapeHTML } from '../core/utils.js';

export class AuButton extends AuElement {
    static baseClass = 'au-button';
    static cssFile = 'button';
    static observedAttributes = ['variant', 'size', 'disabled'];

    /**
     * Self-documenting component for AI agents
     */

    connectedCallback() {
        super.connectedCallback();
        this.setAttribute('role', 'button');
        this.setupActivation(() => this.click());

        // MD3 Ripple effect on press
        this.listen(this, 'pointerdown', (e) => {
            if (!this.isDisabled) {
                createRipple(this, e);
            }
        });
    }

    render() {
        // Only wrap text on first render to preserve custom children (icons, etc.)
        if (!this._initialRenderDone) {
            // Check if there are element children (like au-icon) - don't touch if so
            const hasElementChildren = Array.from(this.children).some(
                child => child.nodeType === 1 // Element node
            );

            if (!hasElementChildren) {
                // Only text content - wrap it in a label span
                const label = this.textContent.trim();
                if (label) {
                    this.innerHTML = `<span class="au-button__label">${escapeHTML(label)}</span>`;
                }
            }
            // If hasElementChildren, leave DOM untouched (icon-only or icon+text buttons)

            this._initialRenderDone = true;
        }
        this.#updateClasses();
    }

    update(attr, newValue, oldValue) {
        if (attr === 'disabled') {
            this.updateTabindex();
        }
        this.#updateClasses();
    }

    #updateClasses() {
        const variant = this.attr('variant', 'primary');
        const size = this.attr('size', 'md');

        // AGENT VALIDATION: Check variant
        const validVariants = ['filled', 'elevated', 'tonal', 'outlined', 'text', 'danger', 'primary', 'secondary', 'ghost'];
        if (!validVariants.includes(variant)) {
            this.logError('INVALID_VARIANT', `Invalid button variant '${variant}'. Valid: ${validVariants.join(', ')}`);
        }

        // Preserve custom classes while updating component classes
        const baseClasses = ['au-button', `au-button--${variant}`, `au-button--${size}`];

        // Add base classes without removing custom ones
        baseClasses.forEach(cls => this.classList.add(cls));

        // Remove old variant/size classes that are no longer active
        Array.from(this.classList).forEach(cls => {
            if (cls.startsWith('au-button--') && !baseClasses.includes(cls)) {
                this.classList.remove(cls);
            }
        });

        if (this.has('disabled')) {
            this.classList.add('is-disabled');
        } else {
            this.classList.remove('is-disabled');
        }
    }
}

define('au-button', AuButton);
