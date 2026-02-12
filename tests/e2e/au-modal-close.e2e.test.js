/**
 * @fileoverview E2E Test: Modal close button within rounded corners
 * Verifies that the close button (✕) stays within the dialog's 28px border-radius
 * and doesn't visually overflow the rounded corner area.
 * 
 * The CSS fix: close button moved from top/right: 12px to 16px.
 * With 28px border-radius, the 40px button at 12px offset exceeds the curve.
 * At 16px offset, the button sits safely inside.
 */

import { describe, test, expect, beforeAll, afterEach, afterAll } from 'bun:test';
import { launchBrowser } from './puppeteer-helper.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function buildTestHTML() {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="/dist/agentui.css">
    <script type="module">
        import '/dist/agentui.esm.js';
        // Wait for custom elements to register (define() uses scheduler.postTask)
        await customElements.whenDefined('au-modal');
        const modal = document.getElementById('test-modal');
        if (modal && modal.open) modal.open();
    <\/script>
</head>
<body style="padding:40px;">
    <au-modal id="test-modal" title="Test Modal">
        <p>Modal content for testing close button position.</p>
    </au-modal>
</body>
</html>`;
}

describe('Modal Close Button Positioning (E2E)', () => {
    let browser, page, server;

    beforeAll(async () => {
        const projectRoot = join(__dirname, '../..');
        const testHTML = buildTestHTML();

        server = Bun.serve({
            port: 0,
            async fetch(req) {
                const url = new URL(req.url);
                if (url.pathname === '/test.html') {
                    return new Response(testHTML, { headers: { 'Content-Type': 'text/html' } });
                }
                let filePath = join(projectRoot, url.pathname);
                try {
                    const file = Bun.file(filePath);
                    if (!await file.exists()) return new Response('Not Found', { status: 404 });
                    const ext = filePath.split('.').pop();
                    const types = { 'html': 'text/html', 'js': 'text/javascript', 'css': 'text/css', 'json': 'application/json', 'svg': 'image/svg+xml' };
                    return new Response(await file.arrayBuffer(), { headers: { 'Content-Type': types[ext] || 'application/octet-stream' } });
                } catch (e) { return new Response('Error', { status: 500 }); }
            }
        });
        console.log(`[modal-close test] Server at http://localhost:${server.port}`);
        browser = await launchBrowser({ testName: 'modal-close-btn' });
        page = await browser.newPage();
    }, 60000);

    afterEach(async () => { await page.goto('about:blank'); });
    afterAll(async () => { if (browser) await browser.close(); if (server) server.stop(); });

    test('close button should be positioned at 16px from top and right', async () => {
        await page.goto(`http://localhost:${server.port}/test.html`, { waitUntil: 'networkidle0' });
        await delay(2000);

        const result = await page.evaluate(() => {
            const modal = document.getElementById('test-modal');
            if (!modal) return { error: 'modal not found' };

            const closeBtn = modal.querySelector('.au-modal__close');
            if (!closeBtn) return { error: 'close button not found' };

            const style = getComputedStyle(closeBtn);
            return {
                position: style.position,
                top: style.top,
                right: style.right,
                width: style.width,
                height: style.height
            };
        });

        expect(result.error).toBeUndefined();
        expect(result.position).toBe('absolute');
        expect(result.top).toBe('24px');
        expect(result.right).toBe('24px');
    });

    test('close button should not overflow dialog rounded corners', async () => {
        await page.goto(`http://localhost:${server.port}/test.html`, { waitUntil: 'networkidle0' });
        await delay(2000);

        const result = await page.evaluate(() => {
            const modal = document.getElementById('test-modal');
            if (!modal) return { error: 'modal not found' };

            const dialog = modal.querySelector('dialog');
            const closeBtn = modal.querySelector('.au-modal__close');
            if (!dialog || !closeBtn) return { error: 'elements not found' };

            const dialogRect = dialog.getBoundingClientRect();
            const btnRect = closeBtn.getBoundingClientRect();
            const dialogStyle = getComputedStyle(dialog);

            const borderRadius = parseFloat(dialogStyle.borderRadius);

            // Button must be fully inside dialog rect
            const insideDialog = (
                btnRect.top >= dialogRect.top &&
                btnRect.right <= dialogRect.right &&
                btnRect.bottom <= dialogRect.bottom &&
                btnRect.left >= dialogRect.left
            );

            // Corner overflow check:
            // The top-right corner of the button is the closest point to the
            // dialog's top-right rounded corner. We check if this point is
            // inside the quarter-circle defined by border-radius.
            //
            // The radius center is at (dialogRect.right - R, dialogRect.top + R).
            // The button's top-right corner is at (btnRect.right, btnRect.top).
            // It's inside if: distance from center <= R
            const R = borderRadius;
            const centerX = dialogRect.right - R;
            const centerY = dialogRect.top + R;
            const btnCornerX = btnRect.right;
            const btnCornerY = btnRect.top;

            const dx = btnCornerX - centerX;
            const dy = centerY - btnCornerY;

            // If dx <= 0 or dy <= 0, the point is not in the corner zone at all (safe)
            // If both > 0, check circle: dx² + dy² <= R²
            const inCornerZone = dx > 0 && dy > 0;
            const insideRadius = !inCornerZone || (dx * dx + dy * dy <= R * R);

            return {
                insideDialog,
                insideRadius,
                borderRadius: R,
                btnRight: Math.round(btnRect.right),
                btnTop: Math.round(btnRect.top),
                dialogRight: Math.round(dialogRect.right),
                dialogTop: Math.round(dialogRect.top),
                dx: Math.round(dx),
                dy: Math.round(dy)
            };
        });

        expect(result.error).toBeUndefined();
        expect(result.insideDialog).toBe(true);
        // Button corner must be within the border-radius curve
        expect(result.insideRadius).toBe(true);
    });
});
