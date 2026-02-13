/**
 * @fileoverview E2E Tests for 2026 Agent Features
 * 
 * Tests Agent API, Visual Markers, Component Schema, MCP Actions with real browser
 */

import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { launchBrowser, puppeteer } from './puppeteer-helper.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, rmSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('2026 Agent Features E2E', () => {
    let browser;
    let page;
    let server;
    const userDataDir = `./.tmp/puppeteer-agent-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    beforeAll(async () => {
        mkdirSync(userDataDir, { recursive: true });

        // Start server
        const projectRoot = join(__dirname, '../..');
        server = Bun.serve({
            port: 0,
            async fetch(req) {
                const url = new URL(req.url);
                let filePath = join(projectRoot, url.pathname);

                // Serve a simple test page that loads IIFE bundle
                if (url.pathname === '/') {
                    return new Response(`<!DOCTYPE html>
<html>
<head><title>Agent Test</title></head>
<body>
    <au-button id="test-btn" variant="filled">Save</au-button>
    <au-button id="cancel-btn" variant="text">Cancel</au-button>
    <au-input id="test-input" label="Email"></au-input>
    <au-checkbox id="test-check">Agree</au-checkbox>
    <au-card id="test-card">Card Content</au-card>
    <script src="/dist/agentui.min.js"></script>
</body>
</html>`, { headers: { 'Content-Type': 'text/html' } });
                }

                try {
                    const file = Bun.file(filePath);
                    if (!await file.exists()) {
                        return new Response('Not Found', { status: 404 });
                    }
                    const content = await file.text();
                    const ext = filePath.split('.').pop();
                    const mimeTypes = { 'html': 'text/html', 'js': 'text/javascript', 'css': 'text/css', 'json': 'application/json' };
                    return new Response(content, { headers: { 'Content-Type': mimeTypes[ext] || 'text/plain' } });
                } catch (e) {
                    return new Response('Error: ' + e.message, { status: 500 });
                }
            }
        });

        browser = await launchBrowser({ testName: 'e2e' });
        page = await browser.newPage();
        await page.goto(`http://localhost:${server.port}`, { waitUntil: 'networkidle0', timeout: 30000 });

        // Wait for AgentUI to be fully loaded
        await page.waitForFunction(() => window.AgentUI !== undefined, { timeout: 10000 });
    }, 60000);

    afterAll(async () => {
        await browser?.close();
        server?.stop();
        try { rmSync(userDataDir, { recursive: true, force: true }); } catch { }
    });

    // ========================================
    // AGENT API TESTS
    // ========================================

    describe('Agent API', () => {
        test('getAuComponentTree should return array of components', async () => {
            const result = await page.evaluate(() => {
                const tree = window.AgentUI.getAuComponentTree(document.body);
                return Array.isArray(tree) && tree.length > 0;
            });
            expect(result).toBe(true);
        });

        test('getAuComponentTree should include tag names', async () => {
            const result = await page.evaluate(() => {
                const tree = window.AgentUI.getAuComponentTree(document.body);
                return tree.some(item => item.tag && item.tag.startsWith('au-'));
            });
            expect(result).toBe(true);
        });

        test('describeComponent should return string description', async () => {
            const result = await page.evaluate(() => {
                const btn = document.querySelector('au-button');
                if (!btn) return 'no-button';
                const desc = window.AgentUI.describeComponent(btn);
                return typeof desc === 'string' && desc.length > 0;
            });
            expect(result).toBe(true);
        });

        test('findByLabel should find components by text', async () => {
            const result = await page.evaluate(() => {
                const results = window.AgentUI.findByLabel('Components', document.body);
                return Array.isArray(results);
            });
            expect(result).toBe(true);
        });

        test('getRegisteredComponents should return Map', async () => {
            const result = await page.evaluate(() => {
                const components = window.AgentUI.getRegisteredComponents();
                return components instanceof Map && components.size > 0;
            });
            expect(result).toBe(true);
        });
    });

    // ========================================
    // VISUAL MARKERS TESTS
    // ========================================

    describe('Visual Markers', () => {
        test('enableVisualMarkers should be a function', async () => {
            const result = await page.evaluate(() => typeof window.AgentUI.enableVisualMarkers === 'function');
            expect(result).toBe(true);
        });

        test('disableVisualMarkers should be a function', async () => {
            const result = await page.evaluate(() => typeof window.AgentUI.disableVisualMarkers === 'function');
            expect(result).toBe(true);
        });

        test('enableVisualMarkers should create marker mapping', async () => {
            const result = await page.evaluate(() => {
                window.AgentUI.enableVisualMarkers({ style: 'badge' });
                const map = window.AgentUI.getMarkerMap();
                const markersExist = Object.keys(map).length > 0;
                window.AgentUI.disableVisualMarkers();
                return markersExist;
            });
            expect(result).toBe(true);
        });

        test('getMarkerMap should return marker mappings', async () => {
            const result = await page.evaluate(() => {
                window.AgentUI.enableVisualMarkers();
                const map = window.AgentUI.getMarkerMap();
                window.AgentUI.disableVisualMarkers();
                return typeof map === 'object' && Object.keys(map).length > 0;
            });
            expect(result).toBe(true);
        });

        test('getMarkerElement should retrieve element by marker ID', async () => {
            const result = await page.evaluate(() => {
                window.AgentUI.enableVisualMarkers();
                const map = window.AgentUI.getMarkerMap();
                const firstKey = Object.keys(map)[0];
                const element = window.AgentUI.getMarkerElement(firstKey);
                window.AgentUI.disableVisualMarkers();
                return element !== null && element instanceof HTMLElement;
            });
            expect(result).toBe(true);
        });

        test('disableVisualMarkers should remove all markers', async () => {
            const result = await page.evaluate(() => {
                window.AgentUI.enableVisualMarkers();
                window.AgentUI.disableVisualMarkers();
                const markers = document.querySelectorAll('[data-au-marker]');
                return markers.length === 0;
            });
            expect(result).toBe(true);
        });
    });

    // ========================================
    // COMPONENT SCHEMA TESTS
    // ========================================

    describe('Component Schema', () => {
        test('getComponentSchema should return schema for au-button', async () => {
            const result = await page.evaluate(() => {
                const schema = window.AgentUI.getComponentSchema('au-button');
                return schema !== null && schema.title === 'au-button';
            });
            expect(result).toBe(true);
        });

        test('schema should include properties', async () => {
            const result = await page.evaluate(() => {
                const schema = window.AgentUI.getComponentSchema('au-button');
                return schema.properties && schema.properties.variant;
            });
            expect(result).toBeTruthy();
        });

        test('schema should include actions', async () => {
            const result = await page.evaluate(() => {
                const schema = window.AgentUI.getComponentSchema('au-button');
                return Array.isArray(schema.actions) && schema.actions.includes('click');
            });
            expect(result).toBe(true);
        });

        test('getAllSchemas should return Map with multiple schemas', async () => {
            const result = await page.evaluate(() => {
                const schemas = window.AgentUI.getAllSchemas();
                return schemas instanceof Map && schemas.size >= 10;
            });
            expect(result).toBe(true);
        });

        test('getSchemaComponents should return array of tag names', async () => {
            const result = await page.evaluate(() => {
                const components = window.AgentUI.getSchemaComponents();
                return Array.isArray(components) && components.includes('au-button');
            });
            expect(result).toBe(true);
        });

        test('getSchemaQuickRef should return minimal summary', async () => {
            const result = await page.evaluate(() => {
                const ref = window.AgentUI.getSchemaQuickRef('au-input');
                return ref && ref.tag === 'au-input' && Array.isArray(ref.properties);
            });
            expect(result).toBe(true);
        });
    });

    // ========================================
    // MCP ACTIONS TESTS
    // ========================================

    describe('MCP Actions', () => {
        test('getMCPActions should return MCP-compatible schema', async () => {
            const result = await page.evaluate(() => {
                const actions = window.AgentUI.getMCPActions();
                return actions && actions.name === 'agentui' && Array.isArray(actions.actions);
            });
            expect(result).toBe(true);
        });

        test('should include click_button action', async () => {
            const result = await page.evaluate(() => {
                const actions = window.AgentUI.getMCPActions();
                return actions.actions.some(a => a.name === 'click_button');
            });
            expect(result).toBe(true);
        });

        test('should include fill_input action', async () => {
            const result = await page.evaluate(() => {
                const actions = window.AgentUI.getMCPActions();
                return actions.actions.some(a => a.name === 'fill_input');
            });
            expect(result).toBe(true);
        });

        test('should include toggle_checkbox action', async () => {
            const result = await page.evaluate(() => {
                const actions = window.AgentUI.getMCPActions();
                return actions.actions.some(a => a.name === 'toggle_checkbox');
            });
            expect(result).toBe(true);
        });

        test('actions should have parameters with types', async () => {
            const result = await page.evaluate(() => {
                const actions = window.AgentUI.getMCPActions();
                const clickAction = actions.actions.find(a => a.name === 'click_button');
                return clickAction.parameters && clickAction.parameters.selector && clickAction.parameters.selector.type;
            });
            expect(result).toBeTruthy();
        });
    });

    // ========================================
    // SEMANTIC ATTRIBUTES TESTS
    // ========================================

    describe('Semantic Attributes', () => {
        test('buttons should have data-au-action attribute', async () => {
            const result = await page.evaluate(() => {
                const btn = document.querySelector('au-button');
                return btn && btn.hasAttribute('data-au-action');
            });
            expect(result).toBe(true);
        });

        test('buttons should have data-au-role attribute', async () => {
            const result = await page.evaluate(() => {
                const btn = document.querySelector('au-button');
                return btn && btn.hasAttribute('data-au-role');
            });
            expect(result).toBe(true);
        });

        test('filled button should have primary-action role', async () => {
            const result = await page.evaluate(() => {
                const btn = document.querySelector('au-button[variant="filled"]');
                return btn && btn.getAttribute('data-au-role') === 'primary-action';
            });
            expect(result).toBe(true);
        });
    });




    // ========================================
    // NEW COMPONENTS TESTS
    // ========================================

    describe('New Components', () => {
        test('au-error-boundary should be registered', async () => {
            const result = await page.evaluate(() => customElements.get('au-error-boundary') !== undefined);
            expect(result).toBe(true);
        });

        test('au-confirm should be registered', async () => {
            const result = await page.evaluate(() => customElements.get('au-confirm') !== undefined);
            expect(result).toBe(true);
        });

        test('au-fetch should be registered', async () => {
            const result = await page.evaluate(() => customElements.get('au-fetch') !== undefined);
            expect(result).toBe(true);
        });

        test('auConfirm function should be available', async () => {
            const result = await page.evaluate(() => typeof window.AgentUI.auConfirm === 'function');
            expect(result).toBe(true);
        });
    });
});
