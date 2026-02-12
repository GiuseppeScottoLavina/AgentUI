/**
 * @fileoverview HTTP Utilities for AgentUI
 * 
 * Simple fetch wrapper with common patterns.
 * 
 * Usage:
 * const data = await http.get('/api/users');
 * await http.post('/api/users', { name: 'John' });
 */

export const http = {
    baseURL: '',
    headers: {
        'Content-Type': 'application/json'
    },

    /**
     * Set base URL for all requests
     */
    setBaseURL(url) {
        this.baseURL = url;
    },

    /**
     * Set default header
     */
    setHeader(key, value) {
        this.headers[key] = value;
    },

    /**
     * GET request
     */
    async get(url, options = {}) {
        return this.request(url, { ...options, method: 'GET' });
    },

    /**
     * POST request
     */
    async post(url, body, options = {}) {
        return this.request(url, { ...options, method: 'POST', body });
    },

    /**
     * PUT request
     */
    async put(url, body, options = {}) {
        return this.request(url, { ...options, method: 'PUT', body });
    },

    /**
     * DELETE request
     */
    async delete(url, options = {}) {
        return this.request(url, { ...options, method: 'DELETE' });
    },

    /**
     * Core request method
     */
    async request(url, options = {}) {
        const fullURL = this.baseURL + url;

        const config = {
            method: options.method || 'GET',
            headers: { ...this.headers, ...options.headers }
        };

        if (options.body) {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(fullURL, config);

            if (!response.ok) {
                throw new HttpError(response.status, response.statusText, await response.text());
            }

            const contentType = response.headers.get('content-type');
            if (contentType?.includes('application/json')) {
                return response.json();
            }

            return response.text();
        } catch (error) {
            if (error instanceof HttpError) throw error;
            throw new HttpError(0, 'Network Error', error.message);
        }
    }
};

/**
 * HTTP Error class
 */
export class HttpError extends Error {
    constructor(status, statusText, body) {
        super(`HTTP ${status}: ${statusText}`);
        this.status = status;
        this.statusText = statusText;
        this.body = body;
    }
}
