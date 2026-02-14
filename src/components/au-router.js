/**
 * au-router - Route management and lazy page loading
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

class AuRouter extends AuElement {
    static baseClass = 'au-router';
    static observedAttributes = ['base', 'default'];

    // Cache for loaded pages

    #pageCache = new Map();
    #currentRoute = null;

    connectedCallback() {
        super.connectedCallback();

        // Listen for hash changes - use this.listen() for automatic cleanup
        this.listen(window, 'hashchange', () => this.#handleRoute());

        // Handle initial route
        this.#handleRoute();
    }

    // disconnectedCallback handled by AuElement (AbortController cleanup)

    render() {
        // Empty container - pages render inside
        this.innerHTML = '<div class="au-router__content"></div>';
    }

    get #basePath() {
        return this.attr('base', '/app/pages');
    }

    get #defaultRoute() {
        return this.attr('default', 'home');
    }

    get #contentContainer() {
        return this.querySelector('.au-router__content');
    }

    async #handleRoute() {
        const hash = window.location.hash.slice(1) || this.#defaultRoute;

        // Skip if same route
        if (hash === this.#currentRoute) return;

        this.#currentRoute = hash;

        // Emit route-change event
        this.emit('au-route-change', { route: hash });

        // Load page
        await this.#loadPage(hash);
    }

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

            const html = await response.text();

            // Parse the au-page and extract template content
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const muPage = doc.querySelector('au-page');

            if (muPage) {
                const template = muPage.querySelector('template');
                const content = template ? template.innerHTML : muPage.innerHTML;

                // Cache and render
                this.#pageCache.set(route, content);
                container.innerHTML = content;

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
                container.innerHTML = html;
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

    async #loadDependencies(depsText) {
        const deps = depsText
            .split(/[\n,]/)
            .map(d => d.trim())
            .filter(d => d && d.startsWith('au-'));

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
