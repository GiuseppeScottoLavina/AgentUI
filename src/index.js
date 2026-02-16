/**
 * @fileoverview AgentUI v3.5 - Complete Framework (2026 Edition)
 * 
 * AI-Optimized UI Framework for Large-Scale Applications
 * 45+ Components | Memory-Safe | Agent-First | State-of-the-Art Performance
 */

// ============================================
// CORE
// ============================================
export { AuElement, define } from './core/AuElement.js';
export { bus, UIEvents, showToast } from './core/bus.js';
export { Theme } from './core/theme.js';
export { createStore } from './core/store.js';

/**
 * Returns a Promise that resolves when all AgentUI components are registered.
 * If already ready, resolves immediately (fast path).
 * 
 * @returns {Promise<void>}
 * @example
 * import { whenReady } from 'agentui-wc';
 * await whenReady();
 * document.querySelector('au-layout').doSomething();
 */
export function whenReady() {
    if (typeof window !== 'undefined' && window.AgentUI?.ready) {
        return Promise.resolve();
    }
    return new Promise(resolve => {
        if (typeof document !== 'undefined') {
            document.addEventListener('au-ready', () => resolve(), { once: true });
        } else {
            resolve(); // Node.js/test environment — no DOM, resolve immediately
        }
    });
}

export { Router } from './core/router.js';
export { http, HttpError } from './core/http.js';
export { createRipple, attachRipple, RippleMixin } from './core/ripple.js';

export { AgentAPI, getAuComponentTree, describe as describeComponent, findByLabel, getRegisteredComponents, enableVisualMarkers, disableVisualMarkers, getMarkerMap, getMarkerElement, getMCPActions } from './core/agent-api.js';

export { ComponentSchema, getComponentSchema, getAllSchemas, getSchemaComponents, getSchemaQuickRef } from './core/component-schema.js';

// ============================================
// CENTRALIZED UTILITIES 
// ============================================
export { Z_INDEX, injectLayerTokens } from './core/layers.js';
export { keyboard, KeyboardManager } from './core/keyboard.js';
export { breakpoints, BREAKPOINTS, BreakpointObserver } from './core/breakpoints.js';
export { escapeHTML, html, safe } from './core/utils.js';

// ============================================
// VIEW TRANSITIONS (2026  - Smooth animations)
// ============================================
export {
    transition,
    transitionNamed,
    navigateWithTransition,
    supportsViewTransitions
} from './core/transitions.js';

// ============================================
// TASK SCHEDULER (2026  - Priority scheduling)
// ============================================
export {
    scheduleTask,
    yieldToMain,
    processWithYield,
    runBackground,
    runImmediate,
    afterPaint,
    supportsScheduler
} from './core/scheduler.js';

// ============================================
// RENDER UTILITIES (Large-Scale App Optimization)
// ============================================
export {
    scheduler,
    memo,
    debounce,
    throttle,
    createVisibilityObserver,
    domBatch,
    processInChunks
} from './core/render.js';

// ============================================
// LAYOUT COMPONENTS
// ============================================
export { AuStack } from './components/au-stack.js';
export { AuGrid } from './components/au-grid.js';
export { AuContainer } from './components/au-container.js';
export { AuNavbar, AuNavbarBrand, AuNavbarLinks, AuNavbarActions } from './components/au-navbar.js';
export { AuSidebar, AuSidebarItem } from './components/au-sidebar.js';
export { AuDivider } from './components/au-divider.js';

// MD3 Responsive Layout (2026)
export { AuLayout } from './components/au-layout.js';
export { AuDrawer } from './components/au-drawer.js';
export { AuDrawerItem, AuNavItem } from './components/au-drawer-item.js';
export { AuBottomNav } from './components/au-bottom-nav.js';

// ============================================
// FORM COMPONENTS
// ============================================
export { AuButton } from './components/au-button.js';
export { AuInput } from './components/au-input.js';
export { AuTextarea } from './components/au-textarea.js';
export { AuForm } from './components/au-form.js';
export { AuDropdown, AuOption } from './components/au-dropdown.js';
export { AuCheckbox } from './components/au-checkbox.js';
export { AuSwitch } from './components/au-switch.js';
export { AuRadioGroup, AuRadio } from './components/au-radio.js';
export { AuChip } from './components/au-chip.js';

// ============================================
// DISPLAY COMPONENTS
// ============================================
export { AuCard } from './components/au-card.js';
export { AuCallout } from './components/au-callout.js';
export { AuTabs, AuTab } from './components/au-tabs.js';
export { AuAlert } from './components/au-alert.js';
export { AuBadge } from './components/au-badge.js';
export { AuProgress } from './components/au-progress.js';
export { AuTable, AuThead, AuTbody, AuTr, AuTh, AuTd } from './components/au-table.js';
export { AuAvatar } from './components/au-avatar.js';
export { AuSkeleton } from './components/au-skeleton.js';

// ============================================
// FEEDBACK COMPONENTS
// ============================================
export { AuSpinner } from './components/au-spinner.js';
export { AuModal } from './components/au-modal.js';
export { AuToast, Toast } from './components/au-toast.js';
export { AuTooltip } from './components/au-tooltip.js';
export { AuConfirm, auConfirm } from './components/au-confirm.js';

// ============================================
// ROUTING COMPONENTS
// ============================================
export { AuRouter } from './components/au-router.js';
export { AuPage } from './components/au-page.js';

// ============================================
// TOAST LISTENER REGISTRATION (Single point)
// Uses LightBus-native hasListeners() instead of global flags
// ============================================
import { Toast as ToastService } from './components/au-toast.js';
import { bus as toastBus, UIEvents as ToastEvents } from './core/bus.js';

if (!toastBus.hasListeners(ToastEvents.TOAST_SHOW)) {
    toastBus.on(ToastEvents.TOAST_SHOW, (data) => {
        ToastService.show(data.message, data);
    });
}

// ============================================
// UTILITY COMPONENTS
// ============================================
export { AuThemeToggle } from './components/au-theme-toggle.js';
export { AuIcon, IconNames } from './components/au-icon.js';
export { AuSplash } from './components/au-splash.js';

// ============================================
// PERFORMANCE COMPONENTS (Large-Scale)
// ============================================
export { AuVirtualList } from './components/au-virtual-list.js';
export { AuLazy } from './components/au-lazy.js';
export { AuIf } from './components/au-if.js';
export { AuRepeat } from './components/au-repeat.js';
export { AuFetch } from './components/au-fetch.js';

// AI-First Components (2026)
export { AuDataTable } from './components/au-datatable.js';
export { AuSchemaForm } from './components/au-schema-form.js';
export { AuPromptInput, AuCodeBlock, AuAgentToolbar, AuMessageBubble } from './components/au-prompt-ui.js';
export { AuErrorBoundary, getErrors, clearErrors } from './components/au-error-boundary.js';

// ============================================
// DOCUMENTATION COMPONENTS
// ============================================
export { AuCode } from './components/au-code.js';
export { AuApiTable, AuApiRow } from './components/au-api-table.js';
export { AuExample } from './components/au-example.js';
export { AuDocPage } from './components/au-doc-page.js';

// ============================================
// AUTO-REGISTER ALL COMPONENTS
// ============================================
import './components/au-stack.js';
import './components/au-grid.js';
import './components/au-container.js';
import './components/au-navbar.js';
import './components/au-sidebar.js';
import './components/au-divider.js';
import './components/au-button.js';
import './components/au-input.js';
import './components/au-textarea.js';
import './components/au-form.js';
import './components/au-card.js';
import './components/au-callout.js';
import './components/au-tabs.js';
import './components/au-alert.js';
import './components/au-badge.js';
import './components/au-spinner.js';
import './components/au-progress.js';
import './components/au-dropdown.js';
import './components/au-checkbox.js';
import './components/au-switch.js';
import './components/au-radio.js';
import './components/au-chip.js';
import './components/au-modal.js';
import './components/au-toast.js';
import './components/au-tooltip.js';
import './components/au-theme-toggle.js';
import './components/au-icon.js';
import './components/au-splash.js';
import './components/au-table.js';
import './components/au-avatar.js';
import './components/au-skeleton.js';
import './components/au-virtual-list.js';
import './components/au-lazy.js';
import './components/au-if.js';
import './components/au-repeat.js';
import './components/au-confirm.js';
import './components/au-fetch.js';

import './components/au-datatable.js';
import './components/au-schema-form.js';
import './components/au-prompt-ui.js';
import './components/au-error-boundary.js';

// MD3 Responsive Layout
import './components/au-layout.js';
import './components/au-drawer.js';
import './components/au-drawer-item.js';
import './components/au-bottom-nav.js';

// ============================================
// DOCUMENTATION COMPONENTS
// ============================================
import './components/au-code.js';
import './components/au-api-table.js';
import './components/au-example.js';
import './components/au-doc-page.js';

// ============================================
// GLOBAL EXPORT (for IIFE bundle browser usage)
// ============================================
import { Theme } from './core/theme.js';
import { bus, UIEvents, showToast } from './core/bus.js';
import { createStore } from './core/store.js';

import { Router } from './core/router.js';
import { http, HttpError } from './core/http.js';

import { AgentAPI, getAuComponentTree, describe as describeComponent, findByLabel, getRegisteredComponents, enableVisualMarkers, disableVisualMarkers, getMarkerMap, getMarkerElement, getMCPActions } from './core/agent-api.js';
import { getComponentSchema, getAllSchemas, getSchemaComponents, getSchemaQuickRef } from './core/component-schema.js';

import { getErrors, clearErrors } from './components/au-error-boundary.js';
import { auConfirm } from './components/au-confirm.js';
import { AuElement } from './core/AuElement.js';
import { ALL_COMPONENT_TAGS } from './core/constants.js';
import { loadDescriptions as _loadDescriptions, createDiscoverAll } from './core/discovery.js';

if (typeof window !== 'undefined') {
    window.AgentUI = {
        // Theme
        Theme,
        // Bus
        bus,
        // Store
        createStore,
        UIEvents,
        showToast,
        // Readiness
        whenReady,

        // Router
        Router,
        // HTTP
        http,
        HttpError,

        AgentAPI,
        getAuComponentTree,
        describeComponent,
        findByLabel,
        getRegisteredComponents,

        // Enterprise: Error Handling
        getErrors,
        clearErrors,
        // 2026 Agent: Visual Markers (multimodal)
        enableVisualMarkers,
        disableVisualMarkers,
        getMarkerMap,
        getMarkerElement,
        // 2026 Agent: MCP Actions (standard protocol)
        getMCPActions,
        // 2026 Agent: Programmatic Dialogs
        auConfirm,
        // 2026 Agent: Component Schema (structured metadata)
        getComponentSchema,
        getAllSchemas,
        getSchemaComponents,
        getSchemaQuickRef,


        // 🤖 AI AGENT DISCOVERY (2026)
        // Use this to get ALL component info in one call
        // Lazy-loads the describe catalog — zero cost until called
        discoverAll: createDiscoverAll(AuElement),

        // 🤖 Pre-load describe catalog without querying components
        // Uses fetch() to keep catalog OUT of the main bundle (zero cost for regular users)
        async loadDescriptions() {
            await _loadDescriptions(AuElement);
        }
    };

    // ============================================
    // AU-READY EVENT (Agent DX)
    // Fires when all AgentUI components are registered
    // Usage: document.addEventListener('au-ready', () => { ... })
    // ============================================
    const emitAuReady = () => {
        if (window.AGENTUI_DEBUG) {
            console.log('[AgentUI] All components registered, emitting au-ready');
        }
        window.AgentUI.ready = true;
        document.dispatchEvent(new CustomEvent('au-ready', {
            detail: {
                timestamp: Date.now()
            }
        }));
    };

    // Emit after all imports have been processed and DOM is ready.
    // setTimeout(0) is used instead of queueMicrotask because microtasks
    // run during module evaluation, BEFORE all ES module import side-effects
    // (customElements.define calls) have completed. setTimeout defers to the
    // next task, guaranteeing all components are registered.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', emitAuReady, { once: true });
    } else {
        setTimeout(emitAuReady, 0);
    }

    // Debug mode logging
    if (window.AGENTUI_DEBUG) {
        console.log('[AgentUI] Debug mode enabled');
        console.log('[AgentUI] Registered components:', getRegisteredComponents());
    }
}

