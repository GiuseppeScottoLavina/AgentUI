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

class RouterClass {
    #routes = [];
    #notFound = null;
    #currentPath = '';
    #handleRoute = null;

    /**
     * Register a route
     * @param {string} path - Route path (supports :param)
     * @param {(params: Object) => void} handler
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
     * Set 404 handler
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
     * Get current path
     */
    get current() {
        return this.#currentPath;
    }

    /**
     * Start the router
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
export const Router = new RouterClass();
