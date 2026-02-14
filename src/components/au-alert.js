/**
 * @fileoverview au-alert - MD3 Alert Component
 */

import { AuElement, define } from '../core/AuElement.js';
import { html, safe } from '../core/utils.js';

export class AuAlert extends AuElement {
    static baseClass = 'au-alert';
    static observedAttributes = ['severity', 'dismissible'];

    #closeBtn = null;
    #originalContent = null;

    connectedCallback() {
        // Accessibility: set role and aria-live for screen readers (always safe)
        this.setAttribute('role', 'alert');
        this.setAttribute('aria-live', 'polite');

        // For AJAX-loaded content: defer entire initialization until HTML parser finishes
        // This is necessary because super.connectedCallback() calls render(),
        // and render needs the content to be available
        if (!this.#originalContent && !this.querySelector('.au-alert__content') && !this.innerHTML.trim()) {
            // Content not yet available, defer initialization
            setTimeout(() => {
                this.#originalContent = this.innerHTML;
                this.#initializeComponent();
            }, 0);
        } else {
            // Content already available (static HTML or already initialized)
            if (!this.#originalContent && !this.querySelector('.au-alert__content')) {
                this.#originalContent = this.innerHTML;
            }
            this.#initializeComponent();
        }
    }

    #initializeComponent() {
        super.connectedCallback();

        // Event delegation for close button
        this.listen(this, 'click', (e) => {
            if (e.target.classList.contains('au-alert__close')) {
                this.dismiss();
            }
        });
    }

    /**
     * Programmatically dismiss the alert
     */
    dismiss() {
        this.emit('au-dismiss');
        this.remove();
    }

    render() {
        // Idempotent: skip if already rendered
        if (this.querySelector('.au-alert__content')) {
            this.#updateClasses();
            return;
        }

        const severity = this.attr('severity', 'info');
        const dismissible = this.has('dismissible');

        // Icon names matching au-icon
        const iconNames = {
            success: 'success',
            error: 'error',
            warning: 'warning',
            info: 'info'
        };

        const content = this.#originalContent || '';
        const iconName = iconNames[severity] || iconNames.info;

        this.innerHTML = html`
            <au-icon name="${iconName}" size="24" class="au-alert__icon"></au-icon>
            <span class="au-alert__content">${safe(content)}</span>
            ${dismissible ? safe('<button class="au-alert__close" aria-label="Dismiss"><au-icon name="close" size="18"></au-icon></button>') : ''}
        `;

        this.#updateClasses();
    }

    update(attr, newValue, oldValue) {
        this.#updateClasses();
    }

    #updateClasses() {
        const severity = this.attr('severity', 'info');

        // Preserve custom classes while updating component classes
        const baseClasses = ['au-alert', `au-alert--${severity}`];
        baseClasses.forEach(cls => this.classList.add(cls));

        // Remove old severity classes
        Array.from(this.classList).forEach(cls => {
            if (cls.startsWith('au-alert--') && !baseClasses.includes(cls)) {
                this.classList.remove(cls);
            }
        });
    }
}

define('au-alert', AuAlert);
