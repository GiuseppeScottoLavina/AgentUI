/**
 * @fileoverview au-toast - MD3 Snackbar/Toast Notification
 */

import { AuElement, define } from '../core/AuElement.js';

export class AuToast extends AuElement {
    static baseClass = 'au-toast';
    static cssFile = null; // Toast CSS is in main bundle only (no separate snackbar.css)
    static observedAttributes = ['severity', 'duration', 'position'];

    #timeout = null;
    #originalContent = null;

    connectedCallback() {
        // Store content before render (must be before super because super calls render)
        if (!this.#originalContent && !this.querySelector('.au-toast__content')) {
            this.#originalContent = this.innerHTML;
        }

        super.connectedCallback();

        // Event delegation for close button
        this.listen(this, 'click', (e) => {
            if (e.target.classList.contains('au-toast__close')) {
                this.dismiss();
            }
        });

        // Auto-dismiss
        const duration = parseInt(this.attr('duration', '3000'));
        if (duration > 0) {
            this.#timeout = this.setTimeout(() => this.dismiss(), duration);
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        // Timer cleanup handled by AuElement
    }

    render() {
        // Idempotent: skip if already rendered
        if (this.querySelector('.au-toast__content')) {
            this.#updateClasses();
            return;
        }

        const content = this.#originalContent || '';

        this.innerHTML = `
            <span class="au-toast__content">${content}</span>
            <button class="au-toast__close" aria-label="Dismiss">✕</button>
        `;

        this.#updateClasses();
    }

    update(attr, newValue, oldValue) {
        this.#updateClasses();
    }

    #updateClasses() {
        const severity = this.attr('severity', 'info');
        const position = this.attr('position', 'bottom-center');

        const baseClasses = ['au-toast', `au-toast--${severity}`, `au-toast--${position}`];
        baseClasses.forEach(cls => this.classList.add(cls));

        Array.from(this.classList).forEach(cls => {
            if (cls.startsWith('au-toast--') && !baseClasses.includes(cls)) {
                this.classList.remove(cls);
            }
        });
    }

    dismiss() {
        this.emit('au-dismiss');
        this.classList.add('is-exiting');

        // Use animationend instead of setTimeout
        let removed = false;
        const cleanup = () => {
            if (!removed) {
                removed = true;
                this.remove();
            }
        };

        this.addEventListener('animationend', cleanup, { once: true });
        // Fallback in case animation doesn't fire (test env, reduced motion)
        this.setTimeout(cleanup, 200);
    }
}

define('au-toast', AuToast);

export class AuToastContainer extends AuElement {
    static baseClass = 'au-toast-container';

    connectedCallback() {
        super.connectedCallback();
        this.setAttribute('role', 'status');
        this.setAttribute('aria-live', 'polite');
    }
}

define('au-toast-container', AuToastContainer);

// Toast Manager for programmatic usage
export const Toast = {
    show(message, options = {}) {
        const position = options.position || 'bottom-center';
        let container = document.querySelector(`au-toast-container[position="${position}"]`);

        if (!container) {
            container = document.createElement('au-toast-container');
            container.setAttribute('position', position);
            document.body.appendChild(container);
        }

        const toast = document.createElement('au-toast');
        toast.textContent = message;

        if (options.severity) {
            toast.setAttribute('severity', options.severity);
        }
        if (options.duration) {
            toast.setAttribute('duration', options.duration.toString());
        }

        container.appendChild(toast);
        return toast;
    }
};

// ============================================
// EVENTBUS LISTENER AUTO-REGISTRATION
// Self-registers when this module is loaded (works with lazy loading)
// Uses hasListeners to prevent duplicate registration
// ============================================
import { bus, UIEvents, registerComponent } from '../core/bus.js';

if (typeof window !== 'undefined' && bus && !bus.hasListeners(UIEvents.TOAST_SHOW)) {
    bus.on(UIEvents.TOAST_SHOW, (data) => {
        Toast.show(data.message, data);
    });
}

// Register component capabilities for AI agent discovery
registerComponent('au-toast', {
    signals: [UIEvents.TOAST_SHOW, UIEvents.TOAST_DISMISS],
    options: {
        severities: ['info', 'success', 'warning', 'error'],
        positions: ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'],
        defaultDuration: 3000
    },
    description: 'MD3 Snackbar/Toast Notification component'
});
