/**
 * @fileoverview au-input Floating Label E2E Tests
 * 
 * Tests to ensure the floating label behavior follows MD3 spec:
 * - Label floats when focused
 * - Label STAYS floating when has value (even after blur)
 * - Label returns to center only when empty AND not focused
 */

import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { launchBrowser } from './puppeteer-helper.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe('au-input Floating Label Tests (MD3 Compliance)', () => {
    let browser, page, server;

    beforeAll(async () => {
        const projectRoot = join(__dirname, '../..');
        server = Bun.serve({
            port: 0,
            async fetch(req) {
                const url = new URL(req.url);
                let filePath = url.pathname === '/' || url.pathname === '/index.html'
                    ? join(projectRoot, 'demo/index.html')
                    : join(projectRoot, url.pathname);

                try {
                    const file = Bun.file(filePath);
                    if (!await file.exists()) return new Response('Not Found', { status: 404 });
                    const ext = filePath.split('.').pop();
                    const types = { 'html': 'text/html', 'js': 'text/javascript', 'css': 'text/css', 'json': 'application/json', 'svg': 'image/svg+xml' };
                    return new Response(await file.arrayBuffer(), { headers: { 'Content-Type': types[ext] || 'application/octet-stream' } });
                } catch (e) { return new Response('Error', { status: 500 }); }
            }
        });
        console.log(`[au-input-label test] Server at http://localhost:${server.port}`);
        browser = await launchBrowser({ testName: 'input-label' });
        page = await browser.newPage();
    }, 60000);

    afterAll(async () => {
        if (browser) await browser.close();
        if (server) server.stop();
    });

    test('Label should stay floating after typing and blur (CRITICAL)', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#inputs`, { waitUntil: 'networkidle0' });
        await delay(1000);
        await page.waitForSelector('.au-input--outlined');

        // Find outlined input and type
        const input = await page.$('.au-input--outlined input');
        await input.click();
        await input.type('test value');

        // Check has-value class is present while focused
        let hasValueWhileFocused = await page.$eval('.au-input--outlined', el =>
            el.classList.contains('has-value')
        );
        expect(hasValueWhileFocused).toBe(true);

        // Blur the input
        await page.click('body');
        await delay(100);

        // CRITICAL: has-value MUST be present after blur
        let hasValueAfterBlur = await page.$eval('.au-input--outlined', el =>
            el.classList.contains('has-value')
        );
        expect(hasValueAfterBlur).toBe(true);

        // Verify label is in floating position (top should be small, not 50%)
        const labelTop = await page.$eval('.au-input--outlined .au-input__label', el =>
            window.getComputedStyle(el).top
        );
        // When floating, top is typically 6px or similar, not 50% (which would be ~24px on a 48px container)
        const topValue = parseInt(labelTop);
        expect(topValue).toBeLessThan(15); // Should be around 6px when floating
    });

    test('Label should return to center when input is emptied', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#inputs`, { waitUntil: 'networkidle0' });
        await delay(1000);
        await page.waitForSelector('.au-input--outlined');

        const input = await page.$('.au-input--outlined input');

        // Type something
        await input.click();
        await input.type('temp');
        await page.click('body'); // blur

        // Clear the input
        await input.click();
        await input.evaluate(el => el.value = '');
        await page.keyboard.press('Backspace'); // trigger input event
        await page.click('body'); // blur

        // Wait for state update
        await delay(100);

        // has-value should NOT be present when empty
        const hasValue = await page.$eval('.au-input--outlined', el =>
            el.classList.contains('has-value')
        );
        expect(hasValue).toBe(false);
    });

    test('Filled variant should also maintain has-value after blur', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#inputs`, { waitUntil: 'networkidle0' });
        await delay(1000);
        await page.waitForSelector('.au-input--filled');

        const input = await page.$('.au-input--filled input');
        await input.click();
        await input.type('filled test');
        await page.click('body'); // blur

        const hasValue = await page.$eval('.au-input--filled', el =>
            el.classList.contains('has-value')
        );
        expect(hasValue).toBe(true);
    });
});
