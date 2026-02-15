/**
 * @fileoverview Store Security Tests — Prototype Pollution
 * 
 * Tests that the reactive store blocks __proto__, constructor,
 * and prototype keys to prevent prototype pollution attacks.
 */

import { describe, test, expect, beforeEach, beforeAll } from 'bun:test';
import { createStore } from '../../src/core/store.js';

// Provide localStorage polyfill for test environment
if (typeof globalThis.localStorage === 'undefined') {
    const _store = new Map();
    globalThis.localStorage = {
        getItem: (k) => _store.get(k) ?? null,
        setItem: (k, v) => _store.set(k, String(v)),
        removeItem: (k) => _store.delete(k),
        clear: () => _store.clear(),
    };
}

describe('Store Prototype Pollution Protection', () => {
    let store;

    beforeEach(() => {
        store = createStore({ name: 'test', count: 0 });
    });

    test('should block __proto__ key assignment', () => {
        store.state.__proto__ = { polluted: true };

        // __proto__ should NOT become an own state key
        const snapshot = store.getState();
        expect(Object.getOwnPropertyDescriptor(snapshot, '__proto__')).toBeUndefined();

        // Original Object prototype should not be polluted
        const clean = {};
        expect(clean.polluted).toBeUndefined();
    });

    test('should block constructor key assignment', () => {
        store.state.constructor = 'hacked';

        // constructor should NOT become a state key
        const snapshot = store.getState();
        // getState uses spread which copies own properties; constructor should not be set
        expect(snapshot.constructor).toBe(Object); // from Object.prototype, not our value
    });

    test('should block prototype key assignment', () => {
        store.state.prototype = { evil: true };

        // prototype should NOT become a state key
        const snapshot = store.getState();
        expect(snapshot.prototype).toBeUndefined();
    });

    test('should NOT fire subscribers for blocked keys', () => {
        let called = false;
        store.subscribe('*', () => { called = true; });

        store.state.__proto__ = { bad: true };
        store.state.constructor = 'bad';
        store.state.prototype = { bad: true };

        expect(called).toBe(false);
    });

    test('should still allow normal state keys', () => {
        store.state.name = 'updated';
        store.state.count = 42;
        store.state.newKey = 'hello';

        expect(store.state.name).toBe('updated');
        expect(store.state.count).toBe(42);
        expect(store.state.newKey).toBe('hello');
    });

    test('should block dangerous keys in batch mode', () => {
        let notified = false;
        store.subscribe('*', () => { notified = true; });

        store.batch(() => {
            store.state.__proto__ = { evil: true };
            store.state.name = 'safe'; // this should work
        });

        // Only the safe key should have triggered notification
        expect(store.state.name).toBe('safe');
        expect(notified).toBe(true); // for 'name'

        const clean = {};
        expect(clean.evil).toBeUndefined();
    });

    test('should block dangerous keys in setState', () => {
        store.setState({
            __proto__: { polluted: true },
            name: 'safe'
        });

        // name should be set, __proto__ should be blocked
        expect(store.state.name).toBe('safe');
        const clean = {};
        expect(clean.polluted).toBeUndefined();
    });
});

describe('R4: Store localStorage Poisoning Protection', () => {

    test('should reject type-mismatched values from localStorage', () => {
        // Simulate attacker poisoning localStorage
        // Store uses agentui: prefix (see store.js line 29)
        const persistKey = 'agentui:test-poison';
        localStorage.setItem(persistKey, JSON.stringify({
            name: { toString: 'javascript:alert(1)' }, // should be string
            count: 'not-a-number',                      // should be number
            items: 'not-an-array'                       // should be array
        }));

        const store = createStore(
            { name: 'default', count: 0, items: [] },
            { persist: 'test-poison' }
        );

        // Type-mismatched values should NOT be restored
        expect(typeof store.state.name).toBe('string');
        expect(store.state.name).toBe('default');
        expect(typeof store.state.count).toBe('number');
        expect(store.state.count).toBe(0);
        expect(Array.isArray(store.state.items)).toBe(true);
        expect(store.state.items).toEqual([]);

        localStorage.removeItem(persistKey);
        store.destroy();
    });

    test('should accept correctly-typed values from localStorage', () => {
        const persistKey = 'agentui:test-valid';
        localStorage.setItem(persistKey, JSON.stringify({
            name: 'restored',
            count: 42,
            items: ['a', 'b']
        }));

        const store = createStore(
            { name: 'default', count: 0, items: [] },
            { persist: 'test-valid' }
        );

        // Correctly-typed values should be restored
        expect(store.state.name).toBe('restored');
        expect(store.state.count).toBe(42);
        expect(store.state.items).toEqual(['a', 'b']);

        localStorage.removeItem(persistKey);
        store.destroy();
    });

    test('should handle null initialState values gracefully', () => {
        const persistKey = 'agentui:test-null';
        localStorage.setItem(persistKey, JSON.stringify({
            config: { evil: true }
        }));

        const store = createStore(
            { config: null },
            { persist: 'test-null' }
        );

        // null initialState should accept any type (developer opt-in)
        expect(store.state.config).toEqual({ evil: true });

        localStorage.removeItem(persistKey);
        store.destroy();
    });
});

