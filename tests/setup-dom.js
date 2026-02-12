/**
 * @fileoverview Shared test setup for linkedom DOM environment
 * 
 * This file provides a shared linkedom DOM instance for all tests.
 * It must be imported before any component imports to ensure consistent
 * globalThis state across all test files.
 * 
 * Usage in test files:
 * import '../setup-dom.js'; // First import!
 * import { AuButton } from '../../src/components/au-button.js';
 */

import { parseHTML } from 'linkedom';

// Create shared DOM instance
const dom = parseHTML(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Test</title>
</head>
<body></body>
</html>`);

// Set up globals only once
if (!globalThis.__testDomInitialized) {
    globalThis.__testDomInitialized = true;

    globalThis.window = dom.window;
    globalThis.document = dom.document;
    globalThis.customElements = dom.customElements;
    globalThis.HTMLElement = dom.HTMLElement;
    globalThis.Node = dom.Node || globalThis.Node;
    globalThis.Element = dom.Element || globalThis.Element;
    globalThis.DocumentFragment = dom.DocumentFragment || globalThis.DocumentFragment;

    // Mock requestAnimationFrame
    globalThis.requestAnimationFrame = (cb) => {
        cb(Date.now());
        return 0;
    };
    globalThis.cancelAnimationFrame = () => { };

    // Mock getComputedStyle
    globalThis.getComputedStyle = () => ({
        position: 'static',
        overflow: 'visible',
        getPropertyValue: () => ''
    });

    // Mock Web Animations API
    if (!dom.HTMLElement.prototype.animate) {
        dom.HTMLElement.prototype.animate = function (keyframes, options) {
            return {
                finished: Promise.resolve(),
                cancel: () => { },
                play: () => { },
                pause: () => { },
                onfinish: null
            };
        };
    }

    // Mock IntersectionObserver
    globalThis.IntersectionObserver = class {
        constructor(callback) {
            this.callback = callback;
        }
        observe() { }
        unobserve() { }
        disconnect() { }
    };

    // Mock ResizeObserver
    globalThis.ResizeObserver = class {
        constructor(callback) {
            this.callback = callback;
        }
        observe() { }
        unobserve() { }
        disconnect() { }
    };

    // ─── LinkedOM Compatibility Patches ────────────────────────────────
    // These patch missing Web Platform APIs in LinkedOM so components
    // that use dialog/popover/dispatchEvent work in unit tests.

    const ElementProto = dom.HTMLElement.prototype;

    // CustomEvent polyfill (LinkedOM doesn't have it)
    if (!globalThis.CustomEvent || globalThis.CustomEvent === Event) {
        globalThis.CustomEvent = class CustomEvent extends Event {
            constructor(type, options = {}) {
                super(type, options);
                this.detail = options.detail;
            }
        };
    }

    // Fix dispatchEvent readonly eventPhase bug
    const origDispatch = ElementProto.dispatchEvent;
    if (origDispatch) {
        ElementProto.dispatchEvent = function (event) {
            try {
                return origDispatch.call(this, event);
            } catch (e) {
                if (e.message?.includes('eventPhase') || e.message?.includes('read only')) {
                    return true;
                }
                throw e;
            }
        };
    }

    // Dialog API (showModal/close)
    if (!ElementProto.showModal) {
        ElementProto.showModal = function () { this.setAttribute('open', ''); };
    }
    if (!ElementProto.close) {
        ElementProto.close = function () { this.removeAttribute('open'); };
    }

    // Popover API (showPopover/hidePopover)
    if (!ElementProto.showPopover) {
        ElementProto.showPopover = function () { };
    }
    if (!ElementProto.hidePopover) {
        ElementProto.hidePopover = function () { };
    }

    // Patch matches() for :popover-open (not supported by LinkedOM's css-select)
    const origMatches = ElementProto.matches;
    if (origMatches) {
        ElementProto.matches = function (selector) {
            if (selector.includes(':popover-open')) return false;
            return origMatches.call(this, selector);
        };
    }

    // Mock window.location
    if (!dom.window.location) {
        dom.window.location = {
            href: 'http://localhost/test',
            pathname: '/test',
            origin: 'http://localhost',
            hash: '',
            search: '',
        };
    }

    // Mock matchMedia
    if (!globalThis.matchMedia) {
        globalThis.matchMedia = () => ({
            matches: false,
            media: '',
            addEventListener: () => { },
            removeEventListener: () => { },
            addListener: () => { },
            removeListener: () => { },
        });
    }

    // Mock MutationObserver
    if (!globalThis.MutationObserver) {
        globalThis.MutationObserver = class MutationObserver {
            constructor() { }
            observe() { }
            disconnect() { }
            takeRecords() { return []; }
        };
    }
}

// Export for tests that need direct access
export const testDocument = dom.document;
export const testBody = dom.document.body;
export const testCustomElements = dom.customElements;

// Helper to reset body between tests
export function resetBody() {
    dom.document.body.innerHTML = '';
}
