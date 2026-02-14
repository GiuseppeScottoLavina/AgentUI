/**
 * au-schema-form.js - Auto-Generated Forms from JSON Schema
 * 
 * AI-First form component that generates AgentUI form fields automatically
 * from a JSON Schema definition. Dramatically reduces boilerplate for form creation.
 * 
 * @example
 * <au-schema-form id="user-form"></au-schema-form>
 * 
 * <script>
 *     const form = document.getElementById('user-form');
 *     form.schema = {
 *         type: 'object',
 *         properties: {
 *             name: { type: 'string', title: 'Full Name', minLength: 2 },
 *             email: { type: 'string', format: 'email', title: 'Email' },
 *             role: { type: 'string', enum: ['user', 'admin'], title: 'Role' },
 *             active: { type: 'boolean', title: 'Active', default: true }
 *         },
 *         required: ['name', 'email']
 *     };
 *     
 *     form.addEventListener('au-submit', (e) => {
 *         console.log('Form data:', e.detail); // debug
 *     });
 * </script>
 */

import { AuElement, define } from '../core/AuElement.js';
import { html, safe } from '../core/utils.js';

export class AuSchemaForm extends AuElement {
    static get observedAttributes() {
        return ['submit-label', 'reset-label', 'inline', 'readonly', 'disabled'];
    }

    static baseClass = 'au-schema-form';
    static cssFile = 'schema-form';


    constructor() {
        super();

        this._schema = null;
        this._values = {};
        this._errors = {};
        this._touched = {};
    }

    // === PROPERTIES ===

    get schema() {
        return this._schema;
    }

    set schema(value) {
        this._schema = value;
        this._initializeValues();
        if (this.isConnected) this.render();
    }

    get submitLabel() {
        return this.getAttribute('submit-label') || 'Submit';
    }

    get resetLabel() {
        return this.getAttribute('reset-label') || 'Reset';
    }

    get inline() {
        return this.hasAttribute('inline');
    }

    get readonly() {
        return this.hasAttribute('readonly');
    }

    get disabled() {
        return this.hasAttribute('disabled');
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
     * Get current form values
     * @returns {Object}
     */
    getValues() {
        return { ...this._values };
    }

    /**
     * Set form values
     * @param {Object} values
     */
    setValues(values) {
        this._values = { ...this._values, ...values };
        this.render();
    }

    /**
     * Validate all fields
     * @returns {boolean} True if valid
     */
    validate() {
        if (!this._schema || !this._schema.properties) return true;

        this._errors = {};
        const required = this._schema.required || [];

        for (const [field, def] of Object.entries(this._schema.properties)) {
            const value = this._values[field];
            const errors = this._validateField(field, value, def, required.includes(field));
            if (errors.length > 0) {
                this._errors[field] = errors;
            }
        }

        this.render();
        return Object.keys(this._errors).length === 0;
    }

    /**
     * Get validation errors
     * @returns {Object}
     */
    getErrors() {
        return { ...this._errors };
    }

    /**
     * Reset form to default values
     */
    reset() {
        this._initializeValues();
        this._errors = {};
        this._touched = {};
        this.render();

        this.emit('au-reset', { values: this.getValues() }, { bubbles: true });
    }

    /**
     * Submit the form programmatically
     */
    submit() {
        if (this.validate()) {
            this.emit('au-submit', this.getValues(), { bubbles: true });
        }
    }

    // === INTERNAL METHODS ===

    _initializeValues() {
        this._values = {};
        if (!this._schema || !this._schema.properties) return;

        for (const [field, def] of Object.entries(this._schema.properties)) {
            if (def.default !== undefined) {
                this._values[field] = def.default;
            } else if (def.type === 'boolean') {
                this._values[field] = false;
            } else if (def.type === 'number' || def.type === 'integer') {
                this._values[field] = null;
            } else {
                this._values[field] = '';
            }
        }
    }

    _validateField(field, value, def, isRequired) {
        const errors = [];

        // Required check
        if (isRequired && (value === '' || value === null || value === undefined)) {
            errors.push(`${def.title || field} is required`);
            return errors;
        }

        if (value === '' || value === null || value === undefined) return errors;

        // Type-specific validation
        if (def.type === 'string') {
            if (def.minLength && value.length < def.minLength) {
                errors.push(`Minimum ${def.minLength} characters`);
            }
            if (def.maxLength && value.length > def.maxLength) {
                errors.push(`Maximum ${def.maxLength} characters`);
            }
            if (def.pattern && !new RegExp(def.pattern).test(value)) {
                errors.push(def.patternError || 'Invalid format');
            }
            if (def.format === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                errors.push('Invalid email address');
            }
            if (def.format === 'url' && !/^https?:\/\/.+/.test(value)) {
                errors.push('Invalid URL');
            }
        }

        if (def.type === 'number' || def.type === 'integer') {
            const num = Number(value);
            if (isNaN(num)) {
                errors.push('Must be a number');
            } else {
                if (def.minimum !== undefined && num < def.minimum) {
                    errors.push(`Minimum value is ${def.minimum}`);
                }
                if (def.maximum !== undefined && num > def.maximum) {
                    errors.push(`Maximum value is ${def.maximum}`);
                }
            }
        }

        return errors;
    }

    _getInputType(def) {
        if (def.format === 'email') return 'email';
        if (def.format === 'password') return 'password';
        if (def.format === 'date') return 'date';
        if (def.format === 'time') return 'time';
        if (def.format === 'datetime-local') return 'datetime-local';
        if (def.format === 'url') return 'url';
        if (def.format === 'tel') return 'tel';
        if (def.type === 'number' || def.type === 'integer') return 'number';
        return 'text';
    }

    _renderField(field, def, isRequired) {
        const rawValue = this._values[field] ?? '';
        const errors = this._errors[field] || [];
        const hasError = errors.length > 0;

        const label = def.title || field;
        const placeholder = def.placeholder || '';
        const description = def.description || '';
        const errorMsg = hasError ? errors[0] : '';
        const disabled = this.disabled || def.readOnly;
        const readonly = this.readonly;

        // Boolean → Switch
        if (def.type === 'boolean') {
            return html`
                <div class="au-schema-form-field" data-field="${field}">
                    <div class="au-schema-form-switch-row">
                        <au-switch 
                            ${rawValue ? 'checked' : ''}
                            ${disabled ? 'disabled' : ''}
                            data-field="${field}"
                        ></au-switch>
                        <label class="au-schema-form-switch-label">${label}</label>
                    </div>
                    ${description ? html`<div class="au-schema-form-description">${description}</div>` : ''}
                </div>
            `;
        }

        // Enum → Dropdown
        if (def.enum) {
            const options = def.enum.map((val, i) => {
                return html`<au-option value="${String(val)}" ${rawValue === val ? 'selected' : ''}>${def.enumLabels?.[i] || String(val)}</au-option>`;
            }).join('');

            return html`
                <div class="au-schema-form-field ${hasError ? 'au-schema-form-field-error' : ''}" data-field="${field}">
                    <au-dropdown 
                        label="${label}${isRequired ? ' *' : ''}"
                        value="${String(rawValue)}"
                        ${disabled ? 'disabled' : ''}
                        ${isRequired ? 'required' : ''}
                        data-field="${field}"
                    >
                        ${safe(options)}
                    </au-dropdown>
                    ${description ? html`<div class="au-schema-form-description">${description}</div>` : ''}
                    ${hasError ? html`<div class="au-schema-form-error">${errorMsg}</div>` : ''}
                </div>
            `;
        }

        // Multiline string → Textarea
        if (def.type === 'string' && def.multiline) {
            return html`
                <div class="au-schema-form-field ${hasError ? 'au-schema-form-field-error' : ''}" data-field="${field}">
                    <au-textarea
                        label="${label}${isRequired ? ' *' : ''}"
                        placeholder="${placeholder}"
                        ${disabled ? 'disabled' : ''}
                        ${readonly ? 'readonly' : ''}
                        ${isRequired ? 'required' : ''}
                        data-field="${field}"
                    >${String(rawValue)}</au-textarea>
                    ${description ? html`<div class="au-schema-form-description">${description}</div>` : ''}
                    ${hasError ? html`<div class="au-schema-form-error">${errorMsg}</div>` : ''}
                </div>
            `;
        }

        // Default → Input
        const inputType = this._getInputType(def);
        return html`
            <div class="au-schema-form-field ${hasError ? 'au-schema-form-field-error' : ''}" data-field="${field}">
                <au-input
                    type="${inputType}"
                    label="${label}${isRequired ? ' *' : ''}"
                    placeholder="${placeholder}"
                    value="${String(rawValue)}"
                    ${disabled ? 'disabled' : ''}
                    ${readonly ? 'readonly' : ''}
                    ${isRequired ? 'required' : ''}
                    ${def.minimum !== undefined ? `min="${def.minimum}"` : ''}
                    ${def.maximum !== undefined ? `max="${def.maximum}"` : ''}
                    ${def.minLength ? `minlength="${def.minLength}"` : ''}
                    ${def.maxLength ? `maxlength="${def.maxLength}"` : ''}
                    data-field="${field}"
                ></au-input>
                ${description ? html`<div class="au-schema-form-description">${description}</div>` : ''}
                ${hasError ? html`<div class="au-schema-form-error">${errorMsg}</div>` : ''}
            </div>
        `;
    }

    render() {
        if (!this._schema || !this._schema.properties) {
            this.innerHTML = `
                <div class="au-schema-form-empty-state">
                    Set the <code>schema</code> property to generate a form
                </div>
            `;
            return;
        }

        const required = this._schema.required || [];
        const fields = Object.entries(this._schema.properties)
            .map(([field, def]) => this._renderField(field, def, required.includes(field)))
            .join('');

        this.innerHTML = html`
            <div class="au-schema-form ${this.inline ? 'au-schema-form-inline' : ''}">
                ${safe(fields)}
                
                <div class="au-schema-form-actions">
                    <au-button variant="filled" data-action="submit" ${this.disabled ? 'disabled' : ''}>
                        ${this.submitLabel}
                    </au-button>
                    <au-button variant="text" data-action="reset" ${this.disabled ? 'disabled' : ''}>
                        ${this.resetLabel}
                    </au-button>
                </div>
            </div>
        `;

        this._attachEventListeners();
    }

    _attachEventListeners() {
        // Input changes
        this.querySelectorAll('au-input').forEach(input => {
            this.listen(input, 'au-input', (e) => {
                const field = input.dataset.field;
                this._values[field] = e.detail.value;
                this._touched[field] = true;

                // Clear error on edit
                if (this._errors[field]) {
                    delete this._errors[field];
                    input.closest('.au-schema-form-field').classList.remove('au-schema-form-field-error');
                    input.closest('.au-schema-form-field').querySelector('.au-schema-form-error')?.remove();
                }

                this.emit('au-change', { field, value: e.detail.value, values: this.getValues() }, { bubbles: true });
            });
        });

        // Textarea changes
        this.querySelectorAll('au-textarea').forEach(textarea => {
            this.listen(textarea, 'au-input', (e) => {
                const field = textarea.dataset.field;
                this._values[field] = e.detail.value;
                this._touched[field] = true;

                this.emit('au-change', { field, value: e.detail.value, values: this.getValues() }, { bubbles: true });
            });
        });

        // Dropdown changes
        this.querySelectorAll('au-dropdown').forEach(dropdown => {
            this.listen(dropdown, 'au-change', (e) => {
                const field = dropdown.dataset.field;
                this._values[field] = e.detail.value;
                this._touched[field] = true;

                this.emit('au-change', { field, value: e.detail.value, values: this.getValues() }, { bubbles: true });
            });
        });

        // Switch changes
        this.querySelectorAll('au-switch').forEach(sw => {
            this.listen(sw, 'au-change', (e) => {
                const field = sw.dataset.field;
                this._values[field] = e.detail.checked;
                this._touched[field] = true;

                this.emit('au-change', { field, value: e.detail.checked, values: this.getValues() }, { bubbles: true });
            });
        });
    }

    /**
     * Handle actions from AuElement's centralized event delegation
     */
    handleAction(action, target, event) {
        if (action === 'submit') {
            this.submit();
        } else if (action === 'reset') {
            this.reset();
        }
    }
}

if (!customElements.get('au-schema-form')) {
    customElements.define('au-schema-form', AuSchemaForm);
}
