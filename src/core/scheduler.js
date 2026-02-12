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
 * Check if Scheduler API is supported
 */
export const supportsScheduler = 'scheduler' in globalThis;

/**
 * Schedule a task with priority
 * @param {() => T} callback 
 * @param {'user-blocking' | 'user-visible' | 'background'} priority 
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
 * Process items in chunks, yielding between chunks
 * Better than processInChunks because it uses scheduler.yield()
 * 
 * @param {T[]} items 
 * @param {(item: T, index: number) => void} process 
 * @param {number} chunkSize
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
 * Run background task (lowest priority, won't block UI)
 * @param {() => T} callback 
 * @returns {Promise<T>}
 */
export function runBackground(callback) {
    return scheduleTask(callback, 'background');
}

/**
 * Run user-blocking task (highest priority)
 * @param {() => T} callback 
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
