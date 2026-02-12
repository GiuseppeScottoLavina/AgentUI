/**
 * @fileoverview au-stack - Flexbox Stack Layout Component
 * 
 * Usage: <au-stack direction="column" gap="md" align="center">...</au-stack>
 */

import { AuElement, define } from '../core/AuElement.js';

export class AuStack extends AuElement {
    static baseClass = 'au-stack';
    static observedAttributes = ['direction', 'gap', 'align', 'justify', 'wrap', 'nowrap'];


    render() {
        this.#updateStyles();
    }

    update(attr, newValue, oldValue) {
        this.#updateStyles();
    }

    #updateStyles() {
        const direction = this.attr('direction', 'column');
        const gap = this.attr('gap', 'md');
        const align = this.attr('align', 'stretch');
        const justify = this.attr('justify', 'flex-start');
        // 2026: row direction wraps by default for responsive layouts
        // Use nowrap attribute to opt-out, or wrap attribute on column for opt-in
        const hasWrap = this.has('wrap');
        const hasNowrap = this.has('nowrap');
        const isRow = direction === 'row' || direction === 'row-reverse';
        // Row: wrap by default unless nowrap specified
        // Column: nowrap by default unless wrap specified
        const shouldWrap = isRow ? !hasNowrap : hasWrap;

        // Gap values map to CSS custom properties
        const gapMap = {
            none: '0',
            xs: 'var(--md-sys-spacing-xs, 4px)',
            sm: 'var(--md-sys-spacing-sm, 8px)',
            md: 'var(--md-sys-spacing-md, 16px)',
            lg: 'var(--md-sys-spacing-lg, 24px)',
            xl: 'var(--md-sys-spacing-xl, 32px)'
        };

        // Shorthand justify values → valid CSS justify-content
        const justifyMap = {
            between: 'space-between',
            around: 'space-around',
            evenly: 'space-evenly'
        };

        this.style.display = 'flex';
        this.style.flexDirection = direction;
        this.style.gap = gapMap[gap] || gap;
        this.style.alignItems = align;
        this.style.justifyContent = justifyMap[justify] || justify;
        this.style.flexWrap = shouldWrap ? 'wrap' : 'nowrap';
        // 2026: Proper containment for nested flex layouts
        this.style.boxSizing = 'border-box';
        this.style.maxWidth = '100%';
        this.style.minWidth = '0';  // Critical: allows shrinking in parent flexbox
        this.style.flexShrink = '1';  // MUST shrink to contain children properly
    }
}

define('au-stack', AuStack);
