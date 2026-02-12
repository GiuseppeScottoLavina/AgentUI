/**
 * @fileoverview Unit tests for core/keyboard.js
 * Tests the centralized ESC Key Handler Stack
 */

import { describe, expect, it, beforeEach, afterEach, mock } from 'bun:test';
import { keyboard, KeyboardManager } from '../../src/core/keyboard.js';

// Polyfill KeyboardEvent for happy-dom
if (typeof globalThis.KeyboardEvent === 'undefined') {
    globalThis.KeyboardEvent = class KeyboardEvent extends Event {
        constructor(type, init = {}) {
            super(type, init);
            this.key = init.key || '';
            this.code = init.code || '';
            this.ctrlKey = init.ctrlKey || false;
            this.shiftKey = init.shiftKey || false;
            this.altKey = init.altKey || false;
            this.metaKey = init.metaKey || false;
        }
    };
}

describe('KeyboardManager Singleton', () => {
    it('should export keyboard singleton', () => {
        expect(keyboard).toBeDefined();
        expect(keyboard).toBeInstanceOf(KeyboardManager);
    });

    it('should export KeyboardManager class', () => {
        expect(KeyboardManager).toBeDefined();
        expect(typeof KeyboardManager).toBe('function');
    });
});

describe('KeyboardManager.pushEscapeHandler', () => {
    let unsubscribers = [];

    afterEach(() => {
        // Clean up all handlers after each test
        unsubscribers.forEach(unsub => unsub?.());
        unsubscribers = [];
    });

    it('should be a function', () => {
        expect(typeof keyboard.pushEscapeHandler).toBe('function');
    });

    it('should return an unsubscribe function', () => {
        const element = document.createElement('div');
        const callback = mock(() => { });

        const unsub = keyboard.pushEscapeHandler(element, callback);
        unsubscribers.push(unsub);

        expect(typeof unsub).toBe('function');
    });

    it('should increase stack depth when handler is added', () => {
        const initialDepth = keyboard.stackDepth;

        const element = document.createElement('div');
        const callback = mock(() => { });
        const unsub = keyboard.pushEscapeHandler(element, callback);
        unsubscribers.push(unsub);

        expect(keyboard.stackDepth).toBe(initialDepth + 1);
    });

    it('should decrease stack depth when unsubscribed', () => {
        const element = document.createElement('div');
        const callback = mock(() => { });

        const unsub = keyboard.pushEscapeHandler(element, callback);
        const depthAfterAdd = keyboard.stackDepth;

        unsub();

        expect(keyboard.stackDepth).toBe(depthAfterAdd - 1);
    });

    // NOTE: Event dispatching tests are skipped in unit tests due to linkedom limitations
    // ESC key behavior is verified in E2E tests (tests/e2e/)
    it.skip('should call topmost handler on ESC key (E2E only)', () => {
        const element = document.createElement('div');
        const callback = mock(() => { });

        const unsub = keyboard.pushEscapeHandler(element, callback);
        unsubscribers.push(unsub);

        // Simulate ESC key press
        const event = new KeyboardEvent('keydown', { key: 'Escape' });
        document.dispatchEvent(event);

        expect(callback).toHaveBeenCalled();
    });

    it.skip('should only call topmost handler in stack (LIFO) (E2E only)', () => {
        const element1 = document.createElement('div');
        const element2 = document.createElement('div');
        const callback1 = mock(() => { });
        const callback2 = mock(() => { });

        const unsub1 = keyboard.pushEscapeHandler(element1, callback1);
        const unsub2 = keyboard.pushEscapeHandler(element2, callback2);
        unsubscribers.push(unsub1, unsub2);

        // Simulate ESC key press
        const event = new KeyboardEvent('keydown', { key: 'Escape' });
        document.dispatchEvent(event);

        // Only the second (topmost) handler should be called
        expect(callback2).toHaveBeenCalled();
        expect(callback1).not.toHaveBeenCalled();
    });

    it.skip('should call next handler after topmost is removed (E2E only)', () => {
        const element1 = document.createElement('div');
        const element2 = document.createElement('div');
        const callback1 = mock(() => { });
        const callback2 = mock(() => { });

        const unsub1 = keyboard.pushEscapeHandler(element1, callback1);
        const unsub2 = keyboard.pushEscapeHandler(element2, callback2);
        unsubscribers.push(unsub1);

        // Remove the topmost handler
        unsub2();

        // Simulate ESC key press
        const event = new KeyboardEvent('keydown', { key: 'Escape' });
        document.dispatchEvent(event);

        // Now the first handler should be called
        expect(callback1).toHaveBeenCalled();
    });

    it.skip('should not call handler for other keys (E2E only)', () => {
        const element = document.createElement('div');
        const callback = mock(() => { });

        const unsub = keyboard.pushEscapeHandler(element, callback);
        unsubscribers.push(unsub);

        // Simulate Enter key press
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        document.dispatchEvent(event);

        expect(callback).not.toHaveBeenCalled();
    });

    it('should handle unsubscribe being called multiple times', () => {
        const element = document.createElement('div');
        const callback = mock(() => { });

        const unsub = keyboard.pushEscapeHandler(element, callback);
        const depthBefore = keyboard.stackDepth;

        // Call unsubscribe multiple times
        unsub();
        unsub();
        unsub();

        // Stack depth should only decrease once
        expect(keyboard.stackDepth).toBe(depthBefore - 1);
    });
});

describe('KeyboardManager.isTopmost', () => {
    let unsubscribers = [];

    afterEach(() => {
        unsubscribers.forEach(unsub => unsub?.());
        unsubscribers = [];
    });

    it('should be a function', () => {
        expect(typeof keyboard.isTopmost).toBe('function');
    });

    it('should return false when stack is empty', () => {
        // Clear stack first
        const element = document.createElement('div');
        expect(keyboard.isTopmost(element)).toBe(false);
    });

    it('should return true for topmost element', () => {
        const element1 = document.createElement('div');
        const element2 = document.createElement('div');

        const unsub1 = keyboard.pushEscapeHandler(element1, () => { });
        const unsub2 = keyboard.pushEscapeHandler(element2, () => { });
        unsubscribers.push(unsub1, unsub2);

        expect(keyboard.isTopmost(element2)).toBe(true);
        expect(keyboard.isTopmost(element1)).toBe(false);
    });

    it('should update after handler is removed', () => {
        const element1 = document.createElement('div');
        const element2 = document.createElement('div');

        const unsub1 = keyboard.pushEscapeHandler(element1, () => { });
        const unsub2 = keyboard.pushEscapeHandler(element2, () => { });
        unsubscribers.push(unsub1);

        // Remove topmost
        unsub2();

        expect(keyboard.isTopmost(element1)).toBe(true);
    });
});

describe('KeyboardManager.stackDepth', () => {
    let unsubscribers = [];

    afterEach(() => {
        unsubscribers.forEach(unsub => unsub?.());
        unsubscribers = [];
    });

    it('should be a number', () => {
        expect(typeof keyboard.stackDepth).toBe('number');
    });

    it('should start at 0 or greater', () => {
        expect(keyboard.stackDepth).toBeGreaterThanOrEqual(0);
    });

    it('should track multiple handlers correctly', () => {
        const initialDepth = keyboard.stackDepth;

        const unsub1 = keyboard.pushEscapeHandler(document.createElement('div'), () => { });
        const unsub2 = keyboard.pushEscapeHandler(document.createElement('div'), () => { });
        const unsub3 = keyboard.pushEscapeHandler(document.createElement('div'), () => { });
        unsubscribers.push(unsub1, unsub2, unsub3);

        expect(keyboard.stackDepth).toBe(initialDepth + 3);
    });
});

describe('KeyboardManager Event Handling', () => {
    let unsubscribers = [];

    afterEach(() => {
        unsubscribers.forEach(unsub => unsub?.());
        unsubscribers = [];
    });

    it.skip('should prevent default on ESC when handlers exist (E2E only)', () => {
        const element = document.createElement('div');
        const callback = mock(() => { });

        const unsub = keyboard.pushEscapeHandler(element, callback);
        unsubscribers.push(unsub);

        const event = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
        const preventDefaultSpy = mock(() => { });
        event.preventDefault = preventDefaultSpy;

        document.dispatchEvent(event);

        expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it.skip('should stop propagation on ESC when handlers exist (E2E only)', () => {
        const element = document.createElement('div');
        const callback = mock(() => { });

        const unsub = keyboard.pushEscapeHandler(element, callback);
        unsubscribers.push(unsub);

        const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
        const stopPropagationSpy = mock(() => { });
        event.stopPropagation = stopPropagationSpy;

        document.dispatchEvent(event);

        expect(stopPropagationSpy).toHaveBeenCalled();
    });
});

describe('KeyboardManager Edge Cases', () => {
    it.skip('should handle empty callback gracefully (E2E only)', () => {
        const element = document.createElement('div');
        const unsub = keyboard.pushEscapeHandler(element, () => { });

        // Should not throw
        const event = new KeyboardEvent('keydown', { key: 'Escape' });
        expect(() => document.dispatchEvent(event)).not.toThrow();

        unsub();
    });

    it.skip('should preserve order after middle element is removed (E2E only)', () => {
        const element1 = document.createElement('div');
        const element2 = document.createElement('div');
        const element3 = document.createElement('div');
        const callback1 = mock(() => { });
        const callback3 = mock(() => { });

        const unsub1 = keyboard.pushEscapeHandler(element1, callback1);
        const unsub2 = keyboard.pushEscapeHandler(element2, () => { });
        const unsub3 = keyboard.pushEscapeHandler(element3, callback3);

        // Remove middle element
        unsub2();

        // Send ESC - should call callback3 (still topmost)
        const event = new KeyboardEvent('keydown', { key: 'Escape' });
        document.dispatchEvent(event);

        expect(callback3).toHaveBeenCalled();
        expect(callback1).not.toHaveBeenCalled();

        unsub1();
        unsub3();
    });
});
