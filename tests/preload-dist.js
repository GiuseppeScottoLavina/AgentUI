/**
 * @fileoverview Bun preload plugin for testing against dist builds.
 *
 * Uses onLoad to intercept src/ files and replace their contents with
 * re-exports from the corresponding dist/ files.
 * 
 * Usage:
 *   bun test --preload ./tests/setup-dom.js --preload ./tests/preload-dist.js tests/...
 *   # or via npm script:
 *   bun run test:dist
 */

import { plugin } from 'bun';
import { join } from 'path';

const projectRoot = join(import.meta.dir, '..');
const distDir = join(projectRoot, 'dist');
const esmBundle = join(distDir, 'agentui.esm.js');
const srcDir = join(projectRoot, 'src');

plugin({
    name: 'dist-redirect',
    setup(build) {
        // Intercept all .js files in src/ and replace with dist re-exports
        build.onLoad({ filter: /\/src\/(core|chunks|components)\/.*\.js$/ }, (args) => {
            const relPath = args.path.replace(srcDir, '');

            // src/core/*.js → re-export from ESM bundle
            if (relPath.startsWith('/core/') || relPath.startsWith('/chunks/')) {
                return {
                    contents: `export * from '${esmBundle}';`,
                    loader: 'js',
                };
            }

            // src/components/au-*.js → re-export from dist/components/au-*.js
            if (relPath.startsWith('/components/')) {
                const filename = relPath.split('/').pop();
                const distPath = join(distDir, 'components', filename);
                return {
                    contents: `export * from '${distPath}';`,
                    loader: 'js',
                };
            }
        });

        // Intercept src/index.js
        build.onLoad({ filter: /\/src\/index\.js$/ }, (args) => {
            return {
                contents: `export * from '${esmBundle}';`,
                loader: 'js',
            };
        });
    }
});

console.log('🔀 [preload-dist] Redirecting src/ → dist/ for testing');
