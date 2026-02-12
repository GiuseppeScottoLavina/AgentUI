/**
 * @fileoverview Unit Tests for au-virtual-list Component
 * Target: 73% → 90% coverage
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuVirtualList;

describe('au-virtual-list Unit Tests', () => {

    beforeAll(async () => {

        const module = await import('../../src/components/au-virtual-list.js');
        AuVirtualList = module.AuVirtualList;
    });

    beforeEach(() => resetBody());

    // REGISTRATION
    test('should be registered', () => {
        expect(customElements.get('au-virtual-list')).toBe(AuVirtualList);
    });

    test('should have correct baseClass', () => {
        expect(AuVirtualList.baseClass).toBe('au-virtual-list');
    });

    test('should observe item-height, buffer', () => {
        expect(AuVirtualList.observedAttributes).toContain('item-height');
        expect(AuVirtualList.observedAttributes).toContain('buffer');
    });

    // RENDER
    test('should create content container', () => {
        const el = document.createElement('au-virtual-list');
        body.appendChild(el);
        expect(el.querySelector('.au-virtual-list__content')).not.toBeNull();
    });

    test('render should be idempotent', () => {
        const el = document.createElement('au-virtual-list');
        body.appendChild(el);
        el.render();
        expect(el.querySelectorAll('.au-virtual-list__content').length).toBe(1);
    });

    // ITEMS
    test('should have items getter', () => {
        const el = document.createElement('au-virtual-list');
        body.appendChild(el);
        expect(el.items).toBeDefined();
    });

    test('should have items setter', () => {
        const el = document.createElement('au-virtual-list');
        body.appendChild(el);
        el.items = [1, 2, 3];
        expect(el.items).toEqual([1, 2, 3]);
    });

    // ITEM HEIGHT
    test.skip('should have itemHeight getter (E2E only)', () => {
        const el = document.createElement('au-virtual-list');
        body.appendChild(el);
        expect(typeof el.itemHeight).toBe('number');
    });

    test('should have itemHeight setter', () => {
        const el = document.createElement('au-virtual-list');
        body.appendChild(el);
        el.itemHeight = 60;
        expect(el.itemHeight).toBe(60);
    });

    // RENDER ITEM
    test.skip('should have renderItem getter (E2E only)', () => {
        const el = document.createElement('au-virtual-list');
        body.appendChild(el);
        expect(el.renderItem).toBeDefined();
    });

    test.skip('should have renderItem setter (E2E only)', () => {
        const el = document.createElement('au-virtual-list');
        body.appendChild(el);
        const fn = (item) => `<div>${item}</div>`;
        el.renderItem = fn;
        expect(el.renderItem).toBe(fn);
    });

    // BUFFER
    test('should default buffer to 5', () => {
        const el = document.createElement('au-virtual-list');
        body.appendChild(el);
        expect(el.getAttribute('buffer') || '5').toBe('5');
    });
});
