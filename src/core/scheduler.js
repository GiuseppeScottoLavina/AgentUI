/**
 * @fileoverview Task Scheduler API 
 * 
 * Uses scheduler.postTask() for priority-based scheduling.
 * Falls back to setTimeout if not supported.
 * 
 * Priority levels:
 * - 'user-blocking': Highest priority (input handlers)
 * - 'user-visible': Medium priority (rendering)
 * - 'background': Lowest priority (analytics, prefetch)
 * 
 * Usage:
 * await scheduleTask(() => heavyComputation(), 'background');
 * await yieldToMain();
 */

/**
 * Whether the native Scheduler API (scheduler.postTask) is available.
 * @type {boolean}
 */
export const supportsScheduler = 'scheduler' in globalThis;

/**
 * Schedule a task with priority.
 * @template T
 * @param {() => T} callback - Task to schedule
 * @param {'user-blocking' | 'user-visible' | 'background'} [priority='user-visible'] - Task priority
 * @returns {Promise<T>}
 */
export async function scheduleTask(callback, priority = 'user-visible') {
    if (supportsScheduler) {
        return globalThis.scheduler.postTask(callback, { priority });
    }

    // Fallback with setTimeout based on priority
    const delay = priority === 'user-blocking' ? 0 :
        priority === 'user-visible' ? 0 : 1;

    return new Promise(resolve => {
        setTimeout(() => resolve(callback()), delay);
    });
}

/**
 * Yield to main thread (allow input/rendering)
 * @returns {Promise<void>}
 */
export async function yieldToMain() {
    if (supportsScheduler && 'yield' in globalThis.scheduler) {
        return globalThis.scheduler.yield();
    }

    // Fallback: yield with setTimeout
    return new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * Process items in chunks, yielding between chunks.
 * Prefer over `processInChunks` because it uses native `scheduler.yield()` when available.
 *
 * @template T
 * @param {T[]} items - Array of items to process
 * @param {(item: T, index: number) => void} process - Callback for each item
 * @param {number} [chunkSize=50] - Items per chunk before yielding
 * @returns {Promise<void>}
 */
export async function processWithYield(items, process, chunkSize = 50) {
    for (let i = 0; i < items.length; i++) {
        process(items[i], i);

        // Yield every chunk
        if ((i + 1) % chunkSize === 0) {
            await yieldToMain();
        }
    }
}

/**
 * Run background task (lowest priority, won't block UI).
 * @template T
 * @param {() => T} callback - Task to run in background
 * @returns {Promise<T>}
 */
export function runBackground(callback) {
    return scheduleTask(callback, 'background');
}

/**
 * Run user-blocking task (highest priority).
 * @template T
 * @param {() => T} callback - Task to run immediately
 * @returns {Promise<T>}
 */
export function runImmediate(callback) {
    return scheduleTask(callback, 'user-blocking');
}

/**
 * Wait for next browser paint (double-rAF pattern)
 * Use for CSS animation triggers after DOM changes.
 * This ensures the browser has completed layout/paint before applying
 * additional classes that would trigger transitions.
 * 
 * @returns {Promise<void>}
 * @example
 * // Trigger CSS animation after DOM change
 * element.classList.add('is-open');
 * await afterPaint();
 * element.classList.add('is-visible'); // Now transition will animate
 */
export function afterPaint() {
    return new Promise(resolve => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
    });
}
