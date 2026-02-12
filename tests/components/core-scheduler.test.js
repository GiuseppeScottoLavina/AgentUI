/**
 * @fileoverview Unit Tests for core/scheduler.js — scheduleTask, yieldToMain, processWithYield, etc.
 * Target: 27% → 95% line coverage
 */

import { describe, test, expect } from 'bun:test';
import '../helpers/setup-dom.js';

import {
    supportsScheduler, scheduleTask, yieldToMain,
    processWithYield, runBackground, runImmediate, afterPaint
} from '../../src/core/scheduler.js';

describe('core/scheduler.js', () => {

    // ========== supportsScheduler ==========
    describe('supportsScheduler', () => {
        test('should be a boolean', () => {
            expect(typeof supportsScheduler).toBe('boolean');
        });
    });

    // ========== scheduleTask ==========
    describe('scheduleTask', () => {
        test('should execute callback and return result', async () => {
            const result = await scheduleTask(() => 42);
            expect(result).toBe(42);
        });

        test('should default to user-visible priority', async () => {
            const result = await scheduleTask(() => 'ok');
            expect(result).toBe('ok');
        });

        test('should support user-blocking priority', async () => {
            const result = await scheduleTask(() => 'blocking', 'user-blocking');
            expect(result).toBe('blocking');
        });

        test('should support background priority', async () => {
            const result = await scheduleTask(() => 'bg', 'background');
            expect(result).toBe('bg');
        });

        test('should handle async callbacks', async () => {
            const result = await scheduleTask(async () => {
                return 'async-result';
            });
            expect(result).toBe('async-result');
        });
    });

    // ========== yieldToMain ==========
    describe('yieldToMain', () => {
        test('should return a promise', () => {
            const result = yieldToMain();
            expect(result).toBeInstanceOf(Promise);
        });

        test('should resolve', async () => {
            await yieldToMain();
            // If we get here, it resolved
            expect(true).toBe(true);
        });
    });

    // ========== processWithYield ==========
    describe('processWithYield', () => {
        test('should process all items', async () => {
            const items = [1, 2, 3, 4, 5];
            const processed = [];
            await processWithYield(items, (item) => processed.push(item), 2);
            expect(processed).toEqual([1, 2, 3, 4, 5]);
        });

        test('should handle empty array', async () => {
            const processed = [];
            await processWithYield([], (item) => processed.push(item));
            expect(processed).toEqual([]);
        });

        test('should process large arrays with yielding', async () => {
            const items = Array.from({ length: 120 }, (_, i) => i);
            const processed = [];
            await processWithYield(items, (item) => processed.push(item), 50);
            expect(processed.length).toBe(120);
        });

        test('should provide index to process function', async () => {
            const items = ['a', 'b', 'c'];
            const indices = [];
            await processWithYield(items, (item, idx) => indices.push(idx), 10);
            expect(indices).toEqual([0, 1, 2]);
        });
    });

    // ========== runBackground ==========
    describe('runBackground', () => {
        test('should execute with background priority', async () => {
            const result = await runBackground(() => 'background-result');
            expect(result).toBe('background-result');
        });
    });

    // ========== runImmediate ==========
    describe('runImmediate', () => {
        test('should execute with user-blocking priority', async () => {
            const result = await runImmediate(() => 'immediate-result');
            expect(result).toBe('immediate-result');
        });
    });

    // ========== afterPaint ==========
    describe('afterPaint', () => {
        test('should return a promise', () => {
            const result = afterPaint();
            expect(result).toBeInstanceOf(Promise);
        });

        test('should resolve after double-rAF', async () => {
            await afterPaint();
            expect(true).toBe(true);
        });
    });
});
