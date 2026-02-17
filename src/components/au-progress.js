/**
 * @fileoverview au-progress - MD3 Linear Progress Indicator
 * Port of Material Web's md-linear-progress.
 * Source: https://github.com/material-components/material-web/blob/main/progress/internal/linear-progress.ts
 *
 * Determinate: single bar with width %.
 * Indeterminate: two bars (primary + secondary) with Material Web keyframes.
 */

import { AuElement, define } from '../core/AuElement.js';

/**
 * MD3 Linear Progress Indicator with determinate and indeterminate modes.
 *
 * @class
 * @extends AuElement
 * @element au-progress
 */
export class AuProgress extends AuElement {
    static baseClass = 'au-progress';
    static cssFile = 'progress';
    /** @type {string[]} */
    static observedAttributes = ['value', 'max', 'variant', 'indeterminate'];

    #primaryBar = null;

    /** @override */
    render() {
        // Idempotent: skip if already rendered
        if (this.querySelector('.au-progress__progress')) {
            this.#primaryBar = this.querySelector('.au-progress__primary-bar');
            return;
        }

        this.setAttribute('role', 'progressbar');

        // Material Web structure:
        // .progress > (.bar.primary-bar > .bar-inner) + (.bar.secondary-bar > .bar-inner)
        this.innerHTML = `<div class="au-progress__progress${this.hasAttribute('indeterminate') ? ' au-progress__indeterminate' : ''}">
    <div class="au-progress__bar au-progress__primary-bar">
        <div class="au-progress__bar-inner"></div>
    </div>
    <div class="au-progress__bar au-progress__secondary-bar">
        <div class="au-progress__bar-inner"></div>
    </div>
</div>`;
        this.#primaryBar = this.querySelector('.au-progress__primary-bar');
        this.#updateProgress();
        this.#updateClasses();
    }

    /**
     * @override
     * @param {string} attr
     * @param {string|null} newValue
     * @param {string|null} oldValue
     */
    update(attr, newValue, oldValue) {
        if (attr === 'value' || attr === 'max') {
            this.#updateProgress();
        }
        if (attr === 'indeterminate') {
            const progress = this.querySelector('.au-progress__progress');
            if (progress) {
                if (newValue !== null) {
                    progress.classList.add('au-progress__indeterminate');
                } else {
                    progress.classList.remove('au-progress__indeterminate');
                }
            }
            this.#updateProgress();
        }
        this.#updateClasses();
    }

    /** @private */
    #updateProgress() {
        const value = parseFloat(this.attr('value', '0'));
        const max = parseFloat(this.attr('max', '100'));
        const percent = Math.min(100, Math.max(0, (value / max) * 100));

        if (this.#primaryBar) {
            this.#primaryBar.style.width = `${percent}%`;
        }

        this.setAttribute('aria-valuenow', value.toString());
        this.setAttribute('aria-valuemax', max.toString());

        // Auto-generate aria-label when user hasn't explicitly provided one.
        // Uses a data attribute to track whether the label was auto-set.
        if (!this.hasAttribute('aria-label') || this.dataset.autoLabel) {
            const label = this.hasAttribute('indeterminate')
                ? 'Loading'
                : `Progress: ${Math.round(percent)}%`;
            this.setAttribute('aria-label', label);
            this.dataset.autoLabel = '1';
        }
    }

    /** @private */
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
