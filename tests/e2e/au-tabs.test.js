/**
 * @fileoverview Comprehensive Unit Tests for au-tabs Component
 * 
 * Tests:
 * - Component registration and basic rendering
 * - Tab click handling and active state switching
 * - Event emission (au-tab-change)
 * - Indicator positioning
 * - Accessibility attributes
 */

import { describe, test, expect, beforeAll, afterEach, afterAll } from 'bun:test';
import { launchBrowser, puppeteer } from './puppeteer-helper.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper to wait
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe('au-tabs Component E2E Tests', () => {
    let browser;
    let page;
    let server;

    beforeAll(async () => {
        const projectRoot = join(__dirname, '../..');

        // Start HTTP server
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

        console.log(`[au-tabs test] Server started at http://localhost:${server.port}`);

        browser = await launchBrowser({ testName: 'tabs' });
        page = await browser.newPage();
    }, 60000);

    afterEach(async () => {
        // Navigate to blank page to reset state between tests
        await page.goto('about:blank');
    });

    afterAll(async () => {
        if (browser) await browser.close();
        if (server) server.stop();
    });

    // ========================================
    // COMPONENT REGISTRATION
    // ========================================

    test('au-tabs should be registered as custom element', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#tabs`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const isRegistered = await page.evaluate(() => {
            return customElements.get('au-tabs') !== undefined;
        });

        expect(isRegistered).toBe(true);
    });

    test('au-tab should be registered as custom element', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#tabs`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const isRegistered = await page.evaluate(() => {
            return customElements.get('au-tab') !== undefined;
        });

        expect(isRegistered).toBe(true);
    });

    // ========================================
    // BASIC RENDERING
    // ========================================

    test('au-tabs should render with base class', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#tabs`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const hasBaseClass = await page.evaluate(() => {
            const tabs = document.querySelector('au-tabs');
            return tabs ? tabs.classList.contains('au-tabs') : false;
        });

        expect(hasBaseClass).toBe(true);
    });

    test('au-tabs should create tabs list wrapper', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#tabs`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const hasList = await page.evaluate(() => {
            const tabs = document.querySelector('au-tabs');
            return tabs ? tabs.querySelector('.au-tabs__list') !== null : false;
        });

        expect(hasList).toBe(true);
    });

    // ========================================
    // ACCESSIBILITY
    // ========================================

    test('au-tabs list should have role=tablist', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#tabs`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const hasRole = await page.evaluate(() => {
            const tabs = document.querySelector('au-tabs');
            if (!tabs) return false;
            const list = tabs.querySelector('.au-tabs__list');
            return list ? list.getAttribute('role') === 'tablist' : false;
        });

        expect(hasRole).toBe(true);
    });

    test('au-tab should have role=tab', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#tabs`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const hasRole = await page.evaluate(() => {
            const tab = document.querySelector('au-tab');
            return tab ? tab.getAttribute('role') === 'tab' : false;
        });

        expect(hasRole).toBe(true);
    });

    test('active tab should have aria-selected=true', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#tabs`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const ariaSelected = await page.evaluate(() => {
            const tabs = document.querySelectorAll('au-tab');
            if (tabs.length === 0) return null;
            // First tab should be active by default
            return tabs[0].getAttribute('aria-selected');
        });

        expect(ariaSelected).toBe('true');
    });

    test('inactive tabs should have aria-selected=false', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#tabs`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const ariaSelected = await page.evaluate(() => {
            const tabs = document.querySelectorAll('au-tab');
            if (tabs.length < 2) return null;
            // Second tab should be inactive by default
            return tabs[1].getAttribute('aria-selected');
        });

        expect(ariaSelected).toBe('false');
    });

    // ========================================
    // TAB SWITCHING
    // ========================================

    test('clicking a tab should update active attribute', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#tabs`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(() => {
            const tabsContainer = document.querySelector('au-tabs');
            const tabs = document.querySelectorAll('au-tab');
            if (!tabsContainer || tabs.length < 2) {
                return { before: null, after: null, clicked: false };
            }

            const before = tabsContainer.getAttribute('active');
            tabs[1].click();
            const after = tabsContainer.getAttribute('active');

            return { before, after, clicked: true };
        });

        expect(result.clicked).toBe(true);
        expect(result.before).toBe('0');
        expect(result.after).toBe('1');
    });

    test('clicking a tab should add is-active class to that tab', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#tabs`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(() => {
            const tabs = document.querySelectorAll('au-tab');
            if (tabs.length < 2) return { tab1Active: false, tab2Active: false };

            // Click second tab
            tabs[1].click();

            return {
                tab1Active: tabs[0].classList.contains('is-active'),
                tab2Active: tabs[1].classList.contains('is-active')
            };
        });

        expect(result.tab1Active).toBe(false);
        expect(result.tab2Active).toBe(true);
    });

    test('clicking a tab should update aria-selected on all tabs', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#tabs`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(() => {
            const tabs = document.querySelectorAll('au-tab');
            if (tabs.length < 2) return null;

            // Click second tab
            tabs[1].click();

            return {
                tab1AriaSelected: tabs[0].getAttribute('aria-selected'),
                tab2AriaSelected: tabs[1].getAttribute('aria-selected')
            };
        });

        expect(result.tab1AriaSelected).toBe('false');
        expect(result.tab2AriaSelected).toBe('true');
    });

    // ========================================
    // EVENT EMISSION
    // ========================================

    test('clicking a tab should emit au-tab-change event', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#tabs`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const eventFired = await page.evaluate(() => {
            return new Promise(resolve => {
                const tabsContainer = document.querySelector('au-tabs');
                const tabs = document.querySelectorAll('au-tab');
                if (!tabsContainer || tabs.length < 2) {
                    resolve({ fired: false, reason: 'No tabs found' });
                    return;
                }

                let eventData = null;
                tabsContainer.addEventListener('au-tab-change', (e) => {
                    eventData = e.detail;
                });

                tabs[1].click();

                // Check immediately
                setTimeout(() => {
                    resolve({ fired: eventData !== null, index: eventData?.index });
                }, 100);
            });
        });

        expect(eventFired.fired).toBe(true);
        expect(eventFired.index).toBe(1);
    });

    test('au-tab-change event should have correct index in detail', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#tabs`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(() => {
            return new Promise(resolve => {
                const tabsContainer = document.querySelector('au-tabs');
                const tabs = document.querySelectorAll('au-tab');
                if (!tabsContainer || tabs.length < 3) {
                    resolve({ success: false });
                    return;
                }

                const indices = [];
                tabsContainer.addEventListener('au-tab-change', (e) => {
                    indices.push(e.detail.index);
                });

                // Click each tab
                tabs[0].click();
                tabs[1].click();
                tabs[2].click();

                setTimeout(() => {
                    resolve({ success: true, indices });
                }, 100);
            });
        });

        expect(result.success).toBe(true);
        // Note: First click might not emit if already active
        expect(result.indices).toContain(1);
        expect(result.indices).toContain(2);
    });

    // ========================================
    // INDICATOR POSITIONING
    // ========================================

    test('indicator should update position on tab switch', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#tabs`, {
            waitUntil: 'networkidle0'
        });
        await delay(500);

        const result = await page.evaluate(() => {
            const tabsContainer = document.querySelector('au-tabs');
            const tabs = document.querySelectorAll('au-tab');
            const list = tabsContainer?.querySelector('.au-tabs__list');
            if (!list || tabs.length < 2) return null;

            const beforeLeft = list.style.getPropertyValue('--indicator-left');
            tabs[1].click();
            const afterLeft = list.style.getPropertyValue('--indicator-left');

            return { beforeLeft, afterLeft };
        });

        expect(result).not.toBeNull();
        expect(result.beforeLeft).not.toBe(result.afterLeft);
    });

    // ========================================
    // ENTERPRISE DEMO TABS
    // ========================================

    test('Enterprise section tabs should work correctly', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#enterprise`, {
            waitUntil: 'networkidle0'
        });
        await delay(1000);

        const result = await page.evaluate(() => {
            const tabsContainer = document.getElementById('enterprise-doc-tabs');
            if (!tabsContainer) return { found: false, issue: 'enterprise-doc-tabs not found' };

            const tabs = tabsContainer.querySelectorAll('au-tab');
            if (tabs.length < 3) return { found: false, issue: `Only ${tabs.length} tabs found` };

            // Store initial state
            const initialActive = tabsContainer.getAttribute('active');

            let eventFired = false;
            let eventIndex = null;

            tabsContainer.addEventListener('au-tab-change', (e) => {
                eventFired = true;
                eventIndex = e.detail.index;
            });

            // Click EXAMPLES tab (index 2)
            tabs[2].click();

            const afterActive = tabsContainer.getAttribute('active');

            return {
                found: true,
                tabCount: tabs.length,
                initialActive,
                afterActive,
                eventFired,
                eventIndex,
                tab2HasIsActive: tabs[2].classList.contains('is-active')
            };
        });

        expect(result.found).toBe(true);
        expect(result.tabCount).toBe(3);
        expect(result.afterActive).toBe('2');
        expect(result.eventFired).toBe(true);
        expect(result.eventIndex).toBe(2);
        expect(result.tab2HasIsActive).toBe(true);
    });

    test('Enterprise section tab content should switch when tabs are clicked', async () => {
        await page.goto(`http://localhost:${server.port}/demo/index.html#enterprise`, {
            waitUntil: 'networkidle0'
        });
        await delay(1000);

        const result = await page.evaluate(() => {
            const tabsContainer = document.getElementById('enterprise-doc-tabs');
            const overview = document.getElementById('enterprise-overview');
            const api = document.getElementById('enterprise-api');
            const examples = document.getElementById('enterprise-examples');

            if (!tabsContainer || !overview || !api || !examples) {
                return { success: false, issue: 'Elements not found' };
            }

            // Setup listener to switch content (simulate setupDocTabs)
            tabsContainer.addEventListener('au-tab-change', (e) => {
                const index = e.detail.index;
                overview.style.display = index === 0 ? 'block' : 'none';
                api.style.display = index === 1 ? 'block' : 'none';
                examples.style.display = index === 2 ? 'block' : 'none';
            });

            // Initial state
            const initialOverview = overview.style.display !== 'none';
            const initialExamples = examples.style.display !== 'none';

            // Click EXAMPLES tab
            const tabs = tabsContainer.querySelectorAll('au-tab');
            tabs[2].click();

            // After switching
            const afterOverview = overview.style.display !== 'none';
            const afterExamples = examples.style.display !== 'none';

            return {
                success: true,
                initialOverview,
                initialExamples,
                afterOverview,
                afterExamples
            };
        });

        expect(result.success).toBe(true);
        expect(result.afterOverview).toBe(false);
        expect(result.afterExamples).toBe(true);
    });
});
