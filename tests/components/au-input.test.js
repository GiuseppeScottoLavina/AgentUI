/**
 * @fileoverview Comprehensive Unit Tests for au-input Component
 * Tests: registration, render, label, placeholder, value get/set,
 *        clear(), focus(), disabled state, variant/size classes,
 *        update() method, has-value class, A11Y (label-for association)
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, patchEmit, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuInput;

describe('au-input Unit Tests', () => {

    beforeAll(async () => {
        const module = await import('../../src/components/au-input.js');
        AuInput = module.AuInput;
        patchEmit(AuInput);
    });

    beforeEach(() => resetBody());

    // ========================================
    // REGISTRATION
    // ========================================

    test('should be registered', () => {
        expect(customElements.get('au-input')).toBe(AuInput);
    });

    test('should have correct baseClass', () => {
        expect(AuInput.baseClass).toBe('au-input');
    });

    test('should observe expected attributes', () => {
        const attrs = AuInput.observedAttributes;
        expect(attrs).toContain('type');
        expect(attrs).toContain('placeholder');
        expect(attrs).toContain('value');
        expect(attrs).toContain('disabled');
        expect(attrs).toContain('variant');
        expect(attrs).toContain('size');
        expect(attrs).toContain('label');
    });

    // ========================================
    // RENDER — DOM Structure
    // ========================================

    test('should render input field', () => {
        const el = document.createElement('au-input');
        el.setAttribute('label', 'Email');
        body.appendChild(el);
        expect(el.querySelector('.au-input__field')).not.toBeNull();
    });

    test('should render native input element', () => {
        const el = document.createElement('au-input');
        el.setAttribute('label', 'Name');
        body.appendChild(el);
        expect(el.querySelector('input')).not.toBeNull();
    });

    test('should render label when label attribute set', () => {
        const el = document.createElement('au-input');
        el.setAttribute('label', 'Password');
        body.appendChild(el);
        const label = el.querySelector('.au-input__label');
        expect(label).not.toBeNull();
        expect(label.textContent).toBe('Password');
    });

    test('should use placeholder as label fallback', () => {
        const el = document.createElement('au-input');
        el.setAttribute('placeholder', 'Enter email');
        body.appendChild(el);
        const label = el.querySelector('.au-input__label');
        expect(label).not.toBeNull();
        expect(label.textContent).toBe('Enter email');
    });

    test('render should be idempotent', () => {
        const el = document.createElement('au-input');
        el.setAttribute('label', 'Test');
        body.appendChild(el);
        el.render();
        expect(el.querySelectorAll('.au-input__field').length).toBe(1);
    });

    // ========================================
    // INPUT TYPE
    // ========================================

    test('should default to text type', () => {
        const el = document.createElement('au-input');
        el.setAttribute('label', 'Name');
        body.appendChild(el);
        expect(el.querySelector('input').type).toBe('text');
    });

    test('should support email type', () => {
        const el = document.createElement('au-input');
        el.setAttribute('type', 'email');
        el.setAttribute('label', 'Email');
        body.appendChild(el);
        expect(el.querySelector('input').type).toBe('email');
    });

    test('should support password type', () => {
        const el = document.createElement('au-input');
        el.setAttribute('type', 'password');
        el.setAttribute('label', 'Password');
        body.appendChild(el);
        expect(el.querySelector('input').type).toBe('password');
    });

    test('should support number type', () => {
        const el = document.createElement('au-input');
        el.setAttribute('type', 'number');
        el.setAttribute('label', 'Quantity');
        body.appendChild(el);
        expect(el.querySelector('input').type).toBe('number');
    });

    // ========================================
    // VALUE
    // ========================================

    test('should set initial value from attribute', () => {
        const el = document.createElement('au-input');
        el.setAttribute('label', 'Name');
        el.setAttribute('value', 'John');
        body.appendChild(el);
        expect(el.querySelector('input').value).toBe('John');
    });

    test('value getter should return input value', () => {
        const el = document.createElement('au-input');
        el.setAttribute('label', 'Name');
        el.setAttribute('value', 'Jane');
        body.appendChild(el);
        expect(el.value).toBe('Jane');
    });

    test('value setter should update input value', () => {
        const el = document.createElement('au-input');
        el.setAttribute('label', 'Name');
        body.appendChild(el);
        el.value = 'Updated';
        expect(el.querySelector('input').value).toBe('Updated');
    });

    test('value should default to empty string', () => {
        const el = document.createElement('au-input');
        el.setAttribute('label', 'Name');
        body.appendChild(el);
        expect(el.value).toBe('');
    });

    // ========================================
    // CLEAR
    // ========================================

    test('clear() should empty the input value', () => {
        const el = document.createElement('au-input');
        el.setAttribute('label', 'Name');
        el.setAttribute('value', 'Some text');
        body.appendChild(el);
        expect(el.value).toBe('Some text');
        el.clear();
        expect(el.value).toBe('');
    });

    // ========================================
    // HAS-VALUE CLASS
    // ========================================

    test('should add has-value class when value is set', () => {
        const el = document.createElement('au-input');
        el.setAttribute('label', 'Name');
        el.setAttribute('value', 'Hello');
        body.appendChild(el);
        expect(el.classList.contains('has-value')).toBe(true);
    });

    test('should not have has-value class when empty', () => {
        const el = document.createElement('au-input');
        el.setAttribute('label', 'Name');
        body.appendChild(el);
        expect(el.classList.contains('has-value')).toBe(false);
    });

    test('should remove has-value class on clear()', () => {
        const el = document.createElement('au-input');
        el.setAttribute('label', 'Name');
        el.setAttribute('value', 'Hello');
        body.appendChild(el);
        expect(el.classList.contains('has-value')).toBe(true);
        el.clear();
        expect(el.classList.contains('has-value')).toBe(false);
    });

    // ========================================
    // DISABLED
    // ========================================

    test('should disable input when disabled attribute set', () => {
        const el = document.createElement('au-input');
        el.setAttribute('label', 'Name');
        el.setAttribute('disabled', '');
        body.appendChild(el);
        expect(el.querySelector('input').disabled).toBe(true);
    });

    test('should add is-disabled class when disabled', () => {
        const el = document.createElement('au-input');
        el.setAttribute('label', 'Name');
        el.setAttribute('disabled', '');
        body.appendChild(el);
        expect(el.classList.contains('is-disabled')).toBe(true);
    });

    // ========================================
    // VARIANT & SIZE CLASSES
    // ========================================

    test('should default to outlined variant', () => {
        const el = document.createElement('au-input');
        el.setAttribute('label', 'Name');
        body.appendChild(el);
        expect(el.classList.contains('au-input--outlined')).toBe(true);
    });

    test('should support filled variant', () => {
        const el = document.createElement('au-input');
        el.setAttribute('label', 'Name');
        el.setAttribute('variant', 'filled');
        body.appendChild(el);
        expect(el.classList.contains('au-input--filled')).toBe(true);
    });

    test('should default to md size', () => {
        const el = document.createElement('au-input');
        el.setAttribute('label', 'Name');
        body.appendChild(el);
        expect(el.classList.contains('au-input--md')).toBe(true);
    });

    test('should always have au-input base class', () => {
        const el = document.createElement('au-input');
        el.setAttribute('label', 'Name');
        body.appendChild(el);
        expect(el.classList.contains('au-input')).toBe(true);
    });

    // ========================================
    // UPDATE
    // ========================================

    test('update should change input value', () => {
        const el = document.createElement('au-input');
        el.setAttribute('label', 'Name');
        body.appendChild(el);
        el.setAttribute('value', 'New');
        el.update('value', 'New', '');
        expect(el.querySelector('input').value).toBe('New');
    });

    test('update should change input type', () => {
        const el = document.createElement('au-input');
        el.setAttribute('label', 'Field');
        body.appendChild(el);
        el.update('type', 'email', 'text');
        expect(el.querySelector('input').type).toBe('email');
    });

    test('update should toggle disabled', () => {
        const el = document.createElement('au-input');
        el.setAttribute('label', 'Name');
        body.appendChild(el);
        el.setAttribute('disabled', '');
        el.update('disabled', '', null);
        expect(el.querySelector('input').disabled).toBe(true);
    });

    // ========================================
    // ACCESSIBILITY
    // ========================================

    test('label should have for attribute matching input id', () => {
        const el = document.createElement('au-input');
        el.setAttribute('label', 'Email');
        body.appendChild(el);
        const label = el.querySelector('.au-input__label');
        const input = el.querySelector('input');
        expect(label.getAttribute('for')).toBe(input.id);
    });

    test('should use derived ID when user sets id attribute', () => {
        const el = document.createElement('au-input');
        el.setAttribute('id', 'task-title');
        el.setAttribute('label', 'Task Title');
        body.appendChild(el);
        const input = el.querySelector('input');
        expect(input.id).toBe('task-title__field');
    });

    test('should NOT have duplicate IDs when user sets id', () => {
        const el = document.createElement('au-input');
        el.setAttribute('id', 'my-input');
        el.setAttribute('label', 'Name');
        body.appendChild(el);
        const input = el.querySelector('input');
        // Custom element ID and inner input ID must differ
        expect(el.id).not.toBe(input.id);
    });

    test('label for should match derived input ID when user sets id', () => {
        const el = document.createElement('au-input');
        el.setAttribute('id', 'email-field');
        el.setAttribute('label', 'Email');
        body.appendChild(el);
        const label = el.querySelector('.au-input__label');
        const input = el.querySelector('input');
        expect(label.getAttribute('for')).toBe('email-field__field');
        expect(label.getAttribute('for')).toBe(input.id);
    });

    test('should add aria-label when no visible label', () => {
        const el = document.createElement('au-input');
        el.setAttribute('aria-label', 'Search');
        body.appendChild(el);
        // Input should have aria-label since no visible label
        const input = el.querySelector('input');
        expect(input.getAttribute('aria-label')).toBeTruthy();
    });

    // ========================================
    // DATE/TIME TYPES — Always-float label
    // ========================================

    test('type="date" should always have has-value class', () => {
        const el = document.createElement('au-input');
        el.setAttribute('type', 'date');
        el.setAttribute('label', 'Due Date');
        body.appendChild(el);
        expect(el.classList.contains('has-value')).toBe(true);
    });

    test('type="time" should always have has-value class', () => {
        const el = document.createElement('au-input');
        el.setAttribute('type', 'time');
        el.setAttribute('label', 'Start Time');
        body.appendChild(el);
        expect(el.classList.contains('has-value')).toBe(true);
    });

    test('type="datetime-local" should always have has-value class', () => {
        const el = document.createElement('au-input');
        el.setAttribute('type', 'datetime-local');
        el.setAttribute('label', 'Meeting');
        body.appendChild(el);
        expect(el.classList.contains('has-value')).toBe(true);
    });

    test('type="month" should always have has-value class', () => {
        const el = document.createElement('au-input');
        el.setAttribute('type', 'month');
        el.setAttribute('label', 'Birth Month');
        body.appendChild(el);
        expect(el.classList.contains('has-value')).toBe(true);
    });

    test('type="week" should always have has-value class', () => {
        const el = document.createElement('au-input');
        el.setAttribute('type', 'week');
        el.setAttribute('label', 'Week');
        body.appendChild(el);
        expect(el.classList.contains('has-value')).toBe(true);
    });

    test('type="date" should keep has-value even after clear()', () => {
        const el = document.createElement('au-input');
        el.setAttribute('type', 'date');
        el.setAttribute('label', 'Due Date');
        body.appendChild(el);
        el.clear();
        expect(el.classList.contains('has-value')).toBe(true);
    });

    test('changing type from text to date should add has-value', () => {
        const el = document.createElement('au-input');
        el.setAttribute('type', 'text');
        el.setAttribute('label', 'Field');
        body.appendChild(el);
        expect(el.classList.contains('has-value')).toBe(false);

        el.setAttribute('type', 'date');
        expect(el.classList.contains('has-value')).toBe(true);
    });
});
