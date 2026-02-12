/**
 * @fileoverview Unit Tests for au-schema-form Component
 * Complex component: 443 lines, auto-generated forms from JSON Schema
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuSchemaForm;

const SIMPLE_SCHEMA = {
    type: 'object',
    properties: {
        name: { type: 'string', label: 'Name' },
        email: { type: 'string', format: 'email', label: 'Email' },
        age: { type: 'number', label: 'Age', minimum: 0, maximum: 150 },
    },
    required: ['name', 'email'],
};

describe('au-schema-form Unit Tests', () => {

    beforeAll(async () => {

        const module = await import('../../src/components/au-schema-form.js');
        AuSchemaForm = module.AuSchemaForm;

        // Patch emit for test environment
        AuSchemaForm.prototype.emit = function (eventName, detail) {
            try { this.dispatchEvent(new Event(eventName, { bubbles: false })); } catch (e) { }
        };
    });

    beforeEach(() => resetBody());

    // ─── REGISTRATION ──────────────────────────────────────────────
    test('should be registered', () => {
        expect(customElements.get('au-schema-form')).toBe(AuSchemaForm);
    });

    test('should have correct baseClass', () => {
        expect(AuSchemaForm.baseClass).toBe('au-schema-form');
    });

    test('should use schema-form cssFile', () => {
        expect(AuSchemaForm.cssFile).toBe('schema-form');
    });

    // ─── SCHEMA SETTER ─────────────────────────────────────────────
    test('should accept schema via setter', () => {
        const el = document.createElement('au-schema-form');
        body.appendChild(el);

        el.schema = SIMPLE_SCHEMA;
        expect(el.schema).toBeTruthy();
    });

    test('should render form fields from schema', () => {
        const el = document.createElement('au-schema-form');
        body.appendChild(el);

        el.schema = SIMPLE_SCHEMA;
        const fields = el.querySelectorAll('au-input, au-select, au-textarea, au-switch, input, select, textarea');
        expect(fields.length).toBeGreaterThanOrEqual(3);
    });

    test('should render form container', () => {
        const el = document.createElement('au-schema-form');
        body.appendChild(el);

        el.schema = SIMPLE_SCHEMA;
        // The component wraps content in its own form structure
        const container = el.querySelector('.au-schema-form__form') || el.querySelector('form') || el.firstElementChild;
        expect(container).toBeTruthy();
    });

    // ─── VALUES ─────────────────────────────────────────────────────
    test('getValues should return current values', () => {
        const el = document.createElement('au-schema-form');
        body.appendChild(el);

        el.schema = SIMPLE_SCHEMA;
        const values = el.getValues();
        expect(typeof values).toBe('object');
    });

    test('setValues should update form values', () => {
        const el = document.createElement('au-schema-form');
        body.appendChild(el);

        el.schema = SIMPLE_SCHEMA;
        el.setValues({ name: 'Test User', email: 'test@test.com' });

        const values = el.getValues();
        expect(values.name).toBe('Test User');
        expect(values.email).toBe('test@test.com');
    });

    test('getValues should return a copy', () => {
        const el = document.createElement('au-schema-form');
        body.appendChild(el);

        el.schema = SIMPLE_SCHEMA;
        const values1 = el.getValues();
        const values2 = el.getValues();
        expect(values1).not.toBe(values2);
    });

    // ─── VALIDATION ─────────────────────────────────────────────────
    test('validate should return false for missing required fields', () => {
        const el = document.createElement('au-schema-form');
        body.appendChild(el);

        el.schema = SIMPLE_SCHEMA;
        // Don't set values — required fields are empty
        const isValid = el.validate();
        expect(isValid).toBe(false);
    });

    test('validate should return true for valid data', () => {
        const el = document.createElement('au-schema-form');
        body.appendChild(el);

        el.schema = SIMPLE_SCHEMA;
        el.setValues({ name: 'Alice', email: 'alice@test.com', age: 30 });
        const isValid = el.validate();
        expect(isValid).toBe(true);
    });

    test('getErrors should return error object', () => {
        const el = document.createElement('au-schema-form');
        body.appendChild(el);

        el.schema = SIMPLE_SCHEMA;
        el.validate(); // will fail for required fields
        const errors = el.getErrors();
        expect(typeof errors).toBe('object');
    });

    test('getErrors should have errors for missing required fields', () => {
        const el = document.createElement('au-schema-form');
        body.appendChild(el);

        el.schema = SIMPLE_SCHEMA;
        el.validate();
        const errors = el.getErrors();
        // name and email are required
        const hasErrors = Object.keys(errors).length > 0;
        expect(hasErrors).toBe(true);
    });

    // ─── RESET ──────────────────────────────────────────────────────
    test('reset should clear values', () => {
        const el = document.createElement('au-schema-form');
        body.appendChild(el);

        el.schema = SIMPLE_SCHEMA;
        el.setValues({ name: 'Alice', email: 'alice@test.com' });
        el.reset();

        const values = el.getValues();
        expect(values.name).toBeFalsy();
    });

    test('reset should clear errors', () => {
        const el = document.createElement('au-schema-form');
        body.appendChild(el);

        el.schema = SIMPLE_SCHEMA;
        el.validate(); // Generate errors
        el.reset();

        const errors = el.getErrors();
        expect(Object.keys(errors).length).toBe(0);
    });

    // ─── SUBMIT ─────────────────────────────────────────────────────
    test('submit should not throw', () => {
        const el = document.createElement('au-schema-form');
        body.appendChild(el);

        el.schema = SIMPLE_SCHEMA;
        el.setValues({ name: 'Alice', email: 'alice@test.com' });
        expect(() => el.submit()).not.toThrow();
    });

    // ─── LABELS / ATTRIBUTES ────────────────────────────────────────
    test('should use custom submit label', () => {
        const el = document.createElement('au-schema-form');
        el.setAttribute('submit-label', 'Save');
        body.appendChild(el);

        el.schema = SIMPLE_SCHEMA;
        expect(el.submitLabel).toBe('Save');
    });

    test('should default submit label to Submit', () => {
        const el = document.createElement('au-schema-form');
        body.appendChild(el);

        el.schema = SIMPLE_SCHEMA;
        expect(el.submitLabel).toBe('Submit');
    });

    test('should support readonly attribute', () => {
        const el = document.createElement('au-schema-form');
        el.setAttribute('readonly', '');
        body.appendChild(el);

        expect(el.readonly).toBe(true);
    });

    test('should support disabled attribute', () => {
        const el = document.createElement('au-schema-form');
        el.setAttribute('disabled', '');
        body.appendChild(el);

        expect(el.disabled).toBe(true);
    });

    test('should support inline attribute', () => {
        const el = document.createElement('au-schema-form');
        el.setAttribute('inline', '');
        body.appendChild(el);

        expect(el.inline).toBe(true);
    });

    // ─── HANDLE ACTION ──────────────────────────────────────────────
    test('handleAction submit should not throw', () => {
        const el = document.createElement('au-schema-form');
        body.appendChild(el);

        el.schema = SIMPLE_SCHEMA;
        expect(() => el.handleAction('submit', null, { preventDefault: () => { } })).not.toThrow();
    });

    test('handleAction reset should not throw', () => {
        const el = document.createElement('au-schema-form');
        body.appendChild(el);

        el.schema = SIMPLE_SCHEMA;
        expect(() => el.handleAction('reset', null, null)).not.toThrow();
    });

    // ─── XSS IN SCHEMA ─────────────────────────────────────────────
    test('should escape label text from schema', () => {
        const xssSchema = {
            type: 'object',
            properties: {
                evil: { type: 'string', label: '<script>alert("xss")</script>' },
            },
        };
        const el = document.createElement('au-schema-form');
        body.appendChild(el);

        el.schema = xssSchema;
        expect(el.innerHTML).not.toContain('<script>alert');
    });
});
