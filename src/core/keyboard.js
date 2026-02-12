/**
 * @fileoverview Centralized Keyboard Manager for AgentUI
 * 
 * Provides a stack-based ESC key handler for modal-like components.
 * Components register handlers when opened and unregister when closed.
 * ESC key closes the topmost component (LIFO stack).
 * 
 * @example
 * import { keyboard } from '../core/keyboard.js';
 * 
 * connectedCallback() {
 *     this._unsubEsc = keyboard.pushEscapeHandler(this, () => this.close());
 * }
 * 
 * disconnectedCallback() {
 *     this._unsubEsc?.();
 * }
 */

/**
 * @typedef {Object} EscapeEntry
 * @property {HTMLElement} element - The element that registered the handler
 * @property {() => void} callback - Function to call on ESC
 */

class KeyboardManager {
    /** @type {EscapeEntry[]} */
    #escapeStack = [];

    /** @type {boolean} */
    #initialized = false;

    constructor() {
        this.#init();
    }

    /**
     * Initialize the global keyboard listener
     * @private
     */
    #init() {
        if (this.#initialized || typeof window === 'undefined') return;

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.#escapeStack.length > 0) {
                e.preventDefault();
                e.stopPropagation();

                // Get the topmost handler
                const top = this.#escapeStack[this.#escapeStack.length - 1];
                top.callback();
            }
        });

        this.#initialized = true;
    }

    /**
     * Register an ESC key handler for a component.
     * Handlers are called in LIFO order (last registered = first to receive ESC).
     * 
     * @param {HTMLElement} element - The element registering the handler
     * @param {() => void} callback - Function to call when ESC is pressed
     * @returns {() => void} Unsubscribe function - call when closing/disconnecting
     */
    pushEscapeHandler(element, callback) {
        const entry = { element, callback };
        this.#escapeStack.push(entry);

        // Return unsubscribe function
        return () => {
            const index = this.#escapeStack.indexOf(entry);
            if (index > -1) {
                this.#escapeStack.splice(index, 1);
            }
        };
    }

    /**
     * Check if an element is currently at the top of the ESC stack
     * @param {HTMLElement} element
     * @returns {boolean}
     */
    isTopmost(element) {
        if (this.#escapeStack.length === 0) return false;
        return this.#escapeStack[this.#escapeStack.length - 1].element === element;
    }

    /**
     * Get the current stack depth (for debugging)
     * @returns {number}
     */
    get stackDepth() {
        return this.#escapeStack.length;
    }
}

/**
 * Global keyboard manager singleton
 * @type {KeyboardManager}
 */
export const keyboard = new KeyboardManager();

// Also export class for testing
export { KeyboardManager };
