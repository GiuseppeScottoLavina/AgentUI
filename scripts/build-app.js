/**
 * @fileoverview App Build - Demo Site & Page-Based Apps
 * 
 * Builds apps that use the au-page component system:
 * - Scans app/pages/*.html for page components
 * - Extracts dependencies from <script type="x-dependencies">
 * - Generates route bundles automatically
 * - Outputs to app-dist/
 * 
 * Run with: bun run build:app
 * 
 * @agent-pattern
 * This is the build agents should use when creating apps with AgentUI.
 * Just add pages to app/pages/ and run this build.
 */

import { build } from 'bun';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync, copyFileSync, unlinkSync, rmdirSync } from 'fs';
import { join, basename } from 'path';

const appDir = './app';
const pagesDir = join(appDir, 'pages');
const outdir = './app-dist';
const routesDir = join(outdir, 'routes');

console.log('🚀 Building App...\n');

// Ensure directories exist
mkdirSync(outdir, { recursive: true });
mkdirSync(routesDir, { recursive: true });

// ============================================
// 1. Discover Pages & Extract Dependencies
// ============================================
console.log('📄 Scanning pages...');

const pages = [];

if (existsSync(pagesDir)) {
    const pageFiles = readdirSync(pagesDir).filter(f => f.endsWith('.html'));

    for (const file of pageFiles) {
        const filePath = join(pagesDir, file);
        const content = readFileSync(filePath, 'utf-8');
        const routeName = basename(file, '.html');

        // Extract dependencies from <script type="x-dependencies">
        const depsMatch = content.match(/<script type="x-dependencies">([\s\S]*?)<\/script>/);
        const deps = depsMatch
            ? depsMatch[1].split(/[\n,]/).map(d => d.trim()).filter(d => d && d.startsWith('au-'))
            : [];

        // Extract title from <au-page title="...">
        const titleMatch = content.match(/<au-page[^>]*title="([^"]+)"/);
        const title = titleMatch ? titleMatch[1] : routeName;

        pages.push({ name: routeName, file, deps, title });
        console.log(`   📄 ${file} → ${deps.length} dependencies`);
    }
}

console.log(`   Found ${pages.length} pages\n`);

// ============================================
// 2. Generate Route Entry Files
// ============================================
console.log('📦 Generating route bundles...');
const generatedRoutesDir = './app/.generated/routes';
mkdirSync(generatedRoutesDir, { recursive: true });

for (const page of pages) {
    // Generate import statements for dependencies (relative from app/.generated/routes/)
    const imports = page.deps.map(dep =>
        `import '../../../dist/components/${dep}.js';`
    ).join('\n');

    const routeContent = `/**
 * Auto-generated route for: ${page.name}
 * Dependencies: ${page.deps.join(', ')}
 */
${imports}
`;

    writeFileSync(join(generatedRoutesDir, `${page.name}.js`), routeContent);
}

// Build route bundles
const routeEntryFiles = pages.map(p => join(generatedRoutesDir, `${p.name}.js`));

if (routeEntryFiles.length > 0) {
    const routeResult = await build({
        entrypoints: routeEntryFiles,
        outdir: routesDir,
        target: 'browser',
        format: 'esm',
        minify: true,
        splitting: true,
        sourcemap: 'none'
    });

    if (!routeResult.success) {
        console.error('❌ Route build failed:', routeResult.logs);
    } else {
        // Flatten nested structure if present
        const nestedDir = join(routesDir, 'app', '.generated', 'routes');
        if (existsSync(nestedDir)) {
            const files = readdirSync(nestedDir).filter(f => f.endsWith('.js'));
            for (const file of files) {
                let content = readFileSync(join(nestedDir, file), 'utf-8');
                content = content.replace(/from"\.\.\/\.\.\/\.\.\/\.\.\/dist\/components\//g, 'from"/dist/components/');
                content = content.replace(/from"\.\.\/\.\.\/\.\.\/chunk-/g, 'from"./chunk-');
                content = content.replace(/import"\.\.\/\.\.\/\.\.\/chunk-/g, 'import"./chunk-');
                writeFileSync(join(routesDir, file), content);
            }

            // Cleanup
            try {
                const allFiles = readdirSync(nestedDir);
                for (const f of allFiles) unlinkSync(join(nestedDir, f));
                rmdirSync(nestedDir);
                rmdirSync(join(routesDir, 'app', '.generated'));
                rmdirSync(join(routesDir, 'app'));
            } catch (e) { }
        }

        // Count files
        const routeFiles = readdirSync(routesDir).filter(f => !f.startsWith('chunk-') && f.endsWith('.js'));
        const chunkFiles = readdirSync(routesDir).filter(f => f.startsWith('chunk-'));

        let routeSize = 0, chunkSize = 0;
        for (const f of routeFiles) routeSize += statSync(join(routesDir, f)).size;
        for (const f of chunkFiles) chunkSize += statSync(join(routesDir, f)).size;

        console.log(`   ✅ ${routeFiles.length} routes (${(routeSize / 1024).toFixed(2)} KB)`);
        console.log(`   ✅ ${chunkFiles.length} shared chunks (${(chunkSize / 1024).toFixed(2)} KB)`);
    }
}

// ============================================
// 3. Copy Pages (for runtime loading)
// ============================================
console.log('\n📋 Copying pages...');
const appPagesDir = join(outdir, 'pages');
mkdirSync(appPagesDir, { recursive: true });

for (const page of pages) {
    copyFileSync(join(pagesDir, page.file), join(appPagesDir, page.file));
}
console.log(`   ✅ ${pages.length} pages copied`);

// ============================================
// 4. Copy App Shell
// ============================================
console.log('\n🏠 Building app shell...');
if (existsSync(join(appDir, 'index.html'))) {
    copyFileSync(join(appDir, 'index.html'), join(outdir, 'index.html'));
    console.log('   ✅ index.html');
}

// Copy assets
const assetsDir = join(appDir, 'assets');
const outAssetsDir = join(outdir, 'assets');
if (existsSync(assetsDir)) {
    mkdirSync(outAssetsDir, { recursive: true });
    const assets = readdirSync(assetsDir);
    for (const asset of assets) {
        copyFileSync(join(assetsDir, asset), join(outAssetsDir, asset));
    }
    console.log(`   ✅ ${assets.length} assets`);
}

// ============================================
// 5. Generate Page Manifest
// ============================================
console.log('\n📝 Generating manifest...');
const manifest = {
    pages: pages.map(p => ({
        route: p.name,
        title: p.title,
        dependencies: p.deps
    })),
    generated: new Date().toISOString()
};
writeFileSync(join(outdir, 'pages.json'), JSON.stringify(manifest, null, 2));
console.log('   ✅ pages.json');

// ============================================
// Summary
// ============================================
console.log('\n✨ App build complete!');
console.log(`   Output: ${outdir}/`);
console.log(`   Pages:  ${pages.length}`);
console.log(`   Serve:  npx serve ${outdir}`);
