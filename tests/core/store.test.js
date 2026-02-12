/**
 * @fileoverview Unit Tests for store.js (Reactive Store)
 * Target: 50% → 90% coverage
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';

let createStore, appStore, createNamespacedStore, getStore, getAllStores;
let captureAppState, restoreAppState, enableObservability, disableObservability;
let clearStateHistory, clearStoreRegistry, getStateHistory;

describe('store.js Unit Tests', () => {

    beforeAll(async () => {
        const module = await import('../../src/core/store.js');
        createStore = module.createStore;
        appStore = module.appStore;
        createNamespacedStore = module.createNamespacedStore;
        getStore = module.getStore;
        getAllStores = module.getAllStores;
        captureAppState = module.captureAppState;
        restoreAppState = module.restoreAppState;
        enableObservability = module.enableObservability;
        disableObservability = module.disableObservability;
        clearStateHistory = module.clearStateHistory;
        clearStoreRegistry = module.clearStoreRegistry;
        getStateHistory = module.getStateHistory;
    });

    beforeEach(() => {
        clearStoreRegistry();
        disableObservability();
    });

    // ========================================
    // createStore
    // ========================================

    test('createStore should return store object', () => {
        const store = createStore({ count: 0 });
        expect(store).toBeDefined();
        expect(typeof store.get).toBe('function');
    });

    test('store.get should return state', () => {
        const store = createStore({ count: 5 });
        expect(store.get().count).toBe(5);
    });

    test('store.set should update state', () => {
        const store = createStore({ count: 0 });
        store.set({ count: 10 });
        expect(store.get().count).toBe(10);
    });

    test('store.update should update with function', () => {
        const store = createStore({ count: 5 });
        store.update(s => ({ count: s.count + 5 }));
        expect(store.get().count).toBe(10);
    });

    test('store.subscribe should call listener immediately', () => {
        const store = createStore({ value: 'hello' });
        let received = null;
        store.subscribe(state => { received = state.value; });
        expect(received).toBe('hello');
    });

    test('store.subscribe should return unsubscribe', () => {
        const store = createStore({});
        const unsub = store.subscribe(() => { });
        expect(typeof unsub).toBe('function');
    });

    test('store.reset should restore initial state', () => {
        const store = createStore({ count: 0 });
        store.set({ count: 100 });
        store.reset();
        expect(store.get().count).toBe(0);
    });

    // ========================================
    // appStore singleton
    // ========================================

    test('appStore should exist', () => {
        expect(appStore).toBeDefined();
    });

    // ========================================
    // Namespaced stores
    // ========================================

    test('createNamespacedStore should create store', () => {
        const store = createNamespacedStore('user', { name: 'John' });
        expect(store.get().name).toBe('John');
    });

    test('createNamespacedStore should return existing for same namespace', () => {
        const store1 = createNamespacedStore('cart', { items: [] });
        const store2 = createNamespacedStore('cart', { items: [1] });
        expect(store1).toBe(store2);
    });

    test('getStore should return store by namespace', () => {
        createNamespacedStore('settings', { theme: 'dark' });
        const store = getStore('settings');
        expect(store.get().theme).toBe('dark');
    });

    test('getAllStores should return all stores', () => {
        createNamespacedStore('ns1', {});
        createNamespacedStore('ns2', {});
        const all = getAllStores();
        expect(all.ns1).toBeDefined();
        expect(all.ns2).toBeDefined();
    });

    // ========================================
    // Capture/Restore
    // ========================================

    test('captureAppState should return snapshot', () => {
        createNamespacedStore('test', { val: 1 });
        const snapshot = captureAppState();
        expect(snapshot.stores.test.val).toBe(1);
    });

    test('restoreAppState should restore state', () => {
        const store = createNamespacedStore('restore-test', { x: 1 });
        const snapshot = { stores: { 'restore-test': { x: 99 } } };
        restoreAppState(snapshot);
        expect(store.get().x).toBe(99);
    });

    test('restoreAppState should handle invalid snapshot', () => {
        restoreAppState(null); // Should not throw
        expect(true).toBe(true);
    });

    test('restoreAppState with createMissing should create stores', () => {
        const snapshot = { stores: { 'newstore': { foo: 'bar' } } };
        restoreAppState(snapshot, { createMissing: true });
        const store = getStore('newstore');
        expect(store.get().foo).toBe('bar');
    });

    // ========================================
    // Observability
    // ========================================

    test('enableObservability should enable tracking', () => {
        enableObservability();
        const store = createNamespacedStore('obs-test', { v: 1 });
        store.set({ v: 2 });
        store.set({ v: 3 });
        const history = getStateHistory('obs-test');
        expect(history.length).toBeGreaterThanOrEqual(1);
    });

    test('clearStateHistory should clear history', () => {
        enableObservability();
        createNamespacedStore('clear-test', {});
        clearStateHistory();
        expect(getStateHistory('clear-test').length).toBe(0);
    });

    test('getStateHistory returns empty for unknown namespace', () => {
        expect(getStateHistory('unknown').length).toBe(0);
    });
});
