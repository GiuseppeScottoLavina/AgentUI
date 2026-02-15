/**
 * @fileoverview au-code Security Tests — mXSS via highlight pipeline
 * 
 * R1: Tests that the au-code syntax highlighting pipeline cannot produce
 * executable HTML when the highlighted output goes through safe() + innerHTML.
 */

import { describe, test, expect } from 'bun:test';
import '../../tests/setup-dom.js';
import '../../src/components/au-code.js';

describe('R1: au-code mXSS Protection', () => {

    test('should not execute script tags in code content', () => {
        const code = document.createElement('au-code');
        code.setAttribute('language', 'html');
        code.textContent = '<script>alert("xss")</script>';
        document.body.appendChild(code);

        const content = code.querySelector('.au-code__content');
        expect(content).toBeTruthy();
        // No actual <script> element should exist
        expect(content.querySelectorAll('script').length).toBe(0);
        // The content should contain the escaped entity
        expect(content.textContent).toContain('alert("xss")');

        document.body.removeChild(code);
    });

    test('should not execute event handlers in code content', () => {
        const code = document.createElement('au-code');
        code.setAttribute('language', 'html');
        code.textContent = '<img src=x onerror="alert(document.cookie)">';
        document.body.appendChild(code);

        const content = code.querySelector('.au-code__content');
        expect(content).toBeTruthy();
        // No actual <img> element should be created
        expect(content.querySelectorAll('img').length).toBe(0);
        // The text should still be present (escaped)
        expect(content.textContent).toContain('onerror');

        document.body.removeChild(code);
    });

    test('should handle crafted input that tries to break entity escaping', () => {
        const code = document.createElement('au-code');
        code.setAttribute('language', 'javascript');
        code.textContent = '`<img src=x onerror=alert(1)>`';
        document.body.appendChild(code);

        const content = code.querySelector('.au-code__content');
        expect(content).toBeTruthy();
        // No actual img element should exist
        expect(content.querySelectorAll('img').length).toBe(0);

        document.body.removeChild(code);
    });

    test('should sanitize highlighted output to only allow au-code__* spans', () => {
        const code = document.createElement('au-code');
        code.setAttribute('language', 'html');
        code.textContent = '<div onclick="alert(1)">test</div>';
        document.body.appendChild(code);

        const content = code.querySelector('.au-code__content');
        expect(content).toBeTruthy();

        // Only au-code__* span elements should exist as children  
        const allElements = content.querySelectorAll('*');
        for (const el of allElements) {
            if (el.tagName === 'SPAN') {
                const hasAuCodeClass = [...el.classList].some(c => c.startsWith('au-code__'));
                expect(hasAuCodeClass).toBe(true);
            }
        }

        // No div, img, script, or other unexpected elements
        expect(content.querySelectorAll('div').length).toBe(0);
        expect(content.querySelectorAll('img').length).toBe(0);
        expect(content.querySelectorAll('script').length).toBe(0);

        document.body.removeChild(code);
    });

    test('should handle complex multi-line code with nested tags safely', () => {
        const code = document.createElement('au-code');
        code.setAttribute('language', 'html');
        code.textContent = `<div class="container">
    <script>
        document.write('<img onerror=alert(1) src=x>');
    </script>
    <style>body{background:red}</style>
</div>`;
        document.body.appendChild(code);

        const content = code.querySelector('.au-code__content');
        expect(content).toBeTruthy();

        // No actual script, style, or img elements should exist
        expect(content.querySelectorAll('script').length).toBe(0);
        expect(content.querySelectorAll('style').length).toBe(0);
        expect(content.querySelectorAll('img').length).toBe(0);

        document.body.removeChild(code);
    });
});
