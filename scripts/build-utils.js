/**
 * @fileoverview Build utilities for AgentUI
 * 
 * Contains reusable functions for the build process,
 * particularly for automatic component detection.
 */

/**
 * Scan HTML content for au-* components within page divs.
 * Extracts component names from each page section.
 * 
 * @param {string} htmlContent - Full HTML content to scan
 * @returns {Object<string, string[]>} Map of pageId -> component names
 * 
 * @example
 * const html = '<div id="page-home"><au-button>Click</au-button></div>';
 * const result = scanPageComponents(html);
 * // { home: ['au-button'] }
 */
export function scanPageComponents(htmlContent) {
    const pages = {};

    // Match page divs: <div id="page-xxx">...</div>
    // Use non-greedy matching and look ahead for next page or end
    const pageRegex = /<div\s+id="page-(\w+)"[^>]*>([\s\S]*?)(?=<div\s+id="page-|\s*<\/au-layout|\s*<footer|\s*$)/gi;

    let match;
    while ((match = pageRegex.exec(htmlContent)) !== null) {
        const pageId = match[1];
        const pageContent = match[2];

        // Extract all au-* tags (opening tags only)
        const components = new Set();
        const tagRegex = /<(au-[\w-]+)/gi;
        let tagMatch;
        while ((tagMatch = tagRegex.exec(pageContent)) !== null) {
            // Normalize to lowercase
            components.add(tagMatch[1].toLowerCase());
        }

        if (components.size > 0) {
            pages[pageId] = [...components].sort();
        }
    }

    return pages;
}

/**
 * Map component names to their route file names.
 * Some components share routes (e.g., au-tab is in tabs route).
 * 
 * @param {string[]} components - Array of component names
 * @returns {string[]} Array of route names to load
 */
export function componentsToRoutes(components) {
    // Component -> route mapping (most are 1:1 with pluralization)
    const componentRouteMap = {
        'au-tab': 'tabs',
        'au-tabs': 'tabs',
        'au-button': 'buttons',
        'au-input': 'inputs',
        'au-textarea': 'inputs',
        'au-checkbox': 'checkboxes',
        'au-switch': 'switches',
        'au-radio': 'radios',
        'au-dropdown': 'dropdowns',
        'au-card': 'cards',
        'au-stack': 'layout',
        'au-grid': 'layout',
        'au-alert': 'alerts',
        'au-toast': 'toasts',
        'au-modal': 'modals',
        'au-progress': 'progress',
        'au-spinner': 'progress',
        'au-avatar': 'avatars',
        'au-badge': 'badges',
        'au-chip': 'chips',
        'au-icon': 'icons',
        'au-navbar': 'navbar',
        'au-example': 'tabs',  // part of tabs route
        'au-code': 'tabs',     // part of tabs route
        'au-api-table': 'tabs', // part of tabs route
        // Shell components (always loaded)
        'au-layout': 'shell-critical',
        'au-drawer': 'shell-critical',
        'au-drawer-item': 'shell-critical',
        'au-theme-toggle': 'shell-deferred',
        'au-bottom-nav': 'shell-deferred',
    };

    const routes = new Set();
    for (const comp of components) {
        const route = componentRouteMap[comp];
        if (route) {
            routes.add(route);
        }
    }

    return [...routes].sort();
}
