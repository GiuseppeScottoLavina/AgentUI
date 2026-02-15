/**
 * @fileoverview View Transitions API Wrapper 
 * 
 * Provides smooth, GPU-accelerated page transitions.
 * Falls back gracefully if not supported.
 * 
 * Usage:
 * await transition(() => {
 *     document.getElementById('app').innerHTML = newContent;
 * });
 */

/**
 * Check if View Transitions API is supported
 */
export const supportsViewTransitions = 'startViewTransition' in document;

/**
 * Perform a view transition with fallback
 * @param {() => void | Promise<void>} updateCallback - DOM update function
 * @returns {Promise<void>}
 */
export async function transition(updateCallback) {
    if (supportsViewTransitions) {
        const viewTransition = document.startViewTransition(async () => {
            await updateCallback();
        });

        await viewTransition.finished;
    } else {
        // Fallback: just run the update
        await updateCallback();
    }
}

/**
 * Transition with custom animation classes
 * @param {() => void | Promise<void>} updateCallback 
 * @param {Object} options
 * @param {string} options.name - View transition name
 */
export async function transitionNamed(updateCallback, { name = 'page' } = {}) {
    if (supportsViewTransitions) {
        // Add transition name dynamically
        const style = document.createElement('style');
        style.textContent = `
            ::view-transition-old(${name}),
            ::view-transition-new(${name}) {
                animation-duration: 0.3s;
            }
        `;
        document.head.appendChild(style);

        try {
            await transition(updateCallback);
        } finally {
            try { style.remove(); } catch (_) { /* style may already be detached */ }
        }
    } else {
        await updateCallback();
    }
}

/**
 * Navigate with view transition
 * @param {string} path - Route path
 * @param {Function} render - Render function
 */
export async function navigateWithTransition(path, render) {
    await transition(() => {
        window.history.pushState({}, '', path);
        render();
    });
}
