/**
 * @fileoverview Memory Leak Regression Tests
 * 
 * TDD: Tests written BEFORE fixes.
 * Each test targets a specific memory leak or resource issue found during audit.
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, patchEmit, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

// ─── ML1: au-repeat must clear #itemNodes on disconnect ─────────────────────
describe('ML1: au-repeat DOM reference cleanup on disconnect', () => {
    let AuRepeat;

    beforeAll(async () => {
        const module = await import('../../src/components/au-repeat.js');
        AuRepeat = module.AuRepeat;
    });

    beforeEach(() => resetBody());

    test('should clear internal node references when removed from DOM', () => {
        const el = document.createElement('au-repeat');
        body.appendChild(el);

        // Set up items
        el.keyFn = (item) => item.id;
        el.renderItem = (item) => `<div>${item.name}</div>`;
        el.items = [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
            { id: 3, name: 'Charlie' }
        ];

        // Verify items rendered (getElement should find them)
        expect(el.getElement(1)).not.toBeUndefined();
        expect(el.getElement(2)).not.toBeUndefined();
        expect(el.getElement(3)).not.toBeUndefined();

        // Now remove from DOM
        body.removeChild(el);

        // After disconnect, internal references should be cleared
        expect(el.getElement(1)).toBeUndefined();
        expect(el.getElement(2)).toBeUndefined();
        expect(el.getElement(3)).toBeUndefined();
    });

    test('should work correctly when re-attached after disconnect', () => {
        const el = document.createElement('au-repeat');
        body.appendChild(el);

        el.keyFn = (item) => item.id;
        el.renderItem = (item) => `<span>${item.name}</span>`;
        el.items = [{ id: 'a', name: 'First' }];

        // Remove and re-attach
        body.removeChild(el);
        body.appendChild(el);

        // Should accept new items after re-attach
        el.items = [{ id: 'x', name: 'New' }];
        expect(el.getElement('x')).not.toBeUndefined();
    });
});

// ─── ML3: au-toast container cleanup ────────────────────────────────────────
describe('ML3: au-toast container cleanup on dismiss', () => {
    let Toast, AuToast;

    beforeAll(async () => {
        const module = await import('../../src/components/au-toast.js');
        Toast = module.Toast;
        AuToast = module.AuToast;

        // Patch emit for linkedom compatibility (same pattern as au-toast.test.js)
        AuToast.prototype.emit = function (eventName, detail) {
            try {
                this.dispatchEvent(new Event(eventName, { bubbles: true }));
            } catch (e) {
                // linkedom throws on eventPhase assignment, safe to ignore
            }
        };
    });

    beforeEach(() => {
        resetBody();
        // Clean up any leftover containers
        document.querySelectorAll('au-toast-container').forEach(c => c.remove());
    });

    test('should remove empty container after last toast is dismissed', async () => {
        // Create a toast
        const toast = Toast.show('Test message');

        // Container should exist
        const container = document.querySelector('au-toast-container');
        expect(container).not.toBeNull();

        // Dismiss the toast
        toast.dismiss();

        // Wait for 200ms setTimeout fallback (animationend doesn't fire in linkedom)
        await new Promise(resolve => setTimeout(resolve, 250));

        // After dismiss + cleanup, container should be removed
        const remainingContainers = document.querySelectorAll('au-toast-container');
        expect(remainingContainers.length).toBe(0);
    });

    test('should NOT remove container while other toasts exist', async () => {
        const toast1 = Toast.show('Message 1');
        const toast2 = Toast.show('Message 2');

        // Both should be in same container
        const container = document.querySelector('au-toast-container');
        expect(container).not.toBeNull();
        expect(container.querySelectorAll('au-toast').length).toBe(2);

        // Dismiss first toast
        toast1.dismiss();

        // Wait for cleanup
        await new Promise(resolve => setTimeout(resolve, 250));

        // Container should still exist (toast2 is still there)
        const stillExists = document.querySelector('au-toast-container');
        expect(stillExists).not.toBeNull();
    });
});

// ─── ML5: au-modal body overflow restoration on forced removal ──────────────
describe('ML5: au-modal body overflow restoration on disconnect', () => {
    let AuModal;

    beforeAll(async () => {
        const module = await import('../../src/components/au-modal.js');
        AuModal = module.AuModal;
        patchEmit(AuModal);
    });

    beforeEach(() => {
        resetBody();
        document.body.style.overflow = '';
    });

    test('should restore body overflow when removed from DOM while open', () => {
        const el = document.createElement('au-modal');
        el.innerHTML = '<p>Content</p>';
        body.appendChild(el);

        // Open the modal
        el.open();

        // body.style.overflow should be 'hidden'
        expect(document.body.style.overflow).toBe('hidden');

        // Force-remove (simulating direct DOM removal without close())
        body.removeChild(el);

        // body.style.overflow should be restored
        expect(document.body.style.overflow).toBe('');
    });

    test('should NOT affect body overflow if modal was not open when removed', () => {
        // Set body overflow to something custom
        document.body.style.overflow = 'auto';

        const el = document.createElement('au-modal');
        el.innerHTML = '<p>Content</p>';
        body.appendChild(el);

        // Don't open — just remove
        body.removeChild(el);

        // Should preserve the 'auto' value
        expect(document.body.style.overflow).toBe('auto');
    });
});

// ─── PH4: memo() should evict old entries ───────────────────────────────────
describe('PH4: memo() LRU eviction', () => {
    let memo;

    beforeAll(async () => {
        const module = await import('../../src/core/render.js');
        memo = module.memo;
    });

    test('should cache and return results', () => {
        let calls = 0;
        const memoized = memo((x) => { calls++; return x * 2; });

        expect(memoized(5)).toBe(10);
        expect(memoized(5)).toBe(10);
        expect(calls).toBe(1); // Only computed once
    });

    test('should evict oldest entry when maxSize is exceeded', () => {
        let calls = 0;
        const memoized = memo((x) => { calls++; return x * 2; }, { maxSize: 3 });

        memoized(1); // cache: [1]
        memoized(2); // cache: [1, 2]
        memoized(3); // cache: [1, 2, 3]
        expect(calls).toBe(3);

        memoized(4); // cache: [2, 3, 4] — evicts 1
        expect(calls).toBe(4);

        // Key 1 should have been evicted — recompute
        calls = 0;
        memoized(1); // cache: [3, 4, 1] — evicts 2
        expect(calls).toBe(1); // Had to recompute

        // Key 3 should still be cached
        calls = 0;
        memoized(3);
        expect(calls).toBe(0); // Still cached
    });

    test('default maxSize should be Infinity (no eviction)', () => {
        let calls = 0;
        const memoized = memo((x) => { calls++; return x; });

        // Fill 150 entries — with Infinity default, none should be evicted
        for (let i = 0; i < 150; i++) {
            memoized(i);
        }
        expect(calls).toBe(150);

        // Key 0 should still be cached (no eviction with Infinity)
        calls = 0;
        memoized(0);
        expect(calls).toBe(0); // Still cached
    });
});

// ─── ML6: au-confirm body overflow restoration on forced removal ────────────
describe('ML6: au-confirm body overflow restoration on disconnect', () => {
    let AuConfirm;

    beforeAll(async () => {
        const module = await import('../../src/components/au-confirm.js');
        AuConfirm = module.AuConfirm;

        // Patch emit for linkedom
        AuConfirm.prototype.emit = function (eventName, detail) {
            try {
                this.dispatchEvent(new Event(eventName, { bubbles: true }));
            } catch (e) {
                // linkedom throws on eventPhase assignment
            }
        };
    });

    beforeEach(() => {
        document.body.innerHTML = '';
        document.body.style.overflow = '';
    });

    test('should restore body overflow when force-removed while open', () => {
        const el = document.createElement('au-confirm');
        el.setAttribute('title', 'Test');
        el.setAttribute('message', 'Delete?');
        document.body.appendChild(el);

        // Open the confirm dialog — sets body.overflow = 'hidden'
        el.open();
        expect(document.body.style.overflow).toBe('hidden');

        // Force-remove without close()
        el.remove();

        // body.overflow should be restored
        expect(document.body.style.overflow).toBe('');
    });

    test('should NOT affect body overflow if confirm was not open when removed', () => {
        document.body.style.overflow = 'auto';
        const el = document.createElement('au-confirm');
        el.setAttribute('title', 'Test');
        document.body.appendChild(el);

        // Remove without ever opening
        el.remove();

        // Original overflow should be preserved
        expect(document.body.style.overflow).toBe('auto');
    });
});

// ─── ML7: au-modal and au-confirm close() should use managed listeners ──────
describe('ML7: close() transitionend listener should be managed', () => {
    test('au-modal close() should use this.listen for transitionend', async () => {
        const fs = await import('fs');
        const source = fs.readFileSync(
            new URL('../../src/components/au-modal.js', import.meta.url),
            'utf-8'
        );

        // Find the close() method definition
        const closeStart = source.indexOf('close() {');
        expect(closeStart).toBeGreaterThan(-1);

        // Extract the method body (enough to cover the transition listener)
        const closeBlock = source.slice(closeStart, closeStart + 1200);

        // Must use this.listen for transitionend — NOT raw addEventListener
        expect(closeBlock).toContain("this.listen(dialog, 'transitionend'");
        expect(closeBlock).not.toContain("dialog.addEventListener('transitionend'");
    });

    test('au-confirm close() should use this.listen for transitionend', async () => {
        const fs = await import('fs');
        const source = fs.readFileSync(
            new URL('../../src/components/au-confirm.js', import.meta.url),
            'utf-8'
        );

        // Find the close() method definition
        const closeStart = source.indexOf('close() {');
        expect(closeStart).toBeGreaterThan(-1);

        const closeBlock = source.slice(closeStart, closeStart + 1200);

        // Must use this.listen — NOT raw addEventListener
        expect(closeBlock).toContain("this.listen(dialog, 'transitionend'");
        expect(closeBlock).not.toContain("dialog.addEventListener('transitionend'");
    });
});

// ─── ML8: agent-api markerMap should use WeakRef ────────────────────────────
describe('ML8: agent-api markerMap should use WeakRef', () => {
    test('getMarkerElement should use WeakRef deref pattern', async () => {
        const fs = await import('fs');
        const source = fs.readFileSync(
            new URL('../../src/core/agent-api.js', import.meta.url),
            'utf-8'
        );

        // The markerMap.set should store WeakRef(el), not raw el
        expect(source).toContain('new WeakRef(el)');

        // getMarkerElement should deref
        expect(source).toContain('.deref()');
    });
});

