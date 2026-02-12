/**
 * @fileoverview E2E Test: Input label background inside elevated containers
 * Verifies that --au-input-label-bg propagates correctly from cards
 * to outlined au-input labels, preventing the "black rectangle" bug in dark mode.
 * 
 * The CSS fix: card.css sets --au-input-label-bg matching each card variant's
 * background. input.css reads it: background: var(--au-input-label-bg, var(--md-sys-color-surface)).
 * Without the fix, label bg = surface color ≠ card bg → visible mismatch in dark mode.
 */

import { describe, test, expect, beforeAll, afterEach, afterAll } from 'bun:test';
import { launchBrowser } from './puppeteer-helper.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Custom test page with dark theme, card variants, and outlined inputs.
 * Inline script ensures components are registered and CSS is loaded.
 */
function buildTestHTML() {
    return `<!DOCTYPE html>
<html data-theme="dark">
<head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="/dist/agentui.css">
    <link rel="stylesheet" href="/dist/styles/components/card.css">
    <link rel="stylesheet" href="/dist/styles/components/input.css">
    <script type="module" src="/dist/agentui.esm.js"></script>
</head>
<body style="padding:20px; background: var(--md-sys-color-surface);">
    <au-card variant="filled" id="card-filled" style="margin-bottom:20px;">
        <au-input variant="outlined" label="Filled Card Input" value="test" id="input-filled"></au-input>
    </au-card>

    <au-card variant="elevated" id="card-elevated" style="margin-bottom:20px;">
        <au-input variant="outlined" label="Elevated Card Input" value="test" id="input-elevated"></au-input>
    </au-card>

    <au-input variant="outlined" label="Standalone" value="test" id="input-standalone"></au-input>
</body>
</html>`;
}

describe('Input Label Background in Containers (E2E)', () => {
    let browser, page, server;

    beforeAll(async () => {
        const projectRoot = join(__dirname, '../..');
        const testHTML = buildTestHTML();

        server = Bun.serve({
            port: 0,
            async fetch(req) {
                const url = new URL(req.url);
                if (url.pathname === '/test.html') {
                    return new Response(testHTML, { headers: { 'Content-Type': 'text/html' } });
                }
                let filePath = join(projectRoot, url.pathname);
                try {
                    const file = Bun.file(filePath);
                    if (!await file.exists()) return new Response('Not Found', { status: 404 });
                    const ext = filePath.split('.').pop();
                    const types = { 'html': 'text/html', 'js': 'text/javascript', 'css': 'text/css', 'json': 'application/json', 'svg': 'image/svg+xml' };
                    return new Response(await file.arrayBuffer(), { headers: { 'Content-Type': types[ext] || 'application/octet-stream' } });
                } catch (e) { return new Response('Error', { status: 500 }); }
            }
        });
        console.log(`[input-bg test] Server at http://localhost:${server.port}`);
        browser = await launchBrowser({ testName: 'input-label-bg' });
        page = await browser.newPage();
    }, 60000);

    afterEach(async () => { await page.goto('about:blank'); });
    afterAll(async () => { if (browser) await browser.close(); if (server) server.stop(); });

    test('outlined input label in filled card should match card background', async () => {
        await page.goto(`http://localhost:${server.port}/test.html`, { waitUntil: 'networkidle0' });
        await delay(2000);

        const result = await page.evaluate(() => {
            const input = document.getElementById('input-filled');
            const card = document.getElementById('card-filled');
            if (!input || !card) return { error: 'elements not found' };

            const label = input.querySelector('.au-input__label');
            if (!label) return { error: 'label not found', inputHTML: input.innerHTML.substring(0, 100) };

            const labelBg = getComputedStyle(label).backgroundColor;
            const cardBg = getComputedStyle(card).backgroundColor;

            return { labelBg, cardBg, match: labelBg === cardBg };
        });

        expect(result.error).toBeUndefined();
        expect(result.match).toBe(true);
    });

    test('outlined input label in elevated card should match card background', async () => {
        await page.goto(`http://localhost:${server.port}/test.html`, { waitUntil: 'networkidle0' });
        await delay(2000);

        const result = await page.evaluate(() => {
            const input = document.getElementById('input-elevated');
            const card = document.getElementById('card-elevated');
            if (!input || !card) return { error: 'elements not found' };

            const label = input.querySelector('.au-input__label');
            if (!label) return { error: 'label not found', inputHTML: input.innerHTML.substring(0, 100) };

            const labelBg = getComputedStyle(label).backgroundColor;
            const cardBg = getComputedStyle(card).backgroundColor;

            return { labelBg, cardBg, match: labelBg === cardBg };
        });

        expect(result.error).toBeUndefined();
        expect(result.match).toBe(true);
    });

    test('standalone outlined input label should not be transparent', async () => {
        await page.goto(`http://localhost:${server.port}/test.html`, { waitUntil: 'networkidle0' });
        await delay(2000);

        const result = await page.evaluate(() => {
            const input = document.getElementById('input-standalone');
            if (!input) return { error: 'input not found' };

            const label = input.querySelector('.au-input__label');
            if (!label) return { error: 'label not found' };

            const labelBg = getComputedStyle(label).backgroundColor;
            return { labelBg, isTransparent: labelBg === 'rgba(0, 0, 0, 0)' || labelBg === 'transparent' };
        });

        expect(result.error).toBeUndefined();
        expect(result.isTransparent).toBe(false);
    });
});
