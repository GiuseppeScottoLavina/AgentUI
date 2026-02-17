/**
 * @fileoverview au-timer — Declarative Timer Component
 *
 * Provides a declarative interval timer with automatic cleanup.
 * Supports count-up (default) and countdown modes, with events
 * fired on each tick and on completion.
 *
 * Uses the native `setInterval` API internally. The interval is
 * automatically cleared on `disconnectedCallback` — zero risk of
 * orphaned timers leaking memory.
 *
 * Security: No innerHTML, no eval, no dynamic HTML.
 * Performance: `display: contents` — zero layout impact.
 * Memory: Interval cleared on disconnect. No external references.
 *
 * @example
 * <!-- Auto-starting 1-second timer -->
 * <au-timer autostart interval="1000">
 *   <span class="clock">...</span>
 * </au-timer>
 *
 * @example
 * <!-- 30-second countdown -->
 * <au-timer autostart countdown="30" interval="1000">
 *   <span class="countdown">30</span>
 * </au-timer>
 *
 * @example
 * <!-- Controlled timer with manual start/stop -->
 * <au-timer interval="100" id="game-timer">
 *   <span>Score updates...</span>
 * </au-timer>
 * <script>
 *   const timer = document.getElementById('game-timer');
 *   timer.start();
 *   // Later:
 *   timer.stop();
 *   timer.reset();
 * </script>
 */

import { AuElement, define } from '../core/AuElement.js';

/**
 * Minimum allowed interval in milliseconds.
 * Prevents accidental CPU thrashing from tiny intervals.
 * @type {number}
 */
const MIN_INTERVAL = 100;

/**
 * Declarative timer component with automatic cleanup.
 * Supports count-up and countdown modes with configurable intervals.
 *
 * @class
 * @extends AuElement
 * @element au-timer
 *
 * @fires au-tick - Dispatched on each interval tick (detail: { count, remaining? })
 * @fires au-complete - Dispatched when countdown reaches 0
 */
export class AuTimer extends AuElement {
    /** @type {string} CSS class applied to the element */
    static baseClass = 'au-timer';

    /** @type {string[]} Attributes that trigger update() on change */
    static observedAttributes = ['interval', 'autostart', 'countdown'];

    /** @type {null} No CSS file — structural component only */
    static cssFile = null;

    /** @type {boolean} Disable containment — display:contents is incompatible */
    static useContainment = false;

    /**
     * The setInterval handle. Null when not running.
     * @private
     * @type {number|null}
     */
    #intervalId = null;

    /**
     * Number of ticks elapsed since start/reset.
     * @private
     * @type {number}
     */
    #count = 0;

    /**
     * Countdown target (parsed from `countdown` attribute). Null for count-up mode.
     * @private
     * @type {number|null}
     */
    #countdownTarget = null;

    /**
     * Render callback — sets display:contents and optionally starts the timer.
     * @override
     */
    render() {
        this.style.display = 'contents';

        // Parse countdown attribute
        const countdown = this.getAttribute('countdown');
        if (countdown !== null) {
            this.#countdownTarget = parseInt(countdown, 10) || null;
        }

        // Auto-start if requested
        if (this.hasAttribute('autostart')) {
            this.start();
        }
    }

    /**
     * Number of ticks elapsed since the timer was started or reset.
     * @readonly
     * @returns {number}
     */
    get count() {
        return this.#count;
    }

    /**
     * Whether the timer is currently running.
     * @readonly
     * @returns {boolean}
     */
    get running() {
        return this.#intervalId !== null;
    }

    /**
     * Start the timer. No-op if already running.
     */
    start() {
        if (this.#intervalId !== null) return; // Already running

        const interval = this.#parseInterval();
        this.#intervalId = setInterval(() => this.#tick(), interval);
    }

    /**
     * Stop the timer. No-op if not running.
     */
    stop() {
        if (this.#intervalId !== null) {
            clearInterval(this.#intervalId);
            this.#intervalId = null;
        }
    }

    /**
     * Reset the tick count to 0. Timer continues running if it was running.
     */
    reset() {
        this.#count = 0;
    }

    /**
     * Parse the interval attribute, clamped to MIN_INTERVAL.
     * @private
     * @returns {number} Interval in milliseconds (minimum 100)
     */
    #parseInterval() {
        const raw = parseInt(this.getAttribute('interval') || '1000', 10);
        return Math.max(MIN_INTERVAL, isNaN(raw) ? 1000 : raw);
    }

    /**
     * Internal tick handler. Increments count, emits events,
     * and handles countdown completion.
     * @private
     */
    #tick() {
        this.#count++;

        const detail = { count: this.#count };

        // Countdown mode: calculate remaining
        if (this.#countdownTarget !== null) {
            const remaining = this.#countdownTarget - this.#count;
            detail.remaining = remaining;

            this.emit('au-tick', detail);

            // Countdown complete
            if (remaining <= 0) {
                this.stop();
                this.emit('au-complete');
            }
        } else {
            // Count-up mode
            this.emit('au-tick', detail);
        }
    }

    /**
     * Cleanup on disconnect — stop the timer to prevent orphaned intervals.
     * @override
     */
    disconnectedCallback() {
        this.stop();
        super.disconnectedCallback();
    }
}

define('au-timer', AuTimer);
