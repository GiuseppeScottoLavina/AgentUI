/**
 * @fileoverview au-container - Responsive Container Component
 * 
 * Usage: <au-container size="lg" padding="md">...</au-container>
 */

import { AuElement, define } from '../core/AuElement.js';

export class AuContainer extends AuElement {
    static baseClass = 'au-container';
    static observedAttributes = ['size', 'padding', 'center'];


    render() {
        this.#updateStyles();
    }

    update(attr, newValue, oldValue) {
        this.#updateStyles();
    }

    #updateStyles() {
        const size = this.attr('size', 'lg');
        const padding = this.attr('padding', 'md');

        const sizeMap = {
            sm: '640px',
            md: '768px',
            lg: '1024px',
            xl: '1280px',
            full: '100%'
        };

        const paddingMap = {
            none: '0',
            sm: '8px',
            md: '16px',
            lg: '24px',
            xl: '32px'
        };

        // display: block is required for max-width to work on custom elements
        this.style.display = 'block';
        this.style.maxWidth = sizeMap[size] || size;
        this.style.padding = paddingMap[padding] || padding;
        this.style.width = '100%';

        // Center by default (MD3 standard) — opt-out with center="false"
        if (this.attr('center', '') !== 'false') {
            this.style.marginLeft = 'auto';
            this.style.marginRight = 'auto';
        }
    }
}

define('au-container', AuContainer);
