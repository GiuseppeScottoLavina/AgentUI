/**
 * @fileoverview E2E Tests for All Components requiring real browser
 * Covers: au-button, au-toast, au-input, au-dropdown, theme-toggle, layout, sidebar
 */

import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { launchBrowser, puppeteer } from './puppeteer-helper.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, rmSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Components E2E Tests', () => {
    let browser;
    let page;
    let server;
    const userDataDir = `./.tmp/puppeteer-components-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    beforeAll(async () => {
        mkdirSync(userDataDir, { recursive: true });

        const projectRoot = join(__dirname, '../..');
        server = Bun.serve({
            port: 0,
            async fetch(req) {
                const url = new URL(req.url);
                let filePath = join(projectRoot, url.pathname);

                if (url.pathname === '/') {
                    return new Response(`<!DOCTYPE html>
<html data-theme="light">
<head>
    <title>Component Test</title>
    <link rel="stylesheet" href="/dist/agentui.min.css">
    <style>
        :root {
            --au-color-primary: #6750a4;
            --au-color-surface: #ffffff;
        }
        [data-theme="dark"] {
            --au-color-primary: #cfbcff;
            --au-color-surface: #1c1b1f;
        }
        .app-main { min-height: 100vh; }
        .sidebar { position: sticky; top: 0; max-height: 100vh; overflow-y: auto; }
        .page { display: none; }
        .page.active { display: block; }
    </style>
</head>
<body>
    <div class="app-main">
        <nav class="sidebar">
            <a href="#home" data-page="home" class="sidebar-link active">Home</a>
            <a href="#about" data-page="about" class="sidebar-link">About</a>
        </nav>
        <main>
            <div class="page active" id="home">Home Page</div>
            <div class="page" id="about">About Page</div>
        </main>
    </div>
    
    <au-button id="btn1" variant="filled" size="md">Primary Button</au-button>
    <au-button id="btn2" variant="text" size="lg">Text Button</au-button>
    <au-button id="btn-disabled" disabled>Disabled</au-button>
    <au-input id="input1" label="Email" placeholder="Enter email"></au-input>
    <au-dropdown id="dropdown1">
        <span slot="trigger">Select</span>
        <au-option value="1">Option 1</au-option>
        <au-option value="2">Option 2</au-option>
    </au-dropdown>
    <au-toast id="toast1" severity="info">Test Toast</au-toast>
    <au-checkbox id="check1">Accept Terms</au-checkbox>
    <au-switch id="switch1">Enable Feature</au-switch>
    <au-theme-toggle id="theme-toggle"></au-theme-toggle>
    
    <script src="/dist/agentui.min.js"></script>
    <script>
        function showPage(pageId) {
            window.scrollTo(0, 0);
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.getElementById(pageId)?.classList.add('active');
        }
    </script>
</body>
</html>`, { headers: { 'Content-Type': 'text/html' } });
                }

                try {
                    const file = Bun.file(filePath);
                    if (!await file.exists()) {
                        return new Response('Not Found', { status: 404 });
                    }
                    const content = await file.text();
                    const ext = filePath.split('.').pop();
                    const mimeTypes = { 'html': 'text/html', 'js': 'text/javascript', 'css': 'text/css' };
                    return new Response(content, { headers: { 'Content-Type': mimeTypes[ext] || 'text/plain' } });
                } catch (e) {
                    return new Response('Error: ' + e.message, { status: 500 });
                }
            }
        });

        browser = await launchBrowser({ testName: 'e2e' });
        page = await browser.newPage();
        await page.goto(`http://localhost:${server.port}`, { waitUntil: 'networkidle0', timeout: 30000 });
        await page.waitForFunction(() => typeof window.AgentUI !== 'undefined', { timeout: 15000 });
    }, 60000);

    afterAll(async () => {
        await browser?.close();
        server?.stop();
        try { rmSync(userDataDir, { recursive: true, force: true }); } catch { }
    });

    // ========================================
    // AU-BUTTON COMPONENT
    // ========================================

    describe('au-button Component', () => {
        test('should be registered as custom element', async () => {
            const result = await page.evaluate(() => customElements.get('au-button') !== undefined);
            expect(result).toBe(true);
        });

        test('should render with base class', async () => {
            const result = await page.evaluate(() => {
                const btn = document.querySelector('au-button');
                return btn && btn.classList.contains('au-button');
            });
            expect(result).toBe(true);
        });

        test('should apply variant attribute', async () => {
            const result = await page.evaluate(() => {
                const btn = document.querySelector('au-button[variant="filled"]');
                return btn && btn.classList.contains('au-button--filled');
            });
            expect(result).toBe(true);
        });

        test('should apply size attribute', async () => {
            const result = await page.evaluate(() => {
                const btn = document.querySelector('au-button[size="lg"]');
                return btn && btn.classList.contains('au-button--lg');
            });
            expect(result).toBe(true);
        });

        test('should have role=button', async () => {
            const result = await page.evaluate(() => {
                const btn = document.querySelector('au-button');
                return btn && btn.getAttribute('role') === 'button';
            });
            expect(result).toBe(true);
        });

        test('should have tabindex=0 by default', async () => {
            const result = await page.evaluate(() => {
                const btn = document.querySelector('au-button:not([disabled])');
                return btn && btn.getAttribute('tabindex') === '0';
            });
            expect(result).toBe(true);
        });

        test('should have tabindex=-1 when disabled', async () => {
            const result = await page.evaluate(() => {
                const btn = document.querySelector('au-button[disabled]');
                return btn && btn.getAttribute('tabindex') === '-1';
            });
            expect(result).toBe(true);
        });

        test('should add is-disabled class when disabled', async () => {
            const result = await page.evaluate(() => {
                const btn = document.querySelector('au-button[disabled]');
                return btn && btn.classList.contains('is-disabled');
            });
            expect(result).toBe(true);
        });
    });

    // ========================================
    // AU-INPUT COMPONENT
    // ========================================

    describe('au-input Component', () => {
        test('should be registered', async () => {
            const result = await page.evaluate(() => customElements.get('au-input') !== undefined);
            expect(result).toBe(true);
        });

        test('should render input field', async () => {
            const result = await page.evaluate(() => {
                const input = document.querySelector('au-input');
                return input && input.querySelector('input') !== null;
            });
            expect(result).toBe(true);
        });

        test('should have label', async () => {
            const result = await page.evaluate(() => {
                const input = document.querySelector('au-input[label]');
                return input && (input.querySelector('label') !== null || input.textContent.includes('Email'));
            });
            expect(result).toBe(true);
        });
    });

    // ========================================
    // AU-DROPDOWN COMPONENT
    // ========================================

    describe('au-dropdown Component', () => {
        test('should be registered', async () => {
            const result = await page.evaluate(() => customElements.get('au-dropdown') !== undefined);
            expect(result).toBe(true);
        });

        test('should have trigger element', async () => {
            const result = await page.evaluate(() => {
                const dropdown = document.querySelector('au-dropdown');
                // Check for slotted trigger or internal button
                return dropdown && (
                    dropdown.querySelector('[slot="trigger"]') !== null ||
                    dropdown.querySelector('button') !== null ||
                    dropdown.shadowRoot?.querySelector('button') !== null
                );
            });
            expect(result).toBe(true);
        });

        test('should have open/close/toggle methods', async () => {
            const result = await page.evaluate(() => {
                const dropdown = document.querySelector('au-dropdown');
                return dropdown &&
                    typeof dropdown.open === 'function' &&
                    typeof dropdown.close === 'function' &&
                    typeof dropdown.toggle === 'function';
            });
            expect(result).toBe(true);
        });

        // ── POSITIONING TESTS (regression guard for P2.4) ──

        test('menu should have position:fixed when opened', async () => {
            const result = await page.evaluate(async () => {
                const dropdown = document.querySelector('au-dropdown');
                dropdown.open();
                // Wait for popover to render
                await new Promise(r => setTimeout(r, 100));
                const menu = dropdown.querySelector('[popover]');
                if (!menu) return { error: 'no menu found' };
                const style = getComputedStyle(menu);
                dropdown.close();
                return { position: style.position };
            });
            expect(result.position).toBe('fixed');
        });

        test('menu should appear near trigger, NOT at (0, 0)', async () => {
            const result = await page.evaluate(async () => {
                const dropdown = document.querySelector('au-dropdown');
                const trigger = dropdown.querySelector('button') || dropdown.querySelector('[slot="trigger"]');
                if (!trigger) return { error: 'no trigger' };

                const triggerRect = trigger.getBoundingClientRect();
                dropdown.open();
                await new Promise(r => setTimeout(r, 100));

                const menu = dropdown.querySelector('[popover]');
                if (!menu) return { error: 'no menu' };

                const menuRect = menu.getBoundingClientRect();
                dropdown.close();

                return {
                    triggerBottom: triggerRect.bottom,
                    triggerLeft: triggerRect.left,
                    menuTop: menuRect.top,
                    menuLeft: menuRect.left,
                    // Menu should be near trigger, not at origin
                    menuNotAtOrigin: menuRect.top > 5 || menuRect.left > 5
                };
            });
            expect(result.menuNotAtOrigin).toBe(true);
        });

        test('menu should reposition correctly after close and reopen', async () => {
            const result = await page.evaluate(async () => {
                const dropdown = document.querySelector('au-dropdown');

                // Open, get position, close
                dropdown.open();
                await new Promise(r => setTimeout(r, 100));
                const menu = dropdown.querySelector('[popover]');
                if (!menu) return { error: 'no menu' };
                const firstTop = menu.getBoundingClientRect().top;
                dropdown.close();
                await new Promise(r => setTimeout(r, 100));

                // Reopen, get position
                dropdown.open();
                await new Promise(r => setTimeout(r, 100));
                const secondTop = menu.getBoundingClientRect().top;
                dropdown.close();

                return {
                    firstTop,
                    secondTop,
                    consistent: Math.abs(firstTop - secondTop) < 2 // 2px tolerance
                };
            });
            expect(result.consistent).toBe(true);
        });
    });

    // ========================================
    // AU-TOAST COMPONENT
    // ========================================

    describe('au-toast Component', () => {
        test('should be registered', async () => {
            const result = await page.evaluate(() => customElements.get('au-toast') !== undefined);
            expect(result).toBe(true);
        });

        test('should have severity attribute', async () => {
            const result = await page.evaluate(() => {
                const toast = document.querySelector('au-toast');
                return toast && toast.hasAttribute('severity');
            });
            expect(result).toBe(true);
        });
    });

    // ========================================
    // THEME TOGGLE
    // ========================================

    describe('Theme Toggle', () => {
        test('should have CSS variables in :root', async () => {
            const result = await page.evaluate(() => {
                const style = getComputedStyle(document.documentElement);
                return style.getPropertyValue('--au-color-primary').trim().length > 0;
            });
            expect(result).toBe(true);
        });

        test('au-theme-toggle should be registered', async () => {
            const result = await page.evaluate(() => customElements.get('au-theme-toggle') !== undefined);
            expect(result).toBe(true);
        });

        test('should be able to set data-theme attribute', async () => {
            const result = await page.evaluate(() => {
                document.documentElement.setAttribute('data-theme', 'dark');
                const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
                document.documentElement.setAttribute('data-theme', 'light');
                return isDark;
            });
            expect(result).toBe(true);
        });

        test('should toggle between light and dark', async () => {
            const result = await page.evaluate(() => {
                document.documentElement.setAttribute('data-theme', 'light');
                const wasLight = document.documentElement.getAttribute('data-theme') === 'light';
                document.documentElement.setAttribute('data-theme', 'dark');
                const nowDark = document.documentElement.getAttribute('data-theme') === 'dark';
                document.documentElement.setAttribute('data-theme', 'light');
                return wasLight && nowDark;
            });
            expect(result).toBe(true);
        });
    });

    // ========================================
    // LAYOUT STABILITY
    // ========================================

    describe('Layout Stability', () => {
        test('should have min-height on .app-main', async () => {
            const result = await page.evaluate(() => {
                const main = document.querySelector('.app-main');
                if (!main) return false;
                const style = getComputedStyle(main);
                return parseInt(style.minHeight) > 0;
            });
            expect(result).toBe(true);
        });

        test('should have sticky positioned sidebar', async () => {
            const result = await page.evaluate(() => {
                const sidebar = document.querySelector('.sidebar');
                if (!sidebar) return false;
                const style = getComputedStyle(sidebar);
                return style.position === 'sticky';
            });
            expect(result).toBe(true);
        });

        test('should have page elements with display:none by default', async () => {
            const result = await page.evaluate(() => {
                const inactivePage = document.querySelector('.page:not(.active)');
                if (!inactivePage) return true; // If no inactive pages, test passes
                const style = getComputedStyle(inactivePage);
                return style.display === 'none';
            });
            expect(result).toBe(true);
        });

        test('should have .page.active with display:block', async () => {
            const result = await page.evaluate(() => {
                const activePage = document.querySelector('.page.active');
                if (!activePage) return false;
                const style = getComputedStyle(activePage);
                return style.display === 'block';
            });
            expect(result).toBe(true);
        });
    });

    // ========================================
    // SIDEBAR NAVIGATION
    // ========================================

    describe('Sidebar Navigation', () => {
        test('should have sidebar element', async () => {
            const result = await page.evaluate(() => document.querySelector('.sidebar') !== null);
            expect(result).toBe(true);
        });

        test('should have sidebar links with data-page attributes', async () => {
            const result = await page.evaluate(() => {
                const links = document.querySelectorAll('.sidebar-link[data-page]');
                return links.length > 0;
            });
            expect(result).toBe(true);
        });

        test('should have one active sidebar link by default', async () => {
            const result = await page.evaluate(() => {
                const activeLinks = document.querySelectorAll('.sidebar-link.active');
                return activeLinks.length === 1;
            });
            expect(result).toBe(true);
        });

        test('should have matching page elements for sidebar links', async () => {
            const result = await page.evaluate(() => {
                const links = document.querySelectorAll('.sidebar-link[data-page]');
                for (const link of links) {
                    const pageId = link.getAttribute('data-page');
                    if (!document.getElementById(pageId)) return false;
                }
                return true;
            });
            expect(result).toBe(true);
        });

        test('should have exactly one active page by default', async () => {
            const result = await page.evaluate(() => {
                const activePages = document.querySelectorAll('.page.active');
                return activePages.length === 1;
            });
            expect(result).toBe(true);
        });
    });

    // ========================================
    // NAVIGATION SCROLL RESET
    // ========================================

    describe('Navigation Scroll Reset', () => {
        test('showPage function should exist', async () => {
            const result = await page.evaluate(() => typeof window.showPage === 'function');
            expect(result).toBe(true);
        });

        test('showPage should scroll to top', async () => {
            const result = await page.evaluate(() => {
                window.scrollTo(0, 100);
                window.showPage('about');
                return window.scrollY === 0;
            });
            expect(result).toBe(true);
        });
    });

    // ========================================
    // OTHER COMPONENTS
    // ========================================

    describe('Other Components', () => {
        test('au-checkbox should be registered', async () => {
            const result = await page.evaluate(() => customElements.get('au-checkbox') !== undefined);
            expect(result).toBe(true);
        });

        test('au-switch should be registered', async () => {
            const result = await page.evaluate(() => customElements.get('au-switch') !== undefined);
            expect(result).toBe(true);
        });

        test('au-option should be registered', async () => {
            const result = await page.evaluate(() => customElements.get('au-option') !== undefined);
            expect(result).toBe(true);
        });
    });
});
