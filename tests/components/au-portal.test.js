/**
 * @fileoverview Tests for au-portal — Structural Teleport Directive
 *
 * TDD test suite. Written before implementation.
 * Tests cover: registration, rendering, teleportation to target,
 * cleanup on disconnect, target change, security, nesting, and edge cases.
 */

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { dom, patchEmit, resetBody } from '../helpers/setup-dom.js';
import { AuPortal } from '../../src/components/au-portal.js';

patchEmit(AuPortal);

describe('au-portal', () => {

    /** @type {AuPortal[]} Track portals for cleanup before resetBody */
    let portals;

    beforeEach(() => {
        resetBody();
        portals = [];
    });

    afterEach(() => {
        // Disconnect all portals BEFORE resetting body — avoids linkedom crash
        // when portal wrappers in body are orphaned during innerHTML = ''
        for (const p of portals) {
            try { p.disconnectedCallback(); } catch { }
        }
        portals = [];
        resetBody();
    });

    // ─── Registration ──────────────────────────────────────────────────

    it('should be registered as a custom element', () => {
        const Ctor = dom.customElements.get('au-portal');
        expect(Ctor).toBeDefined();
        expect(Ctor).toBe(AuPortal);
    });

    it('should observe the "target" attribute', () => {
        expect(AuPortal.observedAttributes).toContain('target');
    });

    it('should have no CSS file (structural component)', () => {
        expect(AuPortal.cssFile).toBeNull();
    });

    it('should disable containment', () => {
        expect(AuPortal.useContainment).toBe(false);
    });

    // ─── Rendering ─────────────────────────────────────────────────────

    it('should use display:contents for zero layout impact', () => {
        const el = dom.document.createElement('au-portal');
        el.setAttribute('target', 'body');
        dom.body.appendChild(el);
        el.connectedCallback();
        portals.push(el);

        expect(el.style.display).toBe('contents');
    });

    // ─── Teleport to Target ────────────────────────────────────────────

    it('should teleport children to a target element by ID', () => {
        // Create target container
        const target = dom.document.createElement('div');
        target.id = 'portal-target';
        dom.body.appendChild(target);

        // Create portal with children
        const el = dom.document.createElement('au-portal');
        el.setAttribute('target', '#portal-target');
        el.innerHTML = '<p>Teleported</p>';
        dom.body.appendChild(el);
        el.connectedCallback();

        // Children should be moved to target
        expect(target.querySelector('p')).not.toBeNull();
        expect(target.querySelector('p').textContent).toBe('Teleported');
    });

    it('should teleport children inside a wrapper with data-au-portal-id', () => {
        const target = dom.document.createElement('div');
        target.id = 'portal-target-2';
        dom.body.appendChild(target);

        const el = dom.document.createElement('au-portal');
        el.setAttribute('target', '#portal-target-2');
        el.innerHTML = '<p>Wrapped</p>';
        dom.body.appendChild(el);
        el.connectedCallback();

        // Should find a wrapper div with data-au-portal-id
        const wrapper = target.querySelector('[data-au-portal-id]');
        expect(wrapper).not.toBeNull();
        expect(wrapper.querySelector('p').textContent).toBe('Wrapped');
    });

    it('should teleport to body by default when no target specified', () => {
        const el = dom.document.createElement('au-portal');
        el.innerHTML = '<p>Default target</p>';
        dom.body.appendChild(el);
        el.connectedCallback();
        portals.push(el);

        // Should create wrapper in body
        const wrapper = dom.body.querySelector('[data-au-portal-id]');
        expect(wrapper).not.toBeNull();
        expect(wrapper.querySelector('p').textContent).toBe('Default target');
    });

    it('should teleport multiple children', () => {
        const target = dom.document.createElement('div');
        target.id = 'multi-target';
        dom.body.appendChild(target);

        const el = dom.document.createElement('au-portal');
        el.setAttribute('target', '#multi-target');
        el.innerHTML = '<p>One</p><span>Two</span><div>Three</div>';
        dom.body.appendChild(el);
        el.connectedCallback();

        const wrapper = target.querySelector('[data-au-portal-id]');
        expect(wrapper.children.length).toBe(3);
    });

    // ─── DOM Identity ──────────────────────────────────────────────────

    it('should preserve DOM node identity (same nodes, not clones)', () => {
        const target = dom.document.createElement('div');
        target.id = 'identity-target';
        dom.body.appendChild(target);

        const el = dom.document.createElement('au-portal');
        el.setAttribute('target', '#identity-target');
        const p = dom.document.createElement('p');
        p.id = 'unique-node';
        p.textContent = 'Same node';
        el.appendChild(p);
        dom.body.appendChild(el);
        el.connectedCallback();

        const teleportedP = target.querySelector('#unique-node');
        expect(teleportedP).toBe(p);
    });

    // ─── Cleanup ───────────────────────────────────────────────────────

    it('should remove teleported wrapper on disconnect', () => {
        const target = dom.document.createElement('div');
        target.id = 'cleanup-target';
        dom.body.appendChild(target);

        const el = dom.document.createElement('au-portal');
        el.setAttribute('target', '#cleanup-target');
        el.innerHTML = '<p>Cleanup</p>';
        dom.body.appendChild(el);
        el.connectedCallback();

        // Wrapper exists
        expect(target.querySelector('[data-au-portal-id]')).not.toBeNull();

        // Disconnect
        el.disconnectedCallback();

        // Wrapper should be removed
        expect(target.querySelector('[data-au-portal-id]')).toBeNull();
    });

    // ─── Target Change ─────────────────────────────────────────────────

    it('should re-teleport when target attribute changes', () => {
        const target1 = dom.document.createElement('div');
        target1.id = 'target-a';
        dom.body.appendChild(target1);

        const target2 = dom.document.createElement('div');
        target2.id = 'target-b';
        dom.body.appendChild(target2);

        const el = dom.document.createElement('au-portal');
        el.setAttribute('target', '#target-a');
        el.innerHTML = '<p>Moving</p>';
        dom.body.appendChild(el);
        el.connectedCallback();

        // Initially in target1
        expect(target1.querySelector('p')).not.toBeNull();
        expect(target2.querySelector('p')).toBeNull();

        // Change target via setAttribute (triggers attributeChangedCallback → update)
        el.setAttribute('target', '#target-b');

        // Now in target2
        expect(target2.querySelector('p')).not.toBeNull();
        expect(target1.querySelector('[data-au-portal-id]')).toBeNull();
    });

    it('should return children to portal when target is removed', () => {
        const target = dom.document.createElement('div');
        target.id = 'return-target-attr';
        dom.body.appendChild(target);

        const el = dom.document.createElement('au-portal');
        el.setAttribute('target', '#return-target-attr');
        el.innerHTML = '<p>Return me</p>';
        dom.body.appendChild(el);
        el.connectedCallback();
        portals.push(el);

        // Children are in target
        expect(target.querySelector('p')).not.toBeNull();
        expect(el.querySelector('p')).toBeNull();

        // Remove target attribute — children should return to portal, NOT to body
        el.removeAttribute('target');

        // Children should be back inside the portal element
        expect(el.querySelector('p')).not.toBeNull();
        expect(el.querySelector('p').textContent).toBe('Return me');
        // No wrapper should remain in the old target
        expect(target.querySelector('[data-au-portal-id]')).toBeNull();
        // No wrapper should be in body either
        const bodyWrappers = dom.body.querySelectorAll('[data-au-portal-id]');
        expect(bodyWrappers.length).toBe(0);
    });

    // ─── Events ────────────────────────────────────────────────────────

    it('should dispatch "au-teleport" after children are moved', () => {
        const target = dom.document.createElement('div');
        target.id = 'event-target';
        dom.body.appendChild(target);

        const el = dom.document.createElement('au-portal');
        el.setAttribute('target', '#event-target');
        el.innerHTML = '<p>Evented</p>';

        let fired = false;
        // Register listener BEFORE appending+connecting, because
        // patchEmit shadow registry needs to see addEventListener
        el.addEventListener('au-teleport', () => { fired = true; });

        dom.body.appendChild(el);
        el.connectedCallback();
        portals.push(el);

        expect(fired).toBe(true);
    });

    it('should dispatch "au-return" before cleanup on disconnect', () => {
        const target = dom.document.createElement('div');
        target.id = 'return-target';
        dom.body.appendChild(target);

        const el = dom.document.createElement('au-portal');
        el.setAttribute('target', '#return-target');
        el.innerHTML = '<p>Return</p>';
        dom.body.appendChild(el);
        el.connectedCallback();

        let fired = false;
        el.addEventListener('au-return', () => { fired = true; });

        el.disconnectedCallback();
        expect(fired).toBe(true);
    });

    // ─── Security ──────────────────────────────────────────────────────

    it('should handle invalid target selector gracefully', () => {
        const el = dom.document.createElement('au-portal');
        el.setAttribute('target', '#nonexistent');
        el.innerHTML = '<p>Invalid</p>';
        dom.body.appendChild(el);

        // Should not throw
        expect(() => el.connectedCallback()).not.toThrow();

        // Children remain in the portal element (fallback)
        expect(el.querySelector('p')).not.toBeNull();
    });

    it('should not use innerHTML or eval for target lookup', () => {
        const el = dom.document.createElement('au-portal');
        // Attempt XSS via target attribute
        el.setAttribute('target', '<img src=x onerror=alert(1)>');
        el.innerHTML = '<p>XSS test</p>';
        dom.body.appendChild(el);

        // Should not throw or execute script
        expect(() => el.connectedCallback()).not.toThrow();
        expect(globalThis.__xss).toBeUndefined();
    });

    // ─── Edge Cases ────────────────────────────────────────────────────

    it('should handle empty portal gracefully', () => {
        const target = dom.document.createElement('div');
        target.id = 'empty-target';
        dom.body.appendChild(target);

        const el = dom.document.createElement('au-portal');
        el.setAttribute('target', '#empty-target');
        dom.body.appendChild(el);

        expect(() => el.connectedCallback()).not.toThrow();
    });

    it('should generate unique portal IDs per instance', () => {
        const target = dom.document.createElement('div');
        target.id = 'unique-ids-target';
        dom.body.appendChild(target);

        const el1 = dom.document.createElement('au-portal');
        el1.setAttribute('target', '#unique-ids-target');
        el1.innerHTML = '<p>One</p>';
        dom.body.appendChild(el1);
        el1.connectedCallback();
        portals.push(el1);

        const el2 = dom.document.createElement('au-portal');
        el2.setAttribute('target', '#unique-ids-target');
        el2.innerHTML = '<p>Two</p>';
        dom.body.appendChild(el2);
        el2.connectedCallback();
        portals.push(el2);

        const wrappers = target.querySelectorAll('[data-au-portal-id]');
        expect(wrappers.length).toBe(2);

        // IDs should be different
        const id1 = wrappers[0].getAttribute('data-au-portal-id');
        const id2 = wrappers[1].getAttribute('data-au-portal-id');
        expect(id1).not.toBe(id2);
    });

    it('should double-disconnect safely without errors', () => {
        const target = dom.document.createElement('div');
        target.id = 'double-disconnect';
        dom.body.appendChild(target);

        const el = dom.document.createElement('au-portal');
        el.setAttribute('target', '#double-disconnect');
        el.innerHTML = '<p>Safe</p>';
        dom.body.appendChild(el);
        el.connectedCallback();

        el.disconnectedCallback();
        // Second disconnect should not throw
        expect(() => el.disconnectedCallback()).not.toThrow();
    });
});
