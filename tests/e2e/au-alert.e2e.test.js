/**
 * @fileoverview E2E Tests for au-alert Component
 * Covers: role=alert, dismiss method
 */

import { describe, test, expect, beforeAll, afterEach, afterAll } from 'bun:test';
import { launchBrowser, puppeteer } from './puppeteer-helper.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe('au-alert E2E Tests', () => {
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
        console.log(`[au-alert test] Server at http://localhost:${server.port}`);
        browser = await launchBrowser({ testName: 'alert' });
        page = await browser.newPage();
    }, 60000);

    afterEach(async () => { await page.goto('about:blank'); });
    afterAll(async () => { if (browser) await browser.close(); if (server) server.stop(); });

    test('should be registered as custom element', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#alerts`, { waitUntil: 'networkidle0' });
        await delay(500);
        const isRegistered = await page.evaluate(() => customElements.get('au-alert') !== undefined);
        expect(isRegistered).toBe(true);
    });

    test('should render with base class', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#alerts`, { waitUntil: 'networkidle0' });
        await delay(500);
        const hasClass = await page.evaluate(() => document.querySelector('au-alert')?.classList.contains('au-alert'));
        expect(hasClass).toBe(true);
    });

    // Covers: test.skip('should set role alert (E2E only)')
    test('should set role alert', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#alerts`, { waitUntil: 'networkidle0' });
        await delay(500);
        const role = await page.evaluate(() => document.querySelector('au-alert')?.getAttribute('role'));
        expect(role).toBe('alert');
    });

    // Covers: test.skip('should have dismiss method (E2E only)')
    test('should have dismiss method', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#alerts`, { waitUntil: 'networkidle0' });
        await delay(500);
        const hasDismiss = await page.evaluate(() => typeof document.querySelector('au-alert')?.dismiss === 'function');
        expect(hasDismiss).toBe(true);
    });

    test('dismiss should remove alert from DOM', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#alerts`, { waitUntil: 'networkidle0' });
        await delay(500);
        const result = await page.evaluate(async () => {
            const alerts = document.querySelectorAll('au-alert');
            const countBefore = alerts.length;
            if (countBefore === 0) return { removed: false };

            const alert = alerts[0];
            alert.dismiss?.();
            await new Promise(r => setTimeout(r, 500)); // Wait for animation

            const countAfter = document.querySelectorAll('au-alert').length;
            return { removed: countAfter < countBefore };
        });
        expect(result.removed).toBe(true);
    });

    test('should support severity attribute', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#alerts`, { waitUntil: 'networkidle0' });
        await delay(500);
        const result = await page.evaluate(() => {
            const alertWithSeverity = document.querySelector('au-alert[severity]');
            return { hasSeverity: alertWithSeverity !== null };
        });
        expect(result.hasSeverity).toBe(true);
    });

    test('should have aria-live polite', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#alerts`, { waitUntil: 'networkidle0' });
        await delay(500);
        const ariaLive = await page.evaluate(() => document.querySelector('au-alert')?.getAttribute('aria-live'));
        expect(['polite', 'assertive']).toContain(ariaLive);
    });
});
