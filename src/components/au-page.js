/**
 * au-page - Self-contained page component
 * 
 * Features:
 * - Declares route and title
 * - Declares dependencies (for auto-bundling)
 * - Contains template HTML
 * 
 * Usage in pages/*.html:
 * 
 *   <au-page route="buttons" title="Buttons">
 *     <script type="x-dependencies">
 *       au-button
 *       au-tabs
 *     </script>
 *     
 *     <template>
 *       <h1>Buttons</h1>
 *       ...
 *     </template>
 *   </au-page>
 * 
 * @agent-pattern
 * When creating a new page, create a single file in app/pages/
 * with this structure. The build system will auto-generate route bundles.
 */

import { AuElement, define } from '../core/AuElement.js';

class AuPage extends AuElement {
    static baseClass = 'au-page';
    static observedAttributes = ['route', 'title'];


    get route() {
        return this.attr('route', '');
    }

    get pageTitle() {
        return this.attr('title', '');
    }

    get dependencies() {
        const script = this.querySelector('script[type="x-dependencies"]');
        if (!script) return [];

        return script.textContent
            .split(/[\n,]/)
            .map(d => d.trim())
            .filter(d => d && d.startsWith('au-'));
    }

    connectedCallback() {
        super.connectedCallback();

        // If rendered directly (not via router), render template
        if (this.querySelector('template')) {
            this.render();
        }
    }

    render() {
        const template = this.querySelector('template');
        if (template) {
            // Clone template content
            const content = template.content.cloneNode(true);

            // Clear and append
            const script = this.querySelector('script[type="x-dependencies"]');
            this.innerHTML = '';
            if (script) this.appendChild(script); // Keep deps for debugging
            this.appendChild(content);
        }
    }
}

define('au-page', AuPage);
export { AuPage };
