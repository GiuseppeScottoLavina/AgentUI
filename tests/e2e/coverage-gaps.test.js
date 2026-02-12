/**
 * @fileoverview E2E tests for scenarios that fail in LinkedOM
 * 
 * Covers:
 * - au-lazy: IntersectionObserver + viewport visibility
 * - au-confirm: dialog showModal/close with real API
 * - au-form: getFormData with real <select> elements
 * - debounce/throttle: Real setTimeout timing
 * 
 * These tests run in a real browser via Puppeteer, bypassing
 * LinkedOM's limitations entirely.
 */

import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { launchBrowser } from './puppeteer-helper.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Coverage Gap E2E Tests', () => {
    let browser;
    let page;
    let server;
    let testResults;

    beforeAll(async () => {
        const projectRoot = join(__dirname, '../..');

        // Start embedded HTTP server
        server = Bun.serve({
            port: 0,
            async fetch(req) {
                const url = new URL(req.url);
                let filePath = join(projectRoot, url.pathname);

                if (url.pathname === '/') {
                    filePath = join(__dirname, 'coverage-harness.html');
                }

                try {
                    const file = Bun.file(filePath);
                    if (!await file.exists()) {
                        return new Response('Not Found', { status: 404 });
                    }

                    const content = await file.text();
                    const ext = filePath.split('.').pop();
                    const types = {
                        html: 'text/html',
                        js: 'text/javascript',
                        css: 'text/css',
                        json: 'application/json',
                    };

                    return new Response(content, {
                        headers: { 'Content-Type': types[ext] || 'text/plain' }
                    });
                } catch (e) {
                    return new Response('Error: ' + e.message, { status: 500 });
                }
            }
        });

        const serverUrl = `http://localhost:${server.port}`;

        browser = await launchBrowser({ testName: 'coverage-gaps' });
        page = await browser.newPage();

        page.on('pageerror', err => {
            console.error('[PAGE ERROR]', err.message);
        });

        await page.goto(serverUrl, { waitUntil: 'domcontentloaded' });

        // Wait for all tests to complete
        try {
            await page.waitForFunction(() => window.testsComplete === true, {
                timeout: 15000
            });
        } catch (e) {
            console.error('Tests did not complete in time');
        }

        // Retrieve results
        testResults = await page.evaluate(() => window.testResults);
    }, 30000);

    afterAll(async () => {
        await page?.close();
        await browser?.close();
        server?.stop();
    });

    // ─── AU-LAZY ──────────────────────────────────────────────────────

    describe('au-lazy (IntersectionObserver)', () => {
        test('load() should force-load content', () => {
            expect(testResults?.lazyForceLoad).toBe(true);
        });

        test('load() should add is-loaded class', () => {
            expect(testResults?.lazyIsLoadedClass).toBe(true);
        });

        test('load() should be idempotent', () => {
            expect(testResults?.lazyIdempotent).toBe(true);
        });

        test('load() should remove placeholder', () => {
            expect(testResults?.lazyRemovePlaceholder).toBe(true);
        });

        test('load() should emit au-loaded event', () => {
            expect(testResults?.lazyEmitsEvent).toBe(true);
        });

        test('observer should auto-load when element is in viewport', () => {
            expect(testResults?.lazyAutoLoad).toBe(true);
        });
    });

    // ─── AU-CONFIRM ───────────────────────────────────────────────────

    describe('au-confirm (dialog)', () => {
        test('open() should open dialog', () => {
            expect(testResults?.confirmDialogOpen).toBe(true);
        });

        test('should have confirm button', () => {
            expect(testResults?.confirmHasButton).toBe(true);
        });
    });

    // ─── AU-FORM ──────────────────────────────────────────────────────

    describe('au-form (select)', () => {
        test('getFormData should return object', () => {
            expect(testResults?.formHasData).toBe(true);
        });

        test('select.value should work', () => {
            expect(testResults?.formSelectValue).toBe(true);
        });

        test('getFormData should capture select value', () => {
            expect(testResults?.formSelectInData).toBe(true);
        });
    });

    // ─── DEBOUNCE & THROTTLE ──────────────────────────────────────────

    describe('debounce & throttle (real timers)', () => {
        test('debounce should delay execution', () => {
            expect(testResults?.debounceDelay).toBe(true);
        });

        test('debounce should reset timer on new calls', () => {
            expect(testResults?.debounceReset).toBe(true);
        });

        test('throttle should limit call frequency', () => {
            expect(testResults?.throttle).toBe(true);
        });
    });
});
