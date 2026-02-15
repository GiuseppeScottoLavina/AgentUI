/**
 * @fileoverview Simple SPA Router for AgentUI
 * 
 * Hash-based routing for single page applications.
 * 
 * Usage:
 * Router.on('/', () => renderHome());
 * Router.on('/about', () => renderAbout());
 * Router.on('/user/:id', ({ id }) => renderUser(id));
 * Router.start();
 */

/**
 * Hash-based SPA router with parameter support.
 * Routes are matched in registration order; first match wins.
 *
 * @class
 */
class RouterClass {
    #routes = [];
    #notFound = null;
    #currentPath = '';
    #handleRoute = null;

    /**
     * Register a route handler.
     * @param {string} path - Route path (supports `:param` placeholders)
     * @param {(params: Object) => void} handler - Called with matched params
     * @returns {RouterClass} This instance (chainable)
     */
    on(path, handler) {
        // Convert path params to regex
        const pattern = path
            .replace(/:[a-zA-Z]+/g, '([^/]+)')
            .replace(/\//g, '\\/');

        const paramNames = (path.match(/:[a-zA-Z]+/g) || [])
            .map(p => p.slice(1));

        this.#routes.push({
            path,
            pattern: new RegExp(`^${pattern}$`),
            paramNames,
            handler
        });

        return this;
    }

    /**
     * Set the 404 (not found) handler.
     * @param {(path: string) => void} handler - Called with unmatched path
     * @returns {RouterClass} This instance (chainable)
     */
    notFound(handler) {
        this.#notFound = handler;
        return this;
    }

    /**
     * Navigate to a path
     * @param {string} path
     */
    navigate(path) {
        window.location.hash = path;
    }

    /**
     * Get current route path.
     * @returns {string}
     */
    get current() {
        return this.#currentPath;
    }

    /**
     * Start listening for hash changes and resolve the initial route.
     * @returns {RouterClass} This instance (chainable)
     */
    start() {
        this.#handleRoute = () => {
            const hash = window.location.hash.slice(1) || '/';
            this.#currentPath = hash;

            for (const route of this.#routes) {
                const match = hash.match(route.pattern);
                if (match) {
                    // Extract params
                    const params = {};
                    route.paramNames.forEach((name, i) => {
                        params[name] = match[i + 1];
                    });

                    route.handler(params);
                    return;
                }
            }

            // No match - 404
            if (this.#notFound) {
                this.#notFound(hash);
            }
        };

        window.addEventListener('hashchange', this.#handleRoute);
        this.#handleRoute(); // Handle initial route

        return this;
    }

    /**
     * Stop the router (remove listener) without clearing routes.
     * Call start() to resume.
     */
    stop() {
        if (this.#handleRoute) {
            window.removeEventListener('hashchange', this.#handleRoute);
            this.#handleRoute = null;
        }
        return this;
    }

    /**
     * Destroy the router and remove event listeners
     */
    destroy() {
        this.stop();
        this.#routes = [];
        this.#notFound = null;
        this.#currentPath = '';
    }
}

export { RouterClass };
/** @type {RouterClass} Global router singleton */
export const Router = new RouterClass();
