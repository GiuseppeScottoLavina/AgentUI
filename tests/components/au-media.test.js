/**
 * @fileoverview Tests for au-media — Declarative Responsive Rendering
 *
 * TDD test suite. Written before implementation.
 * Tests cover: registration, rendering, media query matching,
 * child removal/restoration, events, cleanup, and edge cases.
 *
 * Note: matchMedia is mocked. Tests verify component wiring and lifecycle.
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { dom, patchEmit, resetBody } from '../helpers/setup-dom.js';
import { AuMedia } from '../../src/components/au-media.js';

patchEmit(AuMedia);

describe('au-media', () => {

    /** Save original matchMedia */
    let originalMatchMedia;

    /** Controllable mql listeners */
    let mqlListeners;

    /** Current matches state */
    let mqlMatches;

    /** Create a mock matchMedia that returns controllable MQL */
    function setupMockMatchMedia(initialMatches = false) {
        mqlMatches = initialMatches;
        mqlListeners = [];

        globalThis.matchMedia = (query) => ({
            matches: mqlMatches,
            media: query,
            addEventListener: (type, fn) => { mqlListeners.push(fn); },
            removeEventListener: (type, fn) => {
                mqlListeners = mqlListeners.filter(l => l !== fn);
            },
            addListener: () => { },
            removeListener: () => { },
        });
    }

    /** Simulate a media query change */
    function triggerMediaChange(matches) {
        mqlMatches = matches;
        for (const listener of mqlListeners) {
            listener({ matches });
        }
    }

    beforeEach(() => {
        resetBody();
        originalMatchMedia = globalThis.matchMedia;
        setupMockMatchMedia(false);
    });

    afterEach(() => {
        globalThis.matchMedia = originalMatchMedia;
        resetBody();
    });

    // ─── Registration ──────────────────────────────────────────────────

    it('should be registered as a custom element', () => {
        const Ctor = dom.customElements.get('au-media');
        expect(Ctor).toBeDefined();
        expect(Ctor).toBe(AuMedia);
    });

    it('should observe the "query" attribute', () => {
        expect(AuMedia.observedAttributes).toContain('query');
    });

    it('should have no CSS file (structural component)', () => {
        expect(AuMedia.cssFile).toBeNull();
    });

    it('should disable containment', () => {
        expect(AuMedia.useContainment).toBe(false);
    });

    // ─── Rendering ─────────────────────────────────────────────────────

    it('should use display:contents for zero layout impact', () => {
        const el = dom.document.createElement('au-media');
        el.setAttribute('query', '(min-width: 768px)');
        dom.body.appendChild(el);
        el.connectedCallback();

        expect(el.style.display).toBe('contents');
    });

    // ─── Media Query Matching ──────────────────────────────────────────

    it('should show children when query matches initially', () => {
        setupMockMatchMedia(true);

        const el = dom.document.createElement('au-media');
        el.setAttribute('query', '(min-width: 768px)');
        el.innerHTML = '<p>Desktop content</p>';
        dom.body.appendChild(el);
        el.connectedCallback();

        expect(el.querySelector('p')).not.toBeNull();
    });

    it('should remove children when query does not match initially', () => {
        setupMockMatchMedia(false);

        const el = dom.document.createElement('au-media');
        el.setAttribute('query', '(min-width: 768px)');
        el.innerHTML = '<p>Desktop content</p>';
        dom.body.appendChild(el);
        el.connectedCallback();

        // Children should be removed from DOM (stored in fragment)
        expect(el.querySelector('p')).toBeNull();
    });

    it('should restore children when query starts matching', () => {
        setupMockMatchMedia(false);

        const el = dom.document.createElement('au-media');
        el.setAttribute('query', '(min-width: 768px)');
        el.innerHTML = '<p>Dynamic</p>';
        dom.body.appendChild(el);
        el.connectedCallback();

        // Initially hidden
        expect(el.querySelector('p')).toBeNull();

        // Simulate viewport resize → query matches
        triggerMediaChange(true);

        // Now visible
        expect(el.querySelector('p')).not.toBeNull();
        expect(el.querySelector('p').textContent).toBe('Dynamic');
    });

    it('should remove children when query stops matching', () => {
        setupMockMatchMedia(true);

        const el = dom.document.createElement('au-media');
        el.setAttribute('query', '(min-width: 768px)');
        el.innerHTML = '<p>Dynamic</p>';
        dom.body.appendChild(el);
        el.connectedCallback();

        // Initially visible
        expect(el.querySelector('p')).not.toBeNull();

        // Simulate viewport shrink → query no longer matches
        triggerMediaChange(false);

        // Now hidden
        expect(el.querySelector('p')).toBeNull();
    });

    it('should preserve DOM node identity across toggles', () => {
        setupMockMatchMedia(true);

        const el = dom.document.createElement('au-media');
        el.setAttribute('query', '(min-width: 768px)');
        el.innerHTML = '<p id="media-id-test">Same node</p>';
        dom.body.appendChild(el);
        el.connectedCallback();

        const original = el.querySelector('#media-id-test');

        triggerMediaChange(false);
        triggerMediaChange(true);

        const restored = el.querySelector('#media-id-test');
        expect(restored).toBe(original);
    });

    // ─── Properties ────────────────────────────────────────────────────

    it('should have a readonly "matches" property', () => {
        setupMockMatchMedia(false);

        const el = dom.document.createElement('au-media');
        el.setAttribute('query', '(min-width: 768px)');
        dom.body.appendChild(el);
        el.connectedCallback();

        expect(el.matches).toBe(false);

        triggerMediaChange(true);
        expect(el.matches).toBe(true);
    });

    // ─── Events ────────────────────────────────────────────────────────

    it('should dispatch "au-match" when query starts matching', () => {
        setupMockMatchMedia(false);

        const el = dom.document.createElement('au-media');
        el.setAttribute('query', '(min-width: 768px)');
        dom.body.appendChild(el);

        let fired = false;
        el.addEventListener('au-match', () => { fired = true; });

        el.connectedCallback();

        triggerMediaChange(true);
        expect(fired).toBe(true);
    });

    it('should dispatch "au-unmatch" when query stops matching', () => {
        setupMockMatchMedia(true);

        const el = dom.document.createElement('au-media');
        el.setAttribute('query', '(min-width: 768px)');
        dom.body.appendChild(el);

        let fired = false;
        el.addEventListener('au-unmatch', () => { fired = true; });

        el.connectedCallback();

        triggerMediaChange(false);
        expect(fired).toBe(true);
    });

    it('should NOT dispatch events on initial render', () => {
        setupMockMatchMedia(false);

        const el = dom.document.createElement('au-media');
        el.setAttribute('query', '(min-width: 768px)');
        dom.body.appendChild(el);

        let matchFired = false;
        let unmatchFired = false;
        el.addEventListener('au-match', () => { matchFired = true; });
        el.addEventListener('au-unmatch', () => { unmatchFired = true; });

        el.connectedCallback();

        expect(matchFired).toBe(false);
        expect(unmatchFired).toBe(false);
    });

    // ─── Cleanup ───────────────────────────────────────────────────────

    it('should remove matchMedia listener on disconnect', () => {
        const el = dom.document.createElement('au-media');
        el.setAttribute('query', '(min-width: 768px)');
        dom.body.appendChild(el);
        el.connectedCallback();

        const listenersBefore = mqlListeners.length;
        expect(listenersBefore).toBeGreaterThan(0);

        el.disconnectedCallback();

        // Listener should be removed
        expect(mqlListeners.length).toBe(listenersBefore - 1);
    });

    it('should release fragment on disconnect', () => {
        setupMockMatchMedia(false);

        const el = dom.document.createElement('au-media');
        el.setAttribute('query', '(min-width: 768px)');
        el.innerHTML = '<p>Cleanup</p>';
        dom.body.appendChild(el);
        el.connectedCallback();

        el.disconnectedCallback();

        // Should not throw on double disconnect
        expect(() => el.disconnectedCallback()).not.toThrow();
    });

    // ─── Edge Cases ────────────────────────────────────────────────────

    it('should handle missing query attribute gracefully', () => {
        const el = dom.document.createElement('au-media');
        el.innerHTML = '<p>No query</p>';
        dom.body.appendChild(el);

        // Should not throw
        expect(() => el.connectedCallback()).not.toThrow();
    });

    it('should handle empty au-media gracefully', () => {
        const el = dom.document.createElement('au-media');
        el.setAttribute('query', '(min-width: 768px)');
        dom.body.appendChild(el);

        expect(() => el.connectedCallback()).not.toThrow();

        triggerMediaChange(true);
        triggerMediaChange(false);

        expect(el.children.length).toBe(0);
    });

    it('should handle rapid toggling without corruption', () => {
        setupMockMatchMedia(false);

        const el = dom.document.createElement('au-media');
        el.setAttribute('query', '(min-width: 768px)');
        el.innerHTML = '<p>Rapid</p><span>Toggle</span>';
        dom.body.appendChild(el);
        el.connectedCallback();

        for (let i = 0; i < 20; i++) {
            triggerMediaChange(i % 2 === 0);
        }

        // After even count, last state is false (i=19, 19%2=1 → false)
        // Wait, i=18 → 18%2=0 → true, i=19 → false
        expect(el.querySelector('p')).toBeNull();
    });
});
