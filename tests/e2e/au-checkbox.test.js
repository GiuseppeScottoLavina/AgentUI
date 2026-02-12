/**
 * @fileoverview Comprehensive E2E Tests for au-checkbox Component
 * 
 * Tests:
 * - Component registration and basic rendering
 * - Click toggle behavior
 * - Disabled state
 * - Indeterminate state
 * - Keyboard accessibility (Space/Enter)
 * - ARIA attributes
 * - Event emission
 */

import { describe, test, expect, beforeAll, afterEach, afterAll } from 'bun:test';
import { launchBrowser, puppeteer } from './puppeteer-helper.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe('au-checkbox E2E Tests', () => {
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

        console.log(`[au-checkbox test] Server started at http://localhost:${server.port}`);

        browser = await launchBrowser({ testName: 'checkbox' });
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
        await page.goto(`http://localhost:${server.port}/demo/index.html#checkboxes`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const isRegistered = await page.evaluate(() =>
            customElements.get('au-checkbox') !== undefined
        );

        expect(isRegistered).toBe(true);
    });

    test('should render with base class', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#checkboxes`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const hasBaseClass = await page.evaluate(() => {
            const checkbox = document.querySelector('au-checkbox');
            return checkbox?.classList.contains('au-checkbox');
        });

        expect(hasBaseClass).toBe(true);
    });

    test('should render checkbox box and label', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#checkboxes`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(() => {
            const checkbox = document.querySelector('au-checkbox');
            return {
                hasBox: checkbox?.querySelector('.au-checkbox__box') !== null,
                hasLabel: checkbox?.querySelector('.au-checkbox__label') !== null
            };
        });

        expect(result.hasBox).toBe(true);
        expect(result.hasLabel).toBe(true);
    });

    // ========================================
    // CLICK TOGGLE BEHAVIOR
    // ========================================

    test('should toggle checked state on click', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#checkboxes`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(() => {
            // Find an unchecked checkbox
            const checkboxes = document.querySelectorAll('au-checkbox:not([disabled])');
            let checkbox = null;
            for (const cb of checkboxes) {
                if (!cb.hasAttribute('checked') && !cb.hasAttribute('indeterminate')) {
                    checkbox = cb;
                    break;
                }
            }
            if (!checkbox) return { error: 'No unchecked checkbox found' };

            const before = checkbox.hasAttribute('checked');
            checkbox.click();
            const after = checkbox.hasAttribute('checked');
            checkbox.click();
            const afterSecond = checkbox.hasAttribute('checked');
            return { before, after, afterSecond };
        });

        expect(result.before).toBe(false);
        expect(result.after).toBe(true);
        expect(result.afterSecond).toBe(false);
    });

    test('should emit au-change event on toggle', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#checkboxes`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(() => {
            return new Promise(resolve => {
                const checkboxes = document.querySelectorAll('au-checkbox:not([disabled])');
                let checkbox = null;
                for (const cb of checkboxes) {
                    if (!cb.hasAttribute('checked') && !cb.hasAttribute('indeterminate')) {
                        checkbox = cb;
                        break;
                    }
                }
                if (!checkbox) {
                    resolve({ error: 'No checkbox found' });
                    return;
                }

                let eventData = null;
                checkbox.addEventListener('au-change', (e) => {
                    eventData = e.detail;
                });

                checkbox.click();

                setTimeout(() => {
                    resolve({
                        fired: eventData !== null,
                        checked: eventData?.checked,
                        indeterminate: eventData?.indeterminate
                    });
                }, 100);
            });
        });

        expect(result.fired).toBe(true);
        expect(result.checked).toBe(true);
        expect(result.indeterminate).toBe(false);
    });

    // ========================================
    // DISABLED STATE
    // ========================================

    test('should not toggle when disabled', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#checkboxes`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(() => {
            const checkbox = document.querySelector('au-checkbox[disabled]');
            if (!checkbox) return { error: 'No disabled checkbox found' };

            const before = checkbox.hasAttribute('checked');
            checkbox.click();
            const after = checkbox.hasAttribute('checked');
            return { before, after };
        });

        expect(result.before).toBe(result.after); // State should not change
    });

    test('disabled checkbox should have tabindex=-1', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#checkboxes`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const tabindex = await page.evaluate(() => {
            const checkbox = document.querySelector('au-checkbox[disabled]');
            return checkbox?.getAttribute('tabindex');
        });

        expect(tabindex).toBe('-1');
    });

    // ========================================
    // INDETERMINATE STATE
    // ========================================

    test('should have indeterminate state rendered', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#checkboxes`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(() => {
            const checkbox = document.querySelector('au-checkbox[indeterminate]');
            if (!checkbox) return { error: 'No indeterminate checkbox found' };

            return {
                hasAttr: checkbox.hasAttribute('indeterminate'),
                ariaMixed: checkbox.getAttribute('aria-checked')
            };
        });

        expect(result.hasAttr).toBe(true);
        expect(result.ariaMixed).toBe('mixed');
    });

    test('click should clear indeterminate and set checked', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#checkboxes`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(() => {
            const checkbox = document.querySelector('au-checkbox[indeterminate]');
            if (!checkbox) return { error: 'No indeterminate checkbox found' };

            const beforeIndeterminate = checkbox.hasAttribute('indeterminate');
            checkbox.click();
            return {
                beforeIndeterminate,
                afterIndeterminate: checkbox.hasAttribute('indeterminate'),
                afterChecked: checkbox.hasAttribute('checked')
            };
        });

        expect(result.beforeIndeterminate).toBe(true);
        expect(result.afterIndeterminate).toBe(false);
        expect(result.afterChecked).toBe(true);
    });

    // ========================================
    // ACCESSIBILITY
    // ========================================

    test('should have role=checkbox', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#checkboxes`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const role = await page.evaluate(() => {
            const checkbox = document.querySelector('au-checkbox');
            return checkbox?.getAttribute('role');
        });

        expect(role).toBe('checkbox');
    });

    test('should have aria-checked matching state', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#checkboxes`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(() => {
            const checked = document.querySelector('au-checkbox[checked]:not([indeterminate])');
            const indeterminate = document.querySelector('au-checkbox[indeterminate]');
            // Find unchecked
            const unchecked = Array.from(document.querySelectorAll('au-checkbox'))
                .find(cb => !cb.hasAttribute('checked') && !cb.hasAttribute('indeterminate'));

            return {
                unchecked: unchecked?.getAttribute('aria-checked'),
                checked: checked?.getAttribute('aria-checked'),
                indeterminate: indeterminate?.getAttribute('aria-checked')
            };
        });

        expect(result.unchecked).toBe('false');
        expect(result.checked).toBe('true');
        expect(result.indeterminate).toBe('mixed');
    });

    test('should have aria-disabled when disabled', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#checkboxes`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const ariaDisabled = await page.evaluate(() => {
            const checkbox = document.querySelector('au-checkbox[disabled]');
            return checkbox?.getAttribute('aria-disabled');
        });

        expect(ariaDisabled).toBe('true');
    });

    // ========================================
    // KEYBOARD ACCESSIBILITY
    // ========================================

    test('should toggle on Space key', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#checkboxes`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(() => {
            const checkboxes = document.querySelectorAll('au-checkbox:not([disabled])');
            let checkbox = null;
            for (const cb of checkboxes) {
                if (!cb.hasAttribute('checked') && !cb.hasAttribute('indeterminate')) {
                    checkbox = cb;
                    break;
                }
            }
            if (!checkbox) return { error: 'No checkbox found' };

            const before = checkbox.hasAttribute('checked');

            // Simulate Space key
            const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
            checkbox.dispatchEvent(event);

            const after = checkbox.hasAttribute('checked');
            return { before, after };
        });

        expect(result.before).toBe(false);
        expect(result.after).toBe(true);
    });

    test('should toggle on Enter key', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#checkboxes`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(() => {
            const checkboxes = document.querySelectorAll('au-checkbox:not([disabled])');
            let checkbox = null;
            for (const cb of checkboxes) {
                if (!cb.hasAttribute('checked') && !cb.hasAttribute('indeterminate')) {
                    checkbox = cb;
                    break;
                }
            }
            if (!checkbox) return { error: 'No checkbox found' };

            const before = checkbox.hasAttribute('checked');

            // Simulate Enter key
            const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
            checkbox.dispatchEvent(event);

            const after = checkbox.hasAttribute('checked');
            return { before, after };
        });

        expect(result.before).toBe(false);
        expect(result.after).toBe(true);
    });

    // ========================================
    // PROPERTY ACCESSORS
    // ========================================

    test('should support checked property getter/setter', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#checkboxes`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(() => {
            const checkboxes = document.querySelectorAll('au-checkbox:not([disabled])');
            let checkbox = null;
            for (const cb of checkboxes) {
                if (!cb.hasAttribute('checked') && !cb.hasAttribute('indeterminate')) {
                    checkbox = cb;
                    break;
                }
            }
            if (!checkbox) return { error: 'No checkbox found' };

            const initialProp = checkbox.checked;
            checkbox.checked = true;
            const afterSet = checkbox.checked;
            const attrPresent = checkbox.hasAttribute('checked');
            checkbox.checked = false;
            const afterUnset = checkbox.checked;
            return { initialProp, afterSet, attrPresent, afterUnset };
        });

        expect(result.initialProp).toBe(false);
        expect(result.afterSet).toBe(true);
        expect(result.attrPresent).toBe(true);
        expect(result.afterUnset).toBe(false);
    });

    test('should support indeterminate property getter/setter', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#checkboxes`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(() => {
            const checkboxes = document.querySelectorAll('au-checkbox:not([disabled])');
            let checkbox = null;
            for (const cb of checkboxes) {
                if (!cb.hasAttribute('checked') && !cb.hasAttribute('indeterminate')) {
                    checkbox = cb;
                    break;
                }
            }
            if (!checkbox) return { error: 'No checkbox found' };

            const initialProp = checkbox.indeterminate;
            checkbox.indeterminate = true;
            const afterSet = checkbox.indeterminate;
            const ariaMixed = checkbox.getAttribute('aria-checked');
            checkbox.indeterminate = false;
            const afterUnset = checkbox.indeterminate;
            return { initialProp, afterSet, ariaMixed, afterUnset };
        });

        expect(result.initialProp).toBe(false);
        expect(result.afterSet).toBe(true);
        expect(result.ariaMixed).toBe('mixed');
        expect(result.afterUnset).toBe(false);
    });
});
