/**
 * @fileoverview Comprehensive Unit Tests for au-progress Component
 * Tests: registration, render, bar element, value/max, ARIA (progressbar),
 *        percent calculation, variant classes, update()
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuProgress;

describe('au-progress Unit Tests', () => {

    beforeAll(async () => {
        const module = await import('../../src/components/au-progress.js');
        AuProgress = module.AuProgress;
    });

    beforeEach(() => resetBody());

    // ========================================
    // REGISTRATION
    // ========================================

    test('should be registered', () => {
        expect(customElements.get('au-progress')).toBe(AuProgress);
    });

    test('should have correct baseClass', () => {
        expect(AuProgress.baseClass).toBe('au-progress');
    });

    test('should observe value, max, variant', () => {
        const attrs = AuProgress.observedAttributes;
        expect(attrs).toContain('value');
        expect(attrs).toContain('max');
        expect(attrs).toContain('variant');
    });

    // ========================================
    // RENDER — Bar Element
    // ========================================

    test('should create bar element', () => {
        const el = document.createElement('au-progress');
        body.appendChild(el);
        expect(el.querySelector('.au-progress__bar')).not.toBeNull();
    });

    test('render should be idempotent', () => {
        const el = document.createElement('au-progress');
        body.appendChild(el);
        el.render();
        expect(el.querySelectorAll('.au-progress__bar').length).toBe(1);
    });

    // ========================================
    // ARIA
    // ========================================

    test('should set role progressbar', () => {
        const el = document.createElement('au-progress');
        body.appendChild(el);
        expect(el.getAttribute('role')).toBe('progressbar');
    });

    test('should set aria-valuenow', () => {
        const el = document.createElement('au-progress');
        el.setAttribute('value', '30');
        body.appendChild(el);
        expect(el.getAttribute('aria-valuenow')).toBe('30');
    });

    test('should set aria-valuemax', () => {
        const el = document.createElement('au-progress');
        el.setAttribute('max', '200');
        body.appendChild(el);
        expect(el.getAttribute('aria-valuemax')).toBe('200');
    });

    test('should default aria-valuenow to 0', () => {
        const el = document.createElement('au-progress');
        body.appendChild(el);
        expect(el.getAttribute('aria-valuenow')).toBe('0');
    });

    test('should default aria-valuemax to 100', () => {
        const el = document.createElement('au-progress');
        body.appendChild(el);
        expect(el.getAttribute('aria-valuemax')).toBe('100');
    });

    // ========================================
    // BAR WIDTH (percent calculation)
    // ========================================

    test('should set bar width to 0% when value is 0', () => {
        const el = document.createElement('au-progress');
        el.setAttribute('value', '0');
        body.appendChild(el);
        expect(el.querySelector('.au-progress__bar').style.width).toBe('0%');
    });

    test('should set bar width to 50% when value is 50', () => {
        const el = document.createElement('au-progress');
        el.setAttribute('value', '50');
        body.appendChild(el);
        expect(el.querySelector('.au-progress__bar').style.width).toBe('50%');
    });

    test('should set bar width to 100% when value equals max', () => {
        const el = document.createElement('au-progress');
        el.setAttribute('value', '100');
        body.appendChild(el);
        expect(el.querySelector('.au-progress__bar').style.width).toBe('100%');
    });

    test('should cap bar width at 100%', () => {
        const el = document.createElement('au-progress');
        el.setAttribute('value', '150');
        body.appendChild(el);
        expect(el.querySelector('.au-progress__bar').style.width).toBe('100%');
    });

    test('should calculate percent correctly with custom max', () => {
        const el = document.createElement('au-progress');
        el.setAttribute('value', '25');
        el.setAttribute('max', '50');
        body.appendChild(el);
        expect(el.querySelector('.au-progress__bar').style.width).toBe('50%');
    });

    // ========================================
    // VARIANT CLASSES
    // ========================================

    test('should default to primary variant class', () => {
        const el = document.createElement('au-progress');
        body.appendChild(el);
        expect(el.classList.contains('au-progress--primary')).toBe(true);
    });

    test('should apply secondary variant class', () => {
        const el = document.createElement('au-progress');
        el.setAttribute('variant', 'secondary');
        body.appendChild(el);
        expect(el.classList.contains('au-progress--secondary')).toBe(true);
    });

    test('should have base au-progress class', () => {
        const el = document.createElement('au-progress');
        body.appendChild(el);
        expect(el.classList.contains('au-progress')).toBe(true);
    });

    // ========================================
    // UPDATE
    // ========================================

    test('update value should change bar width', () => {
        const el = document.createElement('au-progress');
        el.setAttribute('value', '20');
        body.appendChild(el);
        expect(el.querySelector('.au-progress__bar').style.width).toBe('20%');

        el.setAttribute('value', '60');
        el.update('value', '60', '20');
        expect(el.querySelector('.au-progress__bar').style.width).toBe('60%');
    });

    test('update value should change aria-valuenow', () => {
        const el = document.createElement('au-progress');
        el.setAttribute('value', '10');
        body.appendChild(el);

        el.setAttribute('value', '75');
        el.update('value', '75', '10');
        expect(el.getAttribute('aria-valuenow')).toBe('75');
    });

    test('update variant should switch class', () => {
        const el = document.createElement('au-progress');
        body.appendChild(el);
        expect(el.classList.contains('au-progress--primary')).toBe(true);

        el.setAttribute('variant', 'secondary');
        el.update('variant', 'secondary', 'primary');
        expect(el.classList.contains('au-progress--secondary')).toBe(true);
        expect(el.classList.contains('au-progress--primary')).toBe(false);
    });
});
