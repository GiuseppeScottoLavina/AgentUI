/**
 * @fileoverview Guard Test: APIs documented in llms.txt must exist in src/index.js
 * 
 * Prevents phantom APIs — documentation promising exports that don't exist.
 * If this test fails, either:
 *   1. The API was removed from src/index.js → remove it from llms.txt too
 *   2. The API was added to llms.txt → implement it in src/ first
 */

import { describe, test, expect } from 'bun:test';
import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(import.meta.dir, '../..');
const LLMS_TXT = readFileSync(join(ROOT, 'llms.txt'), 'utf-8');
const INDEX_JS = readFileSync(join(ROOT, 'src/index.js'), 'utf-8');

/**
 * Extract all named imports from `import { X, Y } from 'agentui-wc'` in a file
 */
function extractImportedAPIs(content) {
    const apis = new Set();
    const importRegex = /import\s*\{([^}]+)\}\s*from\s*['"]agentui-wc['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        match[1].split(',').forEach(name => {
            const trimmed = name.trim();
            if (trimmed) apis.add(trimmed);
        });
    }
    return apis;
}

/**
 * Extract all exported names from src/index.js
 */
function extractExportedAPIs(content) {
    const apis = new Set();
    const exportRegex = /export\s*\{([^}]+)\}/g;
    let match;
    while ((match = exportRegex.exec(content)) !== null) {
        match[1].split(',').forEach(name => {
            let trimmed = name.trim();
            // Handle `describe as describeComponent` — both names are valid
            const asMatch = trimmed.match(/(\w+)\s+as\s+(\w+)/);
            if (asMatch) {
                apis.add(asMatch[1]);
                apis.add(asMatch[2]);
            } else if (trimmed) {
                apis.add(trimmed);
            }
        });
    }
    return apis;
}

describe('Documentation API Guard (llms.txt ↔ src/index.js)', () => {

    const documentedAPIs = extractImportedAPIs(LLMS_TXT);
    const realAPIs = extractExportedAPIs(INDEX_JS);

    test('every API imported in llms.txt must be exported from src/index.js', () => {
        const phantomAPIs = [];
        for (const api of documentedAPIs) {
            if (!realAPIs.has(api)) {
                phantomAPIs.push(api);
            }
        }
        expect(phantomAPIs).toEqual([]);
    });

    test('should have found documented APIs to validate (sanity check)', () => {
        expect(documentedAPIs.size).toBeGreaterThan(3);
    });

    test('should have found real exports to validate (sanity check)', () => {
        expect(realAPIs.size).toBeGreaterThan(50);
    });
});
