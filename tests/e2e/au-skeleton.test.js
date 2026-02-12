/**
 * @fileoverview Comprehensive E2E Tests for au-skeleton Component
 */

import { describe, test, expect, beforeAll, afterEach, afterAll } from 'bun:test';
import { launchBrowser, puppeteer } from './puppeteer-helper.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe('au-skeleton E2E Tests', () => {
    let browser, page, server;

    beforeAll(async () => {
        const projectRoot = join(__dirname, '../..');
        server = Bun.serve({
            port: 0,
            async fetch(req) {
                const url = new URL(req.url);

                // Serve test harness with skeleton elements
                if (url.pathname === '/test-skeleton') {
                    return new Response(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <link rel="stylesheet" href="/dist/agentui.css">
                            <script type="module">
                                import '/dist/agentui.esm.js';
                                await customElements.whenDefined('au-skeleton');
                                document.body.dataset.ready = 'true';
                            <\/script>
                        </head>
                        <body>
                            <div id="test-container">
                                <au-skeleton id="default"></au-skeleton>
                                <au-skeleton id="sized" width="200px" height="30px"></au-skeleton>
                                <au-skeleton id="circle" variant="circle" size="50px"></au-skeleton>
                                <au-skeleton id="text" variant="text" lines="3"></au-skeleton>
                            </div>
                        </body>
                        </html>
                    `, { headers: { 'Content-Type': 'text/html' } });
                }

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
        console.log(`[au-skeleton test] Server at http://localhost:${server.port}`);
        browser = await launchBrowser({ testName: 'skeleton' });
        page = await browser.newPage();
    }, 60000);

    afterEach(async () => { await page.goto('about:blank'); });
    afterAll(async () => { if (browser) await browser.close(); if (server) server.stop(); });

    test('should be registered as custom element', async () => {
        await page.goto(`http://localhost:${server.port}/test-skeleton`, { waitUntil: 'networkidle0' });
        await delay(500);
        const isRegistered = await page.evaluate(() => customElements.get('au-skeleton') !== undefined);
        expect(isRegistered).toBe(true);
    });

    test('should render with base class', async () => {
        await page.goto(`http://localhost:${server.port}/test-skeleton`, { waitUntil: 'networkidle0' });
        await delay(500);
        const hasClass = await page.evaluate(() => document.querySelector('au-skeleton')?.classList.contains('au-skeleton'));
        expect(hasClass).toBe(true);
    });

    test('should have display block', async () => {
        await page.goto(`http://localhost:${server.port}/test-skeleton`, { waitUntil: 'networkidle0' });
        await delay(500);
        const display = await page.evaluate(() => getComputedStyle(document.querySelector('au-skeleton')).display);
        expect(display).toBe('block');
    });

    test('should have animation', async () => {
        await page.goto(`http://localhost:${server.port}/test-skeleton`, { waitUntil: 'networkidle0' });
        await delay(500);
        const hasAnimation = await page.evaluate(() => {
            const skeleton = document.querySelector('#default');
            const style = getComputedStyle(skeleton);
            return style.animationName !== 'none';
        });
        expect(hasAnimation).toBe(true);
    });

    test('should support width and height attributes', async () => {
        await page.goto(`http://localhost:${server.port}/test-skeleton`, { waitUntil: 'networkidle0' });
        await delay(500);
        const result = await page.evaluate(() => {
            const skeleton = document.querySelector('#sized');
            return {
                width: skeleton.style.width,
                height: skeleton.style.height
            };
        });
        expect(result.width).toBe('200px');
        expect(result.height).toBe('30px');
    });

    test('should support circle variant with 50% border-radius', async () => {
        await page.goto(`http://localhost:${server.port}/test-skeleton`, { waitUntil: 'networkidle0' });
        await delay(500);
        const borderRadius = await page.evaluate(() => {
            const skeleton = document.querySelector('#circle');
            return skeleton.style.borderRadius;
        });
        expect(borderRadius).toBe('50%');
    });

    test('should inject keyframes style', async () => {
        await page.goto(`http://localhost:${server.port}/test-skeleton`, { waitUntil: 'networkidle0' });
        await delay(500);
        const hasKeyframes = await page.evaluate(() => document.getElementById('au-skeleton-styles') !== null);
        expect(hasKeyframes).toBe(true);
    });

    test('should support text variant with multiple lines', async () => {
        await page.goto(`http://localhost:${server.port}/test-skeleton`, { waitUntil: 'networkidle0' });
        await delay(500);
        const lineCount = await page.evaluate(() => {
            const skeleton = document.querySelector('#text');
            return skeleton.querySelectorAll('.au-skeleton__line').length;
        });
        expect(lineCount).toBe(3);
    });
});
