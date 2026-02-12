/**
 * @fileoverview au-spinner - MD3 Circular Progress Indicator
 */

import { AuElement, define } from '../core/AuElement.js';

export class AuSpinner extends AuElement {
    static baseClass = 'au-spinner';
    static observedAttributes = ['size', 'color'];

    render() {
        // Idempotent: skip if already rendered  
        if (this.querySelector('.au-spinner__circle')) return;

        this.innerHTML = '<span class="au-spinner__circle"></span>';
        this.#updateClasses();
    }

    update(attr, newValue, oldValue) {
        this.#updateClasses();
    }

    #updateClasses() {
        const size = this.attr('size', 'md');
        const color = this.attr('color', 'primary');

        const baseClasses = ['au-spinner', `au-spinner--${size}`, `au-spinner--${color}`];
        baseClasses.forEach(cls => this.classList.add(cls));

        Array.from(this.classList).forEach(cls => {
            if (cls.startsWith('au-spinner--') && !baseClasses.includes(cls)) {
                this.classList.remove(cls);
            }
        });
    }
}

define('au-spinner', AuSpinner);
