/**
 * @fileoverview au-badge - MD3 Badge Component
 */

import { AuElement, define } from '../core/AuElement.js';

export class AuBadge extends AuElement {
    static baseClass = 'au-badge';
    static cssFile = 'badge';
    static observedAttributes = ['variant', 'size'];


    connectedCallback() {
        super.connectedCallback();
        this.#updateClasses();
    }

    render() {
        this.#updateClasses();
    }

    update(attr, newValue, oldValue) {
        this.#updateClasses();
    }

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
