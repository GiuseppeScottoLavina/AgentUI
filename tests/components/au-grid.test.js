/**
 * @fileoverview Comprehensive Unit Tests for au-grid Component
 * Tests: registration, render, grid display, cols/rows/gap/align inline styles, update
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuGrid;

describe('au-grid Unit Tests', () => {

    beforeAll(async () => {
        const module = await import('../../src/components/au-grid.js');
        AuGrid = module.AuGrid;
    });

    beforeEach(() => resetBody());

    // ========================================
    // REGISTRATION
    // ========================================

    test('should be registered', () => {
        expect(customElements.get('au-grid')).toBe(AuGrid);
    });

    test('should have correct baseClass', () => {
        expect(AuGrid.baseClass).toBe('au-grid');
    });

    test('should observe cols, rows, gap, align', () => {
        const attrs = AuGrid.observedAttributes;
        expect(attrs).toContain('cols');
        expect(attrs).toContain('rows');
        expect(attrs).toContain('gap');
        expect(attrs).toContain('align');
    });

    // ========================================
    // DEFAULT STYLES
    // ========================================

    test('should have grid display', () => {
        const el = document.createElement('au-grid');
        body.appendChild(el);
        expect(el.style.display).toBe('grid');
    });

    test('should default to 1 column', () => {
        const el = document.createElement('au-grid');
        body.appendChild(el);
        expect(el.style.gridTemplateColumns).toBe('repeat(1, 1fr)');
    });

    test('should default to md gap (16px)', () => {
        const el = document.createElement('au-grid');
        body.appendChild(el);
        expect(el.style.gap).toBe('16px');
    });

    test('should default to stretch align', () => {
        const el = document.createElement('au-grid');
        body.appendChild(el);
        expect(el.style.alignItems).toBe('stretch');
    });

    // ========================================
    // COLUMNS
    // ========================================

    test('3 cols should set repeat(3, 1fr)', () => {
        const el = document.createElement('au-grid');
        el.setAttribute('cols', '3');
        body.appendChild(el);
        expect(el.style.gridTemplateColumns).toBe('repeat(3, 1fr)');
    });

    test('custom fr value should be passed through', () => {
        const el = document.createElement('au-grid');
        el.setAttribute('cols', '1fr 2fr');
        body.appendChild(el);
        expect(el.style.gridTemplateColumns).toBe('1fr 2fr');
    });

    // ========================================
    // GAP
    // ========================================

    test('none gap should set 0', () => {
        const el = document.createElement('au-grid');
        el.setAttribute('gap', 'none');
        body.appendChild(el);
        expect(el.style.gap).toBe('0');
    });

    test('sm gap should set 8px', () => {
        const el = document.createElement('au-grid');
        el.setAttribute('gap', 'sm');
        body.appendChild(el);
        expect(el.style.gap).toBe('8px');
    });

    test('lg gap should set 24px', () => {
        const el = document.createElement('au-grid');
        el.setAttribute('gap', 'lg');
        body.appendChild(el);
        expect(el.style.gap).toBe('24px');
    });

    // ========================================
    // UPDATE
    // ========================================

    test('update cols should change template', () => {
        const el = document.createElement('au-grid');
        el.setAttribute('cols', '2');
        body.appendChild(el);
        expect(el.style.gridTemplateColumns).toBe('repeat(2, 1fr)');

        el.setAttribute('cols', '4');
        el.update('cols', '4', '2');
        expect(el.style.gridTemplateColumns).toBe('repeat(4, 1fr)');
    });
});
