/**
 * REPRODUCTION: Confirm Component Breakage
 * Tests how au-confirm renders in a real browser using dist/agentui.css and dist/agentui.min.js
 */
import { describe, test, expect, afterAll, beforeAll } from 'bun:test';
import { launchBrowser } from './puppeteer-helper.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = join(import.meta.dir, '../..');
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function buildHTML() {
    return `<!DOCTYPE html>
<html data-theme="dark">
<head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="/dist/agentui.css">
    <style>
        body { padding: 50px; background: var(--md-sys-color-surface); color: var(--md-sys-color-on-surface); }
        .controls { margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="controls">
        <button id="trigger">Open Confirm</button>
    </div>
    
    <script src="/dist/agentui.min.js"><\/script>
    <script>
        document.getElementById('trigger').onclick = async () => {
            console.log('Triggering auConfirm...');
            const res = await window.AgentUI.auConfirm('Does this work?', { title: 'Test Confirm' });
            console.log('Result:', res);
        };
    <\/script>
</body>
</html>`;
}

let browser, server;

beforeAll(async () => {
    server = Bun.serve({
        port: 0,
        async fetch(req) {
            const url = new URL(req.url);
            if (url.pathname === '/') {
                return new Response(buildHTML(), {
                    headers: { 'Content-Type': 'text/html' }
                });
            }

            const filePath = join(PROJECT_ROOT, url.pathname);
            try {
                const file = Bun.file(filePath);
                if (!await file.exists()) return new Response('Not Found', { status: 404 });
                const ext = filePath.split('.').pop();
                const types = { 'css': 'text/css', 'js': 'application/javascript', 'html': 'text/html' };
                return new Response(await file.arrayBuffer(), {
                    headers: { 'Content-Type': types[ext] || 'application/octet-stream' }
                });
            } catch (e) {
                return new Response('Error', { status: 500 });
            }
        }
    });

    console.log(`Reproduction server at http://localhost:${server.port}`);
    browser = await launchBrowser({ testName: 'repro-confirm' });
}, 60000);

afterAll(async () => {
    if (browser) await browser.close();
    if (server) server.stop();
});

test('Confirm opens and is visible', async () => {
    const page = await browser.newPage();
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

    await page.goto(`http://localhost:${server.port}/`, { waitUntil: 'networkidle0' });
    await delay(500);

    const isDefined = await page.evaluate(() => !!customElements.get('au-confirm'));
    console.log('au-confirm defined:', isDefined);

    const displayStyle = await page.evaluate(() => {
        const el = document.createElement('au-confirm');
        document.body.appendChild(el);
        const style = getComputedStyle(el).display;
        const contain = getComputedStyle(el).contain;
        el.remove();
        return { display: style, contain: contain };
    });
    console.log('au-confirm style:', JSON.stringify(displayStyle));

    await page.click('#trigger');
    await delay(1000);

    const dialogState = await page.evaluate(() => {
        const dialog = document.querySelector('dialog.au-confirm__dialog');
        if (!dialog) return { found: false };
        const rect = dialog.getBoundingClientRect();
        return {
            found: true,
            open: dialog.open,
            opacity: getComputedStyle(dialog).opacity,
            rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
        };
    });

    console.log('Dialog state:', JSON.stringify(dialogState, null, 2));

    expect(isDefined).toBe(true);
    expect(dialogState.found).toBe(true);
    expect(dialogState.open).toBe(true);

    await page.close();
});
