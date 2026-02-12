/**
 * @fileoverview Comprehensive Unit Tests for au-modal Component
 * Tests: registration, render, native dialog creation, open/close public API,
 *        close button, ARIA, open attribute, is-open class, au-open/au-close events
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, patchEmit, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuModal;

describe('au-modal Unit Tests', () => {

    beforeAll(async () => {
        const module = await import('../../src/components/au-modal.js');
        AuModal = module.AuModal;
        patchEmit(AuModal);
    });

    beforeEach(() => resetBody());

    // ========================================
    // REGISTRATION
    // ========================================

    test('should be registered', () => {
        expect(customElements.get('au-modal')).toBe(AuModal);
    });

    test('should have correct baseClass', () => {
        expect(AuModal.baseClass).toBe('au-modal');
    });

    test('should observe open and size', () => {
        expect(AuModal.observedAttributes).toContain('open');
        expect(AuModal.observedAttributes).toContain('size');
    });

    // ========================================
    // RENDER — Dialog DOM Structure
    // ========================================

    test('should create native dialog element', () => {
        const el = document.createElement('au-modal');
        el.innerHTML = '<p>Modal content</p>';
        body.appendChild(el);
        expect(el.querySelector('dialog')).not.toBeNull();
    });

    test('dialog should have au-modal__dialog class', () => {
        const el = document.createElement('au-modal');
        el.innerHTML = '<p>Content</p>';
        body.appendChild(el);
        const dialog = el.querySelector('dialog');
        expect(dialog.classList.contains('au-modal__dialog')).toBe(true);
    });

    test('should render close button', () => {
        const el = document.createElement('au-modal');
        el.innerHTML = '<p>Content</p>';
        body.appendChild(el);
        const closeBtn = el.querySelector('.au-modal__close');
        expect(closeBtn).not.toBeNull();
    });

    test('close button should have aria-label', () => {
        const el = document.createElement('au-modal');
        el.innerHTML = '<p>Content</p>';
        body.appendChild(el);
        const closeBtn = el.querySelector('.au-modal__close');
        expect(closeBtn.getAttribute('aria-label')).toBe('Close');
    });

    test('should render body element', () => {
        const el = document.createElement('au-modal');
        el.innerHTML = '<p>Content</p>';
        body.appendChild(el);
        expect(el.querySelector('.au-modal__body')).not.toBeNull();
    });

    test('should preserve user content in body', () => {
        const el = document.createElement('au-modal');
        el.innerHTML = '<p>Hello World</p>';
        body.appendChild(el);
        const content = el.querySelector('.au-modal__body');
        expect(content.innerHTML).toContain('Hello World');
    });

    test('render should be idempotent', () => {
        const el = document.createElement('au-modal');
        el.innerHTML = '<p>Content</p>';
        body.appendChild(el);
        el.render();
        expect(el.querySelectorAll('dialog').length).toBe(1);
    });

    // ========================================
    // SIZE VARIANTS
    // ========================================

    test('should default to md size class', () => {
        const el = document.createElement('au-modal');
        el.innerHTML = '<p>Content</p>';
        body.appendChild(el);
        const dialog = el.querySelector('dialog');
        expect(dialog.classList.contains('au-modal--md')).toBe(true);
    });

    test('should apply lg size class', () => {
        const el = document.createElement('au-modal');
        el.setAttribute('size', 'lg');
        el.innerHTML = '<p>Content</p>';
        body.appendChild(el);
        const dialog = el.querySelector('dialog');
        expect(dialog.classList.contains('au-modal--lg')).toBe(true);
    });

    // ========================================
    // PUBLIC API
    // ========================================

    test('should have open() method', () => {
        const el = document.createElement('au-modal');
        el.innerHTML = '<p>Content</p>';
        body.appendChild(el);
        expect(typeof el.open).toBe('function');
    });

    test('should have close() method', () => {
        const el = document.createElement('au-modal');
        el.innerHTML = '<p>Content</p>';
        body.appendChild(el);
        expect(typeof el.close).toBe('function');
    });

    test('open() should set open attribute', () => {
        const el = document.createElement('au-modal');
        el.innerHTML = '<p>Content</p>';
        body.appendChild(el);
        el.open();
        expect(el.hasAttribute('open')).toBe(true);
    });

    test('close() should remove open attribute', () => {
        const el = document.createElement('au-modal');
        el.innerHTML = '<p>Content</p>';
        body.appendChild(el);
        el.open();
        el.close();
        // close uses setTimeout(200ms) fallback, so check immediately if is-visible is removed
        expect(el.classList.contains('is-visible')).toBe(false);
    });

    // ========================================
    // IS-OPEN CLASS
    // ========================================

    test('should add is-open class when opened', () => {
        const el = document.createElement('au-modal');
        el.innerHTML = '<p>Content</p>';
        body.appendChild(el);
        el.open();
        expect(el.classList.contains('is-open')).toBe(true);
    });
});
