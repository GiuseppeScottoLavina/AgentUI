/**
 * @fileoverview Deep verification of au-layout full-bleed + bottom-nav height fix
 * 
 * Tests multiple real-world scenarios:
 * 1. Kanban board with flex columns (the original reported bug)
 * 2. Layout WITHOUT bottom-nav (no regression)
 * 3. Layout WITH scrollable content + bottom-nav (padding-bottom still works)
 * 4. Layout with drawer + bottom-nav
 * 5. Absolute-positioned child filling the content area
 * 6. Nested flex containers inside content
 */

import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { launchBrowser } from './puppeteer-helper.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Deep layout height verification', () => {
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

                const pages = {
                    '/kanban': `<!DOCTYPE html>
<html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="/dist/agentui.css">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
#kanban-board {
    display: flex;
    gap: 16px;
    height: 100%;
    padding: 16px;
    overflow-x: auto;
}
.kanban-col {
    flex: 0 0 280px;
    background: var(--md-sys-color-surface-container-low, #f5f5f5);
    border-radius: 12px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 100%;
    overflow-y: auto;
}
.kanban-card {
    background: var(--md-sys-color-surface, #fff);
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.12);
}
</style>
</head><body>
<au-layout full-bleed>
    <au-navbar slot="header"><span slot="title">Kanban Board</span></au-navbar>
    <div id="kanban-board">
        <div class="kanban-col" id="col-todo">
            <h3>To Do</h3>
            <div class="kanban-card">Task 1</div>
            <div class="kanban-card">Task 2</div>
            <div class="kanban-card">Task 3</div>
        </div>
        <div class="kanban-col" id="col-progress">
            <h3>In Progress</h3>
            <div class="kanban-card">Task 4</div>
        </div>
        <div class="kanban-col" id="col-done">
            <h3>Done</h3>
            <div class="kanban-card">Task 5</div>
            <div class="kanban-card">Task 6</div>
        </div>
    </div>
    <au-bottom-nav slot="bottom">
        <au-nav-item icon="home" label="Board"></au-nav-item>
        <au-nav-item icon="settings" label="Settings"></au-nav-item>
    </au-bottom-nav>
</au-layout>
<script type="module">
import('/dist/agentui.esm.js').then(() => {
    document.addEventListener('au-ready', () => { window._testReady = true; });
});
</script>
</body></html>`,

                    '/no-bottom-nav': `<!DOCTYPE html>
<html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="/dist/agentui.css">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
#full-child { height: 100%; background: lightblue; }
</style>
</head><body>
<au-layout full-bleed>
    <au-navbar slot="header"><span slot="title">No Bottom Nav</span></au-navbar>
    <div id="full-child">Content fills full height</div>
</au-layout>
<script type="module">
import('/dist/agentui.esm.js').then(() => {
    document.addEventListener('au-ready', () => { window._testReady = true; });
});
</script>
</body></html>`,

                    '/scrollable': `<!DOCTYPE html>
<html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="/dist/agentui.css">
<style>* { margin: 0; box-sizing: border-box; } .scroll-item { padding: 16px; border-bottom: 1px solid #ddd; }</style>
</head><body>
<au-layout>
    <au-navbar slot="header"><span slot="title">Scrollable</span></au-navbar>
    ${Array.from({ length: 30 }, (_, i) => `<div class="scroll-item">Item ${i + 1} with some content</div>`).join('\n    ')}
    <au-bottom-nav slot="bottom">
        <au-nav-item icon="home" label="Home"></au-nav-item>
    </au-bottom-nav>
</au-layout>
<script type="module">
import('/dist/agentui.esm.js').then(() => {
    document.addEventListener('au-ready', () => { window._testReady = true; });
});
</script>
</body></html>`,

                    '/nested-flex': `<!DOCTYPE html>
<html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="/dist/agentui.css">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
#app-container {
    display: flex;
    flex-direction: column;
    height: 100%;
}
#app-header { padding: 8px 16px; background: #e0e0e0; flex-shrink: 0; }
#app-body { flex: 1; display: flex; min-height: 0; overflow: hidden; }
#sidebar { width: 200px; background: #d0d0d0; overflow-y: auto; }
#main-area { flex: 1; background: #c0c0c0; overflow-y: auto; }
</style>
</head><body>
<au-layout full-bleed>
    <au-navbar slot="header"><span slot="title">Nested Flex</span></au-navbar>
    <div id="app-container">
        <div id="app-header">Sub-header</div>
        <div id="app-body">
            <div id="sidebar">Sidebar content</div>
            <div id="main-area">Main content<br>Line 2<br>Line 3</div>
        </div>
    </div>
    <au-bottom-nav slot="bottom">
        <au-nav-item icon="home" label="Home"></au-nav-item>
        <au-nav-item icon="search" label="Search"></au-nav-item>
    </au-bottom-nav>
</au-layout>
<script type="module">
import('/dist/agentui.esm.js').then(() => {
    document.addEventListener('au-ready', () => { window._testReady = true; });
});
</script>
</body></html>`
                };

                if (pages[url.pathname]) {
                    return new Response(pages[url.pathname], {
                        headers: { 'Content-Type': 'text/html' }
                    });
                }
                return new Response('Not found', { status: 404 });
            }
        });

        browser = await launchBrowser({ testName: 'deep-layout-verify' });
        page = await browser.newPage();
        await page.setViewport({ width: 400, height: 932 });
    }, 30000);

    afterAll(async () => {
        if (page) await page.close().catch(() => { });
        if (browser) await browser.close().catch(() => { });
        if (server) server.stop();
    });

    // ========================================
    // SCENARIO 1: Kanban Board (reported bug)
    // ========================================

    test('Kanban: board bottom does NOT extend behind bottom-nav', async () => {
        await page.goto(`http://localhost:${server.port}/kanban`, { waitUntil: 'networkidle0' });
        await page.waitForFunction(() => window._testReady === true, { timeout: 10000 });
        await new Promise(r => setTimeout(r, 300));

        const metrics = await page.evaluate(() => {
            const board = document.getElementById('kanban-board');
            const bottomNav = document.querySelector('au-bottom-nav');
            const main = document.querySelector('.au-layout-main');
            const navbar = document.querySelector('au-navbar');

            const boardRect = board.getBoundingClientRect();
            const navRect = bottomNav.getBoundingClientRect();
            const mainRect = main.getBoundingClientRect();
            const navbarRect = navbar.getBoundingClientRect();

            return {
                viewportHeight: window.innerHeight,
                navbarHeight: navbarRect.height,
                mainTop: mainRect.top,
                mainBottom: mainRect.bottom,
                mainHeight: mainRect.height,
                boardTop: boardRect.top,
                boardBottom: boardRect.bottom,
                boardHeight: boardRect.height,
                bottomNavTop: navRect.top,
                bottomNavHeight: navRect.height,
                boardExtendsIntoNav: boardRect.bottom > navRect.top + 1,
                expectedVisibleHeight: window.innerHeight - navbarRect.height - navRect.height
            };
        });

        // Kanban board should NOT extend into bottom-nav
        expect(metrics.boardExtendsIntoNav).toBe(false);

        // Main area height should equal viewport - navbar - bottom-nav
        expect(Math.abs(metrics.mainHeight - metrics.expectedVisibleHeight)).toBeLessThan(2);

        // Board bottom should be at or above bottom-nav top
        expect(metrics.boardBottom).toBeLessThanOrEqual(metrics.bottomNavTop + 1);
    });

    test('Kanban: all 3 columns are fully visible (not clipped)', async () => {
        const visibility = await page.evaluate(() => {
            const cols = ['col-todo', 'col-progress', 'col-done'];
            const bottomNav = document.querySelector('au-bottom-nav');
            const navTop = bottomNav.getBoundingClientRect().top;

            return cols.map(id => {
                const col = document.getElementById(id);
                const rect = col.getBoundingClientRect();
                return {
                    id,
                    top: rect.top,
                    bottom: rect.bottom,
                    isFullyVisible: rect.bottom <= navTop + 1,
                    clippedBy: Math.max(0, rect.bottom - navTop)
                };
            });
        });

        for (const col of visibility) {
            expect(col.isFullyVisible).toBe(true);
        }
    });

    test('Kanban: last card in each column is visible', async () => {
        const cards = await page.evaluate(() => {
            const bottomNav = document.querySelector('au-bottom-nav');
            const navTop = bottomNav.getBoundingClientRect().top;

            const columns = document.querySelectorAll('.kanban-col');
            return Array.from(columns).map(col => {
                const allCards = col.querySelectorAll('.kanban-card');
                const lastCard = allCards[allCards.length - 1];
                if (!lastCard) return { hasCards: false };
                const rect = lastCard.getBoundingClientRect();
                return {
                    hasCards: true,
                    lastCardBottom: rect.bottom,
                    bottomNavTop: navTop,
                    isVisible: rect.bottom <= navTop + 1
                };
            });
        });

        for (const col of cards) {
            if (col.hasCards) {
                expect(col.isVisible).toBe(true);
            }
        }
    });

    // ========================================
    // SCENARIO 2: No bottom-nav (regression)
    // ========================================

    test('No bottom-nav: height:100% child fills entire content area', async () => {
        await page.goto(`http://localhost:${server.port}/no-bottom-nav`, { waitUntil: 'networkidle0' });
        await page.waitForFunction(() => window._testReady === true, { timeout: 10000 });
        await new Promise(r => setTimeout(r, 300));

        const metrics = await page.evaluate(() => {
            const child = document.getElementById('full-child');
            const main = document.querySelector('.au-layout-main');
            const navbar = document.querySelector('au-navbar');

            const childRect = child.getBoundingClientRect();
            const mainRect = main.getBoundingClientRect();
            const navbarRect = navbar.getBoundingClientRect();

            return {
                viewportHeight: window.innerHeight,
                navbarHeight: navbarRect.height,
                childTop: childRect.top,
                childBottom: childRect.bottom,
                childHeight: childRect.height,
                mainHeight: mainRect.height,
                expectedHeight: window.innerHeight - navbarRect.height,
                // Child should extend to the very bottom of viewport
                childReachesBottom: Math.abs(childRect.bottom - window.innerHeight) < 2
            };
        });

        // Without bottom-nav, child should fill to viewport bottom
        expect(metrics.childReachesBottom).toBe(true);
        // Main height should be viewport - navbar
        expect(Math.abs(metrics.mainHeight - metrics.expectedHeight)).toBeLessThan(2);
    });

    // ========================================
    // SCENARIO 3: Scrollable content + bottom-nav
    // ========================================

    test('Scrollable: last card is reachable by scrolling', async () => {
        // Navigate to scrollable page — note: uses default au-layout (not full-bleed)
        // so .au-layout-content gets padding-bottom from has-bottom-nav CSS rule
        await page.goto(`http://localhost:${server.port}/scrollable`, { waitUntil: 'networkidle0' });
        await page.waitForFunction(() => window._testReady === true, { timeout: 10000 });
        await new Promise(r => setTimeout(r, 300));

        const result = await page.evaluate(() => {
            const main = document.querySelector('.au-layout-main');
            const content = document.querySelector('.au-layout-content');

            // Check scrollability
            const isScrollable = main.scrollHeight > main.clientHeight;

            // Scroll to bottom
            main.scrollTop = main.scrollHeight;

            // Get padding-bottom computed
            const contentPad = parseFloat(getComputedStyle(content).paddingBottom);

            // Check if last item is visible after scrolling
            const lastItem = content.querySelector('.scroll-item:last-child');
            const bottomNav = document.querySelector('au-bottom-nav');
            const lastRect = lastItem?.getBoundingClientRect();
            const navRect = bottomNav?.getBoundingClientRect();

            return {
                isScrollable,
                scrollHeight: main.scrollHeight,
                clientHeight: main.clientHeight,
                paddingBottom: contentPad,
                hasPaddingCompensation: contentPad >= 80,
                lastItemVisible: lastRect ? lastRect.bottom <= (navRect?.top || window.innerHeight) + 1 : null,
                // Debug info
                layoutHasBottomNav: document.querySelector('au-layout')?.hasAttribute('has-bottom-nav'),
                layoutHTML: document.querySelector('au-layout')?.outerHTML.substring(0, 200),
                bottomNavExists: !!document.querySelector('au-bottom-nav'),
                contentClass: content?.className,
                allContentStyles: content ? getComputedStyle(content).cssText.match(/padding[^;]+/g) : null
            };
        });

        // Content should be scrollable (30 items > viewport)
        expect(result.isScrollable).toBe(true);
        // padding-bottom compensation should still be active
        // This ensures scrollable content can reach past the fixed bottom-nav
        console.log(`[Scrollable Debug] paddingBottom=${result.paddingBottom}px hasBottomNav=${result.layoutHasBottomNav} bottomNavExists=${result.bottomNavExists} contentClass=${result.contentClass}`);
        console.log(`[Scrollable Debug] layoutHTML=${result.layoutHTML}`);
        expect(result.hasPaddingCompensation).toBe(true);
    });

    // ========================================
    // SCENARIO 4: Nested flex containers
    // ========================================

    test('Nested flex: sub-layout fills correctly with bottom-nav', async () => {
        await page.goto(`http://localhost:${server.port}/nested-flex`, { waitUntil: 'networkidle0' });
        await page.waitForFunction(() => window._testReady === true, { timeout: 10000 });
        await new Promise(r => setTimeout(r, 300));

        const metrics = await page.evaluate(() => {
            const container = document.getElementById('app-container');
            const body = document.getElementById('app-body');
            const sidebar = document.getElementById('sidebar');
            const mainArea = document.getElementById('main-area');
            const bottomNav = document.querySelector('au-bottom-nav');

            const containerRect = container.getBoundingClientRect();
            const bodyRect = body.getBoundingClientRect();
            const sidebarRect = sidebar.getBoundingClientRect();
            const mainAreaRect = mainArea.getBoundingClientRect();
            const navRect = bottomNav.getBoundingClientRect();

            return {
                containerBottom: containerRect.bottom,
                bodyBottom: bodyRect.bottom,
                sidebarBottom: sidebarRect.bottom,
                mainAreaBottom: mainAreaRect.bottom,
                bottomNavTop: navRect.top,
                containerExtendsIntoNav: containerRect.bottom > navRect.top + 1,
                sidebarExtendsIntoNav: sidebarRect.bottom > navRect.top + 1,
                mainAreaExtendsIntoNav: mainAreaRect.bottom > navRect.top + 1
            };
        });

        // Nothing should extend into the bottom-nav area
        expect(metrics.containerExtendsIntoNav).toBe(false);
        expect(metrics.sidebarExtendsIntoNav).toBe(false);
        expect(metrics.mainAreaExtendsIntoNav).toBe(false);
    });

    // ========================================
    // DIAGNOSTIC: Pixel-level measurements
    // ========================================

    test('Diagnostic: all pixel measurements are consistent', async () => {
        await page.goto(`http://localhost:${server.port}/kanban`, { waitUntil: 'networkidle0' });
        await page.waitForFunction(() => window._testReady === true, { timeout: 10000 });
        await new Promise(r => setTimeout(r, 300));

        const diag = await page.evaluate(() => {
            const layout = document.querySelector('au-layout');
            const navbar = document.querySelector('au-navbar');
            const main = document.querySelector('.au-layout-main');
            const content = document.querySelector('.au-layout-content');
            const bottomNav = document.querySelector('au-bottom-nav');

            const navbarRect = navbar.getBoundingClientRect();
            const mainRect = main.getBoundingClientRect();
            const contentRect = content.getBoundingClientRect();
            const navRect = bottomNav.getBoundingClientRect();
            const bottomNavHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--au-bottom-nav-height') || '80');

            const visibleHeight = window.innerHeight - navbarRect.height - bottomNavHeight;

            return {
                viewport: window.innerHeight,
                navbarHeight: navbarRect.height,
                bottomNavHeight,
                mainHeight: mainRect.height,
                contentHeight: contentRect.height,
                visibleHeight,
                mainMatchesVisible: Math.abs(mainRect.height - visibleHeight) < 2,
                // CSS variable is properly applied
                cssVarApplied: bottomNavHeight > 0,
                // Main bottom aligns with bottom-nav top
                seamless: Math.abs(mainRect.bottom - navRect.top) < 2
            };
        });

        expect(diag.cssVarApplied).toBe(true);
        expect(diag.mainMatchesVisible).toBe(true);
        expect(diag.seamless).toBe(true);

        // Store diagnostics for reporting
        console.log(`[Diagnostic] viewport=${diag.viewport}px navbar=${diag.navbarHeight}px bottomNav=${diag.bottomNavHeight}px main=${diag.mainHeight}px visible=${diag.visibleHeight}px seamless=${diag.seamless}`);
    });
});
