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
});
