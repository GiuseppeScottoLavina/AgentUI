/**
 * @fileoverview Unit Tests for au-if Component
 * 
 * TDD: Written BEFORE the implementation.
 * Tests structural conditional rendering with DOM preservation.
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, patchEmit, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuIf;

describe('au-if Unit Tests', () => {

    beforeAll(async () => {
        const module = await import('../../src/components/au-if.js');
        AuIf = module.AuIf;
        patchEmit(AuIf);
    });

    beforeEach(() => resetBody());

    // ── REGISTRATION ──────────────────────────────────────────────────

    test('should be registered as custom element', () => {
        expect(customElements.get('au-if')).toBe(AuIf);
    });

    test('should have correct baseClass', () => {
        expect(AuIf.baseClass).toBe('au-if');
    });

    test('should observe condition attribute', () => {
        expect(AuIf.observedAttributes).toContain('condition');
    });

    test('should observe else attribute', () => {
        expect(AuIf.observedAttributes).toContain('else');
    });

    // ── RENDER ────────────────────────────────────────────────────────

    test('should set display: contents', () => {
        const el = document.createElement('au-if');
        el.setAttribute('condition', '');
        body.appendChild(el);
        expect(el.style.display).toBe('contents');
    });

    // ── CONDITION = TRUE ──────────────────────────────────────────────

    test('children visible when condition attribute is present', () => {
        const el = document.createElement('au-if');
        el.setAttribute('condition', '');
        el.innerHTML = '<p>Visible</p>';
        body.appendChild(el);

        expect(el.children.length).toBe(1);
        expect(el.querySelector('p').textContent).toBe('Visible');
    });

    // ── CONDITION = FALSE ─────────────────────────────────────────────

    test('children removed from DOM when condition is absent', () => {
        const el = document.createElement('au-if');
        // No condition attribute — children should be hidden after connect
        el.innerHTML = '<p>Hidden</p>';
        body.appendChild(el);

        expect(el.children.length).toBe(0);
        expect(el.querySelector('p')).toBeNull();
    });

    // ── TOGGLE: TRUE → FALSE ──────────────────────────────────────────

    test('removing condition attribute removes children from DOM', () => {
        const el = document.createElement('au-if');
        el.setAttribute('condition', '');
        el.innerHTML = '<p>Content</p>';
        body.appendChild(el);

        // Verify initially visible
        expect(el.children.length).toBe(1);

        // Toggle to false
        el.removeAttribute('condition');
        expect(el.children.length).toBe(0);
        expect(el.querySelector('p')).toBeNull();
    });

    // ── TOGGLE: FALSE → TRUE ──────────────────────────────────────────

    test('setting condition attribute restores children', () => {
        const el = document.createElement('au-if');
        el.innerHTML = '<p>Content</p>';
        body.appendChild(el);

        // Starts hidden
        expect(el.children.length).toBe(0);

        // Toggle to true
        el.setAttribute('condition', '');
        expect(el.children.length).toBe(1);
        expect(el.querySelector('p').textContent).toBe('Content');
    });

    // ── ROUND-TRIP NODE IDENTITY ──────────────────────────────────────

    test('round-trip preserves original DOM node identity', () => {
        const el = document.createElement('au-if');
        el.setAttribute('condition', '');
        const child = document.createElement('div');
        child.id = 'identity-check';
        child.textContent = 'Preserved';
        el.appendChild(child);
        body.appendChild(el);

        // Capture reference
        const originalChild = el.querySelector('#identity-check');
        expect(originalChild).toBe(child);

        // Toggle off
        el.removeAttribute('condition');
        expect(el.querySelector('#identity-check')).toBeNull();

        // Toggle on
        el.setAttribute('condition', '');
        const restoredChild = el.querySelector('#identity-check');

        // CRITICAL: Same DOM node, not a clone
        expect(restoredChild).toBe(originalChild);
    });

    // ── MULTIPLE CHILDREN ─────────────────────────────────────────────

    test('handles multiple children correctly', () => {
        const el = document.createElement('au-if');
        el.setAttribute('condition', '');
        el.innerHTML = '<p>One</p><span>Two</span><div>Three</div>';
        body.appendChild(el);

        expect(el.children.length).toBe(3);

        // Toggle off
        el.removeAttribute('condition');
        expect(el.children.length).toBe(0);

        // Toggle on — all restored
        el.setAttribute('condition', '');
        expect(el.children.length).toBe(3);
        expect(el.querySelector('p').textContent).toBe('One');
        expect(el.querySelector('span').textContent).toBe('Two');
        expect(el.querySelector('div').textContent).toBe('Three');
    });

    // ── PROPERTY: .condition GETTER ───────────────────────────────────

    test('.condition getter returns boolean reflecting attribute', () => {
        const el = document.createElement('au-if');
        body.appendChild(el);

        expect(el.condition).toBe(false);

        el.setAttribute('condition', '');
        expect(el.condition).toBe(true);
    });

    // ── PROPERTY: .condition SETTER ───────────────────────────────────

    test('.condition = true sets attribute', () => {
        const el = document.createElement('au-if');
        el.innerHTML = '<p>Test</p>';
        body.appendChild(el);

        el.condition = true;
        expect(el.hasAttribute('condition')).toBe(true);
        expect(el.children.length).toBe(1);
    });

    test('.condition = false removes attribute', () => {
        const el = document.createElement('au-if');
        el.setAttribute('condition', '');
        el.innerHTML = '<p>Test</p>';
        body.appendChild(el);

        el.condition = false;
        expect(el.hasAttribute('condition')).toBe(false);
        expect(el.children.length).toBe(0);
    });

    // ── ELSE TEMPLATE ─────────────────────────────────────────────────

    test('else template content shown when condition is false', () => {
        // Create template
        const tpl = document.createElement('template');
        tpl.id = 'else-tpl';
        tpl.innerHTML = '<span>Fallback</span>';
        body.appendChild(tpl);

        // Create au-if with else reference
        const el = document.createElement('au-if');
        el.setAttribute('else', 'else-tpl');
        el.innerHTML = '<p>Main</p>';
        body.appendChild(el);

        // Condition is absent → else template should render
        expect(el.querySelector('span')).not.toBeNull();
        expect(el.querySelector('span').textContent).toBe('Fallback');
        // Original children should be gone
        expect(el.querySelector('p')).toBeNull();
    });

    test('else content removed when condition becomes true', () => {
        // Create template
        const tpl = document.createElement('template');
        tpl.id = 'else-tpl-2';
        tpl.innerHTML = '<span>Fallback</span>';
        body.appendChild(tpl);

        // Start with condition false
        const el = document.createElement('au-if');
        el.setAttribute('else', 'else-tpl-2');
        el.innerHTML = '<p>Main</p>';
        body.appendChild(el);

        // Else should be visible
        expect(el.querySelector('span')).not.toBeNull();

        // Toggle to true
        el.setAttribute('condition', '');

        // Else content removed, original children restored
        expect(el.querySelector('span')).toBeNull();
        expect(el.querySelector('p')).not.toBeNull();
        expect(el.querySelector('p').textContent).toBe('Main');
    });

    test('missing else template ID does not crash', () => {
        const el = document.createElement('au-if');
        el.setAttribute('else', 'nonexistent-id');
        el.innerHTML = '<p>Main</p>';

        // Should not throw
        expect(() => body.appendChild(el)).not.toThrow();
        expect(el.children.length).toBe(0);
    });

    test('else attribute with empty string does not crash', () => {
        const el = document.createElement('au-if');
        el.setAttribute('else', '');
        el.innerHTML = '<p>Main</p>';

        expect(() => body.appendChild(el)).not.toThrow();
    });

    // ── EVENTS ────────────────────────────────────────────────────────

    test('au-show event dispatched when condition becomes true', () => {
        const el = document.createElement('au-if');
        el.innerHTML = '<p>Content</p>';
        body.appendChild(el);

        let showFired = false;
        el.addEventListener('au-show', () => { showFired = true; });

        el.setAttribute('condition', '');
        expect(showFired).toBe(true);
    });

    test('au-hide event dispatched when condition becomes false', () => {
        const el = document.createElement('au-if');
        el.setAttribute('condition', '');
        el.innerHTML = '<p>Content</p>';
        body.appendChild(el);

        let hideFired = false;
        el.addEventListener('au-hide', () => { hideFired = true; });

        el.removeAttribute('condition');
        expect(hideFired).toBe(true);
    });

    test('no spurious events on initial render with condition=true', () => {
        const el = document.createElement('au-if');
        el.setAttribute('condition', '');
        el.innerHTML = '<p>Content</p>';

        let eventCount = 0;
        el.addEventListener('au-show', () => { eventCount++; });
        el.addEventListener('au-hide', () => { eventCount++; });

        body.appendChild(el);

        // render() itself should not fire show/hide events
        expect(eventCount).toBe(0);
    });

    test('no spurious events on initial render with condition=false', () => {
        const el = document.createElement('au-if');
        el.innerHTML = '<p>Content</p>';

        let eventCount = 0;
        el.addEventListener('au-show', () => { eventCount++; });
        el.addEventListener('au-hide', () => { eventCount++; });

        body.appendChild(el);
        expect(eventCount).toBe(0);
    });

    // ── CLEANUP ───────────────────────────────────────────────────────

    test('disconnectedCallback releases fragment references', () => {
        const el = document.createElement('au-if');
        el.innerHTML = '<p>Content</p>';
        body.appendChild(el);

        // Children stored in fragment
        expect(el.children.length).toBe(0);

        // Disconnect
        el.remove();

        // Should not throw on subsequent operations
        expect(() => { el.condition = true; }).not.toThrow();
    });

    // ── DESCRIBE ──────────────────────────────────────────────────────

    test('static describe() returns component metadata', () => {
        const info = AuIf.describe();
        expect(info).toBeDefined();
        expect(info.name || info.runtime).toBeDefined();
    });

    // ── XSS SAFETY ────────────────────────────────────────────────────

    test('else attribute with script injection attempt is safe', () => {
        const el = document.createElement('au-if');
        // Attempt XSS via else attribute — should just fail to find template
        el.setAttribute('else', '"><script>alert(1)</script>');
        el.innerHTML = '<p>Main</p>';

        expect(() => body.appendChild(el)).not.toThrow();
        // No script should be injected
        expect(el.querySelector('script')).toBeNull();
    });

    // ── NESTED ────────────────────────────────────────────────────────

    test('works when nested inside another au-if', () => {
        const outer = document.createElement('au-if');
        outer.setAttribute('condition', '');
        const inner = document.createElement('au-if');
        inner.setAttribute('condition', '');
        inner.innerHTML = '<p>Nested</p>';
        outer.appendChild(inner);
        body.appendChild(outer);

        expect(inner.querySelector('p').textContent).toBe('Nested');

        // Toggle outer off — both should hide
        outer.removeAttribute('condition');
        expect(outer.children.length).toBe(0);

        // Toggle outer on — inner should be restored with its children
        outer.setAttribute('condition', '');
        const restoredInner = outer.querySelector('au-if');
        expect(restoredInner).not.toBeNull();
        expect(restoredInner.querySelector('p').textContent).toBe('Nested');
    });

    // ── EMPTY AU-IF ───────────────────────────────────────────────────

    test('works with no children', () => {
        const el = document.createElement('au-if');
        body.appendChild(el);

        // Should not crash
        expect(() => {
            el.condition = true;
            el.condition = false;
        }).not.toThrow();
    });

    // ── RAPID TOGGLE ──────────────────────────────────────────────────

    test('rapid toggle does not corrupt DOM', () => {
        const el = document.createElement('au-if');
        el.setAttribute('condition', '');
        el.innerHTML = '<p>Stable</p>';
        body.appendChild(el);

        // Rapid toggling
        for (let i = 0; i < 10; i++) {
            el.condition = false;
            el.condition = true;
        }

        expect(el.children.length).toBe(1);
        expect(el.querySelector('p').textContent).toBe('Stable');
    });
});
