/**
 * @fileoverview Comprehensive Unit Tests for au-callout Component
 * Tests: registration, render, variant-based MD3 colors, inline styles,
 *        update class switching, content preservation
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuCallout;

describe('au-callout Unit Tests', () => {

    beforeAll(async () => {
        const module = await import('../../src/components/au-callout.js');
        AuCallout = module.AuCallout;
    });

    beforeEach(() => resetBody());

    // ========================================
    // REGISTRATION
    // ========================================

    test('should be registered', () => {
        expect(customElements.get('au-callout')).toBe(AuCallout);
    });

    test('should have correct baseClass', () => {
        expect(AuCallout.baseClass).toBe('au-callout');
    });

    test('should observe variant and title', () => {
        expect(AuCallout.observedAttributes).toContain('variant');
        expect(AuCallout.observedAttributes).toContain('title');
    });

    // ========================================
    // INLINE STYLES
    // ========================================

    test('should have block display', () => {
        const el = document.createElement('au-callout');
        el.textContent = 'Note';
        body.appendChild(el);
        expect(el.style.display).toBe('block');
    });

    test('should have 20px padding (MD3)', () => {
        const el = document.createElement('au-callout');
        el.textContent = 'Note';
        body.appendChild(el);
        expect(el.style.padding).toBe('20px');
    });

    test('should have 4px left border', () => {
        const el = document.createElement('au-callout');
        el.textContent = 'Note';
        body.appendChild(el);
        expect(el.style.borderLeft).toContain('4px solid');
    });

    test('should have box-sizing border-box', () => {
        const el = document.createElement('au-callout');
        el.textContent = 'Note';
        body.appendChild(el);
        expect(el.style.boxSizing).toBe('border-box');
    });

    test('should have word-wrap break-word', () => {
        const el = document.createElement('au-callout');
        el.textContent = 'Note';
        body.appendChild(el);
        expect(el.style.wordWrap).toBe('break-word');
    });

    test('should have 1.6 line-height', () => {
        const el = document.createElement('au-callout');
        el.textContent = 'Note';
        body.appendChild(el);
        expect(el.style.lineHeight).toBe('1.6');
    });

    // ========================================
    // VARIANT COLORS
    // ========================================

    test('should default to info variant', () => {
        const el = document.createElement('au-callout');
        el.textContent = 'Info';
        body.appendChild(el);
        expect(el.style.background).toContain('primary-container');
    });

    test('info variant should use primary colors', () => {
        const el = document.createElement('au-callout');
        el.setAttribute('variant', 'info');
        el.textContent = 'Info';
        body.appendChild(el);
        expect(el.style.background).toContain('primary-container');
        expect(el.style.borderLeft).toContain('primary');
    });

    test('warning variant should use error colors', () => {
        const el = document.createElement('au-callout');
        el.setAttribute('variant', 'warning');
        el.textContent = 'Warning';
        body.appendChild(el);
        expect(el.style.background).toContain('error-container');
    });

    test('success variant should use tertiary colors', () => {
        const el = document.createElement('au-callout');
        el.setAttribute('variant', 'success');
        el.textContent = 'Success';
        body.appendChild(el);
        expect(el.style.background).toContain('tertiary-container');
    });

    test('tip variant should use secondary colors', () => {
        const el = document.createElement('au-callout');
        el.setAttribute('variant', 'tip');
        el.textContent = 'Tip';
        body.appendChild(el);
        expect(el.style.background).toContain('secondary-container');
    });

    // ========================================
    // CONTENT PRESERVATION
    // ========================================

    test('should preserve textContent', () => {
        const el = document.createElement('au-callout');
        el.textContent = 'Important information here';
        body.appendChild(el);
        expect(el.textContent).toContain('Important information here');
    });

    // ========================================
    // UPDATE
    // ========================================

    test('update should change variant colors', () => {
        const el = document.createElement('au-callout');
        el.setAttribute('variant', 'info');
        el.textContent = 'Test';
        body.appendChild(el);

        expect(el.style.background).toContain('primary-container');

        el.setAttribute('variant', 'warning');
        el.update('variant', 'warning', 'info');

        expect(el.style.background).toContain('error-container');
    });
});
