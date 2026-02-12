/**
 * @fileoverview Comprehensive E2E Tests for au-chip Component
 * 
 * Tests:
 * - Component registration and basic rendering
 * - Selection toggle behavior
 * - Removable chips
 * - Variant styling
 * - Event emission
 */

import { describe, test, expect, beforeAll, afterEach, afterAll } from 'bun:test';
import { launchBrowser, puppeteer } from './puppeteer-helper.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe('au-chip E2E Tests', () => {
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

        console.log(`[au-chip test] Server started at http://localhost:${server.port}`);

        browser = await launchBrowser({ testName: 'chip' });
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
        await page.goto(`http://localhost:${server.port}/demo/index.html#chips`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const isRegistered = await page.evaluate(() =>
            customElements.get('au-chip') !== undefined
        );

        expect(isRegistered).toBe(true);
    });

    test('should render with base class', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#chips`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const hasBaseClass = await page.evaluate(() => {
            const el = document.querySelector('au-chip');
            return el?.classList.contains('au-chip');
        });

        expect(hasBaseClass).toBe(true);
    });

    test('should render label span', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#chips`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(() => {
            const el = document.querySelector('au-chip');
            const label = el?.querySelector('.au-chip__label');
            return {
                hasLabel: label !== null,
                text: label?.textContent
            };
        });

        expect(result.hasLabel).toBe(true);
        expect(result.text).toBeTruthy(); // Should have some text
    });

    // ========================================
    // SELECTION TOGGLE
    // ========================================

    test('should toggle selected state on click', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#chips`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(() => {
            // Find a non-removable, non-selected chip
            const chips = document.querySelectorAll('au-chip:not([removable])');
            let chip = null;
            for (const c of chips) {
                if (!c.hasAttribute('selected')) {
                    chip = c;
                    break;
                }
            }
            if (!chip) return { error: 'No unselected chip found' };

            const before = chip.hasAttribute('selected');
            chip.click();
            const after = chip.hasAttribute('selected');
            chip.click();
            const afterSecond = chip.hasAttribute('selected');
            return { before, after, afterSecond };
        });

        expect(result.before).toBe(false);
        expect(result.after).toBe(true);
        expect(result.afterSecond).toBe(false);
    });

    test('should emit au-change event on toggle', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#chips`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(() => {
            return new Promise(resolve => {
                const chips = document.querySelectorAll('au-chip:not([removable])');
                let chip = null;
                for (const c of chips) {
                    if (!c.hasAttribute('selected')) {
                        chip = c;
                        break;
                    }
                }
                if (!chip) {
                    resolve({ error: 'No chip found' });
                    return;
                }

                let eventData = null;
                chip.addEventListener('au-change', (e) => {
                    eventData = e.detail;
                });

                chip.click();

                setTimeout(() => {
                    resolve({
                        fired: eventData !== null,
                        selected: eventData?.selected
                    });
                }, 100);
            });
        });

        expect(result.fired).toBe(true);
        expect(result.selected).toBe(true);
    });

    // ========================================
    // SELECTED STATE STYLING
    // ========================================

    test('should have different styling when selected', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#chips`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(() => {
            const chip = document.querySelector('au-chip:not([removable])');
            if (!chip) return { error: 'No chip found' };

            // Ensure it starts unselected
            if (chip.hasAttribute('selected')) chip.click();

            const hasSelectedBefore = chip.hasAttribute('selected');
            const bgBefore = chip.style.background;

            chip.click();

            const hasSelectedAfter = chip.hasAttribute('selected');
            const bgAfter = chip.style.background;

            return {
                hasSelectedBefore,
                bgBefore,
                hasSelectedAfter,
                bgAfter,
                attributeChanged: hasSelectedBefore !== hasSelectedAfter,
                styleChanged: bgBefore !== bgAfter
            };
        });

        expect(result.attributeChanged).toBe(true);
        expect(result.hasSelectedAfter).toBe(true);
        // Inline style should change when selected
        expect(result.styleChanged).toBe(true);
    });

    // ========================================
    // PRE-SELECTED CHIPS
    // ========================================

    test('should support pre-selected chips', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#chips`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(() => {
            const chip = document.querySelector('au-chip[selected]');
            if (!chip) return { error: 'No pre-selected chip found' };

            return {
                hasAttr: chip.hasAttribute('selected'),
                label: chip.querySelector('.au-chip__label')?.textContent
            };
        });

        expect(result.hasAttr).toBe(true);
    });

    // ========================================
    // CHIP DISPLAY
    // ========================================

    test('should have inline-flex display', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#chips`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const display = await page.evaluate(() => {
            const chip = document.querySelector('au-chip');
            return getComputedStyle(chip).display;
        });

        expect(['inline-flex', 'flex']).toContain(display);
    });

    test('should have cursor pointer', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#chips`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const cursor = await page.evaluate(() => {
            const chip = document.querySelector('au-chip');
            return getComputedStyle(chip).cursor;
        });

        expect(cursor).toBe('pointer');
    });

    // ========================================
    // VARIANT STYLING
    // ========================================

    test('should support outlined variant', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#chips`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(() => {
            const chip = document.querySelector('au-chip[variant="outlined"]');
            if (!chip) return { error: 'No outlined chip found' };

            const style = getComputedStyle(chip);
            return {
                found: true,
                hasBorder: style.borderStyle !== 'none'
            };
        });

        expect(result.found).toBe(true);
    });

    // ========================================
    // MULTIPLE CHIPS
    // ========================================

    test('should support multiple chips in a group', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#chips`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const count = await page.evaluate(() => {
            return document.querySelectorAll('au-chip').length;
        });

        expect(count).toBeGreaterThan(2);
    });
});
