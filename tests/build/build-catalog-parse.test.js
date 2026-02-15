/**
 * @fileoverview TDD Tests for catalog parsing (P0.1)
 * Ensures the describe-catalog can be parsed WITHOUT eval().
 * 
 * Test written BEFORE the fix — validates that JSON.parse works directly
 * on the extracted catalog string, making eval() unnecessary.
 */

import { describe, test, expect } from 'bun:test';
import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(import.meta.dir, '../..');
const CATALOG_PATH = join(ROOT, 'src/core/describe-catalog.js');

describe('Catalog Parsing without eval()', () => {

    test('describe-catalog.js should exist', () => {
        const content = readFileSync(CATALOG_PATH, 'utf-8');
        expect(content.length).toBeGreaterThan(0);
    });

    test('catalog regex extraction should match', () => {
        const catalogSource = readFileSync(CATALOG_PATH, 'utf-8');
        const catalogMatch = catalogSource.match(/export const catalog = ({[\s\S]*});/);
        expect(catalogMatch).not.toBeNull();
        expect(catalogMatch[1]).toBeDefined();
    });

    test('extracted catalog should be parseable as JSON directly', () => {
        const catalogSource = readFileSync(CATALOG_PATH, 'utf-8');
        const catalogMatch = catalogSource.match(/export const catalog = ({[\s\S]*});/);

        let parsed;
        expect(() => {
            parsed = JSON.parse(catalogMatch[1]);
        }).not.toThrow();

        expect(parsed).toBeDefined();
        expect(typeof parsed).toBe('object');
    });

    test('parsed catalog should have 30+ component keys', () => {
        const catalogSource = readFileSync(CATALOG_PATH, 'utf-8');
        const catalogMatch = catalogSource.match(/export const catalog = ({[\s\S]*});/);
        const parsed = JSON.parse(catalogMatch[1]);

        const keys = Object.keys(parsed);
        expect(keys.length).toBeGreaterThan(30);
    });

    test('parsed catalog should contain known components', () => {
        const catalogSource = readFileSync(CATALOG_PATH, 'utf-8');
        const catalogMatch = catalogSource.match(/export const catalog = ({[\s\S]*});/);
        const parsed = JSON.parse(catalogMatch[1]);

        expect(parsed['au-button']).toBeDefined();
        expect(parsed['au-button'].name).toBe('au-button');
        expect(parsed['au-card']).toBeDefined();
        expect(parsed['au-dropdown']).toBeDefined();
    });

    test('parsed catalog components should have expected structure', () => {
        const catalogSource = readFileSync(CATALOG_PATH, 'utf-8');
        const catalogMatch = catalogSource.match(/export const catalog = ({[\s\S]*});/);
        const parsed = JSON.parse(catalogMatch[1]);

        const button = parsed['au-button'];
        expect(button.description).toBeDefined();
        expect(button.props).toBeDefined();
        expect(button.examples).toBeDefined();
    });
});
