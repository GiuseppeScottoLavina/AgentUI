/**
 * @fileoverview Component Schema API for AI Agents
 * 
 * Provides JSON Schema exports for each AgentUI component.
 * Enables type-safe code generation by AI coding assistants.
 * 
 * Based on 2025-2026 research on Structured Outputs and A2UI.
 * 
 * @module component-schema
 */

// Component definitions with JSON Schema metadata
const componentSchemas = new Map();

/**
 * Base schema structure for all components
 */
const createBaseSchema = (tagName, description) => ({
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: `https://agentui.dev/schemas/${tagName}.json`,
    title: tagName,
    description,
    type: 'object',
    properties: {},
    actions: [],
    events: [],
    slots: []
});

// ============================================
// COMPONENT SCHEMA DEFINITIONS
// ============================================

componentSchemas.set('au-button', {
    ...createBaseSchema('au-button', 'Interactive button element with MD3 variants'),
    properties: {
        variant: {
            type: 'string',
            enum: ['filled', 'elevated', 'tonal', 'outlined', 'text', 'danger'],
            default: 'filled',
            description: 'Visual style variant'
        },
        size: {
            type: 'string',
            enum: ['sm', 'md', 'lg'],
            default: 'md',
            description: 'Button size'
        },
        disabled: {
            type: 'boolean',
            default: false,
            description: 'Whether the button is disabled'
        }
    },
    actions: ['click'],
    events: ['click'],
    slots: ['default']
});

componentSchemas.set('au-input', {
    ...createBaseSchema('au-input', 'Text input field with floating label'),
    properties: {
        type: {
            type: 'string',
            enum: ['text', 'email', 'password', 'number', 'tel', 'url'],
            default: 'text'
        },
        variant: {
            type: 'string',
            enum: ['outlined', 'filled'],
            default: 'outlined'
        },
        label: { type: 'string', description: 'Floating label text' },
        placeholder: { type: 'string' },
        value: { type: 'string', default: '' },
        disabled: { type: 'boolean', default: false },
        required: { type: 'boolean', default: false }
    },
    actions: ['focus', 'blur', 'clear'],
    events: ['au-input', 'au-change'],
    slots: []
});

componentSchemas.set('au-checkbox', {
    ...createBaseSchema('au-checkbox', 'Checkbox with optional label'),
    properties: {
        checked: { type: 'boolean', default: false },
        disabled: { type: 'boolean', default: false },
        value: { type: 'string' }
    },
    actions: ['toggle', 'check', 'uncheck'],
    events: ['au-change'],
    slots: ['default']
});

componentSchemas.set('au-switch', {
    ...createBaseSchema('au-switch', 'Toggle switch with on/off state'),
    properties: {
        checked: { type: 'boolean', default: false },
        disabled: { type: 'boolean', default: false }
    },
    actions: ['toggle'],
    events: ['au-change'],
    slots: []
});

componentSchemas.set('au-card', {
    ...createBaseSchema('au-card', 'Material Design 3 card container'),
    properties: {
        variant: {
            type: 'string',
            enum: ['elevated', 'filled', 'outlined'],
            default: 'elevated'
        }
    },
    actions: [],
    events: [],
    slots: ['default', 'header', 'footer']
});

componentSchemas.set('au-modal', {
    ...createBaseSchema('au-modal', 'Dialog/modal overlay'),
    properties: {
        open: { type: 'boolean', default: false },
        closeOnEscape: { type: 'boolean', default: true },
        closeOnBackdrop: { type: 'boolean', default: true }
    },
    actions: ['open', 'close'],
    events: ['au-open', 'au-close'],
    slots: ['default']
});

componentSchemas.set('au-dropdown', {
    ...createBaseSchema('au-dropdown', 'Select dropdown with options'),
    properties: {
        value: { type: 'string' },
        placeholder: { type: 'string' },
        disabled: { type: 'boolean', default: false },
        required: { type: 'boolean', default: false }
    },
    actions: ['open', 'close', 'select'],
    events: ['au-change'],
    slots: ['default']
});

componentSchemas.set('au-tabs', {
    ...createBaseSchema('au-tabs', 'Tab navigation container'),
    properties: {
        active: { type: 'number', default: 0, description: 'Active tab index (0-based)' }
    },
    actions: ['selectTab'],
    events: ['au-tab-change'],
    slots: ['default']
});

componentSchemas.set('au-alert', {
    ...createBaseSchema('au-alert', 'Alert/notification banner'),
    properties: {
        variant: {
            type: 'string',
            enum: ['info', 'success', 'warning', 'error'],
            default: 'info'
        },
        dismissible: { type: 'boolean', default: false }
    },
    actions: ['dismiss'],
    events: ['au-dismiss'],
    slots: ['default']
});

componentSchemas.set('au-stack', {
    ...createBaseSchema('au-stack', 'Flexbox layout container'),
    properties: {
        direction: {
            type: 'string',
            enum: ['row', 'column'],
            default: 'column'
        },
        gap: {
            type: 'string',
            enum: ['xs', 'sm', 'md', 'lg', 'xl'],
            default: 'md'
        },
        align: {
            type: 'string',
            enum: ['start', 'center', 'end', 'stretch'],
            default: 'stretch'
        }
    },
    actions: [],
    events: [],
    slots: ['default']
});

componentSchemas.set('au-grid', {
    ...createBaseSchema('au-grid', 'CSS Grid layout container'),
    properties: {
        columns: { type: 'string', default: '1', description: 'Number of columns or CSS grid-template-columns' },
        gap: { type: 'string', enum: ['xs', 'sm', 'md', 'lg', 'xl'], default: 'md' }
    },
    actions: [],
    events: [],
    slots: ['default']
});

componentSchemas.set('au-textarea', {
    ...createBaseSchema('au-textarea', 'Multi-line text input with floating label'),
    properties: {
        label: { type: 'string', description: 'Floating label text' },
        placeholder: { type: 'string' },
        value: { type: 'string', default: '' },
        rows: { type: 'number', default: 3 },
        disabled: { type: 'boolean', default: false },
        required: { type: 'boolean', default: false },
        readonly: { type: 'boolean', default: false }
    },
    actions: ['focus', 'blur'],
    events: ['au-input', 'au-change'],
    slots: []
});

componentSchemas.set('au-radio', {
    ...createBaseSchema('au-radio', 'Radio button for single selection within a group'),
    properties: {
        name: { type: 'string', description: 'Radio group name' },
        value: { type: 'string' },
        checked: { type: 'boolean', default: false },
        disabled: { type: 'boolean', default: false }
    },
    actions: ['select'],
    events: ['au-change'],
    slots: ['default']
});

componentSchemas.set('au-chip', {
    ...createBaseSchema('au-chip', 'Compact element for filters, selections, or actions'),
    properties: {
        variant: { type: 'string', enum: ['assist', 'filter', 'input', 'suggestion'], default: 'assist' },
        selected: { type: 'boolean', default: false },
        disabled: { type: 'boolean', default: false },
        removable: { type: 'boolean', default: false }
    },
    actions: ['select', 'remove'],
    events: ['au-select', 'au-remove'],
    slots: ['default']
});

componentSchemas.set('au-confirm', {
    ...createBaseSchema('au-confirm', 'Confirmation dialog with accept/cancel actions'),
    properties: {
        title: { type: 'string' },
        message: { type: 'string' },
        confirmText: { type: 'string', default: 'Confirm' },
        cancelText: { type: 'string', default: 'Cancel' }
    },
    actions: ['show', 'close'],
    events: ['au-confirm', 'au-cancel'],
    slots: []
});

componentSchemas.set('au-toast', {
    ...createBaseSchema('au-toast', 'Temporary notification snackbar'),
    properties: {
        variant: { type: 'string', enum: ['info', 'success', 'warning', 'error'], default: 'info' },
        duration: { type: 'number', default: 3000, description: 'Auto-dismiss duration in ms' },
        position: { type: 'string', enum: ['top', 'bottom'], default: 'bottom' }
    },
    actions: ['show', 'dismiss'],
    events: ['au-dismiss'],
    slots: ['default']
});

componentSchemas.set('au-progress', {
    ...createBaseSchema('au-progress', 'Linear or circular progress indicator'),
    properties: {
        value: { type: 'number', description: 'Progress value 0-100' },
        variant: { type: 'string', enum: ['linear', 'circular'], default: 'linear' },
        indeterminate: { type: 'boolean', default: false }
    },
    actions: [],
    events: [],
    slots: []
});

componentSchemas.set('au-spinner', {
    ...createBaseSchema('au-spinner', 'Loading spinner indicator'),
    properties: {
        size: { type: 'string', enum: ['sm', 'md', 'lg'], default: 'md' }
    },
    actions: [],
    events: [],
    slots: []
});

componentSchemas.set('au-tooltip', {
    ...createBaseSchema('au-tooltip', 'Contextual tooltip on hover/focus'),
    properties: {
        text: { type: 'string', description: 'Tooltip text content' },
        position: { type: 'string', enum: ['top', 'bottom', 'left', 'right'], default: 'top' }
    },
    actions: [],
    events: [],
    slots: ['default']
});

componentSchemas.set('au-badge', {
    ...createBaseSchema('au-badge', 'Small status indicator badge'),
    properties: {
        value: { type: 'string', description: 'Badge content (number or text)' },
        variant: { type: 'string', enum: ['standard', 'dot'], default: 'standard' }
    },
    actions: [],
    events: [],
    slots: ['default']
});

// ============================================
// PUBLIC API
// ============================================

/**
 * Get JSON Schema for a specific component
 * @param {string} tagName - Component tag name (e.g., 'au-button')
 * @returns {object|null} JSON Schema object or null if not found
 */
export function getComponentSchema(tagName) {
    return componentSchemas.get(tagName) || null;
}

/**
 * Get all available component schemas
 * @returns {Map<string, object>} Map of tag names to schemas
 */
export function getAllSchemas() {
    return new Map(componentSchemas);
}

/**
 * Get list of all schema-documented components
 * @returns {string[]} Array of tag names
 */
export function getSchemaComponents() {
    return Array.from(componentSchemas.keys());
}

/**
 * Get schemas for multiple components at once
 * @param {string[]} tagNames - Array of component tag names
 * @returns {object} Object mapping tag names to schemas
 */
export function getSchemas(tagNames) {
    const result = {};
    for (const tag of tagNames) {
        const schema = componentSchemas.get(tag);
        if (schema) result[tag] = schema;
    }
    return result;
}

/**
 * Get a minimal schema summary for quick reference
 * @param {string} tagName - Component tag name
 * @returns {object|null} Simplified schema with just properties and actions
 */
export function getSchemaQuickRef(tagName) {
    const schema = componentSchemas.get(tagName);
    if (!schema) return null;

    return {
        tag: tagName,
        description: schema.description,
        properties: Object.keys(schema.properties || {}),
        actions: schema.actions || [],
        events: schema.events || []
    };
}

/**
 * Export all schemas as JSON for external tools
 * @returns {string} JSON string of all schemas
 */
export function exportSchemasAsJSON() {
    const allSchemas = {};
    for (const [tag, schema] of componentSchemas) {
        allSchemas[tag] = schema;
    }
    return JSON.stringify(allSchemas, null, 2);
}

// Export for module usage
export const ComponentSchema = {
    getComponentSchema,
    getAllSchemas,
    getSchemaComponents,
    getSchemas,
    getSchemaQuickRef,
    exportSchemasAsJSON
};
