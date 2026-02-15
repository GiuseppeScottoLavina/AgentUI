/**
 * @fileoverview au-spinner - MD3 Circular Progress Indicator
 * Exact port of Material Web's md-circular-progress (indeterminate mode).
 * Uses two bordered divs clipped into half circles.
 * Source: https://github.com/material-components/material-web/blob/main/progress/internal/circular-progress.ts
 */

import { AuElement, define } from '../core/AuElement.js';

/**
 * MD3 Circular Progress Indicator (indeterminate mode).
 *
 * @class
 * @extends AuElement
 * @element au-spinner
 */
export class AuSpinner extends AuElement {
    static baseClass = 'au-spinner';
    /** @type {string[]} */
    static observedAttributes = ['size', 'color'];

    /** @override */
    render() {
        // Idempotent: skip if already rendered
        if (this.querySelector('.au-spinner__spinner')) return;

        // Accessibility
        if (!this.hasAttribute('role')) this.setAttribute('role', 'progressbar');
        if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', 'Loading');

        // Exact Material Web structure for indeterminate mode:
        // .progress > .spinner > (.left > .circle) + (.right > .circle)
        this.innerHTML = `<div class="au-spinner__progress">
    <div class="au-spinner__spinner">
        <div class="au-spinner__left"><div class="au-spinner__circle"></div></div>
        <div class="au-spinner__right"><div class="au-spinner__circle"></div></div>
    </div>
</div>`;
        this.#updateClasses();
    }

    /** @override */
    update(attr, newValue, oldValue) {
        this.#updateClasses();
    }

    /** @private */
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
