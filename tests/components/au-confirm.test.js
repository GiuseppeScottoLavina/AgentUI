/**
 * @fileoverview Unit Tests for au-confirm Component
 * Medium-High component: 274 lines, programmatic confirm dialog with Promise API
 * Uses patchEmit() to enable event-driven code coverage in LinkedOM.
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, resetBody, patchEmit } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuConfirm, auConfirm;

describe('au-confirm Unit Tests', () => {

    beforeAll(async () => {
        const module = await import('../../src/components/au-confirm.js');
        AuConfirm = module.AuConfirm;
        auConfirm = module.auConfirm;

        // Patch emit for shadow listener invocation
        patchEmit(AuConfirm);
    });

    beforeEach(() => resetBody());

    // ─── REGISTRATION ──────────────────────────────────────────
    test('should be registered', () => {
        expect(customElements.get('au-confirm')).toBe(AuConfirm);
    });

    test('should have correct baseClass', () => {
        expect(AuConfirm.baseClass).toBe('au-confirm');
    });

    test('should use overlays cssFile', () => {
        expect(AuConfirm.cssFile).toBe('overlays');
    });

    test('should observe expected attributes', () => {
        const attrs = AuConfirm.observedAttributes;
        expect(attrs).toContain('title');
        expect(attrs).toContain('message');
        expect(attrs).toContain('confirm-text');
        expect(attrs).toContain('cancel-text');
        expect(attrs).toContain('variant');
    });

    // ─── RENDER ────────────────────────────────────────────────
    test('should render dialog element', () => {
        const el = document.createElement('au-confirm');
        el.setAttribute('title', 'Delete?');
        el.setAttribute('message', 'Are you sure?');
        body.appendChild(el);
        const dialog = el.querySelector('dialog');
        expect(dialog).toBeTruthy();
    });

    test('should render title', () => {
        const el = document.createElement('au-confirm');
        el.setAttribute('title', 'Delete Item');
        body.appendChild(el);
        const title = el.querySelector('.au-confirm__title');
        expect(title).toBeTruthy();
        expect(title.textContent).toBe('Delete Item');
    });

    test('should render message', () => {
        const el = document.createElement('au-confirm');
        el.setAttribute('message', 'This cannot be undone');
        body.appendChild(el);
        const message = el.querySelector('.au-confirm__message');
        expect(message).toBeTruthy();
        expect(message.textContent).toBe('This cannot be undone');
    });

    test('should render actions with confirm and cancel buttons', () => {
        const el = document.createElement('au-confirm');
        body.appendChild(el);
        const actions = el.querySelector('.au-confirm__actions');
        expect(actions).toBeTruthy();
        const buttons = actions.querySelectorAll('au-button');
        expect(buttons.length).toBe(2);
    });

    test('should use default texts when not specified', () => {
        const el = document.createElement('au-confirm');
        body.appendChild(el);
        const title = el.querySelector('.au-confirm__title');
        expect(title.textContent).toBe('Confirm');
        const message = el.querySelector('.au-confirm__message');
        expect(message.textContent).toBe('Are you sure?');
    });

    test('should render custom button texts', () => {
        const el = document.createElement('au-confirm');
        el.setAttribute('confirm-text', 'Delete');
        el.setAttribute('cancel-text', 'Keep');
        body.appendChild(el);
        const buttons = el.querySelectorAll('au-button');
        const cancelBtn = buttons[0];
        const confirmBtn = buttons[1];
        expect(cancelBtn.textContent).toContain('Keep');
        expect(confirmBtn.textContent).toContain('Delete');
    });

    // ─── VARIANT ───────────────────────────────────────────────
    test('should use filled variant for primary', () => {
        const el = document.createElement('au-confirm');
        el.setAttribute('variant', 'primary');
        body.appendChild(el);
        const confirmBtn = el.querySelector('au-button[data-action="confirm"]');
        expect(confirmBtn.getAttribute('variant')).toBe('filled');
    });

    test('should use danger variant for danger', () => {
        const el = document.createElement('au-confirm');
        el.setAttribute('variant', 'danger');
        body.appendChild(el);
        const confirmBtn = el.querySelector('au-button[data-action="confirm"]');
        expect(confirmBtn.getAttribute('variant')).toBe('danger');
    });

    test('cancel button should always use text variant', () => {
        const el = document.createElement('au-confirm');
        body.appendChild(el);
        const cancelBtn = el.querySelector('au-button[data-action="cancel"]');
        expect(cancelBtn.getAttribute('variant')).toBe('text');
    });

    // ─── XSS PROTECTION ───────────────────────────────────────
    test('should escape title with escapeHTML', () => {
        const el = document.createElement('au-confirm');
        el.setAttribute('title', '<script>alert("xss")</script>');
        body.appendChild(el);
        const title = el.querySelector('.au-confirm__title');
        expect(title.innerHTML).not.toContain('<script');
        expect(title.innerHTML).toContain('&lt;script&gt;');
    });

    test('should escape message with escapeHTML', () => {
        const el = document.createElement('au-confirm');
        el.setAttribute('message', '<img src=x onerror=alert(1)>');
        body.appendChild(el);
        const message = el.querySelector('.au-confirm__message');
        expect(message.innerHTML).not.toContain('<img');
    });

    // ─── IDEMPOTENT RENDER ─────────────────────────────────────
    test('should be idempotent on re-render', () => {
        const el = document.createElement('au-confirm');
        body.appendChild(el);
        const dialogsBefore = el.querySelectorAll('dialog').length;
        el.render();
        const dialogsAfter = el.querySelectorAll('dialog').length;
        expect(dialogsAfter).toBe(dialogsBefore);
    });

    // ─── HANDLEACTION ──────────────────────────────────────────
    test('handleAction confirm should call confirm()', () => {
        const el = document.createElement('au-confirm');
        body.appendChild(el);
        let called = false;
        el.confirm = () => { called = true; };
        el.handleAction('confirm', null, null);
        expect(called).toBe(true);
    });

    test('handleAction cancel should call cancel()', () => {
        const el = document.createElement('au-confirm');
        body.appendChild(el);
        let called = false;
        el.cancel = () => { called = true; };
        el.handleAction('cancel', null, null);
        expect(called).toBe(true);
    });

    // ─── OPEN / CLOSE / CONFIRM / CANCEL METHODS ──────────────
    test('open() should set open attribute', () => {
        const el = document.createElement('au-confirm');
        body.appendChild(el);
        el.open();
        expect(el.hasAttribute('open')).toBe(true);
    });

    test('open attribute triggers #showDialog', () => {
        const el = document.createElement('au-confirm');
        body.appendChild(el);
        el.open();
        // #showDialog sets is-open class and calls dialog.showModal()
        expect(el.classList.contains('is-open')).toBe(true);
    });

    test('close() should remove is-visible class', () => {
        const el = document.createElement('au-confirm');
        body.appendChild(el);
        el.classList.add('is-visible');
        el.close();
        expect(el.classList.contains('is-visible')).toBe(false);
    });

    test('confirm() should emit au-confirm event', () => {
        const el = document.createElement('au-confirm');
        body.appendChild(el);
        let eventReceived = false;
        el.addEventListener('au-confirm', () => { eventReceived = true; });
        el.confirm();
        expect(eventReceived).toBe(true);
    });

    test('cancel() should emit au-cancel event', () => {
        const el = document.createElement('au-confirm');
        body.appendChild(el);
        let eventReceived = false;
        el.addEventListener('au-cancel', () => { eventReceived = true; });
        el.cancel();
        expect(eventReceived).toBe(true);
    });

    // ─── #setupConfirmListeners (lines 155-177) ───────────────
    test('dialog close listener should clean up state', () => {
        const el = document.createElement('au-confirm');
        body.appendChild(el);
        el.open();

        // The listener on dialog 'close' event should remove is-open, is-visible, open attr
        const dialog = el.querySelector('dialog');
        expect(dialog).toBeTruthy();

        // Simulate dialog close event
        el.classList.add('is-open', 'is-visible');
        if (dialog.__listeners?.['close']) {
            const fakeEvent = new Event('close');
            for (const fn of dialog.__listeners['close']) {
                fn.call(dialog, fakeEvent);
            }
        }
        expect(el.classList.contains('is-open')).toBe(false);
        expect(el.classList.contains('is-visible')).toBe(false);
    });

    test('dialog cancel listener should call cancel()', () => {
        const el = document.createElement('au-confirm');
        body.appendChild(el);
        el.open();

        let cancelCalled = false;
        el.cancel = () => { cancelCalled = true; };

        const dialog = el.querySelector('dialog');
        if (dialog.__listeners?.['cancel']) {
            const fakeEvent = new Event('cancel', { cancelable: true });
            fakeEvent.preventDefault = () => { };
            for (const fn of dialog.__listeners['cancel']) {
                fn.call(dialog, fakeEvent);
            }
        }
        expect(cancelCalled).toBe(true);
    });

    test('dialog backdrop click should call cancel()', () => {
        const el = document.createElement('au-confirm');
        body.appendChild(el);
        el.open();

        let cancelCalled = false;
        el.cancel = () => { cancelCalled = true; };

        const dialog = el.querySelector('dialog');
        if (dialog.__listeners?.['click']) {
            // Simulate click where target === dialog (backdrop click)
            const fakeEvent = { target: dialog };
            for (const fn of dialog.__listeners['click']) {
                fn.call(dialog, fakeEvent);
            }
        }
        expect(cancelCalled).toBe(true);
    });

    test('dialog click on child should NOT trigger cancel', () => {
        const el = document.createElement('au-confirm');
        body.appendChild(el);
        el.open();

        let cancelCalled = false;
        el.cancel = () => { cancelCalled = true; };

        const dialog = el.querySelector('dialog');
        const child = el.querySelector('.au-confirm__title');
        if (dialog.__listeners?.['click']) {
            // Click targets child → not backdrop
            const fakeEvent = { target: child };
            for (const fn of dialog.__listeners['click']) {
                fn.call(dialog, fakeEvent);
            }
        }
        expect(cancelCalled).toBe(false);
    });

    // ─── update() (line 180-186) ──────────────────────────────
    test('update with open attribute triggers showDialog', () => {
        const el = document.createElement('au-confirm');
        body.appendChild(el);
        // Manually call update to simulate attributeChangedCallback
        el.update('open', '', null);
        expect(el.classList.contains('is-open')).toBe(true);
    });

    // Covered by E2E: tests/e2e/coverage-gaps.test.js
    test.skip('#showDialog should not reopen if already open (E2E)', () => {
        const el = document.createElement('au-confirm');
        body.appendChild(el);
        el.open();
        // Dialog is already open
        const dialog = el.querySelector('dialog');
        expect(dialog.open).toBe(true);
        // Re-calling open won't re-showModal (guarded by this.#dialog.open check)
        el.update('open', '', null);
        expect(dialog.open).toBe(true); // Still open, didn't crash
    });

    // ─── PROMISE API: auConfirm() (lines 45-82) ──────────────
    test('should export auConfirm function', () => {
        expect(typeof auConfirm).toBe('function');
    });

    test('auConfirm should create element and resolve true on confirm', async () => {
        const promise = auConfirm('Test message', { title: 'Test' });

        // Find the au-confirm element that was appended to body
        const el = body.querySelector('au-confirm');
        expect(el).toBeTruthy();
        expect(el.getAttribute('title')).toBe('Test');
        expect(el.getAttribute('message')).toBe('Test message');

        // Trigger confirm
        el.confirm();
        const result = await promise;
        expect(result).toBe(true);
    });

    test('auConfirm should resolve false on cancel', async () => {
        const promise = auConfirm('Cancel test');
        const el = body.querySelector('au-confirm');
        expect(el).toBeTruthy();

        el.cancel();
        const result = await promise;
        expect(result).toBe(false);
    });

    test('auConfirm should pass variant', async () => {
        const promise = auConfirm('Danger!', { variant: 'danger' });
        const el = body.querySelector('au-confirm');
        expect(el.getAttribute('variant')).toBe('danger');

        el.confirm();
        await promise;
    });

    test('auConfirm should pass custom button text', async () => {
        const promise = auConfirm('Delete?', {
            confirmText: 'Delete',
            cancelText: 'Keep'
        });
        const el = body.querySelector('au-confirm');
        expect(el.getAttribute('confirm-text')).toBe('Delete');
        expect(el.getAttribute('cancel-text')).toBe('Keep');

        el.cancel();
        await promise;
    });

    test('auConfirm should be singleton (remove previous)', async () => {
        const promise1 = auConfirm('First');
        const el1 = body.querySelector('au-confirm');
        expect(el1).toBeTruthy();

        // Second call should remove first
        const promise2 = auConfirm('Second');
        const allConfirms = body.querySelectorAll('au-confirm');
        // Only one should remain
        expect(allConfirms.length).toBe(1);
        expect(allConfirms[0].getAttribute('message')).toBe('Second');

        // Clean up — confirm the second one
        allConfirms[0].confirm();
        await promise2;
    });

    test('auConfirm should remove element on resolve', async () => {
        const promise = auConfirm('Remove test');
        const el = body.querySelector('au-confirm');

        el.confirm();
        await promise;

        // Element should have been removed from body
        const remaining = body.querySelector('au-confirm');
        expect(remaining).toBeFalsy();
    });
});
