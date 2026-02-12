/**
 * @fileoverview Unit Tests for transitions.js Module
 * Target: 58% → 90% coverage
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { parseHTML } from 'linkedom';

let supportsViewTransitions, transition, transitionNamed, navigateWithTransition;

describe('transitions Module Unit Tests', () => {

    beforeAll(async () => {
        const dom = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
        globalThis.document = dom.document;
        globalThis.window = dom.window;

        // Mock history
        globalThis.window.history = {
            pushState: () => { }
        };

        const module = await import('../../src/core/transitions.js');
        supportsViewTransitions = module.supportsViewTransitions;
        transition = module.transition;
        transitionNamed = module.transitionNamed;
        navigateWithTransition = module.navigateWithTransition;
    });

    // SUPPORTS VIEW TRANSITIONS
    test('supportsViewTransitions should be boolean', () => {
        expect(typeof supportsViewTransitions).toBe('boolean');
    });

    // TRANSITION
    test('transition should be a function', () => {
        expect(typeof transition).toBe('function');
    });

    test('transition should call callback (fallback)', async () => {
        let called = false;
        await transition(() => { called = true; });
        expect(called).toBe(true);
    });

    test('transition should handle async callback', async () => {
        let called = false;
        await transition(async () => {
            await Promise.resolve();
            called = true;
        });
        expect(called).toBe(true);
    });

    // TRANSITION NAMED
    test('transitionNamed should be a function', () => {
        expect(typeof transitionNamed).toBe('function');
    });

    test('transitionNamed should call callback (fallback)', async () => {
        let called = false;
        await transitionNamed(() => { called = true; });
        expect(called).toBe(true);
    });

    test('transitionNamed should accept name option', async () => {
        let called = false;
        await transitionNamed(() => { called = true; }, { name: 'custom' });
        expect(called).toBe(true);
    });

    // NAVIGATE WITH TRANSITION
    test('navigateWithTransition should be a function', () => {
        expect(typeof navigateWithTransition).toBe('function');
    });

    test('navigateWithTransition should call render', async () => {
        let rendered = false;
        await navigateWithTransition('/test', () => { rendered = true; });
        expect(rendered).toBe(true);
    });
});
