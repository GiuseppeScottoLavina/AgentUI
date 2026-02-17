/**
 * @fileoverview au-show — Structural Show/Hide Directive
 *
 * Conditionally shows or hides children using `display: none` CSS.
 * Unlike `au-if`, children **stay in the DOM** — their internal state
 * (input values, scroll position, media playback) is fully preserved.
 *
 * Security: No innerHTML, no eval, no dynamic attribute injection.
 * Performance: `display: contents` — zero layout impact from the wrapper.
 * Memory: `disconnectedCallback` releases the saved-display-styles map.
 *
 * @example
 * <!-- Basic usage: children visible when condition present -->
 * <au-show condition>
 *   <form>
 *     <input type="text" />
 *     <button>Submit</button>
 *   </form>
 * </au-show>
 *
 * @example
 * <!-- Programmatic toggle — form state preserved across toggles -->
 * const el = document.querySelector('au-show');
 * el.condition = false;  // hides form, keeps user input
 * el.condition = true;   // shows form, user input still there
 *
 * @example
 * <!-- Use with au-tabs for tab panels that preserve state -->
 * <au-show condition>
 *   <video autoplay></video>
 * </au-show>
 */

import { AuElement, define } from '../core/AuElement.js';

/**
 * Structural show/hide directive.
 * Toggles children visibility via CSS `display: none` while keeping
 * them in the DOM. Use this instead of `au-if` when you need to
 * preserve internal component state across show/hide cycles.
 *
 * @class
 * @extends AuElement
 * @element au-show
 *
 * @fires au-show - Dispatched when condition becomes true (children revealed)
 * @fires au-hide - Dispatched when condition becomes false (children hidden)
 */
export class AuShow extends AuElement {
    /** @type {string} CSS class applied to the element */
    static baseClass = 'au-show';

    /** @type {string[]} Attributes that trigger update() on change */
    static observedAttributes = ['condition'];

    /** @type {null} No CSS file — structural component only */
    static cssFile = null;

    /** @type {boolean} Disable containment — display:contents is incompatible */
    static useContainment = false;

    /**
     * Map of element → original display value, for restoring after hide.
     * Only element children are tracked (text nodes don't have style).
     * @private
     * @type {WeakMap<Element, string>|null}
     */
    #savedDisplays = null;

    /**
     * Render callback — sets display:contents for zero layout impact.
     * Handles initial condition evaluation (children hidden if condition absent).
     * @override
     */
    render() {
        this.style.display = 'contents';
        this.#savedDisplays = new WeakMap();

        // Evaluate initial condition — no events on initial render
        if (!this.hasAttribute('condition')) {
            this.#hide(/* silent */ true);
        }
    }

    /**
     * Handles observed attribute changes.
     * Delegates to show/hide logic for `condition` attribute.
     * @override
     * @param {string} name - Attribute name
     * @param {string|null} newValue - New value (null = attribute removed)
     * @param {string|null} oldValue - Previous value
     */
    update(name, newValue, oldValue) {
        if (name === 'condition') {
            if (newValue !== null) {
                this.#show();
            } else {
                this.#hide(/* silent */ false);
            }
        }
    }

    /**
     * Boolean property reflecting the `condition` attribute.
     * @returns {boolean} True if condition attribute is present
     */
    get condition() {
        return this.hasAttribute('condition');
    }

    /**
     * Set the condition programmatically.
     * @param {boolean} val - When truthy, sets the condition attribute; when falsy, removes it.
     */
    set condition(val) {
        if (val) {
            this.setAttribute('condition', '');
        } else {
            this.removeAttribute('condition');
        }
    }

    /**
     * Reveal children by restoring their original display value.
     * @private
     */
    #show() {
        for (const child of this.children) {
            // Restore saved display value, or remove display:none
            const saved = this.#savedDisplays?.get(child);
            if (saved !== undefined && saved !== '') {
                child.style.display = saved;
            } else {
                // Remove display:none — lets CSS cascade take over
                child.style.removeProperty('display');
            }
        }

        // Dispatch event — DOM is updated, listeners can query safely
        this.emit('au-show');
    }

    /**
     * Hide all element children via display:none.
     * Saves their current display value for correct restoration.
     * Text nodes are left alone (they don't have style).
     * @private
     * @param {boolean} silent - When true, suppresses au-hide event (used for initial render)
     */
    #hide(silent) {
        for (const child of this.children) {
            // Save current display value before overwriting
            const current = child.style.display;
            if (current !== 'none') {
                this.#savedDisplays?.set(child, current);
            }
            child.style.display = 'none';
        }

        // Dispatch event (unless initial render)
        if (!silent) {
            this.emit('au-hide');
        }
    }

    /**
     * Cleanup on disconnect — release WeakMap reference.
     * @override
     */
    disconnectedCallback() {
        super.disconnectedCallback();
        this.#savedDisplays = null;
    }
}

define('au-show', AuShow);
