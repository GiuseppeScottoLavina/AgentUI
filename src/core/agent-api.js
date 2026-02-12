/**
 * @fileoverview Agent-Friendly APIs for AgentUI
 * 
 * Provides structured component tree access and natural language descriptions
 * for LLM agents interacting with AgentUI components.
 * 
 * Based on research from Agent-E (2024), WebVoyager benchmark, and
 * DOM distillation techniques for AI browser automation.
 * 
 * @module core/agent-api
 */

/**
 * @typedef {Object} AuComponentInfo
 * @property {string} tag - Component tag name (e.g., 'au-button')
 * @property {string|null} id - Element ID if present
 * @property {string} label - Accessible name/label for the component
 * @property {string} description - Human-readable description of component purpose
 * @property {Object} state - Current component state
 * @property {string[]} actions - Available actions (e.g., ['click', 'toggle'])
 * @property {Object} rect - Bounding client rect {top, left, width, height}
 * @property {boolean} interactive - Whether component accepts user input
 * @property {boolean} visible - Whether component is in viewport
 */

/**
 * Get the accessible name of an element following ARIA naming conventions
 * @param {HTMLElement} el - Element to get name from
 * @returns {string} Accessible name
 */
function getAccessibleName(el) {
    // Priority order per ARIA spec:
    // 1. aria-labelledby
    // 2. aria-label
    // 3. associated label element
    // 4. title attribute
    // 5. text content (for certain roles)
    // 6. placeholder (for inputs)

    // aria-labelledby
    const labelledBy = el.getAttribute('aria-labelledby');
    if (labelledBy) {
        const labels = labelledBy.split(' ')
            .map(id => document.getElementById(id)?.textContent)
            .filter(Boolean)
            .join(' ');
        if (labels) return labels;
    }

    // aria-label
    const ariaLabel = el.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;

    // Associated label element
    if (el.id) {
        const label = document.querySelector(`label[for="${el.id}"]`);
        if (label) return label.textContent.trim();
    }

    // title attribute
    const title = el.getAttribute('title');
    if (title) return title;

    // Text content for buttons, links, etc.
    const role = el.getAttribute('role') || el.tagName.toLowerCase();
    const textRoles = ['button', 'link', 'tab', 'menuitem', 'option', 'radio', 'checkbox'];
    if (textRoles.some(r => role.includes(r))) {
        const text = el.textContent?.trim();
        if (text && text.length < 100) return text;
    }

    // Placeholder for inputs
    const placeholder = el.getAttribute('placeholder');
    if (placeholder) return placeholder;

    // Value for inputs with value
    const value = el.getAttribute('value');
    if (value && el.tagName.includes('INPUT')) return `Input: ${value}`;

    // Fallback to tag name
    return el.tagName.toLowerCase().replace('au-', '');
}

/**
 * Get available actions for a component based on its type and state
 * @param {HTMLElement} el - Component element
 * @returns {string[]} List of available actions
 */
function getAvailableActions(el) {
    const actions = [];
    const tag = el.tagName.toLowerCase();
    const disabled = el.hasAttribute('disabled');

    if (disabled) return ['none (disabled)'];

    // Common interactive actions
    if (el.onclick || el.hasAttribute('onclick')) {
        actions.push('click');
    }

    // Component-specific actions
    switch (tag) {
        case 'au-button':
            actions.push('click');
            break;
        case 'au-checkbox':
        case 'au-switch':
            actions.push('toggle', 'check', 'uncheck');
            break;
        case 'au-input':
        case 'au-textarea':
            actions.push('type', 'clear', 'focus');
            break;
        case 'au-dropdown':
            actions.push('open', 'select', 'close');
            break;
        case 'au-modal':
            actions.push('open', 'close');
            break;
        case 'au-tabs':
            actions.push('select-tab');
            break;
        case 'au-radio':
            actions.push('select');
            break;
        case 'au-chip':
            actions.push('toggle', 'click');
            break;
        case 'au-confirm':
            actions.push('confirm', 'cancel');
            break;
        default:
            if (el.classList.contains('au-button') || el.getAttribute('role') === 'button') {
                actions.push('click');
            }
    }

    return actions.length ? actions : ['focus'];
}

/**
 * Get component state as a plain object
 * @param {HTMLElement} el - Component element
 * @returns {Object} Component state
 */
function getComponentState(el) {
    const state = {};
    const tag = el.tagName.toLowerCase();

    // Common state attributes
    if (el.hasAttribute('checked')) state.checked = true;
    if (el.hasAttribute('disabled')) state.disabled = true;
    if (el.hasAttribute('open')) state.open = true;
    if (el.hasAttribute('selected')) state.selected = true;
    if (el.hasAttribute('active')) state.active = true;
    if (el.hasAttribute('loading')) state.loading = true;
    if (el.hasAttribute('value')) state.value = el.getAttribute('value');

    // ARIA state
    const ariaChecked = el.getAttribute('aria-checked');
    if (ariaChecked) state.ariaChecked = ariaChecked === 'true';

    const ariaExpanded = el.getAttribute('aria-expanded');
    if (ariaExpanded) state.expanded = ariaExpanded === 'true';

    const ariaSelected = el.getAttribute('aria-selected');
    if (ariaSelected) state.selected = ariaSelected === 'true';

    // Component-specific state
    switch (tag) {
        case 'au-input':
        case 'au-textarea':
            const input = el.querySelector('input, textarea');
            if (input) {
                state.value = input.value;
                state.placeholder = input.placeholder;
            }
            break;
        case 'au-progress':
            state.value = parseFloat(el.getAttribute('value') || '0');
            state.max = parseFloat(el.getAttribute('max') || '100');
            state.percentage = (state.value / state.max) * 100;
            break;
        case 'au-dropdown':
            state.value = el.getAttribute('value');
            state.open = el.classList.contains('is-open');
            break;
    }

    return state;
}

/**
 * Generate a natural language description of a component
 * @param {HTMLElement} el - Component element
 * @returns {string} Human-readable description
 */
function describeComponent(el) {
    const tag = el.tagName.toLowerCase().replace('au-', '');
    const label = getAccessibleName(el);
    const state = getComponentState(el);
    const disabled = state.disabled ? ' (disabled)' : '';

    const descriptions = {
        'button': () => `Button "${label}"${disabled}. ${state.loading ? 'Currently loading.' : 'Click to activate.'}`,
        'checkbox': () => `Checkbox "${label}"${disabled}. Currently ${state.ariaChecked || state.checked ? 'checked' : 'unchecked'}.`,
        'switch': () => `Toggle switch "${label}"${disabled}. Currently ${state.ariaChecked || state.checked ? 'on' : 'off'}.`,
        'input': () => `Text input "${label}"${disabled}. ${state.value ? `Current value: "${state.value}"` : 'Empty.'} ${state.placeholder ? `Placeholder: "${state.placeholder}"` : ''}`,
        'textarea': () => `Text area "${label}"${disabled}. ${state.value ? `Contains: "${state.value.slice(0, 50)}${state.value.length > 50 ? '...' : ''}"` : 'Empty.'}`,
        'dropdown': () => `Dropdown "${label}"${disabled}. ${state.value ? `Selected: "${state.value}"` : 'No selection.'} ${state.open ? 'Menu is open.' : 'Menu is closed.'}`,
        'modal': () => `Modal dialog${state.open ? ' (currently open)' : ' (currently closed)'}. ${label !== 'modal' ? `Title: "${label}"` : ''}`,
        'tabs': () => `Tab navigation with ${el.querySelectorAll('au-tab').length} tabs.`,
        'tab': () => `Tab "${label}". ${state.active ? 'Currently active.' : 'Inactive.'}`,
        'progress': () => `Progress bar at ${Math.round(state.percentage || 0)}%.`,
        'spinner': () => 'Loading spinner indicating operation in progress.',
        'alert': () => `Alert message: "${el.textContent?.trim().slice(0, 100) || label}"`,
        'card': () => `Card container${label !== 'card' ? ` titled "${label}"` : ''}.`,
        'chip': () => `Chip "${label}"${disabled}. ${state.selected ? 'Selected.' : 'Not selected.'}`,
        'badge': () => `Badge showing "${el.textContent?.trim() || 'notification'}"`,
        'avatar': () => `User avatar${el.getAttribute('name') ? ` for "${el.getAttribute('name')}"` : ''}`,
        'icon': () => `Icon: ${el.getAttribute('name') || 'decorative'}`,
        'confirm': () => `Confirmation dialog. ${state.open ? 'Waiting for user response.' : 'Hidden.'}`,
        'fetch': () => `Data fetcher${state.loading ? ' (loading)' : ''}. URL: ${el.getAttribute('url') || 'not set'}`
    };

    const describer = descriptions[tag];
    if (describer) return describer();

    // Generic fallback
    return `${tag} component${label ? ` "${label}"` : ''}${disabled}.`;
}

/**
 * Check if element is visible in viewport
 * @param {HTMLElement} el 
 * @returns {boolean}
 */
function isInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top < window.innerHeight &&
        rect.bottom > 0 &&
        rect.left < window.innerWidth &&
        rect.right > 0 &&
        rect.width > 0 &&
        rect.height > 0
    );
}

/**
 * Get a simplified component tree for agent parsing
 * Implements DOM distillation as per Agent-E (2024) research
 * 
 * @param {HTMLElement} [root=document.body] - Root element to scan
 * @param {Object} [options] - Options
 * @param {boolean} [options.visibleOnly=false] - Only include visible components
 * @param {boolean} [options.interactiveOnly=false] - Only include interactive components
 * @param {string[]} [options.types] - Filter to specific component types
 * @returns {AuComponentInfo[]} Array of component info objects
 * 
 * @example
 * // Get all components
 * const tree = getAuComponentTree();
 * 
 * // Get only visible interactive components
 * const interactive = getAuComponentTree(document.body, { 
 *     visibleOnly: true, 
 *     interactiveOnly: true 
 * });
 * 
 * // Get only buttons and inputs
 * const forms = getAuComponentTree(document.body, {
 *     types: ['au-button', 'au-input', 'au-checkbox']
 * });
 */
export function getAuComponentTree(root = document.body, options = {}) {
    const { visibleOnly = false, interactiveOnly = false, types = null } = options;

    // Find all au-* custom elements by tag name
    let elements;
    if (types) {
        elements = root.querySelectorAll(types.join(','));
    } else {
        // Custom elements always contain a hyphen — filter by au- prefix
        elements = Array.from(root.querySelectorAll('*'))
            .filter(el => el.tagName.toLowerCase().startsWith('au-') &&
                el.tagName.toLowerCase() !== 'au-ripple-wave');
    }
    const results = [];

    const interactiveTags = new Set([
        'au-button', 'au-checkbox', 'au-switch', 'au-input', 'au-textarea',
        'au-dropdown', 'au-radio', 'au-tab', 'au-chip', 'au-modal', 'au-confirm'
    ]);

    for (const el of elements) {
        const tag = el.tagName.toLowerCase();

        const isInteractive = interactiveTags.has(tag);
        const visible = isInViewport(el);

        // Apply filters
        if (visibleOnly && !visible) continue;
        if (interactiveOnly && !isInteractive) continue;

        const rect = el.getBoundingClientRect();

        results.push({
            tag,
            id: el.id || null,
            label: getAccessibleName(el),
            description: describeComponent(el),
            state: getComponentState(el),
            actions: getAvailableActions(el),
            rect: {
                top: Math.round(rect.top),
                left: Math.round(rect.left),
                width: Math.round(rect.width),
                height: Math.round(rect.height)
            },
            interactive: isInteractive,
            visible
        });
    }

    return results;
}

/**
 * Describe a single component in natural language
 * @param {HTMLElement|string} component - Element or CSS selector
 * @returns {string|null} Natural language description or null if not found
 */
export function describe(component) {
    const el = typeof component === 'string'
        ? document.querySelector(component)
        : component;

    if (!el) return null;
    return describeComponent(el);
}

/**
 * Get a map of all registered AgentUI custom elements
 * @returns {Map<string, typeof HTMLElement>} Map of tag names to constructors
 */
export function getRegisteredComponents() {
    const components = new Map();
    const possibleTags = [
        'au-button', 'au-input', 'au-textarea', 'au-checkbox', 'au-switch',
        'au-dropdown', 'au-option', 'au-radio', 'au-radio-group', 'au-chip',
        'au-card', 'au-tabs', 'au-tab', 'au-alert', 'au-badge', 'au-progress',
        'au-avatar', 'au-skeleton', 'au-spinner', 'au-modal', 'au-toast',
        'au-tooltip', 'au-icon', 'au-stack', 'au-grid', 'au-container',
        'au-navbar', 'au-sidebar', 'au-divider', 'au-theme-toggle',
        'au-virtual-list', 'au-lazy', 'au-repeat', 'au-form', 'au-table',
        'au-confirm', 'au-fetch'
    ];

    for (const tag of possibleTags) {
        const constructor = customElements.get(tag);
        if (constructor) {
            components.set(tag, constructor);
        }
    }

    return components;
}

/**
 * Find components by their accessible label (fuzzy match)
 * @param {string} labelQuery - Label text to search for
 * @param {HTMLElement} [root=document.body] - Root to search within
 * @returns {HTMLElement[]} Matching components
 */
export function findByLabel(labelQuery, root = document.body) {
    const query = labelQuery.toLowerCase();
    const tree = getAuComponentTree(root);

    return tree
        .filter(info => info.label.toLowerCase().includes(query))
        .map(info => {
            const selector = info.id
                ? `#${info.id}`
                : `${info.tag}`;
            return root.querySelector(selector);
        })
        .filter(Boolean);
}

// ============================================
// 2026 VISUAL MARKERS (UI-TARS Research)
// ============================================

let markersEnabled = false;
let markerContainer = null;
const markerMap = new Map(); // element -> marker element

/**
 * Enable visual markers on interactive elements for screenshot-based AI agents.
 * Based on UI-TARS (2025) hybrid DOM+Vision research.
 * 
 * Adds overlay labels like [B1], [I1], [C1] to each interactive element.
 * 
 * @param {Object} [options] - Options
 * @param {boolean} [options.showLabels=true] - Show text labels ([B1], etc.)
 * @param {boolean} [options.showBoxes=true] - Show bounding boxes
 * @param {string} [options.markerStyle='badge'] - Style: 'badge' | 'corner' | 'outline'
 * @returns {Map<string, HTMLElement>} Map of marker IDs to elements
 * 
 * @example
 * const markers = AgentUI.enableVisualMarkers();
 * // Take screenshot
 * // Agent sees: [B1] Save, [B2] Cancel, [I1] Email input
 */
export function enableVisualMarkers(options = {}) {
    const { showLabels = true, showBoxes = true, markerStyle = 'badge' } = options;

    // Disable first if already enabled
    if (markersEnabled) disableVisualMarkers();

    // Create container
    markerContainer = document.createElement('div');
    markerContainer.id = 'au-visual-markers';
    markerContainer.style.cssText = `
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 999999;
    `;
    document.body.appendChild(markerContainer);

    // Counter prefixes by type
    const counters = { B: 0, I: 0, C: 0, S: 0, D: 0, M: 0, T: 0, R: 0, O: 0 };

    // Get type prefix
    const getPrefix = (tag) => {
        const prefixes = {
            'au-button': 'B',
            'au-input': 'I',
            'au-textarea': 'I',
            'au-checkbox': 'C',
            'au-switch': 'S',
            'au-dropdown': 'D',
            'au-modal': 'M',
            'au-tabs': 'T',
            'au-tab': 'T',
            'au-radio': 'R',
            'au-chip': 'C',
            'au-confirm': 'M'
        };
        return prefixes[tag] || 'O';
    };

    // Get interactive components
    const tree = getAuComponentTree(document.body, { interactiveOnly: true, visibleOnly: true });

    for (const info of tree) {
        const prefix = getPrefix(info.tag);
        counters[prefix]++;
        const markerId = `${prefix}${counters[prefix]}`;

        const el = document.querySelector(
            info.id ? `#${info.id}` : `${info.tag}[data-au-action="${info.state.action || ''}"]`
        ) || document.querySelector(info.tag);

        if (!el) continue;

        const rect = el.getBoundingClientRect();

        // Create marker
        const marker = document.createElement('div');
        marker.className = 'au-visual-marker';
        marker.dataset.markerId = markerId;
        marker.dataset.tag = info.tag;
        marker.dataset.label = info.label;

        const bgColor = {
            'B': '#7C4DFF', // Buttons - purple
            'I': '#00BCD4', // Inputs - cyan
            'C': '#4CAF50', // Checkboxes - green
            'S': '#FF9800', // Switches - orange
            'D': '#2196F3', // Dropdowns - blue
            'M': '#E91E63', // Modals - pink
            'T': '#9C27B0', // Tabs - deep purple
            'R': '#795548', // Radio - brown
            'O': '#607D8B'  // Other - grey
        }[prefix];

        if (markerStyle === 'badge') {
            marker.style.cssText = `
                position: fixed;
                top: ${rect.top - 8}px;
                left: ${rect.left - 8}px;
                background: ${bgColor};
                color: white;
                font: bold 11px system-ui;
                padding: 2px 6px;
                border-radius: 4px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                white-space: nowrap;
            `;
            marker.textContent = showLabels ? `${markerId}` : '';
        } else if (markerStyle === 'outline') {
            marker.style.cssText = `
                position: fixed;
                top: ${rect.top}px;
                left: ${rect.left}px;
                width: ${rect.width}px;
                height: ${rect.height}px;
                border: 2px solid ${bgColor};
                border-radius: 4px;
                box-shadow: 0 0 0 1px rgba(255,255,255,0.5);
            `;
            if (showLabels) {
                const label = document.createElement('span');
                label.style.cssText = `
                    position: absolute;
                    top: -18px;
                    left: -2px;
                    background: ${bgColor};
                    color: white;
                    font: bold 10px system-ui;
                    padding: 1px 4px;
                    border-radius: 2px;
                `;
                label.textContent = markerId;
                marker.appendChild(label);
            }
        }

        markerContainer.appendChild(marker);
        markerMap.set(markerId, el);
    }

    markersEnabled = true;
    return markerMap;
}

/**
 * Disable visual markers
 */
export function disableVisualMarkers() {
    if (markerContainer) {
        markerContainer.remove();
        markerContainer = null;
    }
    markerMap.clear();
    markersEnabled = false;
}

/**
 * Get element by visual marker ID
 * @param {string} markerId - Marker ID (e.g., 'B1', 'I2')
 * @returns {HTMLElement|null}
 */
export function getMarkerElement(markerId) {
    return markerMap.get(markerId) || null;
}

/**
 * Get all current marker mappings
 * @returns {Object} Object mapping marker IDs to element info
 */
export function getMarkerMap() {
    const result = {};
    for (const [id, el] of markerMap) {
        result[id] = {
            tag: el.tagName.toLowerCase(),
            label: getAccessibleName(el),
            actions: getAvailableActions(el)
        };
    }
    return result;
}

// ============================================
// 2026 MCP ACTIONS (Anthropic/Google Standard)
// ============================================

/**
 * Get available actions in MCP (Model Context Protocol) compatible format.
 * This is the emerging standard for agent-tool communication in 2026.
 * 
 * @returns {Object} MCP-compatible action schema
 * 
 * @example
 * const actions = AgentUI.getMCPActions();
 * // Returns:
 * // {
 * //   name: "agentui",
 * //   description: "Interact with AgentUI web components",
 * //   actions: [
 * //     { name: "click_button", parameters: { selector: {...} } },
 * //     { name: "fill_input", parameters: { selector: {...}, value: {...} } }
 * //   ]
 * // }
 */
export function getMCPActions() {
    return {
        name: 'agentui',
        version: '3.4.0',
        description: 'Interact with AgentUI Material Design 3 web components',
        actions: [
            {
                name: 'click_button',
                description: 'Click a button element',
                parameters: {
                    selector: {
                        type: 'string',
                        description: 'CSS selector, marker ID (e.g., "B1"), or label text',
                        required: true
                    }
                }
            },
            {
                name: 'fill_input',
                description: 'Fill an input or textarea with text',
                parameters: {
                    selector: {
                        type: 'string',
                        description: 'CSS selector, marker ID (e.g., "I1"), or label text',
                        required: true
                    },
                    value: {
                        type: 'string',
                        description: 'Text to enter',
                        required: true
                    },
                    clear: {
                        type: 'boolean',
                        description: 'Clear existing content first',
                        default: true
                    }
                }
            },
            {
                name: 'toggle_checkbox',
                description: 'Toggle a checkbox or switch',
                parameters: {
                    selector: {
                        type: 'string',
                        description: 'CSS selector, marker ID, or label text',
                        required: true
                    },
                    checked: {
                        type: 'boolean',
                        description: 'Target state (true=checked, false=unchecked)',
                        required: false
                    }
                }
            },
            {
                name: 'select_option',
                description: 'Select an option in a dropdown',
                parameters: {
                    selector: {
                        type: 'string',
                        description: 'CSS selector for dropdown',
                        required: true
                    },
                    value: {
                        type: 'string',
                        description: 'Option value or text to select',
                        required: true
                    }
                }
            },
            {
                name: 'open_modal',
                description: 'Open a modal dialog',
                parameters: {
                    selector: {
                        type: 'string',
                        description: 'CSS selector for modal',
                        required: true
                    }
                }
            },
            {
                name: 'close_modal',
                description: 'Close a modal dialog',
                parameters: {
                    selector: {
                        type: 'string',
                        description: 'CSS selector for modal',
                        required: true
                    }
                }
            },
            {
                name: 'select_tab',
                description: 'Select a tab by index or label',
                parameters: {
                    tabs_selector: {
                        type: 'string',
                        description: 'CSS selector for au-tabs container',
                        required: true
                    },
                    index: {
                        type: 'number',
                        description: 'Tab index (0-based)',
                        required: false
                    },
                    label: {
                        type: 'string',
                        description: 'Tab label text',
                        required: false
                    }
                }
            },
            {
                name: 'get_component_tree',
                description: 'Get structured tree of all AgentUI components',
                parameters: {
                    visible_only: {
                        type: 'boolean',
                        description: 'Only include visible components',
                        default: true
                    },
                    interactive_only: {
                        type: 'boolean',
                        description: 'Only include interactive components',
                        default: false
                    }
                }
            },
            {
                name: 'enable_visual_markers',
                description: 'Enable visual markers for screenshot parsing',
                parameters: {
                    style: {
                        type: 'string',
                        enum: ['badge', 'outline'],
                        description: 'Marker visual style',
                        default: 'badge'
                    }
                }
            },
            {
                name: 'confirm_dialog',
                description: 'Respond to a confirmation dialog',
                parameters: {
                    action: {
                        type: 'string',
                        enum: ['confirm', 'cancel'],
                        description: 'Whether to confirm or cancel',
                        required: true
                    }
                }
            }
        ]
    };
}

// Export for global access
export const AgentAPI = {
    getAuComponentTree,
    describe,
    getRegisteredComponents,
    findByLabel,
    getAccessibleName,
    getAvailableActions,
    getComponentState,
    // 2026 Visual Markers
    enableVisualMarkers,
    disableVisualMarkers,
    getMarkerElement,
    getMarkerMap,
    // 2026 MCP Actions
    getMCPActions
};
