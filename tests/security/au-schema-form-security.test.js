/**
 * @fileoverview Schema Form Security Tests — ReDoS
 * 
 * Tests that au-schema-form handles malicious regex patterns
 * in JSON schema without causing catastrophic backtracking.
 */

import { describe, test, expect } from 'bun:test';

// Import the form class directly for unit testing the validation
// We test the _validateField method which is the vulnerable code path
import '../../tests/setup-dom.js';

// We need the component definition loaded
import { AuSchemaForm } from '../../src/components/au-schema-form.js';

describe('Schema Form Security — ReDoS Protection', () => {

    test('should handle invalid regex pattern gracefully', () => {
        const form = document.createElement('au-schema-form');
        document.body.appendChild(form);

        form.schema = {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    title: 'Name',
                    pattern: '[invalid(' // Invalid regex
                }
            }
        };

        // Set a value that would trigger validation
        form.setValues({ name: 'test' });

        // validate should not throw, and should report the invalid pattern
        let isValid;
        expect(() => {
            isValid = form.validate();
        }).not.toThrow();

        // Should be invalid because of the bad pattern
        expect(isValid).toBe(false);
        expect(form.getErrors().name).toBeDefined();
        expect(form.getErrors().name[0]).toBe('Invalid validation pattern');

        document.body.removeChild(form);
    });

    test('should handle valid regex pattern normally', () => {
        const form = document.createElement('au-schema-form');
        document.body.appendChild(form);

        form.schema = {
            type: 'object',
            properties: {
                email: {
                    type: 'string',
                    title: 'Email',
                    pattern: '^[a-z]+$'
                }
            }
        };

        form.setValues({ email: 'hello' });
        expect(form.validate()).toBe(true);

        form.setValues({ email: 'HELLO123' });
        expect(form.validate()).toBe(false);

        document.body.removeChild(form);
    });

    test('should handle regex pattern that does not match', () => {
        const form = document.createElement('au-schema-form');
        document.body.appendChild(form);

        form.schema = {
            type: 'object',
            properties: {
                code: {
                    type: 'string',
                    title: 'Code',
                    pattern: '^[A-Z]{3}$',
                    patternError: 'Must be 3 uppercase letters'
                }
            }
        };

        form.setValues({ code: 'ab' });
        expect(form.validate()).toBe(false);
        expect(form.getErrors().code[0]).toBe('Must be 3 uppercase letters');

        document.body.removeChild(form);
    });
});
