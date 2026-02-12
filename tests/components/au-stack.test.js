/**
 * @fileoverview Comprehensive Unit Tests for au-stack Component
 * Tests: registration, render, flex direction/gap/align/justify/wrap inline styles, update
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuStack;

describe('au-stack Unit Tests', () => {

    beforeAll(async () => {
        const module = await import('../../src/components/au-stack.js');
        AuStack = module.AuStack;
    });

    beforeEach(() => resetBody());

    // ========================================
    // REGISTRATION
    // ========================================

    test('should be registered', () => {
        expect(customElements.get('au-stack')).toBe(AuStack);
    });

    test('should have correct baseClass', () => {
        expect(AuStack.baseClass).toBe('au-stack');
    });

    test('should observe direction, gap, align, justify, wrap, nowrap', () => {
        const attrs = AuStack.observedAttributes;
        expect(attrs).toContain('direction');
        expect(attrs).toContain('gap');
        expect(attrs).toContain('align');
        expect(attrs).toContain('justify');
        expect(attrs).toContain('wrap');
        expect(attrs).toContain('nowrap');
    });

    // ========================================
    // DEFAULT STYLES
    // ========================================

    test('should have flex display', () => {
        const el = document.createElement('au-stack');
        body.appendChild(el);
        expect(el.style.display).toBe('flex');
    });

    test('should default to column direction', () => {
        const el = document.createElement('au-stack');
        body.appendChild(el);
        expect(el.style.flexDirection).toBe('column');
    });

    test('should default to md gap', () => {
        const el = document.createElement('au-stack');
        body.appendChild(el);
        expect(el.style.gap).toBe('var(--md-sys-spacing-md, 16px)');
    });

    test('should default to stretch align', () => {
        const el = document.createElement('au-stack');
        body.appendChild(el);
        expect(el.style.alignItems).toBe('stretch');
    });

    test('should default to flex-start justify', () => {
        const el = document.createElement('au-stack');
        body.appendChild(el);
        expect(el.style.justifyContent).toBe('flex-start');
    });

    test('column should default to nowrap', () => {
        const el = document.createElement('au-stack');
        body.appendChild(el);
        expect(el.style.flexWrap).toBe('nowrap');
    });

    test('should have box-sizing border-box', () => {
        const el = document.createElement('au-stack');
        body.appendChild(el);
        expect(el.style.boxSizing).toBe('border-box');
    });

    // ========================================
    // DIRECTION
    // ========================================

    test('row direction should set row', () => {
        const el = document.createElement('au-stack');
        el.setAttribute('direction', 'row');
        body.appendChild(el);
        expect(el.style.flexDirection).toBe('row');
    });

    test('row direction should wrap by default', () => {
        const el = document.createElement('au-stack');
        el.setAttribute('direction', 'row');
        body.appendChild(el);
        expect(el.style.flexWrap).toBe('wrap');
    });

    test('row with nowrap should not wrap', () => {
        const el = document.createElement('au-stack');
        el.setAttribute('direction', 'row');
        el.setAttribute('nowrap', '');
        body.appendChild(el);
        expect(el.style.flexWrap).toBe('nowrap');
    });

    // ========================================
    // GAP
    // ========================================

    test('none gap should set 0', () => {
        const el = document.createElement('au-stack');
        el.setAttribute('gap', 'none');
        body.appendChild(el);
        expect(el.style.gap).toBe('0');
    });

    test('sm gap should use spacing token', () => {
        const el = document.createElement('au-stack');
        el.setAttribute('gap', 'sm');
        body.appendChild(el);
        expect(el.style.gap).toBe('var(--md-sys-spacing-sm, 8px)');
    });

    test('lg gap should use spacing token', () => {
        const el = document.createElement('au-stack');
        el.setAttribute('gap', 'lg');
        body.appendChild(el);
        expect(el.style.gap).toBe('var(--md-sys-spacing-lg, 24px)');
    });

    // ========================================
    // ALIGN & JUSTIFY
    // ========================================

    test('center align should set center', () => {
        const el = document.createElement('au-stack');
        el.setAttribute('align', 'center');
        body.appendChild(el);
        expect(el.style.alignItems).toBe('center');
    });

    test('space-between justify should set space-between', () => {
        const el = document.createElement('au-stack');
        el.setAttribute('justify', 'space-between');
        body.appendChild(el);
        expect(el.style.justifyContent).toBe('space-between');
    });

    test('shorthand "between" should map to space-between', () => {
        const el = document.createElement('au-stack');
        el.setAttribute('justify', 'between');
        body.appendChild(el);
        expect(el.style.justifyContent).toBe('space-between');
    });

    test('shorthand "around" should map to space-around', () => {
        const el = document.createElement('au-stack');
        el.setAttribute('justify', 'around');
        body.appendChild(el);
        expect(el.style.justifyContent).toBe('space-around');
    });

    test('shorthand "evenly" should map to space-evenly', () => {
        const el = document.createElement('au-stack');
        el.setAttribute('justify', 'evenly');
        body.appendChild(el);
        expect(el.style.justifyContent).toBe('space-evenly');
    });

    test('raw CSS justify values should pass through unchanged', () => {
        const el = document.createElement('au-stack');
        el.setAttribute('justify', 'center');
        body.appendChild(el);
        expect(el.style.justifyContent).toBe('center');
    });

    // ========================================
    // UPDATE
    // ========================================

    test('update gap should change style', () => {
        const el = document.createElement('au-stack');
        body.appendChild(el);
        expect(el.style.gap).toBe('var(--md-sys-spacing-md, 16px)');

        el.setAttribute('gap', 'lg');
        el.update('gap', 'lg', 'md');
        expect(el.style.gap).toBe('var(--md-sys-spacing-lg, 24px)');
    });
});
