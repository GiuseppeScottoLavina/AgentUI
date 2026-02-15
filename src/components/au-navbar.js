/**
 * @fileoverview au-navbar - Navigation Bar Component
 * 
 * Usage: 
 * <au-navbar>
 *   <au-navbar-brand>Logo</au-navbar-brand>
 *   <au-navbar-links>
 *     <a href="/">Home</a>
 *     <a href="/about">About</a>
 *   </au-navbar-links>
 *   <au-navbar-actions>
 *     <au-theme-toggle></au-theme-toggle>
 *   </au-navbar-actions>
 * </au-navbar>
 */

import { AuElement, define } from '../core/AuElement.js';

/**
 * Top navigation bar with brand, links, and action slots.
 *
 * @class
 * @extends AuElement
 * @element au-navbar
 */
export class AuNavbar extends AuElement {
    static baseClass = 'au-navbar';
    static cssFile = 'navbar';
    /** @type {string[]} */
    static observedAttributes = ['sticky', 'variant'];

    /** @override */
    render() {
        this.style.display = 'flex';
        this.style.alignItems = 'center';
        this.style.justifyContent = 'space-between';
        this.style.padding = '0 var(--md-sys-spacing-md, 16px)';
        this.style.height = '64px';
        this.style.background = 'var(--md-sys-color-surface-container)';
        this.style.borderBottom = '1px solid var(--md-sys-color-outline-variant)';

        if (this.has('sticky')) {
            this.style.position = 'sticky';
            this.style.top = '0';
            this.style.zIndex = '100';
        }
    }
}

/**
 * Brand section for `<au-navbar>`.
 * @class
 * @extends AuElement
 * @element au-navbar-brand
 */
export class AuNavbarBrand extends AuElement {
    static baseClass = 'au-navbar__brand';

    /** @override */
    render() {
        this.style.fontWeight = '600';
        this.style.fontSize = '1.25rem';
    }
}

/**
 * Links section for `<au-navbar>`.
 * @class
 * @extends AuElement
 * @element au-navbar-links
 */
export class AuNavbarLinks extends AuElement {
    static baseClass = 'au-navbar__links';

    /** @override */
    render() {
        // All styles handled by CSS in components.css
    }
}

/**
 * Actions section for `<au-navbar>`.
 * @class
 * @extends AuElement
 * @element au-navbar-actions
 */
export class AuNavbarActions extends AuElement {
    static baseClass = 'au-navbar__actions';

    /** @override */
    render() {
        this.style.display = 'flex';
        this.style.gap = 'var(--md-sys-spacing-sm, 8px)';
        this.style.alignItems = 'center';
    }
}

define('au-navbar', AuNavbar);
define('au-navbar-brand', AuNavbarBrand);
define('au-navbar-links', AuNavbarLinks);
define('au-navbar-actions', AuNavbarActions);
