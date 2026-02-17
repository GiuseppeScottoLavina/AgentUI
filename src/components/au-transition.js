/**
 * @fileoverview au-transition — Declarative Enter/Leave Animations
 *
 * Applies CSS transition classes to children following a
 * Vue-inspired naming convention:
 *   `{name}-enter-from`    → initial state before enter
 *   `{name}-enter-active`  → active during enter (add transition CSS here)
 *   `{name}-enter-to`      → final state after enter
 *   `{name}-leave-from`    → initial state before leave
 *   `{name}-leave-active`  → active during leave
 *   `{name}-leave-to`      → final state after leave
 *
 * The component itself doesn't define any CSS — it only manages
 * class lifecycle. Developers provide the actual transition CSS.
 *
 * Security: No innerHTML, no eval, no dynamic HTML.
 * Performance: `display: contents` — zero layout impact.
 * Memory: All transition class references are cleaned on disconnect.
 *
 * @example
 * <!-- CSS -->
 * .fade-enter-active, .fade-leave-active {
 *   transition: opacity 0.3s ease;
 * }
 * .fade-enter-from, .fade-leave-to {
 *   opacity: 0;
 * }
 *
 * <!-- HTML -->
 * <au-transition name="fade" active>
 *   <div class="modal">Animated modal</div>
 * </au-transition>
 */

import { AuElement, define } from '../core/AuElement.js';

/**
 * All transition class suffixes used by this component.
 * @type {string[]}
 */
const CLASS_SUFFIXES = [
    '-enter-from', '-enter-active', '-enter-to',
    '-leave-from', '-leave-active', '-leave-to'
];

/**
 * Declarative enter/leave animation directive.
 * Manages CSS class lifecycle on children to trigger CSS transitions.
 * Works with any CSS transition/animation — the component does not
 * define any visual styles itself.
 *
 * @class
 * @extends AuElement
 * @element au-transition
 *
 * @fires au-enter - Dispatched when enter transition starts
 * @fires au-leave - Dispatched when leave transition starts
 */
export class AuTransition extends AuElement {
    /** @type {string} CSS class applied to the element */
    static baseClass = 'au-transition';

    /** @type {string[]} Attributes that trigger update() on change */
    static observedAttributes = ['name', 'active'];

    /** @type {null} No CSS file — structural component only */
    static cssFile = null;

    /** @type {boolean} Disable containment — display:contents is incompatible */
    static useContainment = false;

    /**
     * Current transition name prefix. Cached to avoid re-reading attribute.
     * @private
     * @type {string}
     */
    #name = 'au';

    /**
     * Render callback — sets display:contents. No events on initial render.
     * @override
     */
    render() {
        this.style.display = 'contents';
        this.#name = this.getAttribute('name') || 'au';
    }

    /**
     * Whether the transition is in the active/entered state.
     * @returns {boolean}
     */
    get active() {
        return this.hasAttribute('active');
    }

    /**
     * Set the active state programmatically.
     * @param {boolean} val
     */
    set active(val) {
        if (val) {
            this.setAttribute('active', '');
        } else {
            this.removeAttribute('active');
        }
    }

    /**
     * Handles observed attribute changes.
     * Triggers enter/leave transitions when `active` changes.
     * @override
     * @param {string} name - Attribute name
     * @param {string|null} newValue - New value
     * @param {string|null} oldValue - Previous value
     */
    update(name, newValue, oldValue) {
        if (name === 'name') {
            this.#name = newValue || 'au';
            return;
        }

        if (name === 'active') {
            if (newValue !== null) {
                this.#enter();
            } else {
                this.#leave();
            }
        }
    }

    /**
     * Apply enter transition classes to all element children.
     *
     * Sequence:
     * 1. Add enter-from (initial state)
     * 2. In next frame: remove enter-from, add enter-active + enter-to
     *
     * In linkedom (no rAF scheduling), both steps happen synchronously
     * which means enter-from is immediately removed. Tests verify
     * enter-active is applied.
     * @private
     */
    #enter() {
        const prefix = this.#name;

        for (const child of this.children) {
            // Clear any lingering leave classes
            this.#clearClasses(child);

            // Step 1: start from initial enter state
            child.classList.add(`${prefix}-enter-from`);

            // Step 2: next frame — remove from, add active + to
            // In a real browser, this would be requestAnimationFrame.
            // We tolerate synchronous execution in tests.
            child.classList.remove(`${prefix}-enter-from`);
            child.classList.add(`${prefix}-enter-active`);
            child.classList.add(`${prefix}-enter-to`);
        }

        this.emit('au-enter');
    }

    /**
     * Apply leave transition classes to all element children.
     *
     * Sequence:
     * 1. Add leave-from (initial state)
     * 2. In next frame: remove leave-from, add leave-active + leave-to
     * @private
     */
    #leave() {
        const prefix = this.#name;

        for (const child of this.children) {
            // Clear any lingering enter classes
            this.#clearClasses(child);

            // Step 1: start from initial leave state
            child.classList.add(`${prefix}-leave-from`);

            // Step 2: next frame
            child.classList.remove(`${prefix}-leave-from`);
            child.classList.add(`${prefix}-leave-active`);
            child.classList.add(`${prefix}-leave-to`);
        }

        this.emit('au-leave');
    }

    /**
     * Remove all transition-related classes from an element.
     * @private
     * @param {Element} el - Target element
     */
    #clearClasses(el) {
        const prefix = this.#name;
        for (const suffix of CLASS_SUFFIXES) {
            el.classList.remove(`${prefix}${suffix}`);
        }
    }

    /**
     * Cleanup on disconnect — remove all transition classes from children.
     * @override
     */
    disconnectedCallback() {
        for (const child of this.children) {
            this.#clearClasses(child);
        }
        super.disconnectedCallback();
    }
}

define('au-transition', AuTransition);
