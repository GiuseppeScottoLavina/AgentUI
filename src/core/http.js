/**
 * @fileoverview HTTP Utilities for AgentUI
 * 
 * Simple fetch wrapper with common patterns.
 * Supports creating isolated instances via http.create().
 * 
 * Usage:
 * const data = await http.get('/api/users');
 * await http.post('/api/users', { name: 'John' });
 * 
 * // Isolated instance (P2.3):
 * const api = http.create({ baseURL: 'https://api.example.com' });
 * const data = await api.get('/users');
 */

/**
 * Create a new HTTP client instance with configurable baseURL and headers.
 * @param {Object} [config={}] - Client configuration
 * @param {string} [config.baseURL=''] - Base URL prepended to all request paths
 * @param {Record<string, string>} [config.headers={}] - Default headers for all requests
 * @returns {Object} HTTP client with get/post/put/delete/request/create methods
 */
function createHttpClient(config = {}) {
    return {
        /** @type {string} Base URL for all requests */
        baseURL: config.baseURL || '',
        /** @type {Record<string, string>} Default headers */
        headers: {
            'Content-Type': 'application/json',
            ...(config.headers || {})
        },

        /**
         * Set base URL for all subsequent requests.
         * @param {string} url - New base URL
         */
        setBaseURL(url) {
            this.baseURL = url;
        },

        /**
         * Set a default header for all subsequent requests.
         * @param {string} key - Header name
         * @param {string} value - Header value
         */
        setHeader(key, value) {
            this.headers[key] = value;
        },

        /**
         * Perform a GET request.
         * @param {string} url - Request URL (appended to baseURL)
         * @param {Object} [options={}] - Additional fetch options
         * @returns {Promise<*>} Parsed JSON or text response
         * @throws {HttpError}
         */
        async get(url, options = {}) {
            return this.request(url, { ...options, method: 'GET' });
        },

        /**
         * Perform a POST request.
         * @param {string} url - Request URL (appended to baseURL)
         * @param {*} body - Request body (will be JSON.stringified)
         * @param {Object} [options={}] - Additional fetch options
         * @returns {Promise<*>} Parsed JSON or text response
         * @throws {HttpError}
         */
        async post(url, body, options = {}) {
            return this.request(url, { ...options, method: 'POST', body });
        },

        /**
         * Perform a PUT request.
         * @param {string} url - Request URL (appended to baseURL)
         * @param {*} body - Request body (will be JSON.stringified)
         * @param {Object} [options={}] - Additional fetch options
         * @returns {Promise<*>} Parsed JSON or text response
         * @throws {HttpError}
         */
        async put(url, body, options = {}) {
            return this.request(url, { ...options, method: 'PUT', body });
        },

        /**
         * Perform a DELETE request.
         * @param {string} url - Request URL (appended to baseURL)
         * @param {Object} [options={}] - Additional fetch options
         * @returns {Promise<*>} Parsed JSON or text response
         * @throws {HttpError}
         */
        async delete(url, options = {}) {
            return this.request(url, { ...options, method: 'DELETE' });
        },

        /**
         * Core request method — performs the actual fetch.
         * @param {string} url - Request URL (appended to baseURL)
         * @param {Object} [options={}] - Request options
         * @param {string} [options.method='GET'] - HTTP method
         * @param {*} [options.body] - Request body (will be JSON.stringified)
         * @param {Record<string, string>} [options.headers] - Extra headers to merge
         * @returns {Promise<*>} Parsed JSON or text response
         * @throws {HttpError} On non-ok responses or network errors
         */
        async request(url, options = {}) {
            const fullURL = this.baseURL + url;

            const requestConfig = {
                method: options.method || 'GET',
                headers: { ...this.headers, ...options.headers }
            };

            if (options.body) {
                requestConfig.body = JSON.stringify(options.body);
            }

            try {
                const response = await fetch(fullURL, requestConfig);

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
        },

        /**
         * Create an isolated HTTP client instance (P2.3)
         * @param {{ baseURL?: string, headers?: Record<string, string> }} [config]
         */
        create(config = {}) {
            return createHttpClient(config);
        }
    };
}

/** @type {Object} Default HTTP client singleton */
export const http = createHttpClient();

/**
 * Error class for HTTP failures.
 * Carries `status`, `statusText` and `body` from the failed response.
 *
 * @class
 * @extends Error
 */
export class HttpError extends Error {
    /**
     * @param {number} status - HTTP status code (0 for network errors)
     * @param {string} statusText - HTTP status text
     * @param {string} body - Response body or error message
     */
    constructor(status, statusText, body) {
        super(`HTTP ${status}: ${statusText}`);
        /** @type {number} HTTP status code */
        this.status = status;
        /** @type {string} HTTP status text */
        this.statusText = statusText;
        /** @type {string} Response body */
        this.body = body;
    }
}
