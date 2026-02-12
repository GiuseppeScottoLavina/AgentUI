/**
 * @fileoverview Unit Tests for core/keyboard.js — KeyboardManager
 * Target: 33% → 95% line coverage
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { dom, resetBody } from '../helpers/setup-dom.js';
const { document } = dom;

import { keyboard, KeyboardManager } from '../../src/core/keyboard.js';

describe('core/keyboard.js', () => {

    // ========== KeyboardManager class ==========
    describe('KeyboardManager', () => {
        test('should export KeyboardManager class', () => {
            expect(KeyboardManager).toBeDefined();
        });

        test('should export keyboard singleton', () => {
            expect(keyboard).toBeDefined();
        });
    });

    // ========== pushEscapeHandler ==========
    describe('pushEscapeHandler', () => {
        test('should return unsubscribe function', () => {
            const el = document.createElement('div');
            const unsub = keyboard.pushEscapeHandler(el, () => { });
            expect(typeof unsub).toBe('function');
            unsub(); // cleanup
        });

        test('stackDepth should increase on push', () => {
            const initial = keyboard.stackDepth;
            const el = document.createElement('div');
            const unsub = keyboard.pushEscapeHandler(el, () => { });
            expect(keyboard.stackDepth).toBe(initial + 1);
            unsub();
            expect(keyboard.stackDepth).toBe(initial);
        });

        test('unsubscribe should decrease stack', () => {
            const initial = keyboard.stackDepth;
            const el1 = document.createElement('div');
            const el2 = document.createElement('div');
            const unsub1 = keyboard.pushEscapeHandler(el1, () => { });
            const unsub2 = keyboard.pushEscapeHandler(el2, () => { });
            expect(keyboard.stackDepth).toBe(initial + 2);
            unsub2();
            expect(keyboard.stackDepth).toBe(initial + 1);
            unsub1();
            expect(keyboard.stackDepth).toBe(initial);
        });

        test('LIFO order: last handler is topmost', () => {
            const el1 = document.createElement('div');
            const el2 = document.createElement('div');
            const el3 = document.createElement('div');
            const unsub1 = keyboard.pushEscapeHandler(el1, () => { });
            const unsub2 = keyboard.pushEscapeHandler(el2, () => { });
            const unsub3 = keyboard.pushEscapeHandler(el3, () => { });

            expect(keyboard.isTopmost(el3)).toBe(true);
            expect(keyboard.isTopmost(el2)).toBe(false);
            expect(keyboard.isTopmost(el1)).toBe(false);

            unsub3();
            expect(keyboard.isTopmost(el2)).toBe(true);

            unsub2();
            expect(keyboard.isTopmost(el1)).toBe(true);

            unsub1();
        });

        test('middle element removal should work correctly', () => {
            const el1 = document.createElement('div');
            const el2 = document.createElement('div');
            const el3 = document.createElement('div');
            const unsub1 = keyboard.pushEscapeHandler(el1, () => { });
            const unsub2 = keyboard.pushEscapeHandler(el2, () => { });
            const unsub3 = keyboard.pushEscapeHandler(el3, () => { });
            const depth = keyboard.stackDepth;

            // Remove middle
            unsub2();
            expect(keyboard.stackDepth).toBe(depth - 1);
            expect(keyboard.isTopmost(el3)).toBe(true);

            unsub1();
            unsub3();
        });
    });

    // ========== isTopmost ==========
    describe('isTopmost', () => {
        test('should return true for topmost element', () => {
            const el1 = document.createElement('div');
            const el2 = document.createElement('div');
            const unsub1 = keyboard.pushEscapeHandler(el1, () => { });
            const unsub2 = keyboard.pushEscapeHandler(el2, () => { });
            expect(keyboard.isTopmost(el2)).toBe(true);
            expect(keyboard.isTopmost(el1)).toBe(false);
            unsub1();
            unsub2();
        });

        test('should return false when stack is empty', () => {
            // Save and clean
            const depth = keyboard.stackDepth;
            // isTopmost with empty stack (or nearly empty)
            const el = document.createElement('div');
            expect(keyboard.isTopmost(el)).toBe(false);
        });
    });

    // ========== stackDepth ==========
    describe('stackDepth', () => {
        test('should return number', () => {
            expect(typeof keyboard.stackDepth).toBe('number');
        });
    });
});
