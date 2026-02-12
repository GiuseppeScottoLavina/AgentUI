/**
 * @fileoverview Comprehensive Unit Tests for au-switch Component
 * Tests: registration, render, toggle, checked get/set, disabled state,
 *        ARIA attributes, inline styles, track/thumb structure, label
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, patchEmit, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuSwitch;

describe('au-switch Unit Tests', () => {

    beforeAll(async () => {
        // PointerEvent polyfill
        globalThis.PointerEvent = globalThis.PointerEvent || class PointerEvent extends Event {
            constructor(type, init = {}) { super(type, init); }
        };

        const module = await import('../../src/components/au-switch.js');
        AuSwitch = module.AuSwitch;
        patchEmit(AuSwitch);
    });

    beforeEach(() => resetBody());

    // ========================================
    // REGISTRATION
    // ========================================

    test('should be registered', () => {
        expect(customElements.get('au-switch')).toBe(AuSwitch);
    });

    test('should have correct baseClass', () => {
        expect(AuSwitch.baseClass).toBe('au-switch');
    });

    test('should observe expected attributes', () => {
        const attrs = AuSwitch.observedAttributes;
        expect(attrs).toContain('checked');
        expect(attrs).toContain('disabled');
        expect(attrs).toContain('label');
    });

    // ========================================
    // RENDER — DOM Structure
    // ========================================

    test('should render track element', () => {
        const el = document.createElement('au-switch');
        body.appendChild(el);
        expect(el.querySelector('.au-switch__track')).not.toBeNull();
    });

    test('should render thumb element inside track', () => {
        const el = document.createElement('au-switch');
        body.appendChild(el);
        const thumb = el.querySelector('.au-switch__thumb');
        expect(thumb).not.toBeNull();
        expect(thumb.parentElement.classList.contains('au-switch__track')).toBe(true);
    });

    test('should render label when label attribute set', () => {
        const el = document.createElement('au-switch');
        el.setAttribute('label', 'Dark mode');
        body.appendChild(el);
        const label = el.querySelector('.au-switch__label');
        expect(label).not.toBeNull();
        expect(label.textContent).toBe('Dark mode');
    });

    test('should render label from textContent', () => {
        const el = document.createElement('au-switch');
        el.textContent = 'Notifications';
        body.appendChild(el);
        const label = el.querySelector('.au-switch__label');
        expect(label).not.toBeNull();
        expect(label.textContent).toBe('Notifications');
    });

    test('render should be idempotent', () => {
        const el = document.createElement('au-switch');
        body.appendChild(el);
        el.render();
        expect(el.querySelectorAll('.au-switch__track').length).toBe(1);
    });

    // ========================================
    // INLINE STYLES
    // ========================================

    test('should have inline-flex display', () => {
        const el = document.createElement('au-switch');
        body.appendChild(el);
        expect(el.style.display).toBe('inline-flex');
    });

    test('should have pointer cursor when enabled', () => {
        const el = document.createElement('au-switch');
        body.appendChild(el);
        expect(el.style.cursor).toBe('pointer');
    });

    test('should have 12px gap', () => {
        const el = document.createElement('au-switch');
        body.appendChild(el);
        expect(el.style.gap).toBe('12px');
    });

    // ========================================
    // TRACK STYLING (MD3)
    // ========================================

    test('track should have 52px width', () => {
        const el = document.createElement('au-switch');
        body.appendChild(el);
        const track = el.querySelector('.au-switch__track');
        expect(track.style.width).toBe('52px');
    });

    test('track should have 32px height', () => {
        const el = document.createElement('au-switch');
        body.appendChild(el);
        const track = el.querySelector('.au-switch__track');
        expect(track.style.height).toBe('32px');
    });

    test('track should have pill shape (16px radius)', () => {
        const el = document.createElement('au-switch');
        body.appendChild(el);
        const track = el.querySelector('.au-switch__track');
        expect(track.style.borderRadius).toBe('16px');
    });

    // ========================================
    // THUMB SIZE (MD3: 16dp off, 24dp on)
    // ========================================

    test('thumb should be 16px when unchecked', () => {
        const el = document.createElement('au-switch');
        body.appendChild(el);
        const thumb = el.querySelector('.au-switch__thumb');
        expect(thumb.style.width).toBe('16px');
        expect(thumb.style.height).toBe('16px');
    });

    test('thumb should be 24px when checked', () => {
        const el = document.createElement('au-switch');
        el.setAttribute('checked', '');
        body.appendChild(el);
        const thumb = el.querySelector('.au-switch__thumb');
        expect(thumb.style.width).toBe('24px');
        expect(thumb.style.height).toBe('24px');
    });

    test('thumb position should change for checked/unchecked', () => {
        const el = document.createElement('au-switch');
        body.appendChild(el);
        const thumb = el.querySelector('.au-switch__thumb');
        const offLeft = thumb.style.left;

        el.setAttribute('checked', '');
        const onLeft = thumb.style.left;

        expect(offLeft).not.toBe(onLeft);
    });

    // ========================================
    // ACCESSIBILITY
    // ========================================

    test('should set role switch', () => {
        const el = document.createElement('au-switch');
        body.appendChild(el);
        expect(el.getAttribute('role')).toBe('switch');
    });

    test('should set aria-checked false when unchecked', () => {
        const el = document.createElement('au-switch');
        body.appendChild(el);
        expect(el.getAttribute('aria-checked')).toBe('false');
    });

    test('should set aria-checked true when checked', () => {
        const el = document.createElement('au-switch');
        el.setAttribute('checked', '');
        body.appendChild(el);
        expect(el.getAttribute('aria-checked')).toBe('true');
    });

    test('should set tabindex 0 when enabled', () => {
        const el = document.createElement('au-switch');
        body.appendChild(el);
        expect(el.getAttribute('tabindex')).toBe('0');
    });

    test('should set tabindex -1 when disabled', () => {
        const el = document.createElement('au-switch');
        el.setAttribute('disabled', '');
        body.appendChild(el);
        expect(el.getAttribute('tabindex')).toBe('-1');
    });

    // ========================================
    // TOGGLE
    // ========================================

    test('toggle should check an unchecked switch', () => {
        const el = document.createElement('au-switch');
        body.appendChild(el);
        expect(el.has('checked')).toBe(false);
        el.toggle();
        expect(el.has('checked')).toBe(true);
    });

    test('toggle should uncheck a checked switch', () => {
        const el = document.createElement('au-switch');
        el.setAttribute('checked', '');
        body.appendChild(el);
        expect(el.has('checked')).toBe(true);
        el.toggle();
        expect(el.has('checked')).toBe(false);
    });

    test('toggle should emit au-change with source user', () => {
        const el = document.createElement('au-switch');
        body.appendChild(el);

        let detail = null;
        el.addEventListener('au-change', (e) => { detail = e.detail; });
        el.toggle();

        expect(detail).not.toBeNull();
        expect(detail.checked).toBe(true);
        expect(detail.source).toBe('user');
    });

    test('checked setter should NOT emit au-change event', () => {
        const el = document.createElement('au-switch');
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
        const el = document.createElement('au-switch');
        body.appendChild(el);
        expect(el.checked).toBe(false);
    });

    test('checked getter should return true when checked', () => {
        const el = document.createElement('au-switch');
        el.setAttribute('checked', '');
        body.appendChild(el);
        expect(el.checked).toBe(true);
    });

    test('checked setter should set checked attribute', () => {
        const el = document.createElement('au-switch');
        body.appendChild(el);
        el.checked = true;
        expect(el.has('checked')).toBe(true);
    });

    test('checked setter should remove checked attribute', () => {
        const el = document.createElement('au-switch');
        el.setAttribute('checked', '');
        body.appendChild(el);
        el.checked = false;
        expect(el.has('checked')).toBe(false);
    });

    // ========================================
    // DISABLED STATE
    // ========================================

    test('disabled should prevent toggle on click', () => {
        const el = document.createElement('au-switch');
        el.setAttribute('disabled', '');
        body.appendChild(el);
        expect(el.checked).toBe(false);
        el.click();
        expect(el.checked).toBe(false);
    });

    test('disabled should set not-allowed cursor', () => {
        const el = document.createElement('au-switch');
        el.setAttribute('disabled', '');
        body.appendChild(el);
        expect(el.style.cursor).toBe('not-allowed');
    });

    test('should set aria-disabled true when disabled', () => {
        const el = document.createElement('au-switch');
        el.setAttribute('disabled', '');
        body.appendChild(el);
        expect(el.getAttribute('aria-disabled')).toBe('true');
    });

    test('should set aria-disabled false when enabled', () => {
        const el = document.createElement('au-switch');
        body.appendChild(el);
        expect(el.getAttribute('aria-disabled')).toBe('false');
    });

    // ========================================
    // INITIALIZATION GUARD (anti re-render loop)
    // ========================================

    test('click during initialization frame should NOT toggle', () => {
        const el = document.createElement('au-switch');
        body.appendChild(el);

        expect(el._initializing).toBe(true);
        expect(el.checked).toBe(false);
        el.click();
        expect(el.checked).toBe(false);
    });

    test('click AFTER initialization frame should toggle normally', async () => {
        const el = document.createElement('au-switch');
        body.appendChild(el);

        await new Promise(r => queueMicrotask(r));

        expect(el._initializing).toBe(false);
        el.click();
        expect(el.checked).toBe(true);
    });
});
