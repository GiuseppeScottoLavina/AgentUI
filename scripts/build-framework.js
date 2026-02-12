/**
 * @fileoverview Framework Build - AgentUI Library
 * 
 * Builds the AgentUI component library:
 * - ESM bundle (agentui.esm.js)
 * - IIFE bundle (agentui.min.js)
 * - CSS (tokens, components, combined)
 * - TypeScript types
 * - Per-component bundles
 * 
 * Run with: bun run build:framework
 */

import { build } from 'bun';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync, unlinkSync, rmdirSync, copyFileSync } from 'fs';
import { join } from 'path';
import { scanPageComponents, componentsToRoutes } from './build-utils.js';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));
const outdir = './dist';

// Ensure dist exists
if (!existsSync(outdir)) {
    mkdirSync(outdir, { recursive: true });
}

// Clean all generated subdirectories to prevent stale chunk hash references
// This is critical for CI where dist/ comes from git checkout with old hashes
const dirsToClean = ['chunks', 'components', 'routes'];
for (const dir of dirsToClean) {
    const dirPath = join(outdir, dir);
    if (existsSync(dirPath)) {
        const files = readdirSync(dirPath);
        for (const f of files) {
            const fp = join(dirPath, f);
            if (statSync(fp).isFile()) unlinkSync(fp);
        }
        // Also clean nested artifacts (e.g. routes/src/)
        const nestedSrc = join(dirPath, 'src');
        if (existsSync(nestedSrc)) {
            const rmRecursive = (p) => {
                for (const entry of readdirSync(p)) {
                    const ep = join(p, entry);
                    if (statSync(ep).isDirectory()) rmRecursive(ep);
                    else unlinkSync(ep);
                }
                rmdirSync(p);
            };
            rmRecursive(nestedSrc);
        }
    }
}

console.log('🔨 Building AgentUI Framework...\\n');

// ============================================
// 1. ESM Bundle
// ============================================
const esmResult = await build({
    entrypoints: ['./src/index.js'],
    outdir,
    target: 'browser',
    format: 'esm',
    minify: true,
    sourcemap: 'external',
    naming: { entry: 'agentui.esm.js' }
});

if (!esmResult.success) {
    console.error('❌ ESM build failed:', esmResult.logs);
    process.exit(1);
}
console.log('✅ ESM bundle: dist/agentui.esm.js');

// ============================================
// 2. IIFE Bundle
// ============================================
const iifeResult = await build({
    entrypoints: ['./src/index.js'],
    outdir,
    target: 'browser',
    format: 'iife',
    minify: true,
    sourcemap: 'external',
    naming: { entry: 'agentui.min.js' }
});

if (!iifeResult.success) {
    console.error('❌ IIFE build failed:', iifeResult.logs);
    process.exit(1);
}
console.log('✅ IIFE bundle: dist/agentui.min.js');

// ============================================
// 2b. Describe Catalog (separate JSON file for lazy loading via fetch)
// ============================================

// Read the catalog source and extract the data
const catalogSource = readFileSync('./src/core/describe-catalog.js', 'utf-8');
const catalogMatch = catalogSource.match(/export const catalog = ({[\s\S]*});/);
if (catalogMatch) {
    const catalogData = eval('(' + catalogMatch[1] + ')');
    writeFileSync(join(outdir, 'describe-catalog.json'), JSON.stringify(catalogData));
    console.log('✅ Describe catalog: dist/describe-catalog.json (lazy-loaded via fetch)');
} else {
    console.error('❌ Could not extract catalog data');
}

// ============================================
// 3. Chunked Builds (code splitting)
// ============================================
console.log('\\n🧩 Building chunked bundles...');
const chunksDir = join(outdir, 'chunks');
mkdirSync(chunksDir, { recursive: true });

// Clean old chunks to prevent stale hash references
for (const f of readdirSync(chunksDir).filter(f => f.startsWith('chunk-'))) {
    unlinkSync(join(chunksDir, f));
}

const chunkedResult = await build({
    entrypoints: [
        './src/chunks/core.js',
        './src/chunks/forms.js',
        './src/chunks/layout.js',
        './src/chunks/display.js',
        './src/chunks/feedback.js',
        './src/chunks/advanced.js'
    ],
    outdir: chunksDir,
    target: 'browser',
    format: 'esm',
    minify: true,
    splitting: true,
    sourcemap: 'none'
});

if (chunkedResult.success) {
    const files = readdirSync(chunksDir).filter(f => f.endsWith('.js')).sort();
    let totalSize = 0;
    for (const file of files) {
        totalSize += statSync(join(chunksDir, file)).size;
    }
    console.log(`   ✅ ${files.length} chunks (${(totalSize / 1024).toFixed(2)} KB)`);
}

// ============================================
// 4. Per-Component Bundles
// ============================================
console.log('\\n🔧 Building per-component bundles...');
const componentsDir = join(outdir, 'components');
mkdirSync(componentsDir, { recursive: true });

// Clean old component and chunk files to prevent stale hash references
for (const f of readdirSync(componentsDir).filter(f => f.endsWith('.js'))) {
    unlinkSync(join(componentsDir, f));
}

const componentFiles = readdirSync('./src/components')
    .filter(f => f.endsWith('.js'))
    .map(f => `./src/components/${f}`);

const componentResult = await build({
    entrypoints: componentFiles,
    outdir: componentsDir,
    target: 'browser',
    format: 'esm',
    minify: true,
    splitting: true,
    sourcemap: 'none'
});

if (componentResult.success) {
    const nestedDir = join(componentsDir, 'src', 'components');
    let totalSize = 0;
    let count = 0;

    if (existsSync(nestedDir)) {
        const files = readdirSync(nestedDir).filter(f => f.startsWith('au-') && f.endsWith('.js'));
        count = files.length;

        // Flatten and fix paths
        for (const file of files) {
            let content = readFileSync(join(nestedDir, file), 'utf-8');
            content = content.replace(/"\.\.\/\.\.\/chunk-/g, '"./chunk-');
            writeFileSync(join(componentsDir, file), content);
            totalSize += content.length;
        }

        // Cleanup nested structure
        try {
            const allFiles = readdirSync(nestedDir);
            for (const f of allFiles) unlinkSync(join(nestedDir, f));
            rmdirSync(nestedDir);
            rmdirSync(join(componentsDir, 'src'));
        } catch (e) { }
    }

    const sharedChunks = readdirSync(componentsDir).filter(f => f.startsWith('chunk-'));
    let sharedSize = 0;
    for (const f of sharedChunks) {
        sharedSize += statSync(join(componentsDir, f)).size;
    }

    console.log(`   ✅ ${count} components (${(totalSize / 1024).toFixed(2)} KB + ${(sharedSize / 1024).toFixed(2)} KB shared)`);
}

// ============================================
// 5. CSS
// ============================================
console.log('\\n🎨 Building CSS...');
const tokensCss = readFileSync('./src/styles/tokens.css', 'utf-8');
const componentsCss = readFileSync('./src/styles/components.css', 'utf-8');
const animationsCss = existsSync('./src/styles/animations.css')
    ? readFileSync('./src/styles/animations.css', 'utf-8')
    : '';
const commonCss = existsSync('./src/styles/common.css')
    ? readFileSync('./src/styles/common.css', 'utf-8')
    : '';
// Include overlays.css for au-modal, au-confirm, au-alert styles
const overlaysCss = existsSync('./src/styles/components/overlays.css')
    ? readFileSync('./src/styles/components/overlays.css', 'utf-8')
    : '';
// CLS Prevention: :not(:defined) rules for zero layout shift
const clsPreventionCss = existsSync('./src/styles/cls-prevention.css')
    ? readFileSync('./src/styles/cls-prevention.css', 'utf-8')
    : '';

// Minify CSS (basic)
function minifyCSS(css) {
    return css
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\s+/g, ' ')
        .replace(/\s*([{}:;,>~])\s*/g, '$1')
        .replace(/;}/g, '}')
        .trim();
}

const combinedCss = `${tokensCss}\n${componentsCss}\n${animationsCss}\n${overlaysCss}\n${clsPreventionCss}`;
writeFileSync(join(outdir, 'agentui.css'), minifyCSS(combinedCss));
writeFileSync(join(outdir, 'tokens.css'), minifyCSS(tokensCss));
writeFileSync(join(outdir, 'components.css'), minifyCSS(componentsCss));

console.log('   ✅ dist/agentui.css (combined, minified)');
console.log('   ✅ dist/tokens.css');
console.log('   ✅ dist/components.css');

// 5b. Modular CSS (lazy loading support)
const cssComponentsDir = join(outdir, 'styles', 'components');
mkdirSync(cssComponentsDir, { recursive: true });

// Copy common.css
if (commonCss) {
    writeFileSync(join(outdir, 'styles', 'common.css'), minifyCSS(commonCss));
    console.log('   ✅ dist/styles/common.css');
}

// Copy individual component CSS files
const srcCssComponentsDir = './src/styles/components';
if (existsSync(srcCssComponentsDir)) {
    const cssFiles = readdirSync(srcCssComponentsDir).filter(f => f.endsWith('.css'));
    for (const file of cssFiles) {
        const content = readFileSync(join(srcCssComponentsDir, file), 'utf-8');
        writeFileSync(join(cssComponentsDir, file), minifyCSS(content));
    }
    console.log(`   ✅ dist/styles/components/ (${cssFiles.length} modular CSS files)`);
}

// ============================================
// 6. TypeScript Types
// ============================================
console.log('\\n📘 Building TypeScript types...');
if (existsSync('./src/index.d.ts')) {
    const types = readFileSync('./src/index.d.ts', 'utf-8');
    writeFileSync(join(outdir, 'agentui.d.ts'), types);
    console.log('   ✅ dist/agentui.d.ts');
}

// ============================================
// 7. Route Bundles (for index-ultra.html)
// ============================================
console.log('\n🛤️  Building route bundles...');
const routesDir = join(outdir, 'routes');
mkdirSync(routesDir, { recursive: true });

// Clean old route chunks to prevent stale hash references
for (const f of readdirSync(routesDir).filter(f => f.startsWith('chunk-'))) {
    unlinkSync(join(routesDir, f));
}

// Define page -> component mappings
// shell-critical: ONLY what's needed for first paint (layout structure)
// shell-deferred: Everything else (can load after FCP)
const pageRoutes = {
    'shell-critical': ['au-layout', 'au-drawer', 'au-drawer-item'],
    'shell-deferred': ['au-theme-toggle', 'au-navbar', 'au-toast', 'au-icon', 'au-stack', 'au-bottom-nav'],
    shell: ['au-theme-toggle', 'au-navbar', 'au-toast', 'au-icon', 'au-stack', 'au-layout', 'au-drawer', 'au-drawer-item', 'au-bottom-nav'],
    home: ['au-stack', 'au-card', 'au-icon'],
    installation: ['au-stack', 'au-card', 'au-code'],
    buttons: ['au-button', 'au-stack', 'au-tabs', 'au-example', 'au-code', 'au-api-table'],
    inputs: ['au-input', 'au-textarea', 'au-stack', 'au-tabs', 'au-example', 'au-code', 'au-api-table'],
    checkboxes: ['au-checkbox', 'au-stack', 'au-tabs', 'au-example', 'au-code'],
    switches: ['au-switch', 'au-stack', 'au-tabs', 'au-example', 'au-code'],
    radios: ['au-radio', 'au-stack', 'au-tabs', 'au-example', 'au-code'],
    dropdowns: ['au-dropdown', 'au-stack', 'au-tabs', 'au-example', 'au-code'],
    cards: ['au-card', 'au-stack', 'au-tabs', 'au-example', 'au-code', 'au-api-table'],
    layout: ['au-stack', 'au-grid', 'au-card', 'au-tabs', 'au-example', 'au-code'],
    tabs: ['au-tabs', 'au-stack', 'au-example', 'au-code'],
    navbar: ['au-navbar', 'au-tabs', 'au-example', 'au-code'],
    alerts: ['au-alert', 'au-stack', 'au-tabs', 'au-example', 'au-code', 'au-icon', 'au-card'],
    toasts: ['au-toast', 'au-button', 'au-stack', 'au-tabs', 'au-example', 'au-code', 'au-alert', 'au-icon', 'au-card'],
    modals: ['au-modal', 'au-button', 'au-stack', 'au-tabs', 'au-example', 'au-code', 'au-alert', 'au-icon', 'au-card'],
    progress: ['au-progress', 'au-stack', 'au-tabs', 'au-example', 'au-code', 'au-api-table', 'au-alert', 'au-icon', 'au-card'],
    avatars: ['au-avatar', 'au-stack', 'au-tabs', 'au-example', 'au-code'],
    badges: ['au-badge', 'au-stack', 'au-tabs', 'au-example', 'au-code'],
    chips: ['au-chip', 'au-stack', 'au-tabs', 'au-example', 'au-code'],
    icons: ['au-icon', 'au-grid', 'au-stack', 'au-tabs', 'au-example', 'au-code'],
    dividers: ['au-divider', 'au-stack', 'au-tabs', 'au-example', 'au-code', 'au-api-table', 'au-card', 'au-button', 'au-icon'],
    callouts: ['au-callout', 'au-stack', 'au-tabs', 'au-example', 'au-code', 'au-api-table'],
    skeletons: ['au-skeleton', 'au-stack', 'au-tabs', 'au-example', 'au-code', 'au-api-table', 'au-card'],
    tooltips: ['au-tooltip', 'au-stack', 'au-tabs', 'au-example', 'au-code', 'au-api-table', 'au-button', 'au-icon', 'au-card'],
    spinners: ['au-spinner', 'au-stack', 'au-tabs', 'au-example', 'au-code', 'au-api-table', 'au-button'],
    confirms: ['au-confirm', 'au-button', 'au-stack', 'au-tabs', 'au-example', 'au-code', 'au-api-table'],
    tables: ['au-table', 'au-stack', 'au-tabs', 'au-example', 'au-code', 'au-api-table'],
    datatables: ['au-datatable', 'au-stack', 'au-tabs', 'au-example', 'au-code', 'au-api-table'],
    codeblocks: ['au-code', 'au-stack', 'au-tabs', 'au-example', 'au-api-table'],
    'virtual-lists': ['au-virtual-list', 'au-stack', 'au-tabs', 'au-example', 'au-code', 'au-api-table', 'au-alert', 'au-icon', 'au-card', 'au-avatar'],
    enterprise: ['au-router', 'au-page', 'au-error-boundary', 'au-fetch', 'au-lazy', 'au-stack', 'au-tabs', 'au-example', 'au-code', 'au-api-table']
};

// Generate route entry files
const tmpRoutesDir = './dist/.tmp-routes';
mkdirSync(tmpRoutesDir, { recursive: true });

for (const [route, deps] of Object.entries(pageRoutes)) {
    const imports = deps.map(d => `import '../components/${d}.js';`).join('\n');
    // Shell route needs core.js to register toast listener
    const coreImport = route === 'shell' ? `import '../chunks/core.js';\n` : '';
    writeFileSync(join(tmpRoutesDir, `${route}.js`), coreImport + imports);
}

// Build routes with splitting - INCLUDE core.js to ensure shared state (bus, theme) is deduplicated
const routeEntries = Object.keys(pageRoutes).map(r => join(tmpRoutesDir, `${r}.js`));
routeEntries.push('./src/chunks/core.js'); // Add core as entrypoint

const routeResult = await build({
    entrypoints: routeEntries,
    outdir: routesDir,
    target: 'browser',
    format: 'esm',
    minify: true,
    splitting: true,
    sourcemap: 'none'
});

if (routeResult.success) {
    // Flatten nested structure if present
    const nestedDir = join(routesDir, 'dist', '.tmp-routes');
    if (existsSync(nestedDir)) {
        const files = readdirSync(nestedDir).filter(f => f.endsWith('.js'));
        for (const file of files) {
            let content = readFileSync(join(nestedDir, file), 'utf-8');
            // Fix import paths
            content = content.replace(/from"\.\.\/\.\.\/chunk-/g, 'from"./chunk-');
            content = content.replace(/from"\.\.\/\.\.\/\.\.\/components\//g, 'from"../components/');
            content = content.replace(/import"\.\.\/\.\.\/chunk-/g, 'import"./chunk-');
            writeFileSync(join(routesDir, file), content);
        }

        // Cleanup
        try {
            for (const f of readdirSync(nestedDir)) unlinkSync(join(nestedDir, f));
            rmdirSync(nestedDir);
            rmdirSync(join(routesDir, 'dist'));
        } catch (e) { }
    }

    // Cleanup tmp
    try {
        for (const f of readdirSync(tmpRoutesDir)) unlinkSync(join(tmpRoutesDir, f));
        rmdirSync(tmpRoutesDir);
    } catch (e) { }

    const routeFiles = readdirSync(routesDir).filter(f => !f.startsWith('chunk-') && f.endsWith('.js'));
    const chunkFiles = readdirSync(routesDir).filter(f => f.startsWith('chunk-'));
    let routeSize = 0, chunkSize = 0;
    for (const f of routeFiles) routeSize += statSync(join(routesDir, f)).size;
    for (const f of chunkFiles) chunkSize += statSync(join(routesDir, f)).size;

    console.log(`   ✅ ${routeFiles.length} routes (${(routeSize / 1024).toFixed(2)} KB + ${(chunkSize / 1024).toFixed(2)} KB shared)`);
}

// ============================================
// 8. Auto-Generate Route Dependencies (from HTML analysis)
// ============================================
console.log('\\n🔍 Generating route dependencies from HTML...');
// Scan content fragments from demo/content/*.html

const contentDir = './demo/content';
const pageComponents = {};

if (existsSync(contentDir)) {
    const contentFiles = readdirSync(contentDir).filter(f => f.endsWith('.html'));

    for (const file of contentFiles) {
        const pageId = file.replace('.html', '');
        const content = readFileSync(join(contentDir, file), 'utf-8');

        // Extract au-* components from this content fragment
        const componentMatches = content.match(/<au-[a-z-]+/g) || [];
        const components = [...new Set(componentMatches.map(m => m.slice(1)))];

        if (components.length > 0) {
            pageComponents[pageId] = components;
        }
    }
}

// Convert components to route dependencies
const routeDeps = {};
for (const [pageId, components] of Object.entries(pageComponents)) {
    const routes = componentsToRoutes(components);
    // Filter out shell routes (always loaded) and self-reference
    const filteredRoutes = routes.filter(r =>
        !r.startsWith('shell') && r !== pageId
    );
    if (filteredRoutes.length > 0) {
        routeDeps[pageId] = filteredRoutes;
    }
}

// Write route-deps.json
writeFileSync(
    join(routesDir, 'route-deps.json'),
    JSON.stringify(routeDeps, null, 2)
);

console.log(`   ✅ route-deps.json (${Object.keys(routeDeps).length} pages with dependencies)`);

// Also write full component mapping for debugging
writeFileSync(
    join(routesDir, 'page-components.json'),
    JSON.stringify(pageComponents, null, 2)
);
console.log(`   ✅ page-components.json (${Object.keys(pageComponents).length} pages scanned)`);

// ============================================
// Summary
// ============================================
console.log('\\n📦 Framework bundle sizes:');
const sizes = {
    esm: statSync(join(outdir, 'agentui.esm.js')).size,
    iife: statSync(join(outdir, 'agentui.min.js')).size,
    css: statSync(join(outdir, 'agentui.css')).size,
    catalog: existsSync(join(outdir, 'describe-catalog.json')) ? statSync(join(outdir, 'describe-catalog.json')).size : 0
};
console.log(`   ESM:     ${(sizes.esm / 1024).toFixed(2)} KB`);
console.log(`   IIFE:    ${(sizes.iife / 1024).toFixed(2)} KB`);
console.log(`   CSS:     ${(sizes.css / 1024).toFixed(2)} KB`);
console.log(`   Catalog: ${(sizes.catalog / 1024).toFixed(2)} KB (lazy-loaded, NOT in main bundle)`);


// ============================================
// 9. Auto-Version Update (Cache Busting)
// ============================================
console.log('\n🔄 Updating version cache buster...');

// Update version in index.html
const demoFiles = ['./demo/index.html'];
let newVersion;

for (const demoPath of demoFiles) {
    if (!existsSync(demoPath)) continue;

    let content = readFileSync(demoPath, 'utf-8');

    // Extract current version or generate new one (do this once from first file)
    if (!newVersion) {
        const versionMatch = content.match(/\?v=(\d+\.\d+\.\d+)/);

        if (versionMatch) {
            // Increment patch version
            const parts = versionMatch[1].split('.');
            parts[2] = String(parseInt(parts[2], 10) + 1);
            newVersion = parts.join('.');
        } else {
            // Fallback: use date-based version
            const now = new Date();
            newVersion = `${now.getFullYear() % 100}.${now.getMonth() + 1}.${now.getDate()}${now.getHours()}`;
        }
    }

    // Replace all version strings
    const oldVersionPattern = /\?v=\d+\.\d+\.\d+/g;
    content = content.replace(oldVersionPattern, `?v=${newVersion}`);
    writeFileSync(demoPath, content);
}

if (newVersion) {
    console.log(`   ✅ Version updated to ${newVersion}`);
}

console.log('\n📄 Copying documentation...');
const docsToCopy = ['AGENTS.md', 'README.md'];
for (const doc of docsToCopy) {
    if (existsSync(doc)) {
        copyFileSync(doc, join(outdir, doc));
        console.log(`   ✅ ${doc}`);
    }
}

// ============================================
// Note: Generate component-schema.json for AI agents
// ============================================
console.log('\n🤖 Generating component-schema.json for AI agents...');

const schemaComponentFiles = readdirSync('./src/components')
    .filter(f => f.startsWith('au-') && f.endsWith('.js'));

const schema = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://agentui.dev/component-schema.json',
    title: 'AgentUI Component Schema',
    description: 'Machine-readable schema for AI agent component discovery',
    version: packageJson.version,
    generatedAt: new Date().toISOString(),
    componentCount: schemaComponentFiles.length,
    components: {}
};

// Load describe catalog to determine hasDescribeMethod accurately
// describe() is inherited from AuElement and populated via describe-catalog.js
const catalogContent = readFileSync('./src/core/describe-catalog.js', 'utf-8');
const catalogTagMatches = catalogContent.match(/"(au-[a-z-]+)":\s*\{/g) || [];
const catalogTags = new Set(catalogTagMatches.map(m => m.match(/"(au-[a-z-]+)"/)[1]));

// Basic component info extracted from file analysis
for (const file of schemaComponentFiles) {
    const componentName = file.replace('.js', '');
    const content = readFileSync(join('./src/components', file), 'utf-8');

    // Extract observedAttributes — handles both patterns:
    //   static observedAttributes = ['a', 'b'];        (direct assignment)
    //   static get observedAttributes() { return [...]; }  (getter — used by au-layout)
    const attrsMatch = content.match(/static observedAttributes\s*=\s*\[([^\]]+)\]/)
        || content.match(/static get observedAttributes\s*\(\)\s*\{\s*return\s*\[([^\]]+)\]/);
    const attrs = attrsMatch
        ? attrsMatch[1].split(',').map(a => a.trim().replace(/['"]/g, ''))
        : [];

    // Extract baseClass
    const baseClassMatch = content.match(/static baseClass\s*=\s*['"]([^'"]+)['"]/);
    const baseClass = baseClassMatch ? baseClassMatch[1] : componentName;

    // Check if has describe() — all components inherit describe() from AuElement,
    // but full metadata is only available for components in the describe catalog
    const hasDescribe = catalogTags.has(componentName);

    // Extract events from catalog if available
    let events = [];
    if (hasDescribe) {
        // Parse events array from catalog for this component
        const catalogSection = catalogContent.split(`"${componentName}"`)[1];
        if (catalogSection) {
            const eventsMatch = catalogSection.match(/"events":\s*\[([\s\S]*?)\]/);
            if (eventsMatch) {
                const eventsStr = eventsMatch[1];
                events = (eventsStr.match(/"([^"]+)"/g) || []).map(e => e.replace(/"/g, ''));
            }
        }
    }

    schema.components[componentName] = {
        tag: componentName,
        baseClass,
        props: attrs,
        hasDescribeMethod: hasDescribe,
        events
    };
}

writeFileSync(
    join(outdir, 'component-schema.json'),
    JSON.stringify(schema, null, 2)
);
console.log(`   ✅ component-schema.json (${schemaComponentFiles.length} components)`);

console.log('\n✨ Framework build complete!');
