/**
 * au-datatable.js - Smart Data Table Component
 * 
 * AI-First data table with built-in sorting, pagination, and filtering.
 * Designed to minimize boilerplate code when displaying tabular data.
 * 
 * @example
 * <au-datatable
 *     columns='[
 *         {"field": "name", "label": "Name", "sortable": true},
 *         {"field": "email", "label": "Email"},
 *         {"field": "role", "label": "Role", "filterable": true}
 *     ]'
 *     page-size="10"
 *     sortable>
 * </au-datatable>
 * 
 * <script>
 *     document.querySelector('au-datatable').setData(usersArray);
 * </script>
 */

import { AuElement, define } from '../core/AuElement.js';
import { html, safe } from '../core/utils.js';
import { debounce } from '../core/render.js';

export class AuDataTable extends AuElement {
    static get observedAttributes() {
        return ['columns', 'page-size', 'sortable', 'selectable', 'filterable', 'empty-message'];
    }

    static baseClass = 'au-datatable';
    static cssFile = 'datatable';


    constructor() {
        super();

        // Internal state
        this._data = [];
        this._filteredData = [];
        this._columns = [];
        this._currentPage = 1;
        this._sortField = null;
        this._sortDirection = 'asc';
        this._selectedRows = new Set();
        this._filterValue = '';
    }

    // === PROPERTIES ===

    get columns() {
        const attr = this.getAttribute('columns');
        if (attr) {
            try {
                return JSON.parse(attr);
            } catch (e) {
                console.warn('[au-datatable] Invalid columns JSON:', e);
                return [];
            }
        }
        return this._columns;
    }

    set columns(value) {
        this._columns = Array.isArray(value) ? value : [];
        if (this.isConnected) this.render();
    }

    get pageSize() {
        return parseInt(this.getAttribute('page-size')) || 10;
    }

    set pageSize(value) {
        this.setAttribute('page-size', value);
    }

    get sortable() {
        return this.hasAttribute('sortable');
    }

    get selectable() {
        return this.hasAttribute('selectable');
    }

    get filterable() {
        return this.hasAttribute('filterable');
    }

    get emptyMessage() {
        return this.getAttribute('empty-message') || 'No data available';
    }

    // === LIFECYCLE ===

    connectedCallback() {
        super.connectedCallback();
        this.render();
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (this.isConnected && oldVal !== newVal) {
            this.render();
        }
    }

    // === PUBLIC API ===

    /**
     * Set table data programmatically
     * @param {Array<Object>} data - Array of row objects
     */
    setData(data) {
        this._data = Array.isArray(data) ? data : [];
        this._filteredData = [...this._data];
        this._currentPage = 1;
        this._selectedRows.clear();
        this._applySort();
        this.render();

        this.emit('au-data-change', { data: this._data, count: this._data.length }, { bubbles: true });
    }

    /**
     * Get current data
     * @returns {Array<Object>}
     */
    getData() {
        return [...this._data];
    }

    /**
     * Get current sort state
     * @returns {{ field: string|null, direction: 'asc'|'desc' }}
     */
    getSortState() {
        return { field: this._sortField, direction: this._sortDirection };
    }

    /**
     * Get selected rows
     * @returns {Array<Object>}
     */
    getSelectedRows() {
        return this._data.filter((_, idx) => this._selectedRows.has(idx));
    }

    /**
     * Get current page info
     * @returns {{ page: number, pageSize: number, totalPages: number, totalRows: number }}
     */
    getPageInfo() {
        const totalPages = Math.ceil(this._filteredData.length / this.pageSize);
        return {
            page: this._currentPage,
            pageSize: this.pageSize,
            totalPages,
            totalRows: this._filteredData.length
        };
    }

    /**
     * Go to specific page
     * @param {number} page
     */
    goToPage(page) {
        const maxPage = Math.ceil(this._filteredData.length / this.pageSize) || 1;
        this._currentPage = Math.max(1, Math.min(page, maxPage));
        this.render();

        this.emit('au-page-change', this.getPageInfo(), { bubbles: true });
    }

    /**
     * Sort by field
     * @param {string} field
     * @param {'asc'|'desc'} [direction]
     */
    sortBy(field, direction) {
        if (this._sortField === field && !direction) {
            this._sortDirection = this._sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this._sortField = field;
            this._sortDirection = direction || 'asc';
        }
        this._applySort();
        this.render();

        this.emit('au-sort-change', this.getSortState(), { bubbles: true });
    }

    /**
     * Filter data
     * @param {string} query
     */
    filter(query) {
        this._filterValue = query.toLowerCase();
        this._applyFilter();
        this._currentPage = 1;
        this.render(false); // Partial render - preserve search input focus
    }

    // === INTERNAL METHODS ===

    _applySort() {
        if (!this._sortField) return;

        this._filteredData.sort((a, b) => {
            const valA = a[this._sortField] ?? '';
            const valB = b[this._sortField] ?? '';

            // Handle different types
            if (typeof valA === 'number' && typeof valB === 'number') {
                return this._sortDirection === 'asc' ? valA - valB : valB - valA;
            }

            const strA = String(valA).toLowerCase();
            const strB = String(valB).toLowerCase();
            const result = strA.localeCompare(strB);
            return this._sortDirection === 'asc' ? result : -result;
        });
    }

    _applyFilter() {
        if (!this._filterValue) {
            this._filteredData = [...this._data];
            return;
        }

        const filterableColumns = this.columns.filter(c => c.filterable !== false);
        const fields = filterableColumns.length > 0
            ? filterableColumns.map(c => c.field)
            : this.columns.map(c => c.field);

        this._filteredData = this._data.filter(row => {
            return fields.some(field => {
                const value = String(row[field] ?? '').toLowerCase();
                return value.includes(this._filterValue);
            });
        });
    }

    _getPageData() {
        const start = (this._currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        return this._filteredData.slice(start, end);
    }

    _handleHeaderClick(field) {
        const column = this.columns.find(c => c.field === field);
        if (column?.sortable !== false && this.sortable) {
            this.sortBy(field);
        }
    }

    _handleRowSelect(index, checked) {
        const actualIndex = (this._currentPage - 1) * this.pageSize + index;
        if (checked) {
            this._selectedRows.add(actualIndex);
        } else {
            this._selectedRows.delete(actualIndex);
        }
        this.render();

        this.emit('au-selection-change', { selected: this.getSelectedRows() }, { bubbles: true });
    }

    _handleSelectAll(checked) {
        const pageData = this._getPageData();
        const startIdx = (this._currentPage - 1) * this.pageSize;

        pageData.forEach((_, idx) => {
            if (checked) {
                this._selectedRows.add(startIdx + idx);
            } else {
                this._selectedRows.delete(startIdx + idx);
            }
        });

        this.render();

        this.emit('au-selection-change', { selected: this.getSelectedRows() }, { bubbles: true });
    }

    render(fullRender = true) {
        const columns = this.columns;
        const pageData = this._getPageData();
        const { page, totalPages, totalRows } = this.getPageInfo();
        const startIdx = (this._currentPage - 1) * this.pageSize;

        // Check if all current page items are selected
        const allSelected = pageData.length > 0 &&
            pageData.every((_, idx) => this._selectedRows.has(startIdx + idx));

        // Surgical update: only update tbody and info if already rendered
        const existingTbody = this.querySelector('.au-datatable-table tbody');
        const existingFooter = this.querySelector('.au-datatable-footer');

        if (!fullRender && existingTbody) {
            // Update only the parts that changed
            existingTbody.innerHTML = this._renderTbody(pageData, columns, startIdx, allSelected);

            if (existingFooter) {
                existingFooter.innerHTML = this._renderFooterContent(page, totalPages, totalRows);
            }

            this._attachEventListeners();
            return;
        }

        // Full render
        this.innerHTML = html`
            <div class="au-datatable-wrapper">
                ${this.filterable ? html`
                    <div class="au-datatable-toolbar">
                        <div class="au-datatable-search">
                            <input 
                                type="search" 
                                placeholder="Search..." 
                                value="${this._filterValue}"
                            >
                        </div>
                    </div>
                ` : ''}

                <table class="au-datatable-table">
                    <thead>
                        <tr>
                            ${this.selectable ? html`
                                <th class="au-datatable-checkbox-cell">
                                    <input 
                                        type="checkbox" 
                                        ${allSelected ? 'checked' : ''}
                                        data-select-all
                                    >
                                </th>
                            ` : ''}
                            ${safe(columns.map(col => {
            const isSortable = col.sortable !== false && this.sortable;
            const isSorted = this._sortField === col.field;
            const sortIcon = isSorted
                ? (this._sortDirection === 'asc' ? '↑' : '↓')
                : '↕';
            return html`
                                    <th 
                                        class="${isSortable ? 'au-datatable-sortable' : ''} ${isSorted ? 'au-datatable-sorted' : ''}"
                                        data-field="${col.field}"
                                    >
                                        ${col.label || col.field}
                                        ${isSortable ? safe(`<span class="au-datatable-sort-icon">${sortIcon}</span>`) : ''}
                                    </th>
                                `;
        }).join(''))}
                        </tr>
                    </thead>
                    <tbody>
                        ${safe(this._renderTbody(pageData, columns, startIdx, allSelected))}
                    </tbody>
                </table>

                ${safe(this._renderFooter(page, totalPages, totalRows))}
            </div>
        `;

        this._attachEventListeners();
    }

    _renderTbody(pageData, columns, startIdx, allSelected) {
        if (pageData.length === 0) {
            return html`
                <tr>
                    <td colspan="${columns.length + (this.selectable ? 1 : 0)}" class="au-datatable-empty-state">
                        ${this.emptyMessage}
                    </td>
                </tr>
            `;
        }

        return pageData.map((row, idx) => {
            const actualIdx = startIdx + idx;
            const isSelected = this._selectedRows.has(actualIdx);

            return html`
                <tr class="${isSelected ? 'au-datatable-selected' : ''}" data-row-index="${idx}">
                    ${this.selectable ? html`
                        <td class="au-datatable-checkbox-cell">
                            <input 
                                type="checkbox" 
                                ${isSelected ? 'checked' : ''}
                                data-row-select="${idx}"
                            >
                        </td>
                    ` : ''}
                    ${safe(columns.map(col => html`
                        <td data-field="${col.field}">
                            ${col.render ? safe(col.render(row[col.field], row)) : (row[col.field] ?? '')}
                        </td>
                    `).join(''))}
                </tr>
            `;
        }).join('');
    }

    _renderFooter(page, totalPages, totalRows) {
        return `
            <div class="au-datatable-footer">
                ${this._renderFooterContent(page, totalPages, totalRows)}
            </div>
        `;
    }

    _renderFooterContent(page, totalPages, totalRows) {
        const selectedCount = this._selectedRows.size;
        const selectionBadge = selectedCount > 0 ? `<span class="au-datatable-selected-count">${selectedCount} selected</span>` : '';

        if (totalPages <= 1) {
            return `
                <span class="au-datatable-footer-info">${totalRows} row${totalRows !== 1 ? 's' : ''}</span>
                ${selectionBadge}
            `;
        }

        return `
            ${selectionBadge}
            <span class="au-datatable-footer-info">${(page - 1) * this.pageSize + 1}–${Math.min(page * this.pageSize, totalRows)} of ${totalRows}</span>
            <button class="au-datatable-nav-btn" data-page="prev" ${page <= 1 ? 'disabled' : ''} aria-label="Previous page">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
            </button>
            <button class="au-datatable-nav-btn" data-page="next" ${page >= totalPages ? 'disabled' : ''} aria-label="Next page">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
            </button>
        `;
    }

    _attachEventListeners() {
        // Header click for sorting
        this.querySelectorAll('th.au-datatable-sortable').forEach(th => {
            this.listen(th, 'click', () => {
                this._handleHeaderClick(th.dataset.field);
            });
        });

        // Pagination (MD3: prev/next only)
        this.querySelectorAll('[data-page]').forEach(btn => {
            this.listen(btn, 'click', () => {
                const page = btn.dataset.page;
                if (page === 'prev') {
                    this.goToPage(this._currentPage - 1);
                } else if (page === 'next') {
                    this.goToPage(this._currentPage + 1);
                }
            });
        });

        // Row selection
        this.querySelectorAll('[data-row-select]').forEach(cb => {
            this.listen(cb, 'change', (e) => {
                this._handleRowSelect(parseInt(cb.dataset.rowSelect), e.target.checked);
            });
        });

        // Select all
        const selectAll = this.querySelector('[data-select-all]');
        if (selectAll) {
            this.listen(selectAll, 'change', (e) => {
                this._handleSelectAll(e.target.checked);
            });
        }

        // Search/filter
        const searchInput = this.querySelector('.au-datatable-search input');
        if (searchInput) {
            const debouncedFilter = debounce((value) => this.filter(value), 300);
            this.listen(searchInput, 'input', (e) => debouncedFilter(e.target.value));
        }
    }
}

if (!customElements.get('au-datatable')) {
    customElements.define('au-datatable', AuDataTable);
}
