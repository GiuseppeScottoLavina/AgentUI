/**
 * @fileoverview TypeScript Definitions Completeness Test
 * Verifies that all component classes exported from index.js
 * have corresponding declarations in index.d.ts.
 * 
 * TDD: Written FIRST to identify gaps, then index.d.ts is updated.
 */

import { describe, test, expect } from 'bun:test';
import { readFileSync } from 'fs';
import { join } from 'path';

const SRC_DIR = join(import.meta.dir, '../../src');
const INDEX_JS = readFileSync(join(SRC_DIR, 'index.js'), 'utf-8');
const INDEX_DTS = readFileSync(join(SRC_DIR, 'index.d.ts'), 'utf-8');

describe('TypeScript Definitions Completeness', () => {

    test('all Au* class exports from index.js should be declared in index.d.ts', () => {
        // Extract all Au* class names from export statements in index.js
        const exportMatches = INDEX_JS.match(/export \{[^}]+\}/g) || [];
        const exportedClasses = new Set();
        for (const m of exportMatches) {
            const names = m.match(/Au[A-Za-z]+/g) || [];
            names.forEach(n => exportedClasses.add(n));
        }

        // Extract all class declarations from index.d.ts
        const declaredClasses = new Set();
        const classMatches = INDEX_DTS.match(/class (Au[A-Za-z]+)/g) || [];
        classMatches.forEach(m => {
            const name = m.replace('class ', '');
            declaredClasses.add(name);
        });

        const missing = [...exportedClasses].filter(c => !declaredClasses.has(c));
        if (missing.length > 0) {
            console.log('Missing from index.d.ts:', missing.join(', '));
        }
        expect(missing).toHaveLength(0);
    });

    test('auConfirm function should be declared', () => {
        expect(INDEX_DTS).toContain('auConfirm');
    });

    test('should not reference muConfirm anywhere', () => {
        expect(INDEX_DTS).not.toContain('muConfirm');
    });

    test('should not reference CrossBus', () => {
        expect(INDEX_DTS).not.toContain('CrossBus');
    });

    test('AGENTUI_VERSION should be declared', () => {
        expect(INDEX_DTS).toContain('AGENTUI_VERSION');
        expect(INDEX_DTS).not.toContain('MICROUI_VERSION');
    });

    test('describe() return type should be defined', () => {
        expect(INDEX_DTS).toContain('describe()');
    });
});
