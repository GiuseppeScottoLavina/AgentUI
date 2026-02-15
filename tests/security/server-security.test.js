/**
 * @fileoverview Server Security Tests
 * 
 * Tests that server.js returns proper security headers on all responses.
 * Requires the dev server to be running on port 5001.
 */

import { describe, test, expect, beforeAll } from 'bun:test';

const BASE_URL = 'http://localhost:5001';

// Required security headers and their expected values
const REQUIRED_SECURITY_HEADERS = {
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'permissions-policy': 'camera=(), microphone=(), geolocation=()',
    'cross-origin-opener-policy': 'same-origin',
};

/**
 * Helper: check that a response has all required security headers
 */
function assertSecurityHeaders(response, context) {
    for (const [header, expectedValue] of Object.entries(REQUIRED_SECURITY_HEADERS)) {
        const actual = response.headers.get(header);
        expect(actual).toBe(expectedValue);
    }
}

describe('Server Security Headers', () => {
    let serverAvailable = false;

    beforeAll(async () => {
        try {
            const res = await fetch(`${BASE_URL}/-/health`);
            serverAvailable = res.ok;
        } catch {
            serverAvailable = false;
        }
        if (!serverAvailable) {
            console.warn('⚠️ Dev server not running on port 5001. Skipping server security tests.');
        }
    });

    test('HTML page should include all security headers', async () => {
        if (!serverAvailable) return;
        const res = await fetch(`${BASE_URL}/demo/index.html`);
        assertSecurityHeaders(res, 'HTML page');
    });

    test('CSS file should include all security headers', async () => {
        if (!serverAvailable) return;
        const res = await fetch(`${BASE_URL}/dist/agentui.css`);
        assertSecurityHeaders(res, 'CSS file');
    });

    test('JS file should include all security headers', async () => {
        if (!serverAvailable) return;
        const res = await fetch(`${BASE_URL}/dist/agentui.esm.js`);
        assertSecurityHeaders(res, 'JS file');
    });

    test('JSON endpoint should include security headers', async () => {
        if (!serverAvailable) return;
        const res = await fetch(`${BASE_URL}/-/health`);
        assertSecurityHeaders(res, 'JSON health endpoint');
    });

    test('robots.txt should include security headers', async () => {
        if (!serverAvailable) return;
        const res = await fetch(`${BASE_URL}/robots.txt`);
        assertSecurityHeaders(res, 'robots.txt');
    });

    test('clear-cache endpoint should include security headers', async () => {
        if (!serverAvailable) return;
        const res = await fetch(`${BASE_URL}/-/clear-cache`);
        assertSecurityHeaders(res, 'clear-cache');
    });

    test('404 response should include security headers', async () => {
        if (!serverAvailable) return;
        const res = await fetch(`${BASE_URL}/nonexistent-totally-fake-path-12345`);
        expect(res.status).toBe(404);
        // 404 should also have security headers
        for (const [header, expectedValue] of Object.entries(REQUIRED_SECURITY_HEADERS)) {
            const actual = res.headers.get(header);
            expect(actual).toBe(expectedValue);
        }
    });
});

describe('Server Path Traversal Protection', () => {
    let serverAvailable = false;

    beforeAll(async () => {
        try {
            const res = await fetch(`${BASE_URL}/-/health`);
            serverAvailable = res.ok;
        } catch {
            serverAvailable = false;
        }
    });

    test('should block directory traversal with ../ (browser normalizes to 404)', async () => {
        if (!serverAvailable) return;
        // Browsers normalize ../ before sending the request, so it resolves to
        // a non-existent path within the project root → 404.
        // The server's real defense is URL resolution + filePath.startsWith(projectRoot).
        const res = await fetch(`${BASE_URL}/../../../etc/passwd`);
        expect([403, 404]).toContain(res.status);
    });

    test('should block URL-encoded directory traversal', async () => {
        if (!serverAvailable) return;
        // URL-encoded dots are decoded by URL constructor before path resolution,
        // so the server correctly handles this case.
        const res = await fetch(`${BASE_URL}/%2e%2e/%2e%2e/etc/passwd`);
        expect([403, 404]).toContain(res.status);
    });

    test('should block double-encoded directory traversal', async () => {
        if (!serverAvailable) return;
        const res = await fetch(`${BASE_URL}/%252e%252e/%252e%252e/etc/passwd`);
        // Either 403 or 404 is acceptable (the double-decode may not resolve to ..)
        expect([403, 404]).toContain(res.status);
    });

    test('should return 404 for directory paths that trail with /', async () => {
        if (!serverAvailable) return;
        const res = await fetch(`${BASE_URL}/src/`);
        expect(res.status).toBe(404);
    });
});

describe('R8: Clear-Cache CSRF Protection', () => {
    let serverAvailable = false;

    beforeAll(async () => {
        try {
            const res = await fetch(`${BASE_URL}/-/health`);
            serverAvailable = res.ok;
        } catch {
            serverAvailable = false;
        }
    });

    test('should reject GET request to /-/clear-cache with 405', async () => {
        if (!serverAvailable) return;
        const res = await fetch(`${BASE_URL}/-/clear-cache`);
        expect(res.status).toBe(405);
        expect(res.headers.get('allow')).toBe('POST');
    });

    test('should accept POST request to /-/clear-cache', async () => {
        if (!serverAvailable) return;
        const res = await fetch(`${BASE_URL}/-/clear-cache`, { method: 'POST' });
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.status).toBe('ok');
    });
});
