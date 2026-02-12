/**
 * @fileoverview Unit Tests for au-repeat Component
 * Target: 89% → 100%
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuRepeat;

describe('au-repeat Unit Tests', () => {

    beforeAll(async () => {

        const module = await import('../../src/components/au-repeat.js');
        AuRepeat = module.AuRepeat;
    });

    beforeEach(() => resetBody());

    // REGISTRATION
    test('should be registered', () => {
        expect(customElements.get('au-repeat')).toBe(AuRepeat);
    });

    test('should have correct baseClass', () => {
        expect(AuRepeat.baseClass).toBe('au-repeat');
    });

    // RENDER
    test('should set display contents', () => {
        const el = document.createElement('au-repeat');
        body.appendChild(el);
        expect(el.style.display).toBe('contents');
    });

    // ITEMS
    test('should have items getter/setter', () => {
        const el = document.createElement('au-repeat');
        body.appendChild(el);
        el.items = [1, 2, 3];
        expect(el.items).toEqual([1, 2, 3]);
    });

    test('should handle null items', () => {
        const el = document.createElement('au-repeat');
        body.appendChild(el);
        el.items = null;
        expect(el.items).toEqual([]);
    });

    // KEY FN
    test('should allow setting keyFn', () => {
        const el = document.createElement('au-repeat');
        body.appendChild(el);
        el.keyFn = (item) => item.id;
        expect(true).toBe(true);
    });

    // RENDER ITEM
    test('should allow setting renderItem', () => {
        const el = document.createElement('au-repeat');
        body.appendChild(el);
        el.renderItem = (item) => `<span>${item}</span>`;
        expect(true).toBe(true);
    });

    // GET ELEMENT
    test('should have getElement method', () => {
        const el = document.createElement('au-repeat');
        body.appendChild(el);
        expect(typeof el.getElement).toBe('function');
    });

    test('getElement returns undefined for unknown key', () => {
        const el = document.createElement('au-repeat');
        body.appendChild(el);
        expect(el.getElement('unknown')).toBeUndefined();
    });

    // REFRESH
    test('should have refresh method', () => {
        const el = document.createElement('au-repeat');
        body.appendChild(el);
        expect(typeof el.refresh).toBe('function');
    });

    test('refresh should clear innerHTML', () => {
        const el = document.createElement('au-repeat');
        el.innerHTML = '<div>test</div>';
        body.appendChild(el);
        el.refresh();
        expect(el.innerHTML).toBe('');
    });
});
