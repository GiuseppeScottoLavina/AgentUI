/**
 * @fileoverview Unit tests for core/layers.js
 * Tests the centralized Z-Index Layer System
 */

import { describe, expect, it, beforeEach } from 'bun:test';
import { Z_INDEX, injectLayerTokens } from '../../src/core/layers.js';

describe('Z_INDEX Constants', () => {
    it('should export Z_INDEX object', () => {
        expect(Z_INDEX).toBeDefined();
        expect(typeof Z_INDEX).toBe('object');
    });

    it('should have all required layer levels', () => {
        expect(Z_INDEX.base).toBeDefined();
        expect(Z_INDEX.sticky).toBeDefined();
        expect(Z_INDEX.dropdown).toBeDefined();
        expect(Z_INDEX.drawer).toBeDefined();
        expect(Z_INDEX.modal).toBeDefined();
        expect(Z_INDEX.toast).toBeDefined();
        expect(Z_INDEX.tooltip).toBeDefined();
        expect(Z_INDEX.overlay).toBeDefined();
        expect(Z_INDEX.devtools).toBeDefined();
    });

    it('should have correct numerical values', () => {
        expect(Z_INDEX.base).toBe(1);
        expect(Z_INDEX.sticky).toBe(100);
        expect(Z_INDEX.dropdown).toBe(1000);
        expect(Z_INDEX.drawer).toBe(1100);
        expect(Z_INDEX.modal).toBe(1200);
        expect(Z_INDEX.toast).toBe(1300);
        expect(Z_INDEX.tooltip).toBe(1400);
        expect(Z_INDEX.overlay).toBe(9999);
        expect(Z_INDEX.devtools).toBe(999999);
    });

    it('should have layers in ascending order', () => {
        expect(Z_INDEX.base).toBeLessThan(Z_INDEX.sticky);
        expect(Z_INDEX.sticky).toBeLessThan(Z_INDEX.dropdown);
        expect(Z_INDEX.dropdown).toBeLessThan(Z_INDEX.drawer);
        expect(Z_INDEX.drawer).toBeLessThan(Z_INDEX.modal);
        expect(Z_INDEX.modal).toBeLessThan(Z_INDEX.toast);
        expect(Z_INDEX.toast).toBeLessThan(Z_INDEX.tooltip);
        expect(Z_INDEX.tooltip).toBeLessThan(Z_INDEX.overlay);
        expect(Z_INDEX.overlay).toBeLessThan(Z_INDEX.devtools);
    });

    it('should be frozen (immutable)', () => {
        expect(Object.isFrozen(Z_INDEX)).toBe(true);
    });

    it('should not allow modifications', () => {
        // Attempt to modify should fail silently in strict mode
        const originalValue = Z_INDEX.modal;
        try {
            // @ts-ignore - intentionally testing immutability
            Z_INDEX.modal = 999;
        } catch (e) {
            // Expected in strict mode
        }
        expect(Z_INDEX.modal).toBe(originalValue);
    });
});

describe('injectLayerTokens', () => {
    beforeEach(() => {
        // Remove any existing layer tokens style element
        const existing = document.getElementById('au-layer-tokens');
        if (existing) {
            existing.remove();
        }
    });

    it('should be a function', () => {
        expect(typeof injectLayerTokens).toBe('function');
    });

    it('should inject style element into document head', () => {
        injectLayerTokens();
        const styleEl = document.getElementById('au-layer-tokens');
        expect(styleEl).toBeDefined();
        expect(styleEl?.tagName.toLowerCase()).toBe('style');
    });

    it('should be idempotent (only inject once)', () => {
        injectLayerTokens();
        injectLayerTokens();
        injectLayerTokens();

        const elements = document.querySelectorAll('#au-layer-tokens');
        expect(elements.length).toBe(1);
    });

    it('should inject CSS custom properties for all layers', () => {
        injectLayerTokens();
        const styleEl = document.getElementById('au-layer-tokens');
        const content = styleEl?.textContent || '';

        expect(content).toContain('--z-base');
        expect(content).toContain('--z-sticky');
        expect(content).toContain('--z-dropdown');
        expect(content).toContain('--z-drawer');
        expect(content).toContain('--z-modal');
        expect(content).toContain('--z-toast');
        expect(content).toContain('--z-tooltip');
        expect(content).toContain('--z-overlay');
        expect(content).toContain('--z-devtools');
    });

    it('should inject correct values in CSS', () => {
        injectLayerTokens();
        const styleEl = document.getElementById('au-layer-tokens');
        const content = styleEl?.textContent || '';

        expect(content).toContain('--z-base: 1');
        expect(content).toContain('--z-modal: 1200');
        expect(content).toContain('--z-overlay: 9999');
    });

    it('should inject into :root selector', () => {
        injectLayerTokens();
        const styleEl = document.getElementById('au-layer-tokens');
        const content = styleEl?.textContent || '';

        expect(content).toContain(':root');
    });
});
