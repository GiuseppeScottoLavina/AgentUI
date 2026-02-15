/**
 * @fileoverview Centralized Z-Index Layer System for AgentUI
 * 
 * Provides consistent layering across all components.
 * Uses named constants to eliminate magic numbers.
 * 
 * Layer Stack (lowest to highest):
 * - base: 1 (default content)
 * - sticky: 100 (sticky headers, FABs)
 * - dropdown: 1000 (dropdowns, menus)
 * - drawer: 1100 (navigation drawers)
 * - modal: 1200 (modal dialogs)
 * - toast: 1300 (toast notifications)
 * - tooltip: 1400 (tooltips)
 * - overlay: 9999 (full-screen overlays)
 * - devtools: 999999 (agent dev tools - always on top)
 * 
 * @example
 * import { Z_INDEX } from '../core/layers.js';
 * this.style.zIndex = Z_INDEX.modal;
 */

/**
 * Z-Index layer constants
 * @type {Object<string, number>}
 */
export const Z_INDEX = Object.freeze({
    /** Default content layer */
    base: 1,
    /** Sticky headers, FABs */
    sticky: 100,
    /** Dropdowns, menus, popovers */
    dropdown: 1000,
    /** Navigation drawers */
    drawer: 1100,
    /** Modal dialogs */
    modal: 1200,
    /** Toast notifications */
    toast: 1300,
    /** Tooltips */
    tooltip: 1400,
    /** Full-screen overlays */
    overlay: 9999,
    /** Agent dev tools - always on top */
    devtools: 999999
});

/**
 * Inject CSS custom properties for z-index layers.
 * Call this once on app init to use in CSS.
 * 
 * @example
 * // In CSS:
 * .my-modal { z-index: var(--z-modal); }
 */
export function injectLayerTokens() {
    // Check if already injected
    if (document.getElementById('au-layer-tokens')) return;

    const style = document.createElement('style');
    style.id = 'au-layer-tokens';
    style.textContent = `:root {
${Object.entries(Z_INDEX).map(([k, v]) => `    --z-${k}: ${v};`).join('\n')}
}`;
    document.head.appendChild(style);
}

// Note (P3.2): injectLayerTokens() is NOT auto-called on import.
// CSS custom properties are defined in tokens.css (canonical source).
// Call injectLayerTokens() manually if you need JS-injected tokens.
