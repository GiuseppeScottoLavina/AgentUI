/**
 * @fileoverview Tests for au-transition — Declarative Enter/Leave Animations
 *
 * TDD test suite. Written before implementation.
 * Tests cover: registration, rendering, CSS class application lifecycle,
 * events, cleanup, and edge cases.
 *
 * Note: animations don't run in linkedom — tests verify class management
 * and event wiring. Real animation testing requires Puppeteer E2E.
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { dom, patchEmit, resetBody } from '../helpers/setup-dom.js';
import { AuTransition } from '../../src/components/au-transition.js';

patchEmit(AuTransition);

describe('au-transition', () => {

    beforeEach(() => {
        resetBody();
    });

    afterEach(() => {
        resetBody();
    });

    // ─── Registration ──────────────────────────────────────────────────

    it('should be registered as a custom element', () => {
        const Ctor = dom.customElements.get('au-transition');
        expect(Ctor).toBeDefined();
        expect(Ctor).toBe(AuTransition);
    });

    it('should observe the correct attributes', () => {
        expect(AuTransition.observedAttributes).toContain('name');
        expect(AuTransition.observedAttributes).toContain('active');
    });

    it('should have no CSS file (structural component)', () => {
        expect(AuTransition.cssFile).toBeNull();
    });

    it('should disable containment', () => {
        expect(AuTransition.useContainment).toBe(false);
    });

    // ─── Rendering ─────────────────────────────────────────────────────

    it('should use display:contents for zero layout impact', () => {
        const el = dom.document.createElement('au-transition');
        el.setAttribute('name', 'fade');
        dom.body.appendChild(el);
        el.connectedCallback();

        expect(el.style.display).toBe('contents');
    });

    // ─── Enter Transition ──────────────────────────────────────────────

    it('should apply enter classes to children when active attr is set', () => {
        const el = dom.document.createElement('au-transition');
        el.setAttribute('name', 'fade');
        el.innerHTML = '<div class="target">Content</div>';
        dom.body.appendChild(el);
        el.connectedCallback();

        // Set active → triggers enter transition
        el.setAttribute('active', '');
        el.update('active', '', null);

        const child = el.querySelector('.target');
        // Should have enter class applied
        expect(child.classList.contains('fade-enter-active')).toBe(true);
    });

    it('should apply enter-from class first, then enter-active', () => {
        const el = dom.document.createElement('au-transition');
        el.setAttribute('name', 'slide');
        el.innerHTML = '<div>Slide in</div>';
        dom.body.appendChild(el);
        el.connectedCallback();

        const child = el.querySelector('div');

        // Trigger enter
        el.setAttribute('active', '');
        el.update('active', '', null);

        // enter-from should be present initially (or already removed by rAF)
        // enter-active should be present
        expect(child.classList.contains('slide-enter-active')).toBe(true);
    });

    // ─── Leave Transition ──────────────────────────────────────────────

    it('should apply leave classes to children when active attr is removed', () => {
        const el = dom.document.createElement('au-transition');
        el.setAttribute('name', 'fade');
        el.setAttribute('active', '');
        el.innerHTML = '<div>Content</div>';
        dom.body.appendChild(el);
        el.connectedCallback();

        // Remove active → triggers leave transition
        el.removeAttribute('active');
        el.update('active', null, '');

        const child = el.querySelector('div');
        expect(child.classList.contains('fade-leave-active')).toBe(true);
    });

    // ─── Name Convention ───────────────────────────────────────────────

    it('should use "au" as default name prefix', () => {
        const el = dom.document.createElement('au-transition');
        // No name attribute
        el.innerHTML = '<div>Default</div>';
        dom.body.appendChild(el);
        el.connectedCallback();

        el.setAttribute('active', '');
        el.update('active', '', null);

        const child = el.querySelector('div');
        expect(child.classList.contains('au-enter-active')).toBe(true);
    });

    // ─── Property ──────────────────────────────────────────────────────

    it('should have an "active" boolean property getter', () => {
        const el = dom.document.createElement('au-transition');
        dom.body.appendChild(el);
        el.connectedCallback();

        expect(el.active).toBe(false);

        el.setAttribute('active', '');
        expect(el.active).toBe(true);
    });

    it('should have an "active" boolean property setter', () => {
        const el = dom.document.createElement('au-transition');
        dom.body.appendChild(el);
        el.connectedCallback();

        el.active = true;
        expect(el.hasAttribute('active')).toBe(true);

        el.active = false;
        expect(el.hasAttribute('active')).toBe(false);
    });

    // ─── Events ────────────────────────────────────────────────────────

    it('should dispatch "au-enter" when entering', () => {
        const el = dom.document.createElement('au-transition');
        el.setAttribute('name', 'fade');
        el.innerHTML = '<div>Enter</div>';
        dom.body.appendChild(el);
        el.connectedCallback();

        let fired = false;
        el.addEventListener('au-enter', () => { fired = true; });

        el.active = true;
        expect(fired).toBe(true);
    });

    it('should dispatch "au-leave" when leaving', () => {
        const el = dom.document.createElement('au-transition');
        el.setAttribute('name', 'fade');
        el.setAttribute('active', '');
        el.innerHTML = '<div>Leave</div>';
        dom.body.appendChild(el);
        el.connectedCallback();

        let fired = false;
        el.addEventListener('au-leave', () => { fired = true; });

        el.active = false;
        expect(fired).toBe(true);
    });

    it('should NOT dispatch events on initial render', () => {
        const el = dom.document.createElement('au-transition');
        el.setAttribute('name', 'fade');
        el.innerHTML = '<div>Silent</div>';
        dom.body.appendChild(el);

        let enterFired = false;
        let leaveFired = false;
        el.addEventListener('au-enter', () => { enterFired = true; });
        el.addEventListener('au-leave', () => { leaveFired = true; });

        el.connectedCallback();

        expect(enterFired).toBe(false);
        expect(leaveFired).toBe(false);
    });

    // ─── Cleanup ───────────────────────────────────────────────────────

    it('should clean up transition classes on disconnect', () => {
        const el = dom.document.createElement('au-transition');
        el.setAttribute('name', 'fade');
        el.setAttribute('active', '');
        el.innerHTML = '<div>Cleanup</div>';
        dom.body.appendChild(el);
        el.connectedCallback();

        // Trigger transition
        el.active = false;
        const child = el.querySelector('div');
        expect(child.classList.contains('fade-leave-active')).toBe(true);

        // Disconnect should clean up
        el.disconnectedCallback();
        expect(child.classList.contains('fade-leave-active')).toBe(false);
    });

    it('should handle double disconnect gracefully', () => {
        const el = dom.document.createElement('au-transition');
        el.setAttribute('name', 'fade');
        dom.body.appendChild(el);
        el.connectedCallback();

        el.disconnectedCallback();
        expect(() => el.disconnectedCallback()).not.toThrow();
    });

    // ─── Edge Cases ────────────────────────────────────────────────────

    it('should handle empty au-transition', () => {
        const el = dom.document.createElement('au-transition');
        el.setAttribute('name', 'fade');
        dom.body.appendChild(el);
        el.connectedCallback();

        // Should not throw with no children
        el.active = true;
        el.active = false;

        expect(el.children.length).toBe(0);
    });

    it('should handle multiple children', () => {
        const el = dom.document.createElement('au-transition');
        el.setAttribute('name', 'fade');
        el.innerHTML = '<p>A</p><span>B</span><div>C</div>';
        dom.body.appendChild(el);
        el.connectedCallback();

        el.active = true;

        // All children should get the class
        for (const child of el.children) {
            expect(child.classList.contains('fade-enter-active')).toBe(true);
        }
    });

    it('should handle rapid toggling', () => {
        const el = dom.document.createElement('au-transition');
        el.setAttribute('name', 'fade');
        el.innerHTML = '<div>Rapid</div>';
        dom.body.appendChild(el);
        el.connectedCallback();

        for (let i = 0; i < 10; i++) {
            el.active = i % 2 === 0;
        }

        // Should not throw, and element should be in final state
        const child = el.querySelector('div');
        expect(child).not.toBeNull();
    });
});
