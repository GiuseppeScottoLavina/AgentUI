/**
 * Comprehensive catalog quality guard tests.
 *
 * 1. Structural integrity: every prop has description, events in object format, detail field present
 * 2. Cross-check: event detail types match actual emit() calls in source code
 * 3. Prop accuracy: default values and types match observedAttributes in source code
 */
import { describe, test, expect } from 'bun:test';
import { catalog } from '../../src/core/describe-catalog.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const SRC = join(import.meta.dir, '../../src/components');

// Sub-components defined inside parent files (not their own .js file)
const SUB_COMPONENT_MAP = {
    'au-option': 'au-dropdown.js',
    'au-tab': 'au-tabs.js',
    'au-radio-group': 'au-radio.js',
    'au-sidebar-item': 'au-sidebar.js',
    'au-toast-container': 'au-toast.js'
};

// Helper: read all emit() calls from a component source
function getEmitsFromSource(tag) {
    const fileName = SUB_COMPONENT_MAP[tag] || `${tag}.js`;
    const filePath = join(SRC, fileName);
    if (!existsSync(filePath)) return null;
    const src = readFileSync(filePath, 'utf-8');
    const emits = [];
    const regex = /this\.emit\(\s*['"]([^'"]+)['"](?:\s*,\s*(\{[^}]*\}|\w+))?\s*(?:,|\))/g;
    let m;
    while ((m = regex.exec(src))) {
        const name = m[1];
        const detailArg = m[2] || null;
        emits.push({ name, detailArg });
    }
    return emits;
}

// Helper: get observedAttributes from source
function getObservedAttrsFromSource(tag) {
    const fileName = SUB_COMPONENT_MAP[tag] || `${tag}.js`;
    const filePath = join(SRC, fileName);
    if (!existsSync(filePath)) return null;
    const src = readFileSync(filePath, 'utf-8');
    // Match both static patterns
    const match = src.match(/static\s+(?:get\s+)?observedAttributes\s*(?:\(\s*\))?\s*[={]\s*(?:return\s*)?\[([^\]]*)\]/);
    if (!match) return null;
    return match[1].split(',').map(s => s.trim().replace(/['"]/g, '')).filter(Boolean);
}

describe('Catalog structural integrity', () => {

    test('every prop has a non-empty description', () => {
        const missing = [];
        for (const [tag, def] of Object.entries(catalog)) {
            for (const [prop, pdef] of Object.entries(def.props || {})) {
                if (typeof pdef.description !== 'string' || pdef.description.trim() === '') {
                    missing.push(`${tag}.${prop}`);
                }
            }
        }
        expect(missing).toEqual([]);
    });

    test('events use object format (no string arrays)', () => {
        const bad = [];
        for (const [tag, def] of Object.entries(catalog)) {
            if (Array.isArray(def.events) && def.events.length > 0) {
                bad.push(`${tag}: uses array format with ${def.events.length} items`);
            }
        }
        expect(bad).toEqual([]);
    });

    test('every event object has a detail field', () => {
        const bad = [];
        for (const [tag, def] of Object.entries(catalog)) {
            const events = def.events;
            if (events && !Array.isArray(events) && typeof events === 'object') {
                for (const [name, evDef] of Object.entries(events)) {
                    if (evDef.detail === undefined || evDef.detail === null) {
                        bad.push(`${tag}.${name}: missing or null detail`);
                    }
                }
            }
        }
        expect(bad).toEqual([]);
    });

    test('catalog has 30+ components', () => {
        expect(Object.keys(catalog).length).toBeGreaterThan(30);
    });

    test('all components have a name matching their key', () => {
        const mismatched = [];
        for (const [tag, def] of Object.entries(catalog)) {
            if (def.name !== tag) {
                mismatched.push(`${tag}: name is "${def.name}"`);
            }
        }
        expect(mismatched).toEqual([]);
    });

    test('all components have a non-empty description', () => {
        const missing = [];
        for (const [tag, def] of Object.entries(catalog)) {
            if (!def.description || typeof def.description !== 'string' || def.description.trim() === '') {
                missing.push(tag);
            }
        }
        expect(missing).toEqual([]);
    });
});

describe('Catalog vs source cross-check: events', () => {

    test('every catalog event name exists in component source emit() calls', () => {
        // Events that bubble from child components, not directly emitted
        const KNOWN_BUBBLED_EVENTS = {
            'au-drawer': ['au-nav-select'] // bubbles from au-drawer-item children
        };
        const bad = [];
        for (const [tag, def] of Object.entries(catalog)) {
            // Skip sub-components (share source file with parent — cross-check unreliable)
            if (SUB_COMPONENT_MAP[tag]) continue;
            const events = def.events;
            if (!events || Array.isArray(events)) continue;

            const emits = getEmitsFromSource(tag);
            if (!emits) continue;

            const emitNames = new Set(emits.map(e => e.name));
            const bubbled = new Set(KNOWN_BUBBLED_EVENTS[tag] || []);
            for (const eventName of Object.keys(events)) {
                if (eventName === 'click') continue;
                if (bubbled.has(eventName)) continue;
                if (!emitNames.has(eventName)) {
                    bad.push(`${tag}.${eventName}: in catalog but NOT in source emit() calls`);
                }
            }
        }
        expect(bad).toEqual([]);
    });

    test('every source emit() call is represented in the catalog', () => {
        const bad = [];
        for (const [tag, def] of Object.entries(catalog)) {
            // Skip sub-components (share source file with parent — cross-check unreliable)
            if (SUB_COMPONENT_MAP[tag]) continue;
            const emits = getEmitsFromSource(tag);
            if (!emits || emits.length === 0) continue;

            const events = def.events;
            const catalogEventNames = new Set(
                events && !Array.isArray(events)
                    ? Object.keys(events)
                    : []
            );
            // Also check empty arrays
            if (Array.isArray(events) && events.length === 0) {
                // Component has no documented events
            }

            for (const { name } of emits) {
                if (!catalogEventNames.has(name)) {
                    bad.push(`${tag}.${name}: emitted in source but NOT in catalog`);
                }
            }
        }
        expect(bad).toEqual([]);
    });
});

describe('Catalog vs source cross-check: props', () => {

    test('all catalog props exist in source observedAttributes', () => {
        const bad = [];
        for (const [tag, def] of Object.entries(catalog)) {
            // Skip sub-components (share source file with parent — cross-check unreliable)
            if (SUB_COMPONENT_MAP[tag]) continue;
            const attrs = getObservedAttrsFromSource(tag);
            if (!attrs) continue;

            for (const prop of Object.keys(def.props || {})) {
                if (!attrs.includes(prop)) {
                    bad.push(`${tag}.${prop}: in catalog but NOT in observedAttributes`);
                }
            }
        }
        expect(bad).toEqual([]);
    });

    test('all source observedAttributes are in catalog props', () => {
        const bad = [];
        for (const [tag, def] of Object.entries(catalog)) {
            // Skip sub-components (share source file with parent — cross-check unreliable)
            if (SUB_COMPONENT_MAP[tag]) continue;
            const attrs = getObservedAttrsFromSource(tag);
            if (!attrs) continue;

            const catalogProps = new Set(Object.keys(def.props || {}));
            for (const attr of attrs) {
                if (!catalogProps.has(attr)) {
                    bad.push(`${tag}.${attr}: in observedAttributes but NOT in catalog`);
                }
            }
        }
        expect(bad).toEqual([]);
    });
});

describe('Specific event detail accuracy', () => {

    test('au-alert.au-dismiss has empty detail', () => {
        const detail = catalog['au-alert'].events['au-dismiss'].detail;
        expect(detail).toEqual({});
    });

    test('au-bottom-nav.au-change has value and item', () => {
        const detail = catalog['au-bottom-nav'].events['au-change'].detail;
        expect(detail).toHaveProperty('value');
        expect(detail).toHaveProperty('item');
    });

    test('au-input events have correct detail types', () => {
        const events = catalog['au-input'].events;
        expect(events['au-input'].detail).toEqual({ value: 'string' });
        expect(events['au-focus'].detail).toEqual({});
        expect(events['au-blur'].detail).toEqual({});
        // au-input does NOT emit au-change — only au-input, au-focus, au-blur
        expect(events['au-change']).toBeUndefined();
    });

    test('au-fetch events have correct detail types', () => {
        const events = catalog['au-fetch'].events;
        expect(events['au-data'].detail).toHaveProperty('data');
        expect(events['au-loading'].detail).toEqual({});
        expect(events['au-success'].detail).toHaveProperty('data');
        expect(events['au-error'].detail).toHaveProperty('error');
    });

    test('au-form events have correct detail types', () => {
        const events = catalog['au-form'].events;
        expect(events['au-submit'].detail).toHaveProperty('data');
        expect(events['au-submit'].detail).toHaveProperty('isValid');
        expect(events['au-invalid'].detail).toHaveProperty('errors');
        expect(events['au-reset'].detail).toEqual({});
    });

    test('au-router events have correct detail types', () => {
        const events = catalog['au-router'].events;
        expect(events['au-route-change'].detail).toHaveProperty('route');
        expect(events['au-page-loaded'].detail).toHaveProperty('route');
        expect(events['au-page-error'].detail).toHaveProperty('route');
        expect(events['au-page-error'].detail).toHaveProperty('error');
    });

    test('au-schema-form events have correct detail types', () => {
        const events = catalog['au-schema-form'].events;
        // au-submit: detail IS the values object directly (not { values })
        expect(events['au-submit'].detail).toBe('object');
        // au-change: { field, value, values }
        expect(events['au-change'].detail).toHaveProperty('field');
        expect(events['au-change'].detail).toHaveProperty('value');
        expect(events['au-change'].detail).toHaveProperty('values');
        // au-reset: { values }
        expect(events['au-reset'].detail).toHaveProperty('values');
    });

    test('au-textarea events have correct detail types', () => {
        const events = catalog['au-textarea'].events;
        expect(events['au-input'].detail).toEqual({ value: 'string' });
        expect(events['au-change'].detail).toEqual({ value: 'string' });
    });

    test('au-datatable events have correct detail types', () => {
        const events = catalog['au-datatable'].events;
        expect(events['au-data-change'].detail).toHaveProperty('data');
        expect(events['au-sort-change'].detail).toHaveProperty('column');
    });

    test('au-chip events have correct detail types', () => {
        const events = catalog['au-chip'].events;
        expect(events['au-change'].detail).toHaveProperty('selected');
        expect(events['au-remove'].detail).toEqual({});
    });

    test('au-drawer-item.au-nav-select has href and item', () => {
        const detail = catalog['au-drawer-item'].events['au-nav-select'].detail;
        expect(detail).toHaveProperty('href');
        expect(detail).toHaveProperty('item');
    });

    test('au-modal events have empty detail', () => {
        const events = catalog['au-modal'].events;
        expect(events['au-open'].detail).toEqual({});
        expect(events['au-close'].detail).toEqual({});
    });

    test('au-confirm events have empty detail', () => {
        const events = catalog['au-confirm'].events;
        expect(events['au-confirm'].detail).toEqual({});
        expect(events['au-cancel'].detail).toEqual({});
    });

    test('au-checkbox.au-change has checked and indeterminate', () => {
        const detail = catalog['au-checkbox'].events['au-change'].detail;
        expect(detail).toHaveProperty('checked');
        expect(detail).toHaveProperty('indeterminate');
    });

    test('au-switch.au-change has checked', () => {
        const detail = catalog['au-switch'].events['au-change'].detail;
        expect(detail).toHaveProperty('checked');
    });

    test('au-dropdown.au-select has value and label', () => {
        const detail = catalog['au-dropdown'].events['au-select'].detail;
        expect(detail).toHaveProperty('value');
        expect(detail).toHaveProperty('label');
    });

    test('au-tabs.au-tab-change has index', () => {
        const detail = catalog['au-tabs'].events['au-tab-change'].detail;
        expect(detail).toHaveProperty('index');
    });

    test('au-sidebar events have correct detail types', () => {
        const events = catalog['au-sidebar'].events;
        expect(events['au-sidebar-toggle'].detail).toHaveProperty('open');
        expect(events['au-sidebar-select'].detail).toHaveProperty('item');
    });
});

// Helper: extract this.attr('prop', 'default') from source
function getAttrDefaults(tag) {
    const filePath = join(SRC, `${tag}.js`);
    if (!existsSync(filePath)) return {};
    const src = readFileSync(filePath, 'utf-8');
    const defaults = {};
    const regex = /this\.attr\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]*)['"]\s*\)/g;
    let m;
    while ((m = regex.exec(src))) {
        defaults[m[1]] = m[2];
    }
    return defaults;
}

describe('Catalog vs source cross-check: default values', () => {

    test('catalog defaults match source this.attr() defaults', () => {
        const bad = [];
        for (const [tag, def] of Object.entries(catalog)) {
            const sourceDefaults = getAttrDefaults(tag);
            for (const [prop, pdef] of Object.entries(def.props || {})) {
                if (pdef.default === undefined) continue;
                if (sourceDefaults[prop] === undefined) continue; // can't verify
                const catalogDefault = String(pdef.default);
                const sourceDefault = sourceDefaults[prop];
                if (catalogDefault !== sourceDefault && sourceDefault !== '') {
                    bad.push(`${tag}.${prop}: catalog="${catalogDefault}" source="${sourceDefault}"`);
                }
            }
        }
        expect(bad).toEqual([]);
    });
});

describe('Catalog value accuracy', () => {

    test('au-drawer.position uses logical values and correct default', () => {
        const pos = catalog['au-drawer'].props.position;
        expect(pos.default).toBe('start');
        expect(pos.values).toContain('start');
        expect(pos.values).toContain('end');
        // Must NOT use physical directions
        expect(pos.values).not.toContain('left');
        expect(pos.values).not.toContain('right');
    });

    test('au-stack.justify accepts shorthand and full CSS values', () => {
        const justify = catalog['au-stack'].props.justify;
        // Shorthand values (mapped by component)
        expect(justify.values).toContain('between');
        expect(justify.values).toContain('around');
        expect(justify.values).toContain('evenly');
        // Full CSS values (passed through)
        expect(justify.values).toContain('space-between');
        expect(justify.values).toContain('space-around');
        expect(justify.values).toContain('space-evenly');
        // Standard CSS values
        expect(justify.values).toContain('start');
        expect(justify.values).toContain('center');
        expect(justify.values).toContain('end');
    });

    test('au-stack.align uses valid CSS align-items values', () => {
        const align = catalog['au-stack'].props.align;
        const validCSSValues = [
            'flex-start', 'flex-end', 'center', 'start', 'end',
            'stretch', 'baseline'
        ];
        for (const val of align.values) {
            expect(validCSSValues).toContain(val);
        }
    });

    test('au-stack.gap values match source gapMap keys', () => {
        const gap = catalog['au-stack'].props.gap;
        // Source gapMap has: none, xs, sm, md, lg, xl
        expect(gap.values).toContain('none');
        expect(gap.values).toContain('xs');
        expect(gap.values).toContain('sm');
        expect(gap.values).toContain('md');
        expect(gap.values).toContain('lg');
        expect(gap.values).toContain('xl');
    });

    test('au-drawer.mode values match source switch cases', () => {
        const mode = catalog['au-drawer'].props.mode;
        expect(mode.values).toContain('auto');
        expect(mode.values).toContain('permanent');
        expect(mode.values).toContain('temporary');
        expect(mode.values).toContain('rail');
        expect(mode.default).toBe('auto');
    });

    test('au-input.type values are valid HTML input types', () => {
        const type = catalog['au-input'].props.type;
        const validInputTypes = [
            'text', 'email', 'password', 'number', 'tel', 'url',
            'date', 'time', 'datetime-local', 'search', 'color'
        ];
        for (const val of type.values) {
            expect(validInputTypes).toContain(val);
        }
    });

    test('au-skeleton.variant values match source switch cases (rect, text, circle)', () => {
        const variant = catalog['au-skeleton'].props.variant;
        // Source checks: variant === 'text', variant === 'circle' — default: 'rect'
        expect(variant.values).toContain('rect');
        expect(variant.values).toContain('text');
        expect(variant.values).toContain('circle');
        expect(variant.default).toBe('rect');
        // Must NOT use long-form names that the source doesn't recognize
        expect(variant.values).not.toContain('rectangular');
        expect(variant.values).not.toContain('circular');
    });

    test('au-skeleton examples use correct variant names', () => {
        const examples = catalog['au-skeleton'].examples;
        const examplesStr = examples.join(' ');
        // Examples must use source-valid variant names
        expect(examplesStr).toContain('variant="circle"');
        expect(examplesStr).toContain('variant="text"');
        expect(examplesStr).toContain('variant="rect"');
        // Must NOT use wrong names in examples
        expect(examplesStr).not.toContain('variant="circular"');
        expect(examplesStr).not.toContain('variant="rectangular"');
    });

    test('au-toast.position has all 6 positions from registerComponent', () => {
        const pos = catalog['au-toast'].props.position;
        const allPositions = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'];
        for (const p of allPositions) {
            expect(pos.values).toContain(p);
        }
        expect(pos.values).toHaveLength(6);
        expect(pos.default).toBe('bottom-center');
    });

    test('au-toast-container.position default matches Toast.show() default', () => {
        const pos = catalog['au-toast-container'].props.position;
        // Toast.show() defaults to 'bottom-center', container must match
        expect(pos.default).toBe('bottom-center');
        // All 6 positions must be supported
        expect(pos.values).toContain('top-left');
        expect(pos.values).toContain('top-center');
        expect(pos.values).toContain('top-right');
        expect(pos.values).toContain('bottom-left');
        expect(pos.values).toContain('bottom-center');
        expect(pos.values).toContain('bottom-right');
        expect(pos.values).toHaveLength(6);
    });

    test('au-toast and au-toast-container have consistent position values', () => {
        const toastPos = catalog['au-toast'].props.position;
        const containerPos = catalog['au-toast-container'].props.position;
        // Both must support the same positions
        const toastSet = new Set(toastPos.values);
        const containerSet = new Set(containerPos.values);
        expect(toastSet).toEqual(containerSet);
        // Both must have the same default
        expect(toastPos.default).toBe(containerPos.default);
    });

    test('au-icon.font is boolean (uses this.has() not this.attr())', () => {
        const font = catalog['au-icon'].props.font;
        expect(font.type).toBe('boolean');
        expect(font.default).toBe(false);
    });

    test('au-container.center is string type with opt-out pattern', () => {
        const center = catalog['au-container'].props.center;
        // Source uses this.attr('center', '') !== 'false' — NOT this.has()
        expect(center.type).toBe('string');
        expect(center.default).toBe(true);
    });

    test('au-tab has no props (active is on parent au-tabs)', () => {
        const tabProps = catalog['au-tab'].props;
        // AuTab class has NO observedAttributes — active state is managed by parent
        expect(Object.keys(tabProps)).toHaveLength(0);
        // Verify parent au-tabs HAS active prop (string type, parsed to int internally)
        const tabsActive = catalog['au-tabs'].props.active;
        expect(tabsActive).toBeDefined();
        expect(tabsActive.type).toBe('string');
    });

    test('au-tab examples do not use active attr on child au-tab', () => {
        const examples = catalog['au-tab'].examples;
        const exStr = examples.join(' ');
        // active attr must NOT appear directly on <au-tab>
        expect(exStr).not.toContain('<au-tab active>');
        // active attr should appear on parent <au-tabs>
        expect(exStr).toContain('au-tabs');
    });

    test('au-bottom-nav example uses au-drawer-item (not nonexistent au-bottom-nav-item)', () => {
        const examples = catalog['au-bottom-nav'].examples;
        const exStr = examples.join(' ');
        expect(exStr).not.toContain('au-bottom-nav-item');
        expect(exStr).toContain('au-drawer-item');
    });

    test('au-toast-container example uses correct default position', () => {
        const examples = catalog['au-toast-container'].examples;
        const exStr = examples.join(' ');
        // Must not use stale top-right position in example
        expect(exStr).not.toContain('position="top-right"');
        expect(exStr).toContain('position="bottom-center"');
    });
});

describe('Automated type consistency check', () => {
    const SRC = join(__dirname, '../../src/components');

    test('boolean-typed props use this.has() in source, string-typed use this.attr()', () => {
        const mismatches = [];

        for (const [tag, def] of Object.entries(catalog)) {
            // Skip sub-components (share source file)
            if (SUB_COMPONENT_MAP[tag]) continue;

            const filePath = join(SRC, `${tag}.js`);
            if (!existsSync(filePath)) continue;
            const src = readFileSync(filePath, 'utf-8');

            for (const [propName, propDef] of Object.entries(def.props || {})) {
                const hasRegex = new RegExp(`this\\.has\\(\\s*['"]${propName}['"]`);
                const attrRegex = new RegExp(`this\\.attr\\(\\s*['"]${propName}['"]`);

                if (hasRegex.test(src) && propDef.type !== 'boolean') {
                    mismatches.push(`${tag}.${propName}: source uses this.has() → should be boolean, catalog says "${propDef.type}"`);
                }
                if (attrRegex.test(src) && !hasRegex.test(src) && propDef.type === 'boolean') {
                    mismatches.push(`${tag}.${propName}: source uses this.attr() (no has()) → probably not boolean, catalog says "boolean"`);
                }
            }
        }

        if (mismatches.length > 0) {
            throw new Error('Type mismatches found:\n  ' + mismatches.join('\n  '));
        }
    });
});
