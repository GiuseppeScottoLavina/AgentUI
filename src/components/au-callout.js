/**
 * @fileoverview au-callout - MD3 Callout/Info Box Component
 * 
 * Usage: 
 * <au-callout variant="info">Important information here</au-callout>
 * <au-callout variant="warning">Warning message</au-callout>
 * <au-callout variant="success">Success message</au-callout>
 */

import { AuElement, define } from '../core/AuElement.js';

/**
 * MD3 Callout / Info Box with variant-based colouring.
 *
 * @class
 * @extends AuElement
 * @element au-callout
 */
export class AuCallout extends AuElement {
    static baseClass = 'au-callout';
    /** @type {string[]} */
    static observedAttributes = ['variant', 'title'];


    /** @override */
    render() {
        this.#updateStyles();
    }

    /** @override */
    update(attr, newValue, oldValue) {
        this.#updateStyles();
    }

    /** @private */
    #updateStyles() {
        const variant = this.attr('variant', 'info');

        // MD3 color mappings
        const variantColors = {
            info: {
                bg: 'var(--md-sys-color-primary-container)',
                border: 'var(--md-sys-color-primary)',
                text: 'var(--md-sys-color-on-primary-container)'
            },
            warning: {
                bg: 'var(--md-sys-color-error-container)',
                border: 'var(--md-sys-color-error)',
                text: 'var(--md-sys-color-on-error-container)'
            },
            success: {
                bg: 'var(--md-sys-color-tertiary-container)',
                border: 'var(--md-sys-color-tertiary)',
                text: 'var(--md-sys-color-on-tertiary-container)'
            },
            tip: {
                bg: 'var(--md-sys-color-secondary-container)',
                border: 'var(--md-sys-color-secondary)',
                text: 'var(--md-sys-color-on-secondary-container)'
            }
        };

        const colors = variantColors[variant] || variantColors.info;

        // Apply MD3 callout styling
        this.style.display = 'block';
        // 2026: Proper containment - critical for responsive layout
        this.style.boxSizing = 'border-box';
        this.style.maxWidth = '100%';
        this.style.wordWrap = 'break-word';
        this.style.overflowWrap = 'break-word';
        this.style.padding = '20px';  /* MD3: 20dp padding */
        this.style.marginTop = '24px';  /* MD3: 24dp spacing from previous content */
        this.style.marginBottom = '24px';
        this.style.background = colors.bg;
        this.style.borderLeft = `4px solid ${colors.border}`;
        this.style.borderRadius = 'var(--md-sys-shape-corner-medium)';
        this.style.color = colors.text;
        this.style.lineHeight = '1.6';
    }
}

define('au-callout', AuCallout);
