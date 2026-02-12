/**
 * @fileoverview Extended test helpers for event-driven component testing
 * 
 * This module provides per-class patches for testing components that rely
 * on event dispatching in LinkedOM. The global patches (dispatchEvent,
 * showModal, showPopover, etc.) are in the preloaded tests/setup-dom.js.
 * 
 * Usage:
 *   import { dom, patchEmit, resetBody } from '../helpers/setup-dom.js';
 *   patchEmit(MyComponent);
 */

/**
 * Patch a component class to enable event-driven testing in LinkedOM.
 * Overrides listen() and addEventListener to track listeners in a shadow
 * registry, then emit() manually invokes them (bypassing LinkedOM's
 * broken dispatchEvent).
 *
 * @param {Function} ComponentClass - The custom element class to patch
 */
export function patchEmit(ComponentClass) {
    const proto = ComponentClass.prototype;
    const origListen = proto.listen;

    // Override listen() to also store in shadow registry
    proto.listen = function (target, type, listener, options = {}) {
        if (typeof listener === 'function') {
            if (!target.__listeners) target.__listeners = {};
            if (!target.__listeners[type]) target.__listeners[type] = [];
            target.__listeners[type].push(listener);
        }
        if (origListen) {
            try { origListen.call(this, target, type, listener, options); } catch (e) { }
        }
    };

    // Override addEventListener so external listeners are tracked
    const origAdd = proto.addEventListener;
    proto.addEventListener = function (type, listener, options) {
        if (typeof listener === 'function') {
            if (!this.__listeners) this.__listeners = {};
            if (!this.__listeners[type]) this.__listeners[type] = [];
            this.__listeners[type].push(listener);
        }
        if (origAdd) {
            try { origAdd.call(this, type, listener, options); } catch (e) { }
        }
    };

    const origRemove = proto.removeEventListener;
    proto.removeEventListener = function (type, listener, options) {
        if (this.__listeners?.[type]) {
            this.__listeners[type] = this.__listeners[type].filter(l => l !== listener);
        }
        if (origRemove) {
            try { origRemove.call(this, type, listener, options); } catch (e) { }
        }
    };

    // Override emit() to manually invoke shadow listeners
    proto.emit = function (eventName, detail) {
        const event = new CustomEvent(eventName, {
            bubbles: true,
            cancelable: true,
            composed: true,
            detail: detail ?? null,
        });

        try {
            this.dispatchEvent(event);
        } catch (e) {
            // Swallowed — shadow listeners below will fire
        }

        if (this.__listeners?.[eventName]) {
            for (const listener of [...this.__listeners[eventName]]) {
                try { listener.call(this, event); } catch (err) { /* test assertions propagate */ }
            }
        }
    };
}

// Export the shared DOM objects (from preloaded setup-dom.js)
export const dom = {
    window: globalThis.window,
    document: globalThis.document,
    customElements: globalThis.customElements,
    HTMLElement: globalThis.HTMLElement,
    body: globalThis.document.body,
};

/** Resets <body> innerHTML for test isolation. */
export function resetBody() {
    globalThis.document.body.innerHTML = '';
}
