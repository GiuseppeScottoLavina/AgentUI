/**
 * @fileoverview au-grid - CSS Grid Layout Component
 * 
 * Usage: <au-grid cols="3" gap="md">...</au-grid>
 * 
 * Responsive: On compact screens (< 600px), grids with 3+ columns
 * automatically collapse to single column via CSS media query.
 * See components.css for the responsive rules.
 */

import { AuElement, define } from '../core/AuElement.js';

export class AuGrid extends AuElement {
    static baseClass = 'au-grid';
    static cssFile = 'grid';
    static observedAttributes = ['cols', 'rows', 'gap', 'align'];


    render() {
        this.#updateStyles();
    }

    update(attr, newValue, oldValue) {
        this.#updateStyles();
    }

    #updateStyles() {
        const cols = this.attr('cols', '1');
        const rows = this.attr('rows', '');
        const gap = this.attr('gap', 'md');
        const align = this.attr('align', 'stretch');

        const gapMap = {
            none: '0',
            xs: '4px',
            sm: '8px',
            md: '16px',
            lg: '24px',
            xl: '32px'
        };

        this.style.display = 'grid';

        // Set gridTemplateColumns only for non-responsive cases
        // CSS media queries in components.css handle responsive collapse to 1fr on compact
        // We don't override CSS's responsive behavior here - CSS has lower specificity 
        // than inline styles, so we need to NOT set this on compact breakpoints
        // However, since detecting compact reliably in JS during module load is unreliable,
        // we rely on CSS to override via !important for responsive cases
        this.style.gridTemplateColumns = cols.includes('fr') || cols.includes('px')
            ? cols
            : `repeat(${cols}, 1fr)`;

        if (rows) {
            this.style.gridTemplateRows = rows.includes('fr') || rows.includes('px')
                ? rows
                : `repeat(${rows}, 1fr)`;
        }
        this.style.gap = gapMap[gap] || gap;
        this.style.alignItems = align;
    }
}

define('au-grid', AuGrid);
