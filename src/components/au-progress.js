/**
 * @fileoverview au-progress - MD3 Linear Progress Indicator
 */

import { AuElement, define } from '../core/AuElement.js';

export class AuProgress extends AuElement {
    static baseClass = 'au-progress';
    static cssFile = 'progress';
    static observedAttributes = ['value', 'max', 'variant'];

    #bar = null;

    render() {
        // Idempotent: skip if already rendered  
        if (this.querySelector('.au-progress__bar')) {
            this.#bar = this.querySelector('.au-progress__bar');
            return;
        }

        this.innerHTML = '<span class="au-progress__bar"></span>';
        this.#bar = this.querySelector('.au-progress__bar');
        this.setAttribute('role', 'progressbar');
        this.#updateProgress();
        this.#updateClasses();
    }

    update(attr, newValue, oldValue) {
        if (attr === 'value' || attr === 'max') {
            this.#updateProgress();
        }
        this.#updateClasses();
    }

    #updateProgress() {
        const value = parseFloat(this.attr('value', '0'));
        const max = parseFloat(this.attr('max', '100'));
        const percent = Math.min(100, Math.max(0, (value / max) * 100));

        if (this.#bar) {
            this.#bar.style.width = `${percent}%`;
        }

        this.setAttribute('aria-valuenow', value.toString());
        this.setAttribute('aria-valuemax', max.toString());
    }

    #updateClasses() {
        const variant = this.attr('variant', 'primary');

        const baseClasses = ['au-progress', `au-progress--${variant}`];
        baseClasses.forEach(cls => this.classList.add(cls));

        Array.from(this.classList).forEach(cls => {
            if (cls.startsWith('au-progress--') && !baseClasses.includes(cls)) {
                this.classList.remove(cls);
            }
        });
    }
}

define('au-progress', AuProgress);
