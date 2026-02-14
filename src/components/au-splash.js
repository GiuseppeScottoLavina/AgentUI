/**
 * au-splash.js - Instant Splash Screen Component
 * 
 * 2026: Eliminates janky first-paint on slow hardware.
 * - Renders immediately with inline critical CSS (zero JS blocking)
 * - Auto-hides on au-ready event
 * - Smooth fade transition
 * - Respects prefers-reduced-motion
 * 
 * @example
 * <au-splash logo="logo.svg" duration="300"></au-splash>
 * <div id="app">...</div>
 */

import { AuElement } from '../core/AuElement.js';
import { html, safe } from '../core/utils.js';

export class AuSplash extends AuElement {
    static get observedAttributes() {
        return ['logo', 'duration', 'delay', 'spinner'];
    }

    static baseClass = 'au-splash';
    static cssFile = 'splash';

    // Skip containment - splash needs to be full screen
    static useContainment = false;


    constructor() {
        super();
        this._startTime = Date.now();
        this._hidden = false;
    }

    connectedCallback() {
        super.connectedCallback();

        // Inject critical CSS immediately for instant render
        this._injectCriticalCSS();

        // Render splash
        this.render();

        // Listen for au-ready event
        this.listen(document, 'au-ready', () => this._hide(), { once: true });

        // Fallback timeout (in case au-ready never fires)
        const maxWait = parseInt(this.getAttribute('max-wait')) || 10000;
        this.setTimeout(() => {
            if (!this._hidden) {
                console.warn('[au-splash] Timeout waiting for au-ready, hiding anyway');
                this._hide();
            }
        }, maxWait);
    }

    /**
     * Inject critical CSS inline for instant render (no FOUC)
     */
    _injectCriticalCSS() {
        if (document.getElementById('au-splash-critical')) return;

        const style = document.createElement('style');
        style.id = 'au-splash-critical';
        style.textContent = `
            au-splash {
                position: fixed;
                inset: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 24px;
                background: var(--md-sys-color-surface, #FFFBFE);
                z-index: 99999;
                opacity: 1;
                transition: opacity var(--au-splash-duration, 300ms) ease-out;
            }
            au-splash.au-splash--hidden {
                opacity: 0;
                pointer-events: none;
            }
            au-splash .au-splash__spinner {
                width: 48px;
                height: 48px;
                border: 4px solid var(--md-sys-color-primary, #6750A4);
                border-top-color: transparent;
                border-radius: 50%;
                animation: au-splash-spin 1s linear infinite;
            }
            au-splash .au-splash__logo {
                max-width: 120px;
                max-height: 120px;
                object-fit: contain;
            }
            @keyframes au-splash-spin {
                to { transform: rotate(360deg); }
            }
            @media (prefers-reduced-motion: reduce) {
                au-splash { transition: none; }
                au-splash .au-splash__spinner { animation: none; opacity: 0.6; }
            }
            [data-theme="dark"] au-splash,
            :root[data-theme="dark"] au-splash {
                background: var(--md-sys-color-surface, #141218);
            }
        `;
        document.head.insertBefore(style, document.head.firstChild);
    }

    render() {
        const logo = this.getAttribute('logo');
        const showSpinner = this.getAttribute('spinner') !== 'false';
        const duration = parseInt(this.getAttribute('duration')) || 300;

        // Set CSS variable for duration
        this.style.setProperty('--au-splash-duration', `${duration}ms`);

        this.innerHTML = html`
            ${logo ? html`<img class="au-splash__logo" src="${logo}" alt="Loading...">` : ''}
            ${showSpinner ? safe('<div class="au-splash__spinner" role="progressbar" aria-label="Loading"></div>') : ''}
        `;
    }

    /**
     * Hide splash with fade animation
     */
    _hide() {
        if (this._hidden) return;
        this._hidden = true;

        const delay = parseInt(this.getAttribute('delay')) || 0;
        const elapsed = Date.now() - this._startTime;
        const remainingDelay = Math.max(0, delay - elapsed);

        this.setTimeout(() => {
            const duration = parseInt(this.getAttribute('duration')) || 300;

            // Add hidden class for fade
            this.classList.add('au-splash--hidden');

            // Remove from DOM after transition
            this.setTimeout(() => {
                this.remove();
            }, duration);
        }, remainingDelay);
    }
}

// Register immediately (not deferred) for instant availability
if (!customElements.get('au-splash')) {
    customElements.define('au-splash', AuSplash);
}
