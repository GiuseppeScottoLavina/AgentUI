/**
 * @fileoverview Comprehensive Unit Tests for au-alert Component
 * Tests: registration, render, severity variants, icon mapping, 
 *        dismissible button, dismiss() method, ARIA attributes,
 *        idempotent render, update(), class management
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, patchEmit, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuAlert;

describe('au-alert Unit Tests', () => {

    beforeAll(async () => {
        const module = await import('../../src/components/au-alert.js');
        AuAlert = module.AuAlert;
        patchEmit(AuAlert);
    });

    beforeEach(() => resetBody());

    // ========================================
    // REGISTRATION
    // ========================================

    test('should be registered', () => {
        expect(customElements.get('au-alert')).toBe(AuAlert);
    });

    test('should have correct baseClass', () => {
        expect(AuAlert.baseClass).toBe('au-alert');
    });

    test('should observe severity, dismissible', () => {
        expect(AuAlert.observedAttributes).toContain('severity');
        expect(AuAlert.observedAttributes).toContain('dismissible');
    });

    // ========================================
    // RENDER — DOM Structure
    // ========================================

    test('should render content slot', () => {
        const el = document.createElement('au-alert');
        el.textContent = 'Alert message';
        body.appendChild(el);
        expect(el.querySelector('.au-alert__content')).not.toBeNull();
    });

    test('should render icon element', () => {
        const el = document.createElement('au-alert');
        el.textContent = 'Alert message';
        body.appendChild(el);
        expect(el.querySelector('.au-alert__icon')).not.toBeNull();
    });

    test('should preserve content text in .au-alert__content', () => {
        const el = document.createElement('au-alert');
        el.textContent = 'Important notice';
        body.appendChild(el);
        const content = el.querySelector('.au-alert__content');
        expect(content.textContent).toContain('Important notice');
    });

    test('render should be idempotent', () => {
        const el = document.createElement('au-alert');
        el.textContent = 'Test';
        body.appendChild(el);
        el.render();
        expect(el.querySelectorAll('.au-alert__content').length).toBe(1);
    });

    // ========================================
    // ACCESSIBILITY
    // ========================================

    test('should set role alert', () => {
        const el = document.createElement('au-alert');
        el.textContent = 'Test';
        body.appendChild(el);
        expect(el.getAttribute('role')).toBe('alert');
    });

    test('should set aria-live polite', () => {
        const el = document.createElement('au-alert');
        el.textContent = 'Test';
        body.appendChild(el);
        expect(el.getAttribute('aria-live')).toBe('polite');
    });

    // ========================================
    // SEVERITY VARIANTS
    // ========================================

    test('should default to info severity', () => {
        const el = document.createElement('au-alert');
        el.textContent = 'Info alert';
        body.appendChild(el);
        expect(el.classList.contains('au-alert--info')).toBe(true);
    });

    test('should support success severity', () => {
        const el = document.createElement('au-alert');
        el.setAttribute('severity', 'success');
        el.textContent = 'Success!';
        body.appendChild(el);
        expect(el.classList.contains('au-alert--success')).toBe(true);
    });

    test('should support error severity', () => {
        const el = document.createElement('au-alert');
        el.setAttribute('severity', 'error');
        el.textContent = 'Error!';
        body.appendChild(el);
        expect(el.classList.contains('au-alert--error')).toBe(true);
    });

    test('should support warning severity', () => {
        const el = document.createElement('au-alert');
        el.setAttribute('severity', 'warning');
        el.textContent = 'Warning!';
        body.appendChild(el);
        expect(el.classList.contains('au-alert--warning')).toBe(true);
    });

    test('should render correct icon for each severity', () => {
        const severities = ['info', 'success', 'error', 'warning'];
        for (const severity of severities) {
            resetBody();
            const el = document.createElement('au-alert');
            el.setAttribute('severity', severity);
            el.textContent = `${severity} alert`;
            body.appendChild(el);
            const icon = el.querySelector('.au-alert__icon');
            expect(icon).not.toBeNull();
            expect(icon.getAttribute('name')).toBe(severity);
        }
    });

    // ========================================
    // SEVERITY UPDATE (class switching)
    // ========================================

    test('should remove old severity class when changing', () => {
        const el = document.createElement('au-alert');
        el.setAttribute('severity', 'info');
        el.textContent = 'Alert';
        body.appendChild(el);

        expect(el.classList.contains('au-alert--info')).toBe(true);

        el.setAttribute('severity', 'error');

        expect(el.classList.contains('au-alert--error')).toBe(true);
        expect(el.classList.contains('au-alert--info')).toBe(false);
    });

    // ========================================
    // DISMISSIBLE
    // ========================================

    test('should render close button when dismissible', () => {
        const el = document.createElement('au-alert');
        el.setAttribute('dismissible', '');
        el.textContent = 'Can be closed';
        body.appendChild(el);
        expect(el.querySelector('.au-alert__close')).not.toBeNull();
    });

    test('close button should have aria-label', () => {
        const el = document.createElement('au-alert');
        el.setAttribute('dismissible', '');
        el.textContent = 'Closeable';
        body.appendChild(el);
        const btn = el.querySelector('.au-alert__close');
        expect(btn.getAttribute('aria-label')).toBe('Dismiss');
    });

    test('should NOT render close button when not dismissible', () => {
        const el = document.createElement('au-alert');
        el.textContent = 'Not closeable';
        body.appendChild(el);
        expect(el.querySelector('.au-alert__close')).toBeNull();
    });

    // ========================================
    // DISMISS METHOD
    // ========================================

    test('should have dismiss method', () => {
        const el = document.createElement('au-alert');
        el.textContent = 'Test';
        body.appendChild(el);
        expect(typeof el.dismiss).toBe('function');
    });

    test('dismiss should remove element from DOM', () => {
        const el = document.createElement('au-alert');
        el.textContent = 'Goodbye';
        body.appendChild(el);

        expect(body.querySelector('au-alert')).not.toBeNull();
        el.dismiss();
        expect(body.querySelector('au-alert')).toBeNull();
    });

    // ========================================
    // BASE CLASS
    // ========================================

    test('should always have au-alert base class', () => {
        const el = document.createElement('au-alert');
        el.textContent = 'Test';
        body.appendChild(el);
        expect(el.classList.contains('au-alert')).toBe(true);
    });
});
