/**
 * @fileoverview Unit Tests for au-example Component
 * Dev tool: interactive example card with demo/code toggle
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuExample;

describe('au-example Unit Tests', () => {

    beforeAll(async () => {

        globalThis.navigator = { clipboard: { writeText: async () => { } } };

        // au-example depends on au-code
        await import('../../src/components/au-code.js');
        const module = await import('../../src/components/au-example.js');
        AuExample = module.AuExample;
    });

    beforeEach(() => resetBody());

    // REGISTRATION
    test('should be registered', () => {
        expect(customElements.get('au-example')).toBe(AuExample);
    });

    test('should have correct baseClass', () => {
        expect(AuExample.baseClass).toBe('au-example');
    });

    test('should observe title attribute', () => {
        expect(AuExample.observedAttributes).toContain('title');
    });

    // RENDER
    test('should render card structure', () => {
        const el = document.createElement('au-example');
        el.setAttribute('title', 'Test Example');
        el.innerHTML = '<div slot="demo"><p>Demo</p></div><div slot="code"><p>Code</p></div>';
        body.appendChild(el);

        expect(el.querySelector('.au-example__card')).toBeTruthy();
        expect(el.querySelector('.au-example__header')).toBeTruthy();
        expect(el.querySelector('.au-example__demo')).toBeTruthy();
        expect(el.querySelector('.au-example__code')).toBeTruthy();
    });

    test('should render title', () => {
        const el = document.createElement('au-example');
        el.setAttribute('title', 'Checkbox Example');
        el.innerHTML = '<div slot="demo">Demo</div>';
        body.appendChild(el);

        const title = el.querySelector('.au-example__title');
        expect(title).toBeTruthy();
        expect(title.textContent).toBe('Checkbox Example');
    });

    test('should default title to Example', () => {
        const el = document.createElement('au-example');
        el.innerHTML = '<div slot="demo">Demo</div>';
        body.appendChild(el);

        const title = el.querySelector('.au-example__title');
        expect(title.textContent).toBe('Example');
    });

    // DEMO CONTENT
    test('should render demo slot content', () => {
        const el = document.createElement('au-example');
        el.innerHTML = '<div slot="demo"><p>Demo Content Here</p></div>';
        body.appendChild(el);

        const demo = el.querySelector('.au-example__demo');
        expect(demo.innerHTML).toContain('Demo Content Here');
    });

    // CODE BLOCK
    test('should hide code block by default', () => {
        const el = document.createElement('au-example');
        el.innerHTML = '<div slot="demo">Demo</div><div slot="code">Code Here</div>';
        body.appendChild(el);

        const code = el.querySelector('.au-example__code');
        expect(code.style.display).toBe('none');
    });

    // ACTION BUTTONS
    test('should render link and code action buttons', () => {
        const el = document.createElement('au-example');
        el.innerHTML = '<div slot="demo">Demo</div>';
        body.appendChild(el);

        const actions = el.querySelectorAll('.au-example__btn');
        expect(actions.length).toBe(2);
        expect(actions[0].getAttribute('data-action')).toBe('link');
        expect(actions[1].getAttribute('data-action')).toBe('code');
    });

    // CODE TOGGLE via handleAction
    test('handleAction("code") should toggle code visibility', () => {
        const el = document.createElement('au-example');
        el.innerHTML = '<div slot="demo">Demo</div><div slot="code">Code</div>';
        body.appendChild(el);

        const codeBlock = el.querySelector('.au-example__code');
        expect(codeBlock.style.display).toBe('none');

        const codeBtn = el.querySelector('[data-action="code"]');
        el.handleAction('code', codeBtn, new Event('click'));

        expect(codeBlock.style.display).toBe('block');
    });

    test('handleAction("code") second call should hide code', () => {
        const el = document.createElement('au-example');
        el.innerHTML = '<div slot="demo">Demo</div><div slot="code">Code</div>';
        body.appendChild(el);

        const codeBtn = el.querySelector('[data-action="code"]');
        el.handleAction('code', codeBtn, new Event('click'));
        el.handleAction('code', codeBtn, new Event('click'));

        const codeBlock = el.querySelector('.au-example__code');
        expect(codeBlock.style.display).toBe('none');
    });

    // DISPLAY
    test('should set display block', () => {
        const el = document.createElement('au-example');
        el.innerHTML = '<div slot="demo">Demo</div>';
        body.appendChild(el);
        expect(el.style.display).toBe('block');
    });

    // EMBEDDED AU-CODE
    test('should embed au-code element for code display', () => {
        const el = document.createElement('au-example');
        el.innerHTML = '<div slot="demo"><p>Demo</p></div><div slot="code"><p>Code</p></div>';
        body.appendChild(el);

        const muCode = el.querySelector('.au-example__code au-code');
        expect(muCode).toBeTruthy();
    });

    // XSS PROTECTION
    test('should escape code content via escapeHTML', () => {
        const el = document.createElement('au-example');
        el.innerHTML = '<div slot="demo">Demo</div><div slot="code"><script>alert(1)</script></div>';
        body.appendChild(el);

        const codeArea = el.querySelector('.au-example__code');
        expect(codeArea.innerHTML).not.toContain('<script>alert(1)</script>');
    });
});
