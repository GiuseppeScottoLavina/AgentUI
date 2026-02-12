/**
 * @fileoverview Comprehensive E2E Tests for au-virtual-list Component
 * 
 * Tests:
 * - Component registration and basic rendering
 * - Virtual scrolling with large datasets
 * - Item rendering and visibility
 * - scrollToIndex method
 * - Performance with large lists
 */

import { describe, test, expect, beforeAll, afterEach, afterAll } from 'bun:test';
import { launchBrowser, puppeteer } from './puppeteer-helper.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe('au-virtual-list E2E Tests', () => {
    let browser;
    let page;
    let server;

    beforeAll(async () => {
        const projectRoot = join(__dirname, '../..');

        server = Bun.serve({
            port: 0,
            async fetch(req) {
                const url = new URL(req.url);
                let filePath = join(projectRoot, url.pathname);

                if (url.pathname === '/') {
                    filePath = join(projectRoot, 'demo/index.html');
                }

                // Serve the virtual-list test harness
                if (url.pathname === '/test-virtual-list.html') {
                    return new Response(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <title>Virtual List Test</title>
                            <script type="module" src="/dist/agentui.esm.js"></script>
                            <style>
                                #test-list {
                                    height: 400px;
                                    border: 1px solid #ccc;
                                }
                            </style>
                        </head>
                        <body>
                            <au-virtual-list id="test-list" item-height="50" buffer="5"></au-virtual-list>
                            <script type="module">
                                // Must wait for custom element upgrade (define() uses scheduler.postTask)
                                await customElements.whenDefined('au-virtual-list');
                                const list = document.getElementById('test-list');
                                // Create 1000 items
                                const items = Array.from({ length: 1000 }, (_, i) => ({
                                    id: i,
                                    name: 'Item ' + i
                                }));
                                list.items = items;
                                list.renderItem = (item) => '<div class="item">Item ' + item.id + ': ' + item.name + '</div>';
                            </script>
                        </body>
                        </html>
                    `, { headers: { 'Content-Type': 'text/html' } });
                }

                try {
                    const file = Bun.file(filePath);
                    if (!await file.exists()) {
                        return new Response('Not Found', { status: 404 });
                    }

                    const content = await file.arrayBuffer();
                    const ext = filePath.split('.').pop();
                    const mimeTypes = {
                        'html': 'text/html',
                        'js': 'text/javascript',
                        'css': 'text/css',
                        'json': 'application/json',
                        'svg': 'image/svg+xml'
                    };

                    return new Response(content, {
                        headers: { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' }
                    });
                } catch (e) {
                    return new Response('Error: ' + e.message, { status: 500 });
                }
            }
        });

        console.log(`[au-virtual-list test] Server started at http://localhost:${server.port}`);

        browser = await launchBrowser({ testName: 'virtual_list' });
        page = await browser.newPage();
    }, 60000);

    afterEach(async () => {
        await page.goto('about:blank');
    });

    afterAll(async () => {
        if (browser) await browser.close();
        if (server) server.stop();
    });

    // ========================================
    // COMPONENT REGISTRATION
    // ========================================

    test('should be registered as custom element', async () => {
        await page.goto(`http://localhost:${server.port}/test-virtual-list.html`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const isRegistered = await page.evaluate(() =>
            customElements.get('au-virtual-list') !== undefined
        );

        expect(isRegistered).toBe(true);
    });

    test('should render with base class', async () => {
        await page.goto(`http://localhost:${server.port}/test-virtual-list.html`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const hasBaseClass = await page.evaluate(() => {
            const el = document.querySelector('au-virtual-list');
            return el?.classList.contains('au-virtual-list');
        });

        expect(hasBaseClass).toBe(true);
    });

    // ========================================
    // VIEWPORT AND CONTAINER STRUCTURE
    // ========================================

    test('should render viewport container', async () => {
        await page.goto(`http://localhost:${server.port}/test-virtual-list.html`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(() => {
            const el = document.querySelector('au-virtual-list');
            const viewport = el?.querySelector('.au-virtual-list__viewport');
            return {
                hasViewport: viewport !== null,
                overflowY: viewport ? getComputedStyle(viewport).overflowY : null
            };
        });

        expect(result.hasViewport).toBe(true);
        expect(result.overflowY).toBe('auto');
    });

    test('should render content container with correct total height', async () => {
        await page.goto(`http://localhost:${server.port}/test-virtual-list.html`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(() => {
            const el = document.querySelector('au-virtual-list');
            const content = el?.querySelector('.au-virtual-list__content');
            const height = content ? parseInt(content.style.height) : 0;
            // 1000 items * 50px = 50000px
            return { height, expected: 1000 * 50 };
        });

        expect(result.height).toBe(result.expected);
    });

    // ========================================
    // VIRTUAL RENDERING
    // ========================================

    test('should only render visible items (virtual scrolling)', async () => {
        await page.goto(`http://localhost:${server.port}/test-virtual-list.html`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(() => {
            const el = document.querySelector('au-virtual-list');
            const items = el?.querySelectorAll('.au-virtual-list__item');
            // With 400px height, 50px items, and buffer of 5, should have ~18-20 items
            return {
                renderedCount: items?.length || 0,
                totalItems: 1000
            };
        });

        // Should NOT render all 1000 items
        expect(result.renderedCount).toBeLessThan(50);
        expect(result.renderedCount).toBeGreaterThan(0);
    });

    test('should render items with correct positioning', async () => {
        await page.goto(`http://localhost:${server.port}/test-virtual-list.html`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(() => {
            const el = document.querySelector('au-virtual-list');
            const items = el?.querySelectorAll('.au-virtual-list__item');
            if (!items || items.length === 0) return { error: 'No items' };

            const firstItem = items[0];
            const top = parseInt(firstItem.style.top);
            const height = parseInt(firstItem.style.height);
            const position = getComputedStyle(firstItem).position;

            return { top, height, position };
        });

        expect(result.position).toBe('absolute');
        expect(result.height).toBe(50);
        expect(result.top).toBe(0); // First visible item starts at 0
    });

    // ========================================
    // SCROLL BEHAVIOR
    // ========================================

    test('should update visible items on scroll', async () => {
        await page.goto(`http://localhost:${server.port}/test-virtual-list.html`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(async () => {
            const el = document.querySelector('au-virtual-list');
            const viewport = el.querySelector('.au-virtual-list__viewport');

            // Get first visible item before scroll
            const beforeItems = el.querySelectorAll('.au-virtual-list__item');
            const beforeIndex = parseInt(beforeItems[0]?.getAttribute('data-index') || '0');

            // Scroll down 500px (10 items)
            viewport.scrollTop = 500;

            // Wait for throttled scroll handler (16ms) + render time
            await new Promise(r => setTimeout(r, 150));

            const afterItems = el.querySelectorAll('.au-virtual-list__item');
            const afterIndex = parseInt(afterItems[0]?.getAttribute('data-index') || '0');

            return { beforeIndex, afterIndex, scrolled: afterIndex > beforeIndex };
        });

        expect(result.scrolled).toBe(true);
        expect(result.afterIndex).toBeGreaterThan(result.beforeIndex);
    });

    // ========================================
    // scrollToIndex METHOD
    // ========================================

    test('should have scrollToIndex method', async () => {
        await page.goto(`http://localhost:${server.port}/test-virtual-list.html`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const hasMethod = await page.evaluate(() => {
            const el = document.querySelector('au-virtual-list');
            return typeof el?.scrollToIndex === 'function';
        });

        expect(hasMethod).toBe(true);
    });

    test('scrollToIndex should scroll to correct position', async () => {
        await page.goto(`http://localhost:${server.port}/test-virtual-list.html`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(async () => {
            const el = document.querySelector('au-virtual-list');
            const viewport = el.querySelector('.au-virtual-list__viewport');

            el.scrollToIndex(100);

            // Wait for scroll
            await new Promise(r => setTimeout(r, 100));

            const scrollTop = viewport.scrollTop;
            const expectedScrollTop = 100 * 50; // index * itemHeight

            return { scrollTop, expectedScrollTop };
        });

        expect(result.scrollTop).toBe(result.expectedScrollTop);
    });

    // ========================================
    // ITEMS PROPERTY
    // ========================================

    test('should have items getter and setter', async () => {
        await page.goto(`http://localhost:${server.port}/test-virtual-list.html`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(() => {
            const el = document.querySelector('au-virtual-list');
            const items = el.items;
            return {
                isArray: Array.isArray(items),
                length: items?.length
            };
        });

        expect(result.isArray).toBe(true);
        expect(result.length).toBe(1000);
    });

    test('should update when items are changed', async () => {
        await page.goto(`http://localhost:${server.port}/test-virtual-list.html`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(async () => {
            const el = document.querySelector('au-virtual-list');
            const content = el.querySelector('.au-virtual-list__content');

            const heightBefore = parseInt(content.style.height);

            // Set new items array
            el.items = Array.from({ length: 500 }, (_, i) => ({ id: i, name: 'New Item ' + i }));

            // Wait for render
            await new Promise(r => setTimeout(r, 100));

            const heightAfter = parseInt(content.style.height);

            return { heightBefore, heightAfter, changed: heightBefore !== heightAfter };
        });

        expect(result.changed).toBe(true);
        expect(result.heightAfter).toBe(500 * 50); // 500 items * 50px
    });

    // ========================================
    // RENDER ITEM CALLBACK
    // ========================================

    test('should use custom renderItem callback', async () => {
        await page.goto(`http://localhost:${server.port}/test-virtual-list.html`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(() => {
            const el = document.querySelector('au-virtual-list');
            const item = el.querySelector('.au-virtual-list__item');
            return {
                hasCustomContent: item !== null,
                text: item?.textContent?.trim()
            };
        });

        expect(result.hasCustomContent).toBe(true);
        // The item renders the content from renderItem callback
        expect(result.text).toBeTruthy();
    });

    // ========================================
    // DATA ATTRIBUTES
    // ========================================

    test('should have data-index attribute on items', async () => {
        await page.goto(`http://localhost:${server.port}/test-virtual-list.html`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(() => {
            const el = document.querySelector('au-virtual-list');
            const items = el.querySelectorAll('.au-virtual-list__item');
            const indices = Array.from(items).map(i => parseInt(i.getAttribute('data-index')));
            return {
                hasIndices: indices.length > 0,
                firstIndex: indices[0],
                allHaveIndex: indices.every(i => !isNaN(i))
            };
        });

        expect(result.hasIndices).toBe(true);
        expect(result.firstIndex).toBe(0);
        expect(result.allHaveIndex).toBe(true);
    });

    test('should have data-au-state=visible on rendered items', async () => {
        await page.goto(`http://localhost:${server.port}/test-virtual-list.html`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(() => {
            const el = document.querySelector('au-virtual-list');
            const items = el.querySelectorAll('.au-virtual-list__item[data-au-state="visible"]');
            return { count: items.length };
        });

        expect(result.count).toBeGreaterThan(0);
    });
});
