/**
 * @fileoverview Render Utilities for Large-Scale Applications
 * 
 * Optimizes rendering for complex apps with thousands of components.
 * 
 * Features:
 * - requestAnimationFrame batching
 * - Lazy component rendering
 * - Intersection Observer for viewport-based rendering
 * - Memoization for expensive computations
 */

/**
 * Batches multiple DOM update callbacks into a single animation frame
 * to prevent layout thrashing in complex updates.
 *
 * @class
 * @private
 */
class RenderScheduler {
    /** @type {Function[]} Queued render callbacks */
    #queue = [];
    /** @type {boolean} Whether a rAF is already scheduled */
    #scheduled = false;

    /**
     * Schedule a render callback for the next animation frame.
     * Multiple calls within the same frame are batched together.
     * @param {Function} callback - DOM update function to execute
     */
    schedule(callback) {
        this.#queue.push(callback);

        if (!this.#scheduled) {
            this.#scheduled = true;
            requestAnimationFrame(() => this.#flush());
        }
    }

    /**
     * Flush all queued callbacks in a single animation frame.
     * @private
     */
    #flush() {
        const callbacks = this.#queue; // Swap, not copy (P1.4 perf fix)
        this.#queue = [];
        this.#scheduled = false;

        // Execute all callbacks in single frame
        for (const cb of callbacks) {
            try {
                cb();
            } catch (e) {
                console.error('[RenderScheduler] Error:', e);
            }
        }
    }
}

/** @type {RenderScheduler} Singleton rAF-batched render scheduler */
export const rafScheduler = new RenderScheduler();
/** @deprecated Use `rafScheduler` instead to avoid name collision with scheduler.js */
export { rafScheduler as scheduler };

/**
 * Memoize expensive function calls with optional LRU eviction.
 * @param {Function} fn - Function to memoize
 * @param {Object} [options] - Memoization options
 * @param {Function} [options.keyFn=JSON.stringify] - Cache key derivation function
 * @param {number} [options.maxSize=Infinity] - Maximum cache entries (LRU eviction)
 * @returns {Function} Memoized function with same signature as `fn`
 */
export function memo(fn, options = {}) {
    const keyFn = options.keyFn ?? JSON.stringify;
    const maxSize = options.maxSize ?? Infinity;
    const cache = new Map();

    return (...args) => {
        const key = keyFn(args);

        if (cache.has(key)) {
            return cache.get(key);
        }

        const result = fn(...args);

        // LRU eviction: remove oldest entry if at capacity
        if (cache.size >= maxSize) {
            const oldestKey = cache.keys().next().value;
            cache.delete(oldestKey);
        }

        cache.set(key, result);
        return result;
    };
}

/**
 * Debounce function calls — delays execution until `delay` ms of silence.
 * @param {Function} fn - Function to debounce
 * @param {number} [delay=100] - Delay in ms
 * @returns {Function} Debounced function
 */
export function debounce(fn, delay = 100) {
    let timer = null;

    return (...args) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

/**
 * Throttle function calls — ensures at most one call per `limit` ms.
 * @param {Function} fn - Function to throttle
 * @param {number} [limit=100] - Minimum time between calls in ms
 * @returns {Function} Throttled function
 */
export function throttle(fn, limit = 100) {
    let inThrottle = false;

    return (...args) => {
        if (!inThrottle) {
            fn(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Create an IntersectionObserver for lazy/viewport-based rendering.
 * Automatically unobserves each element after it first becomes visible.
 * @param {Function} onVisible - Called with `(element)` when it enters viewport
 * @param {IntersectionObserverInit} [options={}] - IntersectionObserver options
 * @returns {{ observe: (el: Element) => void, disconnect: () => void }}
 */
export function createVisibilityObserver(onVisible, options = {}) {
    const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                onVisible(entry.target);
                observer.unobserve(entry.target);
            }
        }
    }, {
        rootMargin: '100px',
        threshold: 0,
        ...options
    });

    return {
        observe: (el) => observer.observe(el),
        disconnect: () => observer.disconnect()
    };
}

/**
 * Batches DOM reads and writes to prevent layout thrashing.
 * Reads (measure) execute first, then writes (mutate), following the fastdom pattern.
 *
 * @class
 * @private
 */
class DomBatch {
    /** @type {Function[]} Queued read (measure) callbacks */
    #reads = [];
    /** @type {Function[]} Queued write (mutate) callbacks */
    #writes = [];
    /** @type {boolean} Whether a rAF is already scheduled */
    #scheduled = false;

    /**
     * Schedule a DOM read (measure).
     * @param {Function} fn - Read callback
     */
    read(fn) {
        this.#reads.push(fn);
        this.#schedule();
    }

    /**
     * Schedule a DOM write (mutate).
     * @param {Function} fn - Write callback
     */
    write(fn) {
        this.#writes.push(fn);
        this.#schedule();
    }

    /** @private */
    #schedule() {
        if (!this.#scheduled) {
            this.#scheduled = true;
            requestAnimationFrame(() => this.#flush());
        }
    }

    /** @private */
    #flush() {
        // Reads first (measure phase)
        let fn;
        while (fn = this.#reads.shift()) {
            try { fn(); } catch (e) { console.error(e); }
        }

        // Writes second (mutate phase)
        while (fn = this.#writes.shift()) {
            try { fn(); } catch (e) { console.error(e); }
        }

        this.#scheduled = false;

        // If more work was added during flush, schedule again
        if (this.#reads.length || this.#writes.length) {
            this.#schedule();
        }
    }
}

/** @type {DomBatch} Singleton DOM read/write batcher */
export const domBatch = new DomBatch();

/**
 * Chunk large array operations to avoid blocking the main thread.
 * Yields to the event loop between chunks via `setTimeout(0)`.
 * @param {Array} items - Array to process
 * @param {Function} processFn - Called with `(item, index)` for each item
 * @param {number} [chunkSize=100] - Items per chunk before yielding
 * @returns {Promise<void>} Resolves when all items are processed
 */
export async function processInChunks(items, processFn, chunkSize = 100) {
    for (let i = 0; i < items.length; i += chunkSize) {
        const chunk = items.slice(i, i + chunkSize);

        for (let j = 0; j < chunk.length; j++) {
            processFn(chunk[j], i + j);
        }

        // Yield to main thread between chunks
        await new Promise(r => setTimeout(r, 0));
    }
}
