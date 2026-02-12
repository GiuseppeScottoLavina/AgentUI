/**
 * @fileoverview au-tooltip - MD3 Tooltip Component
 * Uses portal pattern with Floating UI-style positioning
 */

import { AuElement, define } from '../core/AuElement.js';

/** Gap between tooltip and trigger element (MD3 spec: 8px) */
const TOOLTIP_GAP = 8;

export class AuTooltip extends AuElement {
    static baseClass = 'au-tooltip';
    static cssFile = 'tooltip';
    static observedAttributes = ['content', 'position'];


    #tooltip = null;

    connectedCallback() {
        super.connectedCallback();

        this.listen(this, 'mouseenter', () => this.show());
        this.listen(this, 'mouseleave', () => this.hide());
        this.listen(this, 'focus', () => this.show(), { capture: true });
        this.listen(this, 'blur', () => this.hide(), { capture: true });
    }

    render() {
        const position = this.attr('position', 'top');

        const baseClasses = ['au-tooltip', `au-tooltip--${position}`];
        baseClasses.forEach(cls => this.classList.add(cls));
        Array.from(this.classList).forEach(cls => {
            if (cls.startsWith('au-tooltip--') && !baseClasses.includes(cls)) {
                this.classList.remove(cls);
            }
        });

        this.style.position = 'relative';
        this.style.display = 'inline-block';
    }

    update(attr, newValue, oldValue) {
        if (attr === 'position') {
            const position = this.attr('position', 'top');

            const baseClasses = ['au-tooltip', `au-tooltip--${position}`];
            baseClasses.forEach(cls => this.classList.add(cls));
            Array.from(this.classList).forEach(cls => {
                if (cls.startsWith('au-tooltip--') && !baseClasses.includes(cls)) {
                    this.classList.remove(cls);
                }
            });
        }
    }

    show() {
        if (this.#tooltip) return;

        const content = this.attr('content', '');
        if (!content) return;

        const position = this.attr('position', 'top');

        // Create tooltip element
        this.#tooltip = document.createElement('div');
        this.#tooltip.className = `au-tooltip__content au-tooltip__content--${position}`;
        this.#tooltip.textContent = content;
        this.#tooltip.setAttribute('role', 'tooltip');

        // Initial styles for measurement - CRITICAL: override CSS transforms
        this.#tooltip.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            transform: none !important;
            visibility: hidden;
            z-index: var(--au-z-tooltip, 9999);
            pointer-events: none;
            margin: 0 !important;
        `;

        // Portal: append to body
        document.body.appendChild(this.#tooltip);

        // Calculate and apply position
        this.#computePosition(position);

        // Trigger visibility
        requestAnimationFrame(() => {
            if (this.#tooltip) {
                this.#tooltip.style.visibility = 'visible';
                this.#tooltip.style.opacity = '1';
            }
        });
    }

    /**
     *  positioning logic inspired by Floating UI
     * Uses fixed positioning for viewport-relative placement
     */
    #computePosition(placement) {
        const triggerRect = this.getBoundingClientRect();
        const tooltipRect = this.#tooltip.getBoundingClientRect();

        let { x, y } = this.#getCoordinates(placement, triggerRect, tooltipRect);

        // Viewport boundary detection and auto-flip
        const finalPlacement = this.#autoFlip(placement, x, y, tooltipRect, triggerRect);

        if (finalPlacement !== placement) {
            ({ x, y } = this.#getCoordinates(finalPlacement, triggerRect, tooltipRect));
        }

        // Clamp to viewport edges
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        x = Math.max(4, Math.min(x, viewportWidth - tooltipRect.width - 4));
        y = Math.max(4, Math.min(y, viewportHeight - tooltipRect.height - 4));

        // Apply final position with !important to override CSS
        this.#tooltip.style.setProperty('left', `${x}px`, 'important');
        this.#tooltip.style.setProperty('top', `${y}px`, 'important');
    }

    /**
     * Calculate x,y coordinates for a given placement
     */
    #getCoordinates(placement, triggerRect, tooltipRect) {
        let x, y;

        switch (placement) {
            case 'top':
                x = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
                y = triggerRect.top - tooltipRect.height - TOOLTIP_GAP;
                break;
            case 'bottom':
                x = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
                y = triggerRect.bottom + TOOLTIP_GAP;
                break;
            case 'left':
                x = triggerRect.left - tooltipRect.width - TOOLTIP_GAP;
                y = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
                break;
            case 'right':
                x = triggerRect.right + TOOLTIP_GAP;
                y = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
                break;
            default:
                x = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
                y = triggerRect.top - tooltipRect.height - TOOLTIP_GAP;
        }

        return { x, y };
    }

    /**
     * Auto-flip to opposite side if tooltip overflows viewport
     */
    #autoFlip(placement, x, y, tooltipRect, triggerRect) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        switch (placement) {
            case 'top':
                if (y < 0) return 'bottom';
                break;
            case 'bottom':
                if (y + tooltipRect.height > viewportHeight) return 'top';
                break;
            case 'left':
                if (x < 0) return 'right';
                break;
            case 'right':
                if (x + tooltipRect.width > viewportWidth) return 'left';
                break;
        }

        return placement;
    }

    hide() {
        if (this.#tooltip) {
            this.#tooltip.remove();
            this.#tooltip = null;
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.hide();
    }
}

define('au-tooltip', AuTooltip);


