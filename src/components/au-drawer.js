/**
 * au-drawer.js - Material Design 3 Adaptive Navigation Drawer
 * 
 * Responsive drawer that adapts to screen size:
 * - Desktop: Expanded rail or standard drawer
 * - Tablet: Collapsed rail
 * - Mobile: Hidden, opens as modal overlay
 * 
 * Follows MD3 Navigation Drawer/Rail specifications.
 * LIGHT DOM: Uses Light DOM for styling consistency.
 */

import { AuElement, define } from '../core/AuElement.js';
import { breakpoints } from '../core/breakpoints.js';
import { keyboard } from '../core/keyboard.js';

export class AuDrawer extends AuElement {
    static get observedAttributes() {
        return ['mode', 'open', 'expand-on-hover', 'position'];
    }

    static baseClass = 'au-drawer';
    static cssFile = 'drawer';
    // CRITICAL: Disable containment - it creates containing block for fixed children
    // causing the nav with position:fixed to inherit 0 height from the host
    static useContainment = false;


    constructor() {
        super();
        this._currentMode = 'expanded'; // expanded | rail | hidden
        this._isHovering = false;
        this._unsubscribe = null;
    }

    // Modes: auto | permanent | temporary | rail
    get mode() { return this.getAttribute('mode') || 'auto'; }
    set mode(v) { this.setAttribute('mode', v); }

    get open() { return this.hasAttribute('open'); }
    set open(v) { this.toggleAttribute('open', Boolean(v)); }

    get expandOnHover() { return this.hasAttribute('expand-on-hover'); }
    set expandOnHover(v) { this.toggleAttribute('expand-on-hover', Boolean(v)); }

    get position() { return this.getAttribute('position') || 'start'; }
    set position(v) { this.setAttribute('position', v); }

    connectedCallback() {
        // Capture slotted children before render
        if (!this._slotsCaptured) {
            this._slots = {
                header: this.querySelector('[slot="header"]'),
                footer: this.querySelector('[slot="footer"]'),
                default: Array.from(this.children).filter(c => !c.hasAttribute('slot'))
            };
            this._slotsCaptured = true;
        }
        super.connectedCallback();
        this._setupBreakpointListener();
        this._setupListeners();
        // Force immediate mode application
        this._forceUpdateMode();
    }

    /**
     * Calculate the initial display mode based on current breakpoints
     */
    _getInitialMode() {
        const mode = this.mode;
        const isCompact = breakpoints.isCompact;
        const isMedium = breakpoints.isMedium;

        if (mode === 'permanent') {
            return 'expanded';
        } else if (mode === 'temporary') {
            return 'hidden';
        } else if (mode === 'rail') {
            return isCompact ? 'hidden' : 'rail';
        } else {
            // Auto mode
            if (isCompact) {
                return 'hidden';
            } else if (isMedium) {
                return 'rail';
            } else {
                return 'expanded';
            }
        }
    }

    _forceUpdateMode() {
        this._currentMode = this._getInitialMode();
        this._applyMode();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this._unsubscribe) {
            this._unsubscribe();
            this._unsubscribe = null;
        }
        // Clean up ESC handler
        this._unsubEsc?.();
        this._unsubEsc = null;
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (!this.isConnected) return;

        if (name === 'open') {
            this._updateOpenState();
        } else if (name === 'mode') {
            this._updateMode();
        }
    }

    _setupBreakpointListener() {
        // Subscribe to centralized breakpoint changes
        this._unsubscribe = breakpoints.subscribe(() => {
            this._updateMode();
        });
    }

    _updateMode() {
        const mode = this.mode;
        const isCompact = breakpoints.isCompact;
        const isMedium = breakpoints.isMedium;

        let newMode;

        if (mode === 'permanent') {
            newMode = 'expanded';
        } else if (mode === 'temporary') {
            newMode = 'hidden';
        } else if (mode === 'rail') {
            newMode = isCompact ? 'hidden' : 'rail';
        } else {
            // Auto mode
            if (isCompact) {
                newMode = 'hidden';
            } else if (isMedium) {
                newMode = 'rail';
            } else {
                newMode = 'expanded';
            }
        }

        if (newMode !== this._currentMode) {
            this._currentMode = newMode;
            this._applyMode();
        }
    }

    _applyMode() {
        const drawer = this.querySelector('.au-drawer-nav');
        if (!drawer) return;

        drawer.classList.remove('au-drawer-mode-expanded', 'au-drawer-mode-rail', 'au-drawer-mode-hidden');
        drawer.classList.add(`au-drawer-mode-${this._currentMode}`);

        // Update child items for rail mode
        const items = this.querySelectorAll('au-drawer-item');
        items.forEach(item => {
            if (this._currentMode === 'rail' && !this._isHovering) {
                item.setAttribute('hide-label', '');
            } else {
                item.removeAttribute('hide-label');
            }
        });

        // When switching to expanded/rail mode, auto-close drawer and hide scrim
        if (this._currentMode !== 'hidden') {
            this.open = false;
            this._hideScrim();
            // Clean up ESC handler
            this._unsubEsc?.();
            this._unsubEsc = null;
        } else if (!this.open) {
            // Hidden mode but drawer is closed - ensure scrim is hidden
            this._hideScrim();
        }
    }

    _setupListeners() {
        // Scrim click to close
        const scrim = this.querySelector('.au-drawer-scrim');
        if (scrim) {
            this.listen(scrim, 'click', () => {
                this.open = false;
            });
        }

        // Expand on hover for rail mode
        const drawer = this.querySelector('.au-drawer-nav');
        if (drawer && this.expandOnHover) {
            this.listen(drawer, 'mouseenter', () => {
                if (this._currentMode === 'rail') {
                    this._isHovering = true;
                    drawer.classList.add('au-drawer-expanded-hover');
                    this._applyMode();
                }
            });

            this.listen(drawer, 'mouseleave', () => {
                if (this._currentMode === 'rail') {
                    this._isHovering = false;
                    drawer.classList.remove('au-drawer-expanded-hover');
                    this._applyMode();
                }
            });
        }

        // Listen for nav item selection
        this.listen(this, 'au-nav-select', (e) => {
            // On mobile, close drawer after selection
            if (this._currentMode === 'hidden' && this.open) {
                this.open = false;
            }
            // Update active states
            this._updateActiveItem(e.detail.item);
        });

        // Initialize ESC handler tracker
        this._unsubEsc = null;
    }

    _updateActiveItem(selectedItem) {
        const items = this.querySelectorAll('au-drawer-item');
        items.forEach(item => {
            item.active = (item === selectedItem);
        });
    }

    _updateOpenState() {
        const drawer = this.querySelector('.au-drawer-nav');

        if (this.open) {
            drawer?.classList.add('au-drawer-open');
            if (this._currentMode === 'hidden') {
                this._showScrim();
                // Register ESC handler when opening in hidden (modal) mode
                this._unsubEsc = keyboard.pushEscapeHandler(this, () => {
                    this.open = false;
                });
            }
        } else {
            drawer?.classList.remove('au-drawer-open');
            this._hideScrim();
            // Unregister ESC handler when closing
            this._unsubEsc?.();
            this._unsubEsc = null;
        }
    }

    _showScrim() {
        const scrim = this.querySelector('.au-drawer-scrim');
        if (scrim) {
            scrim.classList.add('au-drawer-scrim-visible');
        }
    }

    _hideScrim() {
        const scrim = this.querySelector('.au-drawer-scrim');
        if (scrim) {
            scrim.classList.remove('au-drawer-scrim-visible');
        }
    }

    toggle() {
        this.open = !this.open;
    }

    render() {
        // Build DOM structure
        this.innerHTML = '';

        // Scrim (for modal mode)
        const scrim = document.createElement('div');
        scrim.className = 'au-drawer-scrim';
        this.appendChild(scrim);

        // Nav drawer
        const nav = document.createElement('nav');
        nav.className = `au-drawer-nav au-drawer-mode-${this._getInitialMode()}`;
        nav.setAttribute('role', 'navigation');

        // Header
        const header = document.createElement('div');
        header.className = 'au-drawer-header';
        if (this._slots.header) {
            header.appendChild(this._slots.header);
        }
        nav.appendChild(header);

        // Content (default slot)
        const content = document.createElement('div');
        content.className = 'au-drawer-content';
        content.setAttribute('role', 'menu'); // ARIA: menuitem children require menu parent
        if (this._slots.default) {
            this._slots.default.forEach(child => content.appendChild(child));
        }
        nav.appendChild(content);

        // Footer
        if (this._slots.footer) {
            nav.appendChild(this._slots.footer);
        }

        this.appendChild(nav);
    }
}

if (!customElements.get('au-drawer')) {
    customElements.define('au-drawer', AuDrawer);
}
