/**
 * @fileoverview E2E tests for keyboard.js ESC handler stack
 * 
 * Covers the 8 skipped unit tests in tests/core/keyboard.test.js:
 * - ESC calls topmost handler (LIFO)
 * - Only topmost handler is called
 * - Next handler after topmost removed
 * - Non-ESC keys don't trigger handler
 * - preventDefault on ESC
 * - stopPropagation on ESC  
 * - Empty callback doesn't throw
 * - Middle element removal preserves order
 * 
 * These require real KeyboardEvent dispatch which linkedom doesn't support.
 */

import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { launchBrowser } from './puppeteer-helper.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Keyboard ESC Stack E2E Tests', () => {
    let browser;
    let page;
    let server;
    let testResults;

    beforeAll(async () => {
        const projectRoot = join(__dirname, '../..');

        server = Bun.serve({
            port: 0,
            fetch(req) {
                const url = new URL(req.url);

                // Serve keyboard.js as ES module
                if (url.pathname === '/keyboard.js') {
                    const src = readFileSync(join(projectRoot, 'src/core/keyboard.js'), 'utf-8');
                    return new Response(src, {
                        headers: { 'Content-Type': 'application/javascript' }
                    });
                }

                // Serve test harness
                return new Response(`<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body>
<script type="module">
import { keyboard } from '/keyboard.js';

const results = {};

try {
    // Test 1: ESC calls topmost handler
    {
        let called = false;
        const el = document.createElement('div');
        const unsub = keyboard.pushEscapeHandler(el, () => { called = true; });
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        results.escCallsTopmost = called;
        unsub();
    }

    // Test 2: Only topmost handler called (LIFO)
    {
        let called1 = false, called2 = false;
        const el1 = document.createElement('div');
        const el2 = document.createElement('div');
        const unsub1 = keyboard.pushEscapeHandler(el1, () => { called1 = true; });
        const unsub2 = keyboard.pushEscapeHandler(el2, () => { called2 = true; });
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        results.lifoOnlyTopmost = called2 && !called1;
        unsub1();
        unsub2();
    }

    // Test 3: Next handler after topmost removed
    {
        let called1 = false;
        const el1 = document.createElement('div');
        const el2 = document.createElement('div');
        const unsub1 = keyboard.pushEscapeHandler(el1, () => { called1 = true; });
        const unsub2 = keyboard.pushEscapeHandler(el2, () => { });
        unsub2(); // Remove topmost
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        results.nextAfterRemoval = called1;
        unsub1();
    }

    // Test 4: Non-ESC keys don't trigger handler
    {
        let called = false;
        const el = document.createElement('div');
        const unsub = keyboard.pushEscapeHandler(el, () => { called = true; });
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        results.nonEscIgnored = !called;
        unsub();
    }

    // Test 5: preventDefault on ESC
    {
        let prevented = false;
        const el = document.createElement('div');
        const unsub = keyboard.pushEscapeHandler(el, () => { });
        const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
        const origPD = event.preventDefault.bind(event);
        Object.defineProperty(event, 'preventDefault', {
            value: () => { prevented = true; origPD(); }
        });
        document.dispatchEvent(event);
        results.preventsDefault = prevented;
        unsub();
    }

    // Test 6: stopPropagation on ESC
    {
        let stopped = false;
        const el = document.createElement('div');
        const unsub = keyboard.pushEscapeHandler(el, () => { });
        const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
        const origSP = event.stopPropagation.bind(event);
        Object.defineProperty(event, 'stopPropagation', {
            value: () => { stopped = true; origSP(); }
        });
        document.dispatchEvent(event);
        results.stopsPropagation = stopped;
        unsub();
    }

    // Test 7: Empty callback doesn't throw
    {
        let noThrow = true;
        const el = document.createElement('div');
        const unsub = keyboard.pushEscapeHandler(el, () => { });
        try {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        } catch (e) {
            noThrow = false;
        }
        results.emptyCallbackNoThrow = noThrow;
        unsub();
    }

    // Test 8: Middle element removal preserves order
    {
        let called1 = false, called3 = false;
        const el1 = document.createElement('div');
        const el2 = document.createElement('div');
        const el3 = document.createElement('div');
        const unsub1 = keyboard.pushEscapeHandler(el1, () => { called1 = true; });
        const unsub2 = keyboard.pushEscapeHandler(el2, () => { });
        const unsub3 = keyboard.pushEscapeHandler(el3, () => { called3 = true; });
        unsub2(); // Remove MIDDLE
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        results.middleRemovalOrder = called3 && !called1;
        unsub1();
        unsub3();
    }

} catch (e) {
    results.error = e.message + '\\n' + e.stack;
}

window._testResults = results;
</script>
</body></html>`, { headers: { 'Content-Type': 'text/html' } });
            }
        });

        browser = await launchBrowser({ testName: 'keyboard-esc' });
        page = await browser.newPage();

        await page.goto(`http://localhost:${server.port}/`, { waitUntil: 'networkidle0' });

        // Wait for tests to complete
        await page.waitForFunction(() => window._testResults !== undefined, { timeout: 5000 });

        testResults = await page.evaluate(() => window._testResults);
    }, 30000);

    afterAll(async () => {
        if (page) await page.close().catch(() => { });
        if (browser) await browser.close().catch(() => { });
        if (server) server.stop();
    });

    // Covers: keyboard.test.js:84 - it.skip('should call topmost handler on ESC key')
    test('ESC calls topmost handler', () => {
        expect(testResults?.error).toBeUndefined();
        expect(testResults?.escCallsTopmost).toBe(true);
    });

    // Covers: keyboard.test.js:98 - it.skip('should only call topmost handler in stack (LIFO)')
    test('LIFO order — only topmost handler called', () => {
        expect(testResults?.lifoOnlyTopmost).toBe(true);
    });

    // Covers: keyboard.test.js:117 - it.skip('should call next handler after topmost is removed')
    test('next handler called after topmost removed', () => {
        expect(testResults?.nextAfterRemoval).toBe(true);
    });

    // Covers: keyboard.test.js:138 - it.skip('should not call handler for other keys')
    test('non-ESC keys do not trigger handler', () => {
        expect(testResults?.nonEscIgnored).toBe(true);
    });

    // Covers: keyboard.test.js:250 - it.skip('should prevent default on ESC when handlers exist')
    test('preventDefault called on ESC', () => {
        expect(testResults?.preventsDefault).toBe(true);
    });

    // Covers: keyboard.test.js:266 - it.skip('should stop propagation on ESC when handlers exist')
    test('stopPropagation called on ESC', () => {
        expect(testResults?.stopsPropagation).toBe(true);
    });

    // Covers: keyboard.test.js:284 - it.skip('should handle empty callback gracefully')
    test('empty callback does not throw', () => {
        expect(testResults?.emptyCallbackNoThrow).toBe(true);
    });

    // Covers: keyboard.test.js:295 - it.skip('should preserve order after middle element is removed')
    test('middle element removal preserves LIFO order', () => {
        expect(testResults?.middleRemovalOrder).toBe(true);
    });
});
