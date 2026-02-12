/**
 * au-drawer-item.js - Material Design 3 Drawer/Nav Item Component
 * 
 * Navigation item for drawer (horizontal layout) and bottom navigation (vertical).
 * Follows MD3 Navigation Drawer/Rail/Bar item specifications.
 * 
 * LIGHT DOM: This component uses Light DOM for styling consistency.
 * Uses 'label' attribute or text content for the label.
 */

import { AuElement, define } from '../core/AuElement.js';
import { escapeHTML } from '../core/utils.js';
// Import AuIcon to ensure it's registered
import './au-icon.js';

export class AuDrawerItem extends AuElement {
    static get observedAttributes() {
        return ['icon', 'href', 'active', 'badge', 'disabled', 'layout', 'label'];
    }

    static baseClass = 'au-drawer-item';
    static cssFile = 'drawer-item';


    constructor() {
        super();
        // Immediately capture text content from child nodes SYNCHRONOUSLY
        // This runs before connectedCallback and before any render
        // Must be synchronous because microtask/setTimeout is too late
        this._capturedLabel = '';

        // Synchronously capture direct text nodes before any DOM manipulation
        const textContent = Array.from(this.childNodes)
            .filter(n => n.nodeType === Node.TEXT_NODE)
            .map(n => n.textContent.trim())
            .join('')
            .trim();

        if (textContent) {
            this._capturedLabel = textContent;
        }
    }

    get icon() { return this.getAttribute('icon') || ''; }
    set icon(v) { this.setAttribute('icon', v); }

    get href() { return this.getAttribute('href') || ''; }
    set href(v) { this.setAttribute('href', v); }

    get active() { return this.hasAttribute('active'); }
    set active(v) { this.toggleAttribute('active', Boolean(v)); }

    get badge() { return this.getAttribute('badge'); }
    set badge(v) { v ? this.setAttribute('badge', v) : this.removeAttribute('badge'); }

    get disabled() { return this.hasAttribute('disabled'); }
    set disabled(v) { this.toggleAttribute('disabled', Boolean(v)); }

    // Layout: 'horizontal' (default for drawer) or 'vertical' (for bottom-nav)
    get layout() { return this.getAttribute('layout') || 'horizontal'; }
    set layout(v) { this.setAttribute('layout', v); }

    // Label getter - uses attribute or captured text
    get label() { return this.getAttribute('label') || this._capturedLabel || ''; }
    set label(v) { this.setAttribute('label', v); }

    connectedCallback() {
        // If label attribute already exists, capture it
        if (!this._capturedLabel && this.hasAttribute('label')) {
            this._capturedLabel = this.getAttribute('label');
        }
        // Final attempt to capture text if still empty
        if (!this._capturedLabel && !this.hasAttribute('label')) {
            this._capturedLabel = this.textContent.trim();
            if (this._capturedLabel) {
                this.setAttribute('label', this._capturedLabel);
            }
        }
        super.connectedCallback();
        this._setupListeners();

        // Keyboard accessibility
        this.setAttribute('tabindex', '0');
        this.setAttribute('role', 'menuitem');
        this.setupActivation(() => this._handleClick(new MouseEvent('click')));
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue && this.isConnected) {
            this.render();
        }
    }

    _setupListeners() {
        this.listen(this, 'click', this._handleClick.bind(this));
    }

    _handleClick(e) {
        if (this.disabled) {
            e.preventDefault();
            return;
        }

        if (this.href) {
            // Hash navigation
            if (this.href.startsWith('#')) {
                e.preventDefault();
                window.location.hash = this.href;
            }
            // Let regular links work normally
        }

        // Dispatch selection event for parent drawer/nav to handle
        this.emit('au-nav-select', { href: this.href, item: this }, { bubbles: true, composed: true });
    }

    render() {
        // Use label prop (getter handles fallback logic)
        const labelText = escapeHTML(this.label);
        const hasLabel = labelText.length > 0;
        const badgeHtml = this.badge ? `<span class="au-drawer-item-badge">${escapeHTML(this.badge)}</span>` : '';
        const tag = this.href ? 'a' : 'button';
        const hrefAttr = this.href ? `href="${escapeHTML(this.href)}"` : '';
        const disabledAttr = this.disabled ? (this.href ? 'aria-disabled="true"' : 'disabled') : '';
        // A11Y: Always add aria-label for screen readers - ensures link/button is identifiable
        // even when label is visually separate or hidden in collapsed drawer
        const ariaLabel = labelText ? `aria-label="${labelText}"` : '';

        this.innerHTML = `
            <${tag} class="au-drawer-item-link" ${hrefAttr} ${disabledAttr} ${ariaLabel}>
                <span class="au-drawer-item-icon">
                    <au-icon name="${escapeHTML(this.icon)}" size="24"></au-icon>
                </span>
                ${hasLabel ? `<span class="au-drawer-item-label" aria-hidden="true">${labelText}</span>` : ''}
                ${badgeHtml}
            </${tag}>
        `;
    }
}

// Also export as au-nav-item alias for bottom navigation
export { AuDrawerItem as AuNavItem };

if (!customElements.get('au-drawer-item')) {
    customElements.define('au-drawer-item', AuDrawerItem);
}

// Register alias - au-nav-item defaults to vertical layout
if (!customElements.get('au-nav-item')) {
    customElements.define('au-nav-item', class extends AuDrawerItem {
        connectedCallback() {
            // Set vertical layout by default for bottom-nav items
            if (!this.hasAttribute('layout')) {
                this.setAttribute('layout', 'vertical');
            }
            super.connectedCallback();
        }
    });
}
