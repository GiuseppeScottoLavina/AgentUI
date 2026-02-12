/**
 * @fileoverview Comprehensive Unit Tests for au-container Component
 * Tests: registration, render, size/padding inline styles, center auto-margin, update
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuContainer;

describe('au-container Unit Tests', () => {

    beforeAll(async () => {
        const module = await import('../../src/components/au-container.js');
        AuContainer = module.AuContainer;
    });

    beforeEach(() => resetBody());

    // ========================================
    // REGISTRATION
    // ========================================

    test('should be registered', () => {
        expect(customElements.get('au-container')).toBe(AuContainer);
    });

    test('should have correct baseClass', () => {
        expect(AuContainer.baseClass).toBe('au-container');
    });

    test('should observe size, padding, center', () => {
        const attrs = AuContainer.observedAttributes;
        expect(attrs).toContain('size');
        expect(attrs).toContain('padding');
        expect(attrs).toContain('center');
    });

    // ========================================
    // DEFAULT STYLES
    // ========================================

    test('should have block display', () => {
        const el = document.createElement('au-container');
        body.appendChild(el);
        expect(el.style.display).toBe('block');
    });

    test('should default to lg maxWidth (1024px)', () => {
        const el = document.createElement('au-container');
        body.appendChild(el);
        expect(el.style.maxWidth).toBe('1024px');
    });

    test('should default to md padding (16px)', () => {
        const el = document.createElement('au-container');
        body.appendChild(el);
        expect(el.style.padding).toBe('16px');
    });

    test('should have 100% width', () => {
        const el = document.createElement('au-container');
        body.appendChild(el);
        expect(el.style.width).toBe('100%');
    });

    test('should auto-center by default', () => {
        const el = document.createElement('au-container');
        body.appendChild(el);
        expect(el.style.marginLeft).toBe('auto');
        expect(el.style.marginRight).toBe('auto');
    });

    // ========================================
    // SIZE VARIANTS
    // ========================================

    test('sm size should set 640px maxWidth', () => {
        const el = document.createElement('au-container');
        el.setAttribute('size', 'sm');
        body.appendChild(el);
        expect(el.style.maxWidth).toBe('640px');
    });

    test('md size should set 768px maxWidth', () => {
        const el = document.createElement('au-container');
        el.setAttribute('size', 'md');
        body.appendChild(el);
        expect(el.style.maxWidth).toBe('768px');
    });

    test('xl size should set 1280px maxWidth', () => {
        const el = document.createElement('au-container');
        el.setAttribute('size', 'xl');
        body.appendChild(el);
        expect(el.style.maxWidth).toBe('1280px');
    });

    test('full size should set 100% maxWidth', () => {
        const el = document.createElement('au-container');
        el.setAttribute('size', 'full');
        body.appendChild(el);
        expect(el.style.maxWidth).toBe('100%');
    });

    // ========================================
    // PADDING
    // ========================================

    test('none padding should set 0', () => {
        const el = document.createElement('au-container');
        el.setAttribute('padding', 'none');
        body.appendChild(el);
        expect(el.style.padding).toBe('0');
    });

    test('sm padding should set 8px', () => {
        const el = document.createElement('au-container');
        el.setAttribute('padding', 'sm');
        body.appendChild(el);
        expect(el.style.padding).toBe('8px');
    });

    test('lg padding should set 24px', () => {
        const el = document.createElement('au-container');
        el.setAttribute('padding', 'lg');
        body.appendChild(el);
        expect(el.style.padding).toBe('24px');
    });

    // ========================================
    // UPDATE
    // ========================================

    test('update size should change maxWidth', () => {
        const el = document.createElement('au-container');
        body.appendChild(el);
        expect(el.style.maxWidth).toBe('1024px');

        el.setAttribute('size', 'sm');
        el.update('size', 'sm', 'lg');
        expect(el.style.maxWidth).toBe('640px');
    });
});
