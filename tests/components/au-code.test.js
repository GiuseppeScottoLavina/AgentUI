/**
 * @fileoverview Unit Tests for au-code Component
 * Syntax highlighting code block with dedent, auto-indent, and copy button
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuCode;

describe('au-code Unit Tests', () => {

    beforeAll(async () => {

        const module = await import('../../src/components/au-code.js');
        AuCode = module.AuCode;
    });

    beforeEach(() => resetBody());

    // REGISTRATION
    test('should be registered', () => {
        expect(customElements.get('au-code')).toBe(AuCode);
    });

    test('should have correct baseClass', () => {
        expect(AuCode.baseClass).toBe('au-code');
    });

    test('should observe language attribute', () => {
        expect(AuCode.observedAttributes).toContain('language');
    });

    // RENDER
    test('should render code block with header and content', () => {
        const el = document.createElement('au-code');
        el.textContent = 'const x = 1;';
        body.appendChild(el);

        expect(el.querySelector('.au-code__header')).toBeTruthy();
        expect(el.querySelector('.au-code__content')).toBeTruthy();
        expect(el.querySelector('.au-code__copy')).toBeTruthy();
    });

    test('should display language label in header', () => {
        const el = document.createElement('au-code');
        el.setAttribute('language', 'javascript');
        el.textContent = 'const x = 1;';
        body.appendChild(el);

        const langLabel = el.querySelector('.au-code__language');
        expect(langLabel).toBeTruthy();
        expect(langLabel.textContent).toBe('JAVASCRIPT');
    });

    test('should default to HTML language', () => {
        const el = document.createElement('au-code');
        el.textContent = '<div>Hello</div>';
        body.appendChild(el);

        const langLabel = el.querySelector('.au-code__language');
        expect(langLabel.textContent).toBe('HTML');
    });

    // IDEMPOTENCY
    test('should be idempotent on multiple render calls', () => {
        const el = document.createElement('au-code');
        el.textContent = 'const x = 1;';
        body.appendChild(el);

        const firstContent = el.querySelector('.au-code__content').innerHTML;
        el.render(); // second call should be no-op
        const secondContent = el.querySelector('.au-code__content').innerHTML;
        expect(secondContent).toBe(firstContent);
    });

    // SYNTAX HIGHLIGHTING — JAVASCRIPT
    test('should highlight JavaScript keywords', () => {
        const el = document.createElement('au-code');
        el.setAttribute('language', 'javascript');
        el.textContent = 'const x = 1;';
        body.appendChild(el);

        const content = el.querySelector('.au-code__content').innerHTML;
        expect(content).toContain('au-code__keyword');
    });

    test('should highlight JavaScript strings', () => {
        const el = document.createElement('au-code');
        el.setAttribute('language', 'js');
        el.textContent = "const x = 'hello';";
        body.appendChild(el);

        const content = el.querySelector('.au-code__content').innerHTML;
        expect(content).toContain('au-code__string');
    });

    // SYNTAX HIGHLIGHTING — HTML
    test('should highlight HTML tags', () => {
        const el = document.createElement('au-code');
        el.setAttribute('language', 'html');
        el.textContent = '<div class="test">Hello</div>';
        body.appendChild(el);

        const content = el.querySelector('.au-code__content').innerHTML;
        expect(content).toContain('au-code__tag');
    });

    // SYNTAX HIGHLIGHTING — CSS
    test('should highlight CSS at-rules', () => {
        const el = document.createElement('au-code');
        el.setAttribute('language', 'css');
        el.textContent = '@media (max-width: 768px) { .foo { color: red; } }';
        body.appendChild(el);

        const content = el.querySelector('.au-code__content').innerHTML;
        expect(content).toContain('au-code__keyword');
    });

    // SYNTAX HIGHLIGHTING — JSON
    test('should highlight JSON keys and values', () => {
        const el = document.createElement('au-code');
        el.setAttribute('language', 'json');
        el.textContent = '{"name": "test", "count": 42, "active": true}';
        body.appendChild(el);

        const content = el.querySelector('.au-code__content').innerHTML;
        expect(content).toContain('au-code__attr');
    });

    // SYNTAX HIGHLIGHTING — BASH
    test('should highlight bash commands', () => {
        const el = document.createElement('au-code');
        el.setAttribute('language', 'bash');
        el.textContent = 'npm install agentui-wc';
        body.appendChild(el);

        const content = el.querySelector('.au-code__content').innerHTML;
        expect(content).toContain('au-code__keyword');
    });

    // UNKNOWN LANGUAGE — no highlighting
    test('should render plain text for unknown language', () => {
        const el = document.createElement('au-code');
        el.setAttribute('language', 'brainfuck');
        el.textContent = '++++++++++';
        body.appendChild(el);

        const content = el.querySelector('.au-code__content').innerHTML;
        expect(content).not.toContain('au-code__keyword');
    });

    // ESCAPING
    test('should escape HTML entities in code content', () => {
        const el = document.createElement('au-code');
        el.setAttribute('language', 'html');
        el.textContent = '<script>alert("xss")</script>';
        body.appendChild(el);

        const content = el.querySelector('.au-code__content');
        // Should not contain raw unescaped script tags
        expect(content.innerHTML).not.toContain('<script>');
    });

    // STYLES
    test('should apply display block', () => {
        const el = document.createElement('au-code');
        el.textContent = 'test';
        body.appendChild(el);
        expect(el.style.display).toBe('block');
    });

    // COPY BUTTON
    test('should have copy button in header', () => {
        const el = document.createElement('au-code');
        el.textContent = 'const x = 1;';
        body.appendChild(el);

        const copyBtn = el.querySelector('.au-code__copy');
        expect(copyBtn).toBeTruthy();
        expect(copyBtn.getAttribute('title')).toBe('Copy code');
    });

    // EMPTY CODE
    test('should handle empty content gracefully', () => {
        const el = document.createElement('au-code');
        el.textContent = '';
        body.appendChild(el);

        const content = el.querySelector('.au-code__content');
        expect(content).toBeTruthy();
    });
});
