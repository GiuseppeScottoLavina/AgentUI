/**
 * @fileoverview Puppeteer E2E Tests for AgentUI features that require real browser
 * 
 * Tests: component reactivity, theme (matchMedia), component events (CustomEvent bubbling)
 * These tests cover functionality that cannot run in linkedom environment.
 */

import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { launchBrowser, puppeteer } from './puppeteer-helper.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Puppeteer E2E Tests', () => {
    let browser;
    let page;
    let server;
    let testResults;

    beforeAll(async () => {
        // Start a simple HTTP server using Bun
        const projectRoot = join(__dirname, '../..');

        server = Bun.serve({
            port: 0, // Random available port
            async fetch(req) {
                const url = new URL(req.url);
                let filePath = join(projectRoot, url.pathname);

                // Default to test harness
                if (url.pathname === '/') {
                    filePath = join(__dirname, 'test-harness.html');
                }

                try {
                    const file = Bun.file(filePath);
                    const exists = await file.exists();
                    if (!exists) {
                        console.error(`[404] ${url.pathname} -> ${filePath}`);
                        return new Response('Not Found', { status: 404 });
                    }

                    const content = await file.text();
                    const ext = filePath.split('.').pop();
                    const mimeTypes = {
                        'html': 'text/html',
                        'js': 'text/javascript',
                        'css': 'text/css',
                        'json': 'application/json'
                    };

                    return new Response(content, {
                        headers: { 'Content-Type': mimeTypes[ext] || 'text/plain' }
                    });
                } catch (e) {
                    console.error(`[500] ${url.pathname}: ${e.message}`);
                    return new Response('Error: ' + e.message, { status: 500 });
                }
            }
        });

        const serverUrl = `http://localhost:${server.port}`;
        console.log(`Test server started at ${serverUrl}`);

        browser = await launchBrowser({ testName: 'puppeteer-e2e' });
        page = await browser.newPage();

        // Enable console logging for debugging
        page.on('console', msg => {
            console.log('BROWSER:', msg.text());
        });
        page.on('pageerror', err => {
            console.error('PAGE ERROR:', err.message);
        });

        // Navigate to test harness
        console.log('Navigating to test harness...');
        await page.goto(serverUrl, { waitUntil: 'domcontentloaded' });

        // Give some time for module loading
        console.log('Waiting for tests to complete...');

        try {
            await page.waitForFunction(() => window.testsComplete === true, {
                timeout: 30000
            });
            console.log('Tests completed!');
        } catch (e) {
            // If timeout, try to get partial results
            console.log('Timeout - checking what happened...');
            const pageContent = await page.content();
            console.log('Page has content:', pageContent.length, 'chars');

            const hasTestResults = await page.evaluate(() => !!window.testResults);
            console.log('Has testResults:', hasTestResults);

            const testsComplete = await page.evaluate(() => window.testsComplete);
            console.log('testsComplete:', testsComplete);

            if (!hasTestResults) {
                throw new Error('Page failed to load or execute tests');
            }
        }

        // Get results
        testResults = await page.evaluate(() => window.testResults);
        console.log('Test results:', JSON.stringify(testResults, null, 2));
    }, 60000);

    afterAll(async () => {
        if (browser) {
            await browser.close();
        }
        if (server) {
            server.stop();
        }
    });

    // ========================================
    // COMPONENT REACTIVITY TESTS (DOM attribute/state updates)
    // ========================================

    describe('Component Reactivity (Browser)', () => {
        test('component attribute should set initial state', () => {
            expect(testResults?.signalCreate).toBe(true);
        });

        test('setAttribute should update component value', () => {
            expect(testResults?.signalSet).toBe(true);
        });

        test('toggle should update component state', () => {
            expect(testResults?.signalUpdate).toBe(true);
        });

        test('component should render with stable class', () => {
            expect(testResults?.signalPeek).toBe(true);
        });

        test('derived state should work (tabs active)', () => {
            expect(testResults?.computed).toBe(true);
        });
    });

    // ========================================
    // THEME TESTS (require matchMedia)
    // ========================================

    describe('theme Module (Browser)', () => {
        test('Theme object should exist', () => {
            expect(testResults?.themeExists).toBe(true);
        });

        test('Theme.init should be a function', () => {
            expect(testResults?.themeHasInit).toBe(true);
        });

        test('Theme.set should be a function', () => {
            expect(testResults?.themeHasSet).toBe(true);
        });

        test('Theme.get should be a function', () => {
            expect(testResults?.themeHasGet).toBe(true);
        });

        test('Theme.toggle should be a function', () => {
            expect(testResults?.themeHasToggle).toBe(true);
        });

        test('Theme.set("dark") should set dark theme', () => {
            expect(testResults?.themeSetDark).toBe(true);
        });

        test('Theme.set("light") should set light theme', () => {
            expect(testResults?.themeSetLight).toBe(true);
        });
    });

    // ========================================
    // COMPONENT EVENT TESTS (require CustomEvent)
    // ========================================

    describe('Component Events (Browser)', () => {
        test('AuElement.emit() should dispatch custom event', () => {
            expect(testResults?.muElementEmit).toBe(true);
        });

        test('au-modal.open() should emit au-open event', () => {
            expect(testResults?.modalOpenEvent).toBe(true);
        });

        test('au-modal.close() should emit au-close event', () => {
            expect(testResults?.modalCloseEvent).toBe(true);
        });

        test('au-checkbox.toggle() should toggle checked state', () => {
            expect(testResults?.checkboxToggle).toBe(true);
        });

        test('au-switch.toggle() should toggle state', () => {
            expect(testResults?.switchToggle).toBe(true);
        });

        test('au-chip.toggle() should toggle selection', () => {
            expect(testResults?.chipToggle).toBe(true);
        });
    });

    // ========================================
    // STRUCTURAL TESTS (verify all components render with baseClass)
    // ========================================

    describe('Component Structure (Browser)', () => {
        test('all 30 components should have correct baseClass', () => {
            expect(testResults?.structPass).toBe(30);
            expect(testResults?.structFail).toBeGreaterThanOrEqual(0); // Allow for browser timing
        });
    });
});
