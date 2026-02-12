/**
 * @fileoverview TDD Tests for scanPageComponents function
 * 
 * Tests the automatic detection of au-* components from HTML pages
 */

import { describe, test, expect, beforeAll } from 'bun:test';

// Import the function we'll implement
let scanPageComponents;

beforeAll(async () => {
    // Dynamic import to allow test to run before implementation
    try {
        const module = await import('../../scripts/build-utils.js');
        scanPageComponents = module.scanPageComponents;
    } catch (e) {
        // Function not implemented yet - TDD red phase
        scanPageComponents = () => { throw new Error('Not implemented'); };
    }
});

describe('scanPageComponents', () => {

    test('should extract au-* tags from a single page div', () => {
        const html = `
            <div id="page-test">
                <au-button>Click</au-button>
                <au-stack>
                    <au-card>Content</au-card>
                </au-stack>
            </div>
        `;

        const result = scanPageComponents(html);

        expect(result.test).toBeDefined();
        expect(result.test).toContain('au-button');
        expect(result.test).toContain('au-stack');
        expect(result.test).toContain('au-card');
    });

    test('should extract au-tabs and au-tab separately', () => {
        const html = `
            <div id="page-enterprise">
                <au-tabs active="0">
                    <au-tab>Overview</au-tab>
                    <au-tab>API</au-tab>
                </au-tabs>
            </div>
        `;

        const result = scanPageComponents(html);

        expect(result.enterprise).toBeDefined();
        expect(result.enterprise).toContain('au-tabs');
        expect(result.enterprise).toContain('au-tab');
    });

    test('should handle multiple pages', () => {
        const html = `
            <div id="page-home">
                <au-card>Welcome</au-card>
            </div>
            <div id="page-buttons">
                <au-button>Click</au-button>
                <au-stack>Stack</au-stack>
            </div>
            <div id="page-inputs">
                <au-input placeholder="Type"></au-input>
            </div>
        `;

        const result = scanPageComponents(html);

        expect(Object.keys(result)).toHaveLength(3);
        expect(result.home).toContain('au-card');
        expect(result.buttons).toContain('au-button');
        expect(result.buttons).toContain('au-stack');
        expect(result.inputs).toContain('au-input');
    });

    test('should deduplicate components within a page', () => {
        const html = `
            <div id="page-demo">
                <au-button>One</au-button>
                <au-button>Two</au-button>
                <au-button>Three</au-button>
            </div>
        `;

        const result = scanPageComponents(html);

        // Should only contain au-button once
        const buttonCount = result.demo.filter(c => c === 'au-button').length;
        expect(buttonCount).toBe(1);
    });

    test('should handle hyphenated component names', () => {
        const html = `
            <div id="page-layout">
                <au-bottom-nav>Nav</au-bottom-nav>
                <au-drawer-item>Item</au-drawer-item>
                <au-api-table>Table</au-api-table>
            </div>
        `;

        const result = scanPageComponents(html);

        expect(result.layout).toContain('au-bottom-nav');
        expect(result.layout).toContain('au-drawer-item');
        expect(result.layout).toContain('au-api-table');
    });

    test('should ignore non-mu elements', () => {
        const html = `
            <div id="page-mixed">
                <div class="wrapper">
                    <au-button>Click</au-button>
                    <span>Text</span>
                    <p>Paragraph</p>
                </div>
            </div>
        `;

        const result = scanPageComponents(html);

        expect(result.mixed).toHaveLength(1);
        expect(result.mixed).toContain('au-button');
    });

    test('should return empty object for HTML without pages', () => {
        const html = `
            <html>
                <body>
                    <au-button>No page div</au-button>
                </body>
            </html>
        `;

        const result = scanPageComponents(html);

        expect(Object.keys(result)).toHaveLength(0);
    });

    test('should handle self-closing au-* tags', () => {
        const html = `
            <div id="page-icons">
                <au-icon name="home" />
                <au-spinner />
            </div>
        `;

        const result = scanPageComponents(html);

        expect(result.icons).toContain('au-icon');
        expect(result.icons).toContain('au-spinner');
    });

    test('should be case-insensitive and normalize to lowercase', () => {
        const html = `
            <div id="page-case">
                <AU-BUTTON>Upper</AU-BUTTON>
                <Au-Card>Mixed</Au-Card>
            </div>
        `;

        const result = scanPageComponents(html);

        expect(result.case).toContain('au-button');
        expect(result.case).toContain('au-card');
    });
});
