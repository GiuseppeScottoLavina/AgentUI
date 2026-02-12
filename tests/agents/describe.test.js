/**
 * @fileoverview Tests for describe() static method (Agent Discoverability)
 * 
 * Tests both the minimal fallback (before catalog loads) and the
 * full metadata (after catalog is loaded via discoverAll/loadDescriptions).
 */

import { describe, test, expect, beforeAll } from 'bun:test';
import { parseHTML } from 'linkedom';

// Mock Browser Environment
const { document, customElements, HTMLElement, window } = parseHTML('<!DOCTYPE html><html><body></body></html>');
globalThis.document = document;
globalThis.customElements = customElements;
globalThis.HTMLElement = HTMLElement;
globalThis.window = window;

describe('Component describe() Method', () => {
    let AuElement, AuButton, AuInput;

    beforeAll(async () => {
        const core = await import('../../src/core/AuElement.js');
        AuElement = core.AuElement;

        const buttonModule = await import('../../src/components/au-button.js');
        AuButton = buttonModule.AuButton;

        const inputModule = await import('../../src/components/au-input.js');
        AuInput = inputModule.AuInput;
    });

    test('AuElement.describe() returns base descriptor (before catalog)', () => {
        // Before catalog loads, describe() should return minimal info
        const desc = AuElement.describe();

        expect(desc).toBeDefined();
        expect(desc.name).toBe('au-element');
        // version is now in runtime (enriched describe)
        expect(desc.runtime).toBeDefined();
        expect(desc.runtime.version).toBeDefined();
        expect(typeof desc.runtime.registered).toBe('boolean');
        expect(typeof desc.runtime.instanceCount).toBe('number');
        expect(Array.isArray(desc.runtime.instances)).toBe(true);
        expect(Array.isArray(desc.props)).toBe(true);
    });

    test('AuButton.describe() returns minimal descriptor before catalog', () => {
        const desc = AuButton.describe();

        expect(desc.name).toBe('au-button');
        // Before catalog, only basic props available
        expect(desc.props).toBeDefined();
    });

    describe('After catalog loaded', () => {
        beforeAll(async () => {
            // Load the catalog (simulates discoverAll())
            const { catalog } = await import('../../src/core/describe-catalog.js');
            AuElement._describeCatalog = catalog;
        });

        test('AuButton.describe() returns detailed descriptor', () => {
            const desc = AuButton.describe();

            expect(desc.name).toBe('au-button');
            expect(desc.description).toContain('button');
            expect(desc.props).toBeDefined();
            expect(desc.props.variant).toBeDefined();
            expect(desc.props.variant.values).toContain('filled');
            expect(desc.props.size.default).toBe('md');
            expect(desc.events['click']).toBeDefined();
            expect(desc.examples.length).toBeGreaterThan(0);
            expect(desc.tips.length).toBeGreaterThan(0);
        });

        test('AuInput.describe() returns detailed descriptor', () => {
            const desc = AuInput.describe();

            expect(desc.name).toBe('au-input');
            expect(desc.description).toContain('text field');
            expect(desc.props.label).toBeDefined();
            expect(desc.props.type.values).toContain('email');
            // Events are now objects with detail structures (v0.1.73)
            expect(desc.events['au-input']).toBeDefined();
            expect(desc.events['au-input'].detail.value).toBe('string');
            expect(desc.tips.length).toBeGreaterThan(0);
        });

        test('describe() is callable via customElements.get()', () => {
            const ButtonClass = customElements.get('au-button');
            expect(ButtonClass).toBeDefined();

            const desc = ButtonClass.describe();
            expect(desc.name).toBe('au-button');
            expect(desc.description).toBeDefined(); // Full metadata after catalog
        });

        test('All 55 catalog entries (50 components + 5 sub-components)', () => {
            const { catalog } = require('../../src/core/describe-catalog.js');
            const tags = Object.keys(catalog);
            expect(tags.length).toBe(55);
        });

        // v0.1.73: Event detail format consistency
        test('Components with object events should have detail structures', () => {
            const { catalog } = require('../../src/core/describe-catalog.js');
            const componentsWithObjectEvents = ['au-input', 'au-checkbox', 'au-switch', 'au-radio', 'au-tabs', 'au-dropdown', 'au-datatable', 'au-sidebar'];

            for (const tag of componentsWithObjectEvents) {
                const entry = catalog[tag];
                expect(typeof entry.events).toBe('object');
                expect(Array.isArray(entry.events)).toBe(false);

                for (const [eventName, eventDef] of Object.entries(entry.events)) {
                    expect(eventName.startsWith('au-')).toBe(true);
                    expect(eventDef).toHaveProperty('detail');
                }
            }
        });

        // v0.1.73: au-input should have methods field
        test('au-input describe() includes methods', () => {
            const desc = AuInput.describe();
            expect(desc.methods).toContain('clear()');
            expect(desc.methods).toContain('focus()');
        });

        // v0.1.71: au-icon should have bundledIcons
        test('au-icon describe() includes bundledIcons', async () => {
            const { catalog } = require('../../src/core/describe-catalog.js');
            const iconDesc = catalog['au-icon'];
            expect(iconDesc.bundledIcons).toBeDefined();
            expect(Array.isArray(iconDesc.bundledIcons)).toBe(true);
            expect(iconDesc.bundledIcons.length).toBeGreaterThan(40);
            expect(iconDesc.bundledIcons).toContain('home');
            expect(iconDesc.bundledIcons).toContain('settings');
        });

        // v0.1.129: describe() enriched with runtime info
        test('describe() includes runtime info when catalog is loaded', () => {
            const desc = AuButton.describe();
            expect(desc.runtime).toBeDefined();
            expect(typeof desc.runtime.registered).toBe('boolean');
            expect(typeof desc.runtime.instanceCount).toBe('number');
            expect(Array.isArray(desc.runtime.instances)).toBe(true);
            expect(desc.runtime.version).toBeDefined();
        });

        // v0.1.129: composition gotchas in catalog
        test('components with interaction gotchas have composition data', () => {
            const { catalog } = require('../../src/core/describe-catalog.js');

            // au-button should have au-modal composition
            expect(catalog['au-button'].composition).toBeDefined();
            expect(catalog['au-button'].composition['au-modal']?.works).toBe(true);
            expect(catalog['au-button'].composition['au-modal']?.gotchas.length).toBeGreaterThan(0);

            // au-dropdown should have au-modal composition
            expect(catalog['au-dropdown'].composition).toBeDefined();
            expect(catalog['au-dropdown'].composition['au-modal']?.gotchas.length).toBeGreaterThan(0);

            // au-checkbox should have dynamic-render composition
            expect(catalog['au-checkbox'].composition).toBeDefined();
            expect(catalog['au-checkbox'].composition['dynamic-render']?.gotchas.length).toBeGreaterThan(0);

            // au-input should have au-modal composition
            expect(catalog['au-input'].composition).toBeDefined();
            expect(catalog['au-input'].composition['au-modal']?.gotchas.length).toBeGreaterThan(0);
        });
    });
});
