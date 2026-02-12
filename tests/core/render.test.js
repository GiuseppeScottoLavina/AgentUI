/**
 * @fileoverview Unit Tests for render.js Module
 * Target: 82% → 95% coverage
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { scheduler, memo, debounce, throttle, domBatch, processInChunks } from '../../src/core/render.js';

describe('render Module Unit Tests', () => {

    // Mock requestAnimationFrame
    beforeAll(() => {
        globalThis.requestAnimationFrame = (cb) => { cb(Date.now()); return 0; };
    });

    // SCHEDULER
    test('scheduler should exist', () => {
        expect(scheduler).toBeDefined();
    });

    test('scheduler.schedule should be a function', () => {
        expect(typeof scheduler.schedule).toBe('function');
    });

    test('scheduler should execute callbacks', () => {
        let called = false;
        scheduler.schedule(() => { called = true; });
        expect(called).toBe(true);
    });

    test('scheduler should batch multiple callbacks', () => {
        let count = 0;
        scheduler.schedule(() => { count++; });
        scheduler.schedule(() => { count++; });
        scheduler.schedule(() => { count++; });
        expect(count).toBe(3);
    });

    // MEMO
    test('memo should be a function', () => {
        expect(typeof memo).toBe('function');
    });

    test('memo should cache results', () => {
        let callCount = 0;
        const expensive = memo((x) => { callCount++; return x * 2; });
        expect(expensive(5)).toBe(10);
        expect(expensive(5)).toBe(10);
        expect(callCount).toBe(1); // Only called once
    });

    test('memo should compute for different args', () => {
        const fn = memo((x) => x * 2);
        expect(fn(2)).toBe(4);
        expect(fn(3)).toBe(6);
    });

    // DEBOUNCE
    test('debounce should be a function', () => {
        expect(typeof debounce).toBe('function');
    });

    test('debounce should return a function', () => {
        const debounced = debounce(() => { }, 100);
        expect(typeof debounced).toBe('function');
    });

    // THROTTLE
    test('throttle should be a function', () => {
        expect(typeof throttle).toBe('function');
    });

    test('throttle should return a function', () => {
        const throttled = throttle(() => { }, 100);
        expect(typeof throttled).toBe('function');
    });

    test('throttle should call function immediately', () => {
        let called = false;
        const throttled = throttle(() => { called = true; }, 100);
        throttled();
        expect(called).toBe(true);
    });

    // DOM BATCH
    test('domBatch should exist', () => {
        expect(domBatch).toBeDefined();
    });

    test('domBatch.read should be a function', () => {
        expect(typeof domBatch.read).toBe('function');
    });

    test('domBatch.write should be a function', () => {
        expect(typeof domBatch.write).toBe('function');
    });

    test('domBatch should execute reads', () => {
        let readCalled = false;
        domBatch.read(() => { readCalled = true; });
        expect(readCalled).toBe(true);
    });

    test('domBatch should execute writes', () => {
        let writeCalled = false;
        domBatch.write(() => { writeCalled = true; });
        expect(writeCalled).toBe(true);
    });

    // PROCESS IN CHUNKS
    test('processInChunks should be a function', () => {
        expect(typeof processInChunks).toBe('function');
    });

    test('processInChunks should process all items', async () => {
        const items = [1, 2, 3, 4, 5];
        const processed = [];
        await processInChunks(items, (item) => processed.push(item), 2);
        expect(processed).toEqual([1, 2, 3, 4, 5]);
    });

    // FIX 3: processInChunks should pass correct item index, not batch start index
    test('processInChunks should pass correct per-item index', async () => {
        const items = ['a', 'b', 'c', 'd', 'e'];
        const indices = [];
        await processInChunks(items, (item, index) => indices.push(index), 2);
        expect(indices).toEqual([0, 1, 2, 3, 4]);
    });

    // FIX 4: memo should support maxSize to prevent unbounded cache growth
    test('memo should evict oldest entry when maxSize exceeded', () => {
        let callCount = 0;
        const fn = memo((x) => { callCount++; return x * 10; }, { maxSize: 3 });

        fn(1); fn(2); fn(3); // cache: [1,2,3]
        expect(callCount).toBe(3);

        fn(1); // cache hit
        expect(callCount).toBe(3);

        fn(4); // cache full, evicts oldest (2 or 1)
        expect(callCount).toBe(4);

        // Cache should still work for recent entries
        fn(4); // cache hit
        expect(callCount).toBe(4);
    });

    test('memo default (no maxSize) should still work', () => {
        let callCount = 0;
        const fn = memo((x) => { callCount++; return x + 1; });
        fn(1); fn(2); fn(1);
        expect(callCount).toBe(2);
    });
});
