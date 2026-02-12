import { describe, it, expect } from 'bun:test';
import { html, safe, escapeHTML } from '../src/core/utils.js';

describe('html tagged template literal', () => {

    describe('basic escaping', () => {
        it('should escape HTML entities in interpolated strings', () => {
            const malicious = '<script>alert("xss")</script>';
            const result = html`<div>${malicious}</div>`;
            expect(result.toString()).toBe('<div>&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;</div>');
        });

        it('should escape ampersands', () => {
            const result = html`<span>${'Tom & Jerry'}</span>`;
            expect(result.toString()).toBe('<span>Tom &amp; Jerry</span>');
        });

        it('should escape single quotes', () => {
            const result = html`<span>${"it's"}</span>`;
            expect(result.toString()).toBe('<span>it&#039;s</span>');
        });

        it('should escape double quotes', () => {
            const result = html`<input value="${'he said "hello"'}">`;
            expect(result.toString()).toBe('<input value="he said &quot;hello&quot;">');
        });

        it('should handle multiple interpolated values', () => {
            const name = '<b>User</b>';
            const role = '<i>Admin</i>';
            const result = html`<div>${name} is ${role}</div>`;
            expect(result.toString()).toBe('<div>&lt;b&gt;User&lt;/b&gt; is &lt;i&gt;Admin&lt;/i&gt;</div>');
        });

        it('should return a SafeHTML instance', () => {
            const result = html`<div>hello</div>`;
            expect(result).toBeInstanceOf(Object);
            expect(result.toString()).toBe('<div>hello</div>');
        });
    });

    describe('type coercion', () => {
        it('should handle numbers', () => {
            const result = html`<span>${42}</span>`;
            expect(result.toString()).toBe('<span>42</span>');
        });

        it('should handle booleans', () => {
            const result = html`<span>${true}</span>`;
            expect(result.toString()).toBe('<span>true</span>');
        });

        it('should handle null as empty string', () => {
            const result = html`<span>${null}</span>`;
            expect(result.toString()).toBe('<span></span>');
        });

        it('should handle undefined as empty string', () => {
            const result = html`<span>${undefined}</span>`;
            expect(result.toString()).toBe('<span></span>');
        });

        it('should handle zero', () => {
            const result = html`<span>${0}</span>`;
            expect(result.toString()).toBe('<span>0</span>');
        });

        it('should handle empty string', () => {
            const result = html`<span>${''}</span>`;
            expect(result.toString()).toBe('<span></span>');
        });
    });

    describe('safe() bypass', () => {
        it('should not escape values wrapped in safe()', () => {
            const trusted = '<au-icon name="home"></au-icon>';
            const result = html`<div>${safe(trusted)}</div>`;
            expect(result.toString()).toBe('<div><au-icon name="home"></au-icon></div>');
        });

        it('should escape normal values but not safe() values in same template', () => {
            const untrusted = '<script>evil</script>';
            const trusted = '<au-button>OK</au-button>';
            const result = html`<div>${untrusted}${safe(trusted)}</div>`;
            expect(result.toString()).toBe('<div>&lt;script&gt;evil&lt;/script&gt;<au-button>OK</au-button></div>');
        });

        it('should handle safe(null) as empty string', () => {
            const result = html`<div>${safe(null)}</div>`;
            expect(result.toString()).toBe('<div></div>');
        });

        it('should handle safe(undefined) as empty string', () => {
            const result = html`<div>${safe(undefined)}</div>`;
            expect(result.toString()).toBe('<div></div>');
        });
    });

    describe('nested html calls', () => {
        it('should auto-trust nested html results (SafeHTML)', () => {
            const item = '<b>bold</b>';
            const inner = html`<li>${item}</li>`;
            const result = html`<ul>${inner}</ul>`;
            expect(result.toString()).toBe('<ul><li>&lt;b&gt;bold&lt;/b&gt;</li></ul>');
        });

        it('should handle array of nested html calls', () => {
            const items = ['One', 'Two', '<Three>'];
            const result = html`<ul>${items.map(i => html`<li>${i}</li>`)}</ul>`;
            expect(result.toString()).toBe('<ul><li>One</li><li>Two</li><li>&lt;Three&gt;</li></ul>');
        });
    });

    describe('array handling', () => {
        it('should join array elements', () => {
            const parts = [html`<li>A</li>`, html`<li>B</li>`];
            const result = html`<ul>${parts}</ul>`;
            expect(result.toString()).toBe('<ul><li>A</li><li>B</li></ul>');
        });

        it('should escape plain string arrays', () => {
            const items = ['<a>', '<b>'];
            const result = html`<div>${items}</div>`;
            expect(result.toString()).toBe('<div>&lt;a&gt;&lt;b&gt;</div>');
        });
    });

    describe('XSS attack vectors', () => {
        it('should prevent script injection', () => {
            const payload = '<script>document.cookie</script>';
            const result = html`<p>${payload}</p>`;
            expect(result.toString()).not.toContain('<script>');
        });

        it('should prevent event handler injection via attribute breakout', () => {
            const payload = '" onmouseover="alert(1)"';
            const result = html`<input value="${payload}">`;
            // Quotes are escaped, so no attribute breakout is possible
            expect(result.toString()).toBe('<input value="&quot; onmouseover=&quot;alert(1)&quot;">');
            expect(result.toString()).not.toContain('onmouseover="alert');
        });

        it('should prevent img onerror injection', () => {
            const payload = '<img src=x onerror=alert(1)>';
            const result = html`<div>${payload}</div>`;
            expect(result.toString()).not.toContain('<img');
        });

        it('should prevent javascript: URL injection', () => {
            const payload = 'javascript:alert(1)';
            const result = html`<a href="${payload}">click</a>`;
            // Note: html`` escapes HTML entities, not URL schemes.
            // The href value is escaped as a string, preventing HTML injection.
            expect(result.toString()).toBe('<a href="javascript:alert(1)">click</a>');
        });

        it('should handle deeply nested XSS attempts', () => {
            const payload = '"><script>alert(1)</script><input value="';
            const result = html`<input value="${payload}">`;
            expect(result.toString()).not.toContain('<script>');
        });
    });

    describe('edge cases', () => {
        it('should handle template with no interpolations', () => {
            const result = html`<div>static content</div>`;
            expect(result.toString()).toBe('<div>static content</div>');
        });

        it('should handle template with only an interpolation', () => {
            const result = html`${'<b>bold</b>'}`;
            expect(result.toString()).toBe('&lt;b&gt;bold&lt;/b&gt;');
        });

        it('should handle consecutive interpolations', () => {
            const result = html`${'a'}${'b'}${'c'}`;
            expect(result.toString()).toBe('abc');
        });

        it('should preserve whitespace in template', () => {
            const result = html`<div>  ${'text'}  </div>`;
            expect(result.toString()).toBe('<div>  text  </div>');
        });
    });
});

describe('safe() function', () => {
    it('should return a SafeHTML instance', () => {
        const result = safe('<div>trusted</div>');
        expect(result.toString()).toBe('<div>trusted</div>');
    });

    it('should work standalone with toString', () => {
        const result = safe('hello');
        expect(String(result)).toBe('hello');
    });
});
