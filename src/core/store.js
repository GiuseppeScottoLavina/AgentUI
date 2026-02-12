/**
 * @fileoverview Simple Reactive Store for AgentUI
 * 
 * Lightweight state management without complexity.
 * 
 * Usage:
 * const store = createStore({ count: 0 });
 * store.subscribe((state) => console.log(state.count));
 * store.set({ count: 1 });
 * store.update(s => ({ count: s.count + 1 }));
 */

/**
 * Create a reactive store
 * @param {T} initialState - Initial state object
 * @returns {Store<T>}
 */
export function createStore(initialState = {}) {
    let state = { ...initialState };
    const listeners = new Set();

    return {
        /**
         * Get current state
         */
        get() {
            return state;
        },

        /**
         * Set new state (merges with existing)
         * @param {Partial<T>} newState
         */
        set(newState) {
            state = { ...state, ...newState };
            this.notify();
        },

        /**
         * Update state with function
         * @param {(s: T) => Partial<T>} fn
         */
        update(fn) {
            const updates = fn(state);
            this.set(updates);
        },

        /**
         * Subscribe to state changes
         * @param {(state: T) => void} listener
         * @returns {() => void} Unsubscribe function
         */
        subscribe(listener) {
            listeners.add(listener);
            // Call immediately with current state
            listener(state);
            return () => listeners.delete(listener);
        },

        /**
         * Notify all listeners
         */
        notify() {
            for (const listener of listeners) {
                listener(state);
            }
        },

        /**
         * Reset to initial state
         */
        reset() {
            state = { ...initialState };
            this.notify();
        }
    };
}

/**
 * Global app store (singleton pattern)
 */
export const appStore = createStore({});

// ============================================
// NAMESPACED STORES (Enterprise-Scale Feature)
// ============================================

/**
 * Registry of all namespaced stores for large-scale apps
 * @type {Map<string, Store>}
 */
const storeRegistry = new Map();

/**
 * State change history for observability
 * @type {Map<string, Array<{timestamp: number, state: Object}>>}
 */
const stateHistory = new Map();

/** Whether observability is enabled */
let observabilityEnabled = false;

/**
 * Create a namespaced store for isolated state management.
 * Each feature/module can have its own isolated store.
 * 
 * @param {string} namespace - Unique namespace for this store (e.g., 'user', 'cart')
 * @param {Object} initialState - Initial state for this namespace
 * @returns {Store} Store instance
 * 
 * @example
 * const userStore = createNamespacedStore('user', { profile: null });
 * const cartStore = createNamespacedStore('cart', { items: [] });
 */
export function createNamespacedStore(namespace, initialState = {}) {
    if (storeRegistry.has(namespace)) {
        console.warn(`[AgentUI] Store namespace "${namespace}" already exists. Returning existing store.`);
        return storeRegistry.get(namespace);
    }

    const store = createStore(initialState);

    // Wrap set to track history if observability enabled
    const originalSet = store.set.bind(store);
    store.set = function (newState) {
        if (observabilityEnabled) {
            if (!stateHistory.has(namespace)) {
                stateHistory.set(namespace, []);
            }
            stateHistory.get(namespace).push({
                timestamp: Date.now(),
                state: { ...store.get() }
            });
            // Keep last 100 entries
            const history = stateHistory.get(namespace);
            if (history.length > 100) history.shift();
        }
        originalSet(newState);
    };

    // Add namespace property
    store.namespace = namespace;

    storeRegistry.set(namespace, store);
    return store;
}

/**
 * Get a store by namespace
 * @param {string} namespace 
 * @returns {Store|undefined}
 */
export function getStore(namespace) {
    return storeRegistry.get(namespace);
}

/**
 * Get all registered stores as a plain object
 * @returns {Object<string, Store>}
 */
export function getAllStores() {
    const stores = {};
    for (const [namespace, store] of storeRegistry) {
        stores[namespace] = store;
    }
    return stores;
}

/**
 * Capture the entire application state (all namespaced stores)
 * Useful for debugging, serialization, or time-travel debugging.
 * 
 * @returns {Object} Snapshot of all store states
 * 
 * @example
 * const snapshot = captureAppState();
 * localStorage.setItem('app-state', JSON.stringify(snapshot));
 */
export function captureAppState() {
    const snapshot = {
        timestamp: Date.now(),
        stores: {}
    };

    for (const [namespace, store] of storeRegistry) {
        snapshot.stores[namespace] = { ...store.get() };
    }

    // Include global appStore
    snapshot.stores['__global__'] = { ...appStore.get() };

    return snapshot;
}

/**
 * Restore application state from a snapshot
 * 
 * @param {Object} snapshot - Previously captured state snapshot
 * @param {Object} [options] - Options
 * @param {boolean} [options.createMissing=false] - Create stores for namespaces not yet registered
 * 
 * @example
 * const snapshot = JSON.parse(localStorage.getItem('app-state'));
 * restoreAppState(snapshot);
 */
export function restoreAppState(snapshot, options = {}) {
    const { createMissing = false } = options;

    if (!snapshot?.stores) {
        console.warn('[AgentUI] Invalid snapshot provided to restoreAppState');
        return;
    }

    for (const [namespace, state] of Object.entries(snapshot.stores)) {
        if (namespace === '__global__') {
            appStore.set(state);
            continue;
        }

        let store = storeRegistry.get(namespace);

        if (!store && createMissing) {
            store = createNamespacedStore(namespace, {});
        }

        if (store) {
            store.set(state);
        }
    }
}

/**
 * Get state change history for a namespace (requires observability enabled)
 * @param {string} namespace 
 * @returns {Array<{timestamp: number, state: Object}>}
 */
export function getStateHistory(namespace) {
    return stateHistory.get(namespace) || [];
}

/**
 * Enable state observability (tracks state changes for debugging)
 */
export function enableObservability() {
    observabilityEnabled = true;
}

/**
 * Disable state observability
 */
export function disableObservability() {
    observabilityEnabled = false;
}

/**
 * Clear all state history
 */
export function clearStateHistory() {
    stateHistory.clear();
}

/**
 * Clear store registry (useful for testing)
 */
export function clearStoreRegistry() {
    storeRegistry.clear();
    stateHistory.clear();
}
