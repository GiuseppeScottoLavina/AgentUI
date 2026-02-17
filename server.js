/**
 * AgentUI Dev Server with caching + Brotli/gzip compression
 * Optimized for Lighthouse 100 - 2026
 * Run: bun run server.js
 */

import { brotliCompressSync, constants as zlibConstants } from 'zlib';

const PORT = 5001;

// Cache durations
const CACHE_LONG = 'public, max-age=31536000, immutable'; // 1 year for versioned assets
const CACHE_SHORT = 'public, max-age=3600'; // 1 hour for HTML
const CACHE_REVALIDATE = 'public, max-age=0, must-revalidate'; // Always revalidate but allow bf-cache

// MIME types
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.json': 'application/json',
    '.txt': 'text/plain; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.webmanifest': 'application/manifest+json',
};

// Types that benefit from gzip
const COMPRESSIBLE_TYPES = ['.html', '.css', '.js', '.mjs', '.json', '.svg'];

// Preload hints for critical resources (Link headers)
const PRELOAD_HINTS = {
    '/demo/index.html': [
        '</dist/agentui.css>; rel=preload; as=style',
        '</assets/fonts/roboto-400.woff2>; rel=preload; as=font; type="font/woff2"; crossorigin',
        '</assets/banner-400.webp>; rel=preload; as=image; type="image/webp"',
    ],
};

function getContentType(path) {
    const ext = path.match(/\.[^.]+$/)?.[0] || '';
    return MIME_TYPES[ext] || 'application/octet-stream';
}

function getCacheControl(path) {
    const cleanPath = path.split('?')[0];

    // Immutable assets: versioned bundles, fonts, images
    if (cleanPath.startsWith('/dist/') ||
        cleanPath.startsWith('/assets/') ||
        cleanPath.endsWith('.woff2') ||
        cleanPath.endsWith('.woff') ||
        cleanPath.endsWith('.png') ||
        cleanPath.endsWith('.webp') ||
        cleanPath.endsWith('.jpg') ||
        cleanPath.endsWith('.ico')) {
        return CACHE_LONG;
    }

    // HTML: allow bf-cache but revalidate
    if (cleanPath.endsWith('.html') || cleanPath === '/' || cleanPath === '/index.html') {
        return CACHE_REVALIDATE;
    }

    // SW and manifest need revalidate
    if (cleanPath.endsWith('sw.js') || cleanPath.endsWith('manifest.json')) {
        return CACHE_REVALIDATE;
    }

    return CACHE_SHORT;
}

function shouldCompress(path) {
    const cleanPath = path.split('?')[0];
    const ext = cleanPath.match(/\.[^.]+$/)?.[0] || '';
    return COMPRESSIBLE_TYPES.includes(ext);
}

// Security headers applied to ALL responses
const SECURITY_HEADERS = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Cross-Origin-Opener-Policy': 'same-origin',
};

function getPreloadLinks(path) {
    return PRELOAD_HINTS[path] || [];
}

const MAX_PORT_RETRIES = 10;

function startServer(initialPort) {
    let port = initialPort;

    for (let i = 0; i < MAX_PORT_RETRIES; i++) {
        try {
            const server = Bun.serve({
                port: port,
                async fetch(req) {
                    const url = new URL(req.url);
                    let path = url.pathname;

                    // ===== CACHE MANAGEMENT ENDPOINTS =====

                    // Clear cache endpoint - sends headers to invalidate browser cache
                    // R8 Security: POST only to prevent CSRF via <img src="/-/clear-cache">
                    if (path === '/-/clear-cache') {
                        if (req.method !== 'POST') {
                            return new Response('Method Not Allowed', {
                                status: 405,
                                headers: { ...SECURITY_HEADERS, 'Allow': 'POST' },
                            });
                        }
                        return new Response(JSON.stringify({
                            status: 'ok',
                            message: 'Cache cleared. Reload the page with Ctrl+Shift+R',
                            timestamp: new Date().toISOString()
                        }), {
                            headers: {
                                ...SECURITY_HEADERS,
                                'Content-Type': 'application/json',
                                'Cache-Control': 'no-store, no-cache, must-revalidate',
                                'Clear-Site-Data': '"cache", "storage"',
                            },
                        });
                    }

                    // Health check
                    if (path === '/-/health') {
                        return new Response(JSON.stringify({ status: 'ok', port: server.port }), {
                            headers: { ...SECURITY_HEADERS, 'Content-Type': 'application/json' },
                        });
                    }

                    // Serve robots.txt inline (Lighthouse has issues with redirects)
                    if (path === '/robots.txt') {
                        const robotsTxt = `# robots.txt for AgentUI
User-agent: *
Allow: /

# Sitemap (uncomment when deployed with actual sitemap)
# Sitemap: https://agentui.dev/sitemap.xml
`;
                        return new Response(robotsTxt, {
                            headers: {
                                ...SECURITY_HEADERS,
                                'Content-Type': 'text/plain; charset=utf-8',
                                'Cache-Control': 'public, max-age=86400',
                                'X-Robots-Tag': 'all',
                            },
                        });
                    }

                    // Default to demo/index.html for root
                    if (path === '/' || path === '/index.html') {
                        path = '/demo/index.html';
                    }

                    // Serve demo directory (GitHub Pages compatibility)
                    if (path === '/demo' || path === '/demo/') {
                        path = '/demo/index.html';
                    }

                    // Serve index.html for App Shell pattern
                    if (path === '/shell.html') {
                        path = '/demo/index.html';
                    }

                    // Serve content fragments for dynamic loading
                    if (path.startsWith('/content/')) {
                        path = '/demo' + path;
                    }

                    // Serve PWA assets from demo/
                    if (path === '/sw.js' || path === '/manifest.json' ||
                        path === '/favicon.ico' || path === '/favicon.png') {
                        path = '/demo' + path;
                    }

                    // Security: prevent directory traversal (resolve-based, immune to encoding tricks)
                    const projectRoot = import.meta.dir;
                    // Decode URL-encoded characters first (%2e%2e → ..), then resolve
                    const decodedPath = decodeURIComponent(path);
                    const filePath = new URL('.' + decodedPath, 'file://' + projectRoot + '/').pathname;
                    if (!filePath.startsWith(projectRoot)) {
                        return new Response('Forbidden', { status: 403, headers: SECURITY_HEADERS });
                    }
                    const file = Bun.file(filePath);

                    if (await file.exists()) {
                        const contentType = getContentType(path);
                        const cacheControl = getCacheControl(path);
                        const acceptEncoding = req.headers.get('accept-encoding') || '';
                        const preloadLinks = getPreloadLinks(path);

                        // Build headers
                        const headers = {
                            ...SECURITY_HEADERS,
                            'Content-Type': contentType,
                            'Cache-Control': cacheControl,
                            // Enable bf-cache
                            'Vary': 'Accept-Encoding',
                        };

                        // Add Link preload headers for HTML
                        if (preloadLinks.length > 0) {
                            headers['Link'] = preloadLinks.join(', ');
                        }

                        // Brotli (priority) or Gzip compression for text assets
                        if (shouldCompress(path)) {
                            const content = await file.arrayBuffer();
                            const rawData = Buffer.from(content);

                            // Prefer Brotli (20-30% better compression than gzip)
                            if (acceptEncoding.includes('br')) {
                                try {
                                    const brotliCompressed = brotliCompressSync(rawData, {
                                        params: {
                                            [zlibConstants.BROTLI_PARAM_QUALITY]: 6, // Balance speed/compression
                                        }
                                    });

                                    return new Response(brotliCompressed, {
                                        headers: {
                                            ...headers,
                                            'Content-Encoding': 'br',
                                        },
                                    });
                                } catch {
                                    // Fallback to gzip if Brotli fails
                                }
                            }

                            // Fallback to gzip
                            if (acceptEncoding.includes('gzip')) {
                                const compressed = Bun.gzipSync(new Uint8Array(content));
                                return new Response(compressed, {
                                    headers: {
                                        ...headers,
                                        'Content-Encoding': 'gzip',
                                    },
                                });
                            }
                        }

                        return new Response(file, { headers });
                    }

                    return new Response('Not Found', { status: 404, headers: SECURITY_HEADERS });
                },
            });

            console.log(`🚀 AgentUI Dev Server running at http://localhost:${server.port}`);
            console.log(`📦 Lighthouse-optimized: Cache-Control, Gzip, Link preload`);
            console.log(`🧹 Clear cache: http://localhost:${server.port}/-/clear-cache`);
            return server;
        } catch (e) {
            if (e.code === 'EADDRINUSE') {
                console.warn(`⚠️ Port ${port} is busy, trying ${port + 1}...`);
                port++;
            } else {
                throw e;
            }
        }
    }

    console.error(`❌ Failed to start server after ${MAX_PORT_RETRIES} attempts. Last port tried: ${port}`);
    process.exit(1);
}

startServer(PORT);
