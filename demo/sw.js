/**
 * AgentUI Service Worker v2 - Service Worker Caching & Performance
 * 
 * Features:
 * - Content-hash based cache invalidation
 * - Stale-while-revalidate for optimal UX
 * - Precaching of critical assets
 * - Runtime caching with intelligent strategies
 * - Offline support
 * - Background sync ready
 */

// Cache version - update this or use build hash
const VERSION = '2.0.19';
const CACHE_PREFIX = 'agentui';
const PRECACHE_NAME = `${CACHE_PREFIX}-precache-${VERSION}`;
const RUNTIME_NAME = `${CACHE_PREFIX}-runtime-${VERSION}`;

// Critical assets to precache (fetched on install)
// App Shell Architecture: shell + all content fragments precached for instant load
const PRECACHE_ASSETS = [
    '/',
    '/index.html',           // App Shell
    // Content fragments (21 pages)
    '/content/home.html',
    '/content/installation.html',
    '/content/buttons.html',
    '/content/inputs.html',
    '/content/checkboxes.html',
    '/content/switches.html',
    '/content/radios.html',
    '/content/dropdowns.html',
    '/content/cards.html',
    '/content/layout.html',
    '/content/tabs.html',
    '/content/navbar.html',
    '/content/alerts.html',
    '/content/toasts.html',
    '/content/modals.html',
    '/content/progress.html',
    '/content/avatars.html',
    '/content/badges.html',
    '/content/chips.html',
    '/content/icons.html',
    '/content/enterprise.html',
    // Core assets
    '/dist/agentui.css',
    '/dist/routes/shell.js',
    '/dist/routes/shell-critical.js',
    '/dist/routes/shell-deferred.js',
    '/dist/routes/home.js',
    '/favicon.png'
];

// Cache strategies by asset type
const CACHE_STRATEGIES = {
    // Immutable assets (hashed files) - cache forever
    immutable: /\.(woff2?|ttf|otf)$/,
    // Static assets - stale-while-revalidate
    static: /\.(js|css|png|jpg|jpeg|webp|svg|ico)$/,
    // HTML - network-first with cache fallback
    document: /\.html?$|\/$/,
    // API calls - network only (no cache)
    api: /\/api\//
};

// Maximum age for runtime cache entries (7 days)
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
// Maximum entries in runtime cache
const MAX_ENTRIES = 100;

// ============================================
// LRU CACHE HELPER - Enforces maxEntries limit
// ============================================

/**
 * Cache with LRU eviction - ensures cache never exceeds maxEntries
 * This is called after every cache.put() to enforce limits automatically
 */
async function cacheWithLRU(cacheName, request, response, maxEntries = MAX_ENTRIES) {
    const cache = await caches.open(cacheName);
    await cache.put(request, response);

    // Enforce maxEntries with LRU (oldest entries first)
    const keys = await cache.keys();
    if (keys.length > maxEntries) {
        const toDelete = keys.slice(0, keys.length - maxEntries);
        await Promise.all(toDelete.map(key => cache.delete(key)));
        console.log(`[SW] LRU cleanup: removed ${toDelete.length} old entries from ${cacheName}`);
    }
}

/**
 * Cleanup stale entries older than MAX_AGE_MS
 */
async function cleanupStaleEntries(cacheName) {
    try {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        const now = Date.now();
        let removed = 0;

        for (const request of requests) {
            const response = await cache.match(request);
            const dateHeader = response?.headers.get('date');
            if (dateHeader) {
                const cacheTime = new Date(dateHeader).getTime();
                if (now - cacheTime > MAX_AGE_MS) {
                    await cache.delete(request);
                    removed++;
                }
            }
        }

        if (removed > 0) {
            console.log(`[SW] Stale cleanup: removed ${removed} expired entries from ${cacheName}`);
        }
    } catch (error) {
        console.warn('[SW] Stale cleanup failed:', error);
    }
}

// ============================================
// INSTALL - Precache critical assets
// ============================================
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(PRECACHE_NAME)
            .then((cache) => {
                console.log('[SW] Precaching critical assets');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => {
                console.log('[SW] Precache complete, activating immediately');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Precache failed:', error);
            })
    );
});

// ============================================
// ACTIVATE - Cleanup old caches
// ============================================
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => {
                            // Delete caches from this app but different version
                            return name.startsWith(CACHE_PREFIX) &&
                                name !== PRECACHE_NAME &&
                                name !== RUNTIME_NAME;
                        })
                        .map((name) => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                // Cleanup stale entries in runtime cache
                return cleanupStaleEntries(RUNTIME_NAME);
            })
            .then(() => {
                console.log('[SW] Claiming all clients');
                return self.clients.claim();
            })
    );
});

// ============================================
// FETCH - Intelligent routing
// ============================================
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip cross-origin requests
    if (url.origin !== self.location.origin) return;

    // Skip chrome-extension and other protocols
    if (!url.protocol.startsWith('http')) return;

    // Route to appropriate strategy
    if (CACHE_STRATEGIES.api.test(url.pathname)) {
        // API: Network only
        return;
    }

    if (CACHE_STRATEGIES.immutable.test(url.pathname)) {
        event.respondWith(cacheFirst(request, RUNTIME_NAME, true));
        return;
    }

    if (CACHE_STRATEGIES.document.test(url.pathname) || url.pathname === '/') {
        event.respondWith(networkFirst(request, PRECACHE_NAME));
        return;
    }

    if (CACHE_STRATEGIES.static.test(url.pathname)) {
        event.respondWith(staleWhileRevalidate(request, RUNTIME_NAME));
        return;
    }

    // Default: stale-while-revalidate
    event.respondWith(staleWhileRevalidate(request, RUNTIME_NAME));
});

// ============================================
// CACHE STRATEGIES
// ============================================

/**
 * Cache-first: Best for immutable assets
 * Returns cached response immediately, only fetches if not cached
 */
async function cacheFirst(request, cacheName, immutable = false) {
    const cached = await caches.match(request);
    if (cached) {
        return cached;
    }

    try {
        const response = await fetch(request);
        if (response.ok) {
            // Use LRU caching to enforce limits
            await cacheWithLRU(cacheName, request, response.clone());
        }
        return response;
    } catch (error) {
        console.error('[SW] Cache-first fetch failed:', error);
        // Return offline fallback if available
        return caches.match('/');
    }
}

/**
 * Network-first: Best for HTML documents
 * Always tries network, falls back to cache
 */
async function networkFirst(request, cacheName) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            // Use LRU caching to enforce limits
            await cacheWithLRU(cacheName, request, response.clone());
        }
        return response;
    } catch (error) {
        console.log('[SW] Network failed, serving from cache:', request.url);
        const cached = await caches.match(request);
        if (cached) {
            return cached;
        }
        // Ultimate fallback
        return caches.match('/');
    }
}

/**
 * Stale-while-revalidate: Best for static assets
 * Returns cache immediately, updates cache in background
 */
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    // Fetch in background regardless, with LRU enforcement
    const fetchPromise = fetch(request)
        .then(async (response) => {
            if (response.ok) {
                // Use LRU caching to enforce limits
                await cacheWithLRU(cacheName, request, response.clone());
            }
            return response;
        })
        .catch(() => null);

    // Return cached immediately if available
    if (cached) {
        return cached;
    }

    // Otherwise wait for network
    const response = await fetchPromise;
    if (response) {
        return response;
    }

    // Fallback
    return caches.match('/');
}

// ============================================
// MESSAGE HANDLING - Cache control from app
// ============================================
self.addEventListener('message', (event) => {
    const { type, payload } = event.data || {};

    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;

        case 'CLEAR_CACHE':
            event.waitUntil(
                caches.keys().then((names) =>
                    Promise.all(names.map((name) => caches.delete(name)))
                ).then(() => {
                    event.ports[0]?.postMessage({ success: true });
                })
            );
            break;

        case 'CACHE_URLS':
            if (payload?.urls) {
                event.waitUntil(
                    caches.open(RUNTIME_NAME).then((cache) =>
                        cache.addAll(payload.urls)
                    ).then(() => {
                        event.ports[0]?.postMessage({ success: true });
                    })
                );
            }
            break;

        case 'GET_CACHE_STATUS':
            event.waitUntil(
                getCacheStatus().then((status) => {
                    event.ports[0]?.postMessage(status);
                })
            );
            break;
    }
});

/**
 * Get cache status for debugging
 */
async function getCacheStatus() {
    const cacheNames = await caches.keys();
    const status = { version: VERSION, caches: {} };

    for (const name of cacheNames) {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        status.caches[name] = keys.length;
    }

    return status;
}

// ============================================
// PERIODIC CACHE CLEANUP
// ============================================
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'cache-cleanup') {
        event.waitUntil(cleanupOldCaches());
    }
});

async function cleanupOldCaches() {
    const cache = await caches.open(RUNTIME_NAME);
    const requests = await cache.keys();
    const now = Date.now();

    for (const request of requests) {
        const response = await cache.match(request);
        const dateHeader = response?.headers.get('date');
        if (dateHeader) {
            const cacheTime = new Date(dateHeader).getTime();
            if (now - cacheTime > MAX_AGE_MS) {
                await cache.delete(request);
            }
        }
    }
}

console.log(`[SW] AgentUI Service Worker v${VERSION} loaded`);
