/**
 * @fileoverview au-api-table - API Documentation Table Component
 * 
 * Usage: 
 * <au-api-table type="attributes">
 *   <au-api-row name="checked" type="boolean" default="false">Whether checkbox is checked</au-api-row>
 * </au-api-table>
 */

import { AuElement, define } from '../core/AuElement.js';
import { html } from '../core/utils.js';

export class AuApiTable extends AuElement {
    static baseClass = 'au-api-table';
    static observedAttributes = ['type'];


    render() {
        const type = this.attr('type', 'attributes');
        const rows = Array.from(this.querySelectorAll('au-api-row'));

        const headers = {
            attributes: ['Name', 'Type', 'Default', 'Description'],
            properties: ['Name', 'Type', 'Description'],
            methods: ['Name', 'Signature', 'Description'],
            events: ['Name', 'Detail', 'Description'],
            tokens: ['Token', 'Default', 'Description']
        };

        const cols = headers[type] || headers.attributes;

        // Store row data before clearing
        const rowData = rows.map(row => ({
            name: row.getAttribute('name') || '',
            type: row.getAttribute('type') || '',
            default: row.getAttribute('default') || '-',
            signature: row.getAttribute('signature') || '',
            detail: row.getAttribute('detail') || '',
            description: row.textContent.trim()
        }));

        this.innerHTML = `
            <table class="au-api-table__table">
                <thead>
                    <tr>
                        ${cols.map(c => `<th>${c}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${rowData.map(row => this.#renderRow(type, row)).join('')}
                </tbody>
            </table>
        `;

        this.#applyStyles();
    }

    #renderRow(type, data) {
        switch (type) {
            case 'attributes':
                return html`<tr>
                    <td><code>${data.name}</code></td>
                    <td><code class="type">${data.type}</code></td>
                    <td><code class="default">${data.default}</code></td>
                    <td>${data.description}</td>
                </tr>`;
            case 'properties':
                return html`<tr>
                    <td><code>${data.name}</code></td>
                    <td><code class="type">${data.type}</code></td>
                    <td>${data.description}</td>
                </tr>`;
            case 'methods':
                return html`<tr>
                    <td><code>${data.name}</code></td>
                    <td><code class="signature">${data.signature}</code></td>
                    <td>${data.description}</td>
                </tr>`;
            case 'events':
                return html`<tr>
                    <td><code>${data.name}</code></td>
                    <td><code class="detail">${data.detail}</code></td>
                    <td>${data.description}</td>
                </tr>`;
            case 'tokens':
                return html`<tr>
                    <td><code>${data.name}</code></td>
                    <td><code class="default">${data.default}</code></td>
                    <td>${data.description}</td>
                </tr>`;
            default:
                return '';
        }
    }

    #applyStyles() {
        this.style.display = 'block';
        this.style.overflowX = 'auto';
        this.style.marginBottom = '24px';  /* MD3: 24dp spacing between sections */

        const table = this.querySelector('.au-api-table__table');
        if (table) {
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
            table.style.fontSize = 'var(--md-sys-typescale-body-medium-size)';
        }

        const ths = this.querySelectorAll('th');
        ths.forEach(th => {
            th.style.textAlign = 'left';
            th.style.padding = '16px';  /* MD3: 16dp padding */
            th.style.height = '56px';  /* MD3: header row height */
            th.style.background = 'var(--md-sys-color-surface-container)';
            th.style.fontWeight = '500';
            th.style.color = 'var(--md-sys-color-on-surface)';
            th.style.borderBottom = '1px solid var(--md-sys-color-outline-variant)';
        });

        const tds = this.querySelectorAll('td');
        tds.forEach(td => {
            td.style.padding = '16px';  /* MD3: 16dp padding */
            td.style.minHeight = '52px';  /* MD3: minimum row height */
            td.style.borderBottom = '1px solid var(--md-sys-color-outline-variant)';
            td.style.verticalAlign = 'middle';  /* Better vertical alignment */
            td.style.lineHeight = '1.5';  /* Improve readability */
        });

        const codes = this.querySelectorAll('code');
        codes.forEach(code => {
            code.style.fontFamily = "'Fira Code', monospace";
            code.style.fontSize = '13px';
            code.style.padding = '2px 6px';
            code.style.borderRadius = '4px';
            code.style.background = 'var(--md-sys-color-surface-container-highest)';
        });

        const types = this.querySelectorAll('code.type, code.detail');
        types.forEach(t => {
            t.style.color = 'var(--md-sys-color-primary)';
        });

        const defaults = this.querySelectorAll('code.default');
        defaults.forEach(d => {
            d.style.color = 'var(--md-sys-color-secondary)';
        });
    }
}

export class AuApiRow extends AuElement {
    static baseClass = 'au-api-row';
    static observedAttributes = ['name', 'type', 'default', 'signature', 'detail'];

    render() {
        // Just a container, actual rendering done by parent
    }
}

define('au-api-table', AuApiTable);
define('au-api-row', AuApiRow);
