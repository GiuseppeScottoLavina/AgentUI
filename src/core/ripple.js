/**
 * @fileoverview MD3 Ripple Effect Utility
 * 
 * Creates Material Design 3 compliant ripple effects on interactive elements.
 * The ripple originates from the exact click/touch point and expands outward.
 * 
 * Usage:
 *   import { attachRipple } from './core/ripple.js';
 *   attachRipple(element);
 * 
 * Or for controlled ripple:
 *   import { createRipple } from './core/ripple.js';
 *   element.addEventListener('click', (e) => createRipple(element, e));
 */

/**
 * Create a ripple effect at the event position within the element.
 * MD3 behavior: ripple expands immediately, persists while pressed, fades on release.
 * @param {HTMLElement} element - Container element for the ripple
 * @param {MouseEvent|TouchEvent} event - The triggering event
 * @param {Object} options - Ripple options
 * @param {string} options.color - Ripple color (default: currentColor)
 * @param {boolean} options.centered - Force ripple to start from center
 */
export function createRipple(element, event, options = {}) {
    const { color = 'currentColor', centered = false } = options;

    // Get element bounds
    const rect = element.getBoundingClientRect();

    // Calculate ripple position (from click point or center)
    let x, y;
    if (centered || !event) {
        x = rect.width / 2;
        y = rect.height / 2;
    } else {
        // Get click/touch position
        const clientX = event.touches ? event.touches[0].clientX : event.clientX;
        const clientY = event.touches ? event.touches[0].clientY : event.clientY;
        x = clientX - rect.left;
        y = clientY - rect.top;
    }

    // Calculate ripple size (must cover entire element from click point)
    const size = Math.max(
        Math.hypot(x, y),
        Math.hypot(rect.width - x, y),
        Math.hypot(x, rect.height - y),
        Math.hypot(rect.width - x, rect.height - y)
    ) * 2;

    // Create ripple element
    const ripple = document.createElement('span');
    ripple.className = 'au-ripple-wave';
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x - size / 2}px;
        top: ${y - size / 2}px;
        background: ${color};
        border-radius: 50%;
        transform: scale(0);
        opacity: 0.10;
        pointer-events: none;
    `;

    // Positioning now set at attachRipple time (P1.6 perf fix — no getComputedStyle per click)

    // Add ripple to element
    element.appendChild(ripple);

    // Phase 1: Expand animation (GPU - transform only)
    ripple.animate([
        { transform: 'scale(0)' },
        { transform: 'scale(1)' }
    ], {
        duration: 300,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fill: 'forwards'
    });

    // Phase 2: Fade out on release (pointer up or leave)
    const fadeOut = () => {
        ripple.animate([
            { opacity: '0.10' },
            { opacity: '0' }
        ], {
            duration: 150,
            easing: 'ease-out',
            fill: 'forwards'
        }).onfinish = () => ripple.remove();

        // Cleanup listeners
        element.removeEventListener('pointerup', fadeOut);
        element.removeEventListener('pointerleave', fadeOut);
        element.removeEventListener('pointercancel', fadeOut);
    };

    element.addEventListener('pointerup', fadeOut, { once: true });
    element.addEventListener('pointerleave', fadeOut, { once: true });
    element.addEventListener('pointercancel', fadeOut, { once: true });

    return ripple;
}

/** @type {WeakSet<HTMLElement>} Tracks elements with ripple attached */
const _rippleElements = new WeakSet();

/**
 * Attach ripple effect to an element.
 * @param {HTMLElement} element - Element to attach ripple to
 * @param {Object} options - Ripple options
 * @returns {Function} Cleanup function to remove ripple listener
 */
export function attachRipple(element, options = {}) {
    // Guard: don't attach duplicate listeners
    if (_rippleElements.has(element)) {
        return () => { }; // no-op cleanup (original cleanup is still valid)
    }
    _rippleElements.add(element);

    // Set positioning ONCE at attach time (P1.6 perf fix — avoids getComputedStyle per click)
    const cs = getComputedStyle(element);
    if (cs.position === 'static') element.style.position = 'relative';
    if (cs.overflow !== 'hidden') element.style.overflow = 'hidden';

    const handler = (e) => {
        // Don't create ripple if element is disabled
        if (element.hasAttribute('disabled')) return;
        createRipple(element, e, options);
    };

    element.addEventListener('pointerdown', handler);

    // Return cleanup function
    return () => {
        _rippleElements.delete(element);
        element.removeEventListener('pointerdown', handler);
    };
}

/**
 * Mixin for components that need ripple.
 * Call this.initRipple(targetElement) in connectedCallback.
 */
export const RippleMixin = (superclass) => class extends superclass {
    #rippleCleanup = null;

    /**
     * Initialize ripple on target element (or self).
     * @param {HTMLElement} target - Element to add ripple to (defaults to this)
     * @param {Object} options - Ripple options
     */
    initRipple(target = this, options = {}) {
        // Clean up previous ripple attachment if any
        if (this.#rippleCleanup) {
            this.#rippleCleanup();
            this.#rippleCleanup = null;
        }
        this.#rippleCleanup = attachRipple(target, options);
    }

    disconnectedCallback() {
        if (this.#rippleCleanup) {
            this.#rippleCleanup();
            this.#rippleCleanup = null;
        }
        super.disconnectedCallback?.();
    }
};
