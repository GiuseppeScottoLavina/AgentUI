/**
 * @fileoverview Comprehensive Unit Tests for au-spinner Component
 * Tests: registration, render, circle element, size/color classes,
 *        render idempotency, update()
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuSpinner;

describe('au-spinner Unit Tests', () => {

    beforeAll(async () => {
        const module = await import('../../src/components/au-spinner.js');
        AuSpinner = module.AuSpinner;
    });

    beforeEach(() => resetBody());

    // ========================================
    // REGISTRATION
    // ========================================

    test('should be registered', () => {
        expect(customElements.get('au-spinner')).toBe(AuSpinner);
    });

    test('should have correct baseClass', () => {
        expect(AuSpinner.baseClass).toBe('au-spinner');
    });

    test('should observe size and color', () => {
        expect(AuSpinner.observedAttributes).toContain('size');
        expect(AuSpinner.observedAttributes).toContain('color');
    });

    // ========================================
    // RENDER
    // ========================================

    test('should create circle element', () => {
        const el = document.createElement('au-spinner');
        body.appendChild(el);
        expect(el.querySelector('.au-spinner__circle')).not.toBeNull();
    });

    test('render should be idempotent', () => {
        const el = document.createElement('au-spinner');
        body.appendChild(el);
        el.render();
        expect(el.querySelectorAll('.au-spinner__circle').length).toBe(1);
    });

    // ========================================
    // SIZE CLASSES
    // ========================================

    test('should default to md size class', () => {
        const el = document.createElement('au-spinner');
        body.appendChild(el);
        expect(el.classList.contains('au-spinner--md')).toBe(true);
    });

    test('should apply sm size class', () => {
        const el = document.createElement('au-spinner');
        el.setAttribute('size', 'sm');
        body.appendChild(el);
        expect(el.classList.contains('au-spinner--sm')).toBe(true);
    });

    test('should apply lg size class', () => {
        const el = document.createElement('au-spinner');
        el.setAttribute('size', 'lg');
        body.appendChild(el);
        expect(el.classList.contains('au-spinner--lg')).toBe(true);
    });

    // ========================================
    // COLOR CLASSES
    // ========================================

    test('should default to primary color class', () => {
        const el = document.createElement('au-spinner');
        body.appendChild(el);
        expect(el.classList.contains('au-spinner--primary')).toBe(true);
    });

    test('should apply secondary color class', () => {
        const el = document.createElement('au-spinner');
        el.setAttribute('color', 'secondary');
        body.appendChild(el);
        expect(el.classList.contains('au-spinner--secondary')).toBe(true);
    });

    test('should have base au-spinner class', () => {
        const el = document.createElement('au-spinner');
        body.appendChild(el);
        expect(el.classList.contains('au-spinner')).toBe(true);
    });

    // ========================================
    // UPDATE
    // ========================================

    test('update should switch size class', () => {
        const el = document.createElement('au-spinner');
        body.appendChild(el);
        expect(el.classList.contains('au-spinner--md')).toBe(true);

        el.setAttribute('size', 'lg');
        el.update('size', 'lg', 'md');
        expect(el.classList.contains('au-spinner--lg')).toBe(true);
        expect(el.classList.contains('au-spinner--md')).toBe(false);
    });

    test('update should switch color class', () => {
        const el = document.createElement('au-spinner');
        body.appendChild(el);
        expect(el.classList.contains('au-spinner--primary')).toBe(true);

        el.setAttribute('color', 'secondary');
        el.update('color', 'secondary', 'primary');
        expect(el.classList.contains('au-spinner--secondary')).toBe(true);
        expect(el.classList.contains('au-spinner--primary')).toBe(false);
    });
});
