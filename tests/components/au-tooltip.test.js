/**
 * @fileoverview Comprehensive Unit Tests for au-tooltip Component
 * Tests: registration, render, position classes, inline styles, 
 *        show/hide methods, portal pattern, role tooltip, disconnectedCallback
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, patchEmit, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuTooltip;

describe('au-tooltip Unit Tests', () => {

    beforeAll(async () => {
        const module = await import('../../src/components/au-tooltip.js');
        AuTooltip = module.AuTooltip;
        patchEmit(AuTooltip);
    });

    beforeEach(() => resetBody());

    // ========================================
    // REGISTRATION
    // ========================================

    test('should be registered', () => {
        expect(customElements.get('au-tooltip')).toBe(AuTooltip);
    });

    test('should have correct baseClass', () => {
        expect(AuTooltip.baseClass).toBe('au-tooltip');
    });

    test('should observe content and position', () => {
        expect(AuTooltip.observedAttributes).toContain('content');
        expect(AuTooltip.observedAttributes).toContain('position');
    });

    // ========================================
    // RENDER — Classes and Styles
    // ========================================

    test('should have au-tooltip class', () => {
        const el = document.createElement('au-tooltip');
        el.setAttribute('content', 'Help text');
        el.textContent = 'Hover me';
        body.appendChild(el);
        expect(el.classList.contains('au-tooltip')).toBe(true);
    });

    test('should default to top position class', () => {
        const el = document.createElement('au-tooltip');
        el.setAttribute('content', 'Help text');
        el.textContent = 'Hover me';
        body.appendChild(el);
        expect(el.classList.contains('au-tooltip--top')).toBe(true);
    });

    test('should support bottom position class', () => {
        const el = document.createElement('au-tooltip');
        el.setAttribute('content', 'Help text');
        el.setAttribute('position', 'bottom');
        el.textContent = 'Hover me';
        body.appendChild(el);
        expect(el.classList.contains('au-tooltip--bottom')).toBe(true);
    });

    test('should support left position class', () => {
        const el = document.createElement('au-tooltip');
        el.setAttribute('content', 'Help text');
        el.setAttribute('position', 'left');
        el.textContent = 'Hover me';
        body.appendChild(el);
        expect(el.classList.contains('au-tooltip--left')).toBe(true);
    });

    test('should support right position class', () => {
        const el = document.createElement('au-tooltip');
        el.setAttribute('content', 'Help text');
        el.setAttribute('position', 'right');
        el.textContent = 'Hover me';
        body.appendChild(el);
        expect(el.classList.contains('au-tooltip--right')).toBe(true);
    });

    // ========================================
    // INLINE STYLES
    // ========================================

    test('should have relative position', () => {
        const el = document.createElement('au-tooltip');
        el.setAttribute('content', 'Help');
        el.textContent = 'Hover';
        body.appendChild(el);
        expect(el.style.position).toBe('relative');
    });

    test('should have inline-block display', () => {
        const el = document.createElement('au-tooltip');
        el.setAttribute('content', 'Help');
        el.textContent = 'Hover';
        body.appendChild(el);
        expect(el.style.display).toBe('inline-block');
    });

    // ========================================
    // SHOW / HIDE (portal pattern)
    // ========================================

    test('should have show() method', () => {
        const el = document.createElement('au-tooltip');
        el.setAttribute('content', 'Help');
        el.textContent = 'Hover';
        body.appendChild(el);
        expect(typeof el.show).toBe('function');
    });

    test('should have hide() method', () => {
        const el = document.createElement('au-tooltip');
        el.setAttribute('content', 'Help');
        el.textContent = 'Hover';
        body.appendChild(el);
        expect(typeof el.hide).toBe('function');
    });

    test('show() should create tooltip portal element', () => {
        const el = document.createElement('au-tooltip');
        el.setAttribute('content', 'Help text');
        el.textContent = 'Hover';
        body.appendChild(el);

        el.show();
        const tooltip = document.querySelector('.au-tooltip__content');
        expect(tooltip).not.toBeNull();
        el.hide();
    });

    test('tooltip portal should have role attribute', () => {
        const el = document.createElement('au-tooltip');
        el.setAttribute('content', 'Help text');
        el.textContent = 'Hover';
        body.appendChild(el);

        el.show();
        const tooltip = body.querySelector('.au-tooltip__content');
        expect(tooltip).not.toBeNull();
        expect(tooltip.getAttribute('role')).toBe('tooltip');
        // Clean up portal to prevent resetBody() crash
        el.hide();
    });

    test('tooltip portal should display content text', () => {
        const el = document.createElement('au-tooltip');
        el.setAttribute('content', 'Help text');
        el.textContent = 'Hover';
        body.appendChild(el);

        el.show();
        const tooltip = document.querySelector('.au-tooltip__content');
        expect(tooltip.textContent).toBe('Help text');
        el.hide();
    });

    test('hide() should remove tooltip portal', () => {
        const el = document.createElement('au-tooltip');
        el.setAttribute('content', 'Help text');
        el.textContent = 'Hover';
        body.appendChild(el);

        el.show();
        // Verify portal exists
        expect(body.querySelector('.au-tooltip__content')).not.toBeNull();

        el.hide();
        // Verify portal is gone
        expect(body.querySelector('.au-tooltip__content')).toBeNull();
    });

    test('show() should not create duplicate tooltips', () => {
        const el = document.createElement('au-tooltip');
        el.setAttribute('content', 'Help text');
        el.textContent = 'Hover';
        body.appendChild(el);

        el.show();
        el.show();
        const tooltips = document.querySelectorAll('.au-tooltip__content');
        expect(tooltips.length).toBe(1);
        el.hide();
    });

    test('show() should not create tooltip if no content attribute', () => {
        const el = document.createElement('au-tooltip');
        el.textContent = 'Hover';
        body.appendChild(el);

        el.show();
        // Without content attribute, show() returns early, no portal created
        expect(body.querySelector('.au-tooltip__content')).toBeNull();
        // Clean up just in case
        el.hide();
    });

    // ========================================
    // POSITION UPDATE
    // ========================================

    test('update should switch position class', () => {
        const el = document.createElement('au-tooltip');
        el.setAttribute('content', 'Help');
        el.setAttribute('position', 'top');
        el.textContent = 'Hover';
        body.appendChild(el);

        expect(el.classList.contains('au-tooltip--top')).toBe(true);

        el.setAttribute('position', 'bottom');
        el.update('position', 'bottom', 'top');

        expect(el.classList.contains('au-tooltip--bottom')).toBe(true);
        expect(el.classList.contains('au-tooltip--top')).toBe(false);
    });

    // ========================================
    // DISCONNECTED CALLBACK
    // ========================================

    test('disconnectedCallback should clean up tooltip portal', () => {
        const el = document.createElement('au-tooltip');
        el.setAttribute('content', 'Help text');
        el.textContent = 'Hover';
        body.appendChild(el);

        el.show();
        expect(document.querySelector('.au-tooltip__content')).not.toBeNull();

        el.disconnectedCallback();
        expect(document.querySelector('.au-tooltip__content')).toBeNull();
    });
});
