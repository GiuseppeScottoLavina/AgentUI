/**
 * @fileoverview au-fetch Slot Template Security Tests
 * 
 * R7: Tests that au-fetch sanitizes slot template content before innerHTML injection.
 * Loading, empty, and error templates from DOM should strip dangerous elements.
 * 
 * Note: We construct elements without the `url` attribute so auto-fetch is not triggered
 * (avoiding linkedom's dispatchEvent readonly property issue).
 */

import { describe, test, expect } from 'bun:test';
import '../../tests/setup-dom.js';
import '../../src/components/au-fetch.js';

describe('R7: au-fetch Slot Template Sanitization', () => {

    test('should strip event handlers from loading template', () => {
        const container = document.createElement('div');
        // No url attribute → no auto-fetch → no dispatchEvent crash
        container.innerHTML = `
            <au-fetch>
                <template slot="loading"><img onerror="alert(1)" src="x"><div>Loading...</div></template>
            </au-fetch>
        `;
        document.body.appendChild(container);
        const fetchEl = container.querySelector('au-fetch');

        // The loading template should have event handlers stripped
        expect(fetchEl._loadingTemplate).not.toContain('onerror');
        expect(fetchEl._loadingTemplate).toContain('Loading...');

        document.body.removeChild(container);
    });

    test('should strip <script> from empty template', () => {
        const container = document.createElement('div');
        container.innerHTML = `
            <au-fetch>
                <template slot="empty"><p>No data</p><script>alert("xss")</script></template>
            </au-fetch>
        `;
        document.body.appendChild(container);
        const fetchEl = container.querySelector('au-fetch');

        expect(fetchEl._emptyTemplate).not.toContain('<script');
        expect(fetchEl._emptyTemplate).toContain('No data');

        document.body.removeChild(container);
    });

    test('should strip javascript: URIs from templates', () => {
        const container = document.createElement('div');
        container.innerHTML = `
            <au-fetch>
                <template slot="loading"><a href="javascript:alert(1)">Click</a></template>
            </au-fetch>
        `;
        document.body.appendChild(container);
        const fetchEl = container.querySelector('au-fetch');

        expect(fetchEl._loadingTemplate).not.toContain('javascript:');

        document.body.removeChild(container);
    });

    test('should preserve safe template content', () => {
        const container = document.createElement('div');
        container.innerHTML = `
            <au-fetch>
                <template slot="loading"><au-spinner></au-spinner><p>Loading...</p></template>
                <template slot="empty"><p>No results found</p></template>
            </au-fetch>
        `;
        document.body.appendChild(container);
        const fetchEl = container.querySelector('au-fetch');

        expect(fetchEl._loadingTemplate).toContain('au-spinner');
        expect(fetchEl._loadingTemplate).toContain('Loading...');
        expect(fetchEl._emptyTemplate).toContain('No results found');

        document.body.removeChild(container);
    });

    test('should strip <iframe> from templates', () => {
        const container = document.createElement('div');
        container.innerHTML = `
            <au-fetch>
                <template slot="loading"><iframe src="evil.com"></iframe>Loading</template>
            </au-fetch>
        `;
        document.body.appendChild(container);
        const fetchEl = container.querySelector('au-fetch');

        expect(fetchEl._loadingTemplate).not.toContain('<iframe');
        expect(fetchEl._loadingTemplate).toContain('Loading');

        document.body.removeChild(container);
    });

    test('should strip <object> and <embed> from error template', () => {
        const container = document.createElement('div');
        container.innerHTML = `
            <au-fetch>
                <template slot="error"><object data="evil.swf"></object><embed src="evil.swf"><p>Error</p></template>
            </au-fetch>
        `;
        document.body.appendChild(container);
        const fetchEl = container.querySelector('au-fetch');

        expect(fetchEl._errorTemplate).not.toContain('<object');
        expect(fetchEl._errorTemplate).not.toContain('<embed');
        expect(fetchEl._errorTemplate).toContain('Error');

        document.body.removeChild(container);
    });
});
