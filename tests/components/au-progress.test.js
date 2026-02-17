/**
 * @fileoverview Comprehensive Unit Tests for au-progress Component
 * Tests: registration, render, Material Web DOM structure,
 *        value/max, ARIA (progressbar), percent calculation,
 *        variant classes, indeterminate mode, update()
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

    test('should observe value, max, variant, indeterminate', () => {
        const attrs = AuProgress.observedAttributes;
        expect(attrs).toContain('value');
        expect(attrs).toContain('max');
        expect(attrs).toContain('variant');
        expect(attrs).toContain('indeterminate');
    });

    // ========================================
    // RENDER — Material Web DOM Structure
    // ========================================

    test('should create progress container', () => {
        const el = document.createElement('au-progress');
        body.appendChild(el);
        expect(el.querySelector('.au-progress__progress')).not.toBeNull();
    });

    test('should create primary bar', () => {
        const el = document.createElement('au-progress');
        body.appendChild(el);
        expect(el.querySelector('.au-progress__primary-bar')).not.toBeNull();
    });

    test('should create secondary bar', () => {
        const el = document.createElement('au-progress');
        body.appendChild(el);
        expect(el.querySelector('.au-progress__secondary-bar')).not.toBeNull();
    });

    test('should create bar-inner elements', () => {
        const el = document.createElement('au-progress');
        body.appendChild(el);
        expect(el.querySelectorAll('.au-progress__bar-inner').length).toBe(2);
    });

    test('primary bar should contain bar-inner', () => {
        const el = document.createElement('au-progress');
        body.appendChild(el);
        const bar = el.querySelector('.au-progress__primary-bar');
        expect(bar.querySelector('.au-progress__bar-inner')).not.toBeNull();
    });

    test('secondary bar should contain bar-inner', () => {
        const el = document.createElement('au-progress');
        body.appendChild(el);
        const bar = el.querySelector('.au-progress__secondary-bar');
        expect(bar.querySelector('.au-progress__bar-inner')).not.toBeNull();
    });

    test('render should be idempotent', () => {
        const el = document.createElement('au-progress');
        body.appendChild(el);
        el.render();
        el.render();
        expect(el.querySelectorAll('.au-progress__progress').length).toBe(1);
        expect(el.querySelectorAll('.au-progress__primary-bar').length).toBe(1);
        expect(el.querySelectorAll('.au-progress__secondary-bar').length).toBe(1);
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
    // BAR WIDTH (percent calculation via primary bar)
    // ========================================

    test('should set primary bar width to 0% when value is 0', () => {
        const el = document.createElement('au-progress');
        el.setAttribute('value', '0');
        body.appendChild(el);
        expect(el.querySelector('.au-progress__primary-bar').style.width).toBe('0%');
    });

    test('should set primary bar width to 50% when value is 50', () => {
        const el = document.createElement('au-progress');
        el.setAttribute('value', '50');
        body.appendChild(el);
        expect(el.querySelector('.au-progress__primary-bar').style.width).toBe('50%');
    });

    test('should set primary bar width to 100% when value equals max', () => {
        const el = document.createElement('au-progress');
        el.setAttribute('value', '100');
        body.appendChild(el);
        expect(el.querySelector('.au-progress__primary-bar').style.width).toBe('100%');
    });

    test('should cap primary bar width at 100%', () => {
        const el = document.createElement('au-progress');
        el.setAttribute('value', '150');
        body.appendChild(el);
        expect(el.querySelector('.au-progress__primary-bar').style.width).toBe('100%');
    });

    test('should calculate percent correctly with custom max', () => {
        const el = document.createElement('au-progress');
        el.setAttribute('value', '25');
        el.setAttribute('max', '50');
        body.appendChild(el);
        expect(el.querySelector('.au-progress__primary-bar').style.width).toBe('50%');
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
    // INDETERMINATE MODE
    // ========================================

    test('should add indeterminate class when attribute is set', () => {
        const el = document.createElement('au-progress');
        el.setAttribute('indeterminate', '');
        body.appendChild(el);
        const progress = el.querySelector('.au-progress__progress');
        expect(progress.classList.contains('au-progress__indeterminate')).toBe(true);
    });

    test('should not add indeterminate class by default', () => {
        const el = document.createElement('au-progress');
        body.appendChild(el);
        const progress = el.querySelector('.au-progress__progress');
        expect(progress.classList.contains('au-progress__indeterminate')).toBe(false);
    });

    // ========================================
    // UPDATE
    // ========================================

    test('update value should change primary bar width', () => {
        const el = document.createElement('au-progress');
        el.setAttribute('value', '20');
        body.appendChild(el);
        expect(el.querySelector('.au-progress__primary-bar').style.width).toBe('20%');

        el.setAttribute('value', '60');
        el.update('value', '60', '20');
        expect(el.querySelector('.au-progress__primary-bar').style.width).toBe('60%');
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

    test('update indeterminate should toggle class', () => {
        const el = document.createElement('au-progress');
        body.appendChild(el);
        const progress = el.querySelector('.au-progress__progress');
        expect(progress.classList.contains('au-progress__indeterminate')).toBe(false);

        el.setAttribute('indeterminate', '');
        el.update('indeterminate', '', null);
        expect(progress.classList.contains('au-progress__indeterminate')).toBe(true);

        el.removeAttribute('indeterminate');
        el.update('indeterminate', null, '');
        expect(progress.classList.contains('au-progress__indeterminate')).toBe(false);
    });

    // ========================================
    // AUTO ARIA-LABEL (framework-level a11y)
    // ========================================

    test('should auto-generate aria-label for determinate progress', () => {
        const el = document.createElement('au-progress');
        el.setAttribute('value', '50');
        body.appendChild(el);
        expect(el.getAttribute('aria-label')).toBe('Progress: 50%');
    });

    test('should auto-generate aria-label for 0% progress', () => {
        const el = document.createElement('au-progress');
        body.appendChild(el);
        expect(el.getAttribute('aria-label')).toBe('Progress: 0%');
    });

    test('should auto-generate aria-label for indeterminate', () => {
        const el = document.createElement('au-progress');
        el.setAttribute('indeterminate', '');
        body.appendChild(el);
        expect(el.getAttribute('aria-label')).toBe('Loading');
    });

    test('should preserve user-provided aria-label', () => {
        const el = document.createElement('au-progress');
        el.setAttribute('value', '50');
        el.setAttribute('aria-label', 'Uploading file');
        body.appendChild(el);
        expect(el.getAttribute('aria-label')).toBe('Uploading file');
    });

    test('should update auto aria-label when value changes', () => {
        const el = document.createElement('au-progress');
        el.setAttribute('value', '25');
        body.appendChild(el);
        expect(el.getAttribute('aria-label')).toBe('Progress: 25%');

        el.setAttribute('value', '75');
        el.update('value', '75', '25');
        expect(el.getAttribute('aria-label')).toBe('Progress: 75%');
    });

    test('should update auto aria-label when switching to indeterminate', () => {
        const el = document.createElement('au-progress');
        el.setAttribute('value', '50');
        body.appendChild(el);
        expect(el.getAttribute('aria-label')).toBe('Progress: 50%');

        el.setAttribute('indeterminate', '');
        el.update('indeterminate', '', null);
        expect(el.getAttribute('aria-label')).toBe('Loading');
    });

    test('should set data-auto-label tracking attribute', () => {
        const el = document.createElement('au-progress');
        body.appendChild(el);
        expect(el.dataset.autoLabel).toBe('1');
    });

    test('should not set data-auto-label when user provides aria-label', () => {
        const el = document.createElement('au-progress');
        el.setAttribute('aria-label', 'Custom label');
        body.appendChild(el);
        expect(el.dataset.autoLabel).toBeUndefined();
    });
});
