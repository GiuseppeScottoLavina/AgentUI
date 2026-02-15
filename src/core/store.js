/**
 * @fileoverview AgentUI Reactive Store — Proxy-Based State Management
 * 
 * Minimal reactive store for AgentUI applications.
 * Proxy-based change detection with optional localStorage persistence.
 * Zero dependencies. ~100 lines.
 * 
 * @example
 * import { createStore } from 'agentui-wc';
 * 
 * const store = createStore(
 *   { tasks: [], filter: 'all' },
 *   { persist: 'my-app' }
 * );
 * 
 * store.subscribe('tasks', (newTasks) => renderList(newTasks));
 * store.state.tasks = [...store.state.tasks, { title: 'New task' }];
 */

/**
 * Create a reactive store with optional localStorage persistence.
 * 
 * @param {Object} initialState - Initial state object (shallow)
 * @param {Object} [options] - Configuration options
 * @param {string} [options.persist] - localStorage key prefix for auto-persistence
 * @returns {Store} Reactive store instance
 */
export function createStore(initialState, options = {}) {
    const persistKey = options.persist ? `agentui:${options.persist}` : null;

    // Internal state (plain object)
    const _state = { ...initialState };

    // Subscribers: Map<key, Set<callback>>
    const _subs = new Map();
    // Wildcard subscribers: Set<callback>
    const _wildcards = new Set();

    // Batch mode tracking
    let _batching = false;
    const _batchChanges = new Map(); // key → { newVal, oldVal }

    // ── Load persisted state ──────────────────────────────────────────
    if (persistKey) {
        try {
            const stored = (typeof localStorage !== 'undefined')
                ? localStorage.getItem(persistKey)
                : null;
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed && typeof parsed === 'object') {
                    // Only restore keys present in initialState
                    for (const key of Object.keys(initialState)) {
                        if (key in parsed) {
                            const initial = initialState[key];
                            const restored = parsed[key];
                            // R4 Security: Type-check restored values against initialState
                            // Prevents localStorage poisoning with type-confused values
                            if (initial === null || initial === undefined) {
                                // null/undefined initial = accept any type (developer opt-in)
                                _state[key] = restored;
                            } else if (Array.isArray(initial)) {
                                // Array type must match
                                if (Array.isArray(restored)) {
                                    _state[key] = restored;
                                }
                            } else if (typeof restored === typeof initial) {
                                // Primitive types must match
                                _state[key] = restored;
                            }
                            // Type mismatch: silently keep initialState value
                        }
                    }
                }
            }
        } catch (_) {
            // Corrupt JSON or localStorage error — silently use initialState
        }
    }

    // ── Notify subscribers ────────────────────────────────────────────
    function _notify(key, newVal, oldVal) {
        const keySubs = _subs.get(key);
        if (keySubs) {
            for (const cb of keySubs) {
                cb(newVal, oldVal);
            }
        }
        for (const cb of _wildcards) {
            cb(key, newVal, oldVal);
        }
    }

    // ── Persist to localStorage ───────────────────────────────────────
    function _persist() {
        if (!persistKey) return;
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(persistKey, JSON.stringify(_state));
            }
        } catch (_) {
            // localStorage full or unavailable — silent
        }
    }

    // ── Reactive Proxy ────────────────────────────────────────────────
    // Keys that must be blocked to prevent prototype pollution
    const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

    const proxy = new Proxy(_state, {
        get(target, prop) {
            return target[prop];
        },
        set(target, prop, value) {
            // Guard: block prototype pollution vectors
            if (BLOCKED_KEYS.has(prop)) {
                console.warn(`[AgentUI Store] Blocked dangerous key: "${String(prop)}"`);
                return true; // silently ignore
            }

            const oldVal = target[prop];
            if (Object.is(oldVal, value)) return true; // no-op for same value
            target[prop] = value;

            if (_batching) {
                // Track change for batch flush
                if (!_batchChanges.has(prop)) {
                    _batchChanges.set(prop, { oldVal });
                }
                _batchChanges.get(prop).newVal = value;
            } else {
                _notify(prop, value, oldVal);
                _persist();
            }
            return true;
        }
    });

    // ── Public API ────────────────────────────────────────────────────
    return {
        /** Reactive state proxy — read and write properties directly */
        state: proxy,

        /**
         * Subscribe to state changes.
         * @param {string} key - State key to watch, or '*' for all changes
         * @param {Function} callback - For specific key: (newVal, oldVal). For '*': (key, newVal, oldVal)
         * @returns {Function} Unsubscribe function
         */
        subscribe(key, callback) {
            if (key === '*') {
                _wildcards.add(callback);
                return () => _wildcards.delete(callback);
            }
            if (!_subs.has(key)) _subs.set(key, new Set());
            _subs.get(key).add(callback);
            return () => {
                const set = _subs.get(key);
                if (set) {
                    set.delete(callback);
                    if (set.size === 0) _subs.delete(key);
                }
            };
        },

        /**
         * Batch multiple state changes — subscribers notified once at the end.
         * @param {Function} fn - Function containing state mutations
         */
        batch(fn) {
            _batching = true;
            _batchChanges.clear();
            try {
                fn();
            } finally {
                _batching = false;
                // Flush: notify once per changed key
                for (const [key, { newVal, oldVal }] of _batchChanges) {
                    if (!Object.is(newVal, oldVal)) {
                        _notify(key, newVal, oldVal);
                    }
                }
                _batchChanges.clear();
                _persist();
            }
        },

        /**
         * Get a plain copy of the current state (not the proxy).
         * @returns {Object} State snapshot
         */
        getState() {
            return { ..._state };
        },

        /**
         * Replace state properties and notify affected subscribers.
         * @param {Object} newState - Partial state to merge
         */
        setState(newState) {
            for (const [key, value] of Object.entries(newState)) {
                proxy[key] = value; // goes through Proxy.set
            }
        },

        /**
         * Destroy the store — clears all subscribers.
         */
        destroy() {
            _subs.clear();
            _wildcards.clear();
        }
    };
}
