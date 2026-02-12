/**
 * @fileoverview Comprehensive Unit Tests for au-bottom-nav Component
 * Tests: registration, render, nav wrapper with ARIA, value get/set,
 *        hideOnDesktop attribute, public API
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, patchEmit, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuBottomNav;

describe('au-bottom-nav Unit Tests', () => {

    beforeAll(async () => {
        const module = await import('../../src/components/au-bottom-nav.js');
        AuBottomNav = module.AuBottomNav;
        patchEmit(AuBottomNav);
    });

    beforeEach(() => resetBody());

    // ========================================
    // REGISTRATION
    // ========================================

    test('should be registered', () => {
        expect(customElements.get('au-bottom-nav')).toBe(AuBottomNav);
    });

    test('should have correct baseClass', () => {
        expect(AuBottomNav.baseClass).toBe('au-bottom-nav');
    });

    test('should observe hide-on-desktop and value', () => {
        const attrs = AuBottomNav.observedAttributes;
        expect(attrs).toContain('hide-on-desktop');
        expect(attrs).toContain('value');
    });

    // ========================================
    // RENDER
    // ========================================

    test('should create nav wrapper', () => {
        const el = document.createElement('au-bottom-nav');
        body.appendChild(el);
        expect(el.querySelector('nav')).not.toBeNull();
    });

    test('nav should have au-bottom-nav-nav class', () => {
        const el = document.createElement('au-bottom-nav');
        body.appendChild(el);
        expect(el.querySelector('.au-bottom-nav-nav')).not.toBeNull();
    });

    test('nav should have role menu', () => {
        const el = document.createElement('au-bottom-nav');
        body.appendChild(el);
        expect(el.querySelector('nav').getAttribute('role')).toBe('menu');
    });

    test('nav should have aria-label', () => {
        const el = document.createElement('au-bottom-nav');
        body.appendChild(el);
        expect(el.querySelector('nav').getAttribute('aria-label')).toBe('Bottom navigation');
    });

    // ========================================
    // VALUE
    // ========================================

    test('value getter should default to empty string', () => {
        const el = document.createElement('au-bottom-nav');
        body.appendChild(el);
        expect(el.value).toBe('');
    });

    test('value setter should update attribute', () => {
        const el = document.createElement('au-bottom-nav');
        body.appendChild(el);
        el.value = '/home';
        expect(el.getAttribute('value')).toBe('/home');
    });

    // ========================================
    // HIDE ON DESKTOP
    // ========================================

    test('hideOnDesktop getter should default to false', () => {
        const el = document.createElement('au-bottom-nav');
        body.appendChild(el);
        expect(el.hideOnDesktop).toBe(false);
    });

    test('hideOnDesktop setter should toggle attribute', () => {
        const el = document.createElement('au-bottom-nav');
        body.appendChild(el);
        el.hideOnDesktop = true;
        expect(el.hasAttribute('hide-on-desktop')).toBe(true);
    });

    test('hideOnDesktop setter false should remove attribute', () => {
        const el = document.createElement('au-bottom-nav');
        el.setAttribute('hide-on-desktop', '');
        body.appendChild(el);
        el.hideOnDesktop = false;
        expect(el.hasAttribute('hide-on-desktop')).toBe(false);
    });
});
