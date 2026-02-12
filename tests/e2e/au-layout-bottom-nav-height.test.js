/**
 * @fileoverview E2E test for au-layout full-bleed + bottom-nav height fix
 * 
 * Verifies that children using height:100% inside au-layout-content
 * get the correct visible height when au-bottom-nav is present.
 * 
 * Bug: .au-layout-main didn't subtract bottom-nav height,
 * so height:100% on children overflowed by 80px (clipped silently).
 */

import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { launchBrowser } from './puppeteer-helper.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('au-layout full-bleed + bottom-nav height E2E', () => {
    let browser;
    let page;
    let server;

    beforeAll(async () => {
        const projectRoot = join(__dirname, '../..');

        server = Bun.serve({
            port: 0,
            fetch(req) {
                const url = new URL(req.url);

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

                return new Response(`<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="/dist/agentui.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        #full-height-child {
            height: 100%;
            background: lightblue;
        }
    </style>
</head>
<body>
<au-layout full-bleed>
    <au-navbar slot="header">
        <span slot="title">Test App</span>
    </au-navbar>

    <div id="full-height-child">
        <p>This should fill the visible area exactly</p>
    </div>

    <au-bottom-nav slot="bottom">
        <au-nav-item icon="home" label="Home"></au-nav-item>
        <au-nav-item icon="search" label="Search"></au-nav-item>
    </au-bottom-nav>
</au-layout>

<script type="module">
import('/dist/agentui.esm.js').then(() => {
    document.addEventListener('au-ready', () => {
        window._testReady = true;
    });
});
</script>
</body>
</html>`, { headers: { 'Content-Type': 'text/html' } });
            }
        });

        browser = await launchBrowser({ testName: 'layout-bottom-nav-height' });
        page = await browser.newPage();
        await page.setViewport({ width: 400, height: 932 });

        await page.goto(`http://localhost:${server.port}/`, { waitUntil: 'networkidle0' });
        await page.waitForFunction(() => window._testReady === true, { timeout: 10000 });

        // Give layout time to render fully
        await new Promise(r => setTimeout(r, 300));
    }, 30000);

    afterAll(async () => {
        if (page) await page.close().catch(() => { });
        if (browser) await browser.close().catch(() => { });
        if (server) server.stop();
    });

    test('full-height child should not extend behind bottom-nav', async () => {
        const metrics = await page.evaluate(() => {
            const layout = document.querySelector('au-layout');
            const main = layout.querySelector('.au-layout-main');
            const content = layout.querySelector('.au-layout-content');
            const child = document.getElementById('full-height-child');
            const bottomNav = document.querySelector('au-bottom-nav');

            const layoutRect = layout.getBoundingClientRect();
            const mainRect = main.getBoundingClientRect();
            const childRect = child.getBoundingClientRect();
            const bottomNavRect = bottomNav.getBoundingClientRect();

            // Get computed style for the CSS variable
            const bottomNavHeight = parseFloat(
                getComputedStyle(document.documentElement).getPropertyValue('--au-bottom-nav-height') || '80'
            );

            return {
                viewportHeight: window.innerHeight,
                layoutHeight: layoutRect.height,
                mainTop: mainRect.top,
                mainHeight: mainRect.height,
                childHeight: childRect.height,
                childBottom: childRect.bottom,
                bottomNavTop: bottomNavRect.top,
                bottomNavHeight,
                // The child's bottom edge should NOT extend past the bottom-nav's top
                childExtendsIntoBottomNav: childRect.bottom > bottomNavRect.top + 1 // 1px tolerance
            };
        });

        // The child should NOT extend into the bottom-nav area
        expect(metrics.childExtendsIntoBottomNav).toBe(false);

        // The main area should be viewport - navbar - bottom-nav (approximately)
        const navbarHeight = metrics.mainTop; // navbar ends where main starts
        const expectedMainHeight = metrics.viewportHeight - navbarHeight - metrics.bottomNavHeight;
        // Allow 2px tolerance for rounding
        expect(Math.abs(metrics.mainHeight - expectedMainHeight)).toBeLessThan(2);
    });

    test('child with height:100% bottom edge aligns with bottom-nav top', async () => {
        const result = await page.evaluate(() => {
            const child = document.getElementById('full-height-child');
            const bottomNav = document.querySelector('au-bottom-nav');

            const childRect = child.getBoundingClientRect();
            const navRect = bottomNav.getBoundingClientRect();

            return {
                childBottom: Math.round(childRect.bottom),
                bottomNavTop: Math.round(navRect.top),
                gap: Math.abs(Math.round(childRect.bottom) - Math.round(navRect.top))
            };
        });

        // The gap between child bottom and bottom-nav top should be minimal (≤ 2px)
        expect(result.gap).toBeLessThanOrEqual(2);
    });
});
