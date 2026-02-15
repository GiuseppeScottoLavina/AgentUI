/**
 * @fileoverview au-theme-toggle - Theme Switch Component
 * 
 * Usage: <au-theme-toggle></au-theme-toggle>
 */

import { AuElement, define } from '../core/AuElement.js';
import { html } from '../core/utils.js';
import { Theme } from '../core/theme.js';
import { bus, UIEvents, registerComponent } from '../core/bus.js';

/**
 * Toggle button that switches between light and dark themes
 * via the `Theme` service. Updates its icon on theme changes.
 *
 * @class
 * @extends AuElement
 * @element au-theme-toggle
 */
export class AuThemeToggle extends AuElement {
    static baseClass = 'au-theme-toggle';


    /** @override */
    connectedCallback() {
        super.connectedCallback();

        // Use framework's listen() - automatically prevents duplicates via AbortController reuse
        this.listen(this, 'click', () => Theme.toggle());

        // Update icon when theme changes
        bus.on(UIEvents.THEME_CHANGE, () => this.#updateIcon());
    }

    /** @override */
    render() {
        this.innerHTML = html`
            <button class="au-theme-toggle__button" aria-label="Toggle theme">
                <span class="au-theme-toggle__icon"></span>
            </button>
        `;
        this.#updateIcon();
    }

    /**
     * Sync the toggle icon with the current theme state.
     * @private
     */
    #updateIcon() {
        const isDark = Theme.get() === 'dark';
        const icon = this.querySelector('.au-theme-toggle__icon');
        if (icon) {
            icon.textContent = isDark ? '☀️' : '🌙';
        }
    }
}

define('au-theme-toggle', AuThemeToggle);

// Register component capabilities for AI agent discovery
registerComponent('au-theme-toggle', {
    signals: [UIEvents.THEME_CHANGE],
    options: {
        themes: ['light', 'dark'],
        emits: ['click']
    },
    description: 'Theme toggle button that switches between light/dark modes'
});
