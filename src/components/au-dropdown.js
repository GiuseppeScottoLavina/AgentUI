/**
 * @fileoverview au-dropdown - MD3 Select Menu Component  Popover API)
 * Uses native Popover API for top-layer and light-dismiss.
 * 
 * MD3 Reference: https://m3.material.io/components/menus
 */

import { AuElement, define } from '../core/AuElement.js';
import { html } from '../core/utils.js';
import { throttle } from '../core/render.js';

/**
 * MD3 Select Menu component using the native Popover API.
 *
 * @class
 * @extends AuElement
 * @element au-dropdown
 * @fires au-select - When an option is selected, detail: `{ value, label }`
 */
export class AuDropdown extends AuElement {
    static baseClass = 'au-dropdown';
    static cssFile = 'input';
    /** @type {string[]} */
    static observedAttributes = ['placeholder', 'value', 'disabled'];

    #menu = null;
    #trigger = null;
    #options = []; // Store options data
    #isSelecting = false; // Guard to prevent attributeChangedCallback loop from select()

    /** @override */
    connectedCallback() {
        super.connectedCallback();

        // P2.3 perf fix: throttle scroll/resize (was firing 60+ times/sec unthrottled)
        this.listen(window, 'scroll', throttle(() => this.#updatePosition(), 16), { capture: true, passive: true });
        this.listen(window, 'resize', throttle(() => this.#updatePosition(), 100), { passive: true });
    }

    /** @override */
    disconnectedCallback() {
        super.disconnectedCallback();
        this.#menu?.remove();
    }

    /** @override */
    attributeChangedCallback(name, oldVal, newVal) {
        if (!this.isConnected || oldVal === newVal) return;

        if (name === 'value' && newVal !== null && !this.#isSelecting) {
            // Look up the option and update displayed label (no event emission)
            const opt = this.#options.find(o => o.value === newVal);
            if (opt) {
                const valueEl = this.querySelector('.au-dropdown__value');
                if (valueEl) valueEl.textContent = opt.label;
                this.#menu?.querySelectorAll('.au-dropdown__option').forEach(o =>
                    o.classList.toggle('is-active', o.getAttribute('data-value') === newVal)
                );
            }
        }

        if (name === 'disabled') {
            const trigger = this.querySelector('.au-dropdown__trigger');
            if (trigger) trigger.disabled = this.hasAttribute('disabled');
        }
    }

    /** @override */
    render() {
        // Only build once - check both trigger AND menu exist
        if (this.querySelector('.au-dropdown__trigger') && this.#menu) return;

        // Use requestAnimationFrame to ensure children (au-option) are parsed
        requestAnimationFrame(() => this.#buildDropdown());
    }

    /** @private */
    #buildDropdown() {
        // Trigger already built?
        if (this.querySelector('.au-dropdown__trigger') && this.#menu) return;

        const placeholder = this.getAttribute('placeholder') || 'Select';

        // Save options as data BEFORE clearing
        // Support BOTH au-option AND standard HTML option tags for AI-First compatibility
        const muOptions = this.querySelectorAll('au-option');
        const htmlOptions = this.querySelectorAll('option');
        const allOptions = muOptions.length > 0 ? muOptions : htmlOptions;

        this.#options = Array.from(allOptions).map(opt => ({
            value: opt.getAttribute('value') || opt.textContent.trim(),
            label: opt.textContent.trim(),
            selected: opt.hasAttribute('selected')
        }));

        // Create trigger button
        this.#trigger = document.createElement('button');
        this.#trigger.className = 'au-dropdown__trigger';
        this.#trigger.type = 'button';

        // Generate unique ID for popover targeting
        const menuId = `au-dropdown-menu-${Math.random().toString(36).slice(2, 9)}`;

        // Accessibility attributes
        this.#trigger.setAttribute('aria-haspopup', 'listbox');
        this.#trigger.setAttribute('aria-expanded', 'false');
        this.#trigger.setAttribute('aria-label', placeholder);
        this.#trigger.setAttribute('popovertarget', menuId); // Native popover trigger
        this.#trigger.innerHTML = html`
            <span class="au-dropdown__value">${placeholder}</span>
            <svg class="au-dropdown__arrow" width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M1 1l4 4 4-4"/>
            </svg>
        `;

        // Keyboard navigation on trigger
        this.listen(this.#trigger, 'keydown', (e) => {
            if (!this.hasAttribute('disabled')) {
                if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.open();
                }
            }
        });

        // Clear and add trigger
        this.innerHTML = '';
        this.appendChild(this.#trigger);

        // Create menu with native Popover API
        this.#menu = document.createElement('div');
        this.#menu.id = menuId;
        this.#menu.className = 'au-dropdown__menu';
        this.#menu.setAttribute('popover', 'auto'); // Auto-dismiss on click outside!
        this.#menu.setAttribute('role', 'listbox');
        this.#menu.tabIndex = -1;

        // Listen for popover toggle events (native API)
        this.listen(this.#menu, 'toggle', (e) => {
            if (e.newState === 'open') {
                this.classList.add('is-open');
                this.#trigger?.setAttribute('aria-expanded', 'true');
                this.#updatePosition();
                // Focus first option
                requestAnimationFrame(() => {
                    const val = this.getAttribute('value');
                    const target = val
                        ? this.#menu.querySelector(`[data-value="${val}"]`)
                        : this.#menu.firstChild;
                    target?.focus();
                });
            } else {
                this.classList.remove('is-open');
                this.#trigger?.setAttribute('aria-expanded', 'false');
            }
        });

        // Keyboard navigation in menu
        this.listen(this.#menu, 'keydown', (e) => this.#handleMenuKey(e));

        // Build options
        this.#options.forEach(opt => {
            const el = document.createElement('div');
            el.className = 'au-dropdown__option';
            el.setAttribute('data-value', opt.value);
            el.textContent = opt.label;
            el.setAttribute('role', 'option');
            el.tabIndex = -1;
            this.listen(el, 'click', () => this.select(opt.value, opt.label));
            this.#menu.appendChild(el);
        });

        // Append menu to component (not portal - popover handles top-layer!)
        this.appendChild(this.#menu);

        // Apply initial selected value (from selected attribute on option)
        const selectedOpt = this.#options.find(o => o.selected);
        if (selectedOpt) {
            this.select(selectedOpt.value, selectedOpt.label);
        }
    }

    /** @private */
    #handleMenuKey(e) {
        const options = Array.from(this.#menu.querySelectorAll('.au-dropdown__option'));
        const current = document.activeElement;
        const idx = options.indexOf(current);

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const next = options[idx + 1] || options[0];
            next?.focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prev = options[idx - 1] || options[options.length - 1];
            prev?.focus();
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (idx >= 0) {
                const opt = this.#options[idx];
                this.select(opt.value, opt.label);
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            this.close();
            this.#trigger?.focus();
        }
    }

    /**
     * Position menu relative to trigger (Anchor Positioning not yet baseline)
     * Uses manual positioning until CSS Anchor Positioning is widely available.
     */
    #updatePosition() {
        if (!this.#menu || !this.#trigger) return;

        const triggerRect = this.#trigger.getBoundingClientRect();
        const menuHeight = this.#menu.scrollHeight || 200;
        const spaceBelow = window.innerHeight - triggerRect.bottom - 8;

        // Decide if opening above or below
        const openAbove = spaceBelow < menuHeight && triggerRect.top > menuHeight;
        const top = openAbove
            ? triggerRect.top - menuHeight - 4
            : triggerRect.bottom + 4;

        // Popover in top-layer requires position:fixed with calculated coordinates
        Object.assign(this.#menu.style, {
            position: 'fixed',
            margin: '0',
            top: `${top}px`,
            left: `${triggerRect.left}px`,
            width: `${triggerRect.width}px`,
            minWidth: '160px',
            maxHeight: '280px'
        });
    }

    /** Toggle the dropdown open/closed. */
    toggle() {
        if (this.#menu?.matches(':popover-open')) {
            this.close();
        } else {
            this.open();
        }
    }

    /** Open the dropdown menu. */
    open() {
        if (this.hasAttribute('disabled') || !this.#menu) return;
        this.#menu.showPopover(); // Native API!
    }

    /** Close the dropdown menu. */
    close() {
        if (this.#menu?.matches(':popover-open')) {
            this.#menu.hidePopover(); // Native API!
        }
    }

    /**
     * Select an option by value.
     * @param {string} value - Option value
     * @param {string} label - Option display label
     */
    select(value, label) {
        this.#isSelecting = true;
        const valueEl = this.querySelector('.au-dropdown__value');
        if (valueEl) valueEl.textContent = label;

        this.setAttribute('value', value);
        this.#menu?.querySelectorAll('.au-dropdown__option').forEach(o =>
            o.classList.toggle('is-active', o.getAttribute('data-value') === value)
        );

        this.emit('au-select', { value, label });
        this.close();
        this.#isSelecting = false;
    }

    /**
     * Current selected value.
     * @type {string}
     */
    get value() { return this.getAttribute('value') || ''; }
    /** @param {string} v */
    set value(v) { this.setAttribute('value', v); }
}

/**
 * Option element for use inside `<au-dropdown>`.
 *
 * @class
 * @extends AuElement
 * @element au-option
 */
export class AuOption extends AuElement {
    static baseClass = 'au-dropdown__option';
    /** @override */
    connectedCallback() {
        super.connectedCallback();
        this.setAttribute('role', 'option');
    }
    /** @override */
    render() { }
}

define('au-dropdown', AuDropdown);
define('au-option', AuOption);
