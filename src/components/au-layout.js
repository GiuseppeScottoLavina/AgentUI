/**
 * @fileoverview au-layout - Material Design 3 Responsive Layout Container
 * 
 * Main layout container that orchestrates drawer, content, and bottom nav.
 * Provides responsive layout structure with proper spacing.
 * 
 * LIGHT DOM: Uses Light DOM for styling consistency.
 * Uses slot="..." attributes on children to distribute content.
 */

import { AuElement, define } from '../core/AuElement.js';

/**
 * MD3 responsive layout container orchestrating drawer, content, and bottom nav.
 *
 * @class
 * @extends AuElement
 * @element au-layout
 * @slot header - Navbar or top bar
 * @slot drawer - `<au-drawer>` navigation
 * @slot footer - Footer content
 * @slot bottom - `<au-bottom-nav>` for mobile
 * @slot default - Main page content
 */
export class AuLayout extends AuElement {
    /** @type {string[]} */
    static get observedAttributes() {
        return ['has-drawer', 'has-bottom-nav', 'full-bleed'];
    }

    static baseClass = 'au-layout';
    static cssFile = 'layout';
    // Disable containment - .au-layout-drawer uses position:fixed on mobile
    static useContainment = false;


    constructor() {
        super();
    }

    /** @override */
    connectedCallback() {
        // Capture slotted children before render
        if (!this._slotsCaptured) {
            this._slots = {
                header: this.querySelector('[slot="header"]'),
                drawer: this.querySelector('[slot="drawer"]'),
                footer: this.querySelector('[slot="footer"]'),
                bottom: this.querySelector('[slot="bottom"]'),
                default: Array.from(this.children).filter(c => !c.hasAttribute('slot'))
            };
            this._slotsCaptured = true;
        }
        super.connectedCallback();
        this._setupScrollReset();
        this._updateLayout();
        // Defer a re-check: child components like au-bottom-nav[hide-on-desktop]
        // set display:none in their own connectedCallback, which may run after ours.
        if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(() => {
                this._recheckBottomNav();
                this._checkPaddingIntegrity();
            });
        }
    }

    /** @override */
    disconnectedCallback() {
        super.disconnectedCallback();
        // Listener cleanup handled by AuElement AbortController
    }

    /** @private */
    _setupScrollReset() {
        // Reset content scroll when navigating to a new section
        this.listen(window, 'hashchange', () => {
            const mainContainer = this.querySelector('.au-layout-main');
            if (mainContainer) {
                mainContainer.scrollTop = 0;
            }
        });
    }

    /** @private */
    _updateLayout() {
        const hasDrawer = this._slots.drawer !== null;
        const hasBottomNav = this._slots.bottom !== null;

        this.toggleAttribute('has-drawer', hasDrawer);
        this.toggleAttribute('has-bottom-nav', hasBottomNav);
    }

    /**
     * Re-check bottom-nav visibility after child components have initialized.
     * @private
     */
    _recheckBottomNav() {
        const bottomNav = this._slots.bottom;
        if (!bottomNav) return;
        const isVisible = getComputedStyle(bottomNav).display !== 'none';
        this.toggleAttribute('has-bottom-nav', isVisible);
    }

    /**
     * Warn if user CSS overrides bottom-nav padding on `.au-layout-content`.
     * @private
     */
    _checkPaddingIntegrity() {
        if (!this.hasAttribute('has-bottom-nav')) return;
        // When full-bleed is active, .au-layout-main height already compensates
        // for bottom-nav — padding-bottom: 0 is intentional, not an error.
        if (this.hasAttribute('full-bleed')) return;
        const content = this.querySelector('.au-layout-content');
        if (!content) return;
        // getComputedStyle must be called as window.getComputedStyle() —
        // extracting it to a variable throws "Illegal invocation" in browsers.
        const win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null);
        if (!win || typeof win.getComputedStyle !== 'function') return;
        const pad = parseFloat(win.getComputedStyle(content).paddingBottom);
        if (isNaN(pad)) return;
        if (pad < 60) {
            // Before warning, check if a direct child has sufficient padding-bottom.
            // Common pattern: <main class="app-main" style="padding-bottom: 96px">
            // inside .au-layout-content — content is NOT hidden in this case.
            const children = content.children;
            for (let i = 0; i < children.length; i++) {
                const childPad = parseFloat(win.getComputedStyle(children[i]).paddingBottom);
                if (!isNaN(childPad) && childPad >= 60) return; // child handles it
            }
            console.warn(
                '[au-layout] ⚠️ padding-bottom on .au-layout-content is ' + pad + 'px, ' +
                'but has-bottom-nav is active — content may be hidden behind the bottom nav.\n' +
                'Fix: use <au-layout full-bleed> instead of overriding padding manually.'
            );
        }
    }

    /** @override */
    render() {
        // Build layout structure with DOM manipulation
        this.innerHTML = '';

        // Layout wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'au-layout-wrapper';

        // Header
        const headerContainer = document.createElement('header');
        headerContainer.className = 'au-layout-header';
        if (this._slots.header) {
            headerContainer.appendChild(this._slots.header);
        }
        wrapper.appendChild(headerContainer);

        // Layout body (drawer + main)
        const body = document.createElement('div');
        body.className = 'au-layout-body';

        // Drawer container
        const drawerContainer = document.createElement('aside');
        drawerContainer.className = 'au-layout-drawer';
        if (this._slots.drawer) {
            drawerContainer.appendChild(this._slots.drawer);
        }
        body.appendChild(drawerContainer);

        // Main container
        const mainContainer = document.createElement('div');
        mainContainer.className = 'au-layout-main';

        const content = document.createElement('main');
        content.className = 'au-layout-content';
        if (this._slots.default) {
            this._slots.default.forEach(child => content.appendChild(child));
        }
        mainContainer.appendChild(content);
        body.appendChild(mainContainer);

        wrapper.appendChild(body);

        // Footer
        const footerContainer = document.createElement('footer');
        footerContainer.className = 'au-layout-footer';
        if (this._slots.footer) {
            footerContainer.appendChild(this._slots.footer);
        }
        wrapper.appendChild(footerContainer);

        this.appendChild(wrapper);

        // Bottom nav container (outside wrapper, fixed)
        const bottomContainer = document.createElement('div');
        bottomContainer.className = 'au-layout-bottom';
        if (this._slots.bottom) {
            bottomContainer.appendChild(this._slots.bottom);
        }
        this.appendChild(bottomContainer);
    }
}

define('au-layout', AuLayout);
