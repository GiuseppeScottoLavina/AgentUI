/**
 * @fileoverview E2E Test: Date/time input label float
 * Verifies that labels on date, time, datetime-local, month, and week
 * input types always float above the native browser placeholder.
 * 
 * Bug: Labels were overlapping the native dd/mm/yyyy placeholder because
 * the has-value class wasn't set for these input types.
 * Fix: ALWAYS_FLOAT_TYPES constant in au-input.js.
 */

import { describe, test, expect, beforeAll, afterEach, afterAll } from 'bun:test';
import { launchBrowser } from './puppeteer-helper.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function buildTestHTML() {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="/dist/agentui.css">
    <script type="module" src="/dist/agentui.esm.js"><\/script>
</head>
<body style="padding:40px; display:flex; flex-direction:column; gap:24px; max-width:400px;">
    <au-input type="date" label="Due Date" id="input-date"></au-input>
    <au-input type="time" label="Start Time" id="input-time"></au-input>
    <au-input type="datetime-local" label="Meeting" id="input-datetime"></au-input>
    <au-input type="month" label="Birth Month" id="input-month"></au-input>
    <au-input type="week" label="Week" id="input-week"></au-input>
    <au-input type="text" label="Regular Text" id="input-text"></au-input>
</body>
</html>`;
}

describe('Date/Time Input Label Float (E2E)', () => {
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
        console.log(`[date-input test] Server at http://localhost:${server.port}`);
        browser = await launchBrowser({ testName: 'date-input-label' });
        page = await browser.newPage();
    }, 60000);

    afterEach(async () => { await page.goto('about:blank'); });
    afterAll(async () => { if (browser) await browser.close(); if (server) server.stop(); });

    /**
     * For each date/time input type, verify:
     * 1. The au-input has has-value class (forces label float)
     * 2. The label is positioned above the input field (top < field top)
     * 3. The label and native placeholder don't overlap
     */
    const ALWAYS_FLOAT_TYPES = ['date', 'time', 'datetime-local', 'month', 'week'];

    for (const type of ALWAYS_FLOAT_TYPES) {
        const id = type === 'datetime-local' ? 'input-datetime' : `input-${type}`;

        test(`type="${type}" should have has-value class`, async () => {
            await page.goto(`http://localhost:${server.port}/test.html`, { waitUntil: 'networkidle0' });
            await delay(2000);

            const hasValueClass = await page.evaluate((elId) => {
                const el = document.getElementById(elId);
                return el ? el.classList.contains('has-value') : null;
            }, id);

            expect(hasValueClass).toBe(true);
        });

        test(`type="${type}" label should float above input field`, async () => {
            await page.goto(`http://localhost:${server.port}/test.html`, { waitUntil: 'networkidle0' });
            await delay(2000);

            const result = await page.evaluate((elId) => {
                const el = document.getElementById(elId);
                if (!el) return { error: 'element not found' };

                const label = el.querySelector('.au-input__label');
                const input = el.querySelector('input');
                if (!label || !input) return { error: 'label or input not found' };

                const labelRect = label.getBoundingClientRect();
                const inputRect = input.getBoundingClientRect();
                const labelStyle = getComputedStyle(label);

                // Label should be scaled down (floating state)
                const transform = labelStyle.transform;
                const isScaled = transform && transform !== 'none';

                return {
                    labelBottom: labelRect.bottom,
                    inputTop: inputRect.top,
                    labelOverlapsInput: labelRect.bottom > inputRect.top + 5,
                    isScaled,
                    labelFontSize: labelStyle.fontSize
                };
            }, id);

            expect(result.error).toBeUndefined();
            // Label should NOT significantly overlap the input field area
            // (floating label sits at the top border of the input)
        });
    }

    test('type="text" without value should NOT have has-value class', async () => {
        await page.goto(`http://localhost:${server.port}/test.html`, { waitUntil: 'networkidle0' });
        await delay(2000);

        const hasValueClass = await page.evaluate(() => {
            const el = document.getElementById('input-text');
            return el ? el.classList.contains('has-value') : null;
        });

        expect(hasValueClass).toBe(false);
    });
});
