/**
 * @fileoverview au-modal - MD3 Dialog Component  Native Dialog)
 * Uses native <dialog> element with showModal() for proper top-layer,
 * focus trapping, ESC handling, and backdrop - all built-in.
 * 
 * MD3 Reference: https://m3.material.io/components/dialogs
 */

import { AuElement, define } from '../core/AuElement.js';
import { html, safe } from '../core/utils.js';
import { afterPaint } from '../core/scheduler.js';

export class AuModal extends AuElement {
    static baseClass = 'au-modal';
    static cssFile = 'overlays';
    static observedAttributes = ['open', 'size'];

    /** @type {HTMLDialogElement|null} */
    #dialog = null;

    connectedCallback() {
        // Store user content only once, before first render
        if (!this.hasAttribute('data-rendered')) {
            this._userContent = this.innerHTML;
            this.setAttribute('data-rendered', 'true');
        }

        super.connectedCallback();

        // CRITICAL: Always setup listeners after super.connectedCallback()
        // because it resets the AbortController. The render() creates DOM,
        // but listeners must be attached here to survive disconnect/reconnect.
        this.#setupListeners();
    }

    render() {
        // Idempotent: check if already rendered via DOM structure
        if (this.querySelector('dialog')) return;

        const size = this.attr('size', 'md');
        const content = this._userContent || '';

        this.innerHTML = html`
            <dialog class="au-modal__dialog au-modal--${size}">
                <button class="au-modal__close" aria-label="Close">✕</button>
                <div class="au-modal__body">${safe(content)}</div>
            </dialog>
        `;

        this.#dialog = this.querySelector('dialog');
    }

    /**
     * Setup all event listeners. Called after every connectedCallback
     * to ensure listeners survive DOM disconnect/reconnect cycles.
     */
    #setupListeners() {
        this.#dialog = this.querySelector('dialog');
        if (!this.#dialog) return;

        // Native dialog 'close' event (fires on ESC, form[method=dialog], or .close())
        this.listen(this.#dialog, 'close', () => {
            this.removeAttribute('open');
            this.classList.remove('is-open', 'is-visible');
            document.body.style.overflow = '';
            this.emit('au-close');
        });

        // ESC key triggers 'cancel' event on dialog
        this.listen(this.#dialog, 'cancel', (e) => {
            e.preventDefault(); // Prevent default close to control animation
            this.close();
        });

        // Click on backdrop (::backdrop pseudo-element triggers click on dialog)
        this.listen(this.#dialog, 'click', (e) => {
            // Only close if clicking the dialog element itself (backdrop area)
            // not its children
            if (e.target === this.#dialog) {
                this.close();
            }
        });

        // Close button - MD3 standard X button in top-right
        const closeBtn = this.querySelector('.au-modal__close');
        if (closeBtn) {
            this.listen(closeBtn, 'click', () => {
                this.close();
            });
        }
    }

    update(attr, newValue, oldValue) {
        if (attr === 'open') {
            if (newValue !== null) {
                this.#showDialog();
            }
        }
    }

    #showDialog() {
        if (!this.#dialog || this.#dialog.open) return;

        this.classList.add('is-open');
        this.#dialog.showModal(); // Native top-layer, focus trap, backdrop!
        document.body.style.overflow = 'hidden';

        // Emit open event
        this.emit('au-open');

        // Trigger animation - MD3 requires emphasized-decelerate for enter
        afterPaint().then(() => this.classList.add('is-visible'));
    }

    /**
     * Open the modal dialog (public API)
     */
    open() {
        this.setAttribute('open', '');
    }

    /**
     * Close the modal dialog with animation (public API)
     */
    close() {
        if (!this.#dialog) return;

        // MD3: emphasized-accelerate for exit
        this.classList.remove('is-visible');

        // 2026: Use transitionend instead of setTimeout
        // In test environments (JSDOM/linkedom), transitionend won't fire, so use a flag
        let cleaned = false;
        const cleanup = () => {
            if (cleaned) return;
            cleaned = true;
            if (this.#dialog && this.#dialog.open) {
                this.#dialog.close();
            }
            this.removeAttribute('open');
            this.classList.remove('is-open');
            document.body.style.overflow = '';
            this.emit('au-close');
        };

        // Listen for transition end
        const dialog = this.#dialog;
        const onTransitionEnd = (e) => {
            if (e.target === dialog) {
                dialog.removeEventListener('transitionend', onTransitionEnd);
                cleanup();
            }
        };
        dialog.addEventListener('transitionend', onTransitionEnd);

        // Fallback: cleanup after expected transition time (200ms matches CSS)
        this.setTimeout(() => {
            dialog.removeEventListener('transitionend', onTransitionEnd);
            cleanup();
        }, 200);
    }
}

define('au-modal', AuModal);
