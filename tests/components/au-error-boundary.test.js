/**
 * @fileoverview Unit Tests for au-error-boundary Component
 * Uses patchEmit() and shadow listener registry for event-driven coverage.
 * Covers: render, #handleError, #renderFallback, recover, error registry, window.onerror.
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, resetBody, patchEmit } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuErrorBoundary, getErrors, clearErrors;

describe('au-error-boundary Unit Tests', () => {

    beforeAll(async () => {
        // Ensure window.location exists
        if (!dom.window.location) {
            dom.window.location = { href: 'http://localhost/test' };
        }

        const module = await import('../../src/components/au-error-boundary.js');
        AuErrorBoundary = module.AuErrorBoundary;
        getErrors = module.getErrors;
        clearErrors = module.clearErrors;

        patchEmit(AuErrorBoundary);
    });

    beforeEach(() => {
        resetBody();
        clearErrors();
    });

    // ─── REGISTRATION ──────────────────────────────────────────
    test('should be registered', () => {
        expect(customElements.get('au-error-boundary')).toBe(AuErrorBoundary);
    });

    test('should have correct baseClass', () => {
        expect(AuErrorBoundary.baseClass).toBe('au-error-boundary');
    });

    test('should observe fallback attribute', () => {
        const attrs = AuErrorBoundary.observedAttributes;
        expect(attrs).toContain('fallback');
    });

    // ─── RENDER ────────────────────────────────────────────────
    test('should set display block', () => {
        const el = document.createElement('au-error-boundary');
        body.appendChild(el);
        expect(el.style.display).toBe('block');
    });

    test('should preserve child content', () => {
        const el = document.createElement('au-error-boundary');
        el.innerHTML = '<p>My app content</p>';
        body.appendChild(el);
        expect(el.querySelector('p').textContent).toBe('My app content');
    });

    test('should start without error', () => {
        const el = document.createElement('au-error-boundary');
        body.appendChild(el);
        expect(el.hasError).toBe(false);
        expect(el.error).toBe(null);
    });

    test('should be a block-level element', () => {
        const el = document.createElement('au-error-boundary');
        body.appendChild(el);
        expect(el.style.display).toBe('block');
    });

    // ─── hasError / error getters ──────────────────────────────
    test('hasError getter returns false initially', () => {
        const el = document.createElement('au-error-boundary');
        body.appendChild(el);
        expect(el.hasError).toBe(false);
    });

    test('error getter returns null initially', () => {
        const el = document.createElement('au-error-boundary');
        body.appendChild(el);
        expect(el.error).toBe(null);
    });

    // ─── #handleError via 'error' listener (lines 60-61, 97-137) ──
    test('#handleError should set hasError and error', () => {
        const el = document.createElement('au-error-boundary');
        el.innerHTML = '<p>Content</p>';
        body.appendChild(el);

        // Invoke the 'error' listener from shadow registry
        const testError = new Error('Test error');
        if (el.__listeners?.['error']) {
            const fakeEvent = { detail: { error: testError, message: 'Test error' }, stopPropagation: () => { } };
            for (const fn of el.__listeners['error']) {
                fn.call(el, fakeEvent);
            }
        }
        expect(el.hasError).toBe(true);
        expect(el.error).toBe(testError);
    });

    test('#handleError should add has-error class', () => {
        const el = document.createElement('au-error-boundary');
        el.innerHTML = '<p>Content</p>';
        body.appendChild(el);

        if (el.__listeners?.['error']) {
            const fakeEvent = { detail: { error: new Error('fail'), message: 'fail' }, stopPropagation: () => { } };
            for (const fn of el.__listeners['error']) {
                fn.call(el, fakeEvent);
            }
        }
        expect(el.classList.contains('has-error')).toBe(true);
    });

    test('#handleError should render default fallback UI', () => {
        const el = document.createElement('au-error-boundary');
        el.innerHTML = '<p>Content</p>';
        body.appendChild(el);

        if (el.__listeners?.['error']) {
            const fakeEvent = { detail: { error: new Error('Something broke'), message: 'Something broke' }, stopPropagation: () => { } };
            for (const fn of el.__listeners['error']) {
                fn.call(el, fakeEvent);
            }
        }
        const fallback = el.querySelector('.au-error-boundary__fallback');
        expect(fallback).toBeTruthy();
        expect(fallback.getAttribute('role')).toBe('alert');
        // Should have error message
        const msg = el.querySelector('.au-error-boundary__message');
        expect(msg).toBeTruthy();
        expect(msg.textContent).toContain('Something broke');
    });

    test('#handleError should emit au-error event', () => {
        const el = document.createElement('au-error-boundary');
        el.innerHTML = '<p>Content</p>';
        body.appendChild(el);

        let errorDetail = null;
        el.addEventListener('au-error', (e) => { errorDetail = e.detail; });

        if (el.__listeners?.['error']) {
            const err = new Error('event test');
            const fakeEvent = { detail: { error: err, message: 'event test' }, stopPropagation: () => { } };
            for (const fn of el.__listeners['error']) {
                fn.call(el, fakeEvent);
            }
        }
        expect(errorDetail).toBeTruthy();
        expect(errorDetail.error.message).toBe('event test');
        expect(typeof errorDetail.recover).toBe('function');
    });

    test('#handleError should guard against duplicate errors', () => {
        const el = document.createElement('au-error-boundary');
        el.innerHTML = '<p>Content</p>';
        body.appendChild(el);

        const triggerError = () => {
            if (el.__listeners?.['error']) {
                const fakeEvent = { detail: { error: new Error('dup'), message: 'dup' }, stopPropagation: () => { } };
                for (const fn of el.__listeners['error']) {
                    fn.call(el, fakeEvent);
                }
            }
        };

        triggerError();
        expect(el.hasError).toBe(true);
        const contentAfterFirst = el.innerHTML;

        // Second error should be ignored (guard: if this.#hasError return)
        triggerError();
        expect(el.innerHTML).toBe(contentAfterFirst);
    });

    test('#handleError should call stopPropagation on event', () => {
        const el = document.createElement('au-error-boundary');
        el.innerHTML = '<p>Content</p>';
        body.appendChild(el);

        let stopCalled = false;
        if (el.__listeners?.['error']) {
            const fakeEvent = {
                detail: { error: new Error('stop'), message: 'stop' },
                stopPropagation: () => { stopCalled = true; }
            };
            for (const fn of el.__listeners['error']) {
                fn.call(el, fakeEvent);
            }
        }
        expect(stopCalled).toBe(true);
    });

    // ─── #renderFallback with custom fallback (lines 139-166) ──
    test('#renderFallback should use custom fallback attribute', () => {
        const el = document.createElement('au-error-boundary');
        el.setAttribute('fallback', 'Custom error message');
        el.innerHTML = '<p>Content</p>';
        body.appendChild(el);

        if (el.__listeners?.['error']) {
            const fakeEvent = { detail: { error: new Error('custom'), message: 'custom' }, stopPropagation: () => { } };
            for (const fn of el.__listeners['error']) {
                fn.call(el, fakeEvent);
            }
        }
        const fallback = el.querySelector('.au-error-boundary__fallback');
        expect(fallback).toBeTruthy();
        expect(fallback.textContent).toBe('Custom error message');
    });

    test('#renderFallback custom fallback is safe (text, not HTML)', () => {
        const el = document.createElement('au-error-boundary');
        el.setAttribute('fallback', '<script>alert("xss")</script>');
        el.innerHTML = '<p>Content</p>';
        body.appendChild(el);

        if (el.__listeners?.['error']) {
            const fakeEvent = { detail: { error: new Error('xss'), message: 'xss' }, stopPropagation: () => { } };
            for (const fn of el.__listeners['error']) {
                fn.call(el, fakeEvent);
            }
        }
        // textContent is used, not innerHTML, so script tag is rendered as text
        const fallback = el.querySelector('.au-error-boundary__fallback');
        expect(fallback.innerHTML).not.toContain('<script');
    });

    // ─── recover() (lines 176-183) ─────────────────────────────
    test('recover should reset error state', () => {
        const el = document.createElement('au-error-boundary');
        el.innerHTML = '<p>Original</p>';
        body.appendChild(el);

        // Trigger error
        if (el.__listeners?.['error']) {
            const fakeEvent = { detail: { error: new Error('recoverable'), message: 'recoverable' }, stopPropagation: () => { } };
            for (const fn of el.__listeners['error']) {
                fn.call(el, fakeEvent);
            }
        }
        expect(el.hasError).toBe(true);

        el.recover();
        expect(el.hasError).toBe(false);
        expect(el.error).toBe(null);
    });

    test('recover should remove has-error class', () => {
        const el = document.createElement('au-error-boundary');
        el.innerHTML = '<p>Original</p>';
        body.appendChild(el);

        if (el.__listeners?.['error']) {
            const fakeEvent = { detail: { error: new Error('test'), message: 'test' }, stopPropagation: () => { } };
            for (const fn of el.__listeners['error']) {
                fn.call(el, fakeEvent);
            }
        }
        expect(el.classList.contains('has-error')).toBe(true);
        el.recover();
        expect(el.classList.contains('has-error')).toBe(false);
    });

    test('recover should restore innerHTML to original', () => {
        const el = document.createElement('au-error-boundary');
        el.innerHTML = '<p>Original content</p>';
        body.appendChild(el);

        if (el.__listeners?.['error']) {
            const fakeEvent = { detail: { error: new Error('test'), message: 'test' }, stopPropagation: () => { } };
            for (const fn of el.__listeners['error']) {
                fn.call(el, fakeEvent);
            }
        }
        // Content should be fallback now
        expect(el.querySelector('.au-error-boundary__fallback')).toBeTruthy();

        el.recover();
        expect(el.innerHTML).toContain('Original content');
    });

    test('recover should emit au-recover event', () => {
        const el = document.createElement('au-error-boundary');
        el.innerHTML = '<p>Content</p>';
        body.appendChild(el);

        // Trigger error first
        if (el.__listeners?.['error']) {
            const fakeEvent = { detail: { error: new Error('test'), message: 'test' }, stopPropagation: () => { } };
            for (const fn of el.__listeners['error']) {
                fn.call(el, fakeEvent);
            }
        }

        let recoverFired = false;
        el.addEventListener('au-recover', () => { recoverFired = true; });
        el.recover();
        expect(recoverFired).toBe(true);
    });

    // ─── ERROR REGISTRY (lines 106-123) ────────────────────────
    test('error should be added to registry', () => {
        clearErrors();
        const el = document.createElement('au-error-boundary');
        el.innerHTML = '<p>Content</p>';
        body.appendChild(el);

        if (el.__listeners?.['error']) {
            const fakeEvent = { detail: { error: new Error('registry test'), message: 'registry test' }, stopPropagation: () => { } };
            for (const fn of el.__listeners['error']) {
                fn.call(el, fakeEvent);
            }
        }
        const errors = getErrors();
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[errors.length - 1].error.message).toBe('registry test');
    });

    test('getErrors should return list, clearErrors should empty it', () => {
        expect(getErrors()).toEqual([]);
        clearErrors();
        expect(getErrors()).toEqual([]);
    });

    test('error registry should include context', () => {
        clearErrors();
        const el = document.createElement('au-error-boundary');
        el.id = 'test-boundary';
        el.innerHTML = '<p>Context content</p>';
        body.appendChild(el);

        if (el.__listeners?.['error']) {
            const fakeEvent = { detail: { error: new Error('ctx'), message: 'ctx' }, stopPropagation: () => { } };
            for (const fn of el.__listeners['error']) {
                fn.call(el, fakeEvent);
            }
        }
        const errors = getErrors();
        const last = errors[errors.length - 1];
        expect(last.component).toBe('test-boundary');
        expect(last.context.originalContent).toContain('Context content');
    });

    // ─── window.onerror (lines 67-84) ──────────────────────────
    test('source: window.onerror handler should be installed', async () => {
        const fs = await import('fs');
        const source = fs.readFileSync(
            new URL('../../src/components/au-error-boundary.js', import.meta.url),
            'utf-8'
        );
        expect(source).toContain('window.onerror');
        expect(source).toContain('#setupGlobalErrorHandler');
    });

    test('source: #isErrorFromChild should check error stack', async () => {
        const fs = await import('fs');
        const source = fs.readFileSync(
            new URL('../../src/components/au-error-boundary.js', import.meta.url),
            'utf-8'
        );
        expect(source).toContain('#isErrorFromChild');
        expect(source).toContain('error.stack');
    });

    test('source: escapeHTML should be used in renderFallback', async () => {
        const fs = await import('fs');
        const source = fs.readFileSync(
            new URL('../../src/components/au-error-boundary.js', import.meta.url),
            'utf-8'
        );
        expect(source).toContain("import { escapeHTML }");
        expect(source).toMatch(/\$\{escapeHTML\(this\.#error/);
    });

    // ─── disconnectedCallback: window.onerror restore (FIX 1) ──
    test('disconnectedCallback should restore original window.onerror', () => {
        // Set a custom handler before connect
        const originalHandler = () => 'original';
        dom.window.onerror = originalHandler;

        const el = document.createElement('au-error-boundary');
        el.innerHTML = '<p>Content</p>';
        body.appendChild(el);

        // After connect, window.onerror should have been replaced
        expect(dom.window.onerror).not.toBe(originalHandler);

        // After disconnect, original should be restored
        body.removeChild(el);
        expect(dom.window.onerror).toBe(originalHandler);

        // Cleanup
        dom.window.onerror = null;
    });

    test('multiple connect/disconnect cycles should not break onerror chain', () => {
        const sentinel = () => 'sentinel';
        dom.window.onerror = sentinel;

        const el = document.createElement('au-error-boundary');
        el.innerHTML = '<p>Content</p>';

        // Cycle 1: connect then disconnect
        body.appendChild(el);
        body.removeChild(el);
        expect(dom.window.onerror).toBe(sentinel);

        // Cycle 2: reconnect then disconnect again
        body.appendChild(el);
        body.removeChild(el);
        expect(dom.window.onerror).toBe(sentinel);

        // Cleanup
        dom.window.onerror = null;
    });
});
