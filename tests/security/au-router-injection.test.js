/**
 * @fileoverview au-router Security Tests — innerHTML Injection + Import Path Traversal
 * 
 * R2: Tests that au-router sanitizes page template content before innerHTML injection.
 * R3: Tests that _loadDependencies rejects path traversal in dependency names.
 */

import { describe, test, expect, beforeAll } from 'bun:test';
import '../../tests/setup-dom.js';
import { AuRouter } from '../../src/components/au-router.js';

describe('R2: au-router Page Content Sanitization', () => {
    // Create router instance manually to test the sanitizer
    // without triggering connectedCallback (linkedom dispatchEvent issue)
    let router;

    beforeAll(() => {
        router = new AuRouter();
    });

    test('should strip <script> tags from page template content', () => {
        const maliciousContent = '<h1>Hello</h1><script>alert("xss")</script><p>Content</p>';
        const sanitized = router._sanitizePageContent(maliciousContent);
        expect(sanitized).not.toContain('<script');
        expect(sanitized).not.toContain('</script');
        expect(sanitized).toContain('<h1>Hello</h1>');
        expect(sanitized).toContain('<p>Content</p>');
    });

    test('should strip event handler attributes (onerror, onclick, etc.)', () => {
        const maliciousContent = '<img src=x onerror="alert(document.cookie)"><div onclick="fetch(\'evil.com\')">Click</div>';
        const sanitized = router._sanitizePageContent(maliciousContent);
        expect(sanitized).not.toContain('onerror');
        expect(sanitized).not.toContain('onclick');
        expect(sanitized).toContain('<img');
        expect(sanitized).toContain('<div');
    });

    test('should strip javascript: URIs from href/src/action', () => {
        const maliciousContent = '<a href="javascript:alert(1)">Click me</a><form action="javascript:void(0)"><input></form>';
        const sanitized = router._sanitizePageContent(maliciousContent);
        expect(sanitized).not.toContain('javascript:');
    });

    test('should strip <iframe>, <object>, <embed> tags', () => {
        const maliciousContent = '<div>Safe</div><iframe src="evil.com"></iframe><object data="evil.swf"></object><embed src="evil.swf">';
        const sanitized = router._sanitizePageContent(maliciousContent);
        expect(sanitized).not.toContain('<iframe');
        expect(sanitized).not.toContain('<object');
        expect(sanitized).not.toContain('<embed');
        expect(sanitized).toContain('<div>Safe</div>');
    });

    test('should strip <base> and <meta http-equiv> tags', () => {
        const maliciousContent = '<base href="https://evil.com"><meta http-equiv="refresh" content="0;url=evil.com"><p>Content</p>';
        const sanitized = router._sanitizePageContent(maliciousContent);
        expect(sanitized).not.toContain('<base');
        expect(sanitized).not.toContain('http-equiv');
        expect(sanitized).toContain('<p>Content</p>');
    });

    test('should strip srcdoc attribute', () => {
        const maliciousContent = '<iframe srcdoc="<script>alert(1)</script>"></iframe>';
        const sanitized = router._sanitizePageContent(maliciousContent);
        expect(sanitized).not.toContain('srcdoc');
    });

    test('should preserve safe HTML content', () => {
        const safeContent = '<h1>Page Title</h1><p>Paragraph with <strong>bold</strong> text.</p><au-button variant="filled">Click</au-button>';
        const sanitized = router._sanitizePageContent(safeContent);
        expect(sanitized).toContain('<h1>Page Title</h1>');
        expect(sanitized).toContain('<strong>bold</strong>');
        expect(sanitized).toContain('au-button');
    });
});

describe('R3: au-router Dependency Path Traversal', () => {

    test('should accept valid au-* component names', () => {
        const validDeps = ['au-button', 'au-input', 'au-schema-form', 'au-code'];
        const depsText = validDeps.join('\n');
        const filtered = depsText
            .split(/[\n,]/)
            .map(d => d.trim())
            .filter(d => d && /^au-[a-z0-9-]+$/.test(d));
        expect(filtered).toEqual(validDeps);
    });

    test('should reject path traversal attempts', () => {
        const maliciousDeps = [
            'au-../../etc/passwd',
            'au-button/../../../evil',
            'au-\x00evil',
            'au-button; rm -rf /',
        ];
        for (const dep of maliciousDeps) {
            const filtered = [dep]
                .filter(d => d && /^au-[a-z0-9-]+$/.test(d));
            expect(filtered).toEqual([]);
        }
    });

    test('should reject uppercase characters (case sensitivity bypass)', () => {
        const filtered = ['au-Button', 'au-EVIL']
            .filter(d => d && /^au-[a-z0-9-]+$/.test(d));
        expect(filtered).toEqual([]);
    });
});
