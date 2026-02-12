/**
 * @fileoverview Comprehensive Unit Tests for au-dropdown Component
 * Tests: registration, render trigger, value get/set, select() method,
 *        ARIA attributes, disabled state, au-option registration
 * 
 * Note: Popover API (showPopover/hidePopover) is not available in linkedom.
 * Tests focus on registration, DOM structure, and API surface.
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, patchEmit, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuDropdown, AuOption;

describe('au-dropdown Unit Tests', () => {

    beforeAll(async () => {
        const module = await import('../../src/components/au-dropdown.js');
        AuDropdown = module.AuDropdown;
        AuOption = module.AuOption;
        patchEmit(AuDropdown);
    });

    beforeEach(() => resetBody());

    // ========================================
    // REGISTRATION
    // ========================================

    test('should be registered', () => {
        expect(customElements.get('au-dropdown')).toBe(AuDropdown);
    });

    test('should have correct baseClass', () => {
        expect(AuDropdown.baseClass).toBe('au-dropdown');
    });

    test('should observe placeholder, value, disabled', () => {
        const attrs = AuDropdown.observedAttributes;
        expect(attrs).toContain('placeholder');
        expect(attrs).toContain('value');
        expect(attrs).toContain('disabled');
    });

    // ========================================
    // AU-OPTION REGISTRATION
    // ========================================

    test('au-option should be registered', () => {
        expect(customElements.get('au-option')).toBe(AuOption);
    });

    test('au-option should have correct baseClass', () => {
        expect(AuOption.baseClass).toBe('au-dropdown__option');
    });

    test('au-option should set role option on connect', () => {
        const opt = document.createElement('au-option');
        opt.textContent = 'Test';
        body.appendChild(opt);
        expect(opt.getAttribute('role')).toBe('option');
    });

    // ========================================
    // VALUE GET/SET
    // ========================================

    test('value getter should return empty string initially', () => {
        const el = document.createElement('au-dropdown');
        body.appendChild(el);
        expect(el.value).toBe('');
    });

    test('value setter should update attribute', () => {
        const el = document.createElement('au-dropdown');
        body.appendChild(el);
        el.value = 'test-value';
        expect(el.getAttribute('value')).toBe('test-value');
    });

    test('value getter should return set value', () => {
        const el = document.createElement('au-dropdown');
        body.appendChild(el);
        el.value = 'hello';
        expect(el.value).toBe('hello');
    });

    // ========================================
    // PUBLIC API
    // ========================================

    test('should have toggle() method', () => {
        const el = document.createElement('au-dropdown');
        body.appendChild(el);
        expect(typeof el.toggle).toBe('function');
    });

    test('should have open() method', () => {
        const el = document.createElement('au-dropdown');
        body.appendChild(el);
        expect(typeof el.open).toBe('function');
    });

    test('should have close() method', () => {
        const el = document.createElement('au-dropdown');
        body.appendChild(el);
        expect(typeof el.close).toBe('function');
    });

    test('should have select() method', () => {
        const el = document.createElement('au-dropdown');
        body.appendChild(el);
        expect(typeof el.select).toBe('function');
    });

    // ========================================
    // SELECT VS VALUE SETTER BEHAVIOR
    // ========================================

    test('select() should update the value attribute', () => {
        const el = document.createElement('au-dropdown');
        el.innerHTML = '<au-option value="low">Low</au-option><au-option value="high">High</au-option>';
        body.appendChild(el);

        // Wait for render (uses requestAnimationFrame)
        // In linkedom, rAF executes synchronously on next tick
        return new Promise(resolve => {
            setTimeout(() => {
                el.select('high', 'High');
                expect(el.value).toBe('high');
                expect(el.getAttribute('value')).toBe('high');
                resolve();
            }, 0);
        });
    });

    test('select() should update the displayed label text', () => {
        const el = document.createElement('au-dropdown');
        el.innerHTML = '<au-option value="low">Low</au-option><au-option value="high">High</au-option>';
        body.appendChild(el);

        return new Promise(resolve => {
            setTimeout(() => {
                el.select('high', 'High');
                const valueDisplay = el.querySelector('.au-dropdown__value');
                expect(valueDisplay?.textContent).toBe('High');
                resolve();
            }, 0);
        });
    });

    test('value setter should update attribute but NOT the displayed label', () => {
        const el = document.createElement('au-dropdown');
        el.setAttribute('placeholder', 'Select priority');
        el.innerHTML = '<au-option value="low">Low</au-option><au-option value="high">High</au-option>';
        body.appendChild(el);

        return new Promise(resolve => {
            setTimeout(() => {
                // Using .value = sets the attribute...
                el.value = 'high';
                expect(el.getAttribute('value')).toBe('high');

                // ...but the displayed text still shows the placeholder
                const valueDisplay = el.querySelector('.au-dropdown__value');
                expect(valueDisplay?.textContent).toBe('Select priority');
                resolve();
            }, 0);
        });
    });

    test('select() should emit au-select event', () => {
        const el = document.createElement('au-dropdown');
        el.innerHTML = '<au-option value="a">Option A</au-option>';
        body.appendChild(el);

        return new Promise(resolve => {
            setTimeout(() => {
                const events = [];
                el.addEventListener('au-select', e => events.push(e.detail));
                el.select('a', 'Option A');
                expect(events.length).toBe(1);
                expect(events[0].value).toBe('a');
                expect(events[0].label).toBe('Option A');
                resolve();
            }, 0);
        });
    });
});
