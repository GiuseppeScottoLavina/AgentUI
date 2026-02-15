/**
 * @fileoverview au-error-boundary - Error Boundary Component
 * 
 * Catches rendering errors in child components and displays fallback UI.
 * Critical for large-scale applications where one component error
 * should not crash the entire application.
 * 
 * Based on 2024 enterprise error recovery patterns.
 * 
 * Usage:
 * <au-error-boundary fallback="<p>Something went wrong</p>">
 *     <au-complex-widget></au-complex-widget>
 * </au-error-boundary>
 * 
 * With error handler:
 * <au-error-boundary onerror="customHandler(event.detail)">
 *     <au-data-table :items="${data}"></au-data-table>
 * </au-error-boundary>
 */

import { AuElement, define } from '../core/AuElement.js';
import { html } from '../core/utils.js';

/**
 * Global error registry for agent observability
 * @type {Array<{timestamp: number, component: string, error: Error, context: Object}>}
 */
const errorRegistry = [];

/**
 * Get all caught errors for agent debugging
 * @returns {Array<Object>}
 */
export function getErrors() {
    return [...errorRegistry];
}

/**
 * Clear error registry
 */
export function clearErrors() {
    errorRegistry.length = 0;
}

/**
 * Error boundary that catches rendering failures in child components
 * and displays a recoverable fallback UI. Maintains a global error
 * registry for agent observability.
 *
 * @class
 * @extends AuElement
 * @element au-error-boundary
 * @fires au-error   - Emitted when an error is caught, detail: `{ error, boundary, recover }`.
 * @fires au-recover - Emitted after successful recovery.
 */
export class AuErrorBoundary extends AuElement {
    static baseClass = 'au-error-boundary';
    static observedAttributes = ['fallback'];


    /** @private */
    #hasError = false;
    /** @private @type {Error|null} */
    #error = null;
    /** @private */
    #originalContent = '';

    /** @override */
    connectedCallback() {
        super.connectedCallback();

        // Store original content for potential recovery
        this.#originalContent = this.innerHTML;

        // Listen for errors from child components
        this.listen(this, 'error', this.#handleError.bind(this));

        // Also catch unhandled errors from child scripts
        // Uses this.listen() for automatic cleanup via AbortController on disconnect
        // Multiple boundaries can coexist — each has its own listener
        this.listen(window, 'error', (e) => {
            if (this.#isErrorFromChild(e.error)) {
                this.#handleError({ detail: { error: e.error, message: e.message } });
                e.preventDefault();
            }
        });
    }

    /**
     * Best-effort heuristic to determine if an error originated from a child component.
     * @private
     * @param {Error} error
     * @returns {boolean}
     */
    #isErrorFromChild(error) {
        // Best-effort check if error is from child component
        if (!error?.stack) return false;

        const childTags = Array.from(this.querySelectorAll('*'))
            .filter(el => el.tagName.startsWith('AU-'))
            .map(el => el.tagName.toLowerCase());

        return childTags.some(tag => error.stack.includes(tag));
    }

    /**
     * Process a caught error: register it, render fallback, and emit `au-error`.
     * @private
     * @param {Event|CustomEvent} event
     */
    #handleError(event) {
        const error = event?.detail?.error || event?.error || event;

        if (this.#hasError) return; // Already showing fallback

        this.#hasError = true;
        this.#error = error;

        // Register error for agent observability
        errorRegistry.push({
            timestamp: Date.now(),
            component: this.id || 'au-error-boundary',
            error: {
                message: error?.message || String(error),
                stack: error?.stack,
                name: error?.name
            },
            context: {
                originalContent: this.#originalContent.slice(0, 200),
                parentUrl: window.location.href
            }
        });

        // Keep only last 50 errors
        if (errorRegistry.length > 50) {
            errorRegistry.shift();
        }

        // Show fallback UI
        this.#renderFallback();

        // Emit event for custom handling
        this.emit('au-error', {
            error,
            boundary: this,
            recover: () => this.recover()
        });

        // Prevent event propagation
        event?.stopPropagation?.();
    }

    /**
     * Replace children with fallback UI (custom or default).
     * @private
     */
    #renderFallback() {
        const fallback = this.getAttribute('fallback');

        if (fallback) {
            // Security: treat fallback attribute as text, not raw HTML
            // For HTML fallback, use the au-error event handler instead
            const fallbackEl = document.createElement('div');
            fallbackEl.className = 'au-error-boundary__fallback';
            fallbackEl.setAttribute('role', 'alert');
            fallbackEl.textContent = fallback;
            this.innerHTML = '';
            this.appendChild(fallbackEl);
        } else {
            // Default fallback UI
            this.innerHTML = html`
                <div class="au-error-boundary__fallback" role="alert" aria-live="polite">
                    <au-icon name="error" style="--au-icon-size: 48px; color: var(--md-sys-color-error);"></au-icon>
                    <p class="au-error-boundary__title">Something went wrong</p>
                    <p class="au-error-boundary__message">${this.#error?.message || 'An unexpected error occurred'}</p>
                    <au-button variant="outlined" onclick="this.closest('au-error-boundary').recover()">
                        Try Again
                    </au-button>
                </div>
            `;
        }

        this.classList.add('has-error');
    }

    /** @override */
    render() {
        // Apply base styles
        this.style.display = 'block';
    }

    /**
     * Attempt to recover by restoring original content
     */
    recover() {
        this.#hasError = false;
        this.#error = null;
        this.classList.remove('has-error');
        this.innerHTML = this.#originalContent;

        this.emit('au-recover');
    }

    /**
     * Check if boundary is currently showing error
     */
    get hasError() {
        return this.#hasError;
    }

    /**
     * Get the current error
     */
    get error() {
        return this.#error;
    }
}

define('au-error-boundary', AuErrorBoundary);
