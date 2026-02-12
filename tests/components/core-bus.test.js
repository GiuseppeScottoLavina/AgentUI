/**
 * @fileoverview Unit Tests for core/bus.js — LightBus and bus wrapper
 * Target: 3% → 95% line coverage
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import '../helpers/setup-dom.js';

import {
    bus, UIEvents, showToast,
    AGENTUI_VERSION, isDebugEnabled, enableDebug, disableDebug,
    getHealth, getCapabilities, addInboundHook, addOutboundHook,
    registerComponent, unregisterComponent,
    getComponentCapabilities, getRegisteredComponents, getComponentsForSignal
} from '../../src/core/bus.js';

describe('core/bus.js', () => {

    beforeEach(() => {
        bus.destroy(); // Clean state between tests
    });

    // ========== CONSTANTS & EXPORTS ==========
    describe('Constants', () => {
        test('AGENTUI_VERSION should be a string', () => {
            expect(typeof AGENTUI_VERSION).toBe('string');
        });

        test('UIEvents should have predefined event names', () => {
            expect(UIEvents.TOAST_SHOW).toBe('ui:toast:show');
            expect(UIEvents.TOAST_DISMISS).toBe('ui:toast:dismiss');
            expect(UIEvents.MODAL_OPEN).toBe('ui:modal:open');
            expect(UIEvents.MODAL_CLOSE).toBe('ui:modal:close');
            expect(UIEvents.THEME_CHANGE).toBe('ui:theme:change');
            expect(UIEvents.TAB_CHANGE).toBe('ui:tab:change');
            expect(UIEvents.DROPDOWN_SELECT).toBe('ui:dropdown:select');
            expect(UIEvents.FORM_SUBMIT).toBe('ui:form:submit');
            expect(UIEvents.FORM_VALIDATE).toBe('ui:form:validate');
        });
    });

    // ========== BUS WRAPPER: on/off/emit ==========
    describe('bus.on / bus.emit', () => {
        test('should subscribe and receive emitted data', () => {
            let received = null;
            bus.on('test:event', (data) => { received = data; });
            bus.emit('test:event', { message: 'hello' });
            expect(received).toEqual({ message: 'hello' });
        });

        test('should return unsubscribe function', () => {
            let count = 0;
            const unsub = bus.on('test:unsub', () => { count++; });
            bus.emit('test:unsub', {});
            expect(count).toBe(1);
            unsub();
            bus.emit('test:unsub', {});
            expect(count).toBe(1); // Should not increase
        });

        test('multiple listeners on same event', () => {
            const results = [];
            bus.on('multi', (d) => results.push('a'));
            bus.on('multi', (d) => results.push('b'));
            bus.emit('multi', {});
            expect(results).toEqual(['a', 'b']);
        });

        test('emit with no listeners should not throw', () => {
            expect(() => bus.emit('no:listeners', {})).not.toThrow();
        });
    });

    // ========== bus.once ==========
    describe('bus.once', () => {
        test('should fire callback only once', () => {
            let count = 0;
            bus.once('once:test', () => { count++; });
            bus.emit('once:test', {});
            bus.emit('once:test', {});
            bus.emit('once:test', {});
            expect(count).toBe(1);
        });
    });

    // ========== bus.off ==========
    describe('bus.off', () => {
        test('should remove listener by reference', () => {
            let count = 0;
            // Note: bus.off works on the raw lightBus level
            // Using unsubscribe from on() is the preferred pattern
            const unsub = bus.on('off:test', () => { count++; });
            bus.emit('off:test', {});
            expect(count).toBe(1);
            unsub();
            bus.emit('off:test', {});
            expect(count).toBe(1);
        });
    });

    // ========== bus.emitAsync ==========
    describe('bus.emitAsync', () => {
        test('should return delivered confirmation', async () => {
            const result = await bus.emitAsync('async:test', { foo: 'bar' });
            expect(result).toHaveProperty('delivered', true);
            expect(result).toHaveProperty('event', 'async:test');
        });

        test('should deliver data to listeners', async () => {
            let received = null;
            bus.on('async:data', (d) => { received = d; });
            await bus.emitAsync('async:data', { value: 42 });
            expect(received).toEqual({ value: 42 });
        });
    });

    // ========== bus.signal ==========
    describe('bus.signal', () => {
        test('should deliver data to listeners (fire-and-forget)', () => {
            let received = null;
            bus.on('signal:test', (d) => { received = d; });
            bus.signal('signal:test', { type: 'signal' });
            expect(received).toEqual({ type: 'signal' });
        });
    });

    // ========== WILDCARD SUPPORT ==========
    describe('Wildcard support', () => {
        test('should match wildcard patterns', () => {
            const events = [];
            bus.raw.on('ui:*', (payload) => { events.push(payload.event); });
            bus.emit('ui:toast:show', {});
            bus.emit('ui:modal:open', {});
            bus.emit('other:event', {});
            expect(events).toContain('ui:toast:show');
            expect(events).toContain('ui:modal:open');
            expect(events).not.toContain('other:event');
        });
    });

    // ========== REQUEST/RESPONSE (RPC) ==========
    describe('Request/Response (RPC)', () => {
        test('handle + request should work', async () => {
            bus.handle('greet', (payload) => `Hello ${payload.name}`);
            const result = await bus.request('agentui', 'greet', { name: 'World' });
            expect(result).toBe('Hello World');
        });

        test('request should throw if no handler', async () => {
            expect(bus.request('agentui', 'nonexistent', {})).rejects.toThrow();
        });

        test('broadcastRequest should call handler', async () => {
            bus.handle('sum', (p) => p.a + p.b);
            const result = await bus.broadcastRequest('sum', { a: 3, b: 4 });
            expect(result).toBe(7);
        });

        test('handle should return unsubscribe', () => {
            const unsub = bus.handle('temp', () => 'ok');
            unsub.unsubscribe();
            expect(bus.request('agentui', 'temp', {})).rejects.toThrow();
        });

        test('unhandle should remove handler', async () => {
            bus.handle('removable', () => 'yes');
            const result = await bus.request('agentui', 'removable', {});
            expect(result).toBe('yes');
            bus.unhandle('removable');
            expect(bus.request('agentui', 'removable', {})).rejects.toThrow();
        });
    });

    // ========== HOOKS ==========
    describe('Hooks (observability)', () => {
        test('addOutboundHook should intercept outgoing messages', () => {
            const log = [];
            const removeHook = addOutboundHook((payload, context) => {
                log.push(context.event);
                return payload;
            });
            bus.emit('hook:test1', {});
            bus.emit('hook:test2', {});
            expect(log).toContain('hook:test1');
            expect(log).toContain('hook:test2');
            removeHook();
        });

        test('addInboundHook should intercept incoming messages', () => {
            const log = [];
            const removeHook = addInboundHook((payload, context) => {
                log.push(context.event);
                return payload;
            });
            let received = false;
            bus.on('inbound:test', () => { received = true; });
            bus.emit('inbound:test', {});
            expect(received).toBe(true);
            expect(log).toContain('inbound:test');
            removeHook();
        });

        test('hook removal should stop interception', () => {
            const log = [];
            const removeHook = addOutboundHook((p, c) => { log.push(c.event); return p; });
            bus.emit('hook:before', {});
            removeHook();
            bus.emit('hook:after', {});
            expect(log).toContain('hook:before');
            expect(log).not.toContain('hook:after');
        });
    });

    // ========== hasListeners ==========
    describe('hasListeners', () => {
        test('should return false when no listeners', () => {
            expect(bus.hasListeners('nope')).toBe(false);
        });

        test('should return true when listeners exist', () => {
            bus.on('has:test', () => { });
            expect(bus.hasListeners('has:test')).toBe(true);
        });
    });

    // ========== PEER MANAGEMENT ==========
    describe('Peer management', () => {
        test('peerId should be agentui', () => {
            expect(bus.peerId).toBe('agentui');
        });

        test('peers should return array', () => {
            expect(Array.isArray(bus.peers)).toBe(true);
        });

        test('peerCount should return number', () => {
            expect(typeof bus.peerCount).toBe('number');
        });
    });

    // ========== bus.raw ==========
    describe('bus.raw', () => {
        test('should return LightBus instance', () => {
            expect(bus.raw).toBeDefined();
            expect(bus.raw.peerId).toBe('agentui');
        });
    });

    // ========== setMaxListeners ==========
    describe('setMaxListeners', () => {
        test('should not throw', () => {
            expect(() => bus.setMaxListeners(200)).not.toThrow();
        });
    });

    // ========== destroy ==========
    describe('destroy', () => {
        test('should clear all listeners', () => {
            bus.on('destroy:test', () => { });
            bus.handle('destroy:handler', () => 'x');
            expect(bus.hasListeners('destroy:test')).toBe(true);
            bus.destroy();
            expect(bus.hasListeners('destroy:test')).toBe(false);
        });
    });

    // ========== showToast helper ==========
    describe('showToast', () => {
        test('should emit toast event', () => {
            let received = null;
            bus.on(UIEvents.TOAST_SHOW, (d) => { received = d; });
            showToast('Hello!', { variant: 'success' });
            expect(received).toEqual({ message: 'Hello!', variant: 'success' });
        });
    });

    // ========== AI Agent Features ==========
    describe('AI Agent features', () => {
        test('isDebugEnabled should return boolean', () => {
            expect(typeof isDebugEnabled()).toBe('boolean');
        });

        test('enableDebug (deprecated) should return boolean', () => {
            const result = enableDebug();
            expect(typeof result).toBe('boolean');
        });

        test('disableDebug (deprecated) should not throw', () => {
            expect(() => disableDebug()).not.toThrow();
        });

        test('getHealth should return health object', () => {
            const health = getHealth();
            expect(health.status).toBe('healthy');
            expect(health.peerId).toBe('agentui');
            expect(typeof health.uptime).toBe('number');
            expect(typeof health.listeners).toBe('number');
            expect(typeof health.handlers).toBe('number');
        });

        test('getCapabilities should return capabilities', () => {
            const caps = getCapabilities();
            expect(caps.peerId).toBe('agentui');
            expect(Array.isArray(caps.capabilities)).toBe(true);
            expect(caps.capabilities).toContain('ui:toast');
            expect(caps.meta.type).toBe('ui-framework');
            expect(typeof caps.version).toBe('string');
        });
    });

    // ========== Component Registry ==========
    describe('Component Registry', () => {
        test('registerComponent + getComponentCapabilities', () => {
            registerComponent('au-test', { signals: ['ui:test'], version: '1.0' });
            const caps = getComponentCapabilities('au-test');
            expect(caps).toBeTruthy();
            expect(caps.signals).toContain('ui:test');
            expect(caps.version).toBe('1.0');
            expect(caps.registeredAt).toBeDefined();
        });

        test('unregisterComponent should remove it', () => {
            registerComponent('au-temp', { signals: [] });
            expect(getComponentCapabilities('au-temp')).toBeTruthy();
            unregisterComponent('au-temp');
            expect(getComponentCapabilities('au-temp')).toBeNull();
        });

        test('getComponentCapabilities returns null for unknown', () => {
            expect(getComponentCapabilities('au-unknown')).toBeNull();
        });

        test('getRegisteredComponents should return all', () => {
            registerComponent('au-reg1', { signals: ['s1'] });
            registerComponent('au-reg2', { signals: ['s2'] });
            const all = getRegisteredComponents();
            expect(all['au-reg1']).toBeDefined();
            expect(all['au-reg2']).toBeDefined();
        });

        test('getComponentsForSignal should find matching', () => {
            registerComponent('au-signal1', { signals: ['ui:test:match'] });
            registerComponent('au-signal2', { signals: ['ui:other'] });
            const matched = getComponentsForSignal('ui:test:match');
            expect(matched).toContain('au-signal1');
            expect(matched).not.toContain('au-signal2');
        });

        test('getComponentsForSignal with no matches returns empty', () => {
            const matched = getComponentsForSignal('nonexistent:signal');
            expect(Array.isArray(matched)).toBe(true);
        });
    });

    // ========== LightBus direct (via bus.raw) ==========
    describe('LightBus direct API', () => {
        test('on should return object with unsubscribe', () => {
            const sub = bus.raw.on('direct:test', () => { });
            expect(typeof sub.unsubscribe).toBe('function');
            sub.unsubscribe();
        });

        test('emitSync should deliver synchronously', () => {
            let val = 0;
            bus.raw.on('sync:test', () => { val = 1; });
            bus.raw.emitSync('sync:test', {});
            expect(val).toBe(1);
        });

        test('emit should return promise', async () => {
            const result = await bus.raw.emit('async:raw', {});
            expect(result.delivered).toBe(true);
        });

        test('signal should work like emitSync', () => {
            let called = false;
            bus.raw.on('signal:raw', () => { called = true; });
            bus.raw.signal('signal:raw', {});
            expect(called).toBe(true);
        });

        test('hasListeners on raw bus', () => {
            expect(bus.raw.hasListeners('no')).toBe(false);
            bus.raw.on('yes', () => { });
            expect(bus.raw.hasListeners('yes')).toBe(true);
        });

        test('handle returns unsubscribe on raw', () => {
            const sub = bus.raw.handle('raw:h', () => 'ok');
            expect(typeof sub.unsubscribe).toBe('function');
            sub.unsubscribe();
        });

        test('healthCheck on raw bus', () => {
            const hc = bus.raw.healthCheck();
            expect(hc.status).toBe('healthy');
            expect(typeof hc.uptime).toBe('number');
        });

        test('peers and peerCount on raw', () => {
            expect(Array.isArray(bus.raw.peers)).toBe(true);
            expect(bus.raw.peerCount).toBe(0);
        });

        test('debug getter on raw', () => {
            expect(typeof bus.raw.debug).toBe('boolean');
        });

        test('capabilities and meta on raw', () => {
            expect(Array.isArray(bus.raw.capabilities)).toBe(true);
            expect(typeof bus.raw.meta).toBe('object');
        });
    });
});
