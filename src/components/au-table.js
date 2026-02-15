/**
 * @fileoverview au-table - Data Table Component
 * 
 * Usage:
 * <au-table>
 *   <au-thead>
 *     <au-tr><au-th>Name</au-th><au-th>Email</au-th></au-tr>
 *   </au-thead>
 *   <au-tbody>
 *     <au-tr><au-td>John</au-td><au-td>john@example.com</au-td></au-tr>
 *   </au-tbody>
 * </au-table>
 */

import { AuElement, define } from '../core/AuElement.js';

/**
 * MD3 Data Table container.
 *
 * @class
 * @extends AuElement
 * @element au-table
 * @slot default - `<au-thead>` and `<au-tbody>` children
 */
export class AuTable extends AuElement {
    static baseClass = 'au-table';
    /** @type {string[]} */
    static observedAttributes = ['striped', 'hover'];


    /** @override */
    render() {
        this.style.display = 'table';
        this.style.width = '100%';
        this.style.borderCollapse = 'collapse';
        this.style.fontSize = 'var(--md-sys-typescale-body-medium-size, 14px)';
    }
}

/**
 * Table header group.
 * @class
 * @extends AuElement
 * @element au-thead
 */
export class AuThead extends AuElement {
    static baseClass = 'au-table__head';

    /** @override */
    render() {
        this.style.display = 'table-header-group';
        this.style.background = 'var(--md-sys-color-surface-container)';
    }
}

/**
 * Table body group.
 * @class
 * @extends AuElement
 * @element au-tbody
 */
export class AuTbody extends AuElement {
    static baseClass = 'au-table__body';

    /** @override */
    render() {
        this.style.display = 'table-row-group';
    }
}

/**
 * Table row.
 * @class
 * @extends AuElement
 * @element au-tr
 */
export class AuTr extends AuElement {
    static baseClass = 'au-table__row';

    /** @override */
    render() {
        this.style.display = 'table-row';
        this.style.borderBottom = '1px solid var(--md-sys-color-outline-variant)';
    }
}

/**
 * Table header cell.
 * @class
 * @extends AuElement
 * @element au-th
 */
export class AuTh extends AuElement {
    static baseClass = 'au-table__header';

    /** @override */
    render() {
        this.style.display = 'table-cell';
        this.style.padding = '12px 16px';
        this.style.fontWeight = '600';
        this.style.textAlign = 'left';
    }
}

/**
 * Table data cell.
 * @class
 * @extends AuElement
 * @element au-td
 */
export class AuTd extends AuElement {
    static baseClass = 'au-table__cell';

    /** @override */
    render() {
        this.style.display = 'table-cell';
        this.style.padding = '12px 16px';
    }
}

define('au-table', AuTable);
define('au-thead', AuThead);
define('au-tbody', AuTbody);
define('au-tr', AuTr);
define('au-th', AuTh);
define('au-td', AuTd);
