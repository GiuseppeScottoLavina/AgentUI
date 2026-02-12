/**
 * @fileoverview au-confirm - Programmatic Confirm Dialog
 * Agent-friendly confirm dialog with Promise-based API
 * 
 * Extends AuModal to leverage native <dialog> benefits:
 * - Backdrop blur
 * - ESC key handling (native)
 * - Focus trapping (native)
 * - Top-layer stacking (native)
 * 
 * @example
 * const ok = await auConfirm('Delete this item?');
 * if (ok) deleteItem();
 * 
 * @example
 * const ok = await auConfirm('Are you sure?', {
 *     title: 'Confirm Delete',
 *     confirmText: 'Delete',
 *     cancelText: 'Cancel',
 *     variant: 'danger'
 * });
 */

import { define } from '../core/AuElement.js';
import { escapeHTML } from '../core/utils.js';
import { AuModal } from './au-modal.js';

/**
 * @typedef {Object} ConfirmOptions
 * @property {string} [title] - Dialog title
 * @property {string} [confirmText='Confirm'] - Confirm button text
 * @property {string} [cancelText='Cancel'] - Cancel button text
 * @property {'primary'|'danger'|'warning'} [variant='primary'] - Button variant
 */

/** @type {AuConfirm|null} */
let activeConfirm = null;

/**
 * Show a confirm dialog and wait for user response
 * @param {string} message - Message to display
 * @param {ConfirmOptions} [options] - Configuration options
 * @returns {Promise<boolean>} - Resolves true if confirmed, false if cancelled
 */
export async function auConfirm(message, options = {}) {
    const {
        title = 'Confirm',
        confirmText = 'Confirm',
        cancelText = 'Cancel',
        variant = 'primary'
    } = options;

    // Remove any existing confirm dialog
    if (activeConfirm) {
        activeConfirm.remove();
    }

    return new Promise((resolve) => {
        const dialog = /** @type {AuConfirm} */ (document.createElement('au-confirm'));
        dialog.setAttribute('title', title);
        dialog.setAttribute('message', message);
        dialog.setAttribute('confirm-text', confirmText);
        dialog.setAttribute('cancel-text', cancelText);
        dialog.setAttribute('variant', variant);

        dialog.addEventListener('au-confirm', () => {
            dialog.remove();
            activeConfirm = null;
            resolve(true);
        });

        dialog.addEventListener('au-cancel', () => {
            dialog.remove();
            activeConfirm = null;
            resolve(false);
        });

        activeConfirm = dialog;
        document.body.appendChild(dialog);
        dialog.open();
    });
}

/**
 * AuConfirm extends AuModal to inherit native <dialog> benefits
 */
export class AuConfirm extends AuModal {
    static baseClass = 'au-confirm';
    static cssFile = 'overlays';
    static observedAttributes = ['title', 'message', 'confirm-text', 'cancel-text', 'variant', 'open', 'size'];

    /** @type {HTMLDialogElement|null} */
    #dialog = null;

    connectedCallback() {
        // Skip AuModal's content preservation - we generate our own
        // Go directly to AuElement's connectedCallback for listener setup
        if (!this.hasAttribute('data-rendered')) {
            this.setAttribute('data-rendered', 'true');
        }

        // Call grandparent (AuElement) connectedCallback
        Object.getPrototypeOf(AuModal.prototype).connectedCallback.call(this);

        // Note: listeners are set up in render() after dialog is created
    }

    render() {
        // Don't call super.render() - we have our own layout
        // Idempotent: if already rendered, just re-attach listeners (AbortController clears on disconnect)
        if (this.querySelector('dialog')) {
            this.#dialog = this.querySelector('dialog');
            this.#setupConfirmListeners();
            return;
        }

        const title = escapeHTML(this.attr('title', 'Confirm'));
        const message = escapeHTML(this.attr('message', 'Are you sure?'));
        const confirmText = escapeHTML(this.attr('confirm-text', 'Confirm'));
        const cancelText = escapeHTML(this.attr('cancel-text', 'Cancel'));
        const variant = this.attr('variant', 'primary');

        // Map variant to button variant
        const buttonVariant = variant === 'danger' ? 'danger' : 'filled';

        this.innerHTML = `
            <dialog class="au-confirm__dialog">
                <h3 class="au-confirm__title">${title}</h3>
                <p class="au-confirm__message">${message}</p>
                <div class="au-confirm__actions">
                    <au-button variant="text" data-action="cancel">${cancelText}</au-button>
                    <au-button variant="${buttonVariant}" data-action="confirm">${confirmText}</au-button>
                </div>
            </dialog>
        `;

        this.#dialog = this.querySelector('dialog');

        // Set up listeners after dialog is created
        this.#setupConfirmListeners();
    }

    /**
     * Handle actions from AuElement's centralized event delegation
     * This is called by #setupEventDelegation in AuElement when [data-action] elements are clicked
     */
    handleAction(action, target, event) {
        if (action === 'cancel') {
            this.cancel();
        } else if (action === 'confirm') {
            this.confirm();
        }
    }

    #setupConfirmListeners() {
        this.#dialog = this.querySelector('dialog');
        if (!this.#dialog) return;

        // Native dialog 'close' event
        this.listen(this.#dialog, 'close', () => {
            this.removeAttribute('open');
            this.classList.remove('is-open', 'is-visible');
            document.body.style.overflow = '';
        });

        // ESC key triggers 'cancel' event on dialog - treat as cancel
        this.listen(this.#dialog, 'cancel', (e) => {
            e.preventDefault();
            this.cancel();
        });

        // Click on backdrop (dialog element itself, not its children)
        this.listen(this.#dialog, 'click', (e) => {
            if (e.target === this.#dialog) {
                this.cancel();
            }
        });
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
        this.#dialog.showModal();
        document.body.style.overflow = 'hidden';

        // Focus confirm button for keyboard navigation (after DOM is ready)
        const confirmBtn = this.querySelector('[data-action="confirm"]');
        if (confirmBtn) {
            // Use double-rAF to ensure focus happens after showModal completes
            requestAnimationFrame(() => {
                requestAnimationFrame(() => confirmBtn.focus());
            });
        }

        // Trigger animation
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.classList.add('is-visible');
            });
        });
    }

    /**
     * Open the confirm dialog
     */
    open() {
        this.setAttribute('open', '');
    }

    /**
     * Close the confirm dialog with animation
     */
    close() {
        if (!this.#dialog) return;

        this.classList.remove('is-visible');

        // 2026: Use transitionend with flag for test compatibility
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
        };

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

    /**
     * Confirm action - closes and emits au-confirm event
     */
    confirm() {
        this.close();
        this.emit('au-confirm');
    }

    /**
     * Cancel action - closes and emits au-cancel event
     */
    cancel() {
        this.close();
        this.emit('au-cancel');
    }
}

define('au-confirm', AuConfirm);
