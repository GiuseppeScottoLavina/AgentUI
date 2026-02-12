import { describe, test, expect, beforeAll } from 'bun:test';
import { parseHTML } from 'linkedom';

// Mock Browser Environment
const { document, customElements, HTMLElement, window } = parseHTML('<!DOCTYPE html><html><body></body></html>');
globalThis.document = document;
globalThis.customElements = customElements;
globalThis.HTMLElement = HTMLElement;
globalThis.window = window;
globalThis.requestAnimationFrame = (cb) => cb();

describe('Agent Integration Features', () => {
    let AuElement, AuInput, AuButton;

    beforeAll(async () => {
        // Load Core
        const core = await import('../../src/core/AuElement.js');
        AuElement = core.AuElement;

        // Load Components
        const inputModule = await import('../../src/components/au-input.js');
        AuInput = inputModule.AuInput;

        const buttonModule = await import('../../src/components/au-button.js');
        AuButton = buttonModule.AuButton;
    });

    test('should expose window.__AGENTUI_ERRORS__', () => {
        // Create an element to trigger init
        const el = new AuInput();
        expect(Array.isArray(window.__AGENTUI_ERRORS__)).toBe(true);
    });

    test('should expose window.AgentUIAgent helper', () => {
        expect(window.AgentUIAgent).toBeDefined();
        expect(typeof window.AgentUIAgent.reset).toBe('function');
        expect(typeof window.AgentUIAgent.getErrors).toBe('function');
    });

    test('should log error for invalid button variant', () => {
        window.AgentUIAgent.reset();

        const btn = document.createElement('au-button');
        btn.setAttribute('variant', 'invalid-variant');
        document.body.appendChild(btn); // Render triggers updateClasses -> validation

        const errors = window.AgentUIAgent.getErrors();
        expect(errors.length).toBe(1);
        expect(errors[0].code).toBe('INVALID_VARIANT');
        expect(errors[0].component).toBe('au-button');
    });

    test('should log error for missing input label', () => {
        window.AgentUIAgent.reset();

        const input = document.createElement('au-input');
        // No label, no aria-label, no placeholder validation logic check?
        // Logic: if (!labelText && !ariaLabel) -> Error
        document.body.appendChild(input);

        const errors = window.AgentUIAgent.getErrors();
        expect(errors.length).toBe(1);
        expect(errors[0].code).toBe('A11Y_MISSING_LABEL');
    });

    test('should NOT log error if label is present', () => {
        window.AgentUIAgent.reset();

        const input = document.createElement('au-input');
        input.setAttribute('label', 'Valid Label');
        document.body.appendChild(input);

        const errors = window.AgentUIAgent.getErrors();
        expect(errors.length).toBe(0);
    });

    // FIX 6: getAuComponentTree should use tag-based selector, not class-based
    test('source: getAuComponentTree should not use class-based selector', async () => {
        const fs = await import('fs');
        const source = fs.readFileSync(
            new URL('../../src/core/agent-api.js', import.meta.url),
            'utf-8'
        );

        // The default selector should NOT match CSS classes
        expect(source).not.toContain('[class^="au-"]');
        expect(source).not.toContain("[class^='au-']");
    });
});
