/**
 * @fileoverview Comprehensive Unit Tests for au-checkbox Component
 * Tests: registration, render, check/uncheck, indeterminate state,
 *        toggle(), checked get/set, disabled state, ARIA attributes,
 *        inline styles, label rendering, SVG structure
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, patchEmit, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuCheckbox;

describe('au-checkbox Unit Tests', () => {

    beforeAll(async () => {
        // PointerEvent polyfill for createRipple
        globalThis.PointerEvent = globalThis.PointerEvent || class PointerEvent extends Event {
            constructor(type, init = {}) { super(type, init); }
        };

        const module = await import('../../src/components/au-checkbox.js');
        AuCheckbox = module.AuCheckbox;
        patchEmit(AuCheckbox);
    });

    beforeEach(() => resetBody());

    // ========================================
    // REGISTRATION
    // ========================================

    test('should be registered', () => {
        expect(customElements.get('au-checkbox')).toBe(AuCheckbox);
    });

    test('should have correct baseClass', () => {
        expect(AuCheckbox.baseClass).toBe('au-checkbox');
    });

    test('should observe expected attributes', () => {
        const attrs = AuCheckbox.observedAttributes;
        expect(attrs).toContain('checked');
        expect(attrs).toContain('disabled');
        expect(attrs).toContain('name');
        expect(attrs).toContain('label');
        expect(attrs).toContain('indeterminate');
    });

    // ========================================
    // RENDER — DOM Structure
    // ========================================

    test('should render checkbox box element', () => {
        const el = document.createElement('au-checkbox');
        el.textContent = 'Accept';
        body.appendChild(el);
        expect(el.querySelector('.au-checkbox__box')).not.toBeNull();
    });

    test('should render label element', () => {
        const el = document.createElement('au-checkbox');
        el.textContent = 'Accept terms';
        body.appendChild(el);
        const label = el.querySelector('.au-checkbox__label');
        expect(label).not.toBeNull();
        expect(label.textContent).toContain('Accept terms');
    });

    test('should render SVG icon inside box', () => {
        const el = document.createElement('au-checkbox');
        el.textContent = 'Accept';
        body.appendChild(el);
        expect(el.querySelector('.au-checkbox__icon')).not.toBeNull();
    });

    test('should render checkmark path', () => {
        const el = document.createElement('au-checkbox');
        el.textContent = 'Accept';
        body.appendChild(el);
        expect(el.querySelector('.au-checkbox__check')).not.toBeNull();
    });

    test('should render indeterminate line', () => {
        const el = document.createElement('au-checkbox');
        el.textContent = 'Accept';
        body.appendChild(el);
        expect(el.querySelector('.au-checkbox__indeterminate')).not.toBeNull();
    });

    test('render should be idempotent', () => {
        const el = document.createElement('au-checkbox');
        el.textContent = 'Accept';
        body.appendChild(el);
        el.render();
        expect(el.querySelectorAll('.au-checkbox__box').length).toBe(1);
    });

    // ========================================
    // INLINE STYLES
    // ========================================

    test('should have inline-flex display', () => {
        const el = document.createElement('au-checkbox');
        el.textContent = 'Accept';
        body.appendChild(el);
        expect(el.style.display).toBe('inline-flex');
    });

    test('should have pointer cursor', () => {
        const el = document.createElement('au-checkbox');
        el.textContent = 'Accept';
        body.appendChild(el);
        expect(el.style.cursor).toBe('pointer');
    });

    test('should have 48px minimum touch target', () => {
        const el = document.createElement('au-checkbox');
        el.textContent = 'Accept';
        body.appendChild(el);
        expect(el.style.minHeight).toBe('48px');
    });

    // ========================================
    // ACCESSIBILITY
    // ========================================

    test('should set role checkbox', () => {
        const el = document.createElement('au-checkbox');
        el.textContent = 'Accept';
        body.appendChild(el);
        expect(el.getAttribute('role')).toBe('checkbox');
    });

    test('should set aria-checked false when unchecked', () => {
        const el = document.createElement('au-checkbox');
        el.textContent = 'Accept';
        body.appendChild(el);
        expect(el.getAttribute('aria-checked')).toBe('false');
    });

    test('should set aria-checked true when checked', () => {
        const el = document.createElement('au-checkbox');
        el.setAttribute('checked', '');
        el.textContent = 'Accept';
        body.appendChild(el);
        expect(el.getAttribute('aria-checked')).toBe('true');
    });

    test('should set aria-checked mixed when indeterminate', () => {
        const el = document.createElement('au-checkbox');
        el.setAttribute('indeterminate', '');
        el.textContent = 'Parent';
        body.appendChild(el);
        expect(el.getAttribute('aria-checked')).toBe('mixed');
    });

    test('should set tabindex 0 when not disabled', () => {
        const el = document.createElement('au-checkbox');
        el.textContent = 'Accept';
        body.appendChild(el);
        expect(el.getAttribute('tabindex')).toBe('0');
    });

    test('should set tabindex -1 when disabled', () => {
        const el = document.createElement('au-checkbox');
        el.setAttribute('disabled', '');
        el.textContent = 'Accept';
        body.appendChild(el);
        expect(el.getAttribute('tabindex')).toBe('-1');
    });

    // ========================================
    // TOGGLE
    // ========================================

    test('toggle should check an unchecked checkbox', () => {
        const el = document.createElement('au-checkbox');
        el.textContent = 'Accept';
        body.appendChild(el);
        expect(el.has('checked')).toBe(false);
        el.toggle();
        expect(el.has('checked')).toBe(true);
    });

    test('toggle should uncheck a checked checkbox', () => {
        const el = document.createElement('au-checkbox');
        el.setAttribute('checked', '');
        el.textContent = 'Accept';
        body.appendChild(el);
        expect(el.has('checked')).toBe(true);
        el.toggle();
        expect(el.has('checked')).toBe(false);
    });

    test('toggle should clear indeterminate state', () => {
        const el = document.createElement('au-checkbox');
        el.setAttribute('indeterminate', '');
        el.textContent = 'Parent';
        body.appendChild(el);
        expect(el.has('indeterminate')).toBe(true);
        el.toggle();
        expect(el.has('indeterminate')).toBe(false);
    });

    test('toggle should emit au-change with source user', () => {
        const el = document.createElement('au-checkbox');
        el.textContent = 'Accept';
        body.appendChild(el);

        let detail = null;
        el.addEventListener('au-change', (e) => { detail = e.detail; });
        el.toggle();

        expect(detail).not.toBeNull();
        expect(detail.checked).toBe(true);
        expect(detail.indeterminate).toBe(false);
        expect(detail.source).toBe('user');
    });

    test('checked setter should NOT emit au-change event', () => {
        const el = document.createElement('au-checkbox');
        el.textContent = 'Accept';
        body.appendChild(el);

        let emitted = false;
        el.addEventListener('au-change', () => { emitted = true; });
        el.checked = true;

        expect(emitted).toBe(false);
    });

    // ========================================
    // CHECKED GETTER/SETTER
    // ========================================

    test('checked getter should return false initially', () => {
        const el = document.createElement('au-checkbox');
        el.textContent = 'Accept';
        body.appendChild(el);
        expect(el.checked).toBe(false);
    });

    test('checked getter should return true when checked', () => {
        const el = document.createElement('au-checkbox');
        el.setAttribute('checked', '');
        el.textContent = 'Accept';
        body.appendChild(el);
        expect(el.checked).toBe(true);
    });

    test('checked setter should set checked attribute', () => {
        const el = document.createElement('au-checkbox');
        el.textContent = 'Accept';
        body.appendChild(el);
        el.checked = true;
        expect(el.has('checked')).toBe(true);
    });

    test('checked setter should remove checked attribute', () => {
        const el = document.createElement('au-checkbox');
        el.setAttribute('checked', '');
        el.textContent = 'Accept';
        body.appendChild(el);
        el.checked = false;
        expect(el.has('checked')).toBe(false);
    });

    // ========================================
    // INDETERMINATE GETTER/SETTER
    // ========================================

    test('indeterminate getter should return false by default', () => {
        const el = document.createElement('au-checkbox');
        el.textContent = 'Parent';
        body.appendChild(el);
        expect(el.indeterminate).toBe(false);
    });

    test('indeterminate setter should set indeterminate attribute', () => {
        const el = document.createElement('au-checkbox');
        el.textContent = 'Parent';
        body.appendChild(el);
        el.indeterminate = true;
        expect(el.has('indeterminate')).toBe(true);
    });

    test('indeterminate setter should remove indeterminate attribute', () => {
        const el = document.createElement('au-checkbox');
        el.setAttribute('indeterminate', '');
        el.textContent = 'Parent';
        body.appendChild(el);
        el.indeterminate = false;
        expect(el.has('indeterminate')).toBe(false);
    });

    // ========================================
    // DISABLED STATE
    // ========================================

    test('disabled should prevent toggle on click', () => {
        const el = document.createElement('au-checkbox');
        el.setAttribute('disabled', '');
        el.textContent = 'Accept';
        body.appendChild(el);
        expect(el.checked).toBe(false);
        el.click();
        expect(el.checked).toBe(false);
    });

    test('disabled should set not-allowed cursor', () => {
        const el = document.createElement('au-checkbox');
        el.setAttribute('disabled', '');
        el.textContent = 'Accept';
        body.appendChild(el);
        expect(el.style.cursor).toBe('not-allowed');
    });

    test('should set aria-disabled true when disabled', () => {
        const el = document.createElement('au-checkbox');
        el.setAttribute('disabled', '');
        el.textContent = 'Accept';
        body.appendChild(el);
        expect(el.getAttribute('aria-disabled')).toBe('true');
    });

    // ========================================
    // BOX STYLING (inline styles)
    // ========================================

    test('box should have 18px width (MD3 spec)', () => {
        const el = document.createElement('au-checkbox');
        el.textContent = 'Accept';
        body.appendChild(el);
        const box = el.querySelector('.au-checkbox__box');
        expect(box.style.width).toBe('18px');
        expect(box.style.height).toBe('18px');
    });

    test('box should have 2px border radius (MD3 spec)', () => {
        const el = document.createElement('au-checkbox');
        el.textContent = 'Accept';
        body.appendChild(el);
        const box = el.querySelector('.au-checkbox__box');
        expect(box.style.borderRadius).toBe('2px');
    });

    // ========================================
    // INITIALIZATION GUARD (anti re-render loop)
    // ========================================

    test('click during initialization frame should NOT toggle', () => {
        const el = document.createElement('au-checkbox');
        el.textContent = 'Accept';
        body.appendChild(el);

        // Immediately after connectedCallback, _initializing should be true
        // A click during this frame should NOT trigger toggle
        expect(el._initializing).toBe(true);
        expect(el.checked).toBe(false);

        // Simulate a click during initialization (event propagation from parent innerHTML)
        el.click();

        // Should NOT have toggled
        expect(el.checked).toBe(false);
    });

    test('click AFTER initialization frame should toggle normally', async () => {
        const el = document.createElement('au-checkbox');
        el.textContent = 'Accept';
        body.appendChild(el);

        // Wait for microtask to complete initialization
        await new Promise(r => queueMicrotask(r));

        expect(el._initializing).toBe(false);
        el.click();
        expect(el.checked).toBe(true);
    });

    test('toggle() method should work even during initialization', () => {
        const el = document.createElement('au-checkbox');
        el.textContent = 'Accept';
        body.appendChild(el);

        // Direct toggle() calls should always work (they are explicit API calls)
        el.toggle();
        expect(el.checked).toBe(true);
    });
});
