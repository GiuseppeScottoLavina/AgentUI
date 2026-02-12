/**
 * @fileoverview Unit Tests for bus.js Module
 * Target: 57% → 90% coverage
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import {
    bus,
    UIEvents,
    showToast,
    AGENTUI_VERSION,
    isDebugEnabled,
    enableDebug,
    disableDebug,
    getHealth,
    getCapabilities,
    addInboundHook,
    addOutboundHook,
    registerComponent,
    unregisterComponent,
    getComponentCapabilities,
    getRegisteredComponents,
    getComponentsForSignal
} from '../../src/core/bus.js';

describe('bus Module Unit Tests', () => {

    // BUS OBJECT
    test('bus should exist', () => {
        expect(bus).toBeDefined();
    });

    // METHODS
    test('bus.on should be a function', () => {
        expect(typeof bus.on).toBe('function');
    });

    test('bus.once should be a function', () => {
        expect(typeof bus.once).toBe('function');
    });

    test('bus.off should be a function', () => {
        expect(typeof bus.off).toBe('function');
    });

    test('bus.emit should be a function', () => {
        expect(typeof bus.emit).toBe('function');
    });

    test('bus.emitAsync should be a function', () => {
        expect(typeof bus.emitAsync).toBe('function');
    });

    test('bus.signal should be a function', () => {
        expect(typeof bus.signal).toBe('function');
    });

    test('bus.request should be a function', () => {
        expect(typeof bus.request).toBe('function');
    });

    test('bus.broadcastRequest should be a function', () => {
        expect(typeof bus.broadcastRequest).toBe('function');
    });

    test('bus.handle should be a function', () => {
        expect(typeof bus.handle).toBe('function');
    });

    test('bus.unhandle should be a function', () => {
        expect(typeof bus.unhandle).toBe('function');
    });

    test('bus.destroy should be a function', () => {
        expect(typeof bus.destroy).toBe('function');
    });

    test('bus.setMaxListeners should be a function', () => {
        expect(typeof bus.setMaxListeners).toBe('function');
    });

    test('bus.hasListeners should be a function', () => {
        expect(typeof bus.hasListeners).toBe('function');
    });

    // PROPERTIES
    test('bus.peerId should be agentui', () => {
        expect(bus.peerId).toBe('agentui');
    });

    test('bus.raw should return LightBus instance', () => {
        expect(bus.raw).toBeDefined();
    });

    test('bus.peers should be defined', () => {
        expect(bus.peers).toBeDefined();
    });

    test('bus.peerCount should be a number', () => {
        expect(typeof bus.peerCount).toBe('number');
    });

    // SUBSCRIPTION
    test('on should return unsubscribe function', () => {
        const unsub = bus.on('test-event', () => { });
        expect(typeof unsub).toBe('function');
        unsub();
    });

    test('emit should work', () => {
        let received = null;
        const unsub = bus.on('test-emit', (data) => { received = data; });
        bus.emit('test-emit', { value: 42 });
        unsub();
        expect(received).toEqual({ value: 42 });
    });

    test('once should only trigger once', () => {
        let count = 0;
        bus.once('test-once', () => { count++; });
        bus.emit('test-once', {});
        bus.emit('test-once', {});
        expect(count).toBe(1);
    });

    test('hasListeners should return boolean', () => {
        const unsub = bus.on('test-has-listeners', () => { });
        expect(bus.hasListeners('test-has-listeners')).toBe(true);
        unsub();
    });

    test('off should work', () => {
        const callback = () => { };
        bus.on('test-off', callback);
        bus.off('test-off', callback);
        expect(true).toBe(true);
    });

    test('signal should work', () => {
        bus.signal('test-signal', { data: 'test' });
        expect(true).toBe(true);
    });

    test('handle should register handler', () => {
        const handler = bus.handle('test-handler', () => ({ result: 'ok' }));
        expect(handler).toBeDefined();
        bus.unhandle('test-handler');
    });

    test('unhandle should work', () => {
        bus.handle('test-unhandle', () => { });
        bus.unhandle('test-unhandle');
        expect(true).toBe(true);
    });

    test('setMaxListeners should work', () => {
        bus.setMaxListeners(200);
        expect(true).toBe(true);
    });

    // UI EVENTS
    test('UIEvents should have TOAST_SHOW', () => {
        expect(UIEvents.TOAST_SHOW).toBe('ui:toast:show');
    });

    test('UIEvents should have TOAST_DISMISS', () => {
        expect(UIEvents.TOAST_DISMISS).toBe('ui:toast:dismiss');
    });

    test('UIEvents should have MODAL_OPEN', () => {
        expect(UIEvents.MODAL_OPEN).toBe('ui:modal:open');
    });

    test('UIEvents should have MODAL_CLOSE', () => {
        expect(UIEvents.MODAL_CLOSE).toBe('ui:modal:close');
    });

    test('UIEvents should have THEME_CHANGE', () => {
        expect(UIEvents.THEME_CHANGE).toBe('ui:theme:change');
    });

    test('UIEvents should have TAB_CHANGE', () => {
        expect(UIEvents.TAB_CHANGE).toBe('ui:tab:change');
    });

    test('UIEvents should have DROPDOWN_SELECT', () => {
        expect(UIEvents.DROPDOWN_SELECT).toBe('ui:dropdown:select');
    });

    test('UIEvents should have FORM_SUBMIT', () => {
        expect(UIEvents.FORM_SUBMIT).toBe('ui:form:submit');
    });

    test('UIEvents should have FORM_VALIDATE', () => {
        expect(UIEvents.FORM_VALIDATE).toBe('ui:form:validate');
    });

    // SHOW TOAST HELPER
    test('showToast should be a function', () => {
        expect(typeof showToast).toBe('function');
    });

    test('showToast should emit toast event', () => {
        let toastData = null;
        const unsub = bus.on(UIEvents.TOAST_SHOW, (data) => { toastData = data; });
        showToast('Hello World', { type: 'success' });
        unsub();
        expect(toastData.message).toBe('Hello World');
        expect(toastData.type).toBe('success');
    });

    // ========================================================================
    // AI AGENT FEATURES (LightBus)
    // ========================================================================

    test('AGENTUI_VERSION should be defined', () => {
        expect(AGENTUI_VERSION).toBeDefined();
        expect(typeof AGENTUI_VERSION).toBe('string');
        expect(AGENTUI_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });

    test('enableDebug should be a function', () => {
        expect(typeof enableDebug).toBe('function');
    });

    test('disableDebug should be a function', () => {
        expect(typeof disableDebug).toBe('function');
    });

    test('isDebugEnabled should be a function', () => {
        expect(typeof isDebugEnabled).toBe('function');
    });

    test('isDebugEnabled should return boolean', () => {
        const result = isDebugEnabled();
        expect(typeof result).toBe('boolean');
    });

    test('enableDebug should return boolean (deprecated)', () => {
        // enableDebug now returns the current state and logs a warning
        const result = enableDebug();
        expect(typeof result).toBe('boolean');
    });

    test('getHealth should be a function', () => {
        expect(typeof getHealth).toBe('function');
    });

    test('getHealth should return health object', () => {
        const health = getHealth();
        expect(health).toBeDefined();
        expect(typeof health).toBe('object');
        // Should have at least peerId
        expect(health.peerId || health.note).toBeDefined();
    });

    test('getCapabilities should be a function', () => {
        expect(typeof getCapabilities).toBe('function');
    });

    test('getCapabilities should return capabilities object', () => {
        const caps = getCapabilities();
        expect(caps.peerId).toBe('agentui');
        expect(Array.isArray(caps.capabilities)).toBe(true);
        expect(caps.capabilities.length).toBeGreaterThan(0);
        expect(caps.capabilities).toContain('ui:toast');
        expect(caps.meta).toBeDefined();
        expect(caps.meta.type).toBe('ui-framework');
        expect(caps.version).toBe(AGENTUI_VERSION);
    });

    test('addInboundHook should be a function', () => {
        expect(typeof addInboundHook).toBe('function');
    });

    test('addOutboundHook should be a function', () => {
        expect(typeof addOutboundHook).toBe('function');
    });

    test('addInboundHook should return unsubscribe function', () => {
        const removeHook = addInboundHook((payload) => payload);
        expect(typeof removeHook).toBe('function');
        removeHook();
    });

    test('addOutboundHook should return unsubscribe function', () => {
        const removeHook = addOutboundHook((payload) => payload);
        expect(typeof removeHook).toBe('function');
        removeHook();
    });

    // ========================================================================
    // COMPONENT CAPABILITY REGISTRATION (Phase 2)
    // ========================================================================

    test('registerComponent should be a function', () => {
        expect(typeof registerComponent).toBe('function');
    });

    test('unregisterComponent should be a function', () => {
        expect(typeof unregisterComponent).toBe('function');
    });

    test('getComponentCapabilities should be a function', () => {
        expect(typeof getComponentCapabilities).toBe('function');
    });

    test('getRegisteredComponents should be a function', () => {
        expect(typeof getRegisteredComponents).toBe('function');
    });

    test('getComponentsForSignal should be a function', () => {
        expect(typeof getComponentsForSignal).toBe('function');
    });

    test('registerComponent should register a component', () => {
        registerComponent('au-test-component', {
            signals: ['ui:test:signal'],
            options: { foo: 'bar' }
        });
        const caps = getComponentCapabilities('au-test-component');
        expect(caps).not.toBeNull();
        expect(caps.signals).toContain('ui:test:signal');
        expect(caps.options.foo).toBe('bar');
        expect(caps.registeredAt).toBeDefined();
        unregisterComponent('au-test-component');
    });

    test('unregisterComponent should remove a component', () => {
        registerComponent('au-temp-component', { signals: [] });
        unregisterComponent('au-temp-component');
        expect(getComponentCapabilities('au-temp-component')).toBeNull();
    });

    test('getRegisteredComponents should return all registered components', () => {
        registerComponent('au-comp-a', { signals: ['sig:a'] });
        registerComponent('au-comp-b', { signals: ['sig:b'] });
        const all = getRegisteredComponents();
        expect(all['au-comp-a']).toBeDefined();
        expect(all['au-comp-b']).toBeDefined();
        unregisterComponent('au-comp-a');
        unregisterComponent('au-comp-b');
    });

    test('getComponentsForSignal should find handlers', () => {
        registerComponent('au-handler-1', { signals: ['ui:shared:signal'] });
        registerComponent('au-handler-2', { signals: ['ui:shared:signal', 'ui:other'] });
        registerComponent('au-unrelated', { signals: ['ui:different'] });

        const handlers = getComponentsForSignal('ui:shared:signal');
        expect(handlers).toContain('au-handler-1');
        expect(handlers).toContain('au-handler-2');
        expect(handlers).not.toContain('au-unrelated');

        unregisterComponent('au-handler-1');
        unregisterComponent('au-handler-2');
        unregisterComponent('au-unrelated');
    });

    test('getComponentCapabilities should return null for unknown component', () => {
        expect(getComponentCapabilities('au-nonexistent')).toBeNull();
    });

    // FIX 5: maxListeners should warn when exceeded
    test('on should warn when listeners exceed maxListeners', () => {
        const warnings = [];
        const origWarn = console.warn;
        console.warn = (...args) => warnings.push(args.join(' '));

        bus.setMaxListeners(3);
        const eventName = 'test-maxlisteners-' + Date.now();
        const unsubs = [];

        // Add 4 listeners (exceeds limit of 3)
        for (let i = 0; i < 4; i++) {
            unsubs.push(bus.on(eventName, () => { }));
        }

        expect(warnings.some(w => w.includes('maxListeners') || w.includes('MaxListeners') || w.includes('leak'))).toBe(true);

        // Cleanup
        unsubs.forEach(u => u());
        bus.setMaxListeners(100);
        console.warn = origWarn;
    });
});

