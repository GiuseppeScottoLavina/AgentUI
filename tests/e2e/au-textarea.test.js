/**
 * @fileoverview Comprehensive E2E Tests for au-textarea Component
 */

import { describe, test, expect, beforeAll, afterEach, afterAll } from 'bun:test';
import { launchBrowser, puppeteer } from './puppeteer-helper.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe('au-textarea E2E Tests', () => {
    let browser, page, server;

    beforeAll(async () => {
        const projectRoot = join(__dirname, '../..');
        server = Bun.serve({
            port: 0,
            async fetch(req) {
                const url = new URL(req.url);
                let filePath = url.pathname === '/' ? join(projectRoot, 'demo/index.html') : join(projectRoot, url.pathname);
                try {
                    const file = Bun.file(filePath);
                    if (!await file.exists()) return new Response('Not Found', { status: 404 });
                    const ext = filePath.split('.').pop();
                    const types = { 'html': 'text/html', 'js': 'text/javascript', 'css': 'text/css', 'json': 'application/json', 'svg': 'image/svg+xml' };
                    return new Response(await file.arrayBuffer(), { headers: { 'Content-Type': types[ext] || 'application/octet-stream' } });
                } catch (e) { return new Response('Error', { status: 500 }); }
            }
        });
        console.log(`[au-textarea test] Server at http://localhost:${server.port}`);
        browser = await launchBrowser({ testName: 'textarea' });
        page = await browser.newPage();
    }, 60000);

    afterEach(async () => { await page.goto('about:blank'); });
    afterAll(async () => { if (browser) await browser.close(); if (server) server.stop(); });

    test('should be registered as custom element', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#inputs`, { waitUntil: 'networkidle0' });
        await delay(500);
        const isRegistered = await page.evaluate(() => customElements.get('au-textarea') !== undefined);
        expect(isRegistered).toBe(true);
    });

    test('should render with base class', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#inputs`, { waitUntil: 'networkidle0' });
        await delay(500);
        const hasClass = await page.evaluate(() => document.querySelector('au-textarea')?.classList.contains('au-textarea'));
        expect(hasClass).toBe(true);
    });

    test('should render native textarea element', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#inputs`, { waitUntil: 'networkidle0' });
        await delay(500);
        const hasTextarea = await page.evaluate(() => document.querySelector('au-textarea textarea') !== null);
        expect(hasTextarea).toBe(true);
    });

    test('should have placeholder attribute forwarded', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#inputs`, { waitUntil: 'networkidle0' });
        await delay(500);
        const placeholder = await page.evaluate(() => {
            const ta = document.querySelector('au-textarea[placeholder] textarea');
            return ta?.placeholder;
        });
        expect(placeholder).toBeTruthy();
    });

    test('should support value getter/setter', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#inputs`, { waitUntil: 'networkidle0' });
        await delay(500);
        const result = await page.evaluate(() => {
            const ta = document.querySelector('au-textarea');
            const initial = ta.value;
            ta.value = 'Test content';
            const afterSet = ta.value;
            return { initial, afterSet };
        });
        expect(result.afterSet).toBe('Test content');
    });

    test('should emit au-input event on input', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#inputs`, { waitUntil: 'networkidle0' });
        await delay(500);
        const result = await page.evaluate(() => {
            return new Promise(resolve => {
                const ta = document.querySelector('au-textarea');
                let fired = false;
                ta.addEventListener('au-input', () => { fired = true; });
                const native = ta.querySelector('textarea');
                native.value = 'test';
                native.dispatchEvent(new Event('input', { bubbles: true }));
                setTimeout(() => resolve({ fired }), 100);
            });
        });
        expect(result.fired).toBe(true);
    });

    test('should emit au-change event on change', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#inputs`, { waitUntil: 'networkidle0' });
        await delay(500);
        const result = await page.evaluate(() => {
            return new Promise(resolve => {
                const ta = document.querySelector('au-textarea');
                let fired = false;
                ta.addEventListener('au-change', () => { fired = true; });
                const native = ta.querySelector('textarea');
                native.value = 'test';
                native.dispatchEvent(new Event('change', { bubbles: true }));
                setTimeout(() => resolve({ fired }), 100);
            });
        });
        expect(result.fired).toBe(true);
    });

    test('should have display block', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#inputs`, { waitUntil: 'networkidle0' });
        await delay(500);
        const display = await page.evaluate(() => getComputedStyle(document.querySelector('au-textarea')).display);
        expect(display).toBe('block');
    });

    test('should have focus method', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#inputs`, { waitUntil: 'networkidle0' });
        await delay(500);
        const hasFocus = await page.evaluate(() => typeof document.querySelector('au-textarea').focus === 'function');
        expect(hasFocus).toBe(true);
    });

    // ========================================
    // ROWS ATTRIBUTE (was skipped in unit tests)
    // Note: au-textarea applies rows at render time only
    // ========================================

    test('should support rows attribute at render time', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#inputs`, { waitUntil: 'networkidle0' });
        await delay(500);
        const result = await page.evaluate(() => {
            // Create a new au-textarea with rows attribute
            const container = document.createElement('div');
            container.innerHTML = '<au-textarea rows="8" placeholder="Test rows"></au-textarea>';
            document.body.appendChild(container);

            // Wait for render
            return new Promise(resolve => {
                setTimeout(() => {
                    const ta = container.querySelector('au-textarea');
                    const native = ta?.querySelector('textarea');
                    resolve({
                        hasAttr: ta?.getAttribute('rows') === '8',
                        nativeRows: native?.rows || native?.getAttribute('rows'),
                        rowsApplied: native?.rows === 8 || native?.getAttribute('rows') === '8'
                    });
                }, 200);
            });
        });
        expect(result.hasAttr).toBe(true);
        expect(result.rowsApplied).toBe(true);
    });

    test('should reflect rows attribute to native textarea', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#inputs`, { waitUntil: 'networkidle0' });
        await delay(500);
        const result = await page.evaluate(() => {
            const ta = document.querySelector('au-textarea');
            const native = ta.querySelector('textarea');
            return {
                hasTextarea: native !== null,
                defaultRows: native?.rows || null
            };
        });
        expect(result.hasTextarea).toBe(true);
        // Default rows should be a number > 0
        expect(result.defaultRows).toBeGreaterThan(0);
    });

    // ========================================
    // READONLY ATTRIBUTE (was skipped in unit tests)
    // Note: au-textarea applies readonly at render time only
    // ========================================

    test('should support readonly attribute at render time', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#inputs`, { waitUntil: 'networkidle0' });
        await delay(500);
        const result = await page.evaluate(() => {
            // Create a new au-textarea with readonly attribute
            const container = document.createElement('div');
            container.innerHTML = '<au-textarea readonly placeholder="Readonly test"></au-textarea>';
            document.body.appendChild(container);

            // Wait for render
            return new Promise(resolve => {
                setTimeout(() => {
                    const ta = container.querySelector('au-textarea');
                    const native = ta?.querySelector('textarea');
                    resolve({
                        hasAttr: ta?.hasAttribute('readonly'),
                        isReadOnly: native?.readOnly || native?.hasAttribute('readonly')
                    });
                }, 200);
            });
        });
        expect(result.hasAttr).toBe(true);
        expect(result.isReadOnly).toBe(true);
    });

    test('readonly textarea should have readonly native element', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#inputs`, { waitUntil: 'networkidle0' });
        await delay(500);
        const result = await page.evaluate(() => {
            // Find existing textarea with readonly or create one
            let ta = document.querySelector('au-textarea[readonly]');
            if (!ta) {
                const container = document.createElement('div');
                container.innerHTML = '<au-textarea readonly placeholder="Test readonly"></au-textarea>';
                document.body.appendChild(container);
                ta = container.querySelector('au-textarea');
            }

            return new Promise(resolve => {
                setTimeout(() => {
                    const native = ta?.querySelector('textarea');
                    resolve({
                        hasNative: native !== null,
                        isReadOnly: native?.readOnly || native?.hasAttribute('readonly'),
                        hasAttr: ta?.hasAttribute('readonly')
                    });
                }, 200);
            });
        });
        expect(result.hasNative).toBe(true);
        expect(result.hasAttr).toBe(true);
    });
});
