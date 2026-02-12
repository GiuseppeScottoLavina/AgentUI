/**
 * @fileoverview Theme System for AgentUI
 * 
 * Provides light/dark mode toggling and theme management.
 * Uses CSS custom properties and data-theme attribute.
 */

import { bus, UIEvents } from './bus.js';

/**
 * Theme manager singleton
 */
export const Theme = {
    /**
     * Set the current theme
     * @param {'light'|'dark'|'auto'} theme
     */
    set(theme) {
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
        localStorage.setItem('au-theme', theme);
        bus.emit(UIEvents.THEME_CHANGE, { theme });
    },

    /**
     * Get current theme
     * @returns {'light'|'dark'}
     */
    get() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    },

    /**
     * Toggle between light and dark
     */
    toggle() {
        const current = this.get();
        this.set(current === 'dark' ? 'light' : 'dark');
    },

    /**
     * Initialize theme from localStorage or system preference
     */
    init() {
        const saved = localStorage.getItem('au-theme');
        if (saved) {
            this.set(saved);
        } else {
            this.set('auto');
        }

        // Listen for system preference changes
        this._mql = window.matchMedia('(prefers-color-scheme: dark)');
        this._onMqlChange = (e) => {
            if (localStorage.getItem('au-theme') === 'auto') {
                document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            }
        };
        this._mql.addEventListener('change', this._onMqlChange);
    },

    /**
     * Destroy theme manager and remove listeners
     */
    destroy() {
        if (this._mql && this._onMqlChange) {
            this._mql.removeEventListener('change', this._onMqlChange);
            this._mql = null;
            this._onMqlChange = null;
        }
    }
};

// Auto-init on load
if (typeof window !== 'undefined') {
    Theme.init();
}
