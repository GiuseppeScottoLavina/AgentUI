/**
 * @fileoverview au-dropdown - MD3 Select Menu Component  Popover API)
 * Uses native Popover API for top-layer and light-dismiss.
 * 
 * MD3 Reference: https://m3.material.io/components/menus
 */

import { AuElement, define } from '../core/AuElement.js';
import { escapeHTML } from '../core/utils.js';

export class AuDropdown extends AuElement {
    static baseClass = 'au-dropdown';
    static cssFile = 'input';
    static observedAttributes = ['placeholder', 'value', 'disabled'];

    #menu = null;
    #trigger = null;
    #options = []; // Store options data

    connectedCallback() {
        super.connectedCallback();

        // Reposition on scroll/resize (Anchor API not yet baseline)
        this.listen(window, 'scroll', () => this.#updatePosition(), { capture: true, passive: true });
        this.listen(window, 'resize', () => this.#updatePosition(), { passive: true });
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.#menu?.remove();
    }

    render() {
        // Only build once - check both trigger AND menu exist
        if (this.querySelector('.au-dropdown__trigger') && this.#menu) return;

        // Use requestAnimationFrame to ensure children (au-option) are parsed
        requestAnimationFrame(() => this.#buildDropdown());
    }

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

        // Escape user-provided attributes to prevent XSS
        const safePlaceholder = escapeHTML(placeholder);

        // Generate unique ID for popover targeting
        const menuId = `au-dropdown-menu-${Math.random().toString(36).slice(2, 9)}`;

        // Accessibility attributes
        this.#trigger.setAttribute('aria-haspopup', 'listbox');
        this.#trigger.setAttribute('aria-expanded', 'false');
        this.#trigger.setAttribute('aria-label', safePlaceholder);
        this.#trigger.setAttribute('popovertarget', menuId); // Native popover trigger
        this.#trigger.innerHTML = `
            <span class="au-dropdown__value">${safePlaceholder}</span>
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

        // Apply positioning (popover uses position: fixed by default in top-layer)
        Object.assign(this.#menu.style, {
            position: 'fixed',
            margin: '0', // Reset popover default margin: auto
            top: `${top}px`,
            left: `${triggerRect.left}px`,
            width: `${triggerRect.width}px`,
            minWidth: '160px',
            maxHeight: '280px'
        });
    }

    toggle() {
        if (this.#menu?.matches(':popover-open')) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        if (this.hasAttribute('disabled') || !this.#menu) return;
        this.#menu.showPopover(); // Native API!
    }

    close() {
        if (this.#menu?.matches(':popover-open')) {
            this.#menu.hidePopover(); // Native API!
        }
    }

    select(value, label) {
        const valueEl = this.querySelector('.au-dropdown__value');
        if (valueEl) valueEl.textContent = label;

        this.setAttribute('value', value);
        this.#menu?.querySelectorAll('.au-dropdown__option').forEach(o =>
            o.classList.toggle('is-active', o.getAttribute('data-value') === value)
        );

        this.emit('au-select', { value, label });
        this.close();
    }

    get value() { return this.getAttribute('value') || ''; }
    set value(v) { this.setAttribute('value', v); }
}

export class AuOption extends AuElement {
    static baseClass = 'au-dropdown__option';
    connectedCallback() {
        super.connectedCallback();
        this.setAttribute('role', 'option');
    }
    render() { }
}

define('au-dropdown', AuDropdown);
define('au-option', AuOption);
