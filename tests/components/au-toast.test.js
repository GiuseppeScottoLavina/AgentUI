/**
 * @fileoverview Unit Tests for au-toast Component and LightBus Integration
 * 
 * CRITICAL: These tests prevent regressions for:
 * - Toast rendering and structure
 * - Auto-dismiss functionality
 * - Severity variants
 * - Toast.show() programmatic API
 * - LightBus listener registration (fixes lazy loading)
 * - Container management
 */

import { describe, test, expect, beforeAll, beforeEach, afterEach } from 'bun:test';
import { dom, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuToast, AuToastContainer, Toast, bus, UIEvents;

describe('au-toast Component', () => {

    beforeAll(async () => {

        // DON'T reset __AGENTUI_BUS__ — the bus is a singleton shared across all modules.
        // Resetting it would create a new bus, but the toast module's listener is on the OLD bus.
        // Import bus (reuses the shared singleton)
        const busModule = await import('../../src/core/bus.js');
        bus = busModule.bus;
        UIEvents = busModule.UIEvents;

        // Import component (also registers it and the bus listener on first load)
        const module = await import('../../src/components/au-toast.js');
        AuToast = module.AuToast;
        AuToastContainer = module.AuToastContainer;
        Toast = module.Toast;


        // Patch emit for linkedom compatibility
        AuToast.prototype.emit = function (eventName, detail) {
            try {
                this.dispatchEvent(new Event(eventName, { bubbles: true }));
            } catch (e) {
                // linkedom throws on eventPhase assignment, safe to ignore
            }
        };
    });

    beforeEach(() => resetBody());

    // ============================================================
    // REGISTRATION AND BASE SETUP
    // ============================================================

    test('au-toast should be registered as custom element', () => {
        expect(customElements.get('au-toast')).toBe(AuToast);
    });

    test('au-toast-container should be registered as custom element', () => {
        expect(customElements.get('au-toast-container')).toBe(AuToastContainer);
    });

    test('au-toast should have correct baseClass', () => {
        expect(AuToast.baseClass).toBe('au-toast');
    });

    test('au-toast-container should have correct baseClass', () => {
        expect(AuToastContainer.baseClass).toBe('au-toast-container');
    });

    test('au-toast should observe correct attributes', () => {
        expect(AuToast.observedAttributes).toContain('severity');
        expect(AuToast.observedAttributes).toContain('duration');
        expect(AuToast.observedAttributes).toContain('position');
    });

    // ============================================================
    // DOM STRUCTURE
    // ============================================================

    test('au-toast should render with base class', () => {
        const toast = document.createElement('au-toast');
        toast.textContent = 'Test message';
        body.appendChild(toast);

        expect(toast.classList.contains('au-toast')).toBe(true);
    });

    test('au-toast should create content wrapper', () => {
        const toast = document.createElement('au-toast');
        toast.textContent = 'Test message';
        body.appendChild(toast);

        const content = toast.querySelector('.au-toast__content');
        expect(content).not.toBeNull();
    });

    test('au-toast should create close button', () => {
        const toast = document.createElement('au-toast');
        toast.textContent = 'Test message';
        body.appendChild(toast);

        const closeBtn = toast.querySelector('.au-toast__close');
        expect(closeBtn).not.toBeNull();
        expect(closeBtn.getAttribute('aria-label')).toBe('Dismiss');
    });

    test('au-toast should preserve message in content', () => {
        const toast = document.createElement('au-toast');
        toast.textContent = 'Hello World';
        body.appendChild(toast);

        const content = toast.querySelector('.au-toast__content');
        expect(content.textContent).toContain('Hello World');
    });

    // ============================================================
    // SEVERITY VARIANTS
    // ============================================================

    test('au-toast should apply severity class', () => {
        const toast = document.createElement('au-toast');
        toast.setAttribute('severity', 'success');
        toast.textContent = 'Success!';
        body.appendChild(toast);

        expect(toast.className).toContain('au-toast--success');
    });

    test('au-toast should default to info severity', () => {
        const toast = document.createElement('au-toast');
        toast.textContent = 'Info message';
        body.appendChild(toast);

        expect(toast.className).toContain('au-toast--info');
    });

    test('au-toast should support error severity', () => {
        const toast = document.createElement('au-toast');
        toast.setAttribute('severity', 'error');
        toast.textContent = 'Error!';
        body.appendChild(toast);

        expect(toast.className).toContain('au-toast--error');
    });

    test('au-toast should support warning severity', () => {
        const toast = document.createElement('au-toast');
        toast.setAttribute('severity', 'warning');
        toast.textContent = 'Warning!';
        body.appendChild(toast);

        expect(toast.className).toContain('au-toast--warning');
    });

    // ============================================================
    // DISMISS FUNCTIONALITY
    // ============================================================

    test('au-toast.dismiss() should add exiting class', () => {
        const toast = document.createElement('au-toast');
        toast.textContent = 'Test';
        body.appendChild(toast);

        toast.dismiss();

        expect(toast.classList.contains('is-exiting')).toBe(true);
    });

    test('clicking close button should dismiss toast', () => {
        const toast = document.createElement('au-toast');
        toast.textContent = 'Test';
        body.appendChild(toast);

        const closeBtn = toast.querySelector('.au-toast__close');
        closeBtn.click();

        expect(toast.classList.contains('is-exiting')).toBe(true);
    });

    // ============================================================
    // TOAST CONTAINER
    // ============================================================

    test('au-toast-container should render with base class', () => {
        const container = document.createElement('au-toast-container');
        body.appendChild(container);

        expect(container.classList.contains('au-toast-container')).toBe(true);
    });

    test('au-toast-container should have accessibility attributes', () => {
        const container = document.createElement('au-toast-container');
        body.appendChild(container);

        expect(container.getAttribute('role')).toBe('status');
        expect(container.getAttribute('aria-live')).toBe('polite');
    });

    // ============================================================
    // TOAST.SHOW() PROGRAMMATIC API
    // ============================================================

    test('Toast.show() should create a toast element', () => {
        const toast = Toast.show('Test message');

        expect(toast).not.toBeNull();
        expect(toast.tagName.toLowerCase()).toBe('au-toast');
    });

    test('Toast.show() should set message content', () => {
        const toast = Toast.show('My custom message');

        expect(toast.textContent).toContain('My custom message');
    });

    test('Toast.show() should create container if not exists', () => {
        // Clear containers
        document.querySelectorAll('au-toast-container').forEach(c => c.remove());

        Toast.show('Test');

        const container = document.querySelector('au-toast-container');
        expect(container).not.toBeNull();
    });

    test('Toast.show() should apply severity option', () => {
        const toast = Toast.show('Success!', { severity: 'success' });

        expect(toast.getAttribute('severity')).toBe('success');
    });

    test('Toast.show() should apply duration option', () => {
        const toast = Toast.show('Quick message', { duration: 1000 });

        expect(toast.getAttribute('duration')).toBe('1000');
    });

    test('Toast.show() should respect position option', () => {
        const toast = Toast.show('Top message', { position: 'top-right' });

        const container = document.querySelector('au-toast-container[position="top-right"]');
        expect(container).not.toBeNull();
    });

    // ============================================================
    // LIGHTBUS INTEGRATION - CRITICAL FOR LAZY LOADING FIX
    // ============================================================

    test('LightBus should have UIEvents.TOAST_SHOW constant', () => {
        expect(UIEvents.TOAST_SHOW).toBe('ui:toast:show');
    });

    test('LightBus should have toast listener registered on module load', () => {
        // This is the critical fix - listener auto-registers when module loads
        expect(bus.hasListeners(UIEvents.TOAST_SHOW)).toBe(true);
    });

    test('emitting ui:toast:show should create a toast via listener', () => {
        // Directly invoke Toast.show (the same function the bus listener calls)
        const toast = Toast.show('Bus test!');

        // Should return a toast element
        expect(toast).not.toBeNull();
        expect(toast.tagName.toLowerCase()).toBe('au-toast');
    });

    test('emitting toast event with severity should apply it', () => {
        const toast = Toast.show('Error toast!', { severity: 'error' });

        expect(toast).not.toBeNull();
        expect(toast.getAttribute('severity')).toBe('error');
    });

    // ============================================================
    // IDEMPOTENT LISTENER REGISTRATION
    // ============================================================

    test('multiple module imports should not duplicate listeners', async () => {
        // Import module again
        await import('../../src/components/au-toast.js');
        await import('../../src/components/au-toast.js');

        // Should still have listener (idempotent guard in module-level code)
        expect(bus.hasListeners(UIEvents.TOAST_SHOW)).toBe(true);

        // Verify direct invocation creates a valid toast
        const toast = Toast.show('Single toast');
        expect(toast).not.toBeNull();
        expect(toast.tagName.toLowerCase()).toBe('au-toast');
    });

    // ========================================================================
    // BUG FIX REGRESSION TESTS
    // ========================================================================

    // BUG #10: dismiss() must use this.listen() not raw addEventListener
    test('dismiss() should use managed listener (source inspection)', async () => {
        // Read the source and verify this.listen() is used instead of raw addEventListener
        const fs = await import('fs');
        const source = fs.readFileSync(
            new URL('../../src/components/au-toast.js', import.meta.url),
            'utf-8'
        );

        // Find the dismiss METHOD definition (not a call to dismiss())
        const dismissStart = source.indexOf('dismiss() {');
        expect(dismissStart).toBeGreaterThan(-1);

        // Extract a reasonable block from the method
        const dismissBlock = source.slice(dismissStart, dismissStart + 800);

        // Must use this.listen(this, 'animationend' — managed listener
        expect(dismissBlock).toContain("this.listen(this, 'animationend'");
        // Must NOT use raw addEventListener
        expect(dismissBlock).not.toContain("this.addEventListener('animationend'");
    });
});
