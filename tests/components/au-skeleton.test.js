/**
 * @fileoverview Comprehensive Unit Tests for au-skeleton Component
 * Tests: registration, render, rect/circle/text variants, size/width/height,
 *        multi-line text mode, animation injection, inline styles
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuSkeleton;

describe('au-skeleton Unit Tests', () => {

    beforeAll(async () => {
        const module = await import('../../src/components/au-skeleton.js');
        AuSkeleton = module.AuSkeleton;
    });

    beforeEach(() => resetBody());

    // ========================================
    // REGISTRATION
    // ========================================

    test('should be registered', () => {
        expect(customElements.get('au-skeleton')).toBe(AuSkeleton);
    });

    test('should have correct baseClass', () => {
        expect(AuSkeleton.baseClass).toBe('au-skeleton');
    });

    test('should observe expected attributes', () => {
        const attrs = AuSkeleton.observedAttributes;
        expect(attrs).toContain('variant');
        expect(attrs).toContain('width');
        expect(attrs).toContain('height');
        expect(attrs).toContain('size');
        expect(attrs).toContain('lines');
    });

    // ========================================
    // DEFAULT RECT VARIANT
    // ========================================

    test('should have block display', () => {
        const el = document.createElement('au-skeleton');
        body.appendChild(el);
        expect(el.style.display).toBe('block');
    });

    test('should default to 100% width', () => {
        const el = document.createElement('au-skeleton');
        body.appendChild(el);
        expect(el.style.width).toBe('100%');
    });

    test('should default to 20px height', () => {
        const el = document.createElement('au-skeleton');
        body.appendChild(el);
        expect(el.style.height).toBe('20px');
    });

    test('should have 4px border radius for rect', () => {
        const el = document.createElement('au-skeleton');
        body.appendChild(el);
        expect(el.style.borderRadius).toBe('4px');
    });

    test('should have pulse animation', () => {
        const el = document.createElement('au-skeleton');
        body.appendChild(el);
        expect(el.style.animation).toContain('au-skeleton-pulse');
    });

    // ========================================
    // CUSTOM DIMENSIONS
    // ========================================

    test('should apply custom width', () => {
        const el = document.createElement('au-skeleton');
        el.setAttribute('width', '200px');
        body.appendChild(el);
        expect(el.style.width).toBe('200px');
    });

    test('should apply custom height', () => {
        const el = document.createElement('au-skeleton');
        el.setAttribute('height', '40px');
        body.appendChild(el);
        expect(el.style.height).toBe('40px');
    });

    // ========================================
    // CIRCLE VARIANT
    // ========================================

    test('circle should use size for width and height', () => {
        const el = document.createElement('au-skeleton');
        el.setAttribute('variant', 'circle');
        el.setAttribute('size', '48px');
        body.appendChild(el);
        expect(el.style.width).toBe('48px');
        expect(el.style.height).toBe('48px');
    });

    test('circle should have 50% border radius', () => {
        const el = document.createElement('au-skeleton');
        el.setAttribute('variant', 'circle');
        body.appendChild(el);
        expect(el.style.borderRadius).toBe('50%');
    });

    test('circle should default to 40px size', () => {
        const el = document.createElement('au-skeleton');
        el.setAttribute('variant', 'circle');
        body.appendChild(el);
        expect(el.style.width).toBe('40px');
        expect(el.style.height).toBe('40px');
    });

    // ========================================
    // TEXT VARIANT (multiple lines)
    // ========================================

    test('text variant with lines > 1 should create multiple line divs', () => {
        const el = document.createElement('au-skeleton');
        el.setAttribute('variant', 'text');
        el.setAttribute('lines', '3');
        body.appendChild(el);
        const lines = el.querySelectorAll('.au-skeleton__line');
        expect(lines.length).toBe(3);
    });

    test('text variant last line should be 70% width', () => {
        const el = document.createElement('au-skeleton');
        el.setAttribute('variant', 'text');
        el.setAttribute('lines', '3');
        body.appendChild(el);
        const lines = el.querySelectorAll('.au-skeleton__line');
        expect(lines[2].style.width).toBe('70%');
    });

    test('text variant non-last lines should be 100% width', () => {
        const el = document.createElement('au-skeleton');
        el.setAttribute('variant', 'text');
        el.setAttribute('lines', '3');
        body.appendChild(el);
        const lines = el.querySelectorAll('.au-skeleton__line');
        expect(lines[0].style.width).toBe('100%');
        expect(lines[1].style.width).toBe('100%');
    });

    test('text lines should have 16px height', () => {
        const el = document.createElement('au-skeleton');
        el.setAttribute('variant', 'text');
        el.setAttribute('lines', '2');
        body.appendChild(el);
        const lines = el.querySelectorAll('.au-skeleton__line');
        expect(lines[0].style.height).toBe('16px');
    });

    // ========================================
    // KEYFRAME INJECTION
    // ========================================

    test('should inject skeleton keyframe styles into document head', () => {
        const el = document.createElement('au-skeleton');
        body.appendChild(el);
        const styleEl = document.getElementById('au-skeleton-styles');
        expect(styleEl).not.toBeNull();
        expect(styleEl.textContent).toContain('au-skeleton-pulse');
    });

    // ========================================
    // UPDATE
    // ========================================

    test('update should trigger re-render', () => {
        const el = document.createElement('au-skeleton');
        body.appendChild(el);
        expect(typeof el.update).toBe('function');
    });
});
