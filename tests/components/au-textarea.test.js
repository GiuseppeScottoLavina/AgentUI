/**
 * @fileoverview Comprehensive Unit Tests for au-textarea Component
 * Tests: registration, render, native textarea creation, value get/set,
 *        placeholder, rows, disabled, readonly, focus(), inline styles, events
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, patchEmit, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuTextarea;

describe('au-textarea Unit Tests', () => {

    beforeAll(async () => {
        const module = await import('../../src/components/au-textarea.js');
        AuTextarea = module.AuTextarea;
        patchEmit(AuTextarea);
    });

    beforeEach(() => resetBody());

    // ========================================
    // REGISTRATION
    // ========================================

    test('should be registered', () => {
        expect(customElements.get('au-textarea')).toBe(AuTextarea);
    });

    test('should have correct baseClass', () => {
        expect(AuTextarea.baseClass).toBe('au-textarea');
    });

    test('should observe expected attributes', () => {
        const attrs = AuTextarea.observedAttributes;
        expect(attrs).toContain('placeholder');
        expect(attrs).toContain('rows');
        expect(attrs).toContain('disabled');
        expect(attrs).toContain('readonly');
        expect(attrs).toContain('name');
    });

    // ========================================
    // RENDER
    // ========================================

    test('should render native textarea element', () => {
        const el = document.createElement('au-textarea');
        body.appendChild(el);
        expect(el.querySelector('textarea')).not.toBeNull();
    });

    test('should have au-textarea__field class on textarea', () => {
        const el = document.createElement('au-textarea');
        body.appendChild(el);
        expect(el.querySelector('.au-textarea__field')).not.toBeNull();
    });

    test('should set placeholder attribute', () => {
        const el = document.createElement('au-textarea');
        el.setAttribute('placeholder', 'Enter text...');
        body.appendChild(el);
        expect(el.querySelector('textarea').placeholder).toBe('Enter text...');
    });

    test('should set rows attribute', () => {
        const el = document.createElement('au-textarea');
        el.setAttribute('rows', '6');
        body.appendChild(el);
        expect(el.querySelector('textarea').getAttribute('rows')).toBe('6');
    });

    test('should default to 4 rows', () => {
        const el = document.createElement('au-textarea');
        body.appendChild(el);
        expect(el.querySelector('textarea').getAttribute('rows')).toBe('4');
    });

    test('should set name attribute', () => {
        const el = document.createElement('au-textarea');
        el.setAttribute('name', 'description');
        body.appendChild(el);
        expect(el.querySelector('textarea').name).toBe('description');
    });

    test('render should be idempotent', () => {
        const el = document.createElement('au-textarea');
        body.appendChild(el);
        el.render();
        expect(el.querySelectorAll('textarea').length).toBe(1);
    });

    // ========================================
    // INLINE STYLES
    // ========================================

    test('should have block display', () => {
        const el = document.createElement('au-textarea');
        body.appendChild(el);
        expect(el.style.display).toBe('block');
    });

    test('textarea should have 100% width', () => {
        const el = document.createElement('au-textarea');
        body.appendChild(el);
        expect(el.querySelector('textarea').style.width).toBe('100%');
    });

    test('textarea should have vertical resize', () => {
        const el = document.createElement('au-textarea');
        body.appendChild(el);
        expect(el.querySelector('textarea').style.resize).toBe('vertical');
    });

    // ========================================
    // VALUE
    // ========================================

    test('value getter should return empty string initially', () => {
        const el = document.createElement('au-textarea');
        body.appendChild(el);
        expect(el.value).toBe('');
    });

    test('value setter should update textarea value', () => {
        const el = document.createElement('au-textarea');
        body.appendChild(el);
        el.value = 'Hello world';
        expect(el.querySelector('textarea').value).toBe('Hello world');
    });

    test('value getter should return set value', () => {
        const el = document.createElement('au-textarea');
        body.appendChild(el);
        el.value = 'Test content';
        expect(el.value).toBe('Test content');
    });

    // ========================================
    // DISABLED & READONLY
    // ========================================

    test('should disable textarea when disabled attribute set', () => {
        const el = document.createElement('au-textarea');
        el.setAttribute('disabled', '');
        body.appendChild(el);
        expect(el.querySelector('textarea').disabled).toBe(true);
    });

    test('should set readonly on textarea', () => {
        const el = document.createElement('au-textarea');
        el.setAttribute('readonly', '');
        body.appendChild(el);
        expect(el.querySelector('textarea').hasAttribute('readonly')).toBe(true);
    });

    // ========================================
    // ACCESSIBILITY
    // ========================================

    test('should set aria-label from placeholder', () => {
        const el = document.createElement('au-textarea');
        el.setAttribute('placeholder', 'Enter description');
        body.appendChild(el);
        expect(el.querySelector('textarea').getAttribute('aria-label')).toBe('Enter description');
    });

    test('should have default aria-label when no placeholder', () => {
        const el = document.createElement('au-textarea');
        body.appendChild(el);
        expect(el.querySelector('textarea').getAttribute('aria-label')).toBe('Text area');
    });

    // ========================================
    // FOCUS
    // ========================================

    test('should have focus() method', () => {
        const el = document.createElement('au-textarea');
        body.appendChild(el);
        expect(typeof el.focus).toBe('function');
    });
});
