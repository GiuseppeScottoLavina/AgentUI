/**
 * @fileoverview Comprehensive E2E Tests for au-switch Component
 * 
 * Tests:
 * - Component registration and basic rendering
 * - Click toggle behavior
 * - Disabled state
 * - Keyboard accessibility (Space/Enter)
 * - ARIA attributes
 * - Event emission
 * - Property accessors
 */

import { describe, test, expect, beforeAll, afterEach, afterAll } from 'bun:test';
import { launchBrowser, puppeteer } from './puppeteer-helper.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe('au-switch E2E Tests', () => {
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

        console.log(`[au-switch test] Server started at http://localhost:${server.port}`);

        browser = await launchBrowser({ testName: 'switch' });
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
        await page.goto(`http://localhost:${server.port}/demo/index.html#switches`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const isRegistered = await page.evaluate(() =>
            customElements.get('au-switch') !== undefined
        );

        expect(isRegistered).toBe(true);
    });

    test('should render with base class', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#switches`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const hasBaseClass = await page.evaluate(() => {
            const el = document.querySelector('au-switch');
            return el?.classList.contains('au-switch');
        });

        expect(hasBaseClass).toBe(true);
    });

    test('should render track and thumb', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#switches`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(() => {
            const el = document.querySelector('au-switch');
            return {
                hasTrack: el?.querySelector('.au-switch__track') !== null,
                hasThumb: el?.querySelector('.au-switch__thumb') !== null
            };
        });

        expect(result.hasTrack).toBe(true);
        expect(result.hasThumb).toBe(true);
    });

    // ========================================
    // CLICK TOGGLE BEHAVIOR
    // ========================================

    test('should toggle checked state on click', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#switches`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        // Wait for custom element to be defined and upgraded
        await page.evaluate(() => customElements.whenDefined('au-switch'));

        const result = await page.evaluate(async () => {
            const switches = document.querySelectorAll('au-switch:not([disabled])');
            let sw = null;
            for (const s of switches) {
                if (!s.hasAttribute('checked')) {
                    sw = s;
                    break;
                }
            }
            if (!sw) return { error: 'No unchecked switch found' };

            const before = sw.hasAttribute('checked');
            sw.click();
            await new Promise(r => setTimeout(r, 50)); // Let the click handler execute
            const after = sw.hasAttribute('checked');
            sw.click();
            await new Promise(r => setTimeout(r, 50));
            const afterSecond = sw.hasAttribute('checked');
            return { before, after, afterSecond };
        });

        expect(result.before).toBe(false);
        expect(result.after).toBe(true);
        expect(result.afterSecond).toBe(false);
    });

    test('should emit au-change event on toggle', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#switches`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(() => {
            return new Promise(resolve => {
                const switches = document.querySelectorAll('au-switch:not([disabled])');
                let sw = null;
                for (const s of switches) {
                    if (!s.hasAttribute('checked')) {
                        sw = s;
                        break;
                    }
                }
                if (!sw) {
                    resolve({ error: 'No switch found' });
                    return;
                }

                let eventData = null;
                sw.addEventListener('au-change', (e) => {
                    eventData = e.detail;
                });

                sw.click();

                setTimeout(() => {
                    resolve({
                        fired: eventData !== null,
                        checked: eventData?.checked
                    });
                }, 100);
            });
        });

        expect(result.fired).toBe(true);
        expect(result.checked).toBe(true);
    });

    // ========================================
    // DISABLED STATE
    // ========================================

    test('should not toggle when disabled', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#switches`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(() => {
            const sw = document.querySelector('au-switch[disabled]');
            if (!sw) return { error: 'No disabled switch found' };

            const before = sw.hasAttribute('checked');
            sw.click();
            const after = sw.hasAttribute('checked');
            return { before, after };
        });

        expect(result.before).toBe(result.after);
    });

    test('disabled switch should have tabindex=-1', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#switches`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const tabindex = await page.evaluate(() => {
            const sw = document.querySelector('au-switch[disabled]');
            return sw?.getAttribute('tabindex');
        });

        expect(tabindex).toBe('-1');
    });

    // ========================================
    // ACCESSIBILITY
    // ========================================

    test('should have role=switch', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#switches`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const role = await page.evaluate(() => {
            const sw = document.querySelector('au-switch');
            return sw?.getAttribute('role');
        });

        expect(role).toBe('switch');
    });

    test('should have aria-checked matching state', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#switches`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);
        await page.evaluate(() => customElements.whenDefined('au-switch'));

        const result = await page.evaluate(async () => {
            // Find any non-disabled switch and test both states  
            const sw = document.querySelector('au-switch:not([disabled])');
            if (!sw) return { error: 'No switch found' };

            // Ensure it starts unchecked
            if (sw.hasAttribute('checked')) {
                sw.click();
                await new Promise(r => setTimeout(r, 50));
            }

            const beforeClick = sw.getAttribute('aria-checked');
            sw.click();
            await new Promise(r => setTimeout(r, 50));
            const afterClick = sw.getAttribute('aria-checked');

            return { beforeClick, afterClick };
        });

        expect(result.beforeClick).toBe('false');
        expect(result.afterClick).toBe('true');
    });

    test('should have aria-disabled when disabled', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#switches`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const ariaDisabled = await page.evaluate(() => {
            const sw = document.querySelector('au-switch[disabled]');
            return sw?.getAttribute('aria-disabled');
        });

        expect(ariaDisabled).toBe('true');
    });

    // ========================================
    // KEYBOARD ACCESSIBILITY
    // ========================================

    test('should toggle on Space key', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#switches`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);
        await page.evaluate(() => customElements.whenDefined('au-switch'));

        const result = await page.evaluate(async () => {
            const switches = document.querySelectorAll('au-switch:not([disabled])');
            let sw = null;
            for (const s of switches) {
                if (!s.hasAttribute('checked')) {
                    sw = s;
                    break;
                }
            }
            if (!sw) return { error: 'No switch found' };

            const before = sw.hasAttribute('checked');
            const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
            sw.dispatchEvent(event);
            await new Promise(r => setTimeout(r, 50));
            const after = sw.hasAttribute('checked');
            return { before, after };
        });

        expect(result.before).toBe(false);
        expect(result.after).toBe(true);
    });

    test('should toggle on Enter key', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#switches`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        await page.evaluate(() => customElements.whenDefined('au-switch'));

        const result = await page.evaluate(async () => {
            const switches = document.querySelectorAll('au-switch:not([disabled])');
            let sw = null;
            for (const s of switches) {
                if (!s.hasAttribute('checked')) {
                    sw = s;
                    break;
                }
            }
            if (!sw) return { error: 'No switch found' };

            const before = sw.hasAttribute('checked');
            const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
            sw.dispatchEvent(event);
            await new Promise(r => setTimeout(r, 50));
            const after = sw.hasAttribute('checked');
            return { before, after };
        });

        expect(result.before).toBe(false);
        expect(result.after).toBe(true);
    });

    // ========================================
    // PROPERTY ACCESSORS
    // ========================================

    test('should support checked property getter/setter', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#switches`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(() => {
            const switches = document.querySelectorAll('au-switch:not([disabled])');
            let sw = null;
            for (const s of switches) {
                if (!s.hasAttribute('checked')) {
                    sw = s;
                    break;
                }
            }
            if (!sw) return { error: 'No switch found' };

            const initialProp = sw.checked;
            sw.checked = true;
            const afterSet = sw.checked;
            const attrPresent = sw.hasAttribute('checked');
            sw.checked = false;
            const afterUnset = sw.checked;
            return { initialProp, afterSet, attrPresent, afterUnset };
        });

        expect(result.initialProp).toBe(false);
        expect(result.afterSet).toBe(true);
        expect(result.attrPresent).toBe(true);
        expect(result.afterUnset).toBe(false);
    });
});
