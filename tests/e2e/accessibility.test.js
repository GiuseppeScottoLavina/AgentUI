/**
 * @fileoverview E2E Accessibility Tests for AgentUI Components
 * 
 * These tests verify ARIA compliance to ensure accessibility requirements
 * are maintained across all form and interactive components.
 */

import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { launchBrowser, puppeteer } from './puppeteer-helper.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Accessibility E2E Tests', () => {
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

                // Default to accessibility test harness
                if (url.pathname === '/') {
                    filePath = join(__dirname, 'accessibility-harness.html');
                }

                try {
                    const file = Bun.file(filePath);
                    const exists = await file.exists();
                    if (!exists) {
                        return new Response('Not Found', { status: 404 });
                    }

                    const content = await file.text();
                    const ext = filePath.split('.').pop();
                    const mimeTypes = {
                        'html': 'text/html',
                        'js': 'text/javascript',
                        'css': 'text/css',
                        'png': 'image/png',
                        'ico': 'image/x-icon'
                    };

                    return new Response(content, {
                        headers: { 'Content-Type': mimeTypes[ext] || 'text/plain' }
                    });
                } catch (e) {
                    return new Response('Error: ' + e.message, { status: 500 });
                }
            }
        });

        browser = await launchBrowser({ testName: 'accessibility' });
        page = await browser.newPage();

        // Enable console logging for debugging
        page.on('console', msg => console.log('BROWSER:', msg.text()));
        page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

        await page.goto(`http://localhost:${server.port}`, { waitUntil: 'domcontentloaded' });

        // Wait for components to be ready with fallback
        try {
            await page.waitForFunction(() => window.testReady === true, { timeout: 15000 });
        } catch (e) {
            console.log('Timeout waiting for testReady, checking page state...');
            const hasTestReady = await page.evaluate(() => window.testReady);
            console.log('testReady:', hasTestReady);

            // Check if components loaded
            const hasCheckbox = await page.evaluate(() => !!document.querySelector('au-checkbox'));
            console.log('Has au-checkbox:', hasCheckbox);

            if (!hasCheckbox) {
                throw new Error('Components failed to load');
            }
            // If components exist, continue anyway
        }
    }, 60000);

    afterAll(async () => {
        if (browser) await browser.close();
        if (server) server.stop();
    });

    // ==========================================
    // au-input Tests
    // ==========================================
    describe('au-input Accessibility', () => {
        test('input with label should have associated label element', async () => {
            const result = await page.evaluate(() => {
                const input = document.querySelector('#test-input');
                const label = input.querySelector('label');
                const inputField = input.querySelector('input');
                return {
                    hasLabel: !!label,
                    isAssociated: label?.getAttribute('for') === inputField?.id
                };
            });
            expect(result.hasLabel).toBe(true);
            expect(result.isAssociated).toBe(true);
        });

        test('input with placeholder (no label) should use placeholder as visible label', async () => {
            const result = await page.evaluate(() => {
                const input = document.querySelector('#test-input-no-label');
                const inputField = input.querySelector('input');
                const label = input.querySelector('label');
                // Either has aria-label OR has associated visible label
                const hasAriaLabel = inputField?.getAttribute('aria-label');
                const hasVisibleLabel = label && label.getAttribute('for') === inputField?.id;
                return { hasAriaLabel: !!hasAriaLabel, hasVisibleLabel, isAccessible: !!(hasAriaLabel || hasVisibleLabel) };
            });
            // Should be accessible via visible label (placeholder becomes label text)
            expect(result.isAccessible).toBe(true);
        });
    });

    // ==========================================
    // au-textarea Tests
    // ==========================================
    describe('au-textarea Accessibility', () => {
        test('textarea should have aria-label', async () => {
            const ariaLabel = await page.evaluate(() => {
                const comp = document.querySelector('#test-textarea');
                const textarea = comp.querySelector('textarea');
                return textarea?.getAttribute('aria-label');
            });
            expect(ariaLabel).toBeTruthy();
        });
    });

    // ==========================================
    // au-checkbox Tests
    // ==========================================
    describe('au-checkbox Accessibility', () => {
        test('should have role="checkbox"', async () => {
            const role = await page.evaluate(() =>
                document.querySelector('#test-checkbox')?.getAttribute('role')
            );
            expect(role).toBe('checkbox');
        });

        test('should have aria-checked="false" when unchecked', async () => {
            const ariaChecked = await page.evaluate(() =>
                document.querySelector('#test-checkbox')?.getAttribute('aria-checked')
            );
            expect(ariaChecked).toBe('false');
        });

        test('should have aria-checked="true" when checked', async () => {
            const ariaChecked = await page.evaluate(() =>
                document.querySelector('#test-checkbox-checked')?.getAttribute('aria-checked')
            );
            expect(ariaChecked).toBe('true');
        });

        test('should have aria-checked="mixed" when indeterminate', async () => {
            const ariaChecked = await page.evaluate(() =>
                document.querySelector('#test-checkbox-indeterminate')?.getAttribute('aria-checked')
            );
            expect(ariaChecked).toBe('mixed');
        });

        test('should have aria-disabled="true" when disabled', async () => {
            const ariaDisabled = await page.evaluate(() =>
                document.querySelector('#test-checkbox-disabled')?.getAttribute('aria-disabled')
            );
            expect(ariaDisabled).toBe('true');
        });

        test('should have tabindex="0" when enabled', async () => {
            const tabindex = await page.evaluate(() =>
                document.querySelector('#test-checkbox')?.getAttribute('tabindex')
            );
            expect(tabindex).toBe('0');
        });

        test('should have tabindex="-1" when disabled', async () => {
            const tabindex = await page.evaluate(() =>
                document.querySelector('#test-checkbox-disabled')?.getAttribute('tabindex')
            );
            expect(tabindex).toBe('-1');
        });
    });

    // ==========================================
    // au-switch Tests
    // ==========================================
    describe('au-switch Accessibility', () => {
        test('should have role="switch"', async () => {
            const role = await page.evaluate(() =>
                document.querySelector('#test-switch')?.getAttribute('role')
            );
            expect(role).toBe('switch');
        });

        test('should have aria-checked="false" when off', async () => {
            const ariaChecked = await page.evaluate(() =>
                document.querySelector('#test-switch')?.getAttribute('aria-checked')
            );
            expect(ariaChecked).toBe('false');
        });

        test('should have aria-checked="true" when on', async () => {
            const ariaChecked = await page.evaluate(() =>
                document.querySelector('#test-switch-checked')?.getAttribute('aria-checked')
            );
            expect(ariaChecked).toBe('true');
        });

        test('should have aria-label from label attribute', async () => {
            const ariaLabel = await page.evaluate(() =>
                document.querySelector('#test-switch')?.getAttribute('aria-label')
            );
            expect(ariaLabel).toBe('Test Switch');
        });

        test('should have aria-disabled="true" when disabled', async () => {
            const ariaDisabled = await page.evaluate(() =>
                document.querySelector('#test-switch-disabled')?.getAttribute('aria-disabled')
            );
            expect(ariaDisabled).toBe('true');
        });

        test('should have tabindex="0" when enabled', async () => {
            const tabindex = await page.evaluate(() =>
                document.querySelector('#test-switch')?.getAttribute('tabindex')
            );
            expect(tabindex).toBe('0');
        });
    });

    // ==========================================
    // au-radio Tests
    // ==========================================
    describe('au-radio Accessibility', () => {
        test('radio-group should have role="radiogroup"', async () => {
            const role = await page.evaluate(() =>
                document.querySelector('#test-radio-group')?.getAttribute('role')
            );
            expect(role).toBe('radiogroup');
        });

        test('radio should have role="radio"', async () => {
            const role = await page.evaluate(() =>
                document.querySelector('#test-radio-a')?.getAttribute('role')
            );
            expect(role).toBe('radio');
        });

        test('selected radio should have aria-checked="true"', async () => {
            const ariaChecked = await page.evaluate(() =>
                document.querySelector('#test-radio-a')?.getAttribute('aria-checked')
            );
            expect(ariaChecked).toBe('true');
        });

        test('unselected radio should have aria-checked="false"', async () => {
            const ariaChecked = await page.evaluate(() =>
                document.querySelector('#test-radio-b')?.getAttribute('aria-checked')
            );
            expect(ariaChecked).toBe('false');
        });

        test('disabled radio should have aria-disabled="true"', async () => {
            const ariaDisabled = await page.evaluate(() =>
                document.querySelector('#test-radio-disabled')?.getAttribute('aria-disabled')
            );
            expect(ariaDisabled).toBe('true');
        });
    });

    // ==========================================
    // au-dropdown Tests
    // ==========================================
    describe('au-dropdown Accessibility', () => {
        test('trigger should have aria-haspopup="listbox"', async () => {
            const ariaHasPopup = await page.evaluate(() => {
                const dropdown = document.querySelector('#test-dropdown');
                const trigger = dropdown.querySelector('.au-dropdown__trigger');
                return trigger?.getAttribute('aria-haspopup');
            });
            expect(ariaHasPopup).toBe('listbox');
        });

        test('trigger should have aria-expanded="false" when closed', async () => {
            const ariaExpanded = await page.evaluate(() => {
                const dropdown = document.querySelector('#test-dropdown');
                const trigger = dropdown.querySelector('.au-dropdown__trigger');
                return trigger?.getAttribute('aria-expanded');
            });
            expect(ariaExpanded).toBe('false');
        });

        test('trigger should have aria-expanded="true" when open', async () => {
            const ariaExpanded = await page.evaluate(async () => {
                const dropdown = document.querySelector('#test-dropdown');
                dropdown.open();
                // Popover toggle event fires asynchronously
                await new Promise(r => setTimeout(r, 100));
                const trigger = dropdown.querySelector('.au-dropdown__trigger');
                const result = trigger?.getAttribute('aria-expanded');
                dropdown.close();
                return result;
            });
            expect(ariaExpanded).toBe('true');
        });

        test('trigger should have aria-label', async () => {
            const ariaLabel = await page.evaluate(() => {
                const dropdown = document.querySelector('#test-dropdown');
                const trigger = dropdown.querySelector('.au-dropdown__trigger');
                return trigger?.getAttribute('aria-label');
            });
            expect(ariaLabel).toBeTruthy();
        });

        test('menu should have role="listbox"', async () => {
            const role = await page.evaluate(() => {
                // Menu is rendered inside the dropdown component (popover handles top-layer)
                const dropdown = document.querySelector('#test-dropdown');
                const menu = dropdown?.querySelector('.au-dropdown__menu');
                return menu?.getAttribute('role');
            });
            expect(role).toBe('listbox');
        });
    });

    // ==========================================
    // au-button Tests
    // ==========================================
    describe('au-button Accessibility', () => {
        test('should have role="button"', async () => {
            const role = await page.evaluate(() =>
                document.querySelector('#test-button')?.getAttribute('role')
            );
            expect(role).toBe('button');
        });

        test('should have tabindex="0" when enabled', async () => {
            const tabindex = await page.evaluate(() =>
                document.querySelector('#test-button')?.getAttribute('tabindex')
            );
            expect(tabindex).toBe('0');
        });

        test('should have tabindex="-1" when disabled', async () => {
            const tabindex = await page.evaluate(() =>
                document.querySelector('#test-button-disabled')?.getAttribute('tabindex')
            );
            expect(tabindex).toBe('-1');
        });
    });

    // ==========================================
    // Keyboard Navigation Tests
    // ==========================================
    describe('Keyboard Navigation', () => {
        test('checkbox should respond to Space key', async () => {
            const result = await page.evaluate(() => {
                // Reset checkbox first
                const checkbox = document.querySelector('#test-checkbox');
                if (checkbox.hasAttribute('checked')) {
                    checkbox.removeAttribute('checked');
                }
                const initialState = checkbox.getAttribute('aria-checked');

                checkbox.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));

                const newState = checkbox.getAttribute('aria-checked');
                return { initial: initialState, after: newState };
            });

            expect(result.after).toBe('true');
        });

        test('switch should respond to Space key', async () => {
            const result = await page.evaluate(() => {
                // Reset switch first
                const sw = document.querySelector('#test-switch');
                if (sw.hasAttribute('checked')) {
                    sw.removeAttribute('checked');
                }
                const initialState = sw.getAttribute('aria-checked');

                sw.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));

                const newState = sw.getAttribute('aria-checked');
                return { initial: initialState, after: newState };
            });

            expect(result.after).toBe('true');
        });
    });
});
