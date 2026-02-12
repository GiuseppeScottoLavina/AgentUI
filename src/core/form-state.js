/**
 * @fileoverview Form State Management Utilities
 * Agent-friendly form validation and state tracking
 * 
 * @example
 * import { createFormState } from 'agentui-wc';
 * 
 * const form = document.querySelector('au-form');
 * const state = createFormState(form, {
 *     email: { required: true, type: 'email' },
 *     password: { required: true, minLength: 8 }
 * });
 * 
 * state.isValid;    // true if all fields valid
 * state.isDirty;    // true if any field changed
 * state.fields.email.value;
 * state.fields.email.error;
 * state.fields.email.touched;
 */

/**
 * @typedef {Object} FieldRule
 * @property {boolean} [required]
 * @property {number} [minLength]
 * @property {number} [maxLength]
 * @property {RegExp} [pattern]
 * @property {string} [type] - 'email', 'url', 'number'
 * @property {(value: string) => string|null} [validate] - Custom validator
 */

/**
 * @typedef {Object} FieldState
 * @property {string} value
 * @property {string|null} error
 * @property {boolean} touched
 * @property {boolean} dirty
 */

/**
 * @typedef {Object} FormState
 * @property {Object<string, FieldState>} fields
 * @property {boolean} isValid
 * @property {boolean} isDirty
 * @property {boolean} isSubmitting
 * @property {() => Object<string, string>} getValues
 * @property {() => Object<string, string|null>} getErrors
 * @property {() => void} reset
 * @property {() => boolean} validate
 */

/**
 * Validate a single field value against rules
 * @param {string} value 
 * @param {FieldRule} rules 
 * @returns {string|null} Error message or null if valid
 */
function validateField(value, rules) {
    if (rules.required && !value?.trim()) {
        return 'This field is required';
    }

    if (value && rules.minLength && value.length < rules.minLength) {
        return `Minimum ${rules.minLength} characters required`;
    }

    if (value && rules.maxLength && value.length > rules.maxLength) {
        return `Maximum ${rules.maxLength} characters allowed`;
    }

    if (value && rules.pattern && !rules.pattern.test(value)) {
        return 'Invalid format';
    }

    if (value && rules.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return 'Invalid email address';
        }
    }

    if (value && rules.type === 'url') {
        try {
            new URL(value);
        } catch {
            return 'Invalid URL';
        }
    }

    if (rules.validate) {
        return rules.validate(value);
    }

    return null;
}

/**
 * Create form state from a form element
 * @param {HTMLElement} formElement - au-form or form element
 * @param {Object<string, FieldRule>} schema - Validation rules per field
 * @returns {FormState}
 */
export function createFormState(formElement, schema = {}) {
    const fieldNames = Object.keys(schema);

    /** @type {Object<string, FieldState>} */
    const fieldState = {};

    /** @type {Object<string, FieldState>} */
    const initialState = {};

    let _isSubmitting = false;

    // Initialize state for each field
    for (const name of fieldNames) {
        const input = formElement.querySelector(`[name="${name}"]`);
        const initialValue = input?.value || input?.getAttribute('value') || '';

        fieldState[name] = {
            value: initialValue,
            error: null,
            touched: false,
            dirty: false
        };

        initialState[name] = { value: initialValue, error: null, touched: false, dirty: false };
    }

    // Setup input listeners
    for (const name of fieldNames) {
        const input = formElement.querySelector(`[name="${name}"]`);
        if (!input) continue;

        input.addEventListener('input', (e) => {
            const value = /** @type {HTMLInputElement} */ (e.target).value;
            const current = fieldState[name];
            const error = validateField(value, schema[name] || {});

            fieldState[name] = {
                ...current,
                value,
                dirty: value !== initialState[name].value,
                error: current.touched ? error : null
            };
        });

        input.addEventListener('blur', () => {
            const current = fieldState[name];
            const error = validateField(current.value, schema[name] || {});

            fieldState[name] = {
                ...current,
                touched: true,
                error
            };
        });
    }

    // Create fields proxy for easy access
    const fields = new Proxy({}, {
        get(_, name) {
            if (typeof name === 'string' && fieldState[name]) {
                return fieldState[name];
            }
            return undefined;
        }
    });

    return {
        get fields() { return fields; },
        get isValid() {
            for (const name of fieldNames) {
                const error = validateField(fieldState[name].value, schema[name] || {});
                if (error) return false;
            }
            return true;
        },
        get isDirty() {
            for (const name of fieldNames) {
                if (fieldState[name].dirty) return true;
            }
            return false;
        },
        get isSubmitting() { return _isSubmitting; },
        set isSubmitting(v) { _isSubmitting = v; },

        getValues() {
            const values = {};
            for (const name of fieldNames) {
                values[name] = fieldState[name].value;
            }
            return values;
        },

        getErrors() {
            const errors = {};
            for (const name of fieldNames) {
                errors[name] = fieldState[name].error;
            }
            return errors;
        },

        reset() {
            for (const name of fieldNames) {
                fieldState[name] = { ...initialState[name] };
                const input = formElement.querySelector(`[name="${name}"]`);
                if (input) input.value = initialState[name].value;
            }
        },

        validate() {
            let valid = true;
            for (const name of fieldNames) {
                const current = fieldState[name];
                const error = validateField(current.value, schema[name] || {});
                if (error) valid = false;

                fieldState[name] = {
                    ...current,
                    touched: true,
                    error
                };
            }
            return valid;
        }
    };
}

/**
 * Helper to get form values without state management
 * @param {HTMLElement} formElement 
 * @returns {Object<string, string>}
 */
export function getFormValues(formElement) {
    const values = {};
    const inputs = formElement.querySelectorAll('[name]');
    for (const input of inputs) {
        const name = input.getAttribute('name');
        if (name) {
            values[name] = /** @type {HTMLInputElement} */ (input).value || '';
        }
    }
    return values;
}
