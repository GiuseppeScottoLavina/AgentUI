/**
 * @fileoverview au-portal — Structural Teleport Directive
 *
 * Renders children in a different part of the DOM tree, solving
 * common problems with `overflow: hidden`, `z-index` stacking contexts,
 * and modal/tooltip positioning.
 *
 * Children are moved (not cloned) to the target element inside a
 * wrapper `<div data-au-portal-id="...">` for scoped cleanup.
 *
 * Security: `target` attribute is used as a CSS selector via
 * `querySelector` — no innerHTML, no eval, no dynamic HTML injection.
 * Performance: `display: contents` — zero layout impact from the source.
 * Memory: `disconnectedCallback` removes the teleported wrapper.
 *
 * @example
 * <!-- Teleport modal content to body to escape overflow:hidden -->
 * <div style="overflow: hidden">
 *   <au-portal target="body">
 *     <div class="modal-overlay">...</div>
 *   </au-portal>
 * </div>
 *
 * @example
 * <!-- Teleport to a specific container -->
 * <au-portal target="#tooltip-layer">
 *   <div class="tooltip">Helpful text</div>
 * </au-portal>
 * <div id="tooltip-layer"></div>
 *
 * @example
 * <!-- Default: teleports to body -->
 * <au-portal>
 *   <div class="floating-action">FAB</div>
 * </au-portal>
 */

import { AuElement, define } from '../core/AuElement.js';

/**
 * Auto-incrementing counter for unique portal wrapper IDs.
 * @type {number}
 */
let portalCounter = 0;

/**
 * Structural teleport directive.
 * Moves children to a target element elsewhere in the DOM.
 * The target is specified via a CSS selector in the `target` attribute.
 * On disconnect, the teleported wrapper is removed automatically.
 *
 * @class
 * @extends AuElement
 * @element au-portal
 *
 * @fires au-teleport - Dispatched after children are moved to the target
 * @fires au-return - Dispatched before the teleported wrapper is removed on disconnect
 */
export class AuPortal extends AuElement {
    /** @type {string} CSS class applied to the element */
    static baseClass = 'au-portal';

    /** @type {string[]} Attributes that trigger update() on change */
    static observedAttributes = ['target'];

    /** @type {null} No CSS file — structural component only */
    static cssFile = null;

    /** @type {boolean} Disable containment — display:contents is incompatible */
    static useContainment = false;

    /**
     * Unique ID for this portal instance's wrapper element.
     * Used as `data-au-portal-id` attribute for scoped cleanup.
     * @private
     * @type {string|null}
     */
    #portalId = null;

    /**
     * Reference to the wrapper element in the target container.
     * Kept for cleanup on disconnect.
     * @private
     * @type {HTMLElement|null}
     */
    #wrapper = null;

    /**
     * Render callback — sets display:contents and teleports children.
     * @override
     */
    render() {
        this.style.display = 'contents';
        this.#portalId = `au-portal-${++portalCounter}`;
        this.#teleport();
    }

    /**
     * Handles observed attribute changes.
     * Re-teleports children when `target` changes.
     * @override
     * @param {string} name - Attribute name
     * @param {string|null} newValue - New value (null = attribute removed)
     * @param {string|null} oldValue - Previous value
     */
    update(name, newValue, oldValue) {
        if (name === 'target') {
            // Reclaim children from old wrapper before removing it
            if (this.#wrapper) {
                while (this.#wrapper.firstChild) {
                    this.appendChild(this.#wrapper.firstChild);
                }
            }
            // Remove old wrapper from previous target
            this.#removeWrapper();

            // If target was explicitly removed, keep children in place (return to source)
            // Only re-teleport when target is changed to a new value
            if (newValue !== null) {
                this.#teleport();
            }
        }
    }

    /**
     * Move all children to the target element inside a wrapper div.
     * If target is not found, children remain in place (graceful fallback).
     * @private
     */
    #teleport() {
        const targetSelector = this.getAttribute('target');
        let targetEl;

        if (targetSelector) {
            try {
                targetEl = document.querySelector(targetSelector);
            } catch {
                // Invalid CSS selector (e.g. XSS attempt) — ignore silently
                return;
            }
        } else {
            // Default: teleport to body
            targetEl = document.body;
        }

        if (!targetEl) {
            // Target not found — children stay in place as fallback
            return;
        }

        // Create wrapper for scoped cleanup
        const wrapper = document.createElement('div');
        wrapper.setAttribute('data-au-portal-id', this.#portalId);
        wrapper.style.display = 'contents';

        // If we have an existing wrapper, reclaim children from it first
        if (this.#wrapper) {
            while (this.#wrapper.firstChild) {
                this.appendChild(this.#wrapper.firstChild);
            }
        }

        // Move (not clone) all children into wrapper
        while (this.firstChild) {
            wrapper.appendChild(this.firstChild);
        }

        targetEl.appendChild(wrapper);
        this.#wrapper = wrapper;

        this.emit('au-teleport');
    }

    /**
     * Remove the teleported wrapper from the target container.
     * @private
     */
    #removeWrapper() {
        if (this.#wrapper && this.#wrapper.parentNode) {
            this.#wrapper.parentNode.removeChild(this.#wrapper);
        }
        this.#wrapper = null;
    }

    /**
     * Cleanup on disconnect — remove teleported content from target.
     * @override
     */
    disconnectedCallback() {
        this.emit('au-return');
        this.#removeWrapper();
        this.#portalId = null;
        super.disconnectedCallback();
    }
}

define('au-portal', AuPortal);
