/**
 * @fileoverview Comprehensive Unit Tests for au-layout Component
 * Tests: registration, render DOM structure (wrapper, header, body, drawer, main, footer, bottom)
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, patchEmit, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuLayout;

describe('au-layout Unit Tests', () => {

    beforeAll(async () => {
        const module = await import('../../src/components/au-layout.js');
        AuLayout = module.AuLayout;
        patchEmit(AuLayout);
    });

    beforeEach(() => resetBody());

    // ========================================
    // REGISTRATION
    // ========================================

    test('should be registered', () => {
        expect(customElements.get('au-layout')).toBe(AuLayout);
    });

    test('should have correct baseClass', () => {
        expect(AuLayout.baseClass).toBe('au-layout');
    });

    test('should observe has-drawer and has-bottom-nav', () => {
        const attrs = AuLayout.observedAttributes;
        expect(attrs).toContain('has-drawer');
        expect(attrs).toContain('has-bottom-nav');
    });

    // ========================================
    // RENDER — DOM Structure
    // ========================================

    test('should create wrapper', () => {
        const el = document.createElement('au-layout');
        body.appendChild(el);
        expect(el.querySelector('.au-layout-wrapper')).not.toBeNull();
    });

    test('should create header', () => {
        const el = document.createElement('au-layout');
        body.appendChild(el);
        expect(el.querySelector('.au-layout-header')).not.toBeNull();
    });

    test('header should be a header element', () => {
        const el = document.createElement('au-layout');
        body.appendChild(el);
        expect(el.querySelector('header')).not.toBeNull();
    });

    test('should create layout body', () => {
        const el = document.createElement('au-layout');
        body.appendChild(el);
        expect(el.querySelector('.au-layout-body')).not.toBeNull();
    });

    test('should create drawer container', () => {
        const el = document.createElement('au-layout');
        body.appendChild(el);
        expect(el.querySelector('.au-layout-drawer')).not.toBeNull();
    });

    test('drawer should be an aside element', () => {
        const el = document.createElement('au-layout');
        body.appendChild(el);
        expect(el.querySelector('aside')).not.toBeNull();
    });

    test('should create main container', () => {
        const el = document.createElement('au-layout');
        body.appendChild(el);
        expect(el.querySelector('.au-layout-main')).not.toBeNull();
    });

    test('should create content area', () => {
        const el = document.createElement('au-layout');
        body.appendChild(el);
        expect(el.querySelector('.au-layout-content')).not.toBeNull();
    });

    test('content should be a main element', () => {
        const el = document.createElement('au-layout');
        body.appendChild(el);
        expect(el.querySelector('main')).not.toBeNull();
    });

    test('should create footer', () => {
        const el = document.createElement('au-layout');
        body.appendChild(el);
        expect(el.querySelector('.au-layout-footer')).not.toBeNull();
    });

    test('footer should be a footer element', () => {
        const el = document.createElement('au-layout');
        body.appendChild(el);
        expect(el.querySelector('footer')).not.toBeNull();
    });

    test('should create bottom container', () => {
        const el = document.createElement('au-layout');
        body.appendChild(el);
        expect(el.querySelector('.au-layout-bottom')).not.toBeNull();
    });

    // ========================================
    // FULL-BLEED ATTRIBUTE
    // ========================================

    test('should observe full-bleed attribute', () => {
        const attrs = AuLayout.observedAttributes;
        expect(attrs).toContain('full-bleed');
    });

    test('full-bleed attribute should be settable', () => {
        const el = document.createElement('au-layout');
        body.appendChild(el);
        el.setAttribute('full-bleed', '');
        expect(el.hasAttribute('full-bleed')).toBe(true);
    });

    // ========================================
    // PADDING INTEGRITY CHECK
    // ========================================

    test('should have _checkPaddingIntegrity method', () => {
        const el = document.createElement('au-layout');
        body.appendChild(el);
        expect(typeof el._checkPaddingIntegrity).toBe('function');
    });

    test('_checkPaddingIntegrity should not warn without has-bottom-nav', () => {
        const el = document.createElement('au-layout');
        body.appendChild(el);
        const warnSpy = [];
        const origWarn = console.warn;
        console.warn = (...args) => warnSpy.push(args);
        try {
            el._checkPaddingIntegrity();
            expect(warnSpy.length).toBe(0);
        } finally {
            console.warn = origWarn;
        }
    });

    test('_checkPaddingIntegrity should warn when padding-bottom is too low', () => {
        const el = document.createElement('au-layout');
        // Simulate bottom-nav being present
        const bottomNav = document.createElement('au-bottom-nav');
        bottomNav.setAttribute('slot', 'bottom');
        el.appendChild(bottomNav);
        body.appendChild(el);
        el.setAttribute('has-bottom-nav', '');

        // Mock getComputedStyle to return low padding
        const origGetCS = dom.window.getComputedStyle;
        dom.window.getComputedStyle = (element) => {
            if (element.className === 'au-layout-content') {
                return { paddingBottom: '0px' };
            }
            return origGetCS ? origGetCS(element) : {};
        };

        const warnSpy = [];
        const origWarn = console.warn;
        console.warn = (...args) => warnSpy.push(args);
        try {
            el._checkPaddingIntegrity();
            expect(warnSpy.length).toBe(1);
            expect(warnSpy[0][0]).toContain('[au-layout]');
            expect(warnSpy[0][0]).toContain('padding-bottom');
        } finally {
            console.warn = origWarn;
            dom.window.getComputedStyle = origGetCS;
        }
    });

    test('_checkPaddingIntegrity should not warn when padding-bottom is adequate', () => {
        const el = document.createElement('au-layout');
        const bottomNav = document.createElement('au-bottom-nav');
        bottomNav.setAttribute('slot', 'bottom');
        el.appendChild(bottomNav);
        body.appendChild(el);
        el.setAttribute('has-bottom-nav', '');

        // Mock getComputedStyle to return adequate padding
        const origGetCS = dom.window.getComputedStyle;
        dom.window.getComputedStyle = (element) => {
            if (element.className === 'au-layout-content') {
                return { paddingBottom: '96px' };
            }
            return origGetCS ? origGetCS(element) : {};
        };

        const warnSpy = [];
        const origWarn = console.warn;
        console.warn = (...args) => warnSpy.push(args);
        try {
            el._checkPaddingIntegrity();
            expect(warnSpy.length).toBe(0);
        } finally {
            console.warn = origWarn;
            dom.window.getComputedStyle = origGetCS;
        }
    });

    test('_checkPaddingIntegrity should not warn when child element has adequate padding', () => {
        const el = document.createElement('au-layout');
        const bottomNav = document.createElement('au-bottom-nav');
        bottomNav.setAttribute('slot', 'bottom');
        el.appendChild(bottomNav);
        body.appendChild(el);
        el.setAttribute('has-bottom-nav', '');

        // Add a child <main> inside .au-layout-content with adequate padding
        const content = el.querySelector('.au-layout-content');
        const main = document.createElement('main');
        main.className = 'app-main';
        content.appendChild(main);

        // Mock: content has 0px padding, but child has 96px
        const origGetCS = dom.window.getComputedStyle;
        dom.window.getComputedStyle = (element) => {
            if (element.className === 'au-layout-content') {
                return { paddingBottom: '0px' };
            }
            if (element.className === 'app-main') {
                return { paddingBottom: '96px' };
            }
            return origGetCS ? origGetCS(element) : {};
        };

        const warnSpy = [];
        const origWarn = console.warn;
        console.warn = (...args) => warnSpy.push(args);
        try {
            el._checkPaddingIntegrity();
            // Should NOT warn — child handles the padding
            expect(warnSpy.length).toBe(0);
        } finally {
            console.warn = origWarn;
            dom.window.getComputedStyle = origGetCS;
        }
    });

    test('_checkPaddingIntegrity should not warn when full-bleed is active', () => {
        const el = document.createElement('au-layout');
        const bottomNav = document.createElement('au-bottom-nav');
        bottomNav.setAttribute('slot', 'bottom');
        el.appendChild(bottomNav);
        body.appendChild(el);
        el.setAttribute('has-bottom-nav', '');
        el.setAttribute('full-bleed', '');

        // Mock getComputedStyle to return 0px padding (which is correct for full-bleed)
        const origGetCS = dom.window.getComputedStyle;
        dom.window.getComputedStyle = (element) => {
            if (element.className === 'au-layout-content') {
                return { paddingBottom: '0px' };
            }
            return origGetCS ? origGetCS(element) : {};
        };

        const warnSpy = [];
        const origWarn = console.warn;
        console.warn = (...args) => warnSpy.push(args);
        try {
            el._checkPaddingIntegrity();
            // Should NOT warn — full-bleed + has-bottom-nav uses .au-layout-main
            // height compensation instead of padding-bottom
            expect(warnSpy.length).toBe(0);
        } finally {
            console.warn = origWarn;
            dom.window.getComputedStyle = origGetCS;
        }
    });
});
