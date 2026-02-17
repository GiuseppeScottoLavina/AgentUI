/**
 * @fileoverview AgentUI Slim Entry Point (No Agent Modules)
 * 
 * Same as index.js but without agent-api.js and component-schema.js.
 * Produces a smaller IIFE bundle for pages that don't need AI agent APIs.
 * Agent features can be loaded separately via agentui-agent.min.js.
 */

// ============================================
// CORE
// ============================================
export { AuElement, define } from './core/AuElement.js';
export { bus, UIEvents, showToast } from './core/bus.js';
export { Theme } from './core/theme.js';
export { createStore } from './core/store.js';

export function whenReady() {
    if (typeof window !== 'undefined' && window.AgentUI?.ready) {
        return Promise.resolve();
    }
    return new Promise(resolve => {
        if (typeof document !== 'undefined') {
            document.addEventListener('au-ready', () => resolve(), { once: true });
        } else {
            resolve();
        }
    });
}

export { Router } from './core/router.js';
export { http, HttpError } from './core/http.js';
export { createRipple, attachRipple, RippleMixin } from './core/ripple.js';

// NOTE: agent-api and component-schema are NOT included in this entry point.
// Load them separately via index-agent.js or agentui-agent.min.js.

// ============================================
// CENTRALIZED UTILITIES 
// ============================================
export { Z_INDEX, injectLayerTokens } from './core/layers.js';
export { keyboard, KeyboardManager } from './core/keyboard.js';
export { breakpoints, BREAKPOINTS, BreakpointObserver } from './core/breakpoints.js';
export { escapeHTML, html, safe } from './core/utils.js';

// ============================================
// VIEW TRANSITIONS
// ============================================
export {
    transition,
    transitionNamed,
    navigateWithTransition,
    supportsViewTransitions
} from './core/transitions.js';

// ============================================
// TASK SCHEDULER
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
// RENDER UTILITIES
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
// TOAST LISTENER REGISTRATION
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
// PERFORMANCE COMPONENTS
// ============================================
export { AuVirtualList } from './components/au-virtual-list.js';
export { AuLazy } from './components/au-lazy.js';
export { AuIf } from './components/au-if.js';
export { AuRepeat } from './components/au-repeat.js';
export { AuShow } from './components/au-show.js';
export { AuPortal } from './components/au-portal.js';
export { AuIntersection } from './components/au-intersection.js';
export { AuMedia } from './components/au-media.js';
export { AuTransition } from './components/au-transition.js';
export { AuTimer } from './components/au-timer.js';
export { AuFetch } from './components/au-fetch.js';
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
import './components/au-repeat.js';
import './components/au-show.js';
import './components/au-portal.js';
import './components/au-intersection.js';
import './components/au-media.js';
import './components/au-transition.js';
import './components/au-timer.js';
import './components/au-confirm.js';
import './components/au-fetch.js';
import './components/au-datatable.js';
import './components/au-schema-form.js';
import './components/au-prompt-ui.js';
import './components/au-error-boundary.js';
import './components/au-layout.js';
import './components/au-drawer.js';
import './components/au-drawer-item.js';
import './components/au-bottom-nav.js';
import './components/au-code.js';
import './components/au-api-table.js';
import './components/au-example.js';
import './components/au-doc-page.js';

// ============================================
// GLOBAL EXPORT (Slim - no agent modules)
// ============================================
import { Theme } from './core/theme.js';
import { bus, UIEvents, showToast } from './core/bus.js';
import { createStore } from './core/store.js';
import { Router } from './core/router.js';
import { http, HttpError } from './core/http.js';
import { getErrors, clearErrors } from './components/au-error-boundary.js';
import { auConfirm } from './components/au-confirm.js';
import { AuElement } from './core/AuElement.js';
import { loadDescriptions as _loadDescriptions, createDiscoverAll } from './core/discovery.js';

if (typeof window !== 'undefined') {
    window.AgentUI = {
        Theme,
        bus,
        createStore,
        UIEvents,
        showToast,
        whenReady,
        Router,
        http,
        HttpError,
        getErrors,
        clearErrors,
        auConfirm,
        ready: false,

        // Discovery (still available — lightweight)
        discoverAll: createDiscoverAll(AuElement),
        async loadDescriptions() {
            await _loadDescriptions(AuElement);
        }
    };

    const emitAuReady = () => {
        window.AgentUI.ready = true;
        document.dispatchEvent(new CustomEvent('au-ready', {
            detail: { timestamp: Date.now() }
        }));
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', emitAuReady, { once: true });
    } else {
        setTimeout(emitAuReady, 0);
    }
}
