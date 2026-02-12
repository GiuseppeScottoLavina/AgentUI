/**
 * @fileoverview Unit Tests for core/render.js — RenderScheduler, memo, debounce, throttle, DomBatch, processInChunks
 * Target: 36% → 95% line coverage
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import '../helpers/setup-dom.js';

import {
    scheduler, memo, debounce, throttle,
    createVisibilityObserver, domBatch, processInChunks
} from '../../src/core/render.js';

describe('core/render.js', () => {

    // ========== RenderScheduler ==========
    describe('RenderScheduler', () => {
        test('should export scheduler instance', () => {
            expect(scheduler).toBeDefined();
            expect(typeof scheduler.schedule).toBe('function');
        });

        test('schedule should execute callback', () => {
            let executed = false;
            scheduler.schedule(() => { executed = true; });
            // requestAnimationFrame is mocked to execute synchronously
            expect(executed).toBe(true);
        });

        test('schedule should batch multiple callbacks', () => {
            const results = [];
            scheduler.schedule(() => results.push(1));
            scheduler.schedule(() => results.push(2));
            scheduler.schedule(() => results.push(3));
            expect(results).toEqual([1, 2, 3]);
        });

        test('schedule should handle errors without stopping', () => {
            const results = [];
            scheduler.schedule(() => { throw new Error('boom'); });
            scheduler.schedule(() => results.push('after-error'));
            expect(results).toContain('after-error');
        });
    });

    // ========== memo ==========
    describe('memo', () => {
        test('should cache results', () => {
            let callCount = 0;
            const expensive = memo((x) => { callCount++; return x * 2; });
            expect(expensive(5)).toBe(10);
            expect(expensive(5)).toBe(10);
            expect(callCount).toBe(1); // Only computed once
        });

        test('should compute for different args', () => {
            let callCount = 0;
            const fn = memo((x) => { callCount++; return x + 1; });
            expect(fn(1)).toBe(2);
            expect(fn(2)).toBe(3);
            expect(callCount).toBe(2);
        });

        test('should support custom key function', () => {
            let callCount = 0;
            const fn = memo(
                (a, b) => { callCount++; return a + b; },
                (args) => args.join(',')
            );
            expect(fn(1, 2)).toBe(3);
            expect(fn(1, 2)).toBe(3);
            expect(callCount).toBe(1);
        });
    });

    // ========== debounce ==========
    describe('debounce', () => {
        // Covered by E2E: tests/e2e/coverage-gaps.test.js
        test.skip('should delay execution (E2E)', async () => {
            let count = 0;
            const fn = debounce(() => { count++; }, 10);
            fn();
            fn();
            fn();
            expect(count).toBe(0); // Not yet called
            await new Promise(r => setTimeout(r, 30));
            expect(count).toBe(1); // Called once after delay
        });

        test('should pass arguments', async () => {
            let received = null;
            const fn = debounce((val) => { received = val; }, 10);
            fn('hello');
            await new Promise(r => setTimeout(r, 30));
            expect(received).toBe('hello');
        });

        // Covered by E2E: tests/e2e/coverage-gaps.test.js
        test.skip('should reset timer on new calls (E2E)', async () => {
            let count = 0;
            const fn = debounce(() => { count++; }, 50);
            fn();
            await new Promise(r => setTimeout(r, 20));
            fn(); // Reset timer
            await new Promise(r => setTimeout(r, 20));
            expect(count).toBe(0); // Still waiting
            await new Promise(r => setTimeout(r, 50));
            expect(count).toBe(1);
        });
    });

    // ========== throttle ==========
    describe('throttle', () => {
        test('should execute immediately on first call', () => {
            let count = 0;
            const fn = throttle(() => { count++; }, 100);
            fn();
            expect(count).toBe(1);
        });

        // Covered by E2E: tests/e2e/coverage-gaps.test.js
        test.skip('should throttle subsequent calls (E2E)', () => {
            let count = 0;
            const fn = throttle(() => { count++; }, 100);
            fn();
            fn();
            fn();
            expect(count).toBe(1); // Only first call goes through
        });

        test('should allow calls after limit', async () => {
            let count = 0;
            const fn = throttle(() => { count++; }, 20);
            fn();
            expect(count).toBe(1);
            await new Promise(r => setTimeout(r, 30));
            fn();
            expect(count).toBe(2);
        });

        test('should pass arguments', () => {
            let received = null;
            const fn = throttle((val) => { received = val; }, 100);
            fn('test');
            expect(received).toBe('test');
        });
    });

    // ========== createVisibilityObserver ==========
    describe('createVisibilityObserver', () => {
        test('should return object with observe and disconnect', () => {
            const obs = createVisibilityObserver(() => { });
            expect(typeof obs.observe).toBe('function');
            expect(typeof obs.disconnect).toBe('function');
        });

        test('observe should not throw', () => {
            const obs = createVisibilityObserver(() => { });
            const el = globalThis.document.createElement('div');
            expect(() => obs.observe(el)).not.toThrow();
            obs.disconnect();
        });

        test('should accept options', () => {
            const obs = createVisibilityObserver(() => { }, { rootMargin: '200px', threshold: 0.5 });
            expect(obs).toBeDefined();
            obs.disconnect();
        });
    });

    // ========== DomBatch ==========
    describe('DomBatch', () => {
        test('should export domBatch instance', () => {
            expect(domBatch).toBeDefined();
            expect(typeof domBatch.read).toBe('function');
            expect(typeof domBatch.write).toBe('function');
        });

        test('read should execute callback', () => {
            let executed = false;
            domBatch.read(() => { executed = true; });
            // rAF is mocked synchronously
            expect(executed).toBe(true);
        });

        test('write should execute callback', () => {
            let executed = false;
            domBatch.write(() => { executed = true; });
            expect(executed).toBe(true);
        });

        test('reads should execute before writes', () => {
            const order = [];
            domBatch.read(() => order.push('read1'));
            domBatch.write(() => order.push('write1'));
            domBatch.read(() => order.push('read2'));
            domBatch.write(() => order.push('write2'));
            // Reads first, then writes
            expect(order.indexOf('read1')).toBeLessThan(order.indexOf('write1'));
        });

        test('should handle errors in read without stopping', () => {
            const order = [];
            domBatch.read(() => { throw new Error('read error'); });
            domBatch.write(() => order.push('write-ok'));
            expect(order).toContain('write-ok');
        });

        test('should handle errors in write without stopping', () => {
            const order = [];
            domBatch.write(() => { throw new Error('write error'); });
            domBatch.write(() => order.push('write2'));
            expect(order).toContain('write2');
        });
    });

    // ========== processInChunks ==========
    describe('processInChunks', () => {
        test('should process all items', async () => {
            const items = [1, 2, 3, 4, 5];
            const processed = [];
            await processInChunks(items, (item) => processed.push(item), 2);
            expect(processed).toEqual([1, 2, 3, 4, 5]);
        });

        test('should handle empty array', async () => {
            const processed = [];
            await processInChunks([], (item) => processed.push(item));
            expect(processed).toEqual([]);
        });

        test('should process in correct order', async () => {
            const items = ['a', 'b', 'c'];
            const result = [];
            await processInChunks(items, (item) => result.push(item), 1);
            expect(result).toEqual(['a', 'b', 'c']);
        });

        test('should handle chunk size larger than array', async () => {
            const items = [1, 2];
            const result = [];
            await processInChunks(items, (item) => result.push(item), 100);
            expect(result).toEqual([1, 2]);
        });
    });
});
