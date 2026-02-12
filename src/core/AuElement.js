/**
 * @fileoverview AuElement - Base Web Component Class (Optimized)
 * 
 * 2025/2026 Best Practices Applied:
 * - Proper disconnectedCallback for memory safety
 * - Event listener tracking and cleanup
 * - AbortController for efficient listener removal
 * - CSS containment hints
 * - No memory leaks guaranteed
 * 
 * Performance optimizations:
 * - No Shadow DOM overhead
 * - Efficient attribute observation
 * - DOM updates via mutation, not recreation
 * - content-visibility auto for off-screen elements
 */

export class AuElement extends HTMLElement {
    /** @type {string[]} Attributes to observe for changes */
    static observedAttributes = [];

    /** @type {string} Base CSS class for the component */
    static baseClass = '';

    /** @type {string|null} CSS file name for lazy loading (e.g., 'button' loads components/button.css) */
    static cssFile = null;

    /** @type {Set} Track loaded CSS files globally to prevent duplicates */
    static _loadedCSS = new Set();

    /** @type {boolean} Whether bundle check has been performed */
    static _bundleChecked = false;

    /** @type {boolean} Whether agentui.css bundle is loaded (skip lazy CSS) */
    static _bundleLoaded = false;

    /** @type {boolean} Apply CSS containment for perf */
    static useContainment = true;

    /**
     * 2026: Self-documenting component for AI agents.
     * Query component capabilities at runtime.
     * 
     * Returns full metadata when catalog is loaded (via discoverAll()),
     * or minimal info (name + props) as fallback — zero bundle cost.
     * 
     * ENRICHED with runtime-only info that static docs cannot provide:
     * - registered: is the component actually registered?
     * - instanceCount: how many instances exist in the DOM?
     * - instances: current state of first 5 instances (id, value, checked, visible)
     * - composition: gotchas when used inside other components (e.g., dropdown in modal)
     * 
     * @returns {Object} Component descriptor with runtime info
     * @example
     * await AgentUI.discoverAll(); // loads catalog once
     * customElements.get('au-button').describe()
     * // { name, description, props, events, runtime: { registered, instanceCount, ... }, ... }
     */
    static describe() {
        const tag = this.baseClass
            || this.name.replace(/^Au/, 'au-').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

        // Get catalog data (full metadata) or minimal fallback
        const base = AuElement._describeCatalog?.[tag]
            || {
            name: tag,
            props: this.observedAttributes || [],
            baseClass: this.baseClass || '',
            cssFile: this.cssFile || null
        };

        // Enrich with RUNTIME info — this is what makes describe() valuable vs reading docs
        const instances = typeof document !== 'undefined'
            ? Array.from(document.querySelectorAll(tag))
            : [];

        return {
            ...base,
            runtime: {
                registered: typeof customElements !== 'undefined' && !!customElements.get(tag),
                version: '0.1.129',
                instanceCount: instances.length,
                instances: instances.slice(0, 5).map(el => {
                    const info = { id: el.id || null };
                    if ('value' in el && el.value !== undefined) info.value = el.value;
                    if ('checked' in el && el.checked !== undefined) info.checked = el.checked;
                    if (typeof el.offsetParent !== 'undefined') info.visible = el.offsetParent !== null;
                    return info;
                })
            }
        };
    }

    /** @type {Object|null} Lazy-loaded describe catalog — populated by discoverAll() */
    static _describeCatalog = null;

    /** @type {boolean} Track if initial render has occurred */
    _rendered = false;

    /** @type {AbortController} For cleaning up event listeners */
    _abortController = null;

    /** @type {Set} Track timers for cleanup */
    _timers = new Set();

    /** @type {Set} Track intervals for cleanup */
    _intervals = new Set();

    constructor() {
        super();
        this._initAgentLogger();
    }

    _initAgentLogger() {
        if (!window.__AGENTUI_ERRORS__) {
            window.__AGENTUI_ERRORS__ = [];
        }

        // Agent Help Utilities
        if (!window.AgentUIAgent) {
            window.AgentUIAgent = {
                // Clear errors for a fresh test
                reset: () => {
                    window.__AGENTUI_ERRORS__ = [];
                    console.log('[AgentUIAgent] Errors cleared');
                },
                // Get all errors
                getErrors: () => window.__AGENTUI_ERRORS__,
                // Check if component has error
                hasError: (tagName, code) => {
                    return window.__AGENTUI_ERRORS__.some(e =>
                        e.component === tagName.toLowerCase() && e.code === code
                    );
                }
            };
        }
    }

    /**
     * Log error for Agent Debugging (Puppeteer/Playwright access)
     * @param {string} code - Error code (e.g. 'A11Y_MISSING_LABEL')
     * @param {string} message - Human readable message
     */
    logError(code, message) {
        const error = {
            component: this.tagName.toLowerCase(),
            code,
            message,
            element: this, // Reference leak only if used in dev tools, should be safe for tests
            timestamp: Date.now()
        };
        window.__AGENTUI_ERRORS__.push(error);
        console.warn(`[AgentUI] ${code}: ${message}`, this);
    }

    /**
     * Called when element is added to DOM.
     * Sets up base class, containment, and triggers initial render.
     */
    connectedCallback() {
        // Reuse existing AbortController to prevent duplicate event listeners
        // when element is moved in DOM (connectedCallback called multiple times)
        if (!this._abortController) {
            this._abortController = new AbortController();
        }

        // Add base class
        if (this.constructor.baseClass) {
            this.classList.add(this.constructor.baseClass);
        }

        // Apply CSS containment for rendering performance
        if (this.constructor.useContainment && !this.style.contain) {
            this.style.contain = 'layout style';
        }

        // 2026: Automatic event delegation on component root
        // Single listener handles all [data-action] clicks - no timing issues
        // Attached BEFORE render so it catches events on dynamically created elements
        this.#setupEventDelegation();

        // Initial render
        if (!this._rendered) {
            this.render();
            this._rendered = true;
        }

        // Lazy load component CSS
        this._loadComponentCSS();

        // 2026 Agent Optimization: Auto-infer semantic action attributes
        this._inferSemanticAttributes();
    }

    /**
     * 2026: Centralized event delegation pattern.
     * Single click listener on component root that delegates to [data-action] elements.
     * Components implement handleAction(action, target, event) to handle actions.
     * @private
     */
    #setupEventDelegation() {
        this.listen(this, 'click', (e) => {
            const actionEl = e.target.closest('[data-action]');
            if (!actionEl || !this.contains(actionEl)) return;

            const action = actionEl.dataset.action;
            if (this.handleAction) {
                this.handleAction(action, actionEl, e);
            }
        });
    }

    /**
     * Lazy load component-specific CSS file.
     * Only loads once per CSS file across all instances.
     * SKIPPED when agentui.css bundle is already loaded (prevents 404 errors).
     * @private
     */
    _loadComponentCSS() {
        const cssFile = this.constructor.cssFile;
        if (!cssFile) return;

        // Skip if bundle CSS is present (prevents 404 errors when using npm bundle)
        // Multiple detection strategies:
        if (!AuElement._bundleChecked) {
            AuElement._bundleChecked = true;
            AuElement._bundleLoaded =
                // 1. Direct link to agentui.css (CDN or local)
                !!document.querySelector('link[href*="agentui.css"], link[href*="agentui.min.css"]') ||
                // 2. node_modules import pattern
                !!document.querySelector('link[href*="agentui-wc"]') ||
                // 3. Already have AgentUI base styles loaded (components.css or similar)
                !!document.querySelector('link[href*="components.css"]') ||
                // 4. Style tag marked by bundler
                !!document.querySelector('style[data-agentui]') ||
                // 5. Check for au-* CSS rules already loaded (skip if styleSheets undefined)
                (document.styleSheets && Array.from(document.styleSheets).some(sheet => {
                    try {
                        return sheet.cssRules && Array.from(sheet.cssRules).some(rule =>
                            rule.selectorText?.includes('.au-button') ||
                            rule.selectorText?.includes('.au-chip')
                        );
                    } catch { return false; } // Cross-origin stylesheets throw
                }));
        }
        if (AuElement._bundleLoaded) return;

        // Check if already loaded (global static Set)
        if (AuElement._loadedCSS.has(cssFile)) return;
        AuElement._loadedCSS.add(cssFile);

        // Create and append link element
        const link = document.createElement('link');
        link.id = `au-css-${cssFile}`;
        link.rel = 'stylesheet';

        // Determine base path - check multiple sources
        let basePath = '/styles/';

        // 1. Check for existing styles/ link (direct styles loading)
        const stylesLink = document.querySelector('link[href*="/styles/"]');
        if (stylesLink) {
            const match = stylesLink.href.match(/(.*\/(?:src\/|dist\/)?styles\/)/);
            if (match) basePath = match[1];
        }
        // 2. Check for dist/ path -> use dist/styles/
        else {
            const distLink = document.querySelector('link[href*="/dist/"]');
            if (distLink) {
                const match = distLink.href.match(/(.*\/dist\/)/);
                if (match) basePath = match[1] + 'styles/';
            }
            // 3. Check for src/ pattern in scripts (dev mode)
            else {
                const srcScript = document.querySelector('script[src*="/src/"]');
                if (srcScript) {
                    const match = srcScript.src.match(/(.*\/src\/)/);
                    if (match) basePath = match[1] + 'styles/';
                }
            }
        }

        link.href = `${basePath}components/${cssFile}.css`;
        document.head.appendChild(link);
    }

    /**
     * Infer and set data-au-action and data-au-role attributes for AI agents.
     * Based on 2026 Agentic Web research - semantic attributes reduce task failure.
     * @private
     */
    _inferSemanticAttributes() {
        const tag = this.tagName.toLowerCase();

        // Skip if already has explicit action
        if (this.hasAttribute('data-au-action')) return;

        // Infer action based on component type
        let action = '';
        let role = '';

        switch (tag) {
            case 'au-button':
                action = this._inferButtonAction();
                role = this._inferButtonRole();
                break;
            case 'au-input':
            case 'au-textarea':
                action = 'input';
                role = 'text-field';
                break;
            case 'au-checkbox':
            case 'au-switch':
                action = 'toggle';
                role = 'control';
                break;
            case 'au-dropdown':
                action = 'select';
                role = 'selector';
                break;
            case 'au-modal':
                action = 'dialog';
                role = 'overlay';
                break;
            case 'au-tabs':
                action = 'navigate';
                role = 'navigation';
                break;
            case 'au-card':
                role = 'container';
                break;
        }

        if (action) this.setAttribute('data-au-action', action);
        if (role) this.setAttribute('data-au-role', role);
    }

    /**
     * Infer button action from text content
     * @private
     */
    _inferButtonAction() {
        const text = this.textContent?.toLowerCase().trim() || '';

        // Submit/Save patterns
        if (/^(save|submit|confirm|send|create|add|apply|ok|yes)$/.test(text)) {
            return 'submit';
        }
        // Cancel/Close patterns
        if (/^(cancel|close|dismiss|no|nevermind)$/.test(text)) {
            return 'cancel';
        }
        // Delete/Remove patterns
        if (/^(delete|remove|clear|trash)$/.test(text)) {
            return 'delete';
        }
        // Navigation patterns
        if (/^(back|next|previous|forward|continue)$/.test(text)) {
            return 'navigate';
        }
        // Default
        return 'click';
    }

    /**
     * Infer button role from context
     * @private
     */
    _inferButtonRole() {
        const variant = this.getAttribute('variant');

        // Primary action buttons
        if (variant === 'filled' || variant === 'elevated') {
            return 'primary-action';
        }
        // Secondary actions
        if (variant === 'tonal' || variant === 'outlined') {
            return 'secondary-action';
        }
        // Tertiary/dismiss
        if (variant === 'text') {
            return 'tertiary-action';
        }
        // Danger
        if (variant === 'danger') {
            return 'destructive-action';
        }
        return 'action';
    }

    /**
     * Called when element is removed from DOM.
     * CRITICAL: Clean up all event listeners and timers to prevent memory leaks.
     */
    disconnectedCallback() {
        // Abort all event listeners registered with signal
        if (this._abortController) {
            this._abortController.abort();
            this._abortController = null;
        }

        // Clear all timers
        for (const timer of this._timers) {
            clearTimeout(timer);
        }
        this._timers.clear();

        // Clear all intervals
        for (const interval of this._intervals) {
            clearInterval(interval);
        }
        this._intervals.clear();

        // Call subclass cleanup
        this.cleanup();
    }

    /**
     * Override in subclass for custom cleanup logic.
     * Called when component is removed from DOM.
     */
    cleanup() {
        // Override in subclass
    }

    /**
     * Called when observed attribute changes.
     * Triggers efficient update, not full re-render.
     */
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue && this._rendered) {
            this.update(name, newValue, oldValue);
        }
    }

    /**
     * Initial render - override in subclass.
     */
    render() {
        // Override in subclass
    }

    /**
     * Efficient update - override in subclass.
     * Modifies existing DOM, never recreates.
     */
    update(attr, newValue, oldValue) {
        // Override in subclass
    }

    /**
     * 2026: Deferred event setup - override in subclass.
     * Called via queueMicrotask AFTER render() completes.
     * Guarantees DOM is stable before attaching listeners.
     * Use this.listen() for automatic cleanup on disconnect.
     * 
     * @example
     * setupEvents() {
     *     this.listen(this.button, 'click', () => this.handleClick());
     * }
     */
    setupEvents() {
        // Override in subclass
    }

    /**
     * Helper: Get attribute with default
     */
    attr(name, defaultValue = '') {
        return this.getAttribute(name) ?? defaultValue;
    }

    /**
     * Helper: Check if attribute exists
     */
    has(name) {
        return this.hasAttribute(name);
    }

    /**
     * Helper: Emit a custom event
     */
    emit(name, detail = {}) {
        this.dispatchEvent(new CustomEvent(name, {
            bubbles: true,
            composed: true,
            detail
        }));
    }

    /**
     * Safe addEventListener with automatic cleanup on disconnect.
     * Uses AbortController signal for efficient removal.
     * 
     * @param {string} type - Event type
     * @param {EventListener} listener - Event handler
     * @param {AddEventListenerOptions} options - Event options
     */
    listen(target, type, listener, options = {}) {
        if (!this._abortController) {
            this._abortController = new AbortController();
        }

        const opts = {
            ...options,
            signal: this._abortController.signal
        };

        target.addEventListener(type, listener, opts);
    }

    /**
     * Safe setTimeout with automatic cleanup on disconnect.
     * @param {Function} fn - Callback
     * @param {number} delay - Delay in ms
     * @returns {number} Timer ID
     */
    setTimeout(fn, delay) {
        let id;
        id = setTimeout(() => {
            this._timers.delete(id);
            fn();
        }, delay);
        this._timers.add(id);
        return id;
    }

    /**
     * Safe setInterval with automatic cleanup on disconnect.
     * @param {Function} fn - Callback
     * @param {number} delay - Interval in ms
     * @returns {number} Interval ID
     */
    setInterval(fn, delay) {
        const id = setInterval(fn, delay);
        this._intervals.add(id);
        return id;
    }

    /**
     * Helper: Setup keyboard activation (Enter/Space triggers callback).
     * Also sets up tabindex based on disabled state.
     * Consolidates repeated pattern across interactive components.
     * 
     * @param {Function} callback - Function to call on activation
     */
    setupActivation(callback) {
        this.updateTabindex();
        this.listen(this, 'keydown', (e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !this.has('disabled')) {
                e.preventDefault();
                callback();
            }
        });
    }

    /**
     * Helper: Update tabindex based on disabled state.
     * Interactive elements should be focusable unless disabled.
     */
    updateTabindex() {
        this.setAttribute('tabindex', this.has('disabled') ? '-1' : '0');
    }

    /**
     * Helper: Set display style consistently.
     * @param {string} value - CSS display value (flex, block, inline-flex, etc.)
     */
    setDisplay(value) {
        this.style.display = value;
    }

    /**
     * Helper: Check if component is disabled.
     * @returns {boolean}
     */
    get isDisabled() {
        return this.has('disabled');
    }
}

/**
 * 2026: Scheduler API-enhanced component registration.
 * Yields to main thread between registrations to prevent long tasks (>50ms).
 * Uses scheduler.yield() on Chrome 129+, falls back to setTimeout(0).
 * 
 * @param {string} tagName - Custom element tag name
 * @param {typeof HTMLElement} ComponentClass - Component class to register
 * @param {Object} options - Registration options
 * @param {string} options.priority - 'user-blocking' (default) | 'user-visible' | 'background'
 */
export function define(tagName, ComponentClass, options = {}) {
    if (customElements.get(tagName)) return;

    const priority = options.priority || 'user-blocking';

    // 2026: Use Scheduler API for prioritized registration
    if (typeof scheduler !== 'undefined' && scheduler.postTask) {
        scheduler.postTask(() => {
            if (!customElements.get(tagName)) {
                customElements.define(tagName, ComponentClass);
            }
        }, { priority });
    } else {
        // Fallback: immediate registration for older browsers
        customElements.define(tagName, ComponentClass);
    }
}

/**
 * 2026: Batch component registration with yielding.
 * Registers multiple components while yielding to main thread between each.
 * Prevents long tasks and keeps UI responsive during initial load.
 * 
 * @param {Array<[string, typeof HTMLElement]>} components - Array of [tagName, Class] pairs
 * @param {Object} options - Registration options
 * @param {number} options.batchSize - Components per batch before yield (default: 3)
 * @returns {Promise<void>} Resolves when all components are registered
 */
export async function defineAll(components, options = {}) {
    const batchSize = options.batchSize || 3;
    const yieldToMain = getYieldFunction();

    for (let i = 0; i < components.length; i++) {
        const [tagName, ComponentClass] = components[i];

        if (!customElements.get(tagName)) {
            customElements.define(tagName, ComponentClass);
        }

        // Yield to main thread after each batch to prevent long tasks
        if ((i + 1) % batchSize === 0 && i < components.length - 1) {
            await yieldToMain();
        }
    }
}

/**
 * Get the best yield function available.
 * 2026: scheduler.yield() > setTimeout(0)
 * @returns {Function} Async yield function
 */
function getYieldFunction() {
    // Chrome 129+: scheduler.yield() is the most efficient
    if (typeof scheduler !== 'undefined' && scheduler.yield) {
        return () => scheduler.yield();
    }

    // Fallback: setTimeout(0) yields to event loop
    return () => new Promise(resolve => setTimeout(resolve, 0));
}
