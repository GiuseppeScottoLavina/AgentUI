/**
 * @fileoverview Unit Tests for au-doc-page Component
 * Dev tool: 4-tab documentation page (overview/api/styling/examples)
 */

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { dom, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;

let AuDocPage;

describe('au-doc-page Unit Tests', () => {

    beforeAll(async () => {

        // au-doc-page depends on au-tabs/au-tab
        await import('../../src/components/au-tabs.js');
        const module = await import('../../src/components/au-doc-page.js');
        AuDocPage = module.AuDocPage;
    });

    beforeEach(() => resetBody());

    // REGISTRATION
    test('should be registered', () => {
        expect(customElements.get('au-doc-page')).toBe(AuDocPage);
    });

    test('should have correct baseClass', () => {
        expect(AuDocPage.baseClass).toBe('au-doc-page');
    });

    test('should observe title, selector, description', () => {
        const attrs = AuDocPage.observedAttributes;
        expect(attrs).toContain('title');
        expect(attrs).toContain('selector');
        expect(attrs).toContain('description');
    });

    // RENDER
    test('should render page title', () => {
        const el = document.createElement('au-doc-page');
        el.setAttribute('title', 'Button');
        body.appendChild(el);

        const title = el.querySelector('.page-title');
        expect(title).toBeTruthy();
        expect(title.textContent).toBe('Button');
    });

    test('should render selector in subtitle', () => {
        const el = document.createElement('au-doc-page');
        el.setAttribute('title', 'Button');
        el.setAttribute('selector', 'au-button');
        body.appendChild(el);

        const subtitle = el.querySelector('.page-subtitle');
        expect(subtitle).toBeTruthy();
        expect(subtitle.innerHTML).toContain('au-button');
    });

    test('should render description in subtitle', () => {
        const el = document.createElement('au-doc-page');
        el.setAttribute('title', 'Button');
        el.setAttribute('description', 'Interactive button');
        body.appendChild(el);

        const subtitle = el.querySelector('.page-subtitle');
        expect(subtitle.textContent).toContain('Interactive button');
    });

    test('should default title to Component', () => {
        const el = document.createElement('au-doc-page');
        body.appendChild(el);

        const title = el.querySelector('.page-title');
        expect(title.textContent).toBe('Component');
    });

    // TABS
    test('should render 4 tabs (OVERVIEW, API, STYLING, EXAMPLES)', () => {
        const el = document.createElement('au-doc-page');
        el.setAttribute('title', 'Test');
        body.appendChild(el);

        const tabs = el.querySelectorAll('au-tab');
        expect(tabs.length).toBe(4);
        expect(tabs[0].textContent).toBe('OVERVIEW');
        expect(tabs[1].textContent).toBe('API');
        expect(tabs[2].textContent).toBe('STYLING');
        expect(tabs[3].textContent).toBe('EXAMPLES');
    });

    // CONTENT AREAS
    test('should render 4 content areas', () => {
        const el = document.createElement('au-doc-page');
        el.setAttribute('title', 'Test');
        body.appendChild(el);

        const contents = el.querySelectorAll('.au-doc-page__content');
        expect(contents.length).toBe(4);
    });

    test('should show only overview content by default', () => {
        const el = document.createElement('au-doc-page');
        el.setAttribute('title', 'Test');
        body.appendChild(el);

        const overview = el.querySelector('.au-doc-page__overview');
        const api = el.querySelector('.au-doc-page__api');
        expect(overview.style.display).not.toBe('none');
        expect(api.style.display).toBe('none');
    });

    // SLOT CONTENT
    test('should render overview slot content', () => {
        const el = document.createElement('au-doc-page');
        el.setAttribute('title', 'Test');
        el.innerHTML = '<div slot="overview"><p>Overview content</p></div>';
        body.appendChild(el);

        const overview = el.querySelector('.au-doc-page__overview');
        expect(overview.innerHTML).toContain('Overview content');
    });

    test('should render api slot content', () => {
        const el = document.createElement('au-doc-page');
        el.setAttribute('title', 'Test');
        el.innerHTML = '<div slot="api"><p>API docs</p></div>';
        body.appendChild(el);

        const api = el.querySelector('.au-doc-page__api');
        expect(api.innerHTML).toContain('API docs');
    });

    // DISPLAY
    test('should set display block', () => {
        const el = document.createElement('au-doc-page');
        el.setAttribute('title', 'Test');
        body.appendChild(el);
        expect(el.style.display).toBe('block');
    });
});
