/**
 * @fileoverview au-fetch - Declarative Data Fetcher Component
 * Agent-friendly component for fetching data with automatic loading/error states
 * 
 * @example
 * <au-fetch url="/api/users" id="users">
 *     <template slot="loading"><au-skeleton></au-skeleton></template>
 *     <template slot="error"><au-alert variant="error">${error}</au-alert></template>
 * </au-fetch>
 * 
 * // Access data
 * const fetcher = document.getElementById('users');
 * fetcher.data; // The fetched data
 * fetcher.refetch(); // Re-fetch data
 */

import { AuElement, define } from '../core/AuElement.js';

/**
 * @typedef {'idle'|'loading'|'success'|'error'} FetchState
 */

/**
 * @typedef {Object} FetchResult
 * @property {FetchState} state
 * @property {any} data
 * @property {Error|null} error
 */

export class AuFetch extends AuElement {
    static baseClass = 'au-fetch';
    static observedAttributes = ['url', 'method', 'auto', 'interval'];

    /** @type {FetchState} */

    state = 'idle';

    /** @type {any} */
    data = null;

    /** @type {Error|null} */
    error = null;

    /** @type {AbortController|null} */
    _controller = null;

    /** @type {number|null} */
    _intervalId = null;

    connectedCallback() {
        // Store templates before render
        this._loadingTemplate = this.querySelector('template[slot="loading"]')?.innerHTML ||
            '<au-spinner></au-spinner>';
        this._errorTemplate = this.querySelector('template[slot="error"]')?.innerHTML ||
            '<au-alert variant="error">Error loading data</au-alert>';
        this._emptyTemplate = this.querySelector('template[slot="empty"]')?.innerHTML ||
            '<p>No data</p>';

        super.connectedCallback();

        // Auto-fetch on connect
        if (this.has('auto') || this.hasAttribute('url')) {
            this.fetch();
        }

        // Setup interval refresh
        const interval = parseInt(this.attr('interval', '0'));
        if (interval > 0) {
            this.setInterval(() => this.fetch(), interval);
        }
    }

    render() {
        // Render based on current state
        this.innerHTML = ''; // Clear content

        switch (this.state) {
            case 'loading':
                // Safe: _loadingTemplate is trusted or empty, but let's wrap it container
                const loadingContainer = document.createElement('div');
                loadingContainer.className = 'au-fetch__loading';
                loadingContainer.innerHTML = this._loadingTemplate; // _loadingTemplate comes from initial slot content which is trusted
                this.appendChild(loadingContainer);
                break;
            case 'error':
                const errorContainer = document.createElement('div');
                errorContainer.className = 'au-fetch__error';

                // Safe: Create error message safely using textContent
                // We don't use the template string replacement anymore to avoid XSS
                // If user provided a custom error template, we parse it safely or just use default

                const errorMessage = this.error?.message || 'Unknown error';

                if (this._errorTemplate && this._errorTemplate.includes('${error}')) {
                    // If template is complex, we might need a safer way, but for now 
                    // let's stick to safe text replacement if possible or just use textContent
                    // Actually, simply setting textContent into the container is safest for the message
                    errorContainer.textContent = `Error: ${errorMessage}`;
                    // If we want to respect the slot, we'd need a safe interpolate, 
                    // but for high, security we break the unsafe template behavior for errors.
                } else {
                    const alert = document.createElement('au-alert');
                    alert.setAttribute('variant', 'error');
                    alert.textContent = errorMessage; // Safe
                    errorContainer.appendChild(alert);
                }

                this.appendChild(errorContainer);
                break;
            case 'success':
                if (!this.data || (Array.isArray(this.data) && this.data.length === 0)) {
                    const emptyContainer = document.createElement('div');
                    emptyContainer.className = 'au-fetch__empty';
                    emptyContainer.innerHTML = this._emptyTemplate; // Trusted slot content
                    this.appendChild(emptyContainer);
                } else {
                    const dataContainer = document.createElement('div');
                    dataContainer.className = 'au-fetch__data';

                    // Dataslot or renderItem function
                    if (this.renderItem && Array.isArray(this.data)) {
                        // WARNING: renderItem expects to return a string currently. 
                        // To be safe, we should check if it returns a Node or string.
                        // For now we will assume string but we can sanitize it? 
                        // Actually, following the plan, we change default behavior but if user provides function
                        // they might output HTML. 
                        // Let's implement safe node appending if possible.
                        this.data.forEach(item => {
                            const result = this.renderItem(item);
                            if (result instanceof Node) {
                                dataContainer.appendChild(result);
                            } else {
                                // SAFETY NOTE: renderItem is a developer-provided callback.
                                // Like React's dangerouslySetInnerHTML, the caller is responsible
                                // for sanitizing output. Use html`` tagged template from agentui-wc
                                // for automatic XSS-safe rendering.
                                dataContainer.insertAdjacentHTML('beforeend', result);
                            }
                        });
                    } else {
                        const slot = document.createElement('slot');
                        slot.name = 'data';
                        dataContainer.appendChild(slot);
                        this.emit('au-data', { data: this.data });
                    }
                    this.appendChild(dataContainer);
                }
                break;
        }
    }

    /**
     * Fetch data from the URL
     * @param {RequestInit} [options] - Fetch options override
     * @returns {Promise<any>}
     */
    async fetch(options = {}) {
        const url = this.attr('url', '');
        if (!url) {
            console.warn('au-fetch: No URL provided');
            return null;
        }

        // Abort any in-flight request
        if (this._controller) {
            this._controller.abort();
        }
        this._controller = new AbortController();

        this.state = 'loading';
        this.error = null;
        this.render();
        this.emit('au-loading');

        try {
            const method = this.attr('method', 'GET');
            const response = await fetch(url, {
                method,
                signal: this._controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                // If the server returns JSON error, try to parse it
                let errorMsg = `HTTP ${response.status}: ${response.statusText}`;
                try {
                    const errorJson = await response.json();
                    if (errorJson.message) errorMsg = errorJson.message;
                } catch (e) {
                    // Ignore json parse error
                }
                throw new Error(errorMsg);
            }

            this.data = await response.json();
            this.state = 'success';
            this.render();
            this.emit('au-success', { data: this.data });
            return this.data;
        } catch (err) {
            if (err.name === 'AbortError') {
                return null; // Aborted, ignore
            }
            this.error = /** @type {Error} */ (err);
            this.state = 'error';
            this.render();
            this.emit('au-error', { error: this.error });
            return null;
        }
    }

    /**
     * Refetch the current URL
     * @returns {Promise<any>}
     */
    refetch() {
        return this.fetch();
    }

    /**
     * Set custom render function for array data
     * @param {(item: any, index: number) => string} fn
     */
    set renderItem(fn) {
        this._renderItem = fn;
    }

    get renderItem() {
        return this._renderItem;
    }

    update(attr, newValue, oldValue) {
        if (attr === 'url' && newValue !== oldValue) {
            this.fetch();
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this._controller) {
            this._controller.abort();
        }
        // Note: setInterval cleanup now handled by AuElement via super.disconnectedCallback()
    }
}

define('au-fetch', AuFetch);
