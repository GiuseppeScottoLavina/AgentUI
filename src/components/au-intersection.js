/**
 * @fileoverview au-intersection — Declarative IntersectionObserver
 *
 * Wraps the IntersectionObserver API in a declarative web component.
 * Emits `au-visible` / `au-hidden` events when the element enters or
 * leaves the viewport. Useful for lazy loading, infinite scroll,
 * in-view analytics, and scroll-triggered animations.
 *
 * Security: No dynamic HTML, no innerHTML, no eval.
 * Performance: `display: contents` — zero layout impact.
 * Memory: Observer is disconnected on `disconnectedCallback`.
 *
 * @example
 * <!-- Lazy load when visible -->
 * <au-intersection once>
 *   <img data-src="/heavy-image.jpg" />
 * </au-intersection>
 *
 * @example
 * <!-- Trigger animation at 50% visibility -->
 * <au-intersection threshold="0.5">
 *   <div class="animate-on-scroll">Content</div>
 * </au-intersection>
 *
 * @example
 * <!-- Infinite scroll trigger with margin -->
 * <au-intersection root-margin="200px 0px" once>
 *   <div class="load-more-trigger"></div>
 * </au-intersection>
 */

import { AuElement, define } from '../core/AuElement.js';

/**
 * Declarative IntersectionObserver wrapper.
 * Emits events when the element enters or leaves the viewport.
 * Supports configurable threshold, root margin, and one-shot mode.
 *
 * @class
 * @extends AuElement
 * @element au-intersection
 *
 * @fires au-visible - Dispatched when element enters the viewport
 * @fires au-hidden - Dispatched when element leaves the viewport
 */
export class AuIntersection extends AuElement {
    /** @type {string} CSS class applied to the element */
    static baseClass = 'au-intersection';

    /** @type {string[]} Attributes that trigger update() on change */
    static observedAttributes = ['threshold', 'root-margin', 'once'];

    /** @type {null} No CSS file — structural component only */
    static cssFile = null;

    /** @type {boolean} Disable containment — display:contents is incompatible */
    static useContainment = false;

    /**
     * IntersectionObserver instance for this component.
     * @private
     * @type {IntersectionObserver|null}
     */
    #observer = null;

    /**
     * Current visibility state as reported by the observer.
     * @private
     * @type {boolean}
     */
    #visible = false;

    /**
     * Render callback — sets display:contents and creates the observer.
     * @override
     */
    render() {
        this.style.display = 'contents';
        // Defer observer creation — connectedCallback fires BEFORE the HTML parser
        // has appended children for declarative elements. At this point firstElementChild
        // is null, so we'd fall back to observing `this` (which has no box due to
        // display:contents). setTimeout(0) defers until after parsing completes.
        setTimeout(() => {
            // Guard: element may have been disconnected before this fires
            if (this.isConnected) this.#createObserver();
        }, 0);
    }

    /**
     * Whether the element is currently intersecting with the viewport.
     * Updated by the IntersectionObserver callback.
     * @readonly
     * @returns {boolean}
     */
    get isVisible() {
        return this.#visible;
    }

    /**
     * Create and start the IntersectionObserver.
     * Parses threshold and rootMargin from attributes with safe defaults.
     * @private
     */
    #createObserver() {
        // Parse threshold: float 0–1, clamped to valid range
        let threshold = parseFloat(this.getAttribute('threshold') || '0');
        if (isNaN(threshold)) threshold = 0;
        threshold = Math.max(0, Math.min(1, threshold));

        // Parse rootMargin: CSS margin string, safe default
        const rootMargin = this.getAttribute('root-margin') || '0px';

        // Whether to auto-disconnect after first intersection
        const once = this.hasAttribute('once');

        this.#observer = new IntersectionObserver(
            (entries) => this.#handleIntersection(entries, once),
            { threshold, rootMargin }
        );

        // Observe first child element instead of self, because display:contents
        // removes the element's layout box — IntersectionObserver needs a box to detect.
        // Falls back to self when empty (edge case).
        const target = this.firstElementChild || this;
        this.#observer.observe(target);
    }

    /**
     * IntersectionObserver callback. Processes the last entry (most recent state)
     * and emits the appropriate event.
     * @private
     * @param {IntersectionObserverEntry[]} entries - Observer entries
     * @param {boolean} once - Whether to disconnect after first intersection
     */
    #handleIntersection(entries, once) {
        // Process only the last entry (most recent state of this element)
        const entry = entries[entries.length - 1];

        if (entry.isIntersecting) {
            this.#visible = true;
            this.emit('au-visible', { ratio: entry.intersectionRatio });

            // In once mode, disconnect after first visibility
            if (once) {
                this.#observer?.disconnect();
            }
        } else {
            this.#visible = false;
            this.emit('au-hidden', { ratio: entry.intersectionRatio });
        }
    }

    /**
     * Cleanup on disconnect — disconnect the observer.
     * @override
     */
    disconnectedCallback() {
        if (this.#observer) {
            this.#observer.disconnect();
            this.#observer = null;
        }
        super.disconnectedCallback();
    }
}

define('au-intersection', AuIntersection);
