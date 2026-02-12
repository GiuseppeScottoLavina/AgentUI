/**
 * @fileoverview Feature Registry - Module Organization for Large-Scale Apps
 * 
 * Enables feature-based code organization for teams working on 
 * different parts of a large application.
 * 
 * Based on 2024-2025 micro-frontend and module federation patterns.
 * 
 * Usage:
 * const userFeature = AgentUI.createFeature('user', {
 *     routes: ['/profile', '/settings'],
 *     store: userStore,
 *     components: ['au-user-card', 'au-user-form']
 * });
 * 
 * // Query features:
 * AgentUI.getFeatures();
 * AgentUI.getFeature('user');
 */

/**
 * @typedef {Object} FeatureConfig
 * @property {string[]} [routes] - Routes owned by this feature
 * @property {Object} [store] - Namespaced store for this feature
 * @property {string[]} [components] - Component tag names in this feature
 * @property {Object} [meta] - Additional metadata
 * @property {Function} [init] - Initialization function
 * @property {Function} [destroy] - Cleanup function
 */

/**
 * @typedef {Object} Feature
 * @property {string} name - Feature name/namespace
 * @property {FeatureConfig} config - Feature configuration
 * @property {boolean} initialized - Whether init() has been called
 * @property {number} registeredAt - Timestamp when registered
 */

/**
 * Registry of all features
 * @type {Map<string, Feature>}
 */
const featureRegistry = new Map();

/**
 * Create and register a new feature module
 * 
 * @param {string} name - Unique feature name (e.g., 'user', 'cart', 'admin')
 * @param {FeatureConfig} config - Feature configuration
 * @returns {Feature} The registered feature
 * 
 * @example
 * const userFeature = createFeature('user', {
 *     routes: ['/profile', '/settings', '/account'],
 *     store: createNamespacedStore('user', { profile: null }),
 *     components: ['au-user-card', 'au-user-avatar', 'au-user-form'],
 *     meta: { version: '1.0.0', team: 'user-team' },
 *     init: () => console.log('User feature initialized'),
 *     destroy: () => console.log('User feature cleanup')
 * });
 */
export function createFeature(name, config = {}) {
    if (featureRegistry.has(name)) {
        console.warn(`[AgentUI] Feature "${name}" already exists. Returning existing.`);
        return featureRegistry.get(name);
    }

    const feature = {
        name,
        config: {
            routes: config.routes || [],
            store: config.store || null,
            components: config.components || [],
            meta: config.meta || {},
            init: config.init || null,
            destroy: config.destroy || null
        },
        initialized: false,
        registeredAt: Date.now()
    };

    featureRegistry.set(name, feature);

    // Auto-initialize if init function provided
    if (feature.config.init && typeof feature.config.init === 'function') {
        try {
            feature.config.init();
            feature.initialized = true;
        } catch (e) {
            console.error(`[AgentUI] Failed to initialize feature "${name}":`, e);
        }
    }

    return feature;
}

/**
 * Get all registered features
 * @returns {Object<string, Feature>}
 */
export function getFeatures() {
    const features = {};
    for (const [name, feature] of featureRegistry) {
        features[name] = feature;
    }
    return features;
}

/**
 * Get a specific feature by name
 * @param {string} name 
 * @returns {Feature|undefined}
 */
export function getFeature(name) {
    return featureRegistry.get(name);
}

/**
 * Get all components registered to a feature
 * @param {string} featureName 
 * @returns {string[]} Array of component tag names
 */
export function getFeatureComponents(featureName) {
    const feature = featureRegistry.get(featureName);
    return feature?.config.components || [];
}

/**
 * Get all routes registered to a feature
 * @param {string} featureName 
 * @returns {string[]} Array of route paths
 */
export function getFeatureRoutes(featureName) {
    const feature = featureRegistry.get(featureName);
    return feature?.config.routes || [];
}

/**
 * Find which feature owns a specific route
 * @param {string} route 
 * @returns {Feature|null}
 */
export function getFeatureByRoute(route) {
    for (const feature of featureRegistry.values()) {
        if (feature.config.routes.some(r => route.startsWith(r))) {
            return feature;
        }
    }
    return null;
}

/**
 * Find which feature owns a specific component
 * @param {string} componentTag 
 * @returns {Feature|null}
 */
export function getFeatureByComponent(componentTag) {
    for (const feature of featureRegistry.values()) {
        if (feature.config.components.includes(componentTag)) {
            return feature;
        }
    }
    return null;
}

/**
 * Destroy and unregister a feature
 * @param {string} name 
 */
export function destroyFeature(name) {
    const feature = featureRegistry.get(name);
    if (!feature) return;

    // Call destroy callback if provided
    if (feature.config.destroy && typeof feature.config.destroy === 'function') {
        try {
            feature.config.destroy();
        } catch (e) {
            console.error(`[AgentUI] Error destroying feature "${name}":`, e);
        }
    }

    featureRegistry.delete(name);
}

/**
 * Get a summary of all features for agent debugging
 * @returns {Object} Feature summary
 */
export function getFeatureSummary() {
    const summary = {
        totalFeatures: featureRegistry.size,
        features: [],
        totalRoutes: 0,
        totalComponents: 0
    };

    for (const [name, feature] of featureRegistry) {
        const routeCount = feature.config.routes.length;
        const componentCount = feature.config.components.length;

        summary.features.push({
            name,
            routes: routeCount,
            components: componentCount,
            hasStore: !!feature.config.store,
            initialized: feature.initialized,
            meta: feature.config.meta
        });

        summary.totalRoutes += routeCount;
        summary.totalComponents += componentCount;
    }

    return summary;
}

/**
 * Clear all features (for testing)
 */
export function clearFeatures() {
    // Call destroy on each feature first
    for (const name of featureRegistry.keys()) {
        destroyFeature(name);
    }
    featureRegistry.clear();
}

// Export as FeatureRegistry object for convenience
export const FeatureRegistry = {
    createFeature,
    getFeatures,
    getFeature,
    getFeatureComponents,
    getFeatureRoutes,
    getFeatureByRoute,
    getFeatureByComponent,
    destroyFeature,
    getFeatureSummary,
    clearFeatures
};
