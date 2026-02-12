/**
 * @fileoverview Unit Tests for au-splash Component
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuSplash;

describe('au-splash Unit Tests', () => {

    beforeAll(async () => {

        const module = await import('../../src/components/au-splash.js');
        AuSplash = module.AuSplash;
    });

    beforeEach(() => {
        resetBody();
        // Reset splash-critical style between tests
        const existing = document.getElementById('au-splash-critical');
        if (existing) existing.remove();
    });

    // REGISTRATION
    test('should be registered', () => {
        expect(customElements.get('au-splash')).toBe(AuSplash);
    });

    test('should have correct baseClass', () => {
        expect(AuSplash.baseClass).toBe('au-splash');
    });

    test('should observe logo, duration, delay, spinner', () => {
        expect(AuSplash.observedAttributes).toContain('logo');
        expect(AuSplash.observedAttributes).toContain('duration');
        expect(AuSplash.observedAttributes).toContain('delay');
        expect(AuSplash.observedAttributes).toContain('spinner');
    });

    // RENDER
    test('should render spinner by default', () => {
        const el = document.createElement('au-splash');
        body.appendChild(el);
        const spinner = el.querySelector('.au-splash__spinner');
        expect(spinner).toBeTruthy();
    });

    test('should render logo when provided', () => {
        const el = document.createElement('au-splash');
        el.setAttribute('logo', 'test.svg');
        body.appendChild(el);
        const logo = el.querySelector('.au-splash__logo');
        expect(logo).toBeTruthy();
        expect(logo.getAttribute('src')).toBe('test.svg');
    });

    test('should hide spinner when spinner="false"', () => {
        const el = document.createElement('au-splash');
        el.setAttribute('spinner', 'false');
        body.appendChild(el);
        const spinner = el.querySelector('.au-splash__spinner');
        expect(spinner).toBeNull();
    });

    test('should inject critical CSS into head', () => {
        const el = document.createElement('au-splash');
        body.appendChild(el);
        const criticalCSS = document.getElementById('au-splash-critical');
        expect(criticalCSS).toBeTruthy();
        expect(criticalCSS.tagName).toBe('STYLE');
    });

    // ============================================================
    // HIDE BEHAVIOR
    // ============================================================
    test('_hide should mark as hidden', async () => {
        const el = document.createElement('au-splash');
        body.appendChild(el);

        el._hide();
        // Wait for the timeout inside _hide that adds the class
        await new Promise(r => setTimeout(r, 50));

        expect(el._hidden).toBe(true);
        expect(el.classList.contains('au-splash--hidden')).toBe(true);
    });

    test('_hide should be idempotent', async () => {
        const el = document.createElement('au-splash');
        body.appendChild(el);

        el._hide();
        el._hide(); // Second call should be no-op
        await new Promise(r => setTimeout(r, 50));

        expect(el._hidden).toBe(true);
    });

    test('should set CSS variable for duration', () => {
        const el = document.createElement('au-splash');
        el.setAttribute('duration', '500');
        body.appendChild(el);

        expect(el.style.getPropertyValue('--au-splash-duration')).toBe('500ms');
    });

    test('should use default duration of 300ms', () => {
        const el = document.createElement('au-splash');
        body.appendChild(el);

        expect(el.style.getPropertyValue('--au-splash-duration')).toBe('300ms');
    });

    test('should not re-inject critical CSS if already present', () => {
        const el1 = document.createElement('au-splash');
        body.appendChild(el1);

        const el2 = document.createElement('au-splash');
        body.appendChild(el2);

        // Should still only have one critical CSS element
        const styles = document.querySelectorAll('#au-splash-critical');
        expect(styles.length).toBe(1);
    });

    test('constructor should record start time', () => {
        const el = document.createElement('au-splash');
        expect(el._startTime).toBeDefined();
        expect(typeof el._startTime).toBe('number');
        expect(el._hidden).toBe(false);
    });

    test('should use useContainment = false', () => {
        expect(AuSplash.useContainment).toBe(false);
    });

    test('should listen for au-ready to auto-hide', async () => {
        // document.dispatchEvent fails in LinkedOM (readonly eventPhase).
        // Verify via source that au-ready listener is registered.
        const fs = await import('fs');
        const source = fs.readFileSync(
            new URL('../../src/components/au-splash.js', import.meta.url),
            'utf-8'
        );
        expect(source).toContain("this.listen(document, 'au-ready'");
        expect(source).toContain('this._hide()');
    });

    test('should support delay attribute', async () => {
        const el = document.createElement('au-splash');
        el.setAttribute('delay', '0');
        body.appendChild(el);

        el._hide();
        await new Promise(r => setTimeout(r, 50));

        expect(el._hidden).toBe(true);
    });
});
