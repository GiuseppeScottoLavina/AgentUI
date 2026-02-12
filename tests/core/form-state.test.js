/**
 * @fileoverview Unit Tests for form-state.js Module
 * Target: 84% → 95% coverage
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { parseHTML } from 'linkedom';

let createFormState;

describe('form-state Module Unit Tests', () => {

    beforeAll(async () => {
        const dom = parseHTML('<!DOCTYPE html><html><body></body></html>');
        globalThis.document = dom.document;
        globalThis.window = dom.window;
        globalThis.HTMLElement = dom.HTMLElement;
        globalThis.MutationObserver = class { observe() { } disconnect() { } };

        const module = await import('../../src/core/form-state.js');
        createFormState = module.createFormState;
    });

    beforeEach(() => {
        globalThis.document.body.innerHTML = '';
    });

    // CREATE FORM STATE
    test('createFormState should be a function', () => {
        expect(typeof createFormState).toBe('function');
    });

    test('createFormState should return object', () => {
        const form = globalThis.document.createElement('form');
        const state = createFormState(form, {});
        expect(typeof state).toBe('object');
    });

    test('createFormState should have fields property', () => {
        const form = globalThis.document.createElement('form');
        const state = createFormState(form, {});
        expect(state.fields).toBeDefined();
    });

    test('createFormState should have isValid property', () => {
        const form = globalThis.document.createElement('form');
        const state = createFormState(form, {});
        expect(typeof state.isValid).toBe('boolean');
    });

    test('createFormState should have isDirty property', () => {
        const form = globalThis.document.createElement('form');
        const state = createFormState(form, {});
        expect(typeof state.isDirty).toBe('boolean');
    });

    test('createFormState should have isSubmitting property', () => {
        const form = globalThis.document.createElement('form');
        const state = createFormState(form, {});
        expect(typeof state.isSubmitting).toBe('boolean');
    });

    test('createFormState should have getValues method', () => {
        const form = globalThis.document.createElement('form');
        const state = createFormState(form, {});
        expect(typeof state.getValues).toBe('function');
    });

    test('createFormState should have getErrors method', () => {
        const form = globalThis.document.createElement('form');
        const state = createFormState(form, {});
        expect(typeof state.getErrors).toBe('function');
    });

    test('createFormState should have reset method', () => {
        const form = globalThis.document.createElement('form');
        const state = createFormState(form, {});
        expect(typeof state.reset).toBe('function');
    });

    test('createFormState should have validate method', () => {
        const form = globalThis.document.createElement('form');
        const state = createFormState(form, {});
        expect(typeof state.validate).toBe('function');
    });

    // WITH SCHEMA
    test('should create field from schema', () => {
        const form = globalThis.document.createElement('form');
        form.innerHTML = '<input name="email" value="">';
        const state = createFormState(form, { email: { required: true } });
        expect(state.fields.email).toBeDefined();
    });

    test('field should have value property', () => {
        const form = globalThis.document.createElement('form');
        form.innerHTML = '<input name="email" value="test@example.com">';
        const state = createFormState(form, { email: {} });
        expect(state.fields.email.value).toBe('test@example.com');
    });

    test('field should have error property', () => {
        const form = globalThis.document.createElement('form');
        form.innerHTML = '<input name="email" value="">';
        const state = createFormState(form, { email: { required: true } });
        expect(state.fields.email.error).toBeDefined();
    });

    test('field should have touched property', () => {
        const form = globalThis.document.createElement('form');
        form.innerHTML = '<input name="email" value="">';
        const state = createFormState(form, { email: {} });
        expect(state.fields.email.touched).toBe(false);
    });

    test('field should have dirty property', () => {
        const form = globalThis.document.createElement('form');
        form.innerHTML = '<input name="email" value="">';
        const state = createFormState(form, { email: {} });
        expect(state.fields.email.dirty).toBe(false);
    });

    // VALIDATION
    test('isValid should be true for valid form', () => {
        const form = globalThis.document.createElement('form');
        form.innerHTML = '<input name="email" value="test@example.com">';
        const state = createFormState(form, { email: { type: 'email' } });
        expect(state.isValid).toBe(true);
    });

    test('isValid should be false for invalid form', () => {
        const form = globalThis.document.createElement('form');
        form.innerHTML = '<input name="email" value="">';
        const state = createFormState(form, { email: { required: true } });
        expect(state.isValid).toBe(false);
    });

    // METHODS
    test('getValues should return all values', () => {
        const form = globalThis.document.createElement('form');
        form.innerHTML = '<input name="email" value="test@example.com">';
        const state = createFormState(form, { email: {} });
        expect(state.getValues().email).toBe('test@example.com');
    });

    test('getErrors should return all errors', () => {
        const form = globalThis.document.createElement('form');
        form.innerHTML = '<input name="email" value="">';
        const state = createFormState(form, { email: { required: true } });
        expect(state.getErrors().email).toBeDefined();
    });

    test('reset should clear values', () => {
        const form = globalThis.document.createElement('form');
        form.innerHTML = '<input name="email" value="test@example.com">';
        const state = createFormState(form, { email: {} });
        state.reset();
        expect(state.isDirty).toBe(false);
    });

    test('validate should return boolean', () => {
        const form = globalThis.document.createElement('form');
        form.innerHTML = '<input name="email" value="test@example.com">';
        const state = createFormState(form, { email: {} });
        expect(typeof state.validate()).toBe('boolean');
    });
});
