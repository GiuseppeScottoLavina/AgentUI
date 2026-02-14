/**
 * @fileoverview au-virtual-list - Virtual List Component for Large Datasets
 * 
 * Renders only visible items for lists with thousands of elements.
 * 
 * Usage:
 * <au-virtual-list 
 *     item-height="50"
 *     .items="${largeArray}"
 *     .renderItem="${(item) => `<div>${item.name}</div>`}">
 * </au-virtual-list>
 */

import { AuElement, define } from '../core/AuElement.js';
import { throttle } from '../core/render.js';

import { html } from '../core/utils.js';

export class AuVirtualList extends AuElement {
    static baseClass = 'au-virtual-list';
    static cssFile = null; // CSS is inline/JS only
    static observedAttributes = ['item-height', 'buffer'];

    // Data

    #items = [];
    #renderItem = (item) => html`<div>${item}</div>`;

    // State
    #scrollTop = 0;
    #visibleStart = 0;
    #visibleEnd = 0;

    // Refs
    #container = null;
    #content = null;

    set items(arr) {
        this.#items = arr || [];
        this.#updateVisibleRange();
    }

    get items() {
        return this.#items;
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
        this.#updateVisibleRange();
    }

    connectedCallback() {
        super.connectedCallback();
        // Note: scroll listener is attached in render() to the internal viewport container
    }

    render() {
        const itemHeight = parseInt(this.attr('item-height', '50'));

        this.innerHTML = `
            <div class="au-virtual-list__viewport" style="
                height: 100%;
                overflow-y: auto;
                position: relative;
            ">
                <div class="au-virtual-list__content" style="
                    position: relative;
                ">
                    <div class="au-virtual-list__items"></div>
                </div>
            </div>
        `;

        this.#container = this.querySelector('.au-virtual-list__viewport');
        this.#content = this.querySelector('.au-virtual-list__content');

        // Throttled scroll handler - attached to the viewport container where scroll occurs
        const handleScroll = throttle(() => {
            this.#scrollTop = this.#container.scrollTop;
            this.#updateVisibleRange();
        }, 16); // ~60fps

        this.listen(this.#container, 'scroll', handleScroll);

        this.style.display = 'block';
        this.style.height = '400px';
        this.style.overflow = 'hidden';

        this.#updateVisibleRange();
    }

    #updateVisibleRange() {
        if (!this.#container || !this.#items.length) return;

        const itemHeight = parseInt(this.attr('item-height', '50'));
        const buffer = parseInt(this.attr('buffer', '5'));
        const viewportHeight = this.#container.clientHeight;

        // Calculate visible range
        const totalHeight = this.#items.length * itemHeight;
        this.#content.style.height = `${totalHeight}px`;

        const start = Math.max(0, Math.floor(this.#scrollTop / itemHeight) - buffer);
        const visibleCount = Math.ceil(viewportHeight / itemHeight) + buffer * 2;
        const end = Math.min(this.#items.length, start + visibleCount);

        // Only re-render if range changed
        if (start !== this.#visibleStart || end !== this.#visibleEnd) {
            this.#visibleStart = start;
            this.#visibleEnd = end;
            this.#renderVisibleItems();
        }
    }

    async #renderVisibleItems() {
        const itemHeight = parseInt(this.attr('item-height', '50'));
        const itemsContainer = this.querySelector('.au-virtual-list__items');

        if (!itemsContainer) return;

        // Render only visible items
        const visibleItems = this.#items.slice(this.#visibleStart, this.#visibleEnd);

        // For large batches, use scheduler.yield to prevent INP degradation
        // (Per 2024 Chrome Core Web Vitals research)
        const BATCH_SIZE = 50;
        const useYield = visibleItems.length > BATCH_SIZE && 'scheduler' in window;

        if (useYield) {
            // Batch render with yields for responsiveness
            const fragments = [];
            for (let batch = 0; batch < visibleItems.length; batch += BATCH_SIZE) {
                const batchItems = visibleItems.slice(batch, batch + BATCH_SIZE);

                fragments.push(...batchItems.map((item, i) => {
                    const index = this.#visibleStart + batch + i;
                    const top = index * itemHeight;
                    return `
                        <div class="au-virtual-list__item" style="
                            position: absolute;
                            top: ${top}px;
                            left: 0;
                            right: 0;
                            height: ${itemHeight}px;
                        " data-index="${index}" data-au-state="visible">
                            ${this.#renderItem(item, index)}
                        </div>
                    `;
                }));

                // Yield to browser between batches
                if (batch + BATCH_SIZE < visibleItems.length) {
                    await scheduler.yield();
                }
            }
            itemsContainer.innerHTML = fragments.join('');
        } else {
            // Standard render for small lists
            itemsContainer.innerHTML = visibleItems.map((item, i) => {
                const index = this.#visibleStart + i;
                const top = index * itemHeight;

                return `
                    <div class="au-virtual-list__item" style="
                        position: absolute;
                        top: ${top}px;
                        left: 0;
                        right: 0;
                        height: ${itemHeight}px;
                    " data-index="${index}" data-au-state="visible">
                        ${this.#renderItem(item, index)}
                    </div>
                `;
            }).join('');
        }
    }

    /**
     * Scroll to specific index
     */
    scrollToIndex(index) {
        const itemHeight = parseInt(this.attr('item-height', '50'));
        this.#container.scrollTop = index * itemHeight;
    }
}

define('au-virtual-list', AuVirtualList);
