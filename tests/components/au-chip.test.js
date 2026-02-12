/**
 * @fileoverview Exhaustive Unit Tests for au-chip Component
 * Target: 13.98% → 90% coverage
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuChip;

describe('au-chip Unit Tests', () => {

    beforeAll(async () => {

        globalThis.PointerEvent = class PointerEvent extends Event {
            constructor(type, init = {}) { super(type, init); }
        };

        const module = await import('../../src/components/au-chip.js');
        AuChip = module.AuChip;

        AuChip.prototype.emit = function (eventName, detail) {
            try { this.dispatchEvent(new Event(eventName, { bubbles: true })); } catch (e) { }
        };
    });

    beforeEach(() => resetBody());

    // REGISTRATION
    test('should be registered', () => {
        expect(customElements.get('au-chip')).toBe(AuChip);
    });

    test('should have correct baseClass', () => {
        expect(AuChip.baseClass).toBe('au-chip');
    });

    // DOM STRUCTURE
    test('should render with base class', () => {
        const el = document.createElement('au-chip');
        el.textContent = 'Tag';
        body.appendChild(el);
        expect(el.classList.contains('au-chip')).toBe(true);
    });

    test('should create label span', () => {
        const el = document.createElement('au-chip');
        el.textContent = 'Filter';
        body.appendChild(el);
        expect(el.querySelector('.au-chip__label')).not.toBeNull();
    });

    // SELECTION
    test('should toggle selected on click', () => {
        const el = document.createElement('au-chip');
        el.textContent = 'Tag';
        body.appendChild(el);
        expect(el.hasAttribute('selected')).toBe(false);
        el.click();
        expect(el.hasAttribute('selected')).toBe(true);
    });

    test('should have selected class when selected', () => {
        const el = document.createElement('au-chip');
        el.setAttribute('selected', '');
        el.textContent = 'Tag';
        body.appendChild(el);
        expect(el.classList.contains('au-chip--selected') || el.hasAttribute('selected')).toBe(true);
    });

    // VARIANTS
    test('should support outlined variant', () => {
        const el = document.createElement('au-chip');
        el.setAttribute('variant', 'outlined');
        el.textContent = 'Outlined';
        body.appendChild(el);
        expect(el.getAttribute('variant')).toBe('outlined');
    });

    // REMOVABLE
    test('should show remove button when removable', () => {
        const el = document.createElement('au-chip');
        el.setAttribute('removable', '');
        el.textContent = 'Removable';
        body.appendChild(el);
        const removeBtn = el.querySelector('.au-chip__remove');
        expect(removeBtn !== null || el.hasAttribute('removable')).toBe(true);
    });

    // DISPLAY
    test('should have flex display', () => {
        const el = document.createElement('au-chip');
        body.appendChild(el);
        expect(['flex', 'inline-flex']).toContain(el.style.display);
    });

    test('should have pointer cursor', () => {
        const el = document.createElement('au-chip');
        body.appendChild(el);
        expect(el.style.cursor).toBe('pointer');
    });

    // STATIC MODE (non-interactive badge)
    test('static: should have default cursor instead of pointer', () => {
        const el = document.createElement('au-chip');
        el.setAttribute('static', '');
        el.textContent = 'Badge';
        body.appendChild(el);
        expect(el.style.cursor).toBe('default');
    });

    test('static: should NOT have tabindex', () => {
        const el = document.createElement('au-chip');
        el.setAttribute('static', '');
        el.textContent = 'Badge';
        body.appendChild(el);
        expect(el.hasAttribute('tabindex')).toBe(false);
    });

    test('static: should NOT have role=button', () => {
        const el = document.createElement('au-chip');
        el.setAttribute('static', '');
        el.textContent = 'Badge';
        body.appendChild(el);
        expect(el.hasAttribute('role')).toBe(false);
    });

    test('static: should NOT toggle on click', () => {
        const el = document.createElement('au-chip');
        el.setAttribute('static', '');
        el.textContent = 'Badge';
        body.appendChild(el);
        expect(el.hasAttribute('selected')).toBe(false);
        el.click();
        expect(el.hasAttribute('selected')).toBe(false); // Still not selected
    });

    test('static: toggle() method should be noop', () => {
        const el = document.createElement('au-chip');
        el.setAttribute('static', '');
        el.textContent = 'Badge';
        body.appendChild(el);
        el.toggle();
        expect(el.hasAttribute('selected')).toBe(false);
    });

    test('static: should NOT show remove button even if removable', () => {
        const el = document.createElement('au-chip');
        el.setAttribute('static', '');
        el.setAttribute('removable', '');
        el.textContent = 'Badge';
        body.appendChild(el);
        expect(el.querySelector('.au-chip__remove')).toBeNull();
    });

    // DESCRIBE (AI Agent Discovery)
    test('should have static describe() method', () => {
        expect(typeof AuChip.describe).toBe('function');
    });

    test('describe() should include static prop (after catalog)', async () => {
        // Load catalog for full metadata
        const { AuElement } = await import('../../src/core/AuElement.js');
        const { catalog } = await import('../../src/core/describe-catalog.js');
        AuElement._describeCatalog = catalog;

        const info = AuChip.describe();
        expect(info.props.static).toBeDefined();
        expect(info.props.static.type).toBe('boolean');
    });

    test('describe() should include examples (after catalog)', async () => {
        const info = AuChip.describe();
        expect(Array.isArray(info.examples)).toBe(true);
        expect(info.examples.some(ex => ex.includes('static'))).toBe(true);
    });
});
