/**
 * @fileoverview Theme System for AgentUI
 * 
 * Provides light/dark mode toggling and theme management.
 * Uses CSS custom properties and data-theme attribute.
 * Internally uses createStore for persistence.
 */

import { bus, UIEvents } from './bus.js';
import { createStore } from './store.js';

/**
 * Internal store for theme persistence.
 * Handles localStorage read/write via createStore's persist option.
 */
const _store = createStore(
    { current: 'light', preference: 'auto' },
    { persist: 'au-theme' }
);

/**
 * Theme manager singleton.
 * Provides light/dark mode toggling with localStorage persistence.
 *
 * @namespace Theme
 */
export const Theme = {
    /**
     * Set the current theme.
     * @param {'light'|'dark'|'auto'} theme - Theme to apply
     * @fires UIEvents.THEME_CHANGE
     */
    set(theme) {
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
        _store.state.preference = theme;
        _store.state.current = document.documentElement.getAttribute('data-theme');
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
     * Initialize theme from localStorage or system preference.
     * Handles migration from old localStorage key format.
     */
    init() {
        // Migration: check old key format (raw 'au-theme') first
        const oldKey = typeof localStorage !== 'undefined'
            ? localStorage.getItem('au-theme')
            : null;

        if (oldKey && _store.state.preference === 'auto') {
            // Migrate from old format
            this.set(oldKey);
            try { localStorage.removeItem('au-theme'); } catch (e) { /* silent */ }
            return;
        }

        // Use persisted preference from store, or fall back to old key
        const saved = _store.state.preference;
        if (saved && saved !== 'auto') {
            this.set(saved);
        } else if (oldKey) {
            this.set(oldKey);
            try { localStorage.removeItem('au-theme'); } catch (e) { /* silent */ }
        } else {
            this.set('auto');
        }

        // Listen for system preference changes
        this._mql = window.matchMedia('(prefers-color-scheme: dark)');
        this._onMqlChange = (e) => {
            if (_store.state.preference === 'auto') {
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
    },

    /**
     * Access the internal store (for advanced use / testing)
     * @returns {import('./store.js').Store}
     */
    get _store() {
        return _store;
    }
};

// Auto-init on load
if (typeof window !== 'undefined') {
    Theme.init();
}
