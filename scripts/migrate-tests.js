#!/usr/bin/env bun
/**
 * Migration script: refactor all component test files to use shared DOM helper.
 * 
 * For each test file in tests/components/:
 * 1. Replace `import { parseHTML } from 'linkedom'` with `import { dom, resetBody } from '../helpers/setup-dom.js'`
 * 2. Replace multi-line globalThis boilerplate with `const { document, body, customElements } = dom;`
 * 3. Replace `beforeEach(() => { body.innerHTML = ''; })` with `beforeEach(() => resetBody())`
 * 
 * Run: bun scripts/migrate-tests.js [--dry-run]
 */

import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const testDir = join(import.meta.dir, '../tests/components');
const files = readdirSync(testDir).filter(f => f.endsWith('.test.js'));

let modified = 0;
let skipped = 0;
const errors = [];

for (const file of files) {
    const filePath = join(testDir, file);
    let content = readFileSync(filePath, 'utf-8');
    const original = content;

    // Skip if already migrated
    if (content.includes("from '../helpers/setup-dom.js'")) {
        skipped++;
        continue;
    }

    // Skip if no parseHTML (shouldn't happen, but safety first)
    if (!content.includes('parseHTML')) {
        skipped++;
        continue;
    }

    try {
        // 1. Replace linkedom import with setup-dom import
        content = content.replace(
            /^.*import\s*\{?\s*parseHTML\s*\}?\s*from\s*['"]linkedom['"];?\s*$/m,
            "import { dom, resetBody } from '../helpers/setup-dom.js';"
        );

        // Also remove comment line "// Setup linkedom for DOM testing" if present
        content = content.replace(/^\s*\/\/\s*Setup linkedom.*\n/m, '');

        // 2. Replace the globalThis boilerplate block in beforeAll
        //    This is the hard part — patterns vary across files.
        //    Strategy: remove all globalThis.* lines that setup-dom.js handles,
        //    and add `const { document, body, customElements } = dom;` after the import.

        // Remove standard globalThis lines handled by setup-dom.js
        const globalThisLines = [
            /^\s*globalThis\.window\s*=\s*dom\.window;?\s*$/m,
            /^\s*globalThis\.document\s*=\s*document;\s*$/m,
            /^\s*globalThis\.customElements\s*=\s*customElements;\s*$/m,
            /^\s*globalThis\.HTMLElement\s*=\s*(dom\.)?HTMLElement;\s*$/m,
            /^\s*globalThis\.requestAnimationFrame\s*=.*;\s*$/m,
            /^\s*globalThis\.cancelAnimationFrame\s*=.*;\s*$/m,
            /^\s*globalThis\.getComputedStyle\s*=\s*\(\)\s*=>\s*\(\{[^}]*\}\);?\s*$/m,
            /^\s*globalThis\.matchMedia\s*=\s*\(\)\s*=>\s*\(\{[^}]*\}\);?\s*$/m,
        ];

        for (const pattern of globalThisLines) {
            content = content.replace(pattern, '');
        }

        // Remove multi-line getComputedStyle blocks
        content = content.replace(
            /\s*(?:\/\/.*getComputedStyle.*\n)?\s*globalThis\.getComputedStyle\s*=\s*\(\)\s*=>\s*\(\{[\s\S]*?\}\);\s*\n/g,
            '\n'
        );

        // Remove multi-line CustomEvent blocks
        content = content.replace(
            /\s*globalThis\.CustomEvent\s*=\s*class\s+CustomEvent\s+extends\s+Event\s*\{[\s\S]*?\};\s*\n/g,
            '\n'
        );

        // Remove multi-line matchMedia mock blocks that span multiple lines
        content = content.replace(
            /\s*(?:\/\/.*matchMedia.*\n)?\s*globalThis\.matchMedia\s*=\s*\(\)\s*=>\s*\(\{[\s\S]*?\}\);\s*\n/g,
            '\n'
        );

        // Remove multi-line MutationObserver mocks
        content = content.replace(
            /\s*globalThis\.MutationObserver\s*=\s*class[\s\S]*?\};\s*\n/g,
            '\n'
        );

        // Remove multi-line IntersectionObserver mocks
        content = content.replace(
            /\s*globalThis\.IntersectionObserver\s*=\s*class[\s\S]*?\};\s*\n/g,
            '\n'
        );

        // Remove the parseHTML call and its variable declarations
        // Pattern: const dom = parseHTML('...');  + document/customElements/body assignments
        content = content.replace(
            /\s*const\s+dom\s*=\s*parseHTML\([^)]+\);\s*\n/g,
            '\n'
        );
        // Remove: document = dom.document;
        content = content.replace(/^\s*(let\s+)?(document|customElements|HTMLElement|body)\s*=\s*dom\.\2;\s*$/gm, '');
        // Remove: body = document.body;
        content = content.replace(/^\s*(let\s+)?body\s*=\s*document\.body;\s*$/gm, '');

        // 3. Add destructuring after the import
        //    Find what variables are actually used in the file
        const needsCustomElements = content.includes('customElements.get') || content.includes('customElements.define');
        const needsHTMLElement = content.includes('HTMLElement') && !content.includes("dom.HTMLElement");

        // Build destructuring
        let destructured = ['document', 'body'];
        if (needsCustomElements) destructured.push('customElements');

        // Add destructuring line after the setup-dom import
        const destructLine = `\nconst { ${destructured.join(', ')} } = dom;\n`;

        // Insert after the setup-dom import
        content = content.replace(
            /(import\s*\{[^}]*\}\s*from\s*'\.\.\/helpers\/setup-dom\.js';)/,
            `$1${destructLine}`
        );

        // 4. Replace beforeEach body cleanup patterns
        content = content.replace(
            /beforeEach\(\s*\(\)\s*=>\s*\{\s*body\.innerHTML\s*=\s*''\s*;?\s*\}\s*\)/g,
            'beforeEach(() => resetBody())'
        );
        // Also handle multi-line patterns where body.innerHTML = '' is one of two lines
        content = content.replace(
            /body\.innerHTML\s*=\s*''\s*;?\s*\n/g,
            'resetBody();\n'
        );

        // 5. Remove now-empty "let document, customElements, body;" declarations
        content = content.replace(/^\s*let\s+(document\s*,\s*)?(customElements\s*,\s*)?(HTMLElement\s*,\s*)?body;\s*$/m, '');
        // Also remove: let document, customElements, HTMLElement, body;
        content = content.replace(/^\s*let\s+document\s*,\s*customElements\s*,\s*(HTMLElement\s*,\s*)?body;\s*$/m, '');

        // 6. Clean up excessive blank lines
        content = content.replace(/\n{4,}/g, '\n\n');

        if (content !== original) {
            if (!DRY_RUN) {
                writeFileSync(filePath, content);
            }
            modified++;
            console.log(`${DRY_RUN ? '[DRY] ' : ''}✅ ${file}`);
        } else {
            skipped++;
        }
    } catch (err) {
        errors.push({ file, error: err.message });
        console.error(`❌ ${file}: ${err.message}`);
    }
}

console.log(`\n📊 Results: ${modified} modified, ${skipped} skipped, ${errors.length} errors`);
if (errors.length) {
    console.log('Errors:', errors);
}
