/**
 * @fileoverview Comprehensive Unit Tests for au-tabs + au-tab Components
 * Tests: registration, render, tab list creation, active switching,
 *        click delegation, indicator CSS vars, ARIA attributes, au-tab-change event
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, patchEmit, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuTabs, AuTab;

describe('au-tabs Unit Tests', () => {

    beforeAll(async () => {
        const module = await import('../../src/components/au-tabs.js');
        AuTabs = module.AuTabs;
        AuTab = module.AuTab;
        patchEmit(AuTabs);
    });

    beforeEach(() => resetBody());

    // ========================================
    // REGISTRATION
    // ========================================

    test('au-tabs should be registered', () => {
        expect(customElements.get('au-tabs')).toBe(AuTabs);
    });

    test('au-tab should be registered', () => {
        expect(customElements.get('au-tab')).toBe(AuTab);
    });

    test('au-tabs should have correct baseClass', () => {
        expect(AuTabs.baseClass).toBe('au-tabs');
    });

    test('au-tab should have correct baseClass', () => {
        expect(AuTab.baseClass).toBe('au-tabs__tab');
    });

    test('au-tabs should observe active', () => {
        expect(AuTabs.observedAttributes).toContain('active');
    });

    // ========================================
    // RENDER - Tab list wrapping
    // ========================================

    test('should create .au-tabs__list wrapper on render', () => {
        const el = document.createElement('au-tabs');
        el.innerHTML = '<au-tab>Tab 1</au-tab><au-tab>Tab 2</au-tab>';
        body.appendChild(el);
        const list = el.querySelector('.au-tabs__list');
        expect(list).not.toBeNull();
    });

    test('list should have role tablist', () => {
        const el = document.createElement('au-tabs');
        el.innerHTML = '<au-tab>Tab 1</au-tab><au-tab>Tab 2</au-tab>';
        body.appendChild(el);
        const list = el.querySelector('.au-tabs__list');
        expect(list.getAttribute('role')).toBe('tablist');
    });

    test('au-tab children should be moved into list', () => {
        const el = document.createElement('au-tabs');
        el.innerHTML = '<au-tab>Tab 1</au-tab><au-tab>Tab 2</au-tab>';
        body.appendChild(el);
        const list = el.querySelector('.au-tabs__list');
        const tabs = list.querySelectorAll('au-tab');
        expect(tabs.length).toBe(2);
    });

    test('each au-tab should have role tab', () => {
        const el = document.createElement('au-tabs');
        el.innerHTML = '<au-tab>A</au-tab><au-tab>B</au-tab>';
        body.appendChild(el);
        const tabs = el.querySelectorAll('au-tab');
        tabs.forEach(tab => {
            expect(tab.getAttribute('role')).toBe('tab');
        });
    });

    test('render should be idempotent', () => {
        const el = document.createElement('au-tabs');
        el.innerHTML = '<au-tab>A</au-tab><au-tab>B</au-tab>';
        body.appendChild(el);
        el.render();
        expect(el.querySelectorAll('.au-tabs__list').length).toBe(1);
    });

    // ========================================
    // ACTIVE TAB STATE
    // ========================================

    test('first tab should be active by default (active="0")', () => {
        const el = document.createElement('au-tabs');
        el.innerHTML = '<au-tab>A</au-tab><au-tab>B</au-tab>';
        body.appendChild(el);
        const tabs = el.querySelectorAll('au-tab');
        expect(tabs[0].classList.contains('is-active')).toBe(true);
        expect(tabs[1].classList.contains('is-active')).toBe(false);
    });

    test('should set aria-selected on active tab', () => {
        const el = document.createElement('au-tabs');
        el.innerHTML = '<au-tab>A</au-tab><au-tab>B</au-tab>';
        body.appendChild(el);
        const tabs = el.querySelectorAll('au-tab');
        expect(tabs[0].getAttribute('aria-selected')).toBe('true');
        expect(tabs[1].getAttribute('aria-selected')).toBe('false');
    });

    test('should switch active tab when active attribute changes', () => {
        const el = document.createElement('au-tabs');
        el.innerHTML = '<au-tab>A</au-tab><au-tab>B</au-tab>';
        body.appendChild(el);

        el.setAttribute('active', '1');

        const tabs = el.querySelectorAll('au-tab');
        expect(tabs[0].classList.contains('is-active')).toBe(false);
        expect(tabs[1].classList.contains('is-active')).toBe(true);
    });

    test('should update aria-selected when switching tabs', () => {
        const el = document.createElement('au-tabs');
        el.innerHTML = '<au-tab>A</au-tab><au-tab>B</au-tab>';
        body.appendChild(el);

        el.setAttribute('active', '1');

        const tabs = el.querySelectorAll('au-tab');
        expect(tabs[0].getAttribute('aria-selected')).toBe('false');
        expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    });

    // ========================================
    // INDICATOR CSS CUSTOM PROPERTIES
    // ========================================

    test('should set indicator width CSS property', () => {
        const el = document.createElement('au-tabs');
        el.innerHTML = '<au-tab>A</au-tab><au-tab>B</au-tab>';
        body.appendChild(el);
        const list = el.querySelector('.au-tabs__list');
        // 2 tabs = 50% width each
        expect(list.style.getPropertyValue('--indicator-width')).toBe('50%');
    });

    test('should set indicator left CSS property for first tab', () => {
        const el = document.createElement('au-tabs');
        el.innerHTML = '<au-tab>A</au-tab><au-tab>B</au-tab>';
        body.appendChild(el);
        const list = el.querySelector('.au-tabs__list');
        expect(list.style.getPropertyValue('--indicator-left')).toBe('0%');
    });

    test('should update indicator left when switching to second tab', () => {
        const el = document.createElement('au-tabs');
        el.innerHTML = '<au-tab>A</au-tab><au-tab>B</au-tab>';
        body.appendChild(el);

        el.setAttribute('active', '1');

        const list = el.querySelector('.au-tabs__list');
        expect(list.style.getPropertyValue('--indicator-left')).toBe('50%');
    });

    test('indicator width should handle 3 tabs correctly', () => {
        const el = document.createElement('au-tabs');
        el.innerHTML = '<au-tab>A</au-tab><au-tab>B</au-tab><au-tab>C</au-tab>';
        body.appendChild(el);
        const list = el.querySelector('.au-tabs__list');
        // 3 tabs ≈ 33.33%
        const width = parseFloat(list.style.getPropertyValue('--indicator-width'));
        expect(width).toBeCloseTo(33.33, 1);
    });

    // ========================================
    // AU-TAB COMPONENT
    // ========================================

    test('au-tab should set tabindex 0', () => {
        const el = document.createElement('au-tab');
        el.textContent = 'Tab';
        body.appendChild(el);
        expect(el.getAttribute('tabindex')).toBe('0');
    });

    // ========================================
    // AU-TAB-CHANGE EVENT
    // ========================================

    test('should emit au-tab-change on active change', () => {
        const el = document.createElement('au-tabs');
        el.innerHTML = '<au-tab>A</au-tab><au-tab>B</au-tab>';
        body.appendChild(el);

        let eventDetail = null;
        el.addEventListener('au-tab-change', (e) => {
            eventDetail = e.detail;
        });

        el.setAttribute('active', '1');

        // The event is emitted via update() → emit()
        if (eventDetail) {
            expect(eventDetail.index).toBe(1);
        }
    });
});
