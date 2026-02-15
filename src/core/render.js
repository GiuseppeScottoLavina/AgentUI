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
 * Batch multiple DOM updates into single animation frame
 * Prevents layout thrashing in complex updates
 */
class RenderScheduler {
    #queue = [];
    #scheduled = false;

    /**
     * Schedule a render callback for next animation frame
     * Multiple calls are batched together
     */
    schedule(callback) {
        this.#queue.push(callback);

        if (!this.#scheduled) {
            this.#scheduled = true;
            requestAnimationFrame(() => this.#flush());
        }
    }

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

export const rafScheduler = new RenderScheduler();
/** @deprecated Use rafScheduler instead to avoid collision with scheduler.js */
export { rafScheduler as scheduler };

/**
 * Memoize expensive function calls
 * @param {Function} fn - Function to memoize
 * @param {Object} [options] - Memoization options
 * @param {Function} [options.keyFn=JSON.stringify] - Key function for cache
 * @param {number} [options.maxSize] - Maximum cache entries (LRU eviction)
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
 * Debounce function calls
 * @param {Function} fn 
 * @param {number} delay - Delay in ms
 */
export function debounce(fn, delay = 100) {
    let timer = null;

    return (...args) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

/**
 * Throttle function calls
 * @param {Function} fn 
 * @param {number} limit - Minimum time between calls in ms
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
 * Create an intersection observer for lazy rendering
 * @param {Function} onVisible - Called when element becomes visible
 * @param {Object} options - IntersectionObserver options
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
 * Batch DOM reads and writes to prevent layout thrashing
 * Based on fastdom pattern
 */
class DomBatch {
    #reads = [];
    #writes = [];
    #scheduled = false;

    /**
     * Schedule a DOM read (measure)
     */
    read(fn) {
        this.#reads.push(fn);
        this.#schedule();
    }

    /**
     * Schedule a DOM write (mutate)
     */
    write(fn) {
        this.#writes.push(fn);
        this.#schedule();
    }

    #schedule() {
        if (!this.#scheduled) {
            this.#scheduled = true;
            requestAnimationFrame(() => this.#flush());
        }
    }

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

export const domBatch = new DomBatch();

/**
 * Chunk large array operations to avoid blocking main thread
 * @param {Array} items - Array to process
 * @param {Function} processFn - Function to call for each item
 * @param {number} chunkSize - Items per chunk
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
