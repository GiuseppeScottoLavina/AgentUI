/**
 * @fileoverview Unit Tests for au-icon Component
 * Target: 78% → 90% coverage
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuIcon;

describe('au-icon Unit Tests', () => {

    beforeAll(async () => {

        const module = await import('../../src/components/au-icon.js');
        AuIcon = module.AuIcon;
    });

    beforeEach(() => resetBody());

    // REGISTRATION
    test('should be registered', () => {
        expect(customElements.get('au-icon')).toBe(AuIcon);
    });

    test('should have correct baseClass', () => {
        expect(AuIcon.baseClass).toBe('au-icon');
    });

    test('should observe name, size, svg, filled, font', () => {
        expect(AuIcon.observedAttributes).toContain('name');
        expect(AuIcon.observedAttributes).toContain('size');
        expect(AuIcon.observedAttributes).toContain('filled');
        expect(AuIcon.observedAttributes).toContain('font');
    });

    // RENDER & NAME tests: see tests/e2e/au-icon.e2e.test.js (Puppeteer)

    // SIZE MAPPING (v0.1.80 — bug: named sizes passed raw to SVG)
    test('size="sm" should render SVG with width=20 height=20', () => {
        const el = document.createElement('au-icon');
        el.setAttribute('name', 'check'); // bundled SVG icon
        el.setAttribute('size', 'sm');
        body.appendChild(el);
        const svg = el.querySelector('svg');
        expect(svg).not.toBeNull();
        expect(svg.getAttribute('width')).toBe('20');
        expect(svg.getAttribute('height')).toBe('20');
    });

    test('size="md" should render SVG with width=24 height=24', () => {
        const el = document.createElement('au-icon');
        el.setAttribute('name', 'check');
        el.setAttribute('size', 'md');
        body.appendChild(el);
        const svg = el.querySelector('svg');
        expect(svg.getAttribute('width')).toBe('24');
        expect(svg.getAttribute('height')).toBe('24');
    });

    test('size="lg" should render SVG with width=32 height=32', () => {
        const el = document.createElement('au-icon');
        el.setAttribute('name', 'check');
        el.setAttribute('size', 'lg');
        body.appendChild(el);
        const svg = el.querySelector('svg');
        expect(svg.getAttribute('width')).toBe('32');
        expect(svg.getAttribute('height')).toBe('32');
    });

    test('size="xl" should render SVG with width=40 height=40', () => {
        const el = document.createElement('au-icon');
        el.setAttribute('name', 'check');
        el.setAttribute('size', 'xl');
        body.appendChild(el);
        const svg = el.querySelector('svg');
        expect(svg).not.toBeNull();
        expect(svg.getAttribute('width')).toBe('40');
        expect(svg.getAttribute('height')).toBe('40');
    });

    test('size="48" (numeric) should render SVG with width=48 height=48', () => {
        const el = document.createElement('au-icon');
        el.setAttribute('name', 'check');
        el.setAttribute('size', '48');
        body.appendChild(el);
        const svg = el.querySelector('svg');
        expect(svg.getAttribute('width')).toBe('48');
        expect(svg.getAttribute('height')).toBe('48');
    });

    test('size="bogus" (invalid) should fallback to 24', () => {
        const el = document.createElement('au-icon');
        el.setAttribute('name', 'check');
        el.setAttribute('size', 'bogus');
        body.appendChild(el);
        const svg = el.querySelector('svg');
        expect(svg.getAttribute('width')).toBe('24');
        expect(svg.getAttribute('height')).toBe('24');
    });

    test('size="xl" with font icon should set fontSize to 40px', () => {
        // Reset font injection flag
        AuIcon._fontInjected = false;
        const el = document.createElement('au-icon');
        el.setAttribute('name', 'zzz_font_only_icon');
        el.setAttribute('size', 'xl');
        body.appendChild(el);
        const span = el.querySelector('span');
        expect(span).not.toBeNull();
        expect(span.style.fontSize).toBe('40px');
    });

    // FILLED
    test('should support filled variant', () => {
        const el = document.createElement('au-icon');
        el.setAttribute('filled', '');
        body.appendChild(el);
        expect(el.has('filled')).toBe(true);
    });

    // WEIGHT
    test('should support weight attribute', () => {
        const el = document.createElement('au-icon');
        el.setAttribute('weight', '700');
        body.appendChild(el);
        expect(el.getAttribute('weight')).toBe('700');
    });

    // v0.1.71: Auto-inject Google Fonts for non-bundled icons
    test('should inject Google Fonts link only once (deduplication)', () => {
        // Reset injection flag
        AuIcon._fontInjected = false;

        const fontUrl = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined';
        // Remove any previously injected link
        const existingLink = document.querySelector(`link[href="${fontUrl}"]`);
        if (existingLink) existingLink.remove();

        // Render two non-bundled icons
        const el1 = document.createElement('au-icon');
        el1.setAttribute('name', 'zzz_test_icon_1');
        body.appendChild(el1);

        const el2 = document.createElement('au-icon');
        el2.setAttribute('name', 'zzz_test_icon_2');
        body.appendChild(el2);

        // Only ONE link should exist
        const links = document.querySelectorAll(`link[href="${fontUrl}"]`);
        expect(links.length).toBe(1);
    });

    test('should inject Google Fonts link when rendering non-bundled icon', () => {
        // Reset injection flag for this test
        AuIcon._fontInjected = false;

        const el = document.createElement('au-icon');
        // Use a name that's definitely NOT in SVG_ICONS or SYMBOL_NAMES
        el.setAttribute('name', 'zzz_nonexistent_icon_test');
        body.appendChild(el);

        // After render, the flag should be set
        expect(AuIcon._fontInjected).toBe(true);

        // A <link> element should be in document.head
        const fontUrl = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined';
        const link = document.querySelector(`link[href="${fontUrl}"]`);
        expect(link).not.toBeNull();
        expect(link.rel).toBe('stylesheet');
    });

    test('should not inject Google Fonts link for bundled icons', () => {
        // Reset injection flag
        AuIcon._fontInjected = false;

        // Remove any previously injected link
        const fontUrl = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined';
        const existingLink = document.querySelector(`link[href="${fontUrl}"]`);
        if (existingLink) existingLink.remove();

        const el = document.createElement('au-icon');
        // 'home' is a bundled SVG icon
        el.setAttribute('name', 'home');
        body.appendChild(el);

        // Should render as SVG, not trigger font injection
        expect(el.querySelector('svg')).not.toBeNull();
        // Flag should NOT be set for bundled icons
        expect(AuIcon._fontInjected).toBeFalsy();
    });
});
