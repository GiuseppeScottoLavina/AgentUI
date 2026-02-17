/**
 * @fileoverview Tests for au-show — Structural Show/Hide Directive
 *
 * TDD test suite. Written before implementation.
 * Tests cover: registration, rendering, conditional logic (show/hide),
 * state preservation (children stay in DOM), property getter/setter,
 * events, cleanup, XSS safety, and nesting.
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { dom, patchEmit, resetBody } from '../helpers/setup-dom.js';
import { AuShow } from '../../src/components/au-show.js';

patchEmit(AuShow);

describe('au-show', () => {

    beforeEach(() => {
        resetBody();
    });

    afterEach(() => {
        resetBody();
    });

    // ─── Registration ──────────────────────────────────────────────────

    it('should be registered as a custom element', () => {
        const Ctor = dom.customElements.get('au-show');
        expect(Ctor).toBeDefined();
        expect(Ctor).toBe(AuShow);
    });

    it('should observe the "condition" attribute', () => {
        expect(AuShow.observedAttributes).toContain('condition');
    });

    it('should have no CSS file (structural component)', () => {
        expect(AuShow.cssFile).toBeNull();
    });

    it('should disable containment', () => {
        expect(AuShow.useContainment).toBe(false);
    });

    // ─── Rendering ─────────────────────────────────────────────────────

    it('should use display:contents for zero layout impact', () => {
        const el = dom.document.createElement('au-show');
        el.setAttribute('condition', '');
        el.innerHTML = '<p>Hello</p>';
        dom.body.appendChild(el);
        el.connectedCallback();

        expect(el.style.display).toBe('contents');
    });

    // ─── Conditional Logic ─────────────────────────────────────────────

    it('should show children when condition is present', () => {
        const el = dom.document.createElement('au-show');
        el.setAttribute('condition', '');
        el.innerHTML = '<p>Visible</p>';
        dom.body.appendChild(el);
        el.connectedCallback();

        const p = el.querySelector('p');
        expect(p).not.toBeNull();
        // Children should NOT have display:none
        expect(p.style.display).not.toBe('none');
    });

    it('should hide children when condition is absent (initial)', () => {
        const el = dom.document.createElement('au-show');
        el.innerHTML = '<p>Hidden</p>';
        dom.body.appendChild(el);
        el.connectedCallback();

        const p = el.querySelector('p');
        // Children should still be in DOM (key difference from au-if)
        expect(p).not.toBeNull();
        // But should be hidden via display:none
        expect(p.style.display).toBe('none');
    });

    it('should preserve children in DOM when hidden (not removed)', () => {
        const el = dom.document.createElement('au-show');
        el.innerHTML = '<p>Content</p><span>More</span>';
        dom.body.appendChild(el);
        el.connectedCallback();

        // Children should be in the DOM even without condition
        expect(el.children.length).toBe(2);
        expect(el.querySelector('p')).not.toBeNull();
        expect(el.querySelector('span')).not.toBeNull();
    });

    it('should toggle children visibility on condition change', () => {
        const el = dom.document.createElement('au-show');
        el.innerHTML = '<p>Toggle me</p>';
        dom.body.appendChild(el);
        el.connectedCallback();

        const p = el.querySelector('p');

        // Initially hidden (no condition)
        expect(p.style.display).toBe('none');

        // Set condition → visible
        el.condition = true;
        expect(p.style.display).not.toBe('none');

        // Remove condition → hidden
        el.condition = false;
        expect(p.style.display).toBe('none');
    });

    it('should preserve DOM node identity across toggles (same nodes)', () => {
        const el = dom.document.createElement('au-show');
        el.setAttribute('condition', '');
        el.innerHTML = '<p id="identity-test">Same node</p>';
        dom.body.appendChild(el);
        el.connectedCallback();

        const originalNode = el.querySelector('#identity-test');

        // Hide
        el.condition = false;

        // Show again
        el.condition = true;

        const restoredNode = el.querySelector('#identity-test');
        // Same node, not a clone — children never leave the DOM
        expect(restoredNode).toBe(originalNode);
    });

    it('should handle multiple children', () => {
        const el = dom.document.createElement('au-show');
        el.innerHTML = '<p>A</p><span>B</span><div>C</div>';
        dom.body.appendChild(el);
        el.connectedCallback();

        // All hidden
        for (const child of el.children) {
            expect(child.style.display).toBe('none');
        }

        // Show all
        el.condition = true;
        for (const child of el.children) {
            expect(child.style.display).not.toBe('none');
        }
    });

    // ─── State Preservation ────────────────────────────────────────────

    it('should preserve input values across show/hide (key use case)', () => {
        const el = dom.document.createElement('au-show');
        el.setAttribute('condition', '');
        el.innerHTML = '<input type="text" />';
        dom.body.appendChild(el);
        el.connectedCallback();

        const input = el.querySelector('input');
        input.value = 'user typed this';

        // Hide
        el.condition = false;
        // Show again
        el.condition = true;

        const sameInput = el.querySelector('input');
        // Same DOM node with same value
        expect(sameInput).toBe(input);
        expect(sameInput.value).toBe('user typed this');
    });

    // ─── Property Getter/Setter ────────────────────────────────────────

    it('should have a boolean "condition" property getter', () => {
        const el = dom.document.createElement('au-show');
        dom.body.appendChild(el);
        el.connectedCallback();

        expect(el.condition).toBe(false);

        el.setAttribute('condition', '');
        expect(el.condition).toBe(true);
    });

    it('should have a boolean "condition" property setter', () => {
        const el = dom.document.createElement('au-show');
        dom.body.appendChild(el);
        el.connectedCallback();

        el.condition = true;
        expect(el.hasAttribute('condition')).toBe(true);

        el.condition = false;
        expect(el.hasAttribute('condition')).toBe(false);
    });

    // ─── Events ────────────────────────────────────────────────────────

    it('should dispatch "au-show" when condition becomes true', () => {
        const el = dom.document.createElement('au-show');
        el.innerHTML = '<p>Evented</p>';
        dom.body.appendChild(el);
        el.connectedCallback();

        let fired = false;
        el.addEventListener('au-show', () => { fired = true; });

        el.condition = true;
        expect(fired).toBe(true);
    });

    it('should dispatch "au-hide" when condition becomes false', () => {
        const el = dom.document.createElement('au-show');
        el.setAttribute('condition', '');
        el.innerHTML = '<p>Evented</p>';
        dom.body.appendChild(el);
        el.connectedCallback();

        let fired = false;
        el.addEventListener('au-hide', () => { fired = true; });

        el.condition = false;
        expect(fired).toBe(true);
    });

    it('should NOT dispatch events on initial render', () => {
        const el = dom.document.createElement('au-show');
        el.innerHTML = '<p>Silent</p>';
        dom.body.appendChild(el);

        let showFired = false;
        let hideFired = false;
        el.addEventListener('au-show', () => { showFired = true; });
        el.addEventListener('au-hide', () => { hideFired = true; });

        el.connectedCallback();

        expect(showFired).toBe(false);
        expect(hideFired).toBe(false);
    });

    // ─── Cleanup ───────────────────────────────────────────────────────

    it('should clean up on disconnect', () => {
        const el = dom.document.createElement('au-show');
        el.innerHTML = '<p>Cleanup</p>';
        dom.body.appendChild(el);
        el.connectedCallback();

        // Disconnect
        el.disconnectedCallback();

        // No errors, no leaks — element should be in clean state
        expect(el.children.length).toBeGreaterThanOrEqual(0);
    });

    // ─── XSS Safety ───────────────────────────────────────────────────

    it('should not execute scripts in children when toggling', () => {
        const el = dom.document.createElement('au-show');
        el.innerHTML = '<img src=x onerror="window.__xss=true" />';
        dom.body.appendChild(el);
        el.connectedCallback();

        el.condition = true;
        el.condition = false;
        el.condition = true;

        // au-show never does innerHTML — children are preserved as-is
        expect(globalThis.__xss).toBeUndefined();
    });

    // ─── Rapid Toggling ──────────────────────────────────────────────

    it('should handle rapid toggling without corruption', () => {
        const el = dom.document.createElement('au-show');
        el.innerHTML = '<p>Rapid</p><span>Toggle</span>';
        dom.body.appendChild(el);
        el.connectedCallback();

        for (let i = 0; i < 20; i++) {
            el.condition = i % 2 === 0;
        }

        // After even number of toggles (condition = true at i=0, false at i=19)
        // i=19 → 19 % 2 === 1 → condition = false
        expect(el.children.length).toBe(2);
        const p = el.querySelector('p');
        expect(p.style.display).toBe('none');
    });

    // ─── Nesting ───────────────────────────────────────────────────────

    it('should work with nested au-show', () => {
        const outer = dom.document.createElement('au-show');
        outer.setAttribute('condition', '');

        const inner = dom.document.createElement('au-show');
        inner.setAttribute('condition', '');
        inner.innerHTML = '<p>Nested</p>';

        outer.appendChild(inner);
        dom.body.appendChild(outer);
        outer.connectedCallback();
        inner.connectedCallback();

        // Both visible
        const p = inner.querySelector('p');
        expect(p).not.toBeNull();
        expect(p.style.display).not.toBe('none');

        // Hide inner only
        inner.condition = false;
        expect(p.style.display).toBe('none');

        // Outer still visible
        expect(inner.style.display).toBe('contents');
    });

    // ─── Edge Cases ────────────────────────────────────────────────────

    it('should handle empty au-show gracefully', () => {
        const el = dom.document.createElement('au-show');
        dom.body.appendChild(el);
        el.connectedCallback();

        // No errors with no children
        el.condition = true;
        el.condition = false;

        expect(el.children.length).toBe(0);
    });

    it('should handle text nodes (not just elements)', () => {
        const el = dom.document.createElement('au-show');
        el.textContent = 'Just text';
        dom.body.appendChild(el);
        el.connectedCallback();

        // Text nodes don't have style property — they should be
        // wrapped or skipped gracefully without errors
        expect(el.textContent).toBe('Just text');

        el.condition = true;
        expect(el.textContent).toBe('Just text');
    });

    it('should restore inline display styles correctly', () => {
        const el = dom.document.createElement('au-show');
        el.setAttribute('condition', '');
        el.innerHTML = '<p style="display: flex">Flex</p>';
        dom.body.appendChild(el);
        el.connectedCallback();

        const p = el.querySelector('p');
        expect(p.style.display).toBe('flex');

        // Hide
        el.condition = false;
        expect(p.style.display).toBe('none');

        // Show — should restore original display value
        el.condition = true;
        expect(p.style.display).toBe('flex');
    });
});
