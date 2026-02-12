/**
 * @fileoverview Tests for Feature Registry (Enterprise Features)
 * Tests createFeature, getFeatures, getFeature, getFeatureComponents, destroyFeature
 */

import { describe, test, expect, beforeEach, beforeAll } from 'bun:test';

let createFeature, getFeatures, getFeature, getFeatureComponents;
let getFeatureRoutes, getFeatureByRoute, getFeatureByComponent;
let destroyFeature, getFeatureSummary, clearFeatures, FeatureRegistry;

describe('Feature Registry', () => {

    beforeAll(async () => {
        const module = await import('../../src/core/feature-registry.js');
        createFeature = module.createFeature;
        getFeatures = module.getFeatures;
        getFeature = module.getFeature;
        getFeatureComponents = module.getFeatureComponents;
        getFeatureRoutes = module.getFeatureRoutes;
        getFeatureByRoute = module.getFeatureByRoute;
        getFeatureByComponent = module.getFeatureByComponent;
        destroyFeature = module.destroyFeature;
        getFeatureSummary = module.getFeatureSummary;
        clearFeatures = module.clearFeatures;
        FeatureRegistry = module.FeatureRegistry;
    });

    beforeEach(() => { clearFeatures(); });

    // ========================================
    // createFeature
    // ========================================

    test('createFeature creates feature with name', () => {
        const f = createFeature('user', { routes: ['/user'] });
        expect(f.name).toBe('user');
    });

    test('createFeature returns existing for same name', () => {
        const f1 = createFeature('dup', {});
        const f2 = createFeature('dup', { routes: ['/x'] });
        expect(f1).toBe(f2);
    });

    test('createFeature with init calls init', () => {
        let called = false;
        createFeature('init-test', { init: () => { called = true; } });
        expect(called).toBe(true);
    });

    test('createFeature with init sets initialized', () => {
        const f = createFeature('init-flag', { init: () => { } });
        expect(f.initialized).toBe(true);
    });

    test('createFeature sets registeredAt', () => {
        const f = createFeature('time', {});
        expect(typeof f.registeredAt).toBe('number');
    });

    test('createFeature handles init error', () => {
        const f = createFeature('err', { init: () => { throw new Error('fail'); } });
        expect(f.initialized).toBe(false);
    });

    // ========================================
    // getFeatures / getFeature
    // ========================================

    test('getFeatures returns all features', () => {
        createFeature('a', {});
        createFeature('b', {});
        const all = getFeatures();
        expect(all.a).toBeDefined();
        expect(all.b).toBeDefined();
    });

    test('getFeature returns feature by name', () => {
        createFeature('single', { meta: { v: 1 } });
        const f = getFeature('single');
        expect(f.config.meta.v).toBe(1);
    });

    test('getFeature returns undefined for unknown', () => {
        expect(getFeature('unknown')).toBeUndefined();
    });

    // ========================================
    // getFeatureComponents / getFeatureRoutes
    // ========================================

    test('getFeatureComponents returns components', () => {
        createFeature('comp', { components: ['au-card', 'au-form'] });
        expect(getFeatureComponents('comp')).toEqual(['au-card', 'au-form']);
    });

    test('getFeatureRoutes returns routes', () => {
        createFeature('route', { routes: ['/a', '/b'] });
        expect(getFeatureRoutes('route')).toEqual(['/a', '/b']);
    });

    test('getFeatureComponents returns empty for unknown', () => {
        expect(getFeatureComponents('nope')).toEqual([]);
    });

    test('getFeatureRoutes returns empty for unknown', () => {
        expect(getFeatureRoutes('nope')).toEqual([]);
    });

    // ========================================
    // getFeatureByRoute / getFeatureByComponent
    // ========================================

    test('getFeatureByRoute finds by route prefix', () => {
        createFeature('admin', { routes: ['/admin'] });
        const f = getFeatureByRoute('/admin/users');
        expect(f.name).toBe('admin');
    });

    test('getFeatureByRoute returns null if no match', () => {
        expect(getFeatureByRoute('/nonexistent')).toBeNull();
    });

    test('getFeatureByComponent finds by component tag', () => {
        createFeature('widgets', { components: ['au-widget'] });
        const f = getFeatureByComponent('au-widget');
        expect(f.name).toBe('widgets');
    });

    test('getFeatureByComponent returns null if no match', () => {
        expect(getFeatureByComponent('au-unknown')).toBeNull();
    });

    // ========================================
    // destroyFeature
    // ========================================

    test('destroyFeature removes feature', () => {
        createFeature('destroy-test', {});
        destroyFeature('destroy-test');
        expect(getFeature('destroy-test')).toBeUndefined();
    });

    test('destroyFeature calls destroy callback', () => {
        let called = false;
        createFeature('destroy-cb', { destroy: () => { called = true; } });
        destroyFeature('destroy-cb');
        expect(called).toBe(true);
    });

    test('destroyFeature handles non-existent', () => {
        destroyFeature('nope');
        expect(true).toBe(true);
    });

    test('destroyFeature handles destroy error', () => {
        createFeature('destroy-err', { destroy: () => { throw new Error('fail'); } });
        destroyFeature('destroy-err');
        expect(getFeature('destroy-err')).toBeUndefined();
    });

    // ========================================
    // getFeatureSummary
    // ========================================

    test('getFeatureSummary returns summary object', () => {
        createFeature('s1', { routes: ['/x'], components: ['a'], store: {} });
        const summary = getFeatureSummary();
        expect(summary.totalFeatures).toBe(1);
        expect(summary.totalRoutes).toBe(1);
        expect(summary.totalComponents).toBe(1);
        expect(summary.features[0].hasStore).toBe(true);
    });

    // ========================================
    // clearFeatures
    // ========================================

    test('clearFeatures removes all features', () => {
        createFeature('a', {});
        createFeature('b', {});
        clearFeatures();
        expect(Object.keys(getFeatures()).length).toBe(0);
    });

    // ========================================
    // FeatureRegistry export
    // ========================================

    test('FeatureRegistry has all methods', () => {
        expect(FeatureRegistry.createFeature).toBe(createFeature);
        expect(FeatureRegistry.getFeatures).toBe(getFeatures);
        expect(FeatureRegistry.clearFeatures).toBe(clearFeatures);
        expect(FeatureRegistry.destroyFeature).toBe(destroyFeature);
        expect(FeatureRegistry.getFeatureSummary).toBe(getFeatureSummary);
    });
});
