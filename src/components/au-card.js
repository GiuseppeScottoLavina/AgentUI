/**
 * @fileoverview au-card - MD3 Card Container Component
 * 
 * Usage: <au-card variant="elevated">Content here</au-card>
 */

import { AuElement, define } from '../core/AuElement.js';

/**
 * MD3 Card container component with elevation and padding options.
 *
 * @class
 * @extends AuElement
 * @element au-card
 * @slot default - Card body content
 */
export class AuCard extends AuElement {
    static baseClass = 'au-card';
    static cssFile = 'card';
    /** @type {string[]} */
    static observedAttributes = ['variant', 'padding'];

    /**
     * Self-documenting component for AI agents
     */

    /** @override */
    connectedCallback() {
        super.connectedCallback();
        this.#updateClasses();
    }

    /** @override */
    render() {
        // Card just wraps content, no internal structure needed
        this.#updateClasses();
    }

    /**
     * @override
     * @param {string} attr
     * @param {string|null} newValue
     * @param {string|null} oldValue
     */
    update(attr, newValue, oldValue) {
        this.#updateClasses();
    }

    /** @private */
    #updateClasses() {
        const variant = this.attr('variant', 'flat');
        const padding = this.attr('padding', 'md');

        // Preserve custom classes while updating component classes
        const baseClasses = ['au-card', `au-card--${variant}`, `au-card--padding-${padding}`];
        baseClasses.forEach(cls => this.classList.add(cls));

        // Remove old variant/padding classes
        Array.from(this.classList).forEach(cls => {
            if ((cls.startsWith('au-card--') || cls.startsWith('au-card--padding-')) && !baseClasses.includes(cls)) {
                this.classList.remove(cls);
            }
        });
    }
}

define('au-card', AuCard);
