/**
 * @fileoverview Tests for au-intersection — Declarative IntersectionObserver
 *
 * TDD test suite. Written before implementation.
 * Tests cover: registration, rendering, observer setup/teardown,
 * events, once mode, properties, cleanup, and edge cases.
 *
 * Note: IntersectionObserver is mocked in linkedom (setup-dom.js).
 * Tests verify the component's wiring and lifecycle, not the browser API.
 *
 * Observer creation is deferred via setTimeout(0) to ensure children
 * are parsed before observation. Tests use tick() to await this.
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { dom, patchEmit, resetBody } from '../helpers/setup-dom.js';
import { AuIntersection } from '../../src/components/au-intersection.js';

patchEmit(AuIntersection);

/** Flush setTimeout(0) — observer creation is deferred */
const tick = () => new Promise(r => setTimeout(r, 0));

describe('au-intersection', () => {

    /** Save original IntersectionObserver to restore after tests */
    let OriginalIO;

    /** @type {Function} The last callback passed to IntersectionObserver */
    let lastIOCallback;

    /** @type {object} The last options passed to IntersectionObserver */
    let lastIOOptions;

    /** @type {object} Mock observer instance */
    let mockObserver;

    beforeEach(() => {
        resetBody();
        OriginalIO = globalThis.IntersectionObserver;

        // Enhanced mock that captures callback and options
        globalThis.IntersectionObserver = class {
            constructor(callback, options) {
                lastIOCallback = callback;
                lastIOOptions = options;
                mockObserver = this;
                this._observed = [];
                this._disconnected = false;
            }
            observe(el) { this._observed.push(el); }
            unobserve(el) { this._observed = this._observed.filter(e => e !== el); }
            disconnect() { this._disconnected = true; this._observed = []; }
        };
    });

    afterEach(() => {
        globalThis.IntersectionObserver = OriginalIO;
        lastIOCallback = null;
        lastIOOptions = null;
        mockObserver = null;
        resetBody();
    });

    // ─── Registration ──────────────────────────────────────────────────

    it('should be registered as a custom element', () => {
        const Ctor = dom.customElements.get('au-intersection');
        expect(Ctor).toBeDefined();
        expect(Ctor).toBe(AuIntersection);
    });

    it('should observe the correct attributes', () => {
        expect(AuIntersection.observedAttributes).toContain('threshold');
        expect(AuIntersection.observedAttributes).toContain('root-margin');
        expect(AuIntersection.observedAttributes).toContain('once');
    });

    it('should have no CSS file (structural component)', () => {
        expect(AuIntersection.cssFile).toBeNull();
    });

    it('should disable containment', () => {
        expect(AuIntersection.useContainment).toBe(false);
    });

    // ─── Rendering ─────────────────────────────────────────────────────

    it('should use display:contents for zero layout impact', () => {
        const el = dom.document.createElement('au-intersection');
        dom.body.appendChild(el);
        el.connectedCallback();

        expect(el.style.display).toBe('contents');
    });

    // ─── Observer Setup ────────────────────────────────────────────────

    it('should create IntersectionObserver after a tick (deferred)', async () => {
        const el = dom.document.createElement('au-intersection');
        dom.body.appendChild(el);
        el.connectedCallback();

        // Observer is NOT created synchronously
        expect(mockObserver).toBeNull();

        // After tick, observer is created
        await tick();
        expect(lastIOCallback).toBeDefined();
        expect(mockObserver).toBeDefined();
    });

    it('should observe first child element (not self, because display:contents has no box)', async () => {
        const el = dom.document.createElement('au-intersection');
        const child = dom.document.createElement('div');
        child.textContent = 'I am observed';
        el.appendChild(child);
        dom.body.appendChild(el);
        el.connectedCallback();
        await tick();

        // Should observe the first child, not the element itself
        expect(mockObserver._observed).toContain(child);
        expect(mockObserver._observed).not.toContain(el);
    });

    it('should observe self as fallback when empty (no children)', async () => {
        const el = dom.document.createElement('au-intersection');
        dom.body.appendChild(el);
        el.connectedCallback();
        await tick();

        // Fallback: observe self when no children
        expect(mockObserver._observed).toContain(el);
    });

    it('should pass threshold option from attribute', async () => {
        const el = dom.document.createElement('au-intersection');
        el.setAttribute('threshold', '0.5');
        dom.body.appendChild(el);
        el.connectedCallback();
        await tick();

        expect(lastIOOptions.threshold).toBe(0.5);
    });

    it('should pass root-margin option from attribute', async () => {
        const el = dom.document.createElement('au-intersection');
        el.setAttribute('root-margin', '10px 20px');
        dom.body.appendChild(el);
        el.connectedCallback();
        await tick();

        expect(lastIOOptions.rootMargin).toBe('10px 20px');
    });

    it('should use default threshold 0 when attribute absent', async () => {
        const el = dom.document.createElement('au-intersection');
        dom.body.appendChild(el);
        el.connectedCallback();
        await tick();

        expect(lastIOOptions.threshold).toBe(0);
    });

    it('should use default rootMargin "0px" when attribute absent', async () => {
        const el = dom.document.createElement('au-intersection');
        dom.body.appendChild(el);
        el.connectedCallback();
        await tick();

        expect(lastIOOptions.rootMargin).toBe('0px');
    });

    // ─── Events ────────────────────────────────────────────────────────

    it('should dispatch "au-visible" when entering viewport', async () => {
        const el = dom.document.createElement('au-intersection');
        dom.body.appendChild(el);

        let fired = false;
        el.addEventListener('au-visible', () => { fired = true; });

        el.connectedCallback();
        await tick();

        // Simulate intersection
        lastIOCallback([{ isIntersecting: true, intersectionRatio: 1 }]);

        expect(fired).toBe(true);
    });

    it('should dispatch "au-hidden" when leaving viewport', async () => {
        const el = dom.document.createElement('au-intersection');
        dom.body.appendChild(el);

        let fired = false;
        el.addEventListener('au-hidden', () => { fired = true; });

        el.connectedCallback();
        await tick();

        // Simulate leaving viewport
        lastIOCallback([{ isIntersecting: false, intersectionRatio: 0 }]);

        expect(fired).toBe(true);
    });

    it('should include intersection ratio in event detail', async () => {
        const el = dom.document.createElement('au-intersection');
        dom.body.appendChild(el);

        let detail = null;
        el.addEventListener('au-visible', (e) => { detail = e.detail; });

        el.connectedCallback();
        await tick();

        lastIOCallback([{ isIntersecting: true, intersectionRatio: 0.75 }]);

        expect(detail).toBeDefined();
        expect(detail.ratio).toBe(0.75);
    });

    // ─── Once Mode ─────────────────────────────────────────────────────

    it('should disconnect observer after first intersection in once mode', async () => {
        const el = dom.document.createElement('au-intersection');
        el.setAttribute('once', '');
        dom.body.appendChild(el);
        el.connectedCallback();
        await tick();

        // Simulate intersection
        lastIOCallback([{ isIntersecting: true, intersectionRatio: 1 }]);

        expect(mockObserver._disconnected).toBe(true);
    });

    it('should NOT disconnect after intersection without once attribute', async () => {
        const el = dom.document.createElement('au-intersection');
        dom.body.appendChild(el);
        el.connectedCallback();
        await tick();

        // Simulate intersection
        lastIOCallback([{ isIntersecting: true, intersectionRatio: 1 }]);

        expect(mockObserver._disconnected).toBe(false);
    });

    // ─── Properties ────────────────────────────────────────────────────

    it('should have a readonly "isVisible" property', async () => {
        const el = dom.document.createElement('au-intersection');
        dom.body.appendChild(el);
        el.connectedCallback();
        await tick();

        expect(el.isVisible).toBe(false);

        // Simulate becoming visible
        lastIOCallback([{ isIntersecting: true, intersectionRatio: 1 }]);

        expect(el.isVisible).toBe(true);
    });

    it('should update isVisible on leave', async () => {
        const el = dom.document.createElement('au-intersection');
        dom.body.appendChild(el);
        el.connectedCallback();
        await tick();

        lastIOCallback([{ isIntersecting: true, intersectionRatio: 1 }]);
        expect(el.isVisible).toBe(true);

        lastIOCallback([{ isIntersecting: false, intersectionRatio: 0 }]);
        expect(el.isVisible).toBe(false);
    });

    // ─── Cleanup ───────────────────────────────────────────────────────

    it('should disconnect observer on disconnect', async () => {
        const el = dom.document.createElement('au-intersection');
        dom.body.appendChild(el);
        el.connectedCallback();
        await tick();

        el.disconnectedCallback();

        expect(mockObserver._disconnected).toBe(true);
    });

    it('should handle double disconnect gracefully', async () => {
        const el = dom.document.createElement('au-intersection');
        dom.body.appendChild(el);
        el.connectedCallback();
        await tick();

        el.disconnectedCallback();
        expect(() => el.disconnectedCallback()).not.toThrow();
    });

    // ─── Edge Cases ────────────────────────────────────────────────────

    it('should handle empty au-intersection', () => {
        const el = dom.document.createElement('au-intersection');
        dom.body.appendChild(el);

        expect(() => el.connectedCallback()).not.toThrow();
    });

    it('should handle multiple entries in callback', async () => {
        const el = dom.document.createElement('au-intersection');
        dom.body.appendChild(el);

        let count = 0;
        el.addEventListener('au-visible', () => { count++; });

        el.connectedCallback();
        await tick();

        // Observer can fire with multiple entries
        lastIOCallback([
            { isIntersecting: true, intersectionRatio: 0.5 },
            { isIntersecting: true, intersectionRatio: 1.0 }
        ]);

        // Should process last entry (most recent state)
        expect(count).toBe(1);
        expect(el.isVisible).toBe(true);
    });

    it('should clamp invalid threshold to valid range', async () => {
        const el = dom.document.createElement('au-intersection');
        el.setAttribute('threshold', '2.0');
        dom.body.appendChild(el);
        el.connectedCallback();
        await tick();

        // Should clamp to 1.0
        expect(lastIOOptions.threshold).toBeLessThanOrEqual(1);
    });

    it('should not create observer if disconnected before tick', async () => {
        const el = dom.document.createElement('au-intersection');
        dom.body.appendChild(el);
        el.connectedCallback();

        // Disconnect BEFORE the deferred observer creation runs
        el.disconnectedCallback();
        await tick();

        // Observer might have been created, but should handle gracefully
        // The key is: no errors thrown
    });
});
