/**
 * @fileoverview Comprehensive Unit Tests for au-avatar Component
 * Tests: registration, render, image mode, initials mode, auto-initials
 *        from alt text, size variants, fallback SVG icon, inline styles
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuAvatar;

describe('au-avatar Unit Tests', () => {

    beforeAll(async () => {
        const module = await import('../../src/components/au-avatar.js');
        AuAvatar = module.AuAvatar;
    });

    beforeEach(() => resetBody());

    // ========================================
    // REGISTRATION
    // ========================================

    test('should be registered', () => {
        expect(customElements.get('au-avatar')).toBe(AuAvatar);
    });

    test('should have correct baseClass', () => {
        expect(AuAvatar.baseClass).toBe('au-avatar');
    });

    test('should observe expected attributes', () => {
        const attrs = AuAvatar.observedAttributes;
        expect(attrs).toContain('src');
        expect(attrs).toContain('alt');
        expect(attrs).toContain('initials');
        expect(attrs).toContain('size');
    });

    // ========================================
    // SIZE VARIANTS
    // ========================================

    test('should default to md size (40px)', () => {
        const el = document.createElement('au-avatar');
        body.appendChild(el);
        expect(el.style.width).toBe('40px');
        expect(el.style.height).toBe('40px');
    });

    test('should apply sm size (32px)', () => {
        const el = document.createElement('au-avatar');
        el.setAttribute('size', 'sm');
        body.appendChild(el);
        expect(el.style.width).toBe('32px');
        expect(el.style.height).toBe('32px');
    });

    test('should apply lg size (56px)', () => {
        const el = document.createElement('au-avatar');
        el.setAttribute('size', 'lg');
        body.appendChild(el);
        expect(el.style.width).toBe('56px');
        expect(el.style.height).toBe('56px');
    });

    test('should apply xl size (80px)', () => {
        const el = document.createElement('au-avatar');
        el.setAttribute('size', 'xl');
        body.appendChild(el);
        expect(el.style.width).toBe('80px');
        expect(el.style.height).toBe('80px');
    });

    // ========================================
    // INLINE STYLES
    // ========================================

    test('should be circular (50% border-radius)', () => {
        const el = document.createElement('au-avatar');
        body.appendChild(el);
        expect(el.style.borderRadius).toBe('50%');
    });

    test('should have inline-flex display', () => {
        const el = document.createElement('au-avatar');
        body.appendChild(el);
        expect(el.style.display).toBe('inline-flex');
    });

    test('should center content', () => {
        const el = document.createElement('au-avatar');
        body.appendChild(el);
        expect(el.style.alignItems).toBe('center');
        expect(el.style.justifyContent).toBe('center');
    });

    test('should hide overflow', () => {
        const el = document.createElement('au-avatar');
        body.appendChild(el);
        expect(el.style.overflow).toBe('hidden');
    });

    // ========================================
    // IMAGE MODE
    // ========================================

    test('should render img when src is provided', () => {
        const el = document.createElement('au-avatar');
        el.setAttribute('src', '/test.jpg');
        el.setAttribute('alt', 'John');
        body.appendChild(el);
        const img = el.querySelector('img');
        expect(img).not.toBeNull();
        expect(img.src).toBe('/test.jpg');
    });

    test('img should have alt text', () => {
        const el = document.createElement('au-avatar');
        el.setAttribute('src', '/test.jpg');
        el.setAttribute('alt', 'John Doe');
        body.appendChild(el);
        expect(el.querySelector('img').alt).toBe('John Doe');
    });

    test('img should have full cover styles', () => {
        const el = document.createElement('au-avatar');
        el.setAttribute('src', '/test.jpg');
        body.appendChild(el);
        const img = el.querySelector('img');
        expect(img.style.width).toBe('100%');
        expect(img.style.height).toBe('100%');
        expect(img.style.objectFit).toBe('cover');
    });

    // ========================================
    // INITIALS MODE
    // ========================================

    test('should render explicit initials', () => {
        const el = document.createElement('au-avatar');
        el.setAttribute('initials', 'JD');
        body.appendChild(el);
        const span = el.querySelector('span');
        expect(span).not.toBeNull();
        expect(span.textContent).toBe('JD');
    });

    test('should uppercase explicit initials', () => {
        const el = document.createElement('au-avatar');
        el.setAttribute('initials', 'jd');
        body.appendChild(el);
        expect(el.querySelector('span').textContent).toBe('JD');
    });

    test('should limit initials to 2 characters', () => {
        const el = document.createElement('au-avatar');
        el.setAttribute('initials', 'ABC');
        body.appendChild(el);
        expect(el.querySelector('span').textContent).toBe('AB');
    });

    // ========================================
    // AUTO-GENERATED INITIALS FROM ALT
    // ========================================

    test('should auto-generate initials from alt text', () => {
        const el = document.createElement('au-avatar');
        el.setAttribute('alt', 'John Doe');
        body.appendChild(el);
        const span = el.querySelector('span');
        expect(span).not.toBeNull();
        expect(span.textContent).toBe('JD');
    });

    test('should auto-generate single initial from single name', () => {
        const el = document.createElement('au-avatar');
        el.setAttribute('alt', 'Alice');
        body.appendChild(el);
        expect(el.querySelector('span').textContent).toBe('A');
    });

    // ========================================
    // FALLBACK SVG ICON
    // ========================================

    test('should render default SVG icon when no src/initials/alt', () => {
        const el = document.createElement('au-avatar');
        body.appendChild(el);
        expect(el.querySelector('svg')).not.toBeNull();
    });

    test('default SVG should use currentColor', () => {
        const el = document.createElement('au-avatar');
        body.appendChild(el);
        const svg = el.querySelector('svg');
        expect(svg.getAttribute('fill')).toBe('currentColor');
    });

    // ========================================
    // UPDATE
    // ========================================

    test('update should re-render on size change', () => {
        const el = document.createElement('au-avatar');
        el.setAttribute('initials', 'JD');
        body.appendChild(el);
        expect(el.style.width).toBe('40px');
        el.setAttribute('size', 'lg');
        el.update('size', 'lg', 'md');
        expect(el.style.width).toBe('56px');
    });
});
