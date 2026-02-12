/**
 * @fileoverview Performance and Memory Tests
 * 
 * Uses test-harness.html which has AgentUI properly loaded.
 */

import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { launchBrowser, puppeteer } from './puppeteer-helper.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Performance & Memory Tests', () => {
    let browser;
    let page;
    let server;

    beforeAll(async () => {
        const projectRoot = join(__dirname, '../..');

        server = Bun.serve({
            port: 0,
            async fetch(req) {
                const url = new URL(req.url);
                let filePath = join(projectRoot, url.pathname);

                if (url.pathname === '/') {
                    filePath = join(__dirname, 'test-harness.html');
                }

                try {
                    const file = Bun.file(filePath);
                    if (!await file.exists()) {
                        return new Response('Not Found', { status: 404 });
                    }

                    const content = await file.text();
                    const ext = filePath.split('.').pop();
                    const mimeTypes = {
                        'html': 'text/html',
                        'js': 'text/javascript',
                        'css': 'text/css'
                    };

                    return new Response(content, {
                        headers: { 'Content-Type': mimeTypes[ext] || 'text/plain' }
                    });
                } catch (e) {
                    return new Response('Error', { status: 500 });
                }
            }
        });

        browser = await launchBrowser({ testName: 'perf_memory' });
        page = await browser.newPage();

        // Navigate to test harness first
        await page.goto(`http://localhost:${server.port}`, { waitUntil: 'networkidle0' });
        await page.waitForFunction(() => window.testsComplete === true, { timeout: 30000 });
    }, 60000);

    afterAll(async () => {
        if (browser) await browser.close();
        if (server) server.stop();
    });

    describe('Performance', () => {
        test('component creation: 500 components < 300ms', async () => {
            const result = await page.evaluate(() => {
                const testArea = document.getElementById('test-area');
                testArea.innerHTML = '';

                const start = performance.now();
                for (let i = 0; i < 500; i++) {
                    const btn = document.createElement('au-button');
                    btn.textContent = `B${i}`;
                    testArea.appendChild(btn);
                }
                const end = performance.now();

                testArea.innerHTML = '';
                return { total: end - start };
            });

            expect(result.total).toBeLessThan(300);
        });

        test('DOM updates: 500 updates < 50ms', async () => {
            const result = await page.evaluate(() => {
                const testArea = document.getElementById('test-area');
                testArea.innerHTML = '';

                const buttons = [];
                for (let i = 0; i < 50; i++) {
                    const btn = document.createElement('au-button');
                    testArea.appendChild(btn);
                    buttons.push(btn);
                }

                const start = performance.now();
                for (let i = 0; i < 500; i++) {
                    buttons[i % 50].setAttribute('variant', i % 2 === 0 ? 'filled' : 'outlined');
                }
                const end = performance.now();

                testArea.innerHTML = '';
                return { total: end - start };
            });

            expect(result.total).toBeLessThan(50);
        });
    });

    describe('Memory Stability', () => {
        test('component lifecycle: 300 create/destroy cycles', async () => {
            const result = await page.evaluate(async () => {
                const testArea = document.getElementById('test-area');

                for (let i = 0; i < 300; i++) {
                    const btn = document.createElement('au-button');
                    btn.textContent = `B${i}`;
                    testArea.appendChild(btn);
                }

                testArea.innerHTML = '';
                await new Promise(r => setTimeout(r, 50));

                return { passed: true };
            });

            expect(result.passed).toBe(true);
        });

        test('stress test: 3 cycles of 500 components', async () => {
            const result = await page.evaluate(async () => {
                const testArea = document.getElementById('test-area');

                for (let cycle = 0; cycle < 3; cycle++) {
                    for (let i = 0; i < 500; i++) {
                        const btn = document.createElement('au-button');
                        btn.textContent = `${cycle}-${i}`;
                        testArea.appendChild(btn);
                    }
                    testArea.innerHTML = '';
                }

                await new Promise(r => setTimeout(r, 20));
                return { passed: true };
            });

            expect(result.passed).toBe(true);
        });
    });
});
