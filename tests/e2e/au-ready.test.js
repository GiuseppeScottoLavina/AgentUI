/**
 * @fileoverview E2E test for `au-ready` framework initialization event
 * 
 * Verifies that:
 * - `au-ready` event fires on document after framework loads
 * - `window.AgentUI.ready` is true after event
 * - Event detail includes timestamp
 * - Components are actually registered when event fires
 */

import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { launchBrowser } from './puppeteer-helper.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('au-ready Event E2E Tests', () => {
    let browser;
    let page;
    let server;
    let testResults;

    beforeAll(async () => {
        const projectRoot = join(__dirname, '../..');
        const cssPath = join(projectRoot, 'dist/agentui.css');
        const jsPath = join(projectRoot, 'dist/agentui.esm.js');

        // Verify built assets exist
        if (!existsSync(jsPath)) {
            throw new Error('dist/agentui.esm.js not found. Run bun scripts/build-framework.js first.');
        }

        server = Bun.serve({
            port: 0,
            fetch(req) {
                const url = new URL(req.url);

                // Serve dist assets
                if (url.pathname.startsWith('/dist/')) {
                    const filePath = join(projectRoot, url.pathname);
                    if (existsSync(filePath)) {
                        const content = readFileSync(filePath);
                        const ext = filePath.split('.').pop();
                        const mimeTypes = {
                            js: 'application/javascript',
                            css: 'text/css',
                            map: 'application/json'
                        };
                        return new Response(content, {
                            headers: { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' }
                        });
                    }
                }

                // Serve test page
                return new Response(`<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="/dist/agentui.css">
</head>
<body>
<script type="module">
const results = {};
const startTime = Date.now();

// Listen for au-ready BEFORE loading the framework
document.addEventListener('au-ready', (e) => {
    results.eventFired = true;
    results.hasDetail = !!e.detail;
    results.hasTimestamp = typeof e.detail?.timestamp === 'number';
    results.timestamp = e.detail?.timestamp;

    // Check components are actually registered at event time
    results.buttonRegistered = customElements.get('au-button') !== undefined;
    results.inputRegistered = customElements.get('au-input') !== undefined;
    results.modalRegistered = customElements.get('au-modal') !== undefined;

    // Check window.AgentUI.ready
    results.agentUIReady = window.AgentUI?.ready === true;

    // Check window.AgentUI object exists with expected methods
    results.hasDiscoverAll = typeof window.AgentUI?.discoverAll === 'function';
    results.hasLoadDescriptions = typeof window.AgentUI?.loadDescriptions === 'function';

    window._testResults = results;
});

// Now load the framework
import('/dist/agentui.esm.js');
</script>
</body>
</html>`, { headers: { 'Content-Type': 'text/html' } });
            }
        });

        browser = await launchBrowser({ testName: 'au-ready' });
        page = await browser.newPage();

        await page.goto(`http://localhost:${server.port}/`, { waitUntil: 'networkidle0' });

        // Wait for au-ready to fire (with generous timeout for CI)
        await page.waitForFunction(() => window._testResults !== undefined, { timeout: 10000 });

        testResults = await page.evaluate(() => window._testResults);
    }, 30000);

    afterAll(async () => {
        if (page) await page.close().catch(() => { });
        if (browser) await browser.close().catch(() => { });
        if (server) server.stop();
    });

    test('au-ready event fires on document', () => {
        expect(testResults?.eventFired).toBe(true);
    });

    test('event detail includes timestamp', () => {
        expect(testResults?.hasDetail).toBe(true);
        expect(testResults?.hasTimestamp).toBe(true);
    });

    test('components are registered when event fires', () => {
        expect(testResults?.buttonRegistered).toBe(true);
        expect(testResults?.inputRegistered).toBe(true);
        expect(testResults?.modalRegistered).toBe(true);
    });

    test('window.AgentUI.ready is true after event', () => {
        expect(testResults?.agentUIReady).toBe(true);
    });

    test('window.AgentUI has discovery methods', () => {
        expect(testResults?.hasDiscoverAll).toBe(true);
        expect(testResults?.hasLoadDescriptions).toBe(true);
    });
});
