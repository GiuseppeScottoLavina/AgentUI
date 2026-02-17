/**
 * @fileoverview au-router - Route management and lazy page loading
 * 
 * Features:
 * - Hash-based routing (#page-name)
 * - Lazy loads pages from /app/pages/{route}.html
 * - Caches loaded pages
 * - Emits navigation events
 * 
 * Usage:
 *   <au-router base="/app/pages"></au-router>
 * 
 * @agent-pattern
 * This component is core to the page-based app architecture.
 * Place one <au-router> in your app shell where pages should render.
 */

import { AuElement, define } from '../core/AuElement.js';
import { html } from '../core/utils.js';
import { bus } from '../core/bus.js';

/**
 * Hash-based router that lazily loads pages from HTML files, caches them,
 * and emits navigation events on both the DOM and the global `bus`.
 *
 * @class
 * @extends AuElement
 * @element au-router
 * @fires au-route-change - Emitted on route change, detail: `{ route }`.
 * @fires au-page-loaded  - Emitted after page content is rendered, detail: `{ route }`.
 * @fires au-page-error   - Emitted on page load failure, detail: `{ route, error }`.
 */
class AuRouter extends AuElement {
    static baseClass = 'au-router';
    static observedAttributes = ['base', 'default'];

    // Cache for loaded pages

    /** @private @type {Map<string,string>} */
    #pageCache = new Map();
    /** @private @type {string|null} */
    #currentRoute = null;

    /** @override */
    connectedCallback() {
        super.connectedCallback();

        // Listen for hash changes - use this.listen() for automatic cleanup
        this.listen(window, 'hashchange', () => this.#handleRoute());

        // Handle initial route
        this.#handleRoute();
    }

    // disconnectedCallback handled by AuElement (AbortController cleanup)

    /** @override */
    render() {
        // Empty container - pages render inside
        this.innerHTML = '<div class="au-router__content"></div>';
    }

    /**
     * Resolved base path for page HTML files.
     * @private
     * @type {string}
     */
    get #basePath() {
        return this.attr('base', '/app/pages');
    }

    /**
     * Default route when hash is empty.
     * @private
     * @type {string}
     */
    get #defaultRoute() {
        return this.attr('default', 'home');
    }

    /**
     * Router content container element.
     * @private
     * @type {HTMLElement|null}
     */
    get #contentContainer() {
        return this.querySelector('.au-router__content');
    }

    /**
     * Parse the current hash and load the corresponding page.
     * @private
     */
    async #handleRoute() {
        const hash = window.location.hash.slice(1) || this.#defaultRoute;

        // Skip if same route
        if (hash === this.#currentRoute) return;

        const previous = this.#currentRoute;
        this.#currentRoute = hash;

        // Emit route-change DOM event (original — backward-compatible)
        this.emit('au-route-change', { route: hash });

        // Emit route-change on the global bus (decoupled from DOM tree)
        bus.emit('au:route-change', { route: hash, previous });

        // Load page
        await this.#loadPage(hash);
    }

    /**
     * Fetch, sanitize, cache, and render a page by route name.
     * @private
     * @param {string} route
     */
    async #loadPage(route) {
        const container = this.#contentContainer;
        if (!container) return;

        // Show loading state
        container.innerHTML = '<au-spinner></au-spinner>';

        try {
            // Check cache first
            if (this.#pageCache.has(route)) {
                container.innerHTML = this.#pageCache.get(route);
                this.emit('au-page-loaded', { route });
                return;
            }

            // Fetch page HTML
            const url = `${this.#basePath}/${route}.html`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Page not found: ${route}`);
            }

            const pageHtml = await response.text();

            // Parse the au-page and extract template content
            const parser = new DOMParser();
            const doc = parser.parseFromString(pageHtml, 'text/html');
            const muPage = doc.querySelector('au-page');

            if (muPage) {
                const template = muPage.querySelector('template');
                const content = template ? template.innerHTML : muPage.innerHTML;

                // Sanitize and cache
                const sanitized = this._sanitizePageContent(content);
                this.#pageCache.set(route, sanitized);
                container.innerHTML = sanitized;

                // Load dependencies
                const deps = muPage.querySelector('script[type="x-dependencies"]');
                if (deps) {
                    await this.#loadDependencies(deps.textContent);
                }

                // Update page title
                const title = muPage.getAttribute('title');
                if (title) {
                    document.title = `${title} | AgentUI`;
                }
            } else {
                // Sanitize: use textContent to prevent XSS from untrusted HTML
                container.textContent = pageHtml;
            }

            this.emit('au-page-loaded', { route });

        } catch (error) {
            container.innerHTML = html`
        <au-alert variant="error">
          <strong>Page not found</strong>
          <p>Could not load page: ${route}</p>
        </au-alert>
      `;
            this.emit('au-page-error', { route, error });
        }
    }

    /**
     * Sanitize page HTML content before innerHTML injection.
     * Strips dangerous elements and attributes to prevent XSS.
     * @param {string} html - Raw HTML content from fetched page
     * @returns {string} Sanitized HTML
     */
    _sanitizePageContent(htmlContent) {
        // Use DOMParser for safe parsing (does NOT execute scripts)
        let doc;
        if (typeof DOMParser !== 'undefined') {
            const parser = new DOMParser();
            doc = parser.parseFromString(htmlContent, 'text/html');
        } else {
            // linkedom fallback for test environments
            const container = document.createElement('div');
            container.innerHTML = htmlContent;
            doc = { body: container };
        }

        // Remove dangerous elements
        const dangerousSelectors = 'script, iframe, object, embed, base, meta[http-equiv]';
        doc.body.querySelectorAll(dangerousSelectors).forEach(el => el.remove());

        // Remove dangerous attributes from all elements
        const allElements = doc.body.querySelectorAll('*');
        for (const el of allElements) {
            const attrs = [...el.attributes];
            for (const attr of attrs) {
                // Remove all event handler attributes
                if (attr.name.startsWith('on')) {
                    el.removeAttribute(attr.name);
                }
                // Remove srcdoc (iframe XSS vector)
                if (attr.name === 'srcdoc') {
                    el.removeAttribute(attr.name);
                }
                // Block javascript: URIs in href/src/action/formaction
                if (['href', 'src', 'action', 'formaction'].includes(attr.name)) {
                    if (attr.value.trim().toLowerCase().startsWith('javascript:')) {
                        el.removeAttribute(attr.name);
                    }
                }
            }
        }

        return doc.body.innerHTML;
    }

    /**
     * Dynamically import component dependencies declared in a page.
     * @private
     * @param {string} depsText - Newline/comma-separated component tag names.
     */
    async #loadDependencies(depsText) {
        const deps = depsText
            .split(/[\n,]/)
            .map(d => d.trim())
            .filter(d => d && /^au-[a-z0-9-]+$/.test(d));  // R3: strict validation

        // Load each component
        for (const dep of deps) {
            // Skip if already defined
            if (customElements.get(dep)) continue;

            try {
                await import(`/dist/components/${dep}.js`);
            } catch (e) {
                console.warn(`[au-router] Could not load: ${dep}`, e);
            }
        }
    }

    // Public API
    navigate(route) {
        window.location.hash = route;
    }

    get currentRoute() {
        return this.#currentRoute;
    }
}

define('au-router', AuRouter);
export { AuRouter };
