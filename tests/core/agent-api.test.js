/**
 * @fileoverview Unit Tests for agent-api.js Module
 * Target: 35% → 70% coverage
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { parseHTML } from 'linkedom';

let getAuComponentTree, findByLabel, enableVisualMarkers, disableVisualMarkers, getMCPActions, executeAction;

describe('agent-api Module Unit Tests', () => {

    beforeAll(async () => {
        const dom = parseHTML('<!DOCTYPE html><html><body></body></html>');
        globalThis.document = dom.document;
        globalThis.window = dom.window;
        globalThis.HTMLElement = dom.HTMLElement;
        globalThis.customElements = dom.customElements;
        globalThis.requestAnimationFrame = (cb) => { cb(Date.now()); return 0; };

        // Mock window dimensions
        globalThis.window.innerHeight = 768;
        globalThis.window.innerWidth = 1024;

        const module = await import('../../src/core/agent-api.js');
        getAuComponentTree = module.getAuComponentTree;
        findByLabel = module.findByLabel;
        enableVisualMarkers = module.enableVisualMarkers;
        disableVisualMarkers = module.disableVisualMarkers;
        getMCPActions = module.getMCPActions;
        executeAction = module.executeAction;
    });

    beforeEach(() => {
        globalThis.document.body.innerHTML = '';
    });

    // GET MU COMPONENT TREE
    test('getAuComponentTree should be a function', () => {
        expect(typeof getAuComponentTree).toBe('function');
    });

    test('getAuComponentTree should return array', () => {
        const result = getAuComponentTree();
        expect(Array.isArray(result)).toBe(true);
    });

    test('getAuComponentTree should return empty array for empty body', () => {
        const result = getAuComponentTree();
        expect(result.length).toBe(0);
    });

    // FIND BY LABEL
    test('findByLabel should be a function', () => {
        expect(typeof findByLabel).toBe('function');
    });

    test('findByLabel should return empty array for no matches', () => {
        const result = findByLabel('nonexistent');
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(0);
    });

    // ENABLE VISUAL MARKERS
    test('enableVisualMarkers should be a function', () => {
        expect(typeof enableVisualMarkers).toBe('function');
    });

    // DISABLE VISUAL MARKERS
    test('disableVisualMarkers should be a function', () => {
        expect(typeof disableVisualMarkers).toBe('function');
    });

    // GET MCP ACTIONS
    test('getMCPActions should be a function', () => {
        expect(typeof getMCPActions).toBe('function');
    });

    test('getMCPActions should return object with name', () => {
        const result = getMCPActions();
        expect(result.name).toBe('agentui');
    });

    test('getMCPActions should have actions array', () => {
        const result = getMCPActions();
        expect(Array.isArray(result.actions)).toBe(true);
    });

    test('getMCPActions should have click_button action', () => {
        const result = getMCPActions();
        const clickAction = result.actions.find(a => a.name === 'click_button');
        expect(clickAction).toBeDefined();
    });

    test('getMCPActions should have fill_input action', () => {
        const result = getMCPActions();
        const fillAction = result.actions.find(a => a.name === 'fill_input');
        expect(fillAction).toBeDefined();
    });

    test('getMCPActions should have toggle_checkbox action', () => {
        const result = getMCPActions();
        const toggleAction = result.actions.find(a => a.name === 'toggle_checkbox');
        expect(toggleAction).toBeDefined();
    });

    // Note: executeAction is internal MCP handler, not a direct export
    // MCP actions are executed through the getMCPActions interface

    // OPTIONS
    test('getAuComponentTree should accept visibleOnly option', () => {
        const result = getAuComponentTree(globalThis.document.body, { visibleOnly: true });
        expect(Array.isArray(result)).toBe(true);
    });

    test('getAuComponentTree should accept interactiveOnly option', () => {
        const result = getAuComponentTree(globalThis.document.body, { interactiveOnly: true });
        expect(Array.isArray(result)).toBe(true);
    });

    test('getAuComponentTree should accept types option', () => {
        const result = getAuComponentTree(globalThis.document.body, { types: ['au-button'] });
        expect(Array.isArray(result)).toBe(true);
    });
});
