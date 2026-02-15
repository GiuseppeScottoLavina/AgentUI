/**
 * @fileoverview au-repeat - Efficient List Rendering with Keyed Diffing
 * 
 * Renders arrays efficiently by only updating changed items.
 * Uses key-based reconciliation like React/Vue.
 * 
 * Usage:
 * <au-repeat id="list"></au-repeat>
 * 
 * const list = document.getElementById('list');
 * list.items = users;
 * list.keyFn = (user) => user.id;
 * list.renderItem = (user) => `<div>${user.name}</div>`;
 */

import { AuElement, define } from '../core/AuElement.js';
import { scheduler } from '../core/render.js';
import { html } from '../core/utils.js';

/**
 * Efficient list renderer with key-based reconciliation.
 * Only updates DOM nodes whose data has changed, similar to React/Vue keyed lists.
 *
 * @class
 * @extends AuElement
 * @element au-repeat
 */
export class AuRepeat extends AuElement {
    static baseClass = 'au-repeat';
    static observedAttributes = [];


    /** @private */
    #items = [];
    /** @private */
    #keyFn = (item, index) => index;
    /** @private */
    #renderItem = (item) => html`<div>${JSON.stringify(item)}</div>`;
    /** @private key → DOM element cache */
    #itemNodes = new Map(); // key -> DOM element

    /** @override */
    disconnectedCallback() {
        super.disconnectedCallback();
        // ML1: Clear DOM references to prevent memory leak
        this.#itemNodes.clear();
    }

    set items(arr) {
        const oldItems = this.#items;
        this.#items = arr || [];

        // Schedule batched update
        scheduler.schedule(() => this.#reconcile(oldItems));
    }

    get items() {
        return this.#items;
    }

    set keyFn(fn) {
        this.#keyFn = fn;
    }

    /**
     * Set custom render function for items.
     * @param {(item: *, index: number) => string} fn - Must return safe HTML.
     * @warning XSS: Use the html tagged template to auto-escape user data.
     *   import { html } from 'agentui/core/utils.js';
     *   list.renderItem = (item) => html`<div>${item.name}</div>`;
     */
    set renderItem(fn) {
        this.#renderItem = fn;
    }

    /** @override */
    render() {
        this.style.display = 'contents';
    }

    /**
     * Efficient reconciliation — only updates changed items.
     * @private
     * @param {Array} oldItems - Previous items array for diff.
     */
    #reconcile(oldItems) {
        const newKeys = new Set();
        const fragment = document.createDocumentFragment();

        // Build set of new keys
        for (let i = 0; i < this.#items.length; i++) {
            const key = this.#keyFn(this.#items[i], i);
            newKeys.add(key);
        }

        // Remove items that no longer exist
        for (const [key, node] of this.#itemNodes) {
            if (!newKeys.has(key)) {
                node.remove();
                this.#itemNodes.delete(key);
            }
        }

        // Add/update items
        let prevNode = null;

        for (let i = 0; i < this.#items.length; i++) {
            const item = this.#items[i];
            const key = this.#keyFn(item, i);

            let node = this.#itemNodes.get(key);

            if (!node) {
                // Create new node
                const wrapper = document.createElement('div');
                wrapper.innerHTML = this.#renderItem(item, i);
                node = wrapper.firstElementChild || wrapper;
                node.dataset.muKey = key;
                this.#itemNodes.set(key, node);
            } else {
                // Update existing node content
                const newContent = this.#renderItem(item, i);
                if (node.outerHTML !== newContent) {
                    const wrapper = document.createElement('div');
                    wrapper.innerHTML = newContent;
                    const newNode = wrapper.firstElementChild || wrapper;
                    newNode.dataset.muKey = key;
                    node.replaceWith(newNode);
                    this.#itemNodes.set(key, newNode);
                    node = newNode;
                }
            }

            // Position correctly
            if (prevNode) {
                if (node.previousElementSibling !== prevNode) {
                    prevNode.after(node);
                }
            } else {
                if (this.firstElementChild !== node) {
                    this.prepend(node);
                }
            }

            prevNode = node;
        }
    }

    /**
     * Get DOM element for a key
     */
    getElement(key) {
        return this.#itemNodes.get(key);
    }

    /**
     * Force full re-render
     */
    refresh() {
        this.#itemNodes.clear();
        this.innerHTML = '';
        scheduler.schedule(() => this.#reconcile([]));
    }
}

define('au-repeat', AuRepeat);
