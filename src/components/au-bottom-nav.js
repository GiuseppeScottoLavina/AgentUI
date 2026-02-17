/**
 * @fileoverview au-bottom-nav - Material Design 3 Bottom Navigation Bar
 * 
 * Fixed bottom navigation for mobile devices.
 * Follows MD3 Navigation Bar specifications (3-5 destinations).
 * 
 * LIGHT DOM: Uses Light DOM for styling consistency.
 */

import { AuElement, define } from '../core/AuElement.js';
import { breakpoints } from '../core/breakpoints.js';

/**
 * MD3 Bottom Navigation Bar for mobile viewports.
 *
 * @class
 * @extends AuElement
 * @element au-bottom-nav
 * @fires au-change - When active destination changes, detail: `{ value, item }`
 */
export class AuBottomNav extends AuElement {
    /** @type {string[]} */
    static get observedAttributes() {
        return ['hide-on-desktop', 'value'];
    }

    static baseClass = 'au-bottom-nav';
    static cssFile = 'bottom-nav';
    // Disable containment - bottom-nav is position:fixed
    static useContainment = false;


    constructor() {
        super();
        this._unsubscribe = null;
    }

    get hideOnDesktop() { return this.hasAttribute('hide-on-desktop'); }
    set hideOnDesktop(v) { this.toggleAttribute('hide-on-desktop', Boolean(v)); }

    get value() { return this.getAttribute('value') || ''; }
    set value(v) { this.setAttribute('value', v); }

    /** @override */
    connectedCallback() {
        // Preserve children before render
        if (!this._childrenCaptured) {
            this._userChildren = Array.from(this.children);
            this._childrenCaptured = true;
        }
        super.connectedCallback();
        this._setupBreakpointListener();
        this._setupListeners();
        this._updateVisibility();
    }

    /** @override */
    disconnectedCallback() {
        super.disconnectedCallback();
        if (this._unsubscribe) {
            this._unsubscribe();
            this._unsubscribe = null;
        }
    }

    /** @override */
    attributeChangedCallback(name, oldVal, newVal) {
        if (!this.isConnected) return;

        if (name === 'hide-on-desktop') {
            this._updateVisibility();
        }
    }

    /** @private */
    _setupBreakpointListener() {
        if (this.hideOnDesktop) {
            // Subscribe to centralized breakpoint changes
            this._unsubscribe = breakpoints.subscribe(() => {
                this._updateVisibility();
            });
        }
    }

    /** @private */
    _updateVisibility() {
        // Hide on medium+ screens (tablets and desktop) using centralized breakpoints
        if (this.hideOnDesktop && breakpoints.isNotCompact) {
            this.style.display = 'none';
        } else {
            this.style.display = '';
        }
    }

    /** @private */
    _setupListeners() {
        // Listen for nav item selection
        this.listen(this, 'au-nav-select', (e) => {
            this._updateActiveItem(e.detail.item);
            this.value = e.detail.href || '';

            this.emit('au-change', { value: this.value, item: e.detail.item }, { bubbles: true });
        });
    }

    /** @private */
    _updateActiveItem(selectedItem) {
        const items = this.querySelectorAll('au-nav-item, au-drawer-item');
        items.forEach(item => {
            item.active = (item === selectedItem);
        });
    }

    /** @override */
    render() {
        // Create nav wrapper and append preserved children
        const nav = document.createElement('nav');
        nav.className = 'au-bottom-nav-nav';
        nav.setAttribute('role', 'menu'); // ARIA: menuitem children require menu parent
        nav.setAttribute('aria-label', 'Bottom navigation');

        // Clear and rebuild
        this.innerHTML = '';
        this.appendChild(nav);

        // Re-append user children
        if (this._userChildren) {
            this._userChildren.forEach(child => nav.appendChild(child));
        }
    }
}

define('au-bottom-nav', AuBottomNav);
