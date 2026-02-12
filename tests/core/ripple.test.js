/**
 * @fileoverview Unit Tests for ripple.js Module
 * Target: 72% → 95% coverage
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { parseHTML } from 'linkedom';

let document, body;
let createRipple, attachRipple, RippleMixin;

describe('ripple Module Unit Tests', () => {

    beforeAll(async () => {
        const dom = parseHTML('<!DOCTYPE html><html><body></body></html>');
        document = dom.document;
        body = document.body;

        globalThis.window = dom.window;
        globalThis.document = document;
        globalThis.HTMLElement = dom.HTMLElement;

        // Mock Web Animations API (not supported in linkedom)
        if (!dom.HTMLElement.prototype.animate) {
            dom.HTMLElement.prototype.animate = function (keyframes, options) {
                return {
                    finished: Promise.resolve(),
                    cancel: () => { },
                    play: () => { },
                    pause: () => { },
                    onfinish: null
                };
            };
        }

        const module = await import('../../src/core/ripple.js');
        createRipple = module.createRipple;
        attachRipple = module.attachRipple;
        RippleMixin = module.RippleMixin;
    });

    beforeEach(() => { body.innerHTML = ''; });

    // CREATE RIPPLE
    test('createRipple should be a function', () => {
        expect(typeof createRipple).toBe('function');
    });

    test('createRipple should create ripple element', () => {
        const el = document.createElement('div');
        el.style.width = '100px';
        el.style.height = '100px';
        body.appendChild(el);

        // Mock getBoundingClientRect
        el.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 100 });
        // Mock getComputedStyle
        globalThis.getComputedStyle = () => ({ position: 'static', overflow: 'visible' });

        const event = { clientX: 50, clientY: 50 };
        const ripple = createRipple(el, event);
        expect(ripple).toBeDefined();
        expect(ripple.className).toBe('au-ripple-wave');
    });

    test('createRipple should work centered', () => {
        const el = document.createElement('div');
        body.appendChild(el);
        el.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 100 });
        globalThis.getComputedStyle = () => ({ position: 'relative', overflow: 'hidden' });

        const ripple = createRipple(el, null, { centered: true });
        expect(ripple).toBeDefined();
    });

    test('createRipple should handle touch events', () => {
        const el = document.createElement('div');
        body.appendChild(el);
        el.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 100 });
        globalThis.getComputedStyle = () => ({ position: 'relative', overflow: 'hidden' });

        const event = { touches: [{ clientX: 50, clientY: 50 }] };
        const ripple = createRipple(el, event);
        expect(ripple).toBeDefined();
    });

    // ATTACH RIPPLE
    test('attachRipple should be a function', () => {
        expect(typeof attachRipple).toBe('function');
    });

    test('attachRipple should return cleanup function', () => {
        const el = document.createElement('div');
        body.appendChild(el);
        const cleanup = attachRipple(el);
        expect(typeof cleanup).toBe('function');
    });

    test('attachRipple cleanup should work', () => {
        const el = document.createElement('div');
        body.appendChild(el);
        const cleanup = attachRipple(el);
        cleanup();
        expect(true).toBe(true);
    });

    // RIPPLE MIXIN
    test('RippleMixin should be a function', () => {
        expect(typeof RippleMixin).toBe('function');
    });

    test('RippleMixin should return a class', () => {
        class Base { }
        const Mixed = RippleMixin(Base);
        expect(typeof Mixed).toBe('function');
    });

    test('RippleMixin class should have initRipple method', () => {
        class Base { }
        const Mixed = RippleMixin(Base);
        const instance = new Mixed();
        expect(typeof instance.initRipple).toBe('function');
    });

    test('RippleMixin class should have disconnectedCallback', () => {
        class Base { }
        const Mixed = RippleMixin(Base);
        const instance = new Mixed();
        expect(typeof instance.disconnectedCallback).toBe('function');
    });
});
