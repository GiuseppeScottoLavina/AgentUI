/**
 * @fileoverview au-media — Declarative Responsive Rendering
 *
 * Conditionally renders children based on CSS media queries.
 * When the query doesn't match, children are removed from the DOM
 * and stored in a DocumentFragment (like `au-if`). When it matches
 * again, the same nodes are restored.
 *
 * Security: No innerHTML, no eval, no dynamic HTML.
 * Performance: `display: contents` — zero layout impact. Children
 * are fully removed from the render tree when not matching.
 * Memory: matchMedia listener removed on disconnect, fragment released.
 *
 * @example
 * <!-- Show only on desktop -->
 * <au-media query="(min-width: 1024px)">
 *   <nav class="sidebar">Desktop sidebar</nav>
 * </au-media>
 *
 * @example
 * <!-- Mobile-only content -->
 * <au-media query="(max-width: 767px)">
 *   <div class="mobile-menu">...</div>
 * </au-media>
 *
 * @example
 * <!-- Dark mode detection -->
 * <au-media query="(prefers-color-scheme: dark)">
 *   <img src="logo-dark.png" />
 * </au-media>
 */

import { AuElement, define } from '../core/AuElement.js';

/**
 * Declarative media query directive.
 * Children exist in the DOM only when the media query matches.
 * Nodes are preserved (not cloned) across match/unmatch cycles.
 *
 * @class
 * @extends AuElement
 * @element au-media
 *
 * @fires au-match - Dispatched when the media query starts matching
 * @fires au-unmatch - Dispatched when the media query stops matching
 */
export class AuMedia extends AuElement {
    /** @type {string} CSS class applied to the element */
    static baseClass = 'au-media';

    /** @type {string[]} Attributes that trigger update() on change */
    static observedAttributes = ['query'];

    /** @type {null} No CSS file — structural component only */
    static cssFile = null;

    /** @type {boolean} Disable containment — display:contents is incompatible */
    static useContainment = false;

    /**
     * Stores children when media query doesn't match.
     * Keeps original DOM nodes alive for identity-preserving round-trips.
     * @private
     * @type {DocumentFragment|null}
     */
    #fragment = null;

    /**
     * MediaQueryList instance from matchMedia.
     * @private
     * @type {MediaQueryList|null}
     */
    #mql = null;

    /**
     * Bound listener for matchMedia changes (needed for removeEventListener).
     * @private
     * @type {Function|null}
     */
    #listener = null;

    /**
     * Current match state.
     * @private
     * @type {boolean}
     */
    #matches = false;

    /**
     * Render callback — sets display:contents and sets up media query listener.
     * @override
     */
    render() {
        this.style.display = 'contents';
        this.#setupMediaQuery();
    }

    /**
     * Whether the media query currently matches.
     * @readonly
     * @returns {boolean}
     */
    get matches() {
        return this.#matches;
    }

    /**
     * Set up the matchMedia listener for the query attribute.
     * Evaluates the initial state without emitting events.
     * @private
     */
    #setupMediaQuery() {
        const query = this.getAttribute('query');
        if (!query) return;

        this.#mql = matchMedia(query);
        this.#matches = this.#mql.matches;

        // Handle initial state silently (no events)
        if (!this.#matches) {
            this.#hide();
        }

        // Listen for changes
        this.#listener = (e) => this.#handleChange(e.matches);
        this.#mql.addEventListener('change', this.#listener);
    }

    /**
     * Handle media query state change.
     * @private
     * @param {boolean} matches - Whether the query now matches
     */
    #handleChange(matches) {
        if (matches === this.#matches) return; // No change

        this.#matches = matches;

        if (matches) {
            this.#show();
        } else {
            this.#hide();
            this.emit('au-unmatch');
        }
    }

    /**
     * Restore children from the fragment.
     * @private
     */
    #show() {
        if (this.#fragment) {
            this.appendChild(this.#fragment);
            this.#fragment = null;
        }
        this.emit('au-match');
    }

    /**
     * Move children to a DocumentFragment (remove from DOM).
     * @private
     */
    #hide() {
        if (this.childNodes.length > 0) {
            this.#fragment = document.createDocumentFragment();
            while (this.firstChild) {
                this.#fragment.appendChild(this.firstChild);
            }
        }
    }

    /**
     * Cleanup on disconnect — remove listener, release fragment.
     * @override
     */
    disconnectedCallback() {
        if (this.#mql && this.#listener) {
            this.#mql.removeEventListener('change', this.#listener);
            this.#listener = null;
        }
        this.#mql = null;
        this.#fragment = null;
        super.disconnectedCallback();
    }
}

define('au-media', AuMedia);
