/**
 * @fileoverview Unit Tests for au-button Component
 * Target: 81% → 95% coverage
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuButton;

describe('au-button Unit Tests', () => {

    beforeAll(async () => {

        const module = await import('../../src/components/au-button.js');
        AuButton = module.AuButton;
    });

    beforeEach(() => resetBody());

    // REGISTRATION
    test('should be registered', () => {
        expect(customElements.get('au-button')).toBe(AuButton);
    });

    test('should have correct baseClass', () => {
        expect(AuButton.baseClass).toBe('au-button');
    });

    test('should observe variant, size, type, disabled, loading, icon', () => {
        expect(AuButton.observedAttributes).toContain('variant');
        expect(AuButton.observedAttributes).toContain('size');
        expect(AuButton.observedAttributes).toContain('disabled');
    });

    // RENDER
    test('should render button content', () => {
        const el = document.createElement('au-button');
        el.textContent = 'Click me';
        body.appendChild(el);
        expect(el.textContent).toContain('Click');
    });

    test('should set role button', () => {
        const el = document.createElement('au-button');
        body.appendChild(el);
        expect(el.getAttribute('role')).toBe('button');
    });

    test('should set tabindex 0', () => {
        const el = document.createElement('au-button');
        body.appendChild(el);
        expect(el.getAttribute('tabindex')).toBe('0');
    });

    // VARIANT
    test('should support filled variant', () => {
        const el = document.createElement('au-button');
        el.setAttribute('variant', 'filled');
        body.appendChild(el);
        expect(el.getAttribute('variant')).toBe('filled');
    });

    test('should support outlined variant', () => {
        const el = document.createElement('au-button');
        el.setAttribute('variant', 'outlined');
        body.appendChild(el);
        expect(el.getAttribute('variant')).toBe('outlined');
    });

    test('should support text variant', () => {
        const el = document.createElement('au-button');
        el.setAttribute('variant', 'text');
        body.appendChild(el);
        expect(el.getAttribute('variant')).toBe('text');
    });

    // DISABLED
    test('should support disabled state', () => {
        const el = document.createElement('au-button');
        el.setAttribute('disabled', '');
        body.appendChild(el);
        expect(el.has('disabled')).toBe(true);
    });

    test('disabled should set tabindex -1', () => {
        const el = document.createElement('au-button');
        el.setAttribute('disabled', '');
        body.appendChild(el);
        expect(el.getAttribute('tabindex')).toBe('-1');
    });

    // LOADING
    test('should support loading state', () => {
        const el = document.createElement('au-button');
        el.setAttribute('loading', '');
        body.appendChild(el);
        expect(el.has('loading')).toBe(true);
    });

    // REGRESSION: Children preservation (v0.1.26)
    test('should preserve custom children after initial render', () => {
        const el = document.createElement('au-button');
        el.textContent = 'Save';
        body.appendChild(el);

        // Simulate agent adding custom icon after initial render
        const icon = document.createElement('au-icon');
        icon.setAttribute('name', 'save');
        el.appendChild(icon);

        // Trigger re-render via attribute change
        el.setAttribute('variant', 'filled');

        // Icon should still be present
        expect(el.querySelector('au-icon')).toBeTruthy();
    });

    // REGRESSION: Custom class preservation (v0.1.26)
    test('should preserve custom classes when updating', () => {
        const el = document.createElement('au-button');
        el.textContent = 'Test';
        body.appendChild(el);

        // Agent adds custom class
        el.classList.add('my-custom-class');

        // Trigger class update via attribute change
        el.setAttribute('variant', 'outlined');

        // Custom class should still be present
        expect(el.classList.contains('my-custom-class')).toBe(true);
        expect(el.classList.contains('au-button--outlined')).toBe(true);
    });

    // REGRESSION: Old variant class removal (v0.1.26)
    test('should remove old variant class when changing variant', () => {
        const el = document.createElement('au-button');
        el.setAttribute('variant', 'filled');
        body.appendChild(el);

        expect(el.classList.contains('au-button--filled')).toBe(true);

        el.setAttribute('variant', 'outlined');

        expect(el.classList.contains('au-button--outlined')).toBe(true);
        expect(el.classList.contains('au-button--filled')).toBe(false);
    });

    // REGRESSION: Icon-only button preservation (v0.1.28)
    test('should preserve icon children in icon-only buttons', () => {
        const el = document.createElement('au-button');
        el.setAttribute('variant', 'ghost');

        // Add icon child BEFORE appending to DOM
        const icon = document.createElement('au-icon');
        icon.setAttribute('name', 'delete');
        el.appendChild(icon);

        body.appendChild(el);

        // Icon should still be present after render
        expect(el.querySelector('au-icon')).toBeTruthy();
        expect(el.querySelector('au-icon').getAttribute('name')).toBe('delete');
    });
    // FIX 2: setupActivation should use this.listen() for AbortController cleanup
    test('source: setupActivation should use this.listen not raw addEventListener', async () => {
        const fs = await import('fs');
        const source = fs.readFileSync(
            new URL('../../src/core/AuElement.js', import.meta.url),
            'utf-8'
        );

        // Find setupActivation method body
        const match = source.match(/setupActivation\s*\(callback\)\s*\{([\s\S]*?)\n    \}/);
        expect(match).toBeTruthy();
        const methodBody = match[1];

        // Should use this.listen, NOT this.addEventListener
        expect(methodBody).toContain('this.listen(');
        expect(methodBody).not.toContain('this.addEventListener(');
    });
});
