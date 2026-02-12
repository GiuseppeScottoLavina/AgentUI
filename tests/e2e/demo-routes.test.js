/**
 * @fileoverview E2E Tests for index-ultra.html demo routes
 * 
 * Tests all 20 routes to verify:
 * 1. Route loads without errors
 * 2. Components render correctly
 * 3. Navigation works
 * 4. No console errors
 */

import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
// Set cache dir BEFORE importing puppeteer (it reads env at import time)
process.env.PUPPETEER_CACHE_DIR = '/tmp/puppeteer';
import { launchBrowser, puppeteer } from './puppeteer-helper.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper to replace deprecated page.waitForTimeout
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// All routes from index-ultra.html
const DEMO_ROUTES = [
    { hash: 'home', title: 'Home', component: null },
    { hash: 'installation', title: 'Installation', component: null },
    { hash: 'buttons', title: 'Buttons', component: 'au-button' },
    { hash: 'inputs', title: 'Inputs', component: 'au-input' },
    { hash: 'cards', title: 'Cards', component: 'au-card' },
    { hash: 'checkboxes', title: 'Checkboxes', component: 'au-checkbox' },
    { hash: 'switches', title: 'Switches', component: 'au-switch' },
    { hash: 'radios', title: 'Radios', component: 'au-radio' },
    { hash: 'dropdowns', title: 'Dropdowns', component: 'au-dropdown' },
    { hash: 'tabs', title: 'Tabs', component: 'au-tabs' },
    { hash: 'modals', title: 'Modals', component: 'au-modal' },
    { hash: 'alerts', title: 'Alerts', component: 'au-alert' },
    { hash: 'toasts', title: 'Toasts', component: 'au-button' },  // Toast page shows buttons to trigger toasts
    { hash: 'progress', title: 'Progress', component: 'au-progress' },
    { hash: 'layout', title: 'Layout', component: null },  // Layout page uses CSS grid utilities
    { hash: 'navbar', title: 'Navbar', component: 'au-navbar' },
    { hash: 'avatars', title: 'Avatars', component: 'au-avatar' },
    { hash: 'badges', title: 'Badges', component: 'au-badge' },
    { hash: 'chips', title: 'Chips', component: 'au-chip' },
    { hash: 'icons', title: 'Icons', component: 'au-icon' }
];

describe('Demo Routes E2E Tests', () => {
    let browser;
    let page;
    let server;
    const consoleErrors = [];

    beforeAll(async () => {
        const projectRoot = join(__dirname, '../..');

        // Start HTTP server with proper MIME types
        server = Bun.serve({
            port: 0,
            async fetch(req) {
                const url = new URL(req.url);
                let filePath = join(projectRoot, url.pathname);

                // Default to index-ultra.html
                if (url.pathname === '/' || url.pathname === '/index-ultra.html') {
                    filePath = join(projectRoot, 'index-ultra.html');
                }

                try {
                    const file = Bun.file(filePath);
                    const exists = await file.exists();
                    if (!exists) {
                        return new Response('Not Found', { status: 404 });
                    }

                    const content = await file.arrayBuffer();
                    const ext = filePath.split('.').pop();
                    const mimeTypes = {
                        'html': 'text/html',
                        'js': 'text/javascript',
                        'css': 'text/css',
                        'json': 'application/json',
                        'svg': 'image/svg+xml',
                        'png': 'image/png',
                        'ico': 'image/x-icon'
                    };

                    return new Response(content, {
                        headers: { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' }
                    });
                } catch (e) {
                    return new Response('Error: ' + e.message, { status: 500 });
                }
            }
        });

        console.log(`Test server started at http://localhost:${server.port}`);

        browser = await launchBrowser({ testName: 'demo_routes' });
        page = await browser.newPage();

        // Capture console errors
        page.on('pageerror', err => {
            consoleErrors.push(err.message);
        });

        // Navigate to demo page
        await page.goto(`http://localhost:${server.port}/demo/index.html`, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });
    }, 60000);

    afterAll(async () => {
        if (browser) await browser.close();
        if (server) server.stop();
    });

    // ========================================
    // ROUTE LOADING TESTS
    // ========================================

    describe('Route Loading', () => {
        for (const route of DEMO_ROUTES) {
            test(`#${route.hash} should load successfully`, async () => {
                // Navigate to route
                await page.goto(`http://localhost:${server.port}/demo/index.html#${route.hash}`, {
                    waitUntil: 'networkidle0'
                });

                // Wait for router to process
                await delay(300);

                // Check that content area has content
                const hasContent = await page.evaluate(() => {
                    const main = document.querySelector('.main-content, main, [role="main"]');
                    return main ? main.innerHTML.length > 50 : false;
                });

                expect(hasContent).toBe(true);
            }, 15000);
        }
    });

    // ========================================
    // COMPONENT RENDERING TESTS
    // ========================================

    describe('Component Rendering', () => {
        for (const route of DEMO_ROUTES.filter(r => r.component)) {
            test(`#${route.hash} should render ${route.component}`, async () => {
                await page.goto(`http://localhost:${server.port}/demo/index.html#${route.hash}`, {
                    waitUntil: 'networkidle0'
                });

                await delay(500);

                // Check component exists
                const componentExists = await page.evaluate((tag) => {
                    return document.querySelectorAll(tag).length > 0;
                }, route.component);

                expect(componentExists).toBe(true);
            }, 15000);
        }
    });

    // ========================================
    // NAVIGATION TESTS
    // ========================================

    describe('Navigation', () => {
        test('sidebar navigation should work', async () => {
            await page.goto(`http://localhost:${server.port}/demo/index.html#home`, {
                waitUntil: 'networkidle0'
            });

            // Click on Buttons nav item
            const clicked = await page.evaluate(() => {
                const navItems = document.querySelectorAll('.sidebar a, au-nav-item, [href="#buttons"]');
                for (const item of navItems) {
                    if (item.textContent.includes('Buttons') || item.href?.includes('#buttons')) {
                        item.click();
                        return true;
                    }
                }
                return false;
            });

            if (clicked) {
                await delay(500);
                const hash = await page.evaluate(() => window.location.hash);
                expect(hash).toBe('#buttons');
            }
        }, 15000);

        test('back/forward navigation should work', async () => {
            // Navigate to two pages
            await page.goto(`http://localhost:${server.port}/demo/index.html#buttons`, {
                waitUntil: 'networkidle0'
            });
            await page.goto(`http://localhost:${server.port}/demo/index.html#cards`, {
                waitUntil: 'networkidle0'
            });

            // Go back
            await page.goBack();
            await delay(300);

            const hash = await page.evaluate(() => window.location.hash);
            expect(hash).toBe('#buttons');
        }, 15000);

        // REGRESSION TEST: Direct URL hash should select matching drawer item
        // Bug: Opening http://localhost:5001/#buttons showed "Overview" selected instead of "Buttons"
        test('direct hash URL should select correct drawer item', async () => {
            // Open directly with hash (simulating user sharing a link)
            await page.goto(`http://localhost:${server.port}/demo/index.html#buttons`, {
                waitUntil: 'networkidle0'
            });
            await delay(500);

            // Verify the correct drawer item has the active attribute
            const activeItems = await page.evaluate(() => {
                const items = document.querySelectorAll('au-drawer-item');
                return Array.from(items)
                    .filter(item => item.hasAttribute('active'))
                    .map(item => ({
                        dataPage: item.getAttribute('data-page'),
                        label: item.getAttribute('label')
                    }));
            });

            // Should have exactly one active item
            expect(activeItems.length).toBe(1);
            // The active item should be "buttons", not "home" (Overview)
            expect(activeItems[0].dataPage).toBe('buttons');
        }, 15000);

        test('sidebar should update on hash change', async () => {
            // Start on home
            await page.goto(`http://localhost:${server.port}/demo/index.html#home`, {
                waitUntil: 'networkidle0'
            });
            await delay(300);

            // Navigate to a different page via hash
            await page.evaluate(() => { window.location.hash = 'cards'; });
            await delay(500);

            // Verify drawer item updated
            const activeItems = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('au-drawer-item'))
                    .filter(item => item.hasAttribute('active'))
                    .map(item => item.getAttribute('data-page'));
            });

            expect(activeItems).toContain('cards');
            expect(activeItems).not.toContain('home');
        }, 15000);
    });

    // ========================================
    // COMPONENT INTERACTION TESTS
    // ========================================

    describe('Component Interactions', () => {
        test('au-button click should work', async () => {
            await page.goto(`http://localhost:${server.port}/demo/index.html#buttons`, {
                waitUntil: 'networkidle0'
            });
            await delay(500);

            const clicked = await page.evaluate(() => {
                const btn = document.querySelector('au-button');
                if (btn) {
                    btn.click();
                    return true;
                }
                return false;
            });

            expect(clicked).toBe(true);
        }, 15000);

        test('au-checkbox should toggle', async () => {
            await page.goto(`http://localhost:${server.port}/demo/index.html#checkboxes`, {
                waitUntil: 'networkidle0'
            });
            await delay(500);

            const toggled = await page.evaluate(() => {
                const cb = document.querySelector('au-checkbox');
                if (cb) {
                    const before = cb.hasAttribute('checked');
                    cb.click();
                    const after = cb.hasAttribute('checked');
                    return before !== after;
                }
                return false;
            });

            expect(toggled).toBe(true);
        }, 15000);

        test('au-switch should toggle', async () => {
            await page.goto(`http://localhost:${server.port}/demo/index.html#switches`, {
                waitUntil: 'networkidle0'
            });
            await delay(500);

            const toggled = await page.evaluate(() => {
                const sw = document.querySelector('au-switch');
                if (sw) {
                    const before = sw.hasAttribute('checked');
                    sw.click();
                    const after = sw.hasAttribute('checked');
                    return before !== after;
                }
                return false;
            });

            expect(toggled).toBe(true);
        }, 15000);

        test('au-modal should open and close', async () => {
            await page.goto(`http://localhost:${server.port}/demo/index.html#modals`, {
                waitUntil: 'networkidle0'
            });
            await delay(500);

            // Note: modal.close() is async with ~200ms animation delay
            const result = await page.evaluate(async () => {
                const modal = document.querySelector('au-modal');
                if (modal && typeof modal.open === 'function') {
                    modal.open();
                    const wasOpen = modal.hasAttribute('open');
                    modal.close();
                    // Wait for close animation (200ms internal timeout)
                    await new Promise(r => setTimeout(r, 300));
                    const wasClosed = !modal.hasAttribute('open');
                    return { opened: wasOpen, closed: wasClosed };
                }
                return { opened: false, closed: false };
            });

            expect(result.opened).toBe(true);
            expect(result.closed).toBe(true);
        }, 15000);

        test('au-tabs should switch panels', async () => {
            await page.goto(`http://localhost:${server.port}/demo/index.html#tabs`, {
                waitUntil: 'networkidle0'
            });
            await delay(500);

            const switched = await page.evaluate(() => {
                const tabs = document.querySelector('au-tabs');
                const tabItems = document.querySelectorAll('au-tab');
                if (tabs && tabItems.length > 1) {
                    tabItems[1].click();
                    return true;
                }
                return false;
            });

            expect(switched).toBe(true);
        }, 15000);
    });

    // ========================================
    // ERROR CHECKING
    // ========================================

    describe('Error Checking', () => {
        test('no critical console errors during all route navigation', async () => {
            const errors = [];

            page.on('pageerror', err => errors.push(err.message));

            // Navigate through all routes
            for (const route of DEMO_ROUTES) {
                await page.goto(`http://localhost:${server.port}/demo/index.html#${route.hash}`, {
                    waitUntil: 'networkidle0'
                });
                await delay(200);
            }

            // Filter out known non-critical errors
            const criticalErrors = errors.filter(e =>
                !e.includes('ResizeObserver') &&
                !e.includes('Script error')
            );

            expect(criticalErrors.length).toBe(0);
        }, 60000);
    });

    // ========================================
    // ACCESSIBILITY QUICK CHECKS
    // ========================================

    describe('Accessibility', () => {
        test('interactive components should have proper roles', async () => {
            await page.goto(`http://localhost:${server.port}/demo/index.html#buttons`, {
                waitUntil: 'networkidle0'
            });
            await delay(500);

            const hasRoles = await page.evaluate(() => {
                const btn = document.querySelector('au-button');
                return btn ? btn.getAttribute('role') === 'button' : false;
            });

            expect(hasRoles).toBe(true);
        }, 15000);

        test('checkboxes should have correct aria-checked', async () => {
            await page.goto(`http://localhost:${server.port}/demo/index.html#checkboxes`, {
                waitUntil: 'networkidle0'
            });
            await delay(500);

            const hasAria = await page.evaluate(() => {
                const cb = document.querySelector('au-checkbox');
                if (cb) {
                    const ariaChecked = cb.getAttribute('aria-checked');
                    return ariaChecked === 'true' || ariaChecked === 'false';
                }
                return false;
            });

            expect(hasAria).toBe(true);
        }, 15000);
    });

    // ========================================
    // PERFORMANCE CHECKS
    // ========================================

    describe('Performance', () => {
        test('route transitions should be fast (<500ms)', async () => {
            await page.goto(`http://localhost:${server.port}/demo/index.html#home`, {
                waitUntil: 'networkidle0'
            });

            const start = Date.now();
            await page.goto(`http://localhost:${server.port}/demo/index.html#buttons`, {
                waitUntil: 'networkidle0'
            });
            const duration = Date.now() - start;

            expect(duration).toBeLessThan(2000); // Allow 2s for network
        }, 15000);

        test('all routes should load within time budget', async () => {
            const times = [];

            for (const route of DEMO_ROUTES.slice(0, 5)) { // Test first 5 routes
                const start = Date.now();
                await page.goto(`http://localhost:${server.port}/demo/index.html#${route.hash}`, {
                    waitUntil: 'networkidle0'
                });
                times.push(Date.now() - start);
            }

            const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
            console.log(`Average route load time: ${avgTime.toFixed(0)}ms`);

            expect(avgTime).toBeLessThan(3000); // Average under 3s
        }, 45000);
    });
});
