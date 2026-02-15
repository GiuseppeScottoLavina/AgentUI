/**
 * @fileoverview au-divider - Divider Line Component
 * 
 * Usage:
 * <au-divider></au-divider>
 * <au-divider vertical></au-divider>
 */

import { AuElement, define } from '../core/AuElement.js';

/**
 * Horizontal or vertical divider line.
 *
 * @class
 * @extends AuElement
 * @element au-divider
 */
export class AuDivider extends AuElement {
    static baseClass = 'au-divider';
    static cssFile = null; // CSS is inline/JS only
    /** @type {string[]} */
    static observedAttributes = ['vertical', 'inset'];

    /** @override */
    render() {
        const vertical = this.has('vertical');
        const inset = this.has('inset');

        this.style.display = 'block';
        this.style.background = 'var(--md-sys-color-outline-variant)';
        this.style.flexShrink = '0';

        if (vertical) {
            this.style.width = '1px';
            this.style.minHeight = '24px';
            this.style.margin = inset ? '0 8px' : '0';
        } else {
            this.style.height = '1px';
            this.style.width = '100%';
            this.style.margin = inset ? '0 16px' : '0';
        }
    }

    /** @override */
    update(attr, newValue, oldValue) {
        this.render();
    }
}

define('au-divider', AuDivider);
