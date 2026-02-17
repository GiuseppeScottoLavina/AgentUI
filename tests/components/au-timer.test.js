/**
 * @fileoverview Tests for au-timer — Declarative Timer Component
 *
 * TDD test suite. Written before implementation.
 * Tests cover: registration, rendering, tick events, auto-start,
 * countdown mode, controls (start/stop/reset), cleanup, and edge cases.
 *
 * Note: Uses fake timers (manual tick simulation) for deterministic tests.
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { dom, patchEmit, resetBody } from '../helpers/setup-dom.js';
import { AuTimer } from '../../src/components/au-timer.js';

patchEmit(AuTimer);

describe('au-timer', () => {

    /** Captured setInterval IDs and their callbacks */
    let intervalCallbacks;
    let originalSetInterval;
    let originalClearInterval;
    let nextIntervalId;

    beforeEach(() => {
        resetBody();
        intervalCallbacks = new Map();
        nextIntervalId = 1;

        originalSetInterval = globalThis.setInterval;
        originalClearInterval = globalThis.clearInterval;

        // Mock setInterval to capture callbacks
        globalThis.setInterval = (fn, ms) => {
            const id = nextIntervalId++;
            intervalCallbacks.set(id, { fn, ms });
            return id;
        };

        globalThis.clearInterval = (id) => {
            intervalCallbacks.delete(id);
        };
    });

    afterEach(() => {
        globalThis.setInterval = originalSetInterval;
        globalThis.clearInterval = originalClearInterval;
        resetBody();
    });

    /** Simulate a timer tick for all active intervals */
    function tick(count = 1) {
        for (let i = 0; i < count; i++) {
            for (const [, entry] of intervalCallbacks) {
                entry.fn();
            }
        }
    }

    // ─── Registration ──────────────────────────────────────────────────

    it('should be registered as a custom element', () => {
        const Ctor = dom.customElements.get('au-timer');
        expect(Ctor).toBeDefined();
        expect(Ctor).toBe(AuTimer);
    });

    it('should observe the correct attributes', () => {
        expect(AuTimer.observedAttributes).toContain('interval');
        expect(AuTimer.observedAttributes).toContain('autostart');
        expect(AuTimer.observedAttributes).toContain('countdown');
    });

    it('should have no CSS file (structural component)', () => {
        expect(AuTimer.cssFile).toBeNull();
    });

    it('should disable containment', () => {
        expect(AuTimer.useContainment).toBe(false);
    });

    // ─── Rendering ─────────────────────────────────────────────────────

    it('should use display:contents for zero layout impact', () => {
        const el = dom.document.createElement('au-timer');
        dom.body.appendChild(el);
        el.connectedCallback();

        expect(el.style.display).toBe('contents');
    });

    // ─── Auto-start ────────────────────────────────────────────────────

    it('should auto-start when autostart attribute is present', () => {
        const el = dom.document.createElement('au-timer');
        el.setAttribute('autostart', '');
        el.setAttribute('interval', '1000');
        dom.body.appendChild(el);
        el.connectedCallback();

        expect(intervalCallbacks.size).toBe(1);
    });

    it('should NOT auto-start without autostart attribute', () => {
        const el = dom.document.createElement('au-timer');
        el.setAttribute('interval', '1000');
        dom.body.appendChild(el);
        el.connectedCallback();

        expect(intervalCallbacks.size).toBe(0);
    });

    it('should use default interval of 1000ms', () => {
        const el = dom.document.createElement('au-timer');
        el.setAttribute('autostart', '');
        dom.body.appendChild(el);
        el.connectedCallback();

        const [, entry] = [...intervalCallbacks][0];
        expect(entry.ms).toBe(1000);
    });

    it('should use custom interval from attribute', () => {
        const el = dom.document.createElement('au-timer');
        el.setAttribute('autostart', '');
        el.setAttribute('interval', '500');
        dom.body.appendChild(el);
        el.connectedCallback();

        const [, entry] = [...intervalCallbacks][0];
        expect(entry.ms).toBe(500);
    });

    // ─── Tick Events ───────────────────────────────────────────────────

    it('should dispatch "au-tick" on each interval', () => {
        const el = dom.document.createElement('au-timer');
        el.setAttribute('autostart', '');
        dom.body.appendChild(el);

        let tickCount = 0;
        el.addEventListener('au-tick', () => { tickCount++; });

        el.connectedCallback();

        tick(3);
        expect(tickCount).toBe(3);
    });

    it('should include elapsed count in tick event detail', () => {
        const el = dom.document.createElement('au-timer');
        el.setAttribute('autostart', '');
        dom.body.appendChild(el);

        let detail = null;
        el.addEventListener('au-tick', (e) => { detail = e.detail; });

        el.connectedCallback();

        tick(5);
        expect(detail).toBeDefined();
        expect(detail.count).toBe(5);
    });

    // ─── Countdown Mode ────────────────────────────────────────────────

    it('should count down from countdown value', () => {
        const el = dom.document.createElement('au-timer');
        el.setAttribute('autostart', '');
        el.setAttribute('countdown', '3');
        dom.body.appendChild(el);

        let lastRemaining = null;
        el.addEventListener('au-tick', (e) => { lastRemaining = e.detail.remaining; });

        el.connectedCallback();

        tick(1);
        expect(lastRemaining).toBe(2);

        tick(1);
        expect(lastRemaining).toBe(1);
    });

    it('should dispatch "au-complete" when countdown reaches 0', () => {
        const el = dom.document.createElement('au-timer');
        el.setAttribute('autostart', '');
        el.setAttribute('countdown', '3');
        dom.body.appendChild(el);

        let completed = false;
        el.addEventListener('au-complete', () => { completed = true; });

        el.connectedCallback();

        tick(3);
        expect(completed).toBe(true);
    });

    it('should stop interval after countdown completion', () => {
        const el = dom.document.createElement('au-timer');
        el.setAttribute('autostart', '');
        el.setAttribute('countdown', '2');
        dom.body.appendChild(el);
        el.connectedCallback();

        tick(2);
        // Interval should have been cleared
        expect(intervalCallbacks.size).toBe(0);
    });

    // ─── Controls ──────────────────────────────────────────────────────

    it('should start timer via start() method', () => {
        const el = dom.document.createElement('au-timer');
        dom.body.appendChild(el);
        el.connectedCallback();

        expect(intervalCallbacks.size).toBe(0);

        el.start();
        expect(intervalCallbacks.size).toBe(1);
    });

    it('should stop timer via stop() method', () => {
        const el = dom.document.createElement('au-timer');
        el.setAttribute('autostart', '');
        dom.body.appendChild(el);
        el.connectedCallback();

        expect(intervalCallbacks.size).toBe(1);

        el.stop();
        expect(intervalCallbacks.size).toBe(0);
    });

    it('should reset timer via reset() method', () => {
        const el = dom.document.createElement('au-timer');
        el.setAttribute('autostart', '');
        el.setAttribute('countdown', '5');
        dom.body.appendChild(el);
        el.connectedCallback();

        tick(3);
        expect(el.count).toBe(3);

        el.reset();
        expect(el.count).toBe(0);
    });

    it('should not start duplicate interval on double start()', () => {
        const el = dom.document.createElement('au-timer');
        dom.body.appendChild(el);
        el.connectedCallback();

        el.start();
        el.start(); // Should not create a second interval

        expect(intervalCallbacks.size).toBe(1);
    });

    it('should handle stop() when not running', () => {
        const el = dom.document.createElement('au-timer');
        dom.body.appendChild(el);
        el.connectedCallback();

        // Should not throw
        expect(() => el.stop()).not.toThrow();
    });

    // ─── Properties ────────────────────────────────────────────────────

    it('should have a "count" property tracking ticks', () => {
        const el = dom.document.createElement('au-timer');
        el.setAttribute('autostart', '');
        dom.body.appendChild(el);
        el.connectedCallback();

        expect(el.count).toBe(0);

        tick(5);
        expect(el.count).toBe(5);
    });

    it('should have a "running" property', () => {
        const el = dom.document.createElement('au-timer');
        dom.body.appendChild(el);
        el.connectedCallback();

        expect(el.running).toBe(false);

        el.start();
        expect(el.running).toBe(true);

        el.stop();
        expect(el.running).toBe(false);
    });

    // ─── Cleanup ───────────────────────────────────────────────────────

    it('should clear interval on disconnect', () => {
        const el = dom.document.createElement('au-timer');
        el.setAttribute('autostart', '');
        dom.body.appendChild(el);
        el.connectedCallback();

        expect(intervalCallbacks.size).toBe(1);

        el.disconnectedCallback();
        expect(intervalCallbacks.size).toBe(0);
    });

    it('should handle double disconnect gracefully', () => {
        const el = dom.document.createElement('au-timer');
        el.setAttribute('autostart', '');
        dom.body.appendChild(el);
        el.connectedCallback();

        el.disconnectedCallback();
        expect(() => el.disconnectedCallback()).not.toThrow();
    });

    // ─── Edge Cases ────────────────────────────────────────────────────

    it('should handle empty au-timer (no children)', () => {
        const el = dom.document.createElement('au-timer');
        el.setAttribute('autostart', '');
        dom.body.appendChild(el);

        expect(() => el.connectedCallback()).not.toThrow();
        tick(3);
    });

    it('should clamp negative interval to minimum 100ms', () => {
        const el = dom.document.createElement('au-timer');
        el.setAttribute('autostart', '');
        el.setAttribute('interval', '-50');
        dom.body.appendChild(el);
        el.connectedCallback();

        const [, entry] = [...intervalCallbacks][0];
        expect(entry.ms).toBeGreaterThanOrEqual(100);
    });
});
