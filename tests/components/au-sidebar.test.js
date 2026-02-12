/**
 * @fileoverview Unit Tests for au-sidebar Component
 * Target: 49% → 90% coverage
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuSidebar, AuSidebarItem;

describe('au-sidebar Unit Tests', () => {

    beforeAll(async () => {

        const module = await import('../../src/components/au-sidebar.js');
        AuSidebar = module.AuSidebar;
        AuSidebarItem = module.AuSidebarItem;

        AuSidebar.prototype.emit = function (eventName, detail) {
            try { this.dispatchEvent(new Event(eventName, { bubbles: true })); } catch (e) { }
        };
        AuSidebarItem.prototype.emit = function (eventName, detail) {
            try { this.dispatchEvent(new Event(eventName, { bubbles: true })); } catch (e) { }
        };
    });

    beforeEach(() => resetBody());

    // ============ AuSidebar ============

    test('au-sidebar should be registered', () => {
        expect(customElements.get('au-sidebar')).toBe(AuSidebar);
    });

    test('au-sidebar should have correct baseClass', () => {
        expect(AuSidebar.baseClass).toBe('au-sidebar');
    });

    test('au-sidebar should observe open and width', () => {
        expect(AuSidebar.observedAttributes).toContain('open');
        expect(AuSidebar.observedAttributes).toContain('width');
    });

    test('closed sidebar should have 64px width', () => {
        const el = document.createElement('au-sidebar');
        body.appendChild(el);
        expect(el.style.width).toBe('64px');
    });

    test('open sidebar should have custom width', () => {
        const el = document.createElement('au-sidebar');
        el.setAttribute('open', '');
        body.appendChild(el);
        expect(el.style.width).toBe('250px');
    });

    test('sidebar should have 100vh height', () => {
        const el = document.createElement('au-sidebar');
        body.appendChild(el);
        expect(el.style.height).toBe('100vh');
    });

    test('sidebar should have flex display', () => {
        const el = document.createElement('au-sidebar');
        body.appendChild(el);
        expect(el.style.display).toBe('flex');
    });

    test('toggle() should add open attribute', () => {
        const el = document.createElement('au-sidebar');
        body.appendChild(el);
        el.toggle();
        expect(el.hasAttribute('open')).toBe(true);
    });

    test('toggle() should remove open attribute if open', () => {
        const el = document.createElement('au-sidebar');
        el.setAttribute('open', '');
        body.appendChild(el);
        el.toggle();
        expect(el.hasAttribute('open')).toBe(false);
    });

    // ============ AuSidebarItem ============

    test('au-sidebar-item should be registered', () => {
        expect(customElements.get('au-sidebar-item')).toBe(AuSidebarItem);
    });

    test('au-sidebar-item should have correct baseClass', () => {
        expect(AuSidebarItem.baseClass).toBe('au-sidebar__item');
    });

    test('sidebar-item should have flex display', () => {
        const el = document.createElement('au-sidebar-item');
        body.appendChild(el);
        expect(el.style.display).toBe('flex');
    });

    test('sidebar-item should have pointer cursor', () => {
        const el = document.createElement('au-sidebar-item');
        body.appendChild(el);
        expect(el.style.cursor).toBe('pointer');
    });

    test('active sidebar-item should have background', () => {
        const el = document.createElement('au-sidebar-item');
        el.setAttribute('active', '');
        body.appendChild(el);
        expect(el.style.background).toContain('primary-container');
    });
});
