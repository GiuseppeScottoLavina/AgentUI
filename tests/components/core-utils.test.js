/**
 * @fileoverview Unit Tests for core/utils.js — escapeHTML, safe, html
 * Target: 33% → 95% line coverage
 */

import { describe, test, expect } from 'bun:test';

import { escapeHTML, safe, html } from '../../src/core/utils.js';

describe('core/utils.js', () => {

    // ========== escapeHTML ==========
    describe('escapeHTML', () => {
        test('should escape < and >', () => {
            expect(escapeHTML('<script>')).toBe('&lt;script&gt;');
        });

        test('should escape &', () => {
            expect(escapeHTML('a & b')).toBe('a &amp; b');
        });

        test('should escape double quotes', () => {
            expect(escapeHTML('"hello"')).toBe('&quot;hello&quot;');
        });

        test('should escape single quotes', () => {
            expect(escapeHTML("it's")).toBe('it&#039;s');
        });

        test('should handle null', () => {
            expect(escapeHTML(null)).toBe('');
        });

        test('should handle undefined', () => {
            expect(escapeHTML(undefined)).toBe('');
        });

        test('should handle numbers by converting to string', () => {
            expect(escapeHTML(42)).toBe('42');
        });

        test('should handle empty string', () => {
            expect(escapeHTML('')).toBe('');
        });

        test('should escape complex XSS attempt', () => {
            const xss = '<img onerror="alert(\'xss\')" src=x>';
            const escaped = escapeHTML(xss);
            expect(escaped).not.toContain('<');
            expect(escaped).not.toContain('>');
            expect(escaped).toContain('&lt;');
            expect(escaped).toContain('&gt;');
        });

        test('should leave safe text unchanged', () => {
            expect(escapeHTML('Hello World')).toBe('Hello World');
        });
    });

    // ========== safe ==========
    describe('safe', () => {
        test('should create SafeHTML instance', () => {
            const result = safe('<b>bold</b>');
            expect(result.toString()).toBe('<b>bold</b>');
        });

        test('should handle null', () => {
            expect(safe(null).toString()).toBe('');
        });

        test('should handle undefined', () => {
            expect(safe(undefined).toString()).toBe('');
        });

        test('should convert numbers to string', () => {
            expect(safe(42).toString()).toBe('42');
        });
    });

    // ========== html tagged template ==========
    describe('html tagged template', () => {
        test('should auto-escape interpolated values', () => {
            const malicious = '<script>alert("xss")</script>';
            const result = html`<div>${malicious}</div>`;
            expect(result.toString()).toContain('&lt;script&gt;');
            expect(result.toString()).not.toContain('<script>');
        });

        test('should preserve safe() values without escaping', () => {
            const trusted = safe('<b>bold</b>');
            const result = html`<div>${trusted}</div>`;
            expect(result.toString()).toBe('<div><b>bold</b></div>');
        });

        test('should handle arrays of strings', () => {
            const items = ['One', 'Two', '<Three>'];
            const result = html`<ul>${items}</ul>`;
            const str = result.toString();
            expect(str).toContain('One');
            expect(str).toContain('Two');
            expect(str).toContain('&lt;Three&gt;');
            expect(str).not.toContain('<Three>');
        });

        test('should handle arrays with SafeHTML items', () => {
            const items = [safe('<li>safe</li>'), '<li>escaped</li>'];
            const result = html`<ul>${items}</ul>`;
            const str = result.toString();
            expect(str).toContain('<li>safe</li>');
            expect(str).toContain('&lt;li&gt;escaped&lt;/li&gt;');
        });

        test('should handle nested html templates', () => {
            const inner = html`<span>${'<b>nested</b>'}</span>`;
            const outer = html`<div>${inner}</div>`;
            const str = outer.toString();
            expect(str).toBe('<div><span>&lt;b&gt;nested&lt;/b&gt;</span></div>');
        });

        test('should return SafeHTML instance', () => {
            const result = html`<p>test</p>`;
            expect(result.toString()).toBe('<p>test</p>');
        });

        test('should handle multiple interpolations', () => {
            const a = 'Hello';
            const b = '<World>';
            const result = html`<p>${a} ${b}</p>`;
            expect(result.toString()).toBe('<p>Hello &lt;World&gt;</p>');
        });

        test('should handle null/undefined values', () => {
            const result = html`<p>${null}</p>`;
            expect(result.toString()).toBe('<p></p>');
        });

        test('static template with no interpolations', () => {
            const result = html`<div>static</div>`;
            expect(result.toString()).toBe('<div>static</div>');
        });
    });
});
