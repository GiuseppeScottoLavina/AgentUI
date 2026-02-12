/**
 * @fileoverview Unit Tests for au-fetch Component
 * Medium-High component: 258 lines, declarative data fetching with loading/error states
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuFetch;

describe('au-fetch Unit Tests', () => {

    beforeAll(async () => {

        // Mock AbortController
        globalThis.AbortController = class {
            constructor() {
                this.signal = { aborted: false };
            }
            abort() { this.signal.aborted = true; }
        };

        // Default fetch mock
        globalThis.fetch = async (url, options) => ({
            ok: true,
            status: 200,
            json: async () => ([{ id: 1, name: 'Test' }]),
            text: async () => JSON.stringify([{ id: 1, name: 'Test' }]),
            headers: { get: () => 'application/json' },
        });

        const module = await import('../../src/components/au-fetch.js');
        AuFetch = module.AuFetch;

        // Patch emit for test environment
        AuFetch.prototype.emit = function (eventName, detail) {
            try { this.dispatchEvent(new Event(eventName, { bubbles: false })); } catch (e) { }
        };
    });

    beforeEach(() => resetBody());

    // ─── REGISTRATION ──────────────────────────────────────────────
    test('should be registered', () => {
        expect(customElements.get('au-fetch')).toBe(AuFetch);
    });

    test('should have correct baseClass', () => {
        expect(AuFetch.baseClass).toBe('au-fetch');
    });

    test('should observe url, method, auto, interval', () => {
        const attrs = AuFetch.observedAttributes;
        expect(attrs).toContain('url');
        expect(attrs).toContain('method');
        expect(attrs).toContain('auto');
        expect(attrs).toContain('interval');
    });

    // ─── INITIAL STATE ─────────────────────────────────────────────
    test('should initialize with idle state', () => {
        const el = document.createElement('au-fetch');
        expect(el.state).toBe('idle');
    });

    test('should initialize with null data', () => {
        const el = document.createElement('au-fetch');
        expect(el.data).toBe(null);
    });

    test('should initialize with null error', () => {
        const el = document.createElement('au-fetch');
        expect(el.error).toBe(null);
    });

    // ─── ATTRIBUTES ────────────────────────────────────────────────
    test('should accept url attribute', () => {
        const el = document.createElement('au-fetch');
        el.setAttribute('url', '/api/users');
        body.appendChild(el);
        expect(el.getAttribute('url')).toBe('/api/users');
    });

    test('should accept method attribute', () => {
        const el = document.createElement('au-fetch');
        el.setAttribute('method', 'POST');
        body.appendChild(el);
        expect(el.getAttribute('method')).toBe('POST');
    });

    test('should accept auto attribute', () => {
        const el = document.createElement('au-fetch');
        el.setAttribute('auto', '');
        body.appendChild(el);
        expect(el.hasAttribute('auto')).toBe(true);
    });

    // ─── FETCH API ─────────────────────────────────────────────────
    test('fetch should return data', async () => {
        const el = document.createElement('au-fetch');
        el.setAttribute('url', '/api/users');
        body.appendChild(el);

        const data = await el.fetch();
        expect(data).toBeTruthy();
    });

    test('fetch should update state to success', async () => {
        const el = document.createElement('au-fetch');
        el.setAttribute('url', '/api/users');
        body.appendChild(el);

        await el.fetch();
        expect(el.state).toBe('success');
    });

    test('fetch should update data property', async () => {
        const el = document.createElement('au-fetch');
        el.setAttribute('url', '/api/users');
        body.appendChild(el);

        await el.fetch();
        expect(el.data).toBeTruthy();
    });

    test('fetch should set state to error on failure', async () => {
        globalThis.fetch = async () => ({ ok: false, status: 500 });

        const el = document.createElement('au-fetch');
        el.setAttribute('url', '/api/failing');
        body.appendChild(el);

        try {
            await el.fetch();
        } catch (e) {
            // Expected
        }
        expect(el.state).toBe('error');

        // Restore mock
        globalThis.fetch = async (url, options) => ({
            ok: true,
            status: 200,
            json: async () => ([{ id: 1, name: 'Test' }]),
            text: async () => JSON.stringify([{ id: 1, name: 'Test' }]),
            headers: { get: () => 'application/json' },
        });
    });

    // ─── REFETCH ───────────────────────────────────────────────────
    test('refetch should call fetch again', async () => {
        const el = document.createElement('au-fetch');
        el.setAttribute('url', '/api/users');
        body.appendChild(el);

        const data = await el.refetch();
        expect(data).toBeTruthy();
    });

    // ─── RENDER ITEM ───────────────────────────────────────────────
    test('should accept renderItem function', () => {
        const el = document.createElement('au-fetch');
        body.appendChild(el);

        const fn = (item) => `<div>${item.name}</div>`;
        el.renderItem = fn;
        expect(el.renderItem).toBe(fn);
    });

    // ─── DISCONNECTED CALLBACK ─────────────────────────────────────
    test('should cleanup on disconnect', () => {
        const el = document.createElement('au-fetch');
        body.appendChild(el);

        // Should not throw when removing
        expect(() => el.remove()).not.toThrow();
    });

    // ─── RENDER ────────────────────────────────────────────────────
    test('should render loading state', () => {
        const el = document.createElement('au-fetch');
        el.state = 'loading';
        body.appendChild(el);

        el.render();
        const spinner = el.querySelector('au-spinner');
        expect(spinner).toBeTruthy();
    });

    test('should be in idle state when rendered without url', () => {
        const el = document.createElement('au-fetch');
        body.appendChild(el);

        // Without a URL, the component stays idle
        expect(el.state).toBe('idle');
    });
});
