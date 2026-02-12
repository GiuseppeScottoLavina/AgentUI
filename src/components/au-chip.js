/**
 * @fileoverview au-chip - Chip/Tag Component (MD3)
 * 
 * Usage:
 * <au-chip>Tag</au-chip>
 * <au-chip selected>Selected</au-chip>
 * <au-chip removable>Removable</au-chip>
 * <au-chip static>Display only (non-interactive badge)</au-chip>
 */

import { AuElement, define } from '../core/AuElement.js';
import { createRipple } from '../core/ripple.js';
import { escapeHTML } from '../core/utils.js';

export class AuChip extends AuElement {
    static baseClass = 'au-chip';
    static cssFile = null; // CSS is inline/JS only
    static observedAttributes = ['selected', 'removable', 'variant', 'static'];

    #originalLabel = null;

    /**
     * Self-documenting component for AI agents
     */

    connectedCallback() {
        super.connectedCallback();

        // Store original label before render
        if (!this.#originalLabel && !this.querySelector('.au-chip__label')) {
            this.#originalLabel = this.textContent.trim();
        }

        // Static mode: no interactivity
        if (this.has('static')) {
            this.render();
            return;
        }

        // Interactive mode: keyboard accessibility
        this.setAttribute('tabindex', '0');
        this.setAttribute('role', 'button');
        this.setupActivation(() => {
            if (!this.has('removable')) {
                this.toggle();
            }
        });

        this.listen(this, 'pointerdown', (e) => {
            if (!e.target.closest('.au-chip__remove')) {
                createRipple(this, e);
            }
        });

        this.listen(this, 'click', (e) => {
            if (e.target.closest('.au-chip__remove')) {
                this.emit('au-remove');
                this.remove();
            } else if (!this.has('removable')) {
                this.toggle();
            }
        });
    }

    render() {
        // Idempotent: skip if already rendered
        if (this.querySelector('.au-chip__label')) {
            this.#updateStyles();
            return;
        }

        const label = this.#originalLabel || this.textContent.trim();
        const removable = this.has('removable') && !this.has('static'); // No remove button in static mode

        this.innerHTML = `
            <span class="au-chip__label">${escapeHTML(label)}</span>
            ${removable ? '<button class="au-chip__remove" aria-label="Remove">✕</button>' : ''}
        `;

        this.#updateStyles();
    }

    update(attr, newValue, oldValue) {
        this.#updateStyles();
    }

    #updateStyles() {
        const isSelected = this.has('selected');
        const isStatic = this.has('static');
        const variant = this.attr('variant', 'outlined');

        this.style.display = 'inline-flex';
        this.style.alignItems = 'center';
        this.style.gap = '4px';
        this.style.padding = '8px 16px';  /* MD3: 32dp height, 16dp horizontal */
        this.style.borderRadius = '8px';
        this.style.fontSize = 'var(--md-sys-typescale-label-large-size, 14px)';
        this.style.userSelect = 'none';
        this.style.transition = 'all var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard)';

        // Static mode: no pointer cursor
        this.style.cursor = isStatic ? 'default' : 'pointer';

        if (variant === 'filled' || isSelected) {
            this.style.background = isSelected
                ? 'var(--md-sys-color-secondary-container)'
                : 'var(--md-sys-color-surface-container-high)';
            this.style.color = isSelected
                ? 'var(--md-sys-color-on-secondary-container)'
                : 'var(--md-sys-color-on-surface)';
            this.style.border = '1px solid transparent'; // MD3: transparent border prevents layout shift
        } else {
            this.style.background = 'transparent';
            this.style.color = 'var(--md-sys-color-on-surface)';
            this.style.border = '1px solid var(--md-sys-color-outline)';
        }

        const removeBtn = this.querySelector('.au-chip__remove');
        if (removeBtn) {
            removeBtn.style.background = 'none';
            removeBtn.style.border = 'none';
            removeBtn.style.padding = '0';
            removeBtn.style.marginLeft = '4px';
            removeBtn.style.cursor = 'pointer';
            removeBtn.style.color = 'inherit';
            removeBtn.style.opacity = '0.7';
        }
    }

    toggle() {
        // Static chips don't toggle
        if (this.has('static')) return;

        if (this.has('selected')) {
            this.removeAttribute('selected');
        } else {
            this.setAttribute('selected', '');
        }
        this.emit('au-change', { selected: this.has('selected') });
    }
}

define('au-chip', AuChip);
