/**
 * @fileoverview Comprehensive Unit Tests for au-card Component
 * Tests: registration, render, variant classes (flat, elevated, outlined, filled),
 *        padding classes, update() class switching
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuCard;

describe('au-card Unit Tests', () => {

    beforeAll(async () => {
        const module = await import('../../src/components/au-card.js');
        AuCard = module.AuCard;
    });

    beforeEach(() => resetBody());

    // ========================================
    // REGISTRATION
    // ========================================

    test('should be registered', () => {
        expect(customElements.get('au-card')).toBe(AuCard);
    });

    test('should have correct baseClass', () => {
        expect(AuCard.baseClass).toBe('au-card');
    });

    test('should observe variant and padding', () => {
        const attrs = AuCard.observedAttributes;
        expect(attrs).toContain('variant');
        expect(attrs).toContain('padding');
    });

    // ========================================
    // VARIANT CLASSES
    // ========================================

    test('should default to flat variant class', () => {
        const el = document.createElement('au-card');
        el.textContent = 'Card';
        body.appendChild(el);
        expect(el.classList.contains('au-card--flat')).toBe(true);
    });

    test('should apply elevated variant class', () => {
        const el = document.createElement('au-card');
        el.setAttribute('variant', 'elevated');
        el.textContent = 'Card';
        body.appendChild(el);
        expect(el.classList.contains('au-card--elevated')).toBe(true);
    });

    test('should apply outlined variant class', () => {
        const el = document.createElement('au-card');
        el.setAttribute('variant', 'outlined');
        el.textContent = 'Card';
        body.appendChild(el);
        expect(el.classList.contains('au-card--outlined')).toBe(true);
    });

    test('should apply filled variant class', () => {
        const el = document.createElement('au-card');
        el.setAttribute('variant', 'filled');
        el.textContent = 'Card';
        body.appendChild(el);
        expect(el.classList.contains('au-card--filled')).toBe(true);
    });

    test('should have base au-card class', () => {
        const el = document.createElement('au-card');
        el.textContent = 'Card';
        body.appendChild(el);
        expect(el.classList.contains('au-card')).toBe(true);
    });

    // ========================================
    // PADDING CLASSES
    // ========================================

    test('should default to md padding class', () => {
        const el = document.createElement('au-card');
        el.textContent = 'Card';
        body.appendChild(el);
        expect(el.classList.contains('au-card--padding-md')).toBe(true);
    });

    test('should apply none padding class', () => {
        const el = document.createElement('au-card');
        el.setAttribute('padding', 'none');
        el.textContent = 'Card';
        body.appendChild(el);
        expect(el.classList.contains('au-card--padding-none')).toBe(true);
    });

    test('should apply lg padding class', () => {
        const el = document.createElement('au-card');
        el.setAttribute('padding', 'lg');
        el.textContent = 'Card';
        body.appendChild(el);
        expect(el.classList.contains('au-card--padding-lg')).toBe(true);
    });

    // ========================================
    // UPDATE
    // ========================================

    test('update should switch variant class', () => {
        const el = document.createElement('au-card');
        el.textContent = 'Card';
        body.appendChild(el);
        expect(el.classList.contains('au-card--flat')).toBe(true);

        el.setAttribute('variant', 'elevated');
        el.update('variant', 'elevated', 'flat');
        expect(el.classList.contains('au-card--elevated')).toBe(true);
        expect(el.classList.contains('au-card--flat')).toBe(false);
    });

    test('update should switch padding class', () => {
        const el = document.createElement('au-card');
        el.textContent = 'Card';
        body.appendChild(el);
        expect(el.classList.contains('au-card--padding-md')).toBe(true);

        el.setAttribute('padding', 'lg');
        el.update('padding', 'lg', 'md');
        expect(el.classList.contains('au-card--padding-lg')).toBe(true);
        expect(el.classList.contains('au-card--padding-md')).toBe(false);
    });

    // ========================================
    // CONTENT PRESERVATION
    // ========================================

    test('should preserve textContent', () => {
        const el = document.createElement('au-card');
        el.textContent = 'Card Content';
        body.appendChild(el);
        expect(el.textContent).toContain('Card Content');
    });
});
