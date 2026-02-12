/**
 * @fileoverview Unit Tests for au-router Component
 * Medium-High component: 171 lines, hash-based router with page caching
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuRouter;

describe('au-router Unit Tests', () => {

    beforeAll(async () => {

        // Router needs fetch/DOMParser
        globalThis.fetch = async (url) => ({
            ok: false,
            status: 404,
            text: async () => '<p>Not found</p>',
        });
        globalThis.DOMParser = class {
            parseFromString(html, type) {
                return dom.document;
            }
        };

        // Router depends on window.location.hash
        if (!globalThis.window.location) {
            globalThis.window.location = { hash: '', href: 'http://localhost/' };
        }

        const module = await import('../../src/components/au-router.js');
        AuRouter = module.AuRouter;

        // Patch emit for test environment
        AuRouter.prototype.emit = function (eventName, detail) {
            try { this.dispatchEvent(new Event(eventName, { bubbles: false })); } catch (e) { }
        };
    });

    beforeEach(() => {
        resetBody();
        window.location.hash = '';
    });

    // ─── REGISTRATION ──────────────────────────────────────────────
    test('should be registered', () => {
        expect(customElements.get('au-router')).toBe(AuRouter);
    });

    test('should have correct baseClass', () => {
        expect(AuRouter.baseClass).toBe('au-router');
    });

    test('should observe base and default attributes', () => {
        const attrs = AuRouter.observedAttributes;
        expect(attrs).toContain('base');
        expect(attrs).toContain('default');
    });

    // ─── RENDER ────────────────────────────────────────────────────
    test('should render content container', () => {
        const el = document.createElement('au-router');
        body.appendChild(el);

        const content = el.querySelector('.au-router__content');
        expect(content).toBeTruthy();
    });

    // ─── ATTRIBUTES ────────────────────────────────────────────────
    test('should default base to /app/pages', () => {
        const el = document.createElement('au-router');
        body.appendChild(el);
        expect(el.attr('base', '/app/pages')).toBe('/app/pages');
    });

    test('should accept custom base path', () => {
        const el = document.createElement('au-router');
        el.setAttribute('base', '/custom/path');
        body.appendChild(el);
        expect(el.getAttribute('base')).toBe('/custom/path');
    });

    test('should accept default route', () => {
        const el = document.createElement('au-router');
        el.setAttribute('default', 'dashboard');
        body.appendChild(el);
        expect(el.getAttribute('default')).toBe('dashboard');
    });

    // ─── NAVIGATE API ──────────────────────────────────────────────
    test('navigate should set window hash', () => {
        const el = document.createElement('au-router');
        body.appendChild(el);

        el.navigate('settings');
        expect(window.location.hash).toBe('settings');
    });

    // ─── CURRENT ROUTE ─────────────────────────────────────────────
    test('currentRoute should return null initially', () => {
        // Note: currentRoute is set in handleRoute which fires on connect
        // But with no hash, it picks the default route
        const el = document.createElement('au-router');
        // Don't connect yet — check pre-connection state
        expect(el.currentRoute).toBe(null);
    });

    // ─── XSS PROTECTION ───────────────────────────────────────────
    test('should import escapeHTML', async () => {
        const fs = await import('fs');
        const source = fs.readFileSync(
            new URL('../../src/components/au-router.js', import.meta.url),
            'utf-8'
        );
        expect(source).toContain("import { escapeHTML } from '../core/utils.js'");
        expect(source).toContain('escapeHTML(route)');
    });
});
