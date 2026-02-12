/**
 * @fileoverview Unit Tests for au-table Components
 * Target: 68% → 100% coverage
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuTable, AuThead, AuTbody, AuTr, AuTh, AuTd;

describe('au-table Unit Tests', () => {

    beforeAll(async () => {

        const module = await import('../../src/components/au-table.js');
        AuTable = module.AuTable;
        AuThead = module.AuThead;
        AuTbody = module.AuTbody;
        AuTr = module.AuTr;
        AuTh = module.AuTh;
        AuTd = module.AuTd;
    });

    beforeEach(() => resetBody());

    // ============ AuTable ============
    test('au-table should be registered', () => {
        expect(customElements.get('au-table')).toBe(AuTable);
    });

    test('au-table should have correct baseClass', () => {
        expect(AuTable.baseClass).toBe('au-table');
    });

    test('au-table should have table display', () => {
        const el = document.createElement('au-table');
        body.appendChild(el);
        expect(el.style.display).toBe('table');
    });

    test('au-table should have 100% width', () => {
        const el = document.createElement('au-table');
        body.appendChild(el);
        expect(el.style.width).toBe('100%');
    });

    // ============ AuThead ============
    test('au-thead should be registered', () => {
        expect(customElements.get('au-thead')).toBe(AuThead);
    });

    test('au-thead should have table-header-group display', () => {
        const el = document.createElement('au-thead');
        body.appendChild(el);
        expect(el.style.display).toBe('table-header-group');
    });

    // ============ AuTbody ============
    test('au-tbody should be registered', () => {
        expect(customElements.get('au-tbody')).toBe(AuTbody);
    });

    test('au-tbody should have table-row-group display', () => {
        const el = document.createElement('au-tbody');
        body.appendChild(el);
        expect(el.style.display).toBe('table-row-group');
    });

    // ============ AuTr ============
    test('au-tr should be registered', () => {
        expect(customElements.get('au-tr')).toBe(AuTr);
    });

    test('au-tr should have table-row display', () => {
        const el = document.createElement('au-tr');
        body.appendChild(el);
        expect(el.style.display).toBe('table-row');
    });

    // ============ AuTh ============
    test('au-th should be registered', () => {
        expect(customElements.get('au-th')).toBe(AuTh);
    });

    test('au-th should have table-cell display', () => {
        const el = document.createElement('au-th');
        body.appendChild(el);
        expect(el.style.display).toBe('table-cell');
    });

    test('au-th should have font-weight 600', () => {
        const el = document.createElement('au-th');
        body.appendChild(el);
        expect(el.style.fontWeight).toBe('600');
    });

    // ============ AuTd ============
    test('au-td should be registered', () => {
        expect(customElements.get('au-td')).toBe(AuTd);
    });

    test('au-td should have table-cell display', () => {
        const el = document.createElement('au-td');
        body.appendChild(el);
        expect(el.style.display).toBe('table-cell');
    });

    test('au-td should have padding', () => {
        const el = document.createElement('au-td');
        body.appendChild(el);
        expect(el.style.padding).toBe('12px 16px');
    });
});
