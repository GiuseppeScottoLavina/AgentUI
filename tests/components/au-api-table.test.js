/**
 * @fileoverview Unit Tests for au-api-table Component
 * Dev tool: renders API docs tables with row types (attributes/properties/methods/events/tokens)
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuApiTable, AuApiRow;

describe('au-api-table Unit Tests', () => {

    beforeAll(async () => {

        const module = await import('../../src/components/au-api-table.js');
        AuApiTable = module.AuApiTable;
        AuApiRow = module.AuApiRow;
    });

    beforeEach(() => resetBody());

    // REGISTRATION
    test('should be registered as au-api-table', () => {
        expect(customElements.get('au-api-table')).toBe(AuApiTable);
    });

    test('should be registered as au-api-row', () => {
        expect(customElements.get('au-api-row')).toBe(AuApiRow);
    });

    test('should have correct baseClass', () => {
        expect(AuApiTable.baseClass).toBe('au-api-table');
        expect(AuApiRow.baseClass).toBe('au-api-row');
    });

    test('should observe type attribute', () => {
        expect(AuApiTable.observedAttributes).toContain('type');
    });

    test('AuApiRow should observe name, type, default, signature, detail', () => {
        const attrs = AuApiRow.observedAttributes;
        expect(attrs).toContain('name');
        expect(attrs).toContain('type');
        expect(attrs).toContain('default');
        expect(attrs).toContain('signature');
        expect(attrs).toContain('detail');
    });

    // RENDER — ATTRIBUTES TYPE (default)
    test('should render attributes table by default', () => {
        const el = document.createElement('au-api-table');
        el.innerHTML = '<au-api-row name="checked" type="boolean" default="false">Whether checked</au-api-row>';
        body.appendChild(el);

        const table = el.querySelector('.au-api-table__table');
        expect(table).toBeTruthy();
        const headers = el.querySelectorAll('th');
        expect(headers.length).toBe(4); // Name, Type, Default, Description
        expect(headers[0].textContent).toBe('Name');
    });

    test('should render row data within attributes table', () => {
        const el = document.createElement('au-api-table');
        el.innerHTML = '<au-api-row name="variant" type="string" default="filled">Button variant</au-api-row>';
        body.appendChild(el);

        const row = el.querySelector('tbody tr');
        expect(row).toBeTruthy();
        const cells = row.querySelectorAll('td');
        expect(cells[0].textContent.trim()).toBe('variant');
        expect(cells[1].textContent.trim()).toBe('string');
        expect(cells[2].textContent.trim()).toBe('filled');
        expect(cells[3].textContent.trim()).toBe('Button variant');
    });

    // RENDER — METHODS TYPE
    test('should render methods table with Signature column', () => {
        const el = document.createElement('au-api-table');
        el.setAttribute('type', 'methods');
        el.innerHTML = '<au-api-row name="open" signature="(): void">Opens the modal</au-api-row>';
        body.appendChild(el);

        const headers = el.querySelectorAll('th');
        expect(headers.length).toBe(3); // Name, Signature, Description
        expect(headers[1].textContent).toBe('Signature');
    });

    // RENDER — EVENTS TYPE
    test('should render events table with Detail column', () => {
        const el = document.createElement('au-api-table');
        el.setAttribute('type', 'events');
        el.innerHTML = '<au-api-row name="au-change" detail="{ value: string }">Fires on change</au-api-row>';
        body.appendChild(el);

        const headers = el.querySelectorAll('th');
        expect(headers.length).toBe(3); // Name, Detail, Description
        expect(headers[1].textContent).toBe('Detail');
    });

    // RENDER — PROPERTIES TYPE
    test('should render properties table', () => {
        const el = document.createElement('au-api-table');
        el.setAttribute('type', 'properties');
        el.innerHTML = '<au-api-row name="value" type="string">Current value</au-api-row>';
        body.appendChild(el);

        const headers = el.querySelectorAll('th');
        expect(headers.length).toBe(3); // Name, Type, Description
        expect(headers[0].textContent).toBe('Name');
        expect(headers[1].textContent).toBe('Type');
        expect(headers[2].textContent).toBe('Description');
    });

    // RENDER — TOKENS TYPE
    test('should render tokens table', () => {
        const el = document.createElement('au-api-table');
        el.setAttribute('type', 'tokens');
        el.innerHTML = '<au-api-row name="--au-color" default="#000">Primary color</au-api-row>';
        body.appendChild(el);

        const headers = el.querySelectorAll('th');
        expect(headers.length).toBe(3); // Token, Default, Description
        expect(headers[0].textContent).toBe('Token');
    });

    // MULTIPLE ROWS
    test('should render multiple rows', () => {
        const el = document.createElement('au-api-table');
        el.innerHTML = `
            <au-api-row name="size" type="string" default="md">Size</au-api-row>
            <au-api-row name="color" type="string" default="primary">Color</au-api-row>
        `;
        body.appendChild(el);

        const rows = el.querySelectorAll('tbody tr');
        expect(rows.length).toBe(2);
    });

    // NO ROWS
    test('should render empty table when no rows', () => {
        const el = document.createElement('au-api-table');
        body.appendChild(el);

        const table = el.querySelector('.au-api-table__table');
        expect(table).toBeTruthy();
        const rows = el.querySelectorAll('tbody tr');
        expect(rows.length).toBe(0);
    });

    // XSS PROTECTION
    test('should escape HTML in row data', () => {
        const el = document.createElement('au-api-table');
        el.innerHTML = '<au-api-row name="<script>alert(1)</script>" type="string">Desc</au-api-row>';
        body.appendChild(el);

        const html = el.innerHTML;
        expect(html).not.toContain('<script>alert(1)</script>');
    });

    // DEFAULT ATTRIBUTE VALUE
    test('should show dash for missing default attribute', () => {
        const el = document.createElement('au-api-table');
        el.innerHTML = '<au-api-row name="label" type="string">A label</au-api-row>';
        body.appendChild(el);

        const cells = el.querySelectorAll('tbody td');
        expect(cells[2].textContent.trim()).toBe('-');
    });

    // AU-API-ROW render is a no-op
    test('AuApiRow render should be a no-op (parent handles rendering)', () => {
        const row = document.createElement('au-api-row');
        row.setAttribute('name', 'test');
        body.appendChild(row);
        // Row render does nothing, so innerHTML should stay minimal
        expect(row.innerHTML).toBe('');
    });

    // STYLES
    test('should apply display block style', () => {
        const el = document.createElement('au-api-table');
        el.innerHTML = '<au-api-row name="x" type="y">z</au-api-row>';
        body.appendChild(el);
        expect(el.style.display).toBe('block');
    });
});
