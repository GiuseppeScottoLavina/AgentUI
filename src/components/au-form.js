/**
 * @fileoverview au-form - Form Container with Validation
 * 
 * Usage: 
 * <au-form onsubmit="handleSubmit">
 *   <au-input name="email" required></au-input>
 *   <au-button type="submit">Submit</au-button>
 * </au-form>
 */

import { AuElement, define } from '../core/AuElement.js';

/**
 * Form container with built-in validation and data collection.
 *
 * @class
 * @extends AuElement
 * @element au-form
 * @fires au-submit  - Valid submission, detail: `{ data, isValid }`
 * @fires au-invalid - Failed validation, detail: `{ data, errors }`
 * @fires au-reset   - Form reset
 * @slot default - Input controls and submit button
 */
export class AuForm extends AuElement {
    static baseClass = 'au-form';
    /** @type {string[]} */
    static observedAttributes = ['action', 'method'];


    /** @override */
    connectedCallback() {
        super.connectedCallback();

        this.listen(this, 'submit', (e) => {
            e.preventDefault();
            this.#handleSubmit();
        });

        // Handle enter key in inputs
        this.listen(this, 'keydown', (e) => {
            if (e.key === 'Enter' && e.target.matches('input')) {
                e.preventDefault();
                this.#handleSubmit();
            }
        });
    }

    /** @override */
    render() {
        // Form is a passthrough container
        this.setAttribute('role', 'form');

        // AGENT VALIDATION: Form should have interactive controls
        // Double rAF ensures children are rendered before checking
        if (this.hasAttribute('debug')) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    const hasControls = this.querySelector('au-input, au-button, au-select, au-textarea, input, button, select, textarea');
                    if (!hasControls) {
                        this.logError('EMPTY_FORM', 'Form appears to be empty. Add input controls.');
                    }
                });
            });
        }
    }

    /** @private */
    #handleSubmit() {
        const data = this.getFormData();
        const isValid = this.validate();

        if (isValid) {
            this.emit('au-submit', { data, isValid });
        } else {
            this.emit('au-invalid', { data, errors: this.#getErrors() });
        }
    }

    /**
     * Collect all form control values.
     * @returns {Object<string, string|boolean>} Values keyed by field name
     */
    getFormData() {
        const data = {};

        // Get all au-input values
        this.querySelectorAll('au-input[name]').forEach(input => {
            data[input.getAttribute('name')] = input.value;
        });

        // Get native input values
        this.querySelectorAll('input[name], select[name], textarea[name]').forEach(input => {
            if (input.type === 'checkbox') {
                data[input.name] = input.checked;
            } else {
                data[input.name] = input.value;
            }
        });

        return data;
    }

    /**
     * Alias for {@link getFormData} — preferred for agent consumers.
     * @returns {Object<string, string|boolean>}
     */
    getValues() {
        return this.getFormData();
    }

    /**
     * Validate all `[required]` fields.
     * @returns {boolean} `true` when every required field has a value
     */
    validate() {
        let isValid = true;

        this.querySelectorAll('[required]').forEach(field => {
            const value = field.value || field.getAttribute('value') || '';
            if (!value.trim()) {
                field.classList.add('is-invalid');
                isValid = false;
            } else {
                field.classList.remove('is-invalid');
            }
        });

        return isValid;
    }

    /** @private */
    #getErrors() {
        const errors = [];
        this.querySelectorAll('.is-invalid').forEach(field => {
            errors.push({
                name: field.getAttribute('name'),
                message: 'This field is required'
            });
        });
        return errors;
    }

    /**
     * Reset all controls to their initial (empty) state.
     */
    reset() {
        this.querySelectorAll('au-input').forEach(input => {
            input.value = '';
        });
        this.querySelectorAll('input, select, textarea').forEach(el => {
            el.value = '';
        });
        this.querySelectorAll('.is-invalid').forEach(el => {
            el.classList.remove('is-invalid');
        });
        this.emit('au-reset');
    }
}

define('au-form', AuForm);
