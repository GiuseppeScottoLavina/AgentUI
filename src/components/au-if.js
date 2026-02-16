/**
 * @fileoverview au-if — Structural Conditional Directive
 *
 * Conditionally renders children based on a boolean `condition` attribute.
 * Children are truly removed from the DOM (not just hidden) when condition
 * is false, and restored as the same DOM nodes when it becomes true.
 *
 * Security: `else` attribute accepts only an element ID (no innerHTML, no eval).
 * Performance: `display: contents` — zero layout impact.
 * Memory: `disconnectedCallback` releases all stored node references.
 *
 * @example
 * <!-- Basic usage -->
 * <au-if condition>
 *   <p>Visible when condition is true</p>
 * </au-if>
 *
 * @example
 * <!-- With else template -->
 * <au-if condition else="login-tpl">
 *   <p>Welcome back!</p>
 * </au-if>
 * <template id="login-tpl">
 *   <au-button>Login</au-button>
 * </template>
 *
 * @example
 * <!-- Programmatic control -->
 * const el = document.querySelector('au-if');
 * el.condition = isLoggedIn;
 */

import { AuElement, define } from '../core/AuElement.js';

/**
 * Structural conditional directive.
 * Renders children only when `condition` attribute is present.
 * Children are removed from the DOM tree when false, and restored
 * as the same DOM nodes (not clones) when true again.
 *
 * @class
 * @extends AuElement
 * @element au-if
 *
 * @fires au-show - Dispatched when condition becomes true (children inserted)
 * @fires au-hide - Dispatched when condition becomes false (children removed)
 */
export class AuIf extends AuElement {
    /** @type {string} CSS class applied to the element */
    static baseClass = 'au-if';

    /** @type {string[]} Attributes that trigger update() on change */
    static observedAttributes = ['condition', 'else'];

    /** @type {null} No CSS file — structural component only */
    static cssFile = null;

    /** @type {boolean} Disable containment — display:contents is incompatible */
    static useContainment = false;

    /**
     * Stores children when condition is false.
     * Keeps original DOM nodes alive for identity-preserving round-trips.
     * @private
     * @type {DocumentFragment|null}
     */
    #fragment = null;

    /**
     * Stores cloned else-template nodes for cleanup when condition toggles.
     * @private
     * @type {Node[]|null}
     */
    #elseNodes = null;

    /**
     * Render callback — sets display:contents for zero layout impact.
     * Handles initial condition evaluation (children hidden if condition absent).
     * @override
     */
    render() {
        this.style.display = 'contents';
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
        } else if (name === 'else') {
            // If condition is currently false, swap the else-template content
            if (!this.hasAttribute('condition')) {
                this.#removeElseNodes();
                this.#showElseTemplate();
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
     * Restore children from the stored fragment.
     * Removes any active else-template nodes first.
     * @private
     */
    #show() {
        // Remove else-template nodes if present
        this.#removeElseNodes();

        // Restore original children from fragment
        if (this.#fragment) {
            this.appendChild(this.#fragment);
            this.#fragment = null;
        }

        // Dispatch event — DOM is updated, listeners can query safely
        this.emit('au-show');
    }

    /**
     * Move children to a DocumentFragment and optionally show else-template.
     * @private
     * @param {boolean} silent - When true, suppresses au-hide event (used for initial render)
     */
    #hide(silent) {
        // Move all children to private DocumentFragment
        if (this.childNodes.length > 0) {
            this.#fragment = document.createDocumentFragment();
            while (this.firstChild) {
                this.#fragment.appendChild(this.firstChild);
            }
        }

        // Show else-template if configured
        this.#showElseTemplate();

        // Dispatch event (unless initial render)
        if (!silent) {
            this.emit('au-hide');
        }
    }

    /**
     * Clone and insert the else-template content.
     * Uses `document.getElementById` for safe lookup — no innerHTML injection.
     * @private
     */
    #showElseTemplate() {
        const elseId = this.getAttribute('else');
        if (!elseId) return;

        const template = document.getElementById(elseId);
        if (!template || !template.content) return;

        // Clone template content and track nodes for later removal
        const clone = template.content.cloneNode(true);
        // Capture node references before appending (fragment empties on append)
        this.#elseNodes = Array.from(clone.childNodes);
        this.appendChild(clone);
    }

    /**
     * Remove any previously cloned else-template nodes from the DOM.
     * @private
     */
    #removeElseNodes() {
        if (this.#elseNodes) {
            for (const node of this.#elseNodes) {
                if (node.parentNode === this) {
                    node.remove();
                }
            }
            this.#elseNodes = null;
        }
    }

    /**
     * Cleanup on disconnect — release stored DOM references to prevent leaks.
     * @override
     */
    disconnectedCallback() {
        super.disconnectedCallback();
        this.#fragment = null;
        this.#elseNodes = null;
    }
}

define('au-if', AuIf);
