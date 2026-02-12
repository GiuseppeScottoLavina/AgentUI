/**
 * @fileoverview Comprehensive Unit Tests for au-navbar Component
 * Tests: registration, render, inline styles, sticky mode, sub-components
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuNavbar, AuNavbarBrand, AuNavbarLinks, AuNavbarActions;

describe('au-navbar Unit Tests', () => {

    beforeAll(async () => {
        const module = await import('../../src/components/au-navbar.js');
        AuNavbar = module.AuNavbar;
        AuNavbarBrand = module.AuNavbarBrand;
        AuNavbarLinks = module.AuNavbarLinks;
        AuNavbarActions = module.AuNavbarActions;
    });

    beforeEach(() => resetBody());

    // ========================================
    // REGISTRATION
    // ========================================

    test('should be registered', () => {
        expect(customElements.get('au-navbar')).toBe(AuNavbar);
    });

    test('au-navbar-brand should be registered', () => {
        expect(customElements.get('au-navbar-brand')).toBe(AuNavbarBrand);
    });

    test('au-navbar-links should be registered', () => {
        expect(customElements.get('au-navbar-links')).toBe(AuNavbarLinks);
    });

    test('au-navbar-actions should be registered', () => {
        expect(customElements.get('au-navbar-actions')).toBe(AuNavbarActions);
    });

    test('should observe sticky and variant', () => {
        expect(AuNavbar.observedAttributes).toContain('sticky');
        expect(AuNavbar.observedAttributes).toContain('variant');
    });

    // ========================================
    // RENDER — Inline Styles
    // ========================================

    test('should have flex display', () => {
        const el = document.createElement('au-navbar');
        body.appendChild(el);
        expect(el.style.display).toBe('flex');
    });

    test('should center-align items', () => {
        const el = document.createElement('au-navbar');
        body.appendChild(el);
        expect(el.style.alignItems).toBe('center');
    });

    test('should space-between justify', () => {
        const el = document.createElement('au-navbar');
        body.appendChild(el);
        expect(el.style.justifyContent).toBe('space-between');
    });

    test('should have 64px height', () => {
        const el = document.createElement('au-navbar');
        body.appendChild(el);
        expect(el.style.height).toBe('64px');
    });

    test('should have surface-container background', () => {
        const el = document.createElement('au-navbar');
        body.appendChild(el);
        expect(el.style.background).toBe('var(--md-sys-color-surface-container)');
    });

    test('should have bottom border', () => {
        const el = document.createElement('au-navbar');
        body.appendChild(el);
        expect(el.style.borderBottom).toBe('1px solid var(--md-sys-color-outline-variant)');
    });

    // ========================================
    // STICKY
    // ========================================

    test('sticky should set position sticky', () => {
        const el = document.createElement('au-navbar');
        el.setAttribute('sticky', '');
        body.appendChild(el);
        expect(el.style.position).toBe('sticky');
    });

    test('sticky should set top 0', () => {
        const el = document.createElement('au-navbar');
        el.setAttribute('sticky', '');
        body.appendChild(el);
        expect(el.style.top).toBe('0');
    });

    test('sticky should set z-index 100', () => {
        const el = document.createElement('au-navbar');
        el.setAttribute('sticky', '');
        body.appendChild(el);
        expect(el.style.zIndex).toBe('100');
    });

    // ========================================
    // SUB-COMPONENTS
    // ========================================

    test('au-navbar-brand should have bold font', () => {
        const el = document.createElement('au-navbar-brand');
        body.appendChild(el);
        expect(el.style.fontWeight).toBe('600');
    });

    test('au-navbar-brand should have 1.25rem font', () => {
        const el = document.createElement('au-navbar-brand');
        body.appendChild(el);
        expect(el.style.fontSize).toBe('1.25rem');
    });

    test('au-navbar-actions should have flex display', () => {
        const el = document.createElement('au-navbar-actions');
        body.appendChild(el);
        expect(el.style.display).toBe('flex');
    });

    test('au-navbar-actions should center-align items', () => {
        const el = document.createElement('au-navbar-actions');
        body.appendChild(el);
        expect(el.style.alignItems).toBe('center');
    });
});
