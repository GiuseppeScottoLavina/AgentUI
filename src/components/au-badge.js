/**
 * @fileoverview au-badge - MD3 Badge Component
 */

import { AuElement, define } from '../core/AuElement.js';

/**
 * MD3 Badge component for status indicators.
 *
 * @class
 * @extends AuElement
 * @element au-badge
 * @slot default - Badge content (text or number)
 */
export class AuBadge extends AuElement {
    static baseClass = 'au-badge';
    static cssFile = 'badge';
    /** @type {string[]} */
    static observedAttributes = ['variant', 'size'];

    /** @override */
    connectedCallback() {
        super.connectedCallback();
        this.#updateClasses();
    }

    /** @override */
    render() {
        this.#updateClasses();
    }

    /** @override */
    update(attr, newValue, oldValue) {
        this.#updateClasses();
    }

    /** @private */
    #updateClasses() {
        const variant = this.attr('variant', 'primary');
        const size = this.attr('size', 'md');

        // Preserve custom classes while updating component classes
        const baseClasses = ['au-badge', `au-badge--${variant}`, `au-badge--${size}`];
        baseClasses.forEach(cls => this.classList.add(cls));

        // Remove old variant/size classes
        Array.from(this.classList).forEach(cls => {
            if (cls.startsWith('au-badge--') && !baseClasses.includes(cls)) {
                this.classList.remove(cls);
            }
        });
    }
}

define('au-badge', AuBadge);
