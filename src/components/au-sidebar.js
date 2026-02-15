/**
 * @fileoverview au-sidebar - Collapsible Sidebar Component
 * 
 * Usage:
 * <au-sidebar open>
 *   <au-sidebar-item icon="home" active>Dashboard</au-sidebar-item>
 *   <au-sidebar-item icon="settings">Settings</au-sidebar-item>
 * </au-sidebar>
 */

import { AuElement, define } from '../core/AuElement.js';

/**
 * Collapsible sidebar navigation panel.
 *
 * @class
 * @extends AuElement
 * @element au-sidebar
 * @fires au-sidebar-toggle - When toggled, detail: `{ open }`
 * @slot default - `<au-sidebar-item>` children
 */
export class AuSidebar extends AuElement {
    static baseClass = 'au-sidebar';
    /** @type {string[]} */
    static observedAttributes = ['open', 'width'];

    /** @override */
    render() {
        const width = this.attr('width', '250px');

        this.style.width = this.has('open') ? width : '64px';
        this.style.height = '100vh';
        this.style.background = 'var(--md-sys-color-surface-container)';
        this.style.borderRight = '1px solid var(--md-sys-color-outline-variant)';
        this.style.transition = 'width var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-emphasized)';
        this.style.overflow = 'hidden';
        this.style.display = 'flex';
        this.style.flexDirection = 'column';
    }

    /** @override */
    update(attr, newValue, oldValue) {
        this.render();
    }

    /** Toggle the sidebar open/closed. */
    toggle() {
        if (this.has('open')) {
            this.removeAttribute('open');
        } else {
            this.setAttribute('open', '');
        }
        this.emit('au-sidebar-toggle', { open: this.has('open') });
    }
}

/**
 * Individual item within `<au-sidebar>`.
 *
 * @class
 * @extends AuElement
 * @element au-sidebar-item
 * @fires au-sidebar-select - When clicked, detail: `{ item }`
 */
export class AuSidebarItem extends AuElement {
    static baseClass = 'au-sidebar__item';
    /** @type {string[]} */
    static observedAttributes = ['icon', 'active'];

    /** @override */
    connectedCallback() {
        super.connectedCallback();
        this.listen(this, 'click', () => {
            this.emit('au-sidebar-select', { item: this });
        });
    }

    /** @override */
    render() {
        const icon = this.attr('icon', '');
        const text = this.textContent;

        this.style.display = 'flex';
        this.style.alignItems = 'center';
        this.style.gap = 'var(--md-sys-spacing-md, 16px)';
        this.style.padding = '12px 16px';
        this.style.cursor = 'pointer';
        this.style.borderRadius = 'var(--md-sys-shape-corner-medium, 8px)';
        this.style.margin = '4px 8px';
        this.style.transition = 'background var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard)';

        if (this.has('active')) {
            this.style.background = 'var(--md-sys-color-primary-container)';
            this.style.color = 'var(--md-sys-color-on-primary-container)';
        }
    }

    /** @override */
    update(attr, newValue, oldValue) {
        this.render();
    }
}

define('au-sidebar', AuSidebar);
define('au-sidebar-item', AuSidebarItem);
