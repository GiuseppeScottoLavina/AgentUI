/**
 * @fileoverview au-lazy - Lazy Loading Component
 * 
 * Defers rendering until element is visible in viewport.
 * Uses IntersectionObserver for efficient detection.
 * 
 * Usage:
 * <au-lazy>
 *     <template>
 *         <heavy-component></heavy-component>
 *     </template>
 *     <div slot="placeholder">Loading...</div>
 * </au-lazy>
 */

import { AuElement, define } from '../core/AuElement.js';

export class AuLazy extends AuElement {
    static baseClass = 'au-lazy';
    static observedAttributes = ['root-margin', 'threshold'];


    #observer = null;
    #loaded = false;

    connectedCallback() {
        super.connectedCallback();

        const rootMargin = this.attr('root-margin', '200px');
        const threshold = parseFloat(this.attr('threshold', '0'));

        this.#observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !this.#loaded) {
                this.#load();
            }
        }, {
            rootMargin,
            threshold
        });

        this.#observer.observe(this);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.#observer?.disconnect();
    }

    render() {
        // Show placeholder initially
        const placeholder = this.querySelector('[slot="placeholder"]');
        if (placeholder) {
            placeholder.style.display = 'block';
        }

        // Hide template
        const template = this.querySelector('template');
        if (template) {
            template.style.display = 'none';
        }
    }

    #load() {
        this.#loaded = true;
        this.#observer?.disconnect();

        const template = this.querySelector('template');
        const placeholder = this.querySelector('[slot="placeholder"]');

        if (template) {
            // Clone and append template content
            const content = template.content.cloneNode(true);
            this.appendChild(content);
            template.remove();
        }

        if (placeholder) {
            placeholder.remove();
        }

        this.emit('au-loaded');
        this.classList.add('is-loaded');
    }

    /**
     * Force load immediately
     */
    load() {
        if (!this.#loaded) {
            this.#load();
        }
    }
}

define('au-lazy', AuLazy);
