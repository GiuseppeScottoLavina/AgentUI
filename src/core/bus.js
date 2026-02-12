/**
 * @fileoverview AgentUI EventBus - Lightweight Built-in Implementation
 * 
 * Zero-dependency event bus for AgentUI components.
 * Built-in lightweight event bus for AgentUI components.
 * 
 * Performance: ~100M ops/sec with emitSync (simple Map + Set)
 * Features: 
 *  - emit/on/off/once with wildcard support
 *  - Request/response pattern (RPC)
 *  - Inbound/outbound hooks for observability
 *  - Capability discovery for AI agents
 *  - Health monitoring
 */

/** AgentUI framework version */
export const AGENTUI_VERSION = '0.1.116';

// Window Singleton Pattern — shared bus across split bundles/chunks
const GLOBAL_BUS_KEY = '__AGENTUI_BUS__';
const globalScope = typeof window !== 'undefined' ? window : globalThis;

// AI Agent Discovery: Capability negotiation
const AGENTUI_CAPABILITIES = [
    'ui:toast', 'ui:modal', 'ui:theme', 'ui:tabs',
    'ui:dropdown', 'ui:form', 'ui:grid', 'ui:stack', 'ui:virtual-list'
];

const AGENTUI_META = {
    type: 'ui-framework',
    version: AGENTUI_VERSION,
    description: 'AI-Optimized UI Framework - Web Components Edition'
};

// ============================================================================
// Lightweight Event Emitter (LightBus)
// ============================================================================
class LightBus {
    #listeners = new Map();
    #handlers = new Map();
    #inboundHooks = new Set();
    #outboundHooks = new Set();
    #maxListeners = 100;
    #debug = false;
    #createdAt = Date.now();

    peerId;
    capabilities;
    meta;

    constructor(config = {}) {
        this.peerId = config.peerId ?? 'default';
        this.capabilities = config.capabilities ?? [];
        this.meta = config.meta ?? {};
        this.#debug = config.debug ?? false;
    }

    on(event, callback) {
        if (!this.#listeners.has(event)) {
            this.#listeners.set(event, new Set());
        }
        const wrappedCb = callback;
        this.#listeners.get(event).add(wrappedCb);

        // Warn on potential memory leak (Node.js EventEmitter pattern)
        const count = this.#listeners.get(event).size;
        if (count > this.#maxListeners) {
            console.warn(
                `[AgentUI] Possible event leak: "${event}" has ${count} listeners ` +
                `(maxListeners: ${this.#maxListeners}). Use setMaxListeners() to increase.`
            );
        }

        return { unsubscribe: () => this.#listeners.get(event)?.delete(wrappedCb) };
    }

    off(event, callback) {
        this.#listeners.get(event)?.delete(callback);
    }

    emitSync(event, data) {
        let payload = { event, data };

        // Apply outbound hooks
        for (const hook of this.#outboundHooks) {
            payload = hook(payload, { event }) ?? payload;
        }

        const listeners = this.#listeners.get(event);
        if (listeners) {
            for (const cb of listeners) {
                // Apply inbound hooks
                let inPayload = payload;
                for (const hook of this.#inboundHooks) {
                    inPayload = hook(inPayload, { event }) ?? inPayload;
                }
                cb(inPayload);
            }
        }

        // Wildcard support: 'ui:*' matches 'ui:toast:show'
        for (const [pattern, patternListeners] of this.#listeners) {
            if (pattern.endsWith('*') && event.startsWith(pattern.slice(0, -1)) && pattern !== event) {
                for (const cb of patternListeners) {
                    cb(payload);
                }
            }
        }
    }

    async emit(event, data) {
        this.emitSync(event, data);
        return { delivered: true, event };
    }

    signal(event, data) {
        this.emitSync(event, data);
    }

    hasListeners(event) {
        return (this.#listeners.get(event)?.size ?? 0) > 0;
    }

    // Request/Response pattern
    handle(name, handler) {
        this.#handlers.set(name, handler);
        return { unsubscribe: () => this.#handlers.delete(name) };
    }

    unhandle(name) {
        this.#handlers.delete(name);
    }

    async request(peerId, handler, payload) {
        const h = this.#handlers.get(handler);
        if (!h) throw new Error(`No handler for '${handler}'`);
        return h(payload);
    }

    async broadcastRequest(handler, payload) {
        return this.request(this.peerId, handler, payload);
    }

    // Hooks for observability
    addInboundHook(fn) {
        this.#inboundHooks.add(fn);
        return () => this.#inboundHooks.delete(fn);
    }

    addOutboundHook(fn) {
        this.#outboundHooks.add(fn);
        return () => this.#outboundHooks.delete(fn);
    }

    // Lifecycle
    setMaxListeners(n) { this.#maxListeners = n; }
    get debug() { return this.#debug; }
    get peers() { return []; }
    get peerCount() { return 0; }

    healthCheck() {
        return {
            status: 'healthy',
            peerId: this.peerId,
            uptime: Date.now() - this.#createdAt,
            listeners: this.#listeners.size,
            handlers: this.#handlers.size
        };
    }

    destroy() {
        this.#listeners.clear();
        this.#handlers.clear();
        this.#inboundHooks.clear();
        this.#outboundHooks.clear();
    }
}

// ============================================================================
// Singleton Instance
// ============================================================================
if (!globalScope[GLOBAL_BUS_KEY]) {
    globalScope[GLOBAL_BUS_KEY] = new LightBus({
        peerId: 'agentui',
        capabilities: AGENTUI_CAPABILITIES,
        meta: AGENTUI_META
    });
}

const lightBus = globalScope[GLOBAL_BUS_KEY];

// ============================================================================
// COMPONENT CAPABILITY REGISTRY
// ============================================================================
const COMPONENT_REGISTRY_KEY = '__AGENTUI_COMPONENT_REGISTRY__';
if (!globalScope[COMPONENT_REGISTRY_KEY]) {
    globalScope[COMPONENT_REGISTRY_KEY] = new Map();
}
const componentRegistry = globalScope[COMPONENT_REGISTRY_KEY];

/**
 * Simplified bus wrapper for AgentUI components
 */
export const bus = {
    /**
     * Subscribe to a signal
     * @param {string} event - Event name (supports wildcards 'ui:*')
     * @param {Function} callback - Handler function
     * @returns {Function} Unsubscribe function
     */
    on(event, callback) {
        const subscription = lightBus.on(event, (eventData) => {
            callback(eventData.data ?? eventData);
        });
        return () => subscription.unsubscribe();
    },

    /** Subscribe once */
    once(event, callback) {
        const unsub = this.on(event, (data) => {
            unsub();
            callback(data);
        });
    },

    /** Unsubscribe */
    off(event, callback) {
        lightBus.off(event, callback);
    },

    /**
     * Emit a signal - Synchronous for maximum performance
     */
    emit(event, data) {
        return lightBus.emitSync(event, data);
    },

    /** Async emit with confirmation */
    async emitAsync(event, data) {
        return lightBus.emit(event, data);
    },

    /** Broadcast signal */
    signal(event, data) {
        lightBus.signal(event, data);
    },

    /** Request/Response pattern (RPC) */
    async request(peerId, handler, payload) {
        return lightBus.request(peerId, handler, payload);
    },

    /** Broadcast request */
    async broadcastRequest(handler, payload) {
        return lightBus.broadcastRequest(handler, payload);
    },

    /** Register a request handler */
    handle(name, handler) {
        return lightBus.handle(name, handler);
    },

    /** Remove handler */
    unhandle(name) {
        lightBus.unhandle(name);
    },

    /** Destroy - prevent memory leaks */
    destroy() {
        lightBus.destroy();
    },

    /** Set max listeners */
    setMaxListeners(n) {
        lightBus.setMaxListeners(n);
    },

    /** Peer management */
    get peerId() { return lightBus.peerId; },
    get peers() { return lightBus.peers; },
    get peerCount() { return lightBus.peerCount; },

    /** Check if listeners exist for a signal */
    hasListeners(event) { return lightBus.hasListeners(event); },

    /** Direct access to bus instance */
    get raw() { return lightBus; }
};

// Predefined UI events
export const UIEvents = {
    TOAST_SHOW: 'ui:toast:show',
    TOAST_DISMISS: 'ui:toast:dismiss',
    MODAL_OPEN: 'ui:modal:open',
    MODAL_CLOSE: 'ui:modal:close',
    THEME_CHANGE: 'ui:theme:change',
    TAB_CHANGE: 'ui:tab:change',
    DROPDOWN_SELECT: 'ui:dropdown:select',
    FORM_SUBMIT: 'ui:form:submit',
    FORM_VALIDATE: 'ui:form:validate'
};

/** Show toast helper */
export const showToast = (message, options = {}) => {
    bus.emit(UIEvents.TOAST_SHOW, { message, ...options });
};

// ============================================================================
// AI AGENT FEATURES
// ============================================================================

/** Check if debug mode is enabled */
export const isDebugEnabled = () => lightBus.debug;

/** @deprecated Use isDebugEnabled() instead */
export const enableDebug = () => {
    console.warn('[AgentUI] enableDebug() is deprecated. Debug mode is set at creation.');
    return lightBus.debug;
};

/** @deprecated Debug mode cannot be toggled after creation */
export const disableDebug = () => {
    console.warn('[AgentUI] disableDebug() is deprecated. Debug mode is set at creation.');
};

/** Get health status */
export const getHealth = () => {
    return lightBus.healthCheck?.() ?? {
        status: 'unknown',
        peerId: lightBus.peerId,
        note: 'healthCheck not available'
    };
};

/** Get framework capabilities */
export const getCapabilities = () => ({
    peerId: lightBus.peerId,
    capabilities: AGENTUI_CAPABILITIES,
    meta: AGENTUI_META,
    version: AGENTUI_VERSION
});

/** Add inbound hook for message interception */
export const addInboundHook = (fn) => {
    return lightBus.addInboundHook?.(fn) ?? (() => { });
};

/** Add outbound hook for message interception */
export const addOutboundHook = (fn) => {
    return lightBus.addOutboundHook?.(fn) ?? (() => { });
};

// ============================================================================
// COMPONENT CAPABILITY REGISTRATION
// ============================================================================

/** Register a component's capabilities */
export const registerComponent = (tagName, capabilities) => {
    componentRegistry.set(tagName, { ...capabilities, registeredAt: Date.now() });
};

/** Unregister a component */
export const unregisterComponent = (tagName) => {
    componentRegistry.delete(tagName);
};

/** Get a specific component's capabilities */
export const getComponentCapabilities = (tagName) => {
    return componentRegistry.get(tagName) ?? null;
};

/** Get all registered components and their capabilities */
export const getRegisteredComponents = () => {
    return Object.fromEntries(componentRegistry);
};

/** Check if a specific signal has any registered component handlers */
export const getComponentsForSignal = (signal) => {
    const handlers = [];
    for (const [tagName, caps] of componentRegistry) {
        if (caps.signals?.includes(signal)) {
            handlers.push(tagName);
        }
    }
    return handlers;
};
