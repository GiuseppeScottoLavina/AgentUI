/**
 * @fileoverview Unit Tests for au-drawer-item Component
 * Focus: Accessibility requirements (aria-label, label capture)
 * 
 * These tests ensure:
 * 1. aria-label is ALWAYS present on the rendered link
 * 2. Label is captured synchronously before DOM manipulation
 * 3. Text content fallback works for inline labels
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuDrawerItem, AuNavItem;

describe('au-drawer-item Accessibility Tests', () => {

    beforeAll(async () => {

        const module = await import('../../src/components/au-drawer-item.js');
        AuDrawerItem = module.AuDrawerItem;
        AuNavItem = module.AuNavItem;
    });

    beforeEach(() => resetBody());

    // REGISTRATION
    test('should be registered as au-drawer-item', () => {
        expect(customElements.get('au-drawer-item')).toBe(AuDrawerItem);
    });

    test('should be registered as au-nav-item alias', () => {
        expect(customElements.get('au-nav-item')).toBeDefined();
    });

    // ARIA-LABEL - CRITICAL ACCESSIBILITY FIX
    describe('aria-label accessibility', () => {

        test('should include aria-label when label attribute is set', () => {
            const el = document.createElement('au-drawer-item');
            el.setAttribute('label', 'Home');
            el.setAttribute('href', '#home');
            el.setAttribute('icon', 'home');
            body.appendChild(el);

            const link = el.querySelector('a.au-drawer-item-link');
            expect(link).toBeTruthy();
            expect(link.getAttribute('aria-label')).toBe('Home');
        });

        test('should include aria-label when text content is provided inline', () => {
            // This simulates: <au-drawer-item>Dashboard</au-drawer-item>
            const el = document.createElement('au-drawer-item');
            el.textContent = 'Dashboard';
            el.setAttribute('href', '#dashboard');
            el.setAttribute('icon', 'dashboard');
            body.appendChild(el);

            const link = el.querySelector('a.au-drawer-item-link');
            expect(link).toBeTruthy();
            expect(link.getAttribute('aria-label')).toBe('Dashboard');
        });

        test('should mark visible label as aria-hidden to avoid duplication', () => {
            const el = document.createElement('au-drawer-item');
            el.setAttribute('label', 'Settings');
            el.setAttribute('href', '#settings');
            el.setAttribute('icon', 'settings');
            body.appendChild(el);

            const labelSpan = el.querySelector('.au-drawer-item-label');
            expect(labelSpan).toBeTruthy();
            expect(labelSpan.getAttribute('aria-hidden')).toBe('true');
        });

        test('should NOT have empty aria-label', () => {
            const el = document.createElement('au-drawer-item');
            el.setAttribute('label', 'Profile');
            el.setAttribute('href', '#profile');
            body.appendChild(el);

            const link = el.querySelector('a.au-drawer-item-link');
            const ariaLabel = link.getAttribute('aria-label');
            expect(ariaLabel).toBeTruthy();
            expect(ariaLabel.length).toBeGreaterThan(0);
        });
    });

    // LABEL CAPTURE TIMING - REGRESSION FIX
    describe('label capture timing', () => {

        test('should capture text content in connectedCallback', () => {
            const el = document.createElement('au-drawer-item');
            el.textContent = 'Navigation';
            el.setAttribute('href', '#nav');
            body.appendChild(el);

            // After connecting, label should be captured and used
            expect(el.label).toBe('Navigation');
        });

        test('should preserve label attribute over text content', () => {
            const el = document.createElement('au-drawer-item');
            el.setAttribute('label', 'Explicit Label');
            el.textContent = 'Fallback Text';
            el.setAttribute('href', '#test');
            body.appendChild(el);

            expect(el.label).toBe('Explicit Label');
        });

        test('should use captured text when label attribute absent', () => {
            const el = document.createElement('au-drawer-item');
            el.appendChild(document.createTextNode('Captured'));
            el.setAttribute('href', '#captured');
            body.appendChild(el);

            expect(el.label).toBe('Captured');
        });
    });

    // AU-NAV-ITEM (Bottom Navigation)
    describe('au-nav-item accessibility', () => {

        test('should set vertical layout by default', () => {
            const el = document.createElement('au-nav-item');
            el.setAttribute('label', 'Home');
            el.setAttribute('icon', 'home');
            body.appendChild(el);

            expect(el.getAttribute('layout')).toBe('vertical');
        });

        test('should include aria-label on bottom nav items', () => {
            const el = document.createElement('au-nav-item');
            el.setAttribute('label', 'Search');
            el.setAttribute('href', '#search');
            el.setAttribute('icon', 'search');
            body.appendChild(el);

            const link = el.querySelector('a.au-drawer-item-link');
            expect(link).toBeTruthy();
            expect(link.getAttribute('aria-label')).toBe('Search');
        });

        test('should use label attribute for bottom nav items (recommended pattern)', () => {
            // Note: For au-nav-item, always use label attribute instead of text content
            // because the layout attribute setting can trigger early render
            const el = document.createElement('au-nav-item');
            el.setAttribute('label', 'Favorites');
            el.setAttribute('href', '#favorites');
            el.setAttribute('icon', 'star');
            body.appendChild(el);

            expect(el.label).toBe('Favorites');
            const link = el.querySelector('a.au-drawer-item-link');
            expect(link.getAttribute('aria-label')).toBe('Favorites');
        });
    });

    // DISABLED STATE ACCESSIBILITY
    describe('disabled state accessibility', () => {

        test('should set aria-disabled on disabled links', () => {
            const el = document.createElement('au-drawer-item');
            el.setAttribute('label', 'Locked');
            el.setAttribute('href', '#locked');
            el.setAttribute('disabled', '');
            body.appendChild(el);

            const link = el.querySelector('a.au-drawer-item-link');
            expect(link.getAttribute('aria-disabled')).toBe('true');
        });

        test('should set disabled attribute on buttons', () => {
            const el = document.createElement('au-drawer-item');
            el.setAttribute('label', 'Action');
            // No href = renders as button
            el.setAttribute('disabled', '');
            body.appendChild(el);

            const button = el.querySelector('button.au-drawer-item-link');
            expect(button).toBeTruthy();
            expect(button.hasAttribute('disabled')).toBe(true);
        });
    });
});
