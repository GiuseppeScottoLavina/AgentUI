/**
 * @fileoverview Centralized Breakpoint System for AgentUI
 * 
 * Provides MD3-compliant responsive breakpoints with reactive subscriptions.
 * All components should use this utility for consistent responsive behavior.
 * 
 * MD3 Window Size Classes:
 * - Compact: < 600px (mobile phones)
 * - Medium: 600-839px (tablets, foldables)
 * - Expanded: ≥ 840px (desktop, large tablets)
 * 
 * @see https://m3.material.io/foundations/layout/applying-layout
 */

/**
 * MD3 Breakpoint values in pixels
 */
export const BREAKPOINTS = {
    /** Maximum width for compact (mobile) layout */
    compact: 600,
    /** Maximum width for medium (tablet) layout */
    medium: 840,
    /** Minimum width for expanded (desktop) layout */
    expanded: 840
};

/**
 * Breakpoint size class names
 * @typedef {'compact' | 'medium' | 'expanded'} BreakpointClass
 */

/**
 * Callback function type for breakpoint changes
 * @typedef {(breakpoint: BreakpointClass) => void} BreakpointCallback
 */

/**
 * Reactive observer for MD3 responsive breakpoints.
 * Uses MediaQueryList listeners for efficient change detection.
 *
 * @class
 */
class BreakpointObserver {
    /** @type {Set<BreakpointCallback>} */
    #listeners = new Set();

    /** @type {BreakpointClass} */
    #current = 'expanded';

    /** @type {MediaQueryList|null} */
    #mqCompact = null;

    /** @type {MediaQueryList|null} */
    #mqMedium = null;

    constructor() {
        if (typeof window !== 'undefined') {
            this.#setupMediaQueries();
        }
    }

    /**
     * Set up media query listeners
     * @private
     */
    #setupMediaQueries() {
        // Compact: < 600px
        this.#mqCompact = window.matchMedia(`(max-width: ${BREAKPOINTS.compact - 1}px)`);
        this.#mqCompact.addEventListener('change', this.#handleChange);

        // Medium: 600-839px
        this.#mqMedium = window.matchMedia(
            `(min-width: ${BREAKPOINTS.compact}px) and (max-width: ${BREAKPOINTS.medium - 1}px)`
        );
        this.#mqMedium.addEventListener('change', this.#handleChange);

        // Set initial value
        this.#updateCurrent();
    }

    /**
     * Handle media query change events
     * @private
     */
    #handleChange = () => {
        const oldValue = this.#current;
        this.#updateCurrent();

        if (oldValue !== this.#current) {
            this.#notifyListeners();
        }
    };

    /**
     * Update current breakpoint based on media queries
     * @private
     */
    #updateCurrent() {
        if (this.#mqCompact?.matches) {
            this.#current = 'compact';
        } else if (this.#mqMedium?.matches) {
            this.#current = 'medium';
        } else {
            this.#current = 'expanded';
        }
    }

    /**
     * Notify all listeners of breakpoint change
     * @private
     */
    #notifyListeners() {
        this.#listeners.forEach(callback => {
            try {
                callback(this.#current);
            } catch (e) {
                console.error('[Breakpoints] Listener error:', e);
            }
        });
    }

    /**
     * Get current breakpoint class (live query)
     * @returns {BreakpointClass}
     */
    get current() {
        // Always query live for most accurate state
        if (this.#mqCompact?.matches) {
            return 'compact';
        } else if (this.#mqMedium?.matches) {
            return 'medium';
        }
        return 'expanded';
    }

    /**
     * Check if currently in compact (mobile) mode
     * @returns {boolean}
     */
    get isCompact() {
        return this.#mqCompact?.matches ?? false;
    }

    /**
     * Check if currently in medium (tablet) mode
     * @returns {boolean}
     */
    get isMedium() {
        return this.#mqMedium?.matches ?? false;
    }

    /**
     * Check if currently in expanded (desktop) mode
     * @returns {boolean}
     */
    get isExpanded() {
        return !this.isCompact && !this.isMedium;
    }

    /**
     * Check if NOT in compact mode (medium or expanded)
     * @returns {boolean}
     */
    get isNotCompact() {
        return !this.isCompact;
    }

    /**
     * Subscribe to breakpoint changes
     * @param {BreakpointCallback} callback - Called with new breakpoint class on change
     * @returns {() => void} Unsubscribe function
     */
    subscribe(callback) {
        this.#listeners.add(callback);

        // Call immediately with current value
        callback(this.#current);

        // Return unsubscribe function
        return () => {
            this.#listeners.delete(callback);
        };
    }

    /**
     * Get window width in pixels (for testing/debugging)
     * @returns {number}
     */
    get windowWidth() {
        return typeof window !== 'undefined' ? window.innerWidth : 1200;
    }

    /**
     * Destroy the observer and remove all listeners
     */
    destroy() {
        if (this.#mqCompact) {
            this.#mqCompact.removeEventListener('change', this.#handleChange);
            this.#mqCompact = null;
        }
        if (this.#mqMedium) {
            this.#mqMedium.removeEventListener('change', this.#handleChange);
            this.#mqMedium = null;
        }
        this.#listeners.clear();
        this.#current = 'expanded';
    }
}

/**
 * Global breakpoint observer singleton
 * @type {BreakpointObserver}
 */
export const breakpoints = new BreakpointObserver();

// Also expose class for testing
export { BreakpointObserver };
