/**
 * @fileoverview Comprehensive Unit Tests for au-divider Component
 * Tests: registration, render, horizontal/vertical modes, inset margin, inline styles
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuDivider;

describe('au-divider Unit Tests', () => {

    beforeAll(async () => {
        const module = await import('../../src/components/au-divider.js');
        AuDivider = module.AuDivider;
    });

    beforeEach(() => resetBody());

    // ========================================
    // REGISTRATION
    // ========================================

    test('should be registered', () => {
        expect(customElements.get('au-divider')).toBe(AuDivider);
    });

    test('should have correct baseClass', () => {
        expect(AuDivider.baseClass).toBe('au-divider');
    });

    test('should observe vertical and inset', () => {
        expect(AuDivider.observedAttributes).toContain('vertical');
        expect(AuDivider.observedAttributes).toContain('inset');
    });

    // ========================================
    // HORIZONTAL (default)
    // ========================================

    test('should have block display', () => {
        const el = document.createElement('au-divider');
        body.appendChild(el);
        expect(el.style.display).toBe('block');
    });

    test('should have 1px height (horizontal)', () => {
        const el = document.createElement('au-divider');
        body.appendChild(el);
        expect(el.style.height).toBe('1px');
    });

    test('should have 100% width (horizontal)', () => {
        const el = document.createElement('au-divider');
        body.appendChild(el);
        expect(el.style.width).toBe('100%');
    });

    test('should have outline-variant background', () => {
        const el = document.createElement('au-divider');
        body.appendChild(el);
        expect(el.style.background).toBe('var(--md-sys-color-outline-variant)');
    });

    test('should have flexShrink 0', () => {
        const el = document.createElement('au-divider');
        body.appendChild(el);
        expect(el.style.flexShrink).toBe('0');
    });

    // ========================================
    // VERTICAL
    // ========================================

    test('vertical should have 1px width', () => {
        const el = document.createElement('au-divider');
        el.setAttribute('vertical', '');
        body.appendChild(el);
        expect(el.style.width).toBe('1px');
    });

    test('vertical should have minHeight 24px', () => {
        const el = document.createElement('au-divider');
        el.setAttribute('vertical', '');
        body.appendChild(el);
        expect(el.style.minHeight).toBe('24px');
    });

    // ========================================
    // INSET
    // ========================================

    test('horizontal inset should have 0 16px margin', () => {
        const el = document.createElement('au-divider');
        el.setAttribute('inset', '');
        body.appendChild(el);
        expect(el.style.margin).toBe('0 16px');
    });

    test('vertical inset should have 0 8px margin', () => {
        const el = document.createElement('au-divider');
        el.setAttribute('vertical', '');
        el.setAttribute('inset', '');
        body.appendChild(el);
        expect(el.style.margin).toBe('0 8px');
    });

    test('horizontal no-inset should have 0 margin', () => {
        const el = document.createElement('au-divider');
        body.appendChild(el);
        expect(el.style.margin).toBe('0');
    });

    // ========================================
    // UPDATE
    // ========================================

    test('update should re-render styles', () => {
        const el = document.createElement('au-divider');
        body.appendChild(el);
        expect(el.style.height).toBe('1px');

        el.setAttribute('vertical', '');
        el.update('vertical', '', null);
        expect(el.style.width).toBe('1px');
        expect(el.style.minHeight).toBe('24px');
    });
});
