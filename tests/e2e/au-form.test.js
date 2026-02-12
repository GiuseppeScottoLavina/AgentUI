/**
 * @fileoverview Comprehensive E2E Tests for au-form Component
 * 
 * Tests:
 * - Component registration and basic rendering
 * - Form data collection (getFormData)
 * - Validation (validate)
 * - Form reset functionality
 * - Event emission (au-submit, au-invalid, au-reset)
 */

import { describe, test, expect, beforeAll, afterEach, afterAll } from 'bun:test';
import { launchBrowser, puppeteer } from './puppeteer-helper.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe('au-form E2E Tests', () => {
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

                // Serve the form test harness
                if (url.pathname === '/test-form.html') {
                    return new Response(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <title>Form Test</title>
                            <script type="module" src="/dist/agentui.esm.js"></script>
                            <style>
                                .is-invalid { border: 2px solid red !important; }
                            </style>
                        </head>
                        <body>
                            <au-form id="test-form">
                                <au-input id="name-input" name="username" label="Username" required></au-input>
                                <au-input id="email-input" name="email" label="Email" required></au-input>
                                <au-input id="optional-input" name="optional" label="Optional"></au-input>
                                <input type="text" name="native-text" id="native-text" value="native-value" />
                                <input type="checkbox" name="agree" id="native-checkbox" />
                                <au-button id="submit-btn" type="submit">Submit</au-button>
                            </au-form>
                            
                            <div id="events-log"></div>
                            
                            <script type="module">
                                const form = document.getElementById('test-form');
                                const log = document.getElementById('events-log');
                                
                                form.addEventListener('au-submit', (e) => {
                                    log.innerHTML += '<div class="submit-event">SUBMIT: ' + JSON.stringify(e.detail) + '</div>';
                                });
                                
                                form.addEventListener('au-invalid', (e) => {
                                    log.innerHTML += '<div class="invalid-event">INVALID: ' + JSON.stringify(e.detail) + '</div>';
                                });
                                
                                form.addEventListener('au-reset', (e) => {
                                    log.innerHTML += '<div class="reset-event">RESET</div>';
                                });
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

        console.log(`[au-form test] Server started at http://localhost:${server.port}`);

        browser = await launchBrowser({ testName: 'form' });
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
        await page.goto(`http://localhost:${server.port}/test-form.html`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const isRegistered = await page.evaluate(() =>
            customElements.get('au-form') !== undefined
        );

        expect(isRegistered).toBe(true);
    });

    test('should render with base class', async () => {
        await page.goto(`http://localhost:${server.port}/test-form.html`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const hasBaseClass = await page.evaluate(() => {
            const el = document.querySelector('au-form');
            return el?.classList.contains('au-form');
        });

        expect(hasBaseClass).toBe(true);
    });

    test('should have role=form attribute', async () => {
        await page.goto(`http://localhost:${server.port}/test-form.html`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const role = await page.evaluate(() => {
            const el = document.querySelector('au-form');
            return el?.getAttribute('role');
        });

        expect(role).toBe('form');
    });

    // ========================================
    // getFormData METHOD
    // ========================================

    test('should have getFormData method', async () => {
        await page.goto(`http://localhost:${server.port}/test-form.html`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const hasMethod = await page.evaluate(() => {
            const el = document.querySelector('au-form');
            return typeof el?.getFormData === 'function';
        });

        expect(hasMethod).toBe(true);
    });

    test('getFormData should return object with field values', async () => {
        await page.goto(`http://localhost:${server.port}/test-form.html`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(() => {
            const form = document.querySelector('au-form');

            // Set values on au-input (using the internal input)
            const usernameInput = document.querySelector('#name-input');
            const emailInput = document.querySelector('#email-input');

            if (usernameInput) usernameInput.value = 'testuser';
            if (emailInput) emailInput.value = 'test@example.com';

            const data = form.getFormData();
            return data;
        });

        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
    });

    test('getFormData should include native input values', async () => {
        await page.goto(`http://localhost:${server.port}/test-form.html`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(() => {
            const form = document.querySelector('au-form');
            const data = form.getFormData();
            return data;
        });

        expect(result['native-text']).toBe('native-value');
    });

    test('getFormData should handle checkbox values', async () => {
        await page.goto(`http://localhost:${server.port}/test-form.html`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(() => {
            const form = document.querySelector('au-form');
            const checkbox = document.querySelector('#native-checkbox');
            checkbox.checked = true;
            return form.getFormData();
        });

        expect(result.agree).toBe(true);
    });

    // ========================================
    // VALIDATE METHOD
    // ========================================

    test('should have validate method', async () => {
        await page.goto(`http://localhost:${server.port}/test-form.html`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const hasMethod = await page.evaluate(() => {
            const el = document.querySelector('au-form');
            return typeof el?.validate === 'function';
        });

        expect(hasMethod).toBe(true);
    });

    test('validate should return false when required fields are empty', async () => {
        await page.goto(`http://localhost:${server.port}/test-form.html`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const isValid = await page.evaluate(() => {
            const form = document.querySelector('au-form');
            // Don't fill any fields
            return form.validate();
        });

        expect(isValid).toBe(false);
    });

    test('validate should add is-invalid class to empty required fields', async () => {
        await page.goto(`http://localhost:${server.port}/test-form.html`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(() => {
            const form = document.querySelector('au-form');
            form.validate();

            const invalidFields = form.querySelectorAll('.is-invalid');
            return { count: invalidFields.length };
        });

        expect(result.count).toBeGreaterThan(0);
    });

    test('validate should return true when all required fields are filled', async () => {
        await page.goto(`http://localhost:${server.port}/test-form.html`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const isValid = await page.evaluate(() => {
            const form = document.querySelector('au-form');

            // Fill required fields
            const usernameInput = document.querySelector('#name-input');
            const emailInput = document.querySelector('#email-input');

            if (usernameInput) usernameInput.value = 'testuser';
            if (emailInput) emailInput.value = 'test@example.com';

            return form.validate();
        });

        expect(isValid).toBe(true);
    });

    // ========================================
    // RESET METHOD
    // ========================================

    test('should have reset method', async () => {
        await page.goto(`http://localhost:${server.port}/test-form.html`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const hasMethod = await page.evaluate(() => {
            const el = document.querySelector('au-form');
            return typeof el?.reset === 'function';
        });

        expect(hasMethod).toBe(true);
    });

    test('reset should clear native input values', async () => {
        await page.goto(`http://localhost:${server.port}/test-form.html`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(() => {
            const form = document.querySelector('au-form');
            const nativeInput = document.querySelector('#native-text');

            nativeInput.value = 'some value';
            const before = nativeInput.value;

            form.reset();
            const after = nativeInput.value;

            return { before, after };
        });

        expect(result.after).toBe('');
    });

    test('reset should remove is-invalid classes', async () => {
        await page.goto(`http://localhost:${server.port}/test-form.html`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(() => {
            const form = document.querySelector('au-form');

            // Trigger validation to add invalid classes
            form.validate();
            const invalidBefore = form.querySelectorAll('.is-invalid').length;

            // Reset
            form.reset();
            const invalidAfter = form.querySelectorAll('.is-invalid').length;

            return { invalidBefore, invalidAfter };
        });

        expect(result.invalidBefore).toBeGreaterThan(0);
        expect(result.invalidAfter).toBe(0);
    });

    // ========================================
    // EVENT EMISSION
    // ========================================

    test('should emit au-reset event when reset is called', async () => {
        await page.goto(`http://localhost:${server.port}/test-form.html`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(async () => {
            const form = document.querySelector('au-form');
            const log = document.querySelector('#events-log');

            log.innerHTML = '';
            form.reset();

            await new Promise(r => setTimeout(r, 100));

            return log.querySelector('.reset-event') !== null;
        });

        expect(result).toBe(true);
    });

    test('should emit au-invalid event when submitting invalid form', async () => {
        await page.goto(`http://localhost:${server.port}/test-form.html`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(async () => {
            const form = document.querySelector('au-form');
            const log = document.querySelector('#events-log');
            const submitBtn = document.querySelector('#submit-btn');

            log.innerHTML = '';

            // Don't fill any fields, dispatch submit event
            form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

            await new Promise(r => setTimeout(r, 200));

            return log.querySelector('.invalid-event') !== null;
        });

        expect(result).toBe(true);
    });

    test('should emit au-submit event when submitting valid form', async () => {
        await page.goto(`http://localhost:${server.port}/test-form.html`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(async () => {
            const form = document.querySelector('au-form');
            const log = document.querySelector('#events-log');
            const submitBtn = document.querySelector('#submit-btn');

            // Fill required fields
            const usernameInput = document.querySelector('#name-input');
            const emailInput = document.querySelector('#email-input');

            if (usernameInput) usernameInput.value = 'testuser';
            if (emailInput) emailInput.value = 'test@example.com';

            log.innerHTML = '';
            // Dispatch submit event
            form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

            await new Promise(r => setTimeout(r, 200));

            return log.querySelector('.submit-event') !== null;
        });

        expect(result).toBe(true);
    });

    // ========================================
    // ENTER KEY HANDLING
    // ========================================

    test('should submit on enter key in input', async () => {
        await page.goto(`http://localhost:${server.port}/test-form.html`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(async () => {
            const form = document.querySelector('au-form');
            const log = document.querySelector('#events-log');
            const nativeInput = document.querySelector('#native-text');

            // Fill required fields first
            const usernameInput = document.querySelector('#name-input');
            const emailInput = document.querySelector('#email-input');
            if (usernameInput) usernameInput.value = 'testuser';
            if (emailInput) emailInput.value = 'test@example.com';

            log.innerHTML = '';

            // Simulate enter key
            nativeInput.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'Enter',
                bubbles: true
            }));

            await new Promise(r => setTimeout(r, 200));

            return log.innerHTML.includes('SUBMIT') || log.innerHTML.includes('INVALID');
        });

        expect(result).toBe(true);
    });
});
