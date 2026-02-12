/**
 * @fileoverview Unit Tests for AuElement Base Class
 */

import { describe, test, expect, beforeAll } from 'bun:test';

// Setup linkedom for DOM testing
import { parseHTML } from 'linkedom';
const { document, customElements, HTMLElement } = parseHTML('<!DOCTYPE html><html><body></body></html>');
globalThis.document = document;
globalThis.customElements = customElements;
globalThis.HTMLElement = HTMLElement;
globalThis.CustomEvent = class CustomEvent extends Event {
    constructor(type, options = {}) {
        super(type, options);
        this.detail = options.detail;
    }
};

describe('AuElement Base Class', () => {
    let AuElement, define;

    beforeAll(async () => {
        const module = await import('../../src/core/AuElement.js');
        AuElement = module.AuElement;
        define = module.define;
    });

    test('AuElement should be defined', () => {
        expect(AuElement).toBeDefined();
        expect(typeof AuElement).toBe('function');
    });

    test('AuElement should extend HTMLElement', () => {
        expect(AuElement.prototype instanceof HTMLElement).toBe(true);
    });

    test('define() should register custom element', () => {
        class TestElement extends AuElement {
            static baseClass = 'test-element';
        }

        define('test-element', TestElement);
        expect(customElements.get('test-element')).toBe(TestElement);
    });

    test('define() should not re-register existing element', () => {
        class TestElement2 extends AuElement { }
        class TestElement2Alt extends AuElement { }

        define('test-element-2', TestElement2);
        define('test-element-2', TestElement2Alt); // Should not throw

        expect(customElements.get('test-element-2')).toBe(TestElement2);
    });

    test('AuElement should have static observedAttributes', () => {
        expect(Array.isArray(AuElement.observedAttributes)).toBe(true);
    });

    test('AuElement should have static baseClass', () => {
        expect(typeof AuElement.baseClass).toBe('string');
    });

    test('connectedCallback should add base class', () => {
        class ClassTestElement extends AuElement {
            static baseClass = 'my-base-class';
        }
        define('class-test-element', ClassTestElement);

        const el = document.createElement('class-test-element');
        document.body.appendChild(el);

        expect(el.classList.contains('my-base-class')).toBe(true);
    });

    test('connectedCallback should call render()', () => {
        let renderCalled = false;

        class RenderTestElement extends AuElement {
            render() {
                renderCalled = true;
            }
        }
        define('render-test-element', RenderTestElement);

        const el = document.createElement('render-test-element');
        document.body.appendChild(el);

        expect(renderCalled).toBe(true);
    });

    test('attr() helper should return attribute value', () => {
        class AttrTestElement extends AuElement { }
        define('attr-test-element', AttrTestElement);

        const el = document.createElement('attr-test-element');
        el.setAttribute('variant', 'primary');
        document.body.appendChild(el);

        expect(el.attr('variant')).toBe('primary');
        expect(el.attr('missing', 'default')).toBe('default');
    });

    test('has() helper should check attribute existence', () => {
        class HasTestElement extends AuElement { }
        define('has-test-element', HasTestElement);

        const el = document.createElement('has-test-element');
        el.setAttribute('disabled', '');
        document.body.appendChild(el);

        expect(el.has('disabled')).toBe(true);
        expect(el.has('readonly')).toBe(false);
    });

    // Note: emit() uses dispatchEvent which has readonly property issues in linkedom
    // This is tested in E2E browser tests instead
    test.skip('emit() should dispatch custom event (tested in E2E)', () => { });
});
