/**
 * @fileoverview au-tabs - MD3 Tabs Component
 * 
 * Usage: 
 * <au-tabs active="0">
 *   <au-tab>Tab 1</au-tab>
 *   <au-tab>Tab 2</au-tab>
 * </au-tabs>
 * 
 * Features:
 * - Sliding indicator animation (CSS transitions)
 * - DOM-preserving updates (no recreation)
 */

import { AuElement, define } from '../core/AuElement.js';

/**
 * MD3 Tabs component with sliding indicator animation.
 *
 * @class
 * @extends AuElement
 * @element au-tabs
 * @fires au-tab-change - When the active tab changes, detail: `{ index }`
 * @slot default - `<au-tab>` children
 */
export class AuTabs extends AuElement {
    static baseClass = 'au-tabs';
    static cssFile = 'tabs';
    /** @type {string[]} */
    static observedAttributes = ['active'];


    #tabs = [];
    #list = null;

    /** @override */
    connectedCallback() {
        super.connectedCallback();
        // Listen for tab clicks via event delegation
        this.listen(this, 'click', (e) => {
            const tab = e.target.closest('au-tab');
            if (tab) {
                // Recalculate tabs array each time to handle dynamic changes
                // and cases where tabs were hidden during initial render
                const list = this.querySelector('.au-tabs__list');
                const currentTabs = list
                    ? Array.from(list.querySelectorAll('au-tab'))
                    : Array.from(this.querySelectorAll('au-tab'));
                const index = currentTabs.indexOf(tab);
                if (index !== -1) {
                    this.setAttribute('active', index.toString());
                }
            }
        });
    }

    /** @override */
    render() {
        // Idempotent: skip if already rendered
        if (this.querySelector('.au-tabs__list')) {
            this.#tabs = Array.from(this.querySelectorAll('au-tab'));
            this.#list = this.querySelector('.au-tabs__list');
            this.#updateActive();
            return;
        }

        // Create list wrapper for tabs (indicator is ::after pseudo-element, no DOM needed)
        this.#list = document.createElement('div');
        this.#list.className = 'au-tabs__list';
        this.#list.setAttribute('role', 'tablist');

        // Move existing au-tab children into list
        this.#tabs = Array.from(this.querySelectorAll('au-tab'));
        this.#tabs.forEach((tab) => {
            tab.setAttribute('role', 'tab');
            this.#list.appendChild(tab);
        });

        // NO DOM indicator element - using ::after pseudo-element via CSS
        this.appendChild(this.#list);

        this.#updateActive();
    }

    /**
     * @override
     * @param {string} attr
     * @param {string|null} newValue
     * @param {string|null} oldValue
     */
    update(attr, newValue, oldValue) {
        if (attr === 'active') {
            this.#updateActive();
            this.emit('au-tab-change', { index: parseInt(newValue) || 0 });
        }
    }

    /** @private */
    #updateActive() {
        const activeIndex = parseInt(this.attr('active', '0'));
        const tabCount = this.#tabs.length;

        // Update tab active states
        this.#tabs.forEach((tab, i) => {
            tab.classList.toggle('is-active', i === activeIndex);
            tab.setAttribute('aria-selected', i === activeIndex ? 'true' : 'false');
        });

        // Update indicator position via CSS custom properties (::after uses these)
        if (this.#list && tabCount > 0) {
            const width = 100 / tabCount;
            this.#list.style.setProperty('--indicator-width', `${width}%`);
            this.#list.style.setProperty('--indicator-left', `${activeIndex * width}%`);
        }
    }
}

/**
 * Individual tab element for use inside `<au-tabs>`.
 *
 * @class
 * @extends AuElement
 * @element au-tab
 */
export class AuTab extends AuElement {
    static baseClass = 'au-tabs__tab';

    /** @override */
    connectedCallback() {
        super.connectedCallback();
        this.setAttribute('tabindex', '0');
    }

    /** @override */
    render() {
        // Tab just wraps content, no transformation needed
    }
}

define('au-tabs', AuTabs);
define('au-tab', AuTab);
