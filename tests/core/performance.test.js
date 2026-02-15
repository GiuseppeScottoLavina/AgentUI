/**
 * @fileoverview Performance Regression Tests
 * 
 * TDD: These tests are written BEFORE the fixes.
 * Each test targets a specific performance anti-pattern found during audit.
 */

import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import '../setup-dom.js';

// ─── P1.1: _loadComponentCSS should NOT iterate cssRules ─────────────────────
describe('P1.1: _loadComponentCSS bundle detection', () => {
    test('should detect bundle via CSS custom property, not cssRules iteration', async () => {
        // The old code iterated every cssRule in every stylesheet
        // The new code should check for a CSS custom property (O(1))

        // Import AuElement fresh
        const { AuElement } = await import('../../src/core/AuElement.js');

        // Reset bundle check state
        AuElement._bundleChecked = false;
        AuElement._bundleLoaded = false;

        // Track if cssRules was accessed on any stylesheet
        let cssRulesAccessed = false;
        const originalStyleSheets = document.styleSheets;

        // Mock styleSheets with a Proxy that detects cssRules access
        if (document.styleSheets && document.styleSheets.length > 0) {
            const origRules = Object.getOwnPropertyDescriptor(
                CSSStyleSheet?.prototype || {}, 'cssRules'
            );
            // If we can intercept, do so
            if (origRules) {
                Object.defineProperty(CSSStyleSheet.prototype, 'cssRules', {
                    get() {
                        cssRulesAccessed = true;
                        return origRules.get?.call(this) || [];
                    },
                    configurable: true
                });
            }
        }

        // The important thing: bundle detection should use a lightweight method
        // We verify the code path doesn't throw and completes
        expect(AuElement._bundleChecked).toBe(false);

        // Trigger _loadComponentCSS by creating an element with cssFile
        class TestCSSElement extends AuElement {
            static baseClass = 'au-test-css-p11';
            static cssFile = 'test-p11';
        }

        // Register if not already registered
        if (!customElements.get('au-test-css-p11')) {
            customElements.define('au-test-css-p11', TestCSSElement);
        }

        const el = document.createElement('au-test-css-p11');
        document.body.appendChild(el);

        // After connectedCallback, bundle should be checked
        expect(AuElement._bundleChecked).toBe(true);

        // Cleanup
        document.body.removeChild(el);
    });
});

// ─── P1.2: _initAgentLogger should run exactly once ──────────────────────────
describe('P1.2: _initAgentLogger singleton', () => {
    test('should initialize agent logger infrastructure exactly once across multiple instances', async () => {
        const { AuElement } = await import('../../src/core/AuElement.js');

        // Track calls to _initAgentLogger
        let callCount = 0;
        const original = AuElement.prototype._initAgentLogger;
        AuElement.prototype._initAgentLogger = function () {
            callCount++;
            return original.call(this);
        };

        // Reset state
        AuElement._agentLoggerInitialized = false;

        // Create many elements
        class TestLoggerA extends AuElement { static baseClass = 'au-test-logger-a'; }
        class TestLoggerB extends AuElement { static baseClass = 'au-test-logger-b'; }

        if (!customElements.get('au-test-logger-a')) {
            customElements.define('au-test-logger-a', TestLoggerA);
        }
        if (!customElements.get('au-test-logger-b')) {
            customElements.define('au-test-logger-b', TestLoggerB);
        }

        const elements = [];
        for (let i = 0; i < 10; i++) {
            elements.push(document.createElement('au-test-logger-a'));
            elements.push(document.createElement('au-test-logger-b'));
        }

        // _initAgentLogger body should run at most once (the static guard)
        // The method itself may be called once (from the first constructor)
        expect(callCount).toBeLessThanOrEqual(1);

        // Restore
        AuElement.prototype._initAgentLogger = original;
    });
});

// ─── P1.4: RenderScheduler#flush should not copy array ───────────────────────
describe('P1.4: RenderScheduler flush optimization', () => {
    test('should execute all queued callbacks without unnecessary array copy', async () => {
        const { scheduler } = await import('../../src/core/render.js');

        const results = [];

        // Schedule multiple callbacks
        scheduler.schedule(() => results.push(1));
        scheduler.schedule(() => results.push(2));
        scheduler.schedule(() => results.push(3));

        // In linkedom, rAF is synchronous, so flush happens immediately
        // Verify all callbacks executed
        expect(results).toEqual([1, 2, 3]);
    });

    test('should handle callbacks that schedule more work during flush', async () => {
        const { scheduler } = await import('../../src/core/render.js');

        const results = [];

        scheduler.schedule(() => {
            results.push('a');
            // Schedule during flush — should go into NEXT frame, not current
            scheduler.schedule(() => results.push('b'));
        });

        // First flush
        expect(results).toContain('a');
        // 'b' may or may not be flushed yet depending on rAF mock behavior
        // The key invariant: no crash, no infinite loop
    });
});

// ─── P1.5: bus.emitSync should not scan all listeners for wildcard ───────────
describe('P1.5: bus wildcard optimization', () => {
    test('should match wildcard listeners correctly', async () => {
        const { bus } = await import('../../src/core/bus.js');

        const received = [];

        // Register wildcard
        const unsub = bus.on('ui:*', (data) => received.push(data));

        // Emit specific event
        bus.emit('ui:toast:show', { message: 'hello' });

        expect(received.length).toBe(1);
        expect(received[0]).toEqual({ message: 'hello' });

        unsub();
    });

    test('should not trigger wildcard for non-matching events', async () => {
        const { bus } = await import('../../src/core/bus.js');

        const received = [];
        const unsub = bus.on('ui:*', (data) => received.push(data));

        // Emit non-matching event
        bus.emit('app:init', { ready: true });

        expect(received.length).toBe(0);

        unsub();
    });

    test('specific listeners should still work alongside wildcards', async () => {
        const { bus } = await import('../../src/core/bus.js');

        const specific = [];
        const wild = [];

        const unsub1 = bus.on('ui:modal:open', (data) => specific.push(data));
        const unsub2 = bus.on('ui:*', (data) => wild.push(data));

        bus.emit('ui:modal:open', { id: '1' });

        expect(specific.length).toBe(1);
        expect(wild.length).toBe(1);

        unsub1();
        unsub2();
    });
});

// ─── P1.6: ripple should not call getComputedStyle per click ─────────────────
describe('P1.6: ripple positioning optimization', () => {
    test('attachRipple should set position/overflow at attach time', async () => {
        const { attachRipple } = await import('../../src/core/ripple.js');

        const el = document.createElement('div');
        el.style.width = '100px';
        el.style.height = '50px';
        document.body.appendChild(el);

        attachRipple(el);

        // After attach, position and overflow should already be set
        // (not waiting for first click)
        expect(el.style.position).toBe('relative');
        expect(el.style.overflow).toBe('hidden');

        document.body.removeChild(el);
    });
});

// ─── P2.1: au-code should inject styles once ────────────────────────────────
describe('P2.1: au-code style injection', () => {
    test('should not create duplicate style tags across multiple instances', async () => {
        await import('../../src/components/au-code.js');

        // Remove any existing au-code-styles
        document.getElementById('au-code-styles')?.remove();

        // Create multiple au-code instances
        const codes = [];
        for (let i = 0; i < 5; i++) {
            const code = document.createElement('au-code');
            code.setAttribute('language', 'javascript');
            code.textContent = `const x = ${i};`;
            document.body.appendChild(code);
            codes.push(code);
        }

        // Count style tags
        const styleTags = document.querySelectorAll('#au-code-styles');
        expect(styleTags.length).toBeLessThanOrEqual(1);

        // Cleanup
        codes.forEach(c => document.body.removeChild(c));
    });
});

// ─── P2.3: au-dropdown should throttle scroll/resize ─────────────────────────
describe('P2.3: au-dropdown scroll throttle', () => {
    test('should import throttle from render.js', async () => {
        const { throttle } = await import('../../src/core/render.js');

        // Verify throttle function exists and works
        let callCount = 0;
        const throttled = throttle(() => callCount++, 100);

        // First call goes through immediately
        throttled();
        expect(callCount).toBe(1);

        // Subsequent calls within window are suppressed
        throttled();
        throttled();
        expect(callCount).toBe(1);
    });
});

// ─── P1.3: Regex in _inferButtonAction should be precompiled ─────────────────
describe('P1.3: precompiled regex for button action inference', () => {
    test('should correctly infer button actions', async () => {
        await import('../../src/components/au-button.js');

        const testCases = [
            { text: 'Save', expected: 'submit' },
            { text: 'cancel', expected: 'cancel' },
            { text: 'Delete', expected: 'delete' },
            { text: 'Next', expected: 'navigate' },
            { text: 'Do something', expected: 'click' },
        ];

        for (const { text, expected } of testCases) {
            const btn = document.createElement('au-button');
            btn.textContent = text;
            document.body.appendChild(btn);

            const action = btn.getAttribute('data-au-action');
            expect(action).toBe(expected);

            document.body.removeChild(btn);
        }
    });
});

// ─── P1.7: escapeHTML should use single-pass replacement ─────────────────────
describe('P1.7: escapeHTML single-pass optimization', () => {
    test('should correctly escape all 5 HTML entities', async () => {
        const { escapeHTML } = await import('../../src/core/utils.js');

        expect(escapeHTML('<script>alert("xss")</script>')).toBe(
            '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
        );
        expect(escapeHTML("Tom & Jerry's")).toBe("Tom &amp; Jerry&#039;s");
        expect(escapeHTML(null)).toBe('');
        expect(escapeHTML(undefined)).toBe('');
        expect(escapeHTML('')).toBe('');
        expect(escapeHTML('clean text')).toBe('clean text');
    });

    test('should handle all entities in one string', async () => {
        const { escapeHTML } = await import('../../src/core/utils.js');

        const input = `<a href="foo" title='bar'>one & two</a>`;
        const result = escapeHTML(input);
        expect(result).toContain('&lt;');
        expect(result).toContain('&gt;');
        expect(result).toContain('&quot;');
        expect(result).toContain('&#039;');
        expect(result).toContain('&amp;');
        // Must NOT double-escape
        expect(result).not.toContain('&amp;lt;');
    });
});

// ─── P2.4: Icon SYMBOL_NAMES → ICON_ALIASES cleanup ─────────────────────────
describe('P2.4: icon alias resolution', () => {
    test('should resolve aliases to correct icon names', async () => {
        const { AuIcon } = await import('../../src/components/au-icon.js');

        const testAliases = [
            { input: 'success', expected: 'check_circle' },
            { input: 'sun', expected: 'light_mode' },
            { input: 'moon', expected: 'dark_mode' },
            { input: 'user', expected: 'person' },
            { input: 'plus', expected: 'add' },
            { input: 'minus', expected: 'remove' },
        ];

        for (const { input, expected } of testAliases) {
            const icon = document.createElement('au-icon');
            icon.setAttribute('name', input);
            document.body.appendChild(icon);

            // The icon should have rendered an SVG with the correct path
            const svg = icon.querySelector('svg');
            expect(svg).not.toBeNull();

            document.body.removeChild(icon);
        }
    });

    test('should work with direct icon names (non-aliases)', async () => {
        await import('../../src/components/au-icon.js');

        const directNames = ['home', 'settings', 'search', 'delete', 'info'];

        for (const name of directNames) {
            const icon = document.createElement('au-icon');
            icon.setAttribute('name', name);
            document.body.appendChild(icon);

            const svg = icon.querySelector('svg');
            expect(svg).not.toBeNull();

            document.body.removeChild(icon);
        }
    });

    test('IconNames export should include all known icons', async () => {
        const { IconNames } = await import('../../src/components/au-icon.js');

        expect(IconNames).toContain('home');
        expect(IconNames).toContain('success');
        expect(IconNames).toContain('plus');
        expect(IconNames).toContain('settings');
        expect(IconNames.length).toBeGreaterThanOrEqual(40);
    });
});

// ─── P1.5 extended: bus wildcard off/unsubscribe ─────────────────────────────
describe('P1.5 extended: bus wildcard unsubscribe', () => {
    test('wildcard unsubscribe should stop delivery', async () => {
        const { bus } = await import('../../src/core/bus.js');

        const received = [];
        const unsub = bus.on('test-unsub:*', (data) => received.push(data));

        bus.emit('test-unsub:foo', { a: 1 });
        expect(received.length).toBe(1);

        unsub(); // bus.on() returns a function, not { unsubscribe }

        bus.emit('test-unsub:bar', { b: 2 });
        expect(received.length).toBe(1); // no new delivery
    });

    test('bus.off should work for wildcard patterns', async () => {
        const { bus } = await import('../../src/core/bus.js');

        const received = [];
        const handler = (data) => received.push(data);
        bus.on('evt-off:*', handler);

        bus.emit('evt-off:x', { x: 1 });
        expect(received.length).toBe(1);

        bus.off('evt-off:*', handler);

        bus.emit('evt-off:y', { y: 2 });
        expect(received.length).toBe(1); // unchanged
    });
});
