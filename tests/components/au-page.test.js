/**
 * @fileoverview Comprehensive Unit Tests for au-page Component
 * Tests: registration, render, route/pageTitle/dependencies getters
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuPage;

describe('au-page Unit Tests', () => {

    beforeAll(async () => {
        const module = await import('../../src/components/au-page.js');
        AuPage = module.AuPage;
    });

    beforeEach(() => resetBody());

    // ========================================
    // REGISTRATION
    // ========================================

    test('should be registered', () => {
        expect(customElements.get('au-page')).toBe(AuPage);
    });

    test('should have correct baseClass', () => {
        expect(AuPage.baseClass).toBe('au-page');
    });

    test('should observe route and title', () => {
        const attrs = AuPage.observedAttributes;
        expect(attrs).toContain('route');
        expect(attrs).toContain('title');
    });

    // ========================================
    // GETTERS
    // ========================================

    test('route getter should return route attribute', () => {
        const el = document.createElement('au-page');
        el.setAttribute('route', 'buttons');
        body.appendChild(el);
        expect(el.route).toBe('buttons');
    });

    test('route getter should default to empty string', () => {
        const el = document.createElement('au-page');
        body.appendChild(el);
        expect(el.route).toBe('');
    });

    test('pageTitle getter should return title attribute', () => {
        const el = document.createElement('au-page');
        el.setAttribute('title', 'Buttons');
        body.appendChild(el);
        expect(el.pageTitle).toBe('Buttons');
    });

    test('pageTitle getter should default to empty string', () => {
        const el = document.createElement('au-page');
        body.appendChild(el);
        expect(el.pageTitle).toBe('');
    });

    test('dependencies getter should return empty array with no script', () => {
        const el = document.createElement('au-page');
        body.appendChild(el);
        expect(el.dependencies).toEqual([]);
    });
});
