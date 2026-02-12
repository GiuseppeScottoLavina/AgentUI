/**
 * @fileoverview Unit Tests for au-datatable Component
 * Complex component: 519 lines, smart data table with sorting, filtering, pagination, selection
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuDataTable;

const SAMPLE_COLUMNS = [
    { field: 'name', label: 'Name' },
    { field: 'age', label: 'Age', type: 'number' },
    { field: 'email', label: 'Email' },
];

const SAMPLE_DATA = [
    { name: 'Alice', age: 30, email: 'alice@test.com' },
    { name: 'Bob', age: 25, email: 'bob@test.com' },
    { name: 'Charlie', age: 35, email: 'charlie@test.com' },
    { name: 'Diana', age: 28, email: 'diana@test.com' },
    { name: 'Eve', age: 22, email: 'eve@test.com' },
];

describe('au-datatable Unit Tests', () => {

    beforeAll(async () => {

        const module = await import('../../src/components/au-datatable.js');
        AuDataTable = module.AuDataTable;

        // Patch emit for test environment
        AuDataTable.prototype.emit = function (eventName, detail) {
            try { this.dispatchEvent(new Event(eventName, { bubbles: false })); } catch (e) { }
        };
    });

    beforeEach(() => resetBody());

    // ─── REGISTRATION ──────────────────────────────────────────────
    test('should be registered', () => {
        expect(customElements.get('au-datatable')).toBe(AuDataTable);
    });

    test('should have correct baseClass', () => {
        expect(AuDataTable.baseClass).toBe('au-datatable');
    });

    test('should use datatable cssFile', () => {
        expect(AuDataTable.cssFile).toBe('datatable');
    });

    // ─── INITIALIZATION ────────────────────────────────────────────
    test('should initialize with empty data', () => {
        const el = document.createElement('au-datatable');
        body.appendChild(el);
        expect(el.getData()).toEqual([]);
    });

    test('should accept columns as JSON attribute', () => {
        const el = document.createElement('au-datatable');
        el.setAttribute('columns', JSON.stringify(SAMPLE_COLUMNS));
        body.appendChild(el);
        expect(el.columns.length).toBe(3);
    });

    // ─── SET DATA ──────────────────────────────────────────────────
    test('should accept data via setData', () => {
        const el = document.createElement('au-datatable');
        el.setAttribute('columns', JSON.stringify(SAMPLE_COLUMNS));
        body.appendChild(el);

        el.setData(SAMPLE_DATA);
        expect(el.getData().length).toBe(5);
    });

    test('should render table element after setData', () => {
        const el = document.createElement('au-datatable');
        el.setAttribute('columns', JSON.stringify(SAMPLE_COLUMNS));
        body.appendChild(el);

        el.setData(SAMPLE_DATA);
        expect(el.querySelector('table')).toBeTruthy();
    });

    test('should render column headers', () => {
        const el = document.createElement('au-datatable');
        el.setAttribute('columns', JSON.stringify(SAMPLE_COLUMNS));
        body.appendChild(el);

        el.setData(SAMPLE_DATA);
        const ths = el.querySelectorAll('th');
        expect(ths.length).toBeGreaterThanOrEqual(3);
    });

    test('should render data rows', () => {
        const el = document.createElement('au-datatable');
        el.setAttribute('columns', JSON.stringify(SAMPLE_COLUMNS));
        body.appendChild(el);

        el.setData(SAMPLE_DATA);
        const rows = el.querySelectorAll('tbody tr');
        expect(rows.length).toBe(5);
    });

    // ─── COLUMNS SETTER ────────────────────────────────────────────
    test('should update columns via setter', () => {
        const el = document.createElement('au-datatable');
        body.appendChild(el);

        el.columns = SAMPLE_COLUMNS;
        expect(el.columns.length).toBe(3);
    });

    test('should return empty columns when none set', () => {
        const el = document.createElement('au-datatable');
        body.appendChild(el);

        // Without columns attribute or setter, columns defaults to empty internal array
        expect(el.columns).toEqual([]);
    });

    // ─── PAGINATION ────────────────────────────────────────────────
    test('should default to pageSize 10', () => {
        const el = document.createElement('au-datatable');
        body.appendChild(el);
        expect(el.pageSize).toBe(10);
    });

    test('should respect custom pageSize', () => {
        const el = document.createElement('au-datatable');
        el.setAttribute('page-size', '2');
        body.appendChild(el);
        expect(el.pageSize).toBe(2);
    });

    test('should paginate data when pageSize < data length', () => {
        const el = document.createElement('au-datatable');
        el.setAttribute('columns', JSON.stringify(SAMPLE_COLUMNS));
        el.setAttribute('page-size', '2');
        body.appendChild(el);

        el.setData(SAMPLE_DATA);
        const rows = el.querySelectorAll('tbody tr');
        expect(rows.length).toBe(2); // Only 2 per page
    });

    test('getPageInfo should return correct page info', () => {
        const el = document.createElement('au-datatable');
        el.setAttribute('columns', JSON.stringify(SAMPLE_COLUMNS));
        el.setAttribute('page-size', '2');
        body.appendChild(el);

        el.setData(SAMPLE_DATA);
        const info = el.getPageInfo();
        expect(info.page).toBe(1);
        expect(info.pageSize).toBe(2);
        expect(info.totalPages).toBe(3);
        expect(info.totalRows).toBe(5);
    });

    test('goToPage should navigate to specific page', () => {
        const el = document.createElement('au-datatable');
        el.setAttribute('columns', JSON.stringify(SAMPLE_COLUMNS));
        el.setAttribute('page-size', '2');
        body.appendChild(el);

        el.setData(SAMPLE_DATA);
        el.goToPage(2);
        const info = el.getPageInfo();
        expect(info.page).toBe(2);
    });

    test('goToPage should clamp to valid range', () => {
        const el = document.createElement('au-datatable');
        el.setAttribute('columns', JSON.stringify(SAMPLE_COLUMNS));
        el.setAttribute('page-size', '2');
        body.appendChild(el);

        el.setData(SAMPLE_DATA);
        el.goToPage(999);
        const info = el.getPageInfo();
        expect(info.page).toBeLessThanOrEqual(info.totalPages);
    });

    // ─── SORTING ───────────────────────────────────────────────────
    test('should default to sortable false (opt-in)', () => {
        const el = document.createElement('au-datatable');
        body.appendChild(el);
        // sortable requires explicit attribute
        expect(el.sortable).toBe(false);
    });

    test('sortable should be true when attribute set', () => {
        const el = document.createElement('au-datatable');
        el.setAttribute('sortable', '');
        body.appendChild(el);
        expect(el.sortable).toBe(true);
    });

    test('sortBy should sort ascending', () => {
        const el = document.createElement('au-datatable');
        el.setAttribute('columns', JSON.stringify(SAMPLE_COLUMNS));
        body.appendChild(el);

        el.setData(SAMPLE_DATA);
        el.sortBy('name', 'asc');

        const sortState = el.getSortState();
        expect(sortState.field).toBe('name');
        expect(sortState.direction).toBe('asc');
    });

    test('sortBy should sort descending', () => {
        const el = document.createElement('au-datatable');
        el.setAttribute('columns', JSON.stringify(SAMPLE_COLUMNS));
        body.appendChild(el);

        el.setData(SAMPLE_DATA);
        el.sortBy('age', 'desc');

        const sortState = el.getSortState();
        expect(sortState.field).toBe('age');
        expect(sortState.direction).toBe('desc');
    });

    test('getSortState should have null field initially', () => {
        const el = document.createElement('au-datatable');
        body.appendChild(el);
        const state = el.getSortState();
        expect(state.field).toBe(null);
    });

    // ─── FILTERING ─────────────────────────────────────────────────
    test('should default to filterable false (opt-in)', () => {
        const el = document.createElement('au-datatable');
        body.appendChild(el);
        // filterable requires explicit attribute
        expect(el.filterable).toBe(false);
    });

    test('filterable should be true when attribute set', () => {
        const el = document.createElement('au-datatable');
        el.setAttribute('filterable', '');
        body.appendChild(el);
        expect(el.filterable).toBe(true);
    });

    test('filter should reduce displayed data', () => {
        const el = document.createElement('au-datatable');
        el.setAttribute('columns', JSON.stringify(SAMPLE_COLUMNS));
        body.appendChild(el);

        el.setData(SAMPLE_DATA);
        el.filter('Alice');

        const rows = el.querySelectorAll('tbody tr');
        expect(rows.length).toBe(1);
    });

    test('filter with empty string should show all data', () => {
        const el = document.createElement('au-datatable');
        el.setAttribute('columns', JSON.stringify(SAMPLE_COLUMNS));
        body.appendChild(el);

        el.setData(SAMPLE_DATA);
        el.filter('Alice');
        el.filter('');

        const rows = el.querySelectorAll('tbody tr');
        expect(rows.length).toBe(5);
    });

    // ─── SELECTION ─────────────────────────────────────────────────
    test('should default to selectable false', () => {
        const el = document.createElement('au-datatable');
        body.appendChild(el);
        expect(el.selectable).toBe(false);
    });

    test('getSelectedRows should return empty array initially', () => {
        const el = document.createElement('au-datatable');
        body.appendChild(el);
        expect(el.getSelectedRows()).toEqual([]);
    });

    test('should render checkboxes when selectable', () => {
        const el = document.createElement('au-datatable');
        el.setAttribute('columns', JSON.stringify(SAMPLE_COLUMNS));
        el.setAttribute('selectable', '');
        body.appendChild(el);

        el.setData(SAMPLE_DATA);
        const checkboxes = el.querySelectorAll('input[type="checkbox"]');
        expect(checkboxes.length).toBeGreaterThan(0);
    });

    // ─── EMPTY STATE ───────────────────────────────────────────────
    test('should show empty message when no data', () => {
        const el = document.createElement('au-datatable');
        el.setAttribute('columns', JSON.stringify(SAMPLE_COLUMNS));
        body.appendChild(el);

        el.setData([]);
        const empty = el.querySelector('.au-datatable-empty-state');
        expect(empty).toBeTruthy();
    });

    test('should use custom empty message', () => {
        const el = document.createElement('au-datatable');
        el.setAttribute('columns', JSON.stringify(SAMPLE_COLUMNS));
        el.setAttribute('empty-message', 'No users found');
        body.appendChild(el);

        el.setData([]);
        expect(el.textContent).toContain('No users found');
    });

    // ─── XSS PROTECTION ───────────────────────────────────────────
    test('should escape data content with escapeHTML', () => {
        const el = document.createElement('au-datatable');
        el.setAttribute('columns', JSON.stringify([{ field: 'name', label: 'Name' }]));
        body.appendChild(el);

        el.setData([{ name: '<script>alert("xss")</script>' }]);
        expect(el.innerHTML).not.toContain('<script>alert');
        expect(el.innerHTML).toContain('&lt;script&gt;');
    });

    // ─── RENDER IDEMPOTENCY ────────────────────────────────────────
    test('should be idempotent on re-render', () => {
        const el = document.createElement('au-datatable');
        el.setAttribute('columns', JSON.stringify(SAMPLE_COLUMNS));
        body.appendChild(el);

        el.setData(SAMPLE_DATA);
        const tablesBefore = el.querySelectorAll('table').length;

        el.render();
        const tablesAfter = el.querySelectorAll('table').length;
        expect(tablesAfter).toBe(tablesBefore);
    });
});
