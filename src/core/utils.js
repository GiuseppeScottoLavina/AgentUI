/**
 * @fileoverview Centralized Utility Functions for AgentUI
 * 
 * Common utility functions used across components.
 * Import and use these instead of defining inline.
 */

/**
 * Escape HTML entities to prevent XSS attacks.
 * Use this when inserting user-provided content into templates.
 * 
 * @param {string|null|undefined} str - String to escape
 * @returns {string} Escaped string safe for HTML insertion
 * 
 * @example
 * import { escapeHTML } from '../core/utils.js';
 * 
 * const userInput = '<script>alert("xss")</script>';
 * element.innerHTML = `<div>${escapeHTML(userInput)}</div>`;
 * // Result: <div>&lt;script&gt;alert("xss")&lt;/script&gt;</div>
 */
export function escapeHTML(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Marker class for pre-trusted HTML content.
 * Values wrapped in SafeHTML will NOT be escaped by the `html` tagged template.
 * 
 * @private - Use the `safe()` function instead of constructing directly.
 */
class SafeHTML {
    constructor(value) {
        this.value = value == null ? '' : String(value);
    }
    toString() {
        return this.value;
    }
}

/**
 * Mark a string as trusted HTML that should NOT be escaped by the `html` tagged template.
 * Use this only for content you control — never for user input.
 * 
 * @param {string|null|undefined} value - Trusted HTML string
 * @returns {SafeHTML} Wrapped value that bypasses escaping
 * 
 * @example
 * import { html, safe } from 'agentui-wc';
 * 
 * const icon = '<au-icon name="home"></au-icon>';
 * element.innerHTML = html`<div>${safe(icon)}</div>`;
 * // → <div><au-icon name="home"></au-icon></div>
 */
export function safe(value) {
    return new SafeHTML(value);
}

/**
 * Tagged template literal for XSS-safe HTML generation.
 * All interpolated values are automatically escaped via `escapeHTML()`.
 * Use `safe()` to explicitly mark trusted HTML that should not be escaped.
 * 
 * Returns a SafeHTML instance, so nested `html` calls compose safely.
 * 
 * @param {TemplateStringsArray} strings - Static template parts
 * @param {...*} values - Interpolated values (auto-escaped)
 * @returns {SafeHTML} Safe HTML string
 * 
 * @example
 * import { html, safe } from 'agentui-wc';
 * 
 * // Auto-escaped — XSS impossible
 * const title = '<script>alert("xss")</script>';
 * element.innerHTML = html`<h2>${title}</h2>`;
 * // → <h2>&lt;script&gt;alert("xss")&lt;/script&gt;</h2>
 * 
 * // Nested templates compose safely
 * const items = ['One', 'Two', '<Three>'];
 * element.innerHTML = html`<ul>${items.map(i => html`<li>${i}</li>`)}</ul>`;
 * // → <ul><li>One</li><li>Two</li><li>&lt;Three&gt;</li></ul>
 */
export function html(strings, ...values) {
    let result = '';
    for (let i = 0; i < strings.length; i++) {
        result += strings[i];
        if (i < values.length) {
            const val = values[i];
            if (val instanceof SafeHTML) {
                // Trusted — no escaping
                result += val.value;
            } else if (Array.isArray(val)) {
                // Process each array element
                for (const item of val) {
                    if (item instanceof SafeHTML) {
                        result += item.value;
                    } else {
                        result += escapeHTML(item);
                    }
                }
            } else {
                // Auto-escape everything else
                result += escapeHTML(val);
            }
        }
    }
    return new SafeHTML(result);
}
