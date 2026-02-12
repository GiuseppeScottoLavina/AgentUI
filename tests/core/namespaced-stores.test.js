/**
 * @fileoverview Tests for Namespaced Stores (Enterprise Features)
 * Tests createNamespacedStore, getStore, getAllStores, captureAppState, restoreAppState
 */

import { describe, test, expect } from 'bun:test';

describe('Namespaced Stores', () => {
    describe('Module Exports', () => {
        test('should export createNamespacedStore function', async () => {
            const module = await import('../../src/core/store.js');
            expect(typeof module.createNamespacedStore).toBe('function');
        });

        test('should export getStore function', async () => {
            const module = await import('../../src/core/store.js');
            expect(typeof module.getStore).toBe('function');
        });

        test('should export getAllStores function', async () => {
            const module = await import('../../src/core/store.js');
            expect(typeof module.getAllStores).toBe('function');
        });

        test('should export captureAppState function', async () => {
            const module = await import('../../src/core/store.js');
            expect(typeof module.captureAppState).toBe('function');
        });

        test('should export restoreAppState function', async () => {
            const module = await import('../../src/core/store.js');
            expect(typeof module.restoreAppState).toBe('function');
        });

        test('should export enableObservability function', async () => {
            const module = await import('../../src/core/store.js');
            expect(typeof module.enableObservability).toBe('function');
        });

        test('should export disableObservability function', async () => {
            const module = await import('../../src/core/store.js');
            expect(typeof module.disableObservability).toBe('function');
        });

        test('should export getStateHistory function', async () => {
            const module = await import('../../src/core/store.js');
            expect(typeof module.getStateHistory).toBe('function');
        });
    });

    describe('createNamespacedStore Integration', () => {
        test('should create a store and retrieve it', async () => {
            const { createNamespacedStore, getStore } = await import('../../src/core/store.js');

            // Use unique namespace to avoid conflicts
            const ns = 'test-' + Date.now();
            const store = createNamespacedStore(ns, { count: 0 });

            expect(store).toBeDefined();
            expect(store.namespace).toBe(ns);

            const retrieved = getStore(ns);
            expect(retrieved).toBe(store);
        });

        test('should initialize with provided state', async () => {
            const { createNamespacedStore } = await import('../../src/core/store.js');

            const ns = 'init-test-' + Date.now();
            const store = createNamespacedStore(ns, { items: ['a', 'b'], total: 100 });

            const state = store.get();
            expect(state.items).toEqual(['a', 'b']);
            expect(state.total).toBe(100);
        });
    });

    describe('getAllStores', () => {
        test('should return object with stores', async () => {
            const { getAllStores } = await import('../../src/core/store.js');

            const stores = getAllStores();
            expect(typeof stores).toBe('object');
        });
    });

    describe('getStore', () => {
        test('should return undefined for non-existent store', async () => {
            const { getStore } = await import('../../src/core/store.js');
            const store = getStore('definitely-not-existing-' + Date.now());
            expect(store).toBeUndefined();
        });
    });

    describe('Observability', () => {
        test('should enable and disable observability', async () => {
            const { enableObservability, disableObservability } = await import('../../src/core/store.js');

            // Should not throw
            enableObservability();
            expect(true).toBe(true);

            disableObservability();
            expect(true).toBe(true);
        });

        test('should return history array', async () => {
            const { getStateHistory } = await import('../../src/core/store.js');

            const history = getStateHistory('any');
            expect(Array.isArray(history)).toBe(true);
        });
    });
});
