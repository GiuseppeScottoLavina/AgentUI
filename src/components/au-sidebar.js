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

export class AuSidebar extends AuElement {
    static baseClass = 'au-sidebar';
    static observedAttributes = ['open', 'width'];


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

    update(attr, newValue, oldValue) {
        this.render();
    }

    toggle() {
        if (this.has('open')) {
            this.removeAttribute('open');
        } else {
            this.setAttribute('open', '');
        }
        this.emit('au-sidebar-toggle', { open: this.has('open') });
    }
}

export class AuSidebarItem extends AuElement {
    static baseClass = 'au-sidebar__item';
    static observedAttributes = ['icon', 'active'];

    connectedCallback() {
        super.connectedCallback();
        this.listen(this, 'click', () => {
            this.emit('au-sidebar-select', { item: this });
        });
    }

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

    update(attr, newValue, oldValue) {
        this.render();
    }
}

define('au-sidebar', AuSidebar);
define('au-sidebar-item', AuSidebarItem);
