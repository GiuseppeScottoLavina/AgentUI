/**
 * @fileoverview Unit Tests for scheduler.js (Task Scheduler)
 * Target: 56% → 90% coverage
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';

let supportsScheduler, scheduleTask, yieldToMain, processWithYield;
let runBackground, runImmediate;

describe('scheduler.js Unit Tests', () => {

    beforeAll(async () => {
        globalThis.setTimeout = (cb, delay) => { cb(); return 0; };

        const module = await import('../../src/core/scheduler.js');
        supportsScheduler = module.supportsScheduler;
        scheduleTask = module.scheduleTask;
        yieldToMain = module.yieldToMain;
        processWithYield = module.processWithYield;
        runBackground = module.runBackground;
        runImmediate = module.runImmediate;
    });

    // ========================================
    // supportsScheduler
    // ========================================

    test('supportsScheduler should be boolean', () => {
        expect(typeof supportsScheduler).toBe('boolean');
    });

    // ========================================
    // scheduleTask
    // ========================================

    test('scheduleTask should execute callback', async () => {
        let called = false;
        await scheduleTask(() => { called = true; });
        expect(called).toBe(true);
    });

    test('scheduleTask should return result', async () => {
        const result = await scheduleTask(() => 42);
        expect(result).toBe(42);
    });

    test('scheduleTask with user-blocking priority', async () => {
        const result = await scheduleTask(() => 'fast', 'user-blocking');
        expect(result).toBe('fast');
    });

    test('scheduleTask with background priority', async () => {
        const result = await scheduleTask(() => 'slow', 'background');
        expect(result).toBe('slow');
    });

    // ========================================
    // yieldToMain
    // ========================================

    test('yieldToMain should resolve', async () => {
        await yieldToMain();
        expect(true).toBe(true);
    });

    // ========================================
    // processWithYield
    // ========================================

    test('processWithYield should process all items', async () => {
        const items = [1, 2, 3, 4, 5];
        const processed = [];
        await processWithYield(items, (item) => { processed.push(item); }, 2);
        expect(processed.length).toBe(5);
    });

    test('processWithYield with large chunk', async () => {
        const items = [1, 2, 3];
        const processed = [];
        await processWithYield(items, (item) => { processed.push(item); }, 100);
        expect(processed.length).toBe(3);
    });

    // ========================================
    // runBackground / runImmediate
    // ========================================

    test('runBackground should execute callback', async () => {
        const result = await runBackground(() => 'bg');
        expect(result).toBe('bg');
    });

    test('runImmediate should execute callback', async () => {
        const result = await runImmediate(() => 'imm');
        expect(result).toBe('imm');
    });

    // ========================================
    // afterPaint (double-rAF pattern)
    // ========================================

    test('afterPaint should resolve after two animation frames', async () => {
        // In test environment, rAF is mocked
        const { afterPaint } = await import('../../src/core/scheduler.js');

        let resolved = false;
        afterPaint().then(() => { resolved = true; });

        // Should resolve eventually
        await new Promise(resolve => setTimeout(resolve, 50));
        expect(resolved).toBe(true);
    });

    test('afterPaint should return a Promise', async () => {
        const { afterPaint } = await import('../../src/core/scheduler.js');
        const result = afterPaint();
        expect(result).toBeInstanceOf(Promise);
        await result;
    });
});
