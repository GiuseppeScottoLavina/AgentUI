/**
 * @fileoverview E2E Tests for au-icon Component
 * Covers: role=img, aria-hidden, render idempotency, icon name rendering,
 * Google Fonts auto-injection, SVG rendering for bundled icons
 */

import { describe, test, expect, beforeAll, afterEach, afterAll } from 'bun:test';
import { launchBrowser } from './puppeteer-helper.js';
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
        console.log(`[au-icon e2e] Server at http://localhost:${server.port}`);
        browser = await launchBrowser({ testName: 'au-icon' });
        page = await browser.newPage();
    }, 60000);

    afterEach(async () => { await page.goto('about:blank'); });
    afterAll(async () => { if (browser) await browser.close(); if (server) server.stop(); });

    test('should set role img', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#icons`, { waitUntil: 'networkidle0' });
        await delay(500);
        const role = await page.evaluate(() => document.querySelector('au-icon')?.getAttribute('role'));
        expect(role).toBe('img');
    });

    test('should set aria-hidden by default', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#icons`, { waitUntil: 'networkidle0' });
        await delay(500);
        const ariaHidden = await page.evaluate(() => document.querySelector('au-icon')?.getAttribute('aria-hidden'));
        expect(ariaHidden).toBe('true');
    });

    test('render should be idempotent', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#icons`, { waitUntil: 'networkidle0' });
        await delay(500);
        const result = await page.evaluate(() => {
            const icon = document.querySelector('au-icon');
            if (!icon) return { ok: false, reason: 'no icon found' };
            const contentBefore = icon.innerHTML;
            icon.render();
            const contentAfter = icon.innerHTML;
            return { ok: contentBefore === contentAfter };
        });
        expect(result.ok).toBe(true);
    });

    test('should render bundled icon as SVG', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#icons`, { waitUntil: 'networkidle0' });
        await delay(500);
        const hasSvg = await page.evaluate(() => {
            const icon = document.querySelector('au-icon[name="home"]') || document.querySelector('au-icon');
            return icon?.querySelector('svg') !== null;
        });
        expect(hasSvg).toBe(true);
    });

    test('should render icon name as text for non-bundled icons', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html`, { waitUntil: 'networkidle0' });
        await delay(500);
        const result = await page.evaluate(() => {
            const icon = document.createElement('au-icon');
            icon.setAttribute('name', 'zzz_test_render');
            document.body.appendChild(icon);
            // Wait for connectedCallback
            return new Promise(resolve => {
                setTimeout(() => {
                    const span = icon.querySelector('span.material-symbols-outlined');
                    resolve({
                        hasSpan: span !== null,
                        textContent: span?.textContent || ''
                    });
                }, 100);
            });
        });
        expect(result.hasSpan).toBe(true);
        expect(result.textContent).toBe('zzz_test_render');
    });

    test('should auto-inject Google Fonts link for non-bundled icons', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html`, { waitUntil: 'networkidle0' });
        await delay(500);
        const result = await page.evaluate(() => {
            const icon = document.createElement('au-icon');
            icon.setAttribute('name', 'zzz_font_inject_test');
            document.body.appendChild(icon);
            return new Promise(resolve => {
                setTimeout(() => {
                    const link = document.querySelector('link[href*="Material+Symbols+Outlined"]');
                    resolve({ hasLink: link !== null });
                }, 200);
            });
        });
        expect(result.hasLink).toBe(true);
    });
});
