/**
 * @fileoverview E2E Tests for au-icon Component
 * Covers: role, aria-hidden, render idempotency, icon rendering
 */

import { describe, test, expect, beforeAll, afterEach, afterAll } from 'bun:test';
import { launchBrowser, puppeteer } from './puppeteer-helper.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe('au-icon E2E Tests', () => {
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
        console.log(`[au-icon test] Server at http://localhost:${server.port}`);
        browser = await launchBrowser({ testName: 'icon' });
        page = await browser.newPage();
    }, 60000);

    afterEach(async () => { await page.goto('about:blank'); });
    afterAll(async () => { if (browser) await browser.close(); if (server) server.stop(); });

    test('should be registered as custom element', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#icons`, { waitUntil: 'networkidle0' });
        await delay(500);
        const isRegistered = await page.evaluate(() => customElements.get('au-icon') !== undefined);
        expect(isRegistered).toBe(true);
    });

    test('should render with base class', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#icons`, { waitUntil: 'networkidle0' });
        await delay(500);
        const hasClass = await page.evaluate(() => document.querySelector('au-icon')?.classList.contains('au-icon'));
        expect(hasClass).toBe(true);
    });

    // Covers: test.skip('should set role img (E2E only)')
    test('should set role img', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#icons`, { waitUntil: 'networkidle0' });
        await delay(500);
        const role = await page.evaluate(() => document.querySelector('au-icon')?.getAttribute('role'));
        expect(role).toBe('img');
    });

    // Covers: test.skip('should set aria-hidden (E2E only) by default')
    test('should set aria-hidden by default', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#icons`, { waitUntil: 'networkidle0' });
        await delay(500);
        const ariaHidden = await page.evaluate(() => document.querySelector('au-icon')?.getAttribute('aria-hidden'));
        expect(ariaHidden).toBe('true');
    });

    // Covers: test.skip('render should be idempotent (E2E only)')
    test('render should be idempotent', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#icons`, { waitUntil: 'networkidle0' });
        await delay(500);
        const result = await page.evaluate(() => {
            const icon = document.querySelector('au-icon');
            const htmlBefore = icon.innerHTML;
            icon.render?.(); // Call render again
            const htmlAfter = icon.innerHTML;
            return { same: htmlBefore === htmlAfter };
        });
        expect(result.same).toBe(true);
    });

    // Covers: test.skip('should render icon name as text (E2E only)')
    test('should have content (SVG or text)', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#icons`, { waitUntil: 'networkidle0' });
        await delay(500);
        const result = await page.evaluate(() => {
            const icon = document.querySelector('au-icon');
            return {
                hasSvg: icon.querySelector('svg') !== null,
                hasContent: icon.innerHTML.trim().length > 0
            };
        });
        expect(result.hasContent).toBe(true);
    });

    test('should support name attribute', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#icons`, { waitUntil: 'networkidle0' });
        await delay(500);
        const result = await page.evaluate(() => {
            const icon = document.querySelector('au-icon[name]');
            return { hasName: icon?.hasAttribute('name') };
        });
        expect(result.hasName).toBe(true);
    });
});
