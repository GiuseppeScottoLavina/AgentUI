/**
 * @fileoverview AgentUI Component Analyzer
 * 
 * Scans source code to generate custom-elements.json manifest.
 * Follows Custom Elements Manifest (CEM) schema.
 * 
 * Usage: node scripts/analyze-components.js
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const SRC_DIR = './src/components';
const OUT_FILE = './custom-elements.json';

const manifest = {
    schemaVersion: "1.0.0",
    readme: "AGENTS.md",
    modules: []
};

console.log('🔍 Analyzing components...');

if (existsSync(SRC_DIR)) {
    const files = readdirSync(SRC_DIR).filter(f => f.endsWith('.js'));

    files.forEach(file => {
        const content = readFileSync(join(SRC_DIR, file), 'utf-8');
        const moduleDoc = {
            kind: "javascript-module",
            path: `src/components/${file}`,
            declarations: [],
            exports: []
        };

        // RegEx to find class definition
        const classMatch = content.match(/class\s+(\w+)\s+extends\s+AuElement/);
        if (classMatch) {
            const className = classMatch[1];

            // Find tag name — handles both define() helper and customElements.define()
            const tagMatch = content.match(/(?:customElements\.)?define\(['"]([\w-]+)['"]\s*,\s*\w+\)/);
            const tagName = tagMatch ? tagMatch[1] : null;

            // Find observed attributes — handles both patterns:
            //   static observedAttributes = ['a', 'b'];
            //   static get observedAttributes() { return [...]; }
            const obsAttrMatch = content.match(/static\s+observedAttributes\s*=\s*\[(.*?)\]/s)
                || content.match(/static get observedAttributes\s*\(\)\s*\{\s*return\s*\[(.*?)\]/s);
            const attributes = [];
            if (obsAttrMatch) {
                const attrs = obsAttrMatch[1].split(',').map(s => s.trim().replace(/['"]/g, ''));
                attrs.forEach(attr => {
                    if (attr) attributes.push({ name: attr, type: { text: "string" } });
                });
            }

            // Find base class for component specific baseClass
            const baseClassMatch = content.match(/static\s+baseClass\s*=\s*['"]([\w-]+)['"]/);
            const cssBaseClass = baseClassMatch ? baseClassMatch[1] : null;

            // Regex to find JSDoc before class
            const jsdocMatch = content.match(/\/\*\*\s*([\s\S]*?)\s*\*\/\s*export\s+class/);
            let description = `AgentUI component: ${tagName}`;

            if (jsdocMatch) {
                const jsdoc = jsdocMatch[1];
                // Extract description (text before @tags)
                const descMatch = jsdoc.match(/@fileoverview\s+([^\n]+)/); // Try fileoverview
                if (descMatch) {
                    description = descMatch[1].trim();
                } else {
                    // Fallback to first line of JSDoc inside
                    const lines = jsdoc.split('\n').filter(l => !l.trim().startsWith('* @') && l.trim().length > 3);
                    if (lines.length > 0) description = lines[0].replace(/\*\s*/, '').trim();
                }
            }

            const declaration = {
                kind: "class",
                name: className,
                tagName: tagName,
                superclass: { name: "AuElement" },
                attributes: attributes,
                description: description,
                members: [
                    { kind: "field", name: "baseClass", privacy: "public", default: cssBaseClass }
                ]
            };

            moduleDoc.declarations.push(declaration);

            if (tagName) {
                moduleDoc.exports.push({
                    kind: "custom-element-definition",
                    name: tagName,
                    declaration: { name: className, module: `src/components/${file}` }
                });
            }
        }

        manifest.modules.push(moduleDoc);
        console.log(`   ✅ ${file}`);
    });
}

writeFileSync(OUT_FILE, JSON.stringify(manifest, null, 2));
console.log(`\n✨ Manifest generated: ${OUT_FILE}`);
