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

export class AuForm extends AuElement {
    static baseClass = 'au-form';
    static observedAttributes = ['action', 'method'];


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
     * Get all form data as object
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
     * Alias for getFormData() - preferred API for agents
     * @returns {Object} Form values keyed by field name
     */
    getValues() {
        return this.getFormData();
    }

    /**
     * Validate all required fields
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
     * Reset form to initial state
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
