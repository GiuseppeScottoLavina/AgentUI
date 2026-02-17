/**
 * @fileoverview Shared Constants for AgentUI Framework
 * 
 * Central source of truth for framework-wide constants.
 * Eliminates duplication between index.js and chunks/core.js.
 */

/**
 * Complete list of all AgentUI component tags.
 * Used by discoverAll() and other discovery APIs.
 * 
 * @type {string[]}
 */
export const ALL_COMPONENT_TAGS = [
    'au-button', 'au-input', 'au-textarea', 'au-card', 'au-modal',
    'au-alert', 'au-toast', 'au-checkbox', 'au-switch', 'au-radio',
    'au-dropdown', 'au-tabs', 'au-tab', 'au-chip', 'au-badge',
    'au-avatar', 'au-progress', 'au-spinner', 'au-skeleton',
    'au-tooltip', 'au-table', 'au-datatable', 'au-form',
    'au-stack', 'au-grid', 'au-container', 'au-divider',
    'au-drawer', 'au-sidebar', 'au-navbar', 'au-bottom-nav',
    'au-layout', 'au-router', 'au-page', 'au-theme-toggle',
    'au-splash', 'au-virtual-list', 'au-lazy', 'au-repeat',
    'au-fetch', 'au-confirm', 'au-schema-form', 'au-prompt-ui',
    'au-error-boundary', 'au-code', 'au-callout', 'au-icon',
    'au-api-table', 'au-example', 'au-doc-page',
    'au-show', 'au-portal', 'au-intersection', 'au-media',
    'au-transition', 'au-timer'
];
