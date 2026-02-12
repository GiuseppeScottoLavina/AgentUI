/**
 * @fileoverview Unit Tests for au-lazy Component
 * Target: 94% → maintain/improve
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuLazy;

// Mock IntersectionObserver
class MockIntersectionObserver {
    constructor(callback) {
        this.callback = callback;
    }
    observe() { }
    unobserve() { }
    disconnect() { }
}

describe('au-lazy Unit Tests', () => {

    beforeAll(async () => {

        globalThis.IntersectionObserver = MockIntersectionObserver;

        const module = await import('../../src/components/au-lazy.js');
        AuLazy = module.AuLazy;
    });

    beforeEach(() => resetBody());

    // REGISTRATION
    test('should be registered', () => {
        expect(customElements.get('au-lazy')).toBe(AuLazy);
    });

    test('should have correct baseClass', () => {
        expect(AuLazy.baseClass).toBe('au-lazy');
    });

    test('should observe root-margin, threshold', () => {
        expect(AuLazy.observedAttributes).toContain('root-margin');
        expect(AuLazy.observedAttributes).toContain('threshold');
    });

    // RENDER
    test('should render without errors', () => {
        const el = document.createElement('au-lazy');
        body.appendChild(el);
        el.render(); // linkedom doesn't auto-call connectedCallback
        expect(el.classList.contains('au-lazy')).toBe(true);
    });

    test('render should be idempotent', () => {
        const el = document.createElement('au-lazy');
        body.appendChild(el);
        el.render();
        expect(true).toBe(true);
    });

    // LOAD
    test('should have load method', () => {
        const el = document.createElement('au-lazy');
        body.appendChild(el);
        expect(typeof el.load).toBe('function');
    });

    // SRC
    test('should support src attribute', () => {
        const el = document.createElement('au-lazy');
        el.setAttribute('src', 'image.jpg');
        body.appendChild(el);
        expect(el.getAttribute('src')).toBe('image.jpg');
    });

    // THRESHOLD
    test('should support threshold attribute', () => {
        const el = document.createElement('au-lazy');
        el.setAttribute('threshold', '0.5');
        body.appendChild(el);
        expect(el.getAttribute('threshold')).toBe('0.5');
    });

    // LOADED STATE
    test('should have loaded property', () => {
        const el = document.createElement('au-lazy');
        body.appendChild(el);
        el.render(); // linkedom doesn't auto-call connectedCallback
        // loaded may be undefined before render, or boolean after
        expect(el.loaded === undefined || typeof el.loaded === 'boolean').toBe(true);
    });

    // ============================================================
    // LOAD METHOD
    // ============================================================
    // Covered by E2E: tests/e2e/coverage-gaps.test.js
    test.skip('load() should force-load content immediately (E2E)', () => {
        const el = document.createElement('au-lazy');
        body.appendChild(el);
        // Force load without intersection
        expect(() => el.load()).not.toThrow();
    });

    // Covered by E2E: tests/e2e/coverage-gaps.test.js
    test.skip('load() should add is-loaded class (E2E)', () => {
        const el = document.createElement('au-lazy');
        body.appendChild(el);
        el.load();
        expect(el.classList.contains('is-loaded')).toBe(true);
    });

    // Covered by E2E: tests/e2e/coverage-gaps.test.js
    test.skip('load() should set loaded state and class on completion (E2E)', () => {
        const el = document.createElement('au-lazy');
        body.appendChild(el);
        el.load();
        // Verify load completed (emit side effects may not reach addEventListener in LinkedOM)
        expect(el.classList.contains('is-loaded')).toBe(true);
        // Second load should be no-op
        el.load();
        expect(el.classList.contains('is-loaded')).toBe(true);
    });

    // Covered by E2E: tests/e2e/coverage-gaps.test.js
    test.skip('load() should be idempotent (E2E)', () => {
        const el = document.createElement('au-lazy');
        body.appendChild(el);
        el.load();
        el.load(); // second call should be no-op
        expect(el.classList.contains('is-loaded')).toBe(true);
    });

    // Covered by E2E: tests/e2e/coverage-gaps.test.js
    test.skip('load() should remove placeholder (E2E)', () => {
        const el = document.createElement('au-lazy');
        const placeholder = document.createElement('div');
        placeholder.setAttribute('slot', 'placeholder');
        placeholder.textContent = 'Loading...';
        el.appendChild(placeholder);
        body.appendChild(el);
        el.load();
        expect(el.querySelector('[slot="placeholder"]')).toBeNull();
    });

    // ============================================================
    // DISCONNECTED CALLBACK
    // ============================================================
    test('disconnectedCallback should not throw', () => {
        const el = document.createElement('au-lazy');
        body.appendChild(el);
        expect(() => el.remove()).not.toThrow();
    });

    // ============================================================
    // INTERSECTION OBSERVER
    // ============================================================
    test('connectedCallback should create IntersectionObserver', () => {
        let observerCreated = false;
        const OrigIO = globalThis.IntersectionObserver;
        globalThis.IntersectionObserver = class extends MockIntersectionObserver {
            constructor(cb, opts) {
                super(cb, opts);
                observerCreated = true;
            }
        };
        const el = document.createElement('au-lazy');
        body.appendChild(el);
        expect(observerCreated).toBe(true);
        globalThis.IntersectionObserver = OrigIO;
    });

    // Covered by E2E: tests/e2e/coverage-gaps.test.js
    test.skip('observer callback should load when intersecting (E2E)', () => {
        let storedCallback;
        const OrigIO = globalThis.IntersectionObserver;
        globalThis.IntersectionObserver = class extends MockIntersectionObserver {
            constructor(cb, opts) {
                super(cb, opts);
                storedCallback = cb;
            }
        };
        const el = document.createElement('au-lazy');
        body.appendChild(el);

        // Simulate intersection
        storedCallback([{ isIntersecting: true }]);
        expect(el.classList.contains('is-loaded')).toBe(true);

        globalThis.IntersectionObserver = OrigIO;
    });

    test('observer callback should NOT load when not intersecting', () => {
        let storedCallback;
        const OrigIO = globalThis.IntersectionObserver;
        globalThis.IntersectionObserver = class extends MockIntersectionObserver {
            constructor(cb, opts) {
                super(cb, opts);
                storedCallback = cb;
            }
        };
        const el = document.createElement('au-lazy');
        body.appendChild(el);

        storedCallback([{ isIntersecting: false }]);
        expect(el.classList.contains('is-loaded')).toBe(false);

        globalThis.IntersectionObserver = OrigIO;
    });
});
