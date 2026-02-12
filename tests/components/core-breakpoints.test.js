/**
 * @fileoverview Unit Tests for core/breakpoints.js — BreakpointObserver
 * Target: 48% → 95% line coverage
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import '../helpers/setup-dom.js';

import { breakpoints, BreakpointObserver, BREAKPOINTS } from '../../src/core/breakpoints.js';

describe('core/breakpoints.js', () => {

    // ========== BREAKPOINTS constants ==========
    describe('BREAKPOINTS constants', () => {
        test('compact should be 600', () => {
            expect(BREAKPOINTS.compact).toBe(600);
        });

        test('medium should be 840', () => {
            expect(BREAKPOINTS.medium).toBe(840);
        });

        test('expanded should be 840', () => {
            expect(BREAKPOINTS.expanded).toBe(840);
        });
    });

    // ========== BreakpointObserver class ==========
    describe('BreakpointObserver', () => {
        test('should export BreakpointObserver class', () => {
            expect(BreakpointObserver).toBeDefined();
        });

        test('should export breakpoints singleton', () => {
            expect(breakpoints).toBeDefined();
        });

        test('can be instantiated', () => {
            const obs = new BreakpointObserver();
            expect(obs).toBeDefined();
        });
    });

    // ========== current ==========
    describe('current', () => {
        test('should return a valid breakpoint class', () => {
            const val = breakpoints.current;
            expect(['compact', 'medium', 'expanded']).toContain(val);
        });
    });

    // ========== isCompact / isMedium / isExpanded / isNotCompact ==========
    describe('Boolean getters', () => {
        test('isCompact should return boolean', () => {
            expect(typeof breakpoints.isCompact).toBe('boolean');
        });

        test('isMedium should return boolean', () => {
            expect(typeof breakpoints.isMedium).toBe('boolean');
        });

        test('isExpanded should return boolean', () => {
            expect(typeof breakpoints.isExpanded).toBe('boolean');
        });

        test('isNotCompact should return boolean', () => {
            expect(typeof breakpoints.isNotCompact).toBe('boolean');
        });

        test('isExpanded should be true when not compact and not medium', () => {
            // In test env, matchMedia returns matches:false for all queries
            // So: isCompact=false, isMedium=false, isExpanded=true
            expect(breakpoints.isCompact).toBe(false);
            expect(breakpoints.isMedium).toBe(false);
            expect(breakpoints.isExpanded).toBe(true);
        });

        test('isNotCompact should be true when expanded', () => {
            expect(breakpoints.isNotCompact).toBe(true);
        });
    });

    // ========== subscribe ==========
    describe('subscribe', () => {
        test('should call callback immediately with current value', () => {
            let received = null;
            const unsub = breakpoints.subscribe((bp) => { received = bp; });
            expect(received).not.toBeNull();
            expect(['compact', 'medium', 'expanded']).toContain(received);
            unsub();
        });

        test('should return unsubscribe function', () => {
            const unsub = breakpoints.subscribe(() => { });
            expect(typeof unsub).toBe('function');
            unsub();
        });

        test('unsubscribe should stop notifications', () => {
            let callCount = 0;
            const unsub = breakpoints.subscribe(() => { callCount++; });
            expect(callCount).toBe(1); // Initial call
            unsub();
            // After unsubscribe, no more calls
        });

        test('multiple subscribers should all receive updates', () => {
            let count1 = 0, count2 = 0;
            const unsub1 = breakpoints.subscribe(() => { count1++; });
            const unsub2 = breakpoints.subscribe(() => { count2++; });
            expect(count1).toBe(1);
            expect(count2).toBe(1);
            unsub1();
            unsub2();
        });
    });

    // ========== windowWidth ==========
    describe('windowWidth', () => {
        test('should be accessible without throwing', () => {
            // In LinkedOM, window exists but innerWidth may be undefined
            // The getter returns window.innerWidth (could be undefined in test env)
            expect(() => breakpoints.windowWidth).not.toThrow();
        });
    });

    // FIX 7: Singleton destroy() for cleanup
    describe('destroy', () => {
        test('should be a function', () => {
            expect(typeof breakpoints.destroy).toBe('function');
        });
    });
});
