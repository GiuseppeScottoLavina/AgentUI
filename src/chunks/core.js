/**
 * @fileoverview AgentUI Core Chunk
 * Essential core functionality - always loaded first
 */

// Base class and utilities
export { AuElement, define } from '../core/AuElement.js';
export { bus, UIEvents, showToast } from '../core/bus.js';
export { Theme } from '../core/theme.js';
export { createStore, appStore } from '../core/store.js';
export { createRipple, attachRipple, RippleMixin } from '../core/ripple.js';

// View transitions
export {
    transition,
    transitionNamed,
    navigateWithTransition,
    supportsViewTransitions
} from '../core/transitions.js';

// Task scheduler
export {
    scheduleTask,
    yieldToMain,
    processWithYield,
    runBackground,
    runImmediate,
    supportsScheduler
} from '../core/scheduler.js';

// Render utilities
export {
    scheduler,
    memo,
    debounce,
    throttle,
    createVisibilityObserver,
    domBatch,
    processInChunks
} from '../core/render.js';

// Theme toggle (essential utility)
export { AuThemeToggle } from '../components/au-theme-toggle.js';
import '../components/au-theme-toggle.js';

// ============================================
// TOAST LISTENER REGISTRATION (Singleton)
// Uses LightBus-native hasListeners() instead of global flags
// ============================================
import { Toast as ToastService } from '../components/au-toast.js';
import { bus as toastBus, UIEvents as ToastEvents } from '../core/bus.js';

if (!toastBus.hasListeners(ToastEvents.TOAST_SHOW)) {
    toastBus.on(ToastEvents.TOAST_SHOW, (data) => {
        ToastService.show(data.message, data);
    });
}

