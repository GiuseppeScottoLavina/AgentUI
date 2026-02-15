/**
 * @fileoverview au-doc-page - Self-Contained Documentation Page Component
 * 
 * This component encapsulates the entire 4-tab documentation structure,
 * making it trivial to add new component documentation pages.
 * 
 * Usage:
 * <au-doc-page 
 *   title="Button"
 *   selector="au-button"
 *   description="Interactive button component">
 *   
 *   <div slot="overview">... overview content ...</div>
 *   <div slot="api">... api tables ...</div>
 *   <div slot="styling">... css tokens ...</div>
 *   <div slot="examples">... example cards ...</div>
 * </au-doc-page>
 * 
 * Benefits:
 * - No JavaScript needed per page - tabs work automatically
 * - Consistent structure across all pages
 * - Single source of truth for documentation layout
 */

import { AuElement, define } from '../core/AuElement.js';
import { html, safe } from '../core/utils.js';

/**
 * Self-contained documentation page with a four-tab layout
 * (Overview, API, Styling, Examples) driven by slotted content.
 *
 * @class
 * @extends AuElement
 * @element au-doc-page
 * @slot overview - Component overview and description.
 * @slot api      - API tables for attributes, properties, methods, events.
 * @slot styling  - CSS design-token documentation.
 * @slot examples - Interactive example cards.
 */
export class AuDocPage extends AuElement {
    static baseClass = 'au-doc-page';
    static observedAttributes = ['title', 'selector', 'description'];


    /** @private Currently selected tab index. */
    #activeTab = 0;

    /** @override */
    connectedCallback() {
        super.connectedCallback();
        // Use requestAnimationFrame to ensure child elements are parsed
        requestAnimationFrame(() => this.#setupTabs());
    }

    /** @override */
    render() {
        const title = this.attr('title', 'Component');
        const selector = this.attr('selector', '');
        const description = this.attr('description', '');

        // Get slot content before replacing innerHTML
        const overviewSlot = this.querySelector('[slot="overview"]');
        const apiSlot = this.querySelector('[slot="api"]');
        const stylingSlot = this.querySelector('[slot="styling"]');
        const examplesSlot = this.querySelector('[slot="examples"]');

        const overviewContent = overviewSlot ? overviewSlot.innerHTML : '';
        const apiContent = apiSlot ? apiSlot.innerHTML : '';
        const stylingContent = stylingSlot ? stylingSlot.innerHTML : '';
        const examplesContent = examplesSlot ? examplesSlot.innerHTML : '';

        this.innerHTML = html`
            <h1 class="page-title">${title}</h1>
            <p class="page-subtitle">
                ${selector ? html`<code>&lt;${selector}&gt;</code> ` : ''}${description}
            </p>

            <au-tabs active="0" class="au-doc-page__tabs" style="margin-bottom: 24px;">
                <au-tab>OVERVIEW</au-tab>
                <au-tab>API</au-tab>
                <au-tab>STYLING</au-tab>
                <au-tab>EXAMPLES</au-tab>
            </au-tabs>

            <div class="au-doc-page__content au-doc-page__overview">
                ${safe(overviewContent)}
            </div>
            <div class="au-doc-page__content au-doc-page__api" style="display: none;">
                ${safe(apiContent)}
            </div>
            <div class="au-doc-page__content au-doc-page__styling" style="display: none;">
                ${safe(stylingContent)}
            </div>
            <div class="au-doc-page__content au-doc-page__examples" style="display: none;">
                ${safe(examplesContent)}
            </div>
        `;

        this.style.display = 'block';
    }

    /**
     * Wire tab-change events to show/hide corresponding content panels.
     * @private
     */
    #setupTabs() {
        const tabs = this.querySelector('.au-doc-page__tabs');
        const contents = this.querySelectorAll('.au-doc-page__content');

        if (tabs) {
            this.listen(tabs, 'au-tab-change', (e) => {
                this.#activeTab = e.detail.index;
                contents.forEach((content, i) => {
                    content.style.display = i === this.#activeTab ? 'block' : 'none';
                });
            });
        }
    }
}

define('au-doc-page', AuDocPage);
