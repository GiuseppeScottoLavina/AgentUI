/**
 * @fileoverview Comprehensive Unit Tests for au-radio + au-radio-group Components
 * Tests: registration, render, group selection, value get/set, ARIA attributes,
 *        radio circle/dot rendering, disabled state, label, update()
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, patchEmit, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuRadioGroup, AuRadio;

describe('au-radio Unit Tests', () => {

    beforeAll(async () => {
        // PointerEvent polyfill
        globalThis.PointerEvent = globalThis.PointerEvent || class PointerEvent extends Event {
            constructor(type, init = {}) { super(type, init); }
        };

        const module = await import('../../src/components/au-radio.js');
        AuRadioGroup = module.AuRadioGroup;
        AuRadio = module.AuRadio;
        patchEmit(AuRadioGroup);
        patchEmit(AuRadio);
    });

    beforeEach(() => resetBody());

    // ========================================
    // REGISTRATION
    // ========================================

    test('au-radio-group should be registered', () => {
        expect(customElements.get('au-radio-group')).toBe(AuRadioGroup);
    });

    test('au-radio should be registered', () => {
        expect(customElements.get('au-radio')).toBe(AuRadio);
    });

    test('au-radio-group should have correct baseClass', () => {
        expect(AuRadioGroup.baseClass).toBe('au-radio-group');
    });

    test('au-radio should have correct baseClass', () => {
        expect(AuRadio.baseClass).toBe('au-radio');
    });

    test('au-radio-group should observe name and value', () => {
        expect(AuRadioGroup.observedAttributes).toContain('name');
        expect(AuRadioGroup.observedAttributes).toContain('value');
    });

    test('au-radio should observe relevant attributes', () => {
        const attrs = AuRadio.observedAttributes;
        expect(attrs).toContain('value');
        expect(attrs).toContain('checked');
        expect(attrs).toContain('disabled');
        expect(attrs).toContain('label');
    });

    // ========================================
    // AU-RADIO-GROUP RENDER
    // ========================================

    test('group should have flex column display', () => {
        const group = document.createElement('au-radio-group');
        body.appendChild(group);
        expect(group.style.display).toBe('flex');
        expect(group.style.flexDirection).toBe('column');
    });

    test('group should have 8px gap', () => {
        const group = document.createElement('au-radio-group');
        body.appendChild(group);
        expect(group.style.gap).toBe('8px');
    });

    test('group should set role radiogroup', () => {
        const group = document.createElement('au-radio-group');
        body.appendChild(group);
        expect(group.getAttribute('role')).toBe('radiogroup');
    });

    // ========================================
    // AU-RADIO RENDER — DOM Structure
    // ========================================

    test('should render circle element', () => {
        const el = document.createElement('au-radio');
        el.setAttribute('value', 'a');
        el.textContent = 'Option A';
        body.appendChild(el);
        expect(el.querySelector('.au-radio__circle')).not.toBeNull();
    });

    test('should render dot element inside circle', () => {
        const el = document.createElement('au-radio');
        el.setAttribute('value', 'a');
        el.textContent = 'Option A';
        body.appendChild(el);
        const dot = el.querySelector('.au-radio__dot');
        expect(dot).not.toBeNull();
    });

    test('should render label element', () => {
        const el = document.createElement('au-radio');
        el.setAttribute('value', 'a');
        el.textContent = 'Option A';
        body.appendChild(el);
        const label = el.querySelector('.au-radio__label');
        expect(label).not.toBeNull();
        expect(label.textContent).toContain('Option A');
    });

    // ========================================
    // AU-RADIO INLINE STYLES
    // ========================================

    test('should have inline-flex display', () => {
        const el = document.createElement('au-radio');
        el.setAttribute('value', 'a');
        el.textContent = 'A';
        body.appendChild(el);
        expect(el.style.display).toBe('inline-flex');
    });

    test('should have pointer cursor when enabled', () => {
        const el = document.createElement('au-radio');
        el.setAttribute('value', 'a');
        el.textContent = 'A';
        body.appendChild(el);
        expect(el.style.cursor).toBe('pointer');
    });

    test('should have 48px minimum touch target', () => {
        const el = document.createElement('au-radio');
        el.setAttribute('value', 'a');
        el.textContent = 'A';
        body.appendChild(el);
        expect(el.style.minHeight).toBe('48px');
    });

    // ========================================
    // AU-RADIO ACCESSIBILITY
    // ========================================

    test('should set role radio', () => {
        const el = document.createElement('au-radio');
        el.setAttribute('value', 'a');
        el.textContent = 'A';
        body.appendChild(el);
        expect(el.getAttribute('role')).toBe('radio');
    });

    test('should set aria-checked false when unchecked', () => {
        const el = document.createElement('au-radio');
        el.setAttribute('value', 'a');
        el.textContent = 'A';
        body.appendChild(el);
        expect(el.getAttribute('aria-checked')).toBe('false');
    });

    test('should set aria-checked true when checked', () => {
        const el = document.createElement('au-radio');
        el.setAttribute('value', 'a');
        el.setAttribute('checked', '');
        el.textContent = 'A';
        body.appendChild(el);
        expect(el.getAttribute('aria-checked')).toBe('true');
    });

    test('should set tabindex 0 when enabled', () => {
        const el = document.createElement('au-radio');
        el.setAttribute('value', 'a');
        el.textContent = 'A';
        body.appendChild(el);
        expect(el.getAttribute('tabindex')).toBe('0');
    });

    test('should set tabindex -1 when disabled', () => {
        const el = document.createElement('au-radio');
        el.setAttribute('value', 'a');
        el.setAttribute('disabled', '');
        el.textContent = 'A';
        body.appendChild(el);
        expect(el.getAttribute('tabindex')).toBe('-1');
    });

    // ========================================
    // CIRCLE & DOT STYLING (MD3)
    // ========================================

    test('circle should have 20px dimensions', () => {
        const el = document.createElement('au-radio');
        el.setAttribute('value', 'a');
        el.textContent = 'A';
        body.appendChild(el);
        const circle = el.querySelector('.au-radio__circle');
        expect(circle.style.width).toBe('20px');
        expect(circle.style.height).toBe('20px');
    });

    test('circle should be round (50% radius)', () => {
        const el = document.createElement('au-radio');
        el.setAttribute('value', 'a');
        el.textContent = 'A';
        body.appendChild(el);
        const circle = el.querySelector('.au-radio__circle');
        expect(circle.style.borderRadius).toBe('50%');
    });

    test('dot should have 10px dimensions', () => {
        const el = document.createElement('au-radio');
        el.setAttribute('value', 'a');
        el.textContent = 'A';
        body.appendChild(el);
        const dot = el.querySelector('.au-radio__dot');
        expect(dot.style.width).toBe('10px');
        expect(dot.style.height).toBe('10px');
    });

    test('dot should be scaled to 0 when unchecked', () => {
        const el = document.createElement('au-radio');
        el.setAttribute('value', 'a');
        el.textContent = 'A';
        body.appendChild(el);
        const dot = el.querySelector('.au-radio__dot');
        expect(dot.style.transform).toBe('scale(0)');
    });

    test('dot should be scaled to 0.5 when checked', () => {
        const el = document.createElement('au-radio');
        el.setAttribute('value', 'a');
        el.setAttribute('checked', '');
        el.textContent = 'A';
        body.appendChild(el);
        const dot = el.querySelector('.au-radio__dot');
        expect(dot.style.transform).toBe('scale(0.5)');
    });

    // ========================================
    // DISABLED STATE
    // ========================================

    test('disabled radio should have not-allowed cursor', () => {
        const el = document.createElement('au-radio');
        el.setAttribute('value', 'a');
        el.setAttribute('disabled', '');
        el.textContent = 'A';
        body.appendChild(el);
        expect(el.style.cursor).toBe('not-allowed');
    });

    test('should set aria-disabled true when disabled', () => {
        const el = document.createElement('au-radio');
        el.setAttribute('value', 'a');
        el.setAttribute('disabled', '');
        el.textContent = 'A';
        body.appendChild(el);
        expect(el.getAttribute('aria-disabled')).toBe('true');
    });

    // ========================================
    // GROUP VALUE GETTER/SETTER
    // ========================================

    test('group value getter should return current value', () => {
        const group = document.createElement('au-radio-group');
        group.setAttribute('value', 'b');
        body.appendChild(group);
        expect(group.value).toBe('b');
    });

    test('group value setter should update value attribute', () => {
        const group = document.createElement('au-radio-group');
        body.appendChild(group);
        group.value = 'c';
        expect(group.getAttribute('value')).toBe('c');
    });

    // ========================================
    // GROUP SELECT METHOD
    // ========================================

    test('select() should update group value', () => {
        const group = document.createElement('au-radio-group');
        body.appendChild(group);
        group.select('option1');
        expect(group.getAttribute('value')).toBe('option1');
    });

    test('select() should emit au-change with source user', () => {
        const group = document.createElement('au-radio-group');
        body.appendChild(group);

        let detail = null;
        group.addEventListener('au-change', (e) => { detail = e.detail; });
        group.select('option2');

        expect(detail).not.toBeNull();
        expect(detail.value).toBe('option2');
        expect(detail.source).toBe('user');
    });

    test('value setter should NOT emit au-change event', () => {
        const group = document.createElement('au-radio-group');
        body.appendChild(group);

        let emitted = false;
        group.addEventListener('au-change', () => { emitted = true; });
        group.value = 'option3';

        expect(emitted).toBe(false);
    });

    // ========================================
    // LABEL UPDATE
    // ========================================

    test('update with label attr should change label text', () => {
        const el = document.createElement('au-radio');
        el.setAttribute('value', 'a');
        el.textContent = 'Original';
        body.appendChild(el);

        el.update('label', 'Updated', 'Original');

        const label = el.querySelector('.au-radio__label');
        expect(label.textContent).toBe('Updated');
    });

    // ========================================
    // INITIALIZATION GUARD (anti re-render loop)
    // ========================================

    test('click during initialization frame should NOT select', () => {
        const group = document.createElement('au-radio-group');
        const radio = document.createElement('au-radio');
        radio.setAttribute('value', 'opt1');
        radio.textContent = 'Option 1';
        group.appendChild(radio);
        body.appendChild(group);

        expect(group._initializing).toBe(true);
        expect(group.value).toBe('');

        // Simulate click during initialization
        radio.click();
        expect(group.value).toBe('');
    });

    test('click AFTER initialization frame should select normally', async () => {
        const group = document.createElement('au-radio-group');
        const radio = document.createElement('au-radio');
        radio.setAttribute('value', 'opt1');
        radio.textContent = 'Option 1';
        group.appendChild(radio);
        body.appendChild(group);

        await new Promise(r => queueMicrotask(r));

        expect(group._initializing).toBe(false);
        radio.click();
        expect(group.value).toBe('opt1');
    });
});
