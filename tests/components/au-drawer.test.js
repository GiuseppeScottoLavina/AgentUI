/**
 * @fileoverview Comprehensive Unit Tests for au-drawer Component
 * Tests: registration, render DOM structure (scrim, nav, header, content),
 *        mode get/set, open get/set, toggle(), ARIA navigation role
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, patchEmit, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuDrawer;

describe('au-drawer Unit Tests', () => {

    beforeAll(async () => {
        const module = await import('../../src/components/au-drawer.js');
        AuDrawer = module.AuDrawer;
        patchEmit(AuDrawer);
    });

    beforeEach(() => resetBody());

    // ========================================
    // REGISTRATION
    // ========================================

    test('should be registered', () => {
        expect(customElements.get('au-drawer')).toBe(AuDrawer);
    });

    test('should have correct baseClass', () => {
        expect(AuDrawer.baseClass).toBe('au-drawer');
    });

    test('should observe mode, open, expand-on-hover, position', () => {
        const attrs = AuDrawer.observedAttributes;
        expect(attrs).toContain('mode');
        expect(attrs).toContain('open');
        expect(attrs).toContain('expand-on-hover');
        expect(attrs).toContain('position');
    });

    // ========================================
    // RENDER — DOM Structure
    // ========================================

    test('should create scrim element', () => {
        const el = document.createElement('au-drawer');
        body.appendChild(el);
        expect(el.querySelector('.au-drawer-scrim')).not.toBeNull();
    });

    test('should create nav element', () => {
        const el = document.createElement('au-drawer');
        body.appendChild(el);
        expect(el.querySelector('.au-drawer-nav')).not.toBeNull();
    });

    test('nav should have role navigation', () => {
        const el = document.createElement('au-drawer');
        body.appendChild(el);
        expect(el.querySelector('nav').getAttribute('role')).toBe('navigation');
    });

    test('should create header section', () => {
        const el = document.createElement('au-drawer');
        body.appendChild(el);
        expect(el.querySelector('.au-drawer-header')).not.toBeNull();
    });

    test('should create content section', () => {
        const el = document.createElement('au-drawer');
        body.appendChild(el);
        expect(el.querySelector('.au-drawer-content')).not.toBeNull();
    });

    test('content should have role menu', () => {
        const el = document.createElement('au-drawer');
        body.appendChild(el);
        expect(el.querySelector('.au-drawer-content').getAttribute('role')).toBe('menu');
    });

    // ========================================
    // MODE
    // ========================================

    test('mode getter should default to auto', () => {
        const el = document.createElement('au-drawer');
        body.appendChild(el);
        expect(el.mode).toBe('auto');
    });

    test('mode setter should update attribute', () => {
        const el = document.createElement('au-drawer');
        body.appendChild(el);
        el.mode = 'rail';
        expect(el.getAttribute('mode')).toBe('rail');
    });

    // ========================================
    // OPEN
    // ========================================

    test('open getter should default to false', () => {
        const el = document.createElement('au-drawer');
        body.appendChild(el);
        expect(el.open).toBe(false);
    });

    test('open setter should toggle attribute', () => {
        const el = document.createElement('au-drawer');
        body.appendChild(el);
        el.open = true;
        expect(el.hasAttribute('open')).toBe(true);
    });

    // ========================================
    // TOGGLE
    // ========================================

    test('toggle() should flip open state', () => {
        const el = document.createElement('au-drawer');
        body.appendChild(el);
        expect(el.open).toBe(false);
        el.toggle();
        expect(el.open).toBe(true);
        el.toggle();
        expect(el.open).toBe(false);
    });

    // ========================================
    // POSITION
    // ========================================

    test('position getter should default to start', () => {
        const el = document.createElement('au-drawer');
        body.appendChild(el);
        expect(el.position).toBe('start');
    });

    test('position setter should update attribute', () => {
        const el = document.createElement('au-drawer');
        body.appendChild(el);
        el.position = 'end';
        expect(el.getAttribute('position')).toBe('end');
    });
});
