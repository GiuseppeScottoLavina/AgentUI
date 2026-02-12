/**
 * @fileoverview Tests for Component Schema API (2026 Features)
 * Tests getComponentSchema, getAllSchemas, getSchemaComponents, getSchemaQuickRef
 */

import { describe, test, expect } from 'bun:test';

describe('Component Schema API', () => {
    describe('getComponentSchema', () => {
        test('should export getComponentSchema function', async () => {
            const module = await import('../../src/core/component-schema.js');
            expect(typeof module.getComponentSchema).toBe('function');
        });

        test('should return schema for au-button', async () => {
            const { getComponentSchema } = await import('../../src/core/component-schema.js');
            const schema = getComponentSchema('au-button');

            expect(schema).not.toBeNull();
            expect(schema.title).toBe('au-button');
            expect(schema.type).toBe('object');
        });

        test('should include properties with types', async () => {
            const { getComponentSchema } = await import('../../src/core/component-schema.js');
            const schema = getComponentSchema('au-button');

            expect(schema.properties).toBeDefined();
            expect(schema.properties.variant).toBeDefined();
            expect(schema.properties.variant.type).toBe('string');
            expect(Array.isArray(schema.properties.variant.enum)).toBe(true);
        });

        test('should include actions array', async () => {
            const { getComponentSchema } = await import('../../src/core/component-schema.js');
            const schema = getComponentSchema('au-button');

            expect(Array.isArray(schema.actions)).toBe(true);
            expect(schema.actions).toContain('click');
        });

        test('should return null for unknown component', async () => {
            const { getComponentSchema } = await import('../../src/core/component-schema.js');
            const schema = getComponentSchema('au-nonexistent');

            expect(schema).toBeNull();
        });
    });

    describe('getAllSchemas', () => {
        test('should export getAllSchemas function', async () => {
            const module = await import('../../src/core/component-schema.js');
            expect(typeof module.getAllSchemas).toBe('function');
        });

        test('should return a Map', async () => {
            const { getAllSchemas } = await import('../../src/core/component-schema.js');
            const schemas = getAllSchemas();

            expect(schemas instanceof Map).toBe(true);
        });

        test('should contain multiple components', async () => {
            const { getAllSchemas } = await import('../../src/core/component-schema.js');
            const schemas = getAllSchemas();

            expect(schemas.size).toBeGreaterThan(5);
            expect(schemas.has('au-button')).toBe(true);
            expect(schemas.has('au-input')).toBe(true);
        });
    });

    describe('getSchemaComponents', () => {
        test('should export getSchemaComponents function', async () => {
            const module = await import('../../src/core/component-schema.js');
            expect(typeof module.getSchemaComponents).toBe('function');
        });

        test('should return array of tag names', async () => {
            const { getSchemaComponents } = await import('../../src/core/component-schema.js');
            const components = getSchemaComponents();

            expect(Array.isArray(components)).toBe(true);
            expect(components).toContain('au-button');
            expect(components).toContain('au-input');
            expect(components).toContain('au-checkbox');
        });
    });

    describe('getSchemaQuickRef', () => {
        test('should export getSchemaQuickRef function', async () => {
            const module = await import('../../src/core/component-schema.js');
            expect(typeof module.getSchemaQuickRef).toBe('function');
        });

        test('should return minimal summary', async () => {
            const { getSchemaQuickRef } = await import('../../src/core/component-schema.js');
            const ref = getSchemaQuickRef('au-button');

            expect(ref).not.toBeNull();
            expect(ref.tag).toBe('au-button');
            expect(ref.description).toBeDefined();
            expect(Array.isArray(ref.properties)).toBe(true);
            expect(Array.isArray(ref.actions)).toBe(true);
        });

        test('should return null for unknown component', async () => {
            const { getSchemaQuickRef } = await import('../../src/core/component-schema.js');
            const ref = getSchemaQuickRef('au-fake');

            expect(ref).toBeNull();
        });
    });

    describe('getSchemas (batch)', () => {
        test('should export getSchemas function', async () => {
            const module = await import('../../src/core/component-schema.js');
            expect(typeof module.getSchemas).toBe('function');
        });

        test('should return multiple schemas at once', async () => {
            const { getSchemas } = await import('../../src/core/component-schema.js');
            const schemas = getSchemas(['au-button', 'au-input', 'au-checkbox']);

            expect(Object.keys(schemas).length).toBe(3);
            expect(schemas['au-button']).toBeDefined();
            expect(schemas['au-input']).toBeDefined();
        });
    });

    describe('exportSchemasAsJSON', () => {
        test('should export exportSchemasAsJSON function', async () => {
            const module = await import('../../src/core/component-schema.js');
            expect(typeof module.exportSchemasAsJSON).toBe('function');
        });

        test('should return valid JSON string', async () => {
            const { exportSchemasAsJSON } = await import('../../src/core/component-schema.js');
            const json = exportSchemasAsJSON();

            expect(typeof json).toBe('string');
            expect(() => JSON.parse(json)).not.toThrow();

            const parsed = JSON.parse(json);
            expect(parsed['au-button']).toBeDefined();
        });
    });

    describe('ComponentSchema namespace', () => {
        test('should export ComponentSchema object with all methods', async () => {
            const { ComponentSchema } = await import('../../src/core/component-schema.js');

            expect(typeof ComponentSchema.getComponentSchema).toBe('function');
            expect(typeof ComponentSchema.getAllSchemas).toBe('function');
            expect(typeof ComponentSchema.getSchemaComponents).toBe('function');
            expect(typeof ComponentSchema.getSchemaQuickRef).toBe('function');
            expect(typeof ComponentSchema.exportSchemasAsJSON).toBe('function');
        });
    });
});
