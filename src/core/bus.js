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

/** @type {string} AgentUI framework version */
export const AGENTUI_VERSION = '0.1.144';

/** @private Window singleton key for shared bus across split bundles/chunks */
const GLOBAL_BUS_KEY = '__AGENTUI_BUS__';
/** @private Global scope reference (window or globalThis) */
const globalScope = typeof window !== 'undefined' ? window : globalThis;

/** @private AI Agent Discovery: list of UI capabilities for negotiation */
const AGENTUI_CAPABILITIES = [
    'ui:toast', 'ui:modal', 'ui:theme', 'ui:tabs',
    'ui:dropdown', 'ui:form', 'ui:grid', 'ui:stack', 'ui:virtual-list'
];

/** @private Framework metadata exposed to bus peers */
const AGENTUI_META = {
    type: 'ui-framework',
    version: AGENTUI_VERSION,
    description: 'AI-Optimized UI Framework - Web Components Edition'
};

// ============================================================================
// Lightweight Event Emitter (LightBus)
// ============================================================================

/**
 * Lightweight event emitter with wildcard support, request/response RPC,
 * and observability hooks. Used as the singleton backbone for all AgentUI
 * inter-component communication.
 *
 * @class
 * @private
 */
class LightBus {
    /** @type {Map<string, Set<Function>>} Exact-match event → listeners */
    #listeners = new Map();
    /** @type {Map<string, Set<Function>>} Wildcard prefix → listeners (P1.5 perf fix) */
    #wildcards = new Map();
    /** @type {Map<string, Function>} RPC handler name → handler function */
    #handlers = new Map();
    /** @type {Set<Function>} Inbound hooks for message interception */
    #inboundHooks = new Set();
    /** @type {Set<Function>} Outbound hooks for message interception */
    #outboundHooks = new Set();
    /** @type {number} Maximum listeners per event before warning */
    #maxListeners = 100;
    /** @type {boolean} Debug mode flag */
    #debug = false;
    /** @type {number} Creation timestamp for uptime tracking */
    #createdAt = Date.now();

    /** @type {string} Unique peer identifier */
    peerId;
    /** @type {string[]} List of supported capabilities */
    capabilities;
    /** @type {Object} Framework metadata */
    meta;

    /**
     * @param {Object} [config={}] - Bus configuration
     * @param {string} [config.peerId='default'] - Unique peer identifier
     * @param {string[]} [config.capabilities=[]] - Supported capabilities
     * @param {Object} [config.meta={}] - Framework metadata
     * @param {boolean} [config.debug=false] - Enable debug logging
     */
    constructor(config = {}) {
        this.peerId = config.peerId ?? 'default';
        this.capabilities = config.capabilities ?? [];
        this.meta = config.meta ?? {};
        this.#debug = config.debug ?? false;
    }

    /**
     * Subscribe to an event. Supports wildcard suffixes (e.g. `'ui:*'`).
     * @param {string} event - Event name or wildcard pattern
     * @param {Function} callback - Listener function
     * @returns {{ unsubscribe: Function }} Subscription with unsubscribe method
     */
    on(event, callback) {
        // P1.5 perf fix: route wildcards to dedicated Map for O(1) prefix matching
        if (event.endsWith('*')) {
            const prefix = event.slice(0, -1);
            if (!this.#wildcards.has(prefix)) {
                this.#wildcards.set(prefix, new Set());
            }
            this.#wildcards.get(prefix).add(callback);
            return { unsubscribe: () => this.#wildcards.get(prefix)?.delete(callback) };
        }

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

    /**
     * Unsubscribe a listener from an event.
     * @param {string} event - Event name or wildcard pattern
     * @param {Function} callback - The original listener to remove
     */
    off(event, callback) {
        if (event.endsWith('*')) {
            const prefix = event.slice(0, -1);
            this.#wildcards.get(prefix)?.delete(callback);
            return;
        }
        this.#listeners.get(event)?.delete(callback);
    }

    /**
     * Emit an event synchronously. Applies outbound/inbound hooks, then
     * notifies exact-match and wildcard listeners.
     * @param {string} event - Event name
     * @param {*} data - Event payload
     */
    emitSync(event, data) {
        let payload = { event, data };

        // Apply outbound hooks (once per event)
        for (const hook of this.#outboundHooks) {
            payload = hook(payload, { event }) ?? payload;
        }

        // Apply inbound hooks (once per event, not per listener)
        let inPayload = payload;
        for (const hook of this.#inboundHooks) {
            inPayload = hook(inPayload, { event }) ?? inPayload;
        }

        const listeners = this.#listeners.get(event);
        if (listeners) {
            for (const cb of listeners) {
                cb(inPayload);
            }
        }

        // P1.5 perf fix: Wildcard matching via dedicated Map (no full scan)
        for (const [prefix, cbs] of this.#wildcards) {
            if (event.startsWith(prefix)) {
                for (const cb of cbs) {
                    cb(inPayload);
                }
            }
        }
    }

    /**
     * Emit an event asynchronously.
     * @param {string} event - Event name
     * @param {*} data - Event payload
     * @returns {Promise<{ delivered: boolean, event: string }>}
     */
    async emit(event, data) {
        this.emitSync(event, data);
        return { delivered: true, event };
    }

    /**
     * Fire-and-forget signal broadcast (alias for emitSync).
     * @param {string} event - Event name
     * @param {*} data - Event payload
     */
    signal(event, data) {
        this.emitSync(event, data);
    }

    /**
     * Check if an event has any registered listeners.
     * @param {string} event - Event name
     * @returns {boolean}
     */
    hasListeners(event) {
        return (this.#listeners.get(event)?.size ?? 0) > 0;
    }

    /**
     * Register an RPC handler by name.
     * @param {string} name - Handler name
     * @param {Function} handler - Handler function
     * @returns {{ unsubscribe: Function }} Subscription with unsubscribe method
     */
    handle(name, handler) {
        this.#handlers.set(name, handler);
        return { unsubscribe: () => this.#handlers.delete(name) };
    }

    /**
     * Remove a registered RPC handler.
     * @param {string} name - Handler name
     */
    unhandle(name) {
        this.#handlers.delete(name);
    }

    /**
     * Send an RPC request to a named handler.
     * @param {string} peerId - Target peer (unused in LightBus, kept for API parity)
     * @param {string} handler - Handler name
     * @param {*} payload - Request payload
     * @returns {Promise<*>} Handler result
     * @throws {Error} If no handler is registered for the given name
     */
    async request(peerId, handler, payload) {
        const h = this.#handlers.get(handler);
        if (!h) throw new Error(`No handler for '${handler}'`);
        return h(payload);
    }

    /**
     * Broadcast an RPC request to own peer.
     * @param {string} handler - Handler name
     * @param {*} payload - Request payload
     * @returns {Promise<*>} Handler result
     */
    async broadcastRequest(handler, payload) {
        return this.request(this.peerId, handler, payload);
    }

    /**
     * Add an inbound hook for message interception (observability).
     * @param {Function} fn - Hook function `(payload, context) => payload`
     * @returns {Function} Remove-hook function
     */
    addInboundHook(fn) {
        this.#inboundHooks.add(fn);
        return () => this.#inboundHooks.delete(fn);
    }

    /**
     * Add an outbound hook for message interception (observability).
     * @param {Function} fn - Hook function `(payload, context) => payload`
     * @returns {Function} Remove-hook function
     */
    addOutboundHook(fn) {
        this.#outboundHooks.add(fn);
        return () => this.#outboundHooks.delete(fn);
    }

    /**
     * Set maximum listeners per event before leak warnings.
     * @param {number} n - Max listener count
     */
    setMaxListeners(n) { this.#maxListeners = n; }

    /** @returns {boolean} Whether debug mode is enabled */
    get debug() { return this.#debug; }

    /** @returns {Array} Connected peers (always empty in LightBus — no networking) */
    get peers() { return []; }

    /** @returns {number} Connected peer count (always 0 in LightBus) */
    get peerCount() { return 0; }

    /**
     * Get bus health status.
     * @returns {{ status: string, peerId: string, uptime: number, listeners: number, handlers: number }}
     */
    healthCheck() {
        return {
            status: 'healthy',
            peerId: this.peerId,
            uptime: Date.now() - this.#createdAt,
            listeners: this.#listeners.size,
            handlers: this.#handlers.size
        };
    }

    /**
     * Destroy the bus — clears all listeners, handlers, and hooks.
     */
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

/** @private Track original→wrapped callback mapping for bus.off() support */
const _callbackMap = new WeakMap();

/**
 * Simplified bus wrapper for AgentUI components.
 * All public API interactions go through this object rather than the
 * internal LightBus singleton.
 *
 * @namespace bus
 */
export const bus = {
    /**
     * Subscribe to a signal
     * @param {string} event - Event name (supports wildcards 'ui:*')
     * @param {Function} callback - Handler function
     * @returns {Function} Unsubscribe function
     */
    on(event, callback) {
        const wrappedCb = (eventData) => {
            callback(eventData.data ?? eventData);
        };
        // Store mapping so off() can find the wrapped version
        if (!_callbackMap.has(callback)) {
            _callbackMap.set(callback, new Map());
        }
        _callbackMap.get(callback).set(event, wrappedCb);

        const subscription = lightBus.on(event, wrappedCb);
        return () => {
            subscription.unsubscribe();
            _callbackMap.get(callback)?.delete(event);
        };
    },

    /**
     * Subscribe to a signal once — auto-unsubscribes after first call.
     * @param {string} event - Event name
     * @param {Function} callback - Handler function (receives data payload)
     */
    once(event, callback) {
        const unsub = this.on(event, (data) => {
            unsub();
            callback(data);
        });
    },

    /**
     * Unsubscribe a listener from a signal.
     * @param {string} event - Event name
     * @param {Function} callback - The original listener passed to `on()`
     */
    off(event, callback) {
        const wrappedCb = _callbackMap.get(callback)?.get(event);
        if (wrappedCb) {
            lightBus.off(event, wrappedCb);
            _callbackMap.get(callback)?.delete(event);
        }
    },

    /**
     * Emit a signal synchronously for maximum performance.
     * @param {string} event - Event name (e.g. `UIEvents.TOAST_SHOW`)
     * @param {*} data - Event payload
     */
    emit(event, data) {
        return lightBus.emitSync(event, data);
    },

    /**
     * Emit a signal asynchronously with delivery confirmation.
     * @param {string} event - Event name
     * @param {*} data - Event payload
     * @returns {Promise<{ delivered: boolean, event: string }>}
     */
    async emitAsync(event, data) {
        return lightBus.emit(event, data);
    },

    /**
     * Fire-and-forget signal broadcast.
     * @param {string} event - Event name
     * @param {*} data - Event payload
     */
    signal(event, data) {
        lightBus.signal(event, data);
    },

    /**
     * Send an RPC request to a peer handler.
     * @param {string} peerId - Target peer identifier
     * @param {string} handler - Handler name
     * @param {*} payload - Request payload
     * @returns {Promise<*>} Handler result
     */
    async request(peerId, handler, payload) {
        return lightBus.request(peerId, handler, payload);
    },

    /**
     * Broadcast an RPC request.
     * @param {string} handler - Handler name
     * @param {*} payload - Request payload
     * @returns {Promise<*>} Handler result
     */
    async broadcastRequest(handler, payload) {
        return lightBus.broadcastRequest(handler, payload);
    },

    /**
     * Register an RPC request handler.
     * @param {string} name - Handler name
     * @param {Function} handler - Handler function
     * @returns {{ unsubscribe: Function }} Subscription with unsubscribe method
     */
    handle(name, handler) {
        return lightBus.handle(name, handler);
    },

    /**
     * Remove a registered RPC handler.
     * @param {string} name - Handler name
     */
    unhandle(name) {
        lightBus.unhandle(name);
    },

    /** Destroy the bus — clears all listeners and handlers to prevent memory leaks. */
    destroy() {
        lightBus.destroy();
    },

    /**
     * Set maximum listeners per event before leak warnings.
     * @param {number} n - Max listener count
     */
    setMaxListeners(n) {
        lightBus.setMaxListeners(n);
    },

    /** @returns {string} This peer's unique identifier */
    get peerId() { return lightBus.peerId; },
    /** @returns {Array} Connected peers */
    get peers() { return lightBus.peers; },
    /** @returns {number} Connected peer count */
    get peerCount() { return lightBus.peerCount; },

    /**
     * Check if listeners exist for a given signal.
     * @param {string} event - Event name
     * @returns {boolean}
     */
    hasListeners(event) { return lightBus.hasListeners(event); },

    /** @returns {LightBus} Direct access to the underlying bus instance */
    get raw() { return lightBus; }
};

/**
 * Predefined UI event names used across AgentUI components.
 * @readonly
 * @enum {string}
 */
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

/**
 * Convenience helper to show a toast notification via the bus.
 * @param {string} message - Toast message text
 * @param {Object} [options={}] - Additional toast options (variant, duration, etc.)
 */
export const showToast = (message, options = {}) => {
    bus.emit(UIEvents.TOAST_SHOW, { message, ...options });
};

// ============================================================================
// AI AGENT FEATURES
// ============================================================================

/**
 * Check if bus debug mode is enabled.
 * @returns {boolean}
 */
export const isDebugEnabled = () => lightBus.debug;

/**
 * @deprecated Use isDebugEnabled() instead.
 * @returns {boolean}
 */
export const enableDebug = () => {
    console.warn('[AgentUI] enableDebug() is deprecated. Debug mode is set at creation.');
    return lightBus.debug;
};

/**
 * @deprecated Debug mode cannot be toggled after creation.
 */
export const disableDebug = () => {
    console.warn('[AgentUI] disableDebug() is deprecated. Debug mode is set at creation.');
};

/**
 * Get bus health status including uptime, listener counts, and handler counts.
 * @returns {{ status: string, peerId: string, uptime: number, listeners: number, handlers: number }}
 */
export const getHealth = () => {
    return lightBus.healthCheck?.() ?? {
        status: 'unknown',
        peerId: lightBus.peerId,
        note: 'healthCheck not available'
    };
};

/**
 * Get the full set of framework capabilities and metadata.
 * @returns {{ peerId: string, capabilities: string[], meta: Object, version: string }}
 */
export const getCapabilities = () => ({
    peerId: lightBus.peerId,
    capabilities: AGENTUI_CAPABILITIES,
    meta: AGENTUI_META,
    version: AGENTUI_VERSION
});

/**
 * Add an inbound hook for message interception.
 * @param {Function} fn - Hook function `(payload, context) => payload`
 * @returns {Function} Remove-hook function
 */
export const addInboundHook = (fn) => {
    return lightBus.addInboundHook?.(fn) ?? (() => { });
};

/**
 * Add an outbound hook for message interception.
 * @param {Function} fn - Hook function `(payload, context) => payload`
 * @returns {Function} Remove-hook function
 */
export const addOutboundHook = (fn) => {
    return lightBus.addOutboundHook?.(fn) ?? (() => { });
};

// ============================================================================
// COMPONENT CAPABILITY REGISTRATION
// ============================================================================

/**
 * Register a component's capabilities in the global registry.
 * @param {string} tagName - Custom element tag name
 * @param {Object} capabilities - Component capabilities descriptor
 */
export const registerComponent = (tagName, capabilities) => {
    componentRegistry.set(tagName, { ...capabilities, registeredAt: Date.now() });
};

/**
 * Unregister a component from the global registry.
 * @param {string} tagName - Custom element tag name
 */
export const unregisterComponent = (tagName) => {
    componentRegistry.delete(tagName);
};

/**
 * Get a specific component's registered capabilities.
 * @param {string} tagName - Custom element tag name
 * @returns {Object|null} Capabilities descriptor or null if not registered
 */
export const getComponentCapabilities = (tagName) => {
    return componentRegistry.get(tagName) ?? null;
};

/**
 * Get all registered components and their capabilities.
 * @returns {Object<string, Object>} Map of tag names to capability descriptors
 */
export const getRegisteredComponents = () => {
    return Object.fromEntries(componentRegistry);
};

/**
 * Find components that handle a specific signal.
 * @param {string} signal - Signal name to search for
 * @returns {string[]} Array of tag names that handle the signal
 */
export const getComponentsForSignal = (signal) => {
    const handlers = [];
    for (const [tagName, caps] of componentRegistry) {
        if (caps.signals?.includes(signal)) {
            handlers.push(tagName);
        }
    }
    return handlers;
};
