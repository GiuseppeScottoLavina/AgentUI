/**
 * @fileoverview E2E Tests for au-radio Component
 * Covers: outer circle, inner circle rendering
 */

import { describe, test, expect, beforeAll, afterEach, afterAll } from 'bun:test';
import { launchBrowser, puppeteer } from './puppeteer-helper.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe('au-radio E2E Tests', () => {
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
        console.log(`[au-radio test] Server at http://localhost:${server.port}`);
        browser = await launchBrowser({ testName: 'radio' });
        page = await browser.newPage();
    }, 60000);

    afterEach(async () => { await page.goto('about:blank'); });
    afterAll(async () => { if (browser) await browser.close(); if (server) server.stop(); });

    test('should be registered as custom element', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#radios`, { waitUntil: 'networkidle0' });
        await delay(500);
        const isRegistered = await page.evaluate(() => customElements.get('au-radio') !== undefined);
        expect(isRegistered).toBe(true);
    });

    test('should render with base class', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#radios`, { waitUntil: 'networkidle0' });
        await delay(500);
        const hasClass = await page.evaluate(() => document.querySelector('au-radio')?.classList.contains('au-radio'));
        expect(hasClass).toBe(true);
    });

    // Covers: test.skip('au-radio should render outer circle (E2E only)')
    test('should render circle element', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#radios`, { waitUntil: 'networkidle0' });
        await delay(500);
        const result = await page.evaluate(() => {
            const radio = document.querySelector('au-radio');
            const circle = radio.querySelector('.au-radio__circle');
            return { hasCircle: circle !== null };
        });
        expect(result.hasCircle).toBe(true);
    });

    // Covers: test.skip('au-radio should render inner circle (E2E only)')
    test('should render dot element', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#radios`, { waitUntil: 'networkidle0' });
        await delay(500);
        const result = await page.evaluate(() => {
            const radio = document.querySelector('au-radio');
            const dot = radio.querySelector('.au-radio__dot');
            return { hasDot: dot !== null };
        });
        expect(result.hasDot).toBe(true);
    });

    test('should have role radio', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#radios`, { waitUntil: 'networkidle0' });
        await delay(500);
        const role = await page.evaluate(() => document.querySelector('au-radio')?.getAttribute('role'));
        expect(role).toBe('radio');
    });

    test('should have aria-checked attribute', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#radios`, { waitUntil: 'networkidle0' });
        await delay(500);
        const ariaChecked = await page.evaluate(() => document.querySelector('au-radio')?.getAttribute('aria-checked'));
        expect(['true', 'false']).toContain(ariaChecked);
    });

    test('should toggle selection on click', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#radios`, { waitUntil: 'networkidle0' });
        await delay(500);
        const result = await page.evaluate(async () => {
            const radio = document.querySelector('au-radio:not([checked])');
            if (!radio) return { toggled: false };
            const beforeChecked = radio.getAttribute('aria-checked');
            radio.click();
            await new Promise(r => setTimeout(r, 100));
            const afterChecked = radio.getAttribute('aria-checked');
            return { toggled: beforeChecked !== afterChecked };
        });
        expect(result.toggled).toBe(true);
    });
});
