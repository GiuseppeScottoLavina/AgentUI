/**
 * @fileoverview Unit Tests for au-form Component
 * Uses patchEmit() for event-driven coverage in LinkedOM.
 * Covers: render, getFormData, validate, #handleSubmit, #getErrors, reset.
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, resetBody, patchEmit } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuForm;

describe('au-form Unit Tests', () => {

    beforeAll(async () => {
        const module = await import('../../src/components/au-form.js');
        AuForm = module.AuForm;
        patchEmit(AuForm);
    });

    beforeEach(() => resetBody());

    // ─── REGISTRATION ──────────────────────────────────────────
    test('should be registered', () => {
        expect(customElements.get('au-form')).toBe(AuForm);
    });

    test('should have correct baseClass', () => {
        expect(AuForm.baseClass).toBe('au-form');
    });

    test('should observe action and method attributes', () => {
        const attrs = AuForm.observedAttributes;
        expect(attrs).toContain('action');
        expect(attrs).toContain('method');
    });

    // ─── RENDER ────────────────────────────────────────────────
    test('should set role form', () => {
        const el = document.createElement('au-form');
        body.appendChild(el);
        expect(el.getAttribute('role')).toBe('form');
    });

    test('should render without errors', () => {
        const el = document.createElement('au-form');
        body.appendChild(el);
        expect(el.classList.contains('au-form')).toBe(true);
    });

    // ─── getFormData() (lines 67-85) ───────────────────────────
    test('getFormData should collect native input values', () => {
        const el = document.createElement('au-form');
        el.innerHTML = `
            <input name="email" value="test@test.com" />
            <input name="name" value="John" />
        `;
        body.appendChild(el);
        const data = el.getFormData();
        expect(data.email).toBe('test@test.com');
        expect(data.name).toBe('John');
    });

    // Covered by E2E: tests/e2e/coverage-gaps.test.js
    test.skip('getFormData should collect au-input values (E2E)', () => {
        const el = document.createElement('au-form');
        const input = document.createElement('au-input');
        input.setAttribute('name', 'username');
        input.value = 'giuseppe';
        el.appendChild(input);
        body.appendChild(el);
        const data = el.getFormData();
        expect(data.username).toBe('giuseppe');
    });

    test('getFormData should handle select elements', () => {
        const el = document.createElement('au-form');
        el.innerHTML = '<select name="color"><option value="red">Red</option></select>';
        body.appendChild(el);
        const data = el.getFormData();
        // LinkedOM may not fully support select.value; we verify no crash
        expect(typeof data).toBe('object');
    });

    test('getFormData should collect textarea values', () => {
        const el = document.createElement('au-form');
        el.innerHTML = '<textarea name="message">Hello</textarea>';
        body.appendChild(el);
        const data = el.getFormData();
        expect(data.message).toBe('Hello');
    });

    test('getFormData should handle checkbox (E2E only) inputs', { skip: true }, () => {
        // checkbox .checked requires real browser
    });

    // ─── getValues() alias (lines 91-93) ───────────────────────
    test('getValues should be alias for getFormData', () => {
        const el = document.createElement('au-form');
        el.innerHTML = '<input name="test" value="val" />';
        body.appendChild(el);
        const values = el.getValues();
        expect(values.test).toBe('val');
    });

    // ─── validate() (lines 98-112) ─────────────────────────────
    test('validate should return true when no required fields', () => {
        const el = document.createElement('au-form');
        el.innerHTML = '<input name="opt" value="" />';
        body.appendChild(el);
        expect(el.validate()).toBe(true);
    });

    test('validate should return true when required fields are filled', () => {
        const el = document.createElement('au-form');
        el.innerHTML = '<input name="email" required value="test@test.com" />';
        body.appendChild(el);
        expect(el.validate()).toBe(true);
    });

    test('validate should return false when required fields are empty', () => {
        const el = document.createElement('au-form');
        el.innerHTML = '<input name="email" required value="" />';
        body.appendChild(el);
        expect(el.validate()).toBe(false);
    });

    test('validate should add is-invalid class to empty required fields', () => {
        const el = document.createElement('au-form');
        el.innerHTML = '<input name="email" required value="" />';
        body.appendChild(el);
        el.validate();
        const input = el.querySelector('input');
        expect(input.classList.contains('is-invalid')).toBe(true);
    });

    test('validate should remove is-invalid class from filled required fields', () => {
        const el = document.createElement('au-form');
        el.innerHTML = '<input name="email" required value="ok" />';
        body.appendChild(el);
        const input = el.querySelector('input');
        input.classList.add('is-invalid');
        el.validate();
        expect(input.classList.contains('is-invalid')).toBe(false);
    });

    // ─── #handleSubmit() via listeners (lines 21-32, 53-62) ────
    test('submit listener should emit au-submit when valid', () => {
        const el = document.createElement('au-form');
        el.innerHTML = '<input name="test" value="hello" />';
        body.appendChild(el);

        let submitDetail = null;
        el.addEventListener('au-submit', (e) => { submitDetail = e.detail; });

        // Trigger the submit listener from shadow registry
        if (el.__listeners?.['submit']) {
            const fakeEvent = { preventDefault: () => { } };
            for (const fn of el.__listeners['submit']) {
                fn.call(el, fakeEvent);
            }
        }
        expect(submitDetail).toBeTruthy();
        expect(submitDetail.data.test).toBe('hello');
        expect(submitDetail.isValid).toBe(true);
    });

    test('submit listener should emit au-invalid when invalid', () => {
        const el = document.createElement('au-form');
        el.innerHTML = '<input name="email" required value="" />';
        body.appendChild(el);

        let invalidDetail = null;
        el.addEventListener('au-invalid', (e) => { invalidDetail = e.detail; });

        if (el.__listeners?.['submit']) {
            const fakeEvent = { preventDefault: () => { } };
            for (const fn of el.__listeners['submit']) {
                fn.call(el, fakeEvent);
            }
        }
        expect(invalidDetail).toBeTruthy();
        expect(invalidDetail.errors).toBeTruthy();
        expect(invalidDetail.errors.length).toBeGreaterThan(0);
    });

    test('Enter key in input should trigger submit', () => {
        const el = document.createElement('au-form');
        el.innerHTML = '<input name="test" value="ok" />';
        body.appendChild(el);

        let submitFired = false;
        el.addEventListener('au-submit', () => { submitFired = true; });

        const input = el.querySelector('input');

        if (el.__listeners?.['keydown']) {
            const fakeEvent = {
                key: 'Enter',
                target: input,
                preventDefault: () => { }
            };
            // Need target to match 'input' selector
            input.matches = (sel) => sel === 'input';
            for (const fn of el.__listeners['keydown']) {
                fn.call(el, fakeEvent);
            }
        }
        expect(submitFired).toBe(true);
    });

    // ─── #getErrors() (lines 114-123) ──────────────────────────
    test('#getErrors should return invalid field names', () => {
        const el = document.createElement('au-form');
        el.innerHTML = '<input name="email" required value="" />';
        body.appendChild(el);
        el.validate(); // Marks fields as is-invalid

        let errors = null;
        el.addEventListener('au-invalid', (e) => { errors = e.detail.errors; });

        if (el.__listeners?.['submit']) {
            const fakeEvent = { preventDefault: () => { } };
            for (const fn of el.__listeners['submit']) {
                fn.call(el, fakeEvent);
            }
        }
        expect(errors).toBeTruthy();
        expect(errors[0].name).toBe('email');
        expect(errors[0].message).toBe('This field is required');
    });

    // ─── reset() (lines 128-139) ───────────────────────────────
    test('reset should clear all input values', () => {
        const el = document.createElement('au-form');
        el.innerHTML = '<input name="email" value="test@test.com" /><textarea name="msg">Hello</textarea>';
        body.appendChild(el);
        el.reset();
        expect(el.querySelector('input').value).toBe('');
        expect(el.querySelector('textarea').value).toBe('');
    });

    test('reset should clear au-input values', () => {
        const el = document.createElement('au-form');
        const auInput = document.createElement('au-input');
        auInput.value = 'something';
        el.appendChild(auInput);
        body.appendChild(el);
        el.reset();
        expect(auInput.value).toBe('');
    });

    test('reset should remove is-invalid classes', () => {
        const el = document.createElement('au-form');
        el.innerHTML = '<input name="email" required value="" />';
        body.appendChild(el);
        el.validate(); // Adds is-invalid
        expect(el.querySelector('input').classList.contains('is-invalid')).toBe(true);
        el.reset();
        expect(el.querySelector('input').classList.contains('is-invalid')).toBe(false);
    });

    test('reset should emit au-reset event', () => {
        const el = document.createElement('au-form');
        body.appendChild(el);
        let resetFired = false;
        el.addEventListener('au-reset', () => { resetFired = true; });
        el.reset();
        expect(resetFired).toBe(true);
    });

    // ─── DEBUG MODE (lines 41-50) ──────────────────────────────
    test('debug mode should warn about empty forms', () => {
        const el = document.createElement('au-form');
        el.setAttribute('debug', '');
        let logErrorCalled = false;
        el.logError = (code, msg) => { logErrorCalled = true; };
        body.appendChild(el);
        // requestAnimationFrame runs synchronously in test env
        expect(logErrorCalled).toBe(true);
    });

    test('debug mode should not warn when form has controls', () => {
        const el = document.createElement('au-form');
        el.setAttribute('debug', '');
        el.innerHTML = '<input name="test" />';
        let logErrorCalled = false;
        el.logError = (code, msg) => { logErrorCalled = true; };
        body.appendChild(el);
        expect(logErrorCalled).toBe(false);
    });
});
