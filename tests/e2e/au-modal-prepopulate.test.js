/**
 * @fileoverview E2E test for modal pre-population pattern
 * 
 * Verifies that:
 * - au-open event fires after dialog is rendered
 * - dropdown.select() works inside au-open handler
 * - Event delegation works for buttons inside modals
 */

import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { launchBrowser } from './puppeteer-helper.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('au-modal Pre-population E2E Tests', () => {
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
    <link rel="stylesheet" href="/dist/agentui.css">
</head>
<body>
<au-modal id="edit-modal" size="sm">
    <h3>Edit Task</h3>
    <au-input id="task-name" label="Name" value=""></au-input>
    <au-dropdown id="priority-dd" placeholder="Priority">
        <au-option value="low">Low</au-option>
        <au-option value="medium">Medium</au-option>
        <au-option value="high">High</au-option>
    </au-dropdown>
    <au-button id="save-btn" variant="filled">Save</au-button>
</au-modal>

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

        browser = await launchBrowser({ testName: 'modal-prepopulate' });
        page = await browser.newPage();

        await page.goto(`http://localhost:${server.port}/`, { waitUntil: 'networkidle0' });
        await page.waitForFunction(() => window._testReady === true, { timeout: 10000 });
    }, 30000);

    afterAll(async () => {
        if (page) await page.close().catch(() => { });
        if (browser) await browser.close().catch(() => { });
        if (server) server.stop();
    });

    test('au-open fires after modal.open()', async () => {
        const result = await page.evaluate(() => {
            return new Promise(resolve => {
                const modal = document.getElementById('edit-modal');

                modal.addEventListener('au-open', () => {
                    // Check dialog is actually open
                    const dialog = modal.querySelector('dialog');
                    resolve({
                        dialogOpen: dialog?.open === true,
                        dialogExists: !!dialog
                    });
                }, { once: true });

                modal.open();
            });
        });

        expect(result.dialogExists).toBe(true);
        expect(result.dialogOpen).toBe(true);

        // Close for next test
        await page.evaluate(() => document.getElementById('edit-modal').close());
        await new Promise(r => setTimeout(r, 300));
    });

    test('dropdown.select() works inside au-open handler', async () => {
        const result = await page.evaluate(() => {
            return new Promise(resolve => {
                const modal = document.getElementById('edit-modal');

                modal.addEventListener('au-open', () => {
                    const dd = modal.querySelector('#priority-dd');
                    dd.select('high', 'High');

                    // Let the select process
                    setTimeout(() => {
                        resolve({
                            value: dd.value,
                            attribute: dd.getAttribute('value'),
                            displayText: dd.querySelector('.au-dropdown__value')?.textContent
                        });
                    }, 50);
                }, { once: true });

                modal.open();
            });
        });

        expect(result.value).toBe('high');
        expect(result.attribute).toBe('high');
        expect(result.displayText).toBe('High');

        await page.evaluate(() => document.getElementById('edit-modal').close());
        await new Promise(r => setTimeout(r, 300));
    });

    test('au-input.value can be set inside au-open handler', async () => {
        const result = await page.evaluate(() => {
            return new Promise(resolve => {
                const modal = document.getElementById('edit-modal');

                modal.addEventListener('au-open', () => {
                    const input = modal.querySelector('#task-name');
                    input.value = 'Edit: Buy groceries';

                    setTimeout(() => {
                        resolve({
                            value: input.value
                        });
                    }, 50);
                }, { once: true });

                modal.open();
            });
        });

        expect(result.value).toBe('Edit: Buy groceries');

        await page.evaluate(() => document.getElementById('edit-modal').close());
        await new Promise(r => setTimeout(r, 300));
    });

    test('event delegation works for buttons inside modal', async () => {
        const result = await page.evaluate(() => {
            return new Promise(resolve => {
                const modal = document.getElementById('edit-modal');

                // Event delegation on modal — the CORRECT pattern
                modal.addEventListener('click', (e) => {
                    const btn = e.target.closest('#save-btn');
                    if (btn) {
                        resolve({ saveClicked: true, buttonId: btn.id });
                    }
                }, { once: true });

                modal.addEventListener('au-open', () => {
                    // Click the save button after modal opens
                    setTimeout(() => {
                        const saveBtn = modal.querySelector('#save-btn');
                        saveBtn?.click();
                    }, 100);
                }, { once: true });

                modal.open();
            });
        });

        expect(result.saveClicked).toBe(true);
        expect(result.buttonId).toBe('save-btn');
    });
});
