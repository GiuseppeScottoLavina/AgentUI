/**
 * @fileoverview Unit Tests for au-theme-toggle Component
 * Simple component: 54 lines, theme switcher button
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuThemeToggle;

describe('au-theme-toggle Unit Tests', () => {

    beforeAll(async () => {

        // au-theme-toggle imports Theme and bus — set up mocks
        globalThis.localStorage = {
            _data: {},
            getItem(key) { return this._data[key] ?? null; },
            setItem(key, val) { this._data[key] = String(val); },
            removeItem(key) { delete this._data[key]; },
        };
        const module = await import('../../src/components/au-theme-toggle.js');
        AuThemeToggle = module.AuThemeToggle;
    });

    beforeEach(() => resetBody());

    // REGISTRATION
    test('should be registered', () => {
        expect(customElements.get('au-theme-toggle')).toBe(AuThemeToggle);
    });

    test('should have correct baseClass', () => {
        expect(AuThemeToggle.baseClass).toBe('au-theme-toggle');
    });

    // RENDER
    test('should render button element', () => {
        const el = document.createElement('au-theme-toggle');
        body.appendChild(el);
        const button = el.querySelector('.au-theme-toggle__button');
        expect(button).toBeTruthy();
    });

    test('should render icon span', () => {
        const el = document.createElement('au-theme-toggle');
        body.appendChild(el);
        const icon = el.querySelector('.au-theme-toggle__icon');
        expect(icon).toBeTruthy();
    });

    test('should have aria-label on button', () => {
        const el = document.createElement('au-theme-toggle');
        body.appendChild(el);
        const button = el.querySelector('.au-theme-toggle__button');
        expect(button.getAttribute('aria-label')).toBe('Toggle theme');
    });

    test('should display an emoji icon', () => {
        const el = document.createElement('au-theme-toggle');
        body.appendChild(el);
        const icon = el.querySelector('.au-theme-toggle__icon');
        // Should have either sun or moon emoji
        const text = icon.textContent;
        expect(text === '☀️' || text === '🌙').toBe(true);
    });

    // STRUCTURE
    test('should render correct DOM structure', () => {
        const el = document.createElement('au-theme-toggle');
        body.appendChild(el);

        const button = el.querySelector('button');
        expect(button).toBeTruthy();

        const span = button.querySelector('span');
        expect(span).toBeTruthy();
        expect(span.classList.contains('au-theme-toggle__icon')).toBe(true);
    });
});
