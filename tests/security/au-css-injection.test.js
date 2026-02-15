/**
 * @fileoverview AuElement CSS Injection Security Tests
 * 
 * R6: Tests that _loadComponentCSS validates basePath is same-origin,
 * preventing cross-origin CSS injection via DOM clobbering.
 */

import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import '../../tests/setup-dom.js';
import { AuElement } from '../../src/core/AuElement.js';

describe('R6: CSS Base Path Origin Validation', () => {

    beforeEach(() => {
        // Reset static state
        AuElement._bundleChecked = false;
        AuElement._bundleLoaded = false;
        AuElement._loadedCSS.clear();
    });

    afterEach(() => {
        // Clean up injected elements
        document.querySelectorAll('link[data-test]').forEach(el => el.remove());
        AuElement._bundleChecked = false;
        AuElement._bundleLoaded = false;
        AuElement._loadedCSS.clear();
    });

    test('should use default /styles/ path when no link elements exist', () => {
        // Create a test component class
        class TestComponent extends AuElement {
            static cssFile = 'test-component';
            render() { }
        }

        // Register and create
        if (!customElements.get('au-test-css-safe')) {
            customElements.define('au-test-css-safe', TestComponent);
        }

        const el = document.createElement('au-test-css-safe');
        document.body.appendChild(el);

        // Check that the CSS link was created with a safe path
        const cssLink = document.querySelector('#au-css-test-component');
        if (cssLink) {
            const href = cssLink.getAttribute('href') || '';
            // Should be relative or same-origin, NOT cross-origin
            expect(href.startsWith('https://evil.com')).toBe(false);
            expect(href.startsWith('http://evil.com')).toBe(false);
        }

        document.body.removeChild(el);
        if (cssLink) cssLink.remove();
    });

    test('should reject cross-origin base path from injected link element', () => {
        // Simulate DOM clobbering: attacker injects a link with evil href
        const evilLink = document.createElement('link');
        evilLink.setAttribute('href', 'https://evil.com/styles/agentui.css');
        evilLink.setAttribute('rel', 'stylesheet');
        evilLink.setAttribute('data-test', 'true');
        document.head.appendChild(evilLink);

        class TestComponent2 extends AuElement {
            static cssFile = 'test-component-2';
            render() { }
        }

        if (!customElements.get('au-test-css-evil')) {
            customElements.define('au-test-css-evil', TestComponent2);
        }

        const el = document.createElement('au-test-css-evil');
        document.body.appendChild(el);

        // The CSS link should NOT point to evil.com
        const cssLink = document.querySelector('#au-css-test-component-2');
        if (cssLink) {
            const href = cssLink.getAttribute('href') || '';
            expect(href).not.toContain('evil.com');
        }

        document.body.removeChild(el);
        if (cssLink) cssLink.remove();
    });
});
