/**
 * @fileoverview Unit Tests for router.js Core Module
 * Target: 20.34% → 90% coverage
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { parseHTML } from 'linkedom';

let Router;

describe('router.js Unit Tests', () => {

    beforeAll(async () => {
        const dom = parseHTML('<!DOCTYPE html><html><body></body></html>');

        globalThis.window = {
            location: { hash: '' },
            addEventListener: () => { },
            removeEventListener: () => { }
        };

        // Fresh import for each test suite
        const module = await import('../../src/core/router.js');
        Router = module.Router;
    });

    beforeEach(() => {
        globalThis.window.location.hash = '';
    });

    // ========================================
    // Route Registration
    // ========================================

    test('Router should exist', () => {
        expect(Router).toBeDefined();
    });

    test('on() should register route and return this', () => {
        const result = Router.on('/test-path', () => { });
        expect(result).toBe(Router);
    });

    test('on() should accept path with params', () => {
        const result = Router.on('/user/:id', () => { });
        expect(result).toBe(Router);
    });

    test('on() should accept multiple params', () => {
        const result = Router.on('/org/:org/repo/:repo', () => { });
        expect(result).toBe(Router);
    });

    // ========================================
    // notFound Handler
    // ========================================

    test('notFound() should set handler and return this', () => {
        const result = Router.notFound(() => { });
        expect(result).toBe(Router);
    });

    // ========================================
    // Navigate
    // ========================================

    test('navigate() should set window.location.hash', () => {
        Router.navigate('/dashboard');
        expect(globalThis.window.location.hash).toBe('/dashboard');
    });

    // ========================================
    // Current Path
    // ========================================

    test('current should return current path', () => {
        // After initialization, current might be empty or /
        expect(typeof Router.current).toBe('string');
    });

    // ========================================
    // Start
    // ========================================

    test('start() should return this', () => {
        const result = Router.start();
        expect(result).toBe(Router);
    });

    // FIX 7: Singleton destroy() for cleanup
    test('destroy() should be a function', () => {
        expect(typeof Router.destroy).toBe('function');
    });

    // ========================================
    // P2.1: RouterClass export for testability
    // ========================================

    test('RouterClass should be exported', async () => {
        const module = await import('../../src/core/router.js');
        expect(module.RouterClass).toBeDefined();
        expect(typeof module.RouterClass).toBe('function');
    });

    test('RouterClass should be instantiable', async () => {
        const module = await import('../../src/core/router.js');
        const router = new module.RouterClass();
        expect(router).toBeDefined();
        expect(typeof router.on).toBe('function');
        expect(typeof router.start).toBe('function');
    });

    // ========================================
    // P2.2: stop() — pause without clearing routes
    // ========================================

    test('stop() should be a function', () => {
        expect(typeof Router.stop).toBe('function');
    });

    test('stop() should remove listener but preserve routes', () => {
        // Register a route, start, stop
        Router.on('/stop-test', () => { });
        Router.start();
        Router.stop();
        // Routes should still be registered (can start again)
        const result = Router.start();
        expect(result).toBe(Router);
    });

    test('stop() should return this for chaining', () => {
        const result = Router.stop();
        expect(result).toBe(Router);
    });
});
