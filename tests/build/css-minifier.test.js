/**
 * @fileoverview TDD Tests for CSS minifier safety (P1.4)
 * Validates that the build script's minifyCSS correctly handles
 * edge cases like comments inside strings and url() values.
 */

import { describe, test, expect } from 'bun:test';

// Extract the minifyCSS function inline for testing
// This matches what build-framework.js uses
function minifyCSS(css) {
    // 1. Preserve strings: extract quoted strings, replace with placeholders
    const strings = [];
    let preserved = css.replace(/(["'])(?:(?!\1|\\).|\\.)*\1/g, (match) => {
        strings.push(match);
        return `__STR_${strings.length - 1}__`;
    });

    // 2. Preserve url() contents
    const urls = [];
    preserved = preserved.replace(/url\(([^)]*)\)/g, (match, content) => {
        urls.push(match);
        return `__URL_${urls.length - 1}__`;
    });

    // 3. Now safe to strip comments and whitespace
    preserved = preserved
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\s+/g, ' ')
        .replace(/\s*([{}:;,>~])\s*/g, '$1')
        .replace(/;}/g, '}')
        .trim();

    // 4. Restore url() and strings
    for (let i = 0; i < urls.length; i++) {
        preserved = preserved.replace(`__URL_${i}__`, urls[i]);
    }
    for (let i = 0; i < strings.length; i++) {
        preserved = preserved.replace(`__STR_${i}__`, strings[i]);
    }

    return preserved;
}

describe('CSS Minifier Safety (P1.4)', () => {

    test('basic whitespace collapse', () => {
        const input = '.foo  {  color:  red;  }';
        const output = minifyCSS(input);
        expect(output).toBe('.foo{color:red}');
    });

    test('comment removal', () => {
        const input = '/* comment */ .foo { color: red; }';
        const output = minifyCSS(input);
        expect(output).toBe('.foo{color:red}');
    });

    test('multi-line comment removal', () => {
        const input = `
            /* 
             * Multi-line
             * comment 
             */
            .foo { color: red; }
        `;
        const output = minifyCSS(input);
        expect(output).toBe('.foo{color:red}');
    });

    test('preserves content: with empty string', () => {
        const input = ".bar::before { content: ''; }";
        const output = minifyCSS(input);
        expect(output).toContain("content:''");
    });

    test('preserves content: with comment-like string', () => {
        const input = '.foo::after { content: "/* not a comment */"; }';
        const output = minifyCSS(input);
        expect(output).toContain('"/* not a comment */"');
    });

    test('preserves url() values', () => {
        const input = '.bg { background: url(data:image/svg+xml,%3Csvg%3E%3C/svg%3E); }';
        const output = minifyCSS(input);
        expect(output).toContain('url(data:image/svg+xml,%3Csvg%3E%3C/svg%3E)');
    });

    test('preserves url() with quotes', () => {
        const input = '.bg { background: url("path/to/image.png"); }';
        const output = minifyCSS(input);
        expect(output).toContain('url("path/to/image.png")');
    });

    test('semicolon before closing brace is removed', () => {
        const input = '.x { a: 1; b: 2; }';
        const output = minifyCSS(input);
        expect(output).toBe('.x{a:1;b:2}');
    });

    test('handles real-world CSS with multiple rules', () => {
        const input = `
            /* Tokens */
            :root {
                --color-primary: #6750a4;
                --color-surface: #1c1b1f;
            }
            
            /* Component */
            .au-button {
                padding: 8px 16px;
                border-radius: 20px;
            }
        `;
        const output = minifyCSS(input);
        expect(output).toContain(':root{');
        expect(output).toContain('--color-primary:#6750a4');
        expect(output).toContain('.au-button{');
        expect(output).not.toContain('/*');
    });
});
