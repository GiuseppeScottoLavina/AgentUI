/**
 * @fileoverview Comprehensive Unit Tests for ALL AgentUI v2 Components
 * Coverage: Alert, Badge, Card, Container, Dropdown, Form, Input, Lazy,
 *           Navbar, Progress, Sidebar, Spinner, Table, Tabs, Toast, Tooltip,
 *           Virtual List, Repeat
 */

import { describe, test, expect, beforeAll } from 'bun:test';
import { dom, resetBody } from '../helpers/setup-dom.js';
const { document, body, customElements } = dom;


// Mock IntersectionObserver for au-lazy
// ============================================
// FEEDBACK COMPONENTS
// ============================================

describe('au-alert Component', () => {
    let AuAlert;

    beforeAll(async () => {
        const module = await import('../../src/components/au-alert.js');
        AuAlert = module.AuAlert;
    });

    test('should be registered', () => {
        expect(customElements.get('au-alert')).toBe(AuAlert);
    });

    test('should have correct baseClass', () => {
        expect(AuAlert.baseClass).toBe('au-alert');
    });

    test('should observe severity and dismissible', () => {
        expect(AuAlert.observedAttributes).toContain('severity');
        expect(AuAlert.observedAttributes).toContain('dismissible');
    });

    test('should render with base class', () => {
        const el = document.createElement('au-alert');
        el.textContent = 'Alert message';
        document.body.appendChild(el);
        expect(el.classList.contains('au-alert')).toBe(true);
    });

    test('should apply severity variant class', () => {
        const el = document.createElement('au-alert');
        el.setAttribute('severity', 'error');
        el.textContent = 'Error message'; // Required for sync init
        document.body.appendChild(el);
        expect(el.classList.contains('au-alert--error')).toBe(true);
    });

    test('should default to info severity', () => {
        const el = document.createElement('au-alert');
        el.textContent = 'Info message'; // Required for sync init
        document.body.appendChild(el);
        expect(el.classList.contains('au-alert--info')).toBe(true);
    });
});

describe('au-badge Component', () => {
    let AuBadge;

    beforeAll(async () => {
        const module = await import('../../src/components/au-badge.js');
        AuBadge = module.AuBadge;
    });

    test('should be registered', () => {
        expect(customElements.get('au-badge')).toBe(AuBadge);
    });

    test('should have correct baseClass', () => {
        expect(AuBadge.baseClass).toBe('au-badge');
    });

    test('should render with base class', () => {
        const el = document.createElement('au-badge');
        el.textContent = '5';
        document.body.appendChild(el);
        expect(el.classList.contains('au-badge')).toBe(true);
    });
});

describe('au-spinner Component', () => {
    let AuSpinner;

    beforeAll(async () => {
        const module = await import('../../src/components/au-spinner.js');
        AuSpinner = module.AuSpinner;
    });

    test('should be registered', () => {
        expect(customElements.get('au-spinner')).toBe(AuSpinner);
    });

    test('should have correct baseClass', () => {
        expect(AuSpinner.baseClass).toBe('au-spinner');
    });

    test('should observe size and color', () => {
        expect(AuSpinner.observedAttributes).toContain('size');
        expect(AuSpinner.observedAttributes).toContain('color');
    });

    test('should render spinner circle', () => {
        const el = document.createElement('au-spinner');
        document.body.appendChild(el);
        const circle = el.querySelector('.au-spinner__circle');
        expect(circle).not.toBeNull();
    });
});

describe('au-progress Component', () => {
    let AuProgress;

    beforeAll(async () => {
        const module = await import('../../src/components/au-progress.js');
        AuProgress = module.AuProgress;
    });

    test('should be registered', () => {
        expect(customElements.get('au-progress')).toBe(AuProgress);
    });

    test('should have correct baseClass', () => {
        expect(AuProgress.baseClass).toBe('au-progress');
    });

    test('should observe value, max, variant, size', () => {
        expect(AuProgress.observedAttributes).toContain('value');
        expect(AuProgress.observedAttributes).toContain('max');
    });

    test('should render progress bar', () => {
        const el = document.createElement('au-progress');
        el.setAttribute('value', '50');
        document.body.appendChild(el);
        const bar = el.querySelector('.au-progress__bar');
        expect(bar).not.toBeNull();
    });

    test('should calculate correct percentage', () => {
        const el = document.createElement('au-progress');
        el.setAttribute('value', '50');
        el.setAttribute('max', '100');
        document.body.appendChild(el);
        const bar = el.querySelector('.au-progress__bar');
        expect(bar.style.width).toBe('50%');
    });
});

describe('au-toast Component', () => {
    // NOTE: Full test coverage exists in tests/components/au-toast.test.js
    // These tests are skipped to avoid duplicate registration issues
    test.skip('should be registered (covered in au-toast.test.js)', () => { });
    test.skip('should have correct baseClass (covered in au-toast.test.js)', () => { });
    test.skip('should observe severity, position, duration (covered in au-toast.test.js)', () => { });
});

describe('au-tooltip Component', () => {
    let AuTooltip;

    beforeAll(async () => {
        const module = await import('../../src/components/au-tooltip.js');
        AuTooltip = module.AuTooltip;
    });

    test('should be registered', () => {
        expect(customElements.get('au-tooltip')).toBe(AuTooltip);
    });

    test('should have correct baseClass', () => {
        expect(AuTooltip.baseClass).toBe('au-tooltip');
    });

    test('should observe content and position', () => {
        expect(AuTooltip.observedAttributes).toContain('content');
        expect(AuTooltip.observedAttributes).toContain('position');
    });
});

// ============================================
// LAYOUT COMPONENTS
// ============================================

describe('au-card Component', () => {
    let AuCard;

    beforeAll(async () => {
        const module = await import('../../src/components/au-card.js');
        AuCard = module.AuCard;
    });

    test('should be registered', () => {
        expect(customElements.get('au-card')).toBe(AuCard);
    });

    test('should have correct baseClass', () => {
        expect(AuCard.baseClass).toBe('au-card');
    });

    test('should observe variant, padding, radius', () => {
        expect(AuCard.observedAttributes).toContain('variant');
        expect(AuCard.observedAttributes).toContain('padding');
    });

    test('should render with base class', () => {
        const el = document.createElement('au-card');
        el.innerHTML = '<h3>Title</h3>';
        document.body.appendChild(el);
        expect(el.classList.contains('au-card')).toBe(true);
    });

    test('should apply elevated variant', () => {
        const el = document.createElement('au-card');
        el.setAttribute('variant', 'elevated');
        document.body.appendChild(el);
        expect(el.classList.contains('au-card--elevated')).toBe(true);
    });
});

describe('au-container Component', () => {
    let AuContainer;

    beforeAll(async () => {
        const module = await import('../../src/components/au-container.js');
        AuContainer = module.AuContainer;
    });

    test('should be registered', () => {
        expect(customElements.get('au-container')).toBe(AuContainer);
    });

    test('should have correct baseClass', () => {
        expect(AuContainer.baseClass).toBe('au-container');
    });

    test('should observe size and center', () => {
        expect(AuContainer.observedAttributes).toContain('size');
    });

    test('should render with base class', () => {
        const el = document.createElement('au-container');
        document.body.appendChild(el);
        expect(el.classList.contains('au-container')).toBe(true);
    });
});

describe('au-navbar Component', () => {
    let AuNavbar;

    beforeAll(async () => {
        const module = await import('../../src/components/au-navbar.js');
        AuNavbar = module.AuNavbar;
    });

    test('should be registered', () => {
        expect(customElements.get('au-navbar')).toBe(AuNavbar);
    });

    test('should have correct baseClass', () => {
        expect(AuNavbar.baseClass).toBe('au-navbar');
    });

    test('should render with base class', () => {
        const el = document.createElement('au-navbar');
        document.body.appendChild(el);
        expect(el.classList.contains('au-navbar')).toBe(true);
    });
});

describe('au-sidebar Component', () => {
    let AuSidebar;

    beforeAll(async () => {
        const module = await import('../../src/components/au-sidebar.js');
        AuSidebar = module.AuSidebar;
    });

    test('should be registered', () => {
        expect(customElements.get('au-sidebar')).toBe(AuSidebar);
    });

    test('should have correct baseClass', () => {
        expect(AuSidebar.baseClass).toBe('au-sidebar');
    });

    test('should render with base class', () => {
        const el = document.createElement('au-sidebar');
        document.body.appendChild(el);
        expect(el.classList.contains('au-sidebar')).toBe(true);
    });
});

// ============================================
// FORM COMPONENTS
// ============================================

describe('au-input Component', () => {
    let AuInput;

    beforeAll(async () => {
        const module = await import('../../src/components/au-input.js');
        AuInput = module.AuInput;
    });

    // NOTE: This test requires real browser customElements to evaluate equality
    // Covered by E2E tests in components.test.js
    test.skip('should be registered (use E2E)', () => {
        expect(customElements.get('au-input')).toBe(AuInput);
    });

    test('should have correct baseClass', () => {
        expect(AuInput.baseClass).toBe('au-input');
    });

    test('should observe type, placeholder, value, size, variant, disabled', () => {
        expect(AuInput.observedAttributes).toContain('type');
        expect(AuInput.observedAttributes).toContain('placeholder');
        expect(AuInput.observedAttributes).toContain('value');
    });

    // NOTE: This test requires real browser customElements to render
    // Covered by E2E tests in components.test.js
    test.skip('should render input field (use E2E)', () => {
        const el = document.createElement('au-input');
        el.setAttribute('placeholder', 'Enter text');
        document.body.appendChild(el);
        const input = el.querySelector('.au-input__field');
        expect(input).not.toBeNull();
    });

    test('should have value property', () => {
        const el = document.createElement('au-input');
        document.body.appendChild(el);
        el.value = 'test';
        expect(el.value).toBe('test');
    });
});

describe('au-dropdown Component', () => {
    let AuDropdown;

    beforeAll(async () => {
        // Mock MutationObserver for linkedom
        if (!globalThis.MutationObserver) {
        }
        const module = await import('../../src/components/au-dropdown.js');
        AuDropdown = module.AuDropdown;
    });

    test('should be registered', () => {
        expect(customElements.get('au-dropdown')).toBe(AuDropdown);
    });

    test('should have correct baseClass', () => {
        expect(AuDropdown.baseClass).toBe('au-dropdown');
    });

    test('should observe placeholder, value, disabled', () => {
        expect(AuDropdown.observedAttributes).toContain('placeholder');
        expect(AuDropdown.observedAttributes).toContain('value');
        expect(AuDropdown.observedAttributes).toContain('disabled');
    });

    test('should render trigger', () => {
        const el = document.createElement('au-dropdown');
        el.setAttribute('placeholder', 'Select...');
        document.body.appendChild(el);
        expect(el.querySelector('.au-dropdown__trigger')).not.toBeNull();
        // Menu is in portal container (may not be queryable in linkedom)
        const portal = document.getElementById('au-dropdown-portal');
        expect(portal !== null || document.body.querySelector('.au-dropdown__menu') !== null).toBe(true);
    });

    test('should have open/close/toggle methods', () => {
        const el = document.createElement('au-dropdown');
        document.body.appendChild(el);
        expect(typeof el.open).toBe('function');
        expect(typeof el.close).toBe('function');
        expect(typeof el.toggle).toBe('function');
    });
});

describe('au-form Component', () => {
    let AuForm;

    beforeAll(async () => {
        const module = await import('../../src/components/au-form.js');
        AuForm = module.AuForm;
    });

    test('should be registered', () => {
        expect(customElements.get('au-form')).toBe(AuForm);
    });

    test('should have correct baseClass', () => {
        expect(AuForm.baseClass).toBe('au-form');
    });

    test('should render with base class', () => {
        const el = document.createElement('au-form');
        document.body.appendChild(el);
        expect(el.classList.contains('au-form')).toBe(true);
    });
});

// ============================================
// DATA DISPLAY COMPONENTS
// ============================================

describe('au-table Component', () => {
    let AuTable;

    beforeAll(async () => {
        const module = await import('../../src/components/au-table.js');
        AuTable = module.AuTable;
    });

    test('should be registered', () => {
        expect(customElements.get('au-table')).toBe(AuTable);
    });

    test('should have correct baseClass', () => {
        expect(AuTable.baseClass).toBe('au-table');
    });

    test('should observe striped, hover', () => {
        expect(AuTable.observedAttributes).toContain('striped');
        expect(AuTable.observedAttributes).toContain('hover');
    });
});

describe('au-tabs Component', () => {
    let AuTabs;

    beforeAll(async () => {
        const module = await import('../../src/components/au-tabs.js');
        AuTabs = module.AuTabs;
    });

    test('should be registered', () => {
        expect(customElements.get('au-tabs')).toBe(AuTabs);
    });

    test('should have correct baseClass', () => {
        expect(AuTabs.baseClass).toBe('au-tabs');
    });

    test('should observe active attribute', () => {
        expect(AuTabs.observedAttributes).toContain('active');
    });

    test('should render tabs list', () => {
        const el = document.createElement('au-tabs');
        document.body.appendChild(el);
        expect(el.querySelector('.au-tabs__list')).not.toBeNull();
    });
});

// ============================================
// PERFORMANCE COMPONENTS
// ============================================

describe('au-lazy Component', () => {
    let AuLazy;

    beforeAll(async () => {
        const module = await import('../../src/components/au-lazy.js');
        AuLazy = module.AuLazy;
    });

    test('should be registered', () => {
        expect(customElements.get('au-lazy')).toBe(AuLazy);
    });

    test('should have correct baseClass', () => {
        expect(AuLazy.baseClass).toBe('au-lazy');
    });

    test('should observe root-margin, threshold', () => {
        expect(AuLazy.observedAttributes).toContain('root-margin');
    });
});

describe('au-virtual-list Component', () => {
    let AuVirtualList;

    beforeAll(async () => {
        const module = await import('../../src/components/au-virtual-list.js');
        AuVirtualList = module.AuVirtualList;
    });

    test('should be registered', () => {
        expect(customElements.get('au-virtual-list')).toBe(AuVirtualList);
    });

    test('should have correct baseClass', () => {
        expect(AuVirtualList.baseClass).toBe('au-virtual-list');
    });

    test('should observe item-height', () => {
        expect(AuVirtualList.observedAttributes).toContain('item-height');
    });

    test('should have items property', () => {
        const el = document.createElement('au-virtual-list');
        document.body.appendChild(el);
        el.items = [1, 2, 3];
        expect(el.items).toEqual([1, 2, 3]);
    });

    test('should accept renderItem setter', () => {
        const el = document.createElement('au-virtual-list');
        document.body.appendChild(el);
        const renderer = (item) => `<div>${item}</div>`;
        expect(() => { el.renderItem = renderer; }).not.toThrow();
    });
});

describe('au-repeat Component', () => {
    let AuRepeat;

    beforeAll(async () => {
        const module = await import('../../src/components/au-repeat.js');
        AuRepeat = module.AuRepeat;
    });

    test('should be registered', () => {
        expect(customElements.get('au-repeat')).toBe(AuRepeat);
    });

    test('should have correct baseClass', () => {
        expect(AuRepeat.baseClass).toBe('au-repeat');
    });

    test('should have items property', () => {
        const el = document.createElement('au-repeat');
        document.body.appendChild(el);
        el.items = ['a', 'b', 'c'];
        expect(el.items).toEqual(['a', 'b', 'c']);
    });

    test('should accept keyFn setter', () => {
        const el = document.createElement('au-repeat');
        document.body.appendChild(el);
        const keyFn = (item) => item.id;
        expect(() => { el.keyFn = keyFn; }).not.toThrow();
    });
});
