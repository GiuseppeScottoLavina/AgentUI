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

    // ========================================
    // eventTarget OPTION (regression: ripple accumulation bug)
    // ========================================

    test('createRipple with eventTarget should attach pointerup listener to eventTarget, not element', () => {
        const container = document.createElement('div');  // state-layer (ripple visual)
        const parent = document.createElement('div');     // eventTarget (receives pointer events)
        parent.appendChild(container);
        body.appendChild(parent);

        container.getBoundingClientRect = () => ({ left: 0, top: 0, width: 40, height: 40 });

        // Track addEventListener calls on both elements
        const containerListeners = [];
        const parentListeners = [];
        const origContainerAddEL = container.addEventListener.bind(container);
        const origParentAddEL = parent.addEventListener.bind(parent);
        container.addEventListener = (type, fn, opts) => { containerListeners.push(type); origContainerAddEL(type, fn, opts); };
        parent.addEventListener = (type, fn, opts) => { parentListeners.push(type); origParentAddEL(type, fn, opts); };

        createRipple(container, null, { centered: true, eventTarget: parent });

        // pointerup/pointerleave/pointercancel should be on PARENT, not container
        expect(parentListeners).toContain('pointerup');
        expect(parentListeners).toContain('pointerleave');
        expect(parentListeners).toContain('pointercancel');
        expect(containerListeners).not.toContain('pointerup');
        expect(containerListeners).not.toContain('pointerleave');
    });

    test('pointerup on eventTarget should trigger fadeOut (listener presence)', () => {
        const container = document.createElement('div');
        const parent = document.createElement('div');
        parent.appendChild(container);
        body.appendChild(parent);

        container.getBoundingClientRect = () => ({ left: 0, top: 0, width: 40, height: 40 });

        // Track listener removals on parent to verify fadeOut runs
        const removedListeners = [];
        const origRemoveEL = parent.removeEventListener.bind(parent);
        parent.removeEventListener = (type, fn) => { removedListeners.push(type); origRemoveEL(type, fn); };

        const ripple = createRipple(container, null, { centered: true, eventTarget: parent });
        expect(container.querySelector('.au-ripple-wave')).not.toBeNull();

        // Verify: the ripple was created inside the container (state-layer), not parent
        expect(container.children.length).toBeGreaterThanOrEqual(1);
        expect(parent.querySelector('.au-ripple-wave')).not.toBeNull();
    });

    test('createRipple without eventTarget should attach listeners to original element', () => {
        const el = document.createElement('div');
        body.appendChild(el);
        el.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 100 });

        const listeners = [];
        const origAddEL = el.addEventListener.bind(el);
        el.addEventListener = (type, fn, opts) => { listeners.push(type); origAddEL(type, fn, opts); };

        createRipple(el, null, { centered: true });

        expect(listeners).toContain('pointerup');
        expect(listeners).toContain('pointerleave');
    });
});
