/**
 * @fileoverview Comprehensive Unit Tests for au-badge Component
 * Tests: registration, render, variant/size classes, update() class switching
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuBadge;

describe('au-badge Unit Tests', () => {

    beforeAll(async () => {
        const module = await import('../../src/components/au-badge.js');
        AuBadge = module.AuBadge;
    });

    beforeEach(() => resetBody());

    // ========================================
    // REGISTRATION
    // ========================================

    test('should be registered', () => {
        expect(customElements.get('au-badge')).toBe(AuBadge);
    });

    test('should have correct baseClass', () => {
        expect(AuBadge.baseClass).toBe('au-badge');
    });

    test('should observe variant and size', () => {
        const attrs = AuBadge.observedAttributes;
        expect(attrs).toContain('variant');
        expect(attrs).toContain('size');
    });

    // ========================================
    // VARIANT CLASSES
    // ========================================

    test('should default to primary variant', () => {
        const el = document.createElement('au-badge');
        el.textContent = 'NEW';
        body.appendChild(el);
        expect(el.classList.contains('au-badge--primary')).toBe(true);
    });

    test('should apply secondary variant', () => {
        const el = document.createElement('au-badge');
        el.setAttribute('variant', 'secondary');
        el.textContent = 'NEW';
        body.appendChild(el);
        expect(el.classList.contains('au-badge--secondary')).toBe(true);
    });

    test('should apply error variant', () => {
        const el = document.createElement('au-badge');
        el.setAttribute('variant', 'error');
        el.textContent = '5';
        body.appendChild(el);
        expect(el.classList.contains('au-badge--error')).toBe(true);
    });

    test('should have base au-badge class', () => {
        const el = document.createElement('au-badge');
        el.textContent = '1';
        body.appendChild(el);
        expect(el.classList.contains('au-badge')).toBe(true);
    });

    // ========================================
    // SIZE CLASSES
    // ========================================

    test('should default to md size', () => {
        const el = document.createElement('au-badge');
        el.textContent = '1';
        body.appendChild(el);
        expect(el.classList.contains('au-badge--md')).toBe(true);
    });

    test('should apply sm size', () => {
        const el = document.createElement('au-badge');
        el.setAttribute('size', 'sm');
        el.textContent = '1';
        body.appendChild(el);
        expect(el.classList.contains('au-badge--sm')).toBe(true);
    });

    test('should apply lg size', () => {
        const el = document.createElement('au-badge');
        el.setAttribute('size', 'lg');
        el.textContent = '1';
        body.appendChild(el);
        expect(el.classList.contains('au-badge--lg')).toBe(true);
    });

    // ========================================
    // UPDATE
    // ========================================

    test('update should switch variant class', () => {
        const el = document.createElement('au-badge');
        el.textContent = '1';
        body.appendChild(el);
        expect(el.classList.contains('au-badge--primary')).toBe(true);

        el.setAttribute('variant', 'error');
        el.update('variant', 'error', 'primary');
        expect(el.classList.contains('au-badge--error')).toBe(true);
        expect(el.classList.contains('au-badge--primary')).toBe(false);
    });

    test('update should switch size class', () => {
        const el = document.createElement('au-badge');
        el.textContent = '1';
        body.appendChild(el);
        expect(el.classList.contains('au-badge--md')).toBe(true);

        el.setAttribute('size', 'lg');
        el.update('size', 'lg', 'md');
        expect(el.classList.contains('au-badge--lg')).toBe(true);
        expect(el.classList.contains('au-badge--md')).toBe(false);
    });

    // ========================================
    // CONTENT
    // ========================================

    test('should preserve text content', () => {
        const el = document.createElement('au-badge');
        el.textContent = 'NEW';
        body.appendChild(el);
        expect(el.textContent).toContain('NEW');
    });
});
