/**
 * @fileoverview Lazy-loaded component describe() catalog
 * 
 * TODO: This 1900+ line file is hand-maintained and will drift from source.
 * It should be auto-generated from JSDoc/source analysis during build.
 * See: https://github.com/AntiguaUI/agentui/issues — maintainer audit P1.2
 * 
 * This file is NOT included in the main bundle.
 * It is loaded on-demand when an agent calls discoverAll() or
 * loads descriptions via AgentUI.loadDescriptions().
 * 
 * Regular users never download this file — zero perf cost.
 * 
 * @generated Extracted from component static describe() methods
 */

export const catalog = {
    "au-alert": {
        "name": "au-alert",
        "description": "Material Design 3 alert/banner for messages",
        "props": {
            "severity": {
                "type": "string",
                "values": [
                    "info",
                    "success",
                    "warning",
                    "error"
                ],
                "default": "info",
                "description": "Visual severity level, controls color and icon"
            },
            "dismissible": {
                "type": "boolean",
                "default": false,
                "description": "Shows a close button to dismiss the alert"
            }
        },
        "events": {
            "au-dismiss": { "detail": {} }
        },
        "examples": [
            "<au-alert severity=\"success\">Saved!</au-alert>",
            "<au-alert severity=\"error\" dismissible>Error occurred</au-alert>"
        ],
        "tips": [
            "Use severity for visual styling",
            "Add dismissible for X button"
        ]
    },
    "au-api-table": {
        "name": "au-api-table",
        "description": "API documentation table showing component properties, events, or methods",
        "props": {
            "type": {
                "type": "string",
                "values": [
                    "properties",
                    "events",
                    "methods",
                    "css",
                    "slots"
                ],
                "description": "Type of API items to display"
            }
        },
        "events": [],
        "examples": [
            "<au-api-table type=\"properties\">\n  <au-api-row name=\"variant\" type=\"string\" default=\"primary\"></au-api-row>\n</au-api-table>"
        ],
        "tips": [
            "Internal component used in demo documentation"
        ]
    },
    "au-avatar": {
        "name": "au-avatar",
        "description": "Circular avatar showing image, initials, or icon",
        "props": {
            "src": {
                "type": "string",
                "description": "Image URL"
            },
            "alt": {
                "type": "string",
                "description": "Alt text for the image"
            },
            "initials": {
                "type": "string",
                "description": "Fallback initials (e.g. \"JD\")"
            },
            "size": {
                "type": "string",
                "values": [
                    "sm",
                    "md",
                    "lg"
                ],
                "default": "md",
                "description": "Avatar diameter (sm=32px, md=40px, lg=56px)"
            }
        },
        "events": [],
        "examples": [
            "<au-avatar src=\"/photo.jpg\" alt=\"John Doe\"></au-avatar>",
            "<au-avatar initials=\"JD\" size=\"lg\"></au-avatar>"
        ],
        "tips": [
            "Automatically shows initials when image fails to load"
        ]
    },
    "au-badge": {
        "name": "au-badge",
        "description": "Small status indicator badge, attach to other components",
        "props": {
            "variant": {
                "type": "string",
                "values": [
                    "primary",
                    "secondary",
                    "error",
                    "success"
                ],
                "default": "primary",
                "description": "Color variant using MD3 system colors"
            },
            "size": {
                "type": "string",
                "values": [
                    "sm",
                    "md"
                ],
                "default": "md",
                "description": "Badge size (sm=dot indicator, md=with text content)"
            }
        },
        "events": [],
        "examples": [
            "<au-badge variant=\"error\">3</au-badge>",
            "<au-badge variant=\"success\">Online</au-badge>"
        ],
        "tips": [
            "Place inside a parent element with position: relative for overlay positioning"
        ]
    },
    "au-bottom-nav": {
        "name": "au-bottom-nav",
        "description": "Mobile bottom navigation bar with icon + label items",
        "props": {
            "hide-on-desktop": {
                "type": "boolean",
                "default": false,
                "description": "Hides the bottom nav on desktop viewports (>= 600px)"
            },
            "value": {
                "type": "string",
                "description": "Currently selected nav item value"
            }
        },
        "events": {
            "au-change": { "detail": { "value": "string", "item": "Element" } }
        },
        "examples": [
            "<au-bottom-nav>\n  <au-drawer-item icon=\"home\" label=\"Home\" active></au-drawer-item>\n  <au-drawer-item icon=\"search\" label=\"Search\"></au-drawer-item>\n</au-bottom-nav>"
        ],
        "tips": [
            "Best for mobile layouts — shows at screen bottom with up to 5 items"
        ]
    },
    "au-button": {
        "name": "au-button",
        "description": "Material Design 3 button component with ripple effect",
        "props": {
            "variant": {
                "type": "string",
                "values": [
                    "filled",
                    "elevated",
                    "tonal",
                    "outlined",
                    "text",
                    "danger",
                    "primary",
                    "secondary",
                    "ghost"
                ],
                "default": "primary",
                "description": "Visual style. Use filled/elevated/tonal for emphasis, outlined/text for secondary actions, danger for destructive."
            },
            "size": {
                "type": "string",
                "values": [
                    "sm",
                    "md",
                    "lg"
                ],
                "default": "md",
                "description": "Button size (sm=28px, md=36px, lg=48px height)"
            },
            "disabled": {
                "type": "boolean",
                "default": false,
                "description": "Disables the button and prevents clicks"
            }
        },
        "events": {
            "click": { "detail": {} }
        },
        "examples": [
            "<au-button variant=\"filled\">Click Me</au-button>",
            "<au-button variant=\"outlined\" size=\"sm\">Small</au-button>",
            "<au-button variant=\"danger\" disabled>Disabled</au-button>"
        ],
        "tips": [
            "Use textContent to update label dynamically",
            "Use data-i18n attribute for internationalization",
            "Add disabled attribute while processing async actions",
            "Icon-only buttons MUST have aria-label for accessibility, e.g. <au-button aria-label=\"Edit\"><au-icon name=\"edit\"></au-icon></au-button>"
        ],
        "composition": {
            "au-modal": {
                "works": true,
                "gotchas": [
                    "Event listeners on buttons inside au-modal are LOST — the modal clones innerHTML into a native <dialog>",
                    "Use event delegation on the au-modal element: modal.addEventListener('click', e => { if (e.target.closest('#save-btn')) ... })"
                ]
            }
        }
    },
    "au-callout": {
        "name": "au-callout",
        "description": "Highlighted content block for notes, warnings, or tips",
        "props": {
            "variant": {
                "type": "string",
                "values": [
                    "info",
                    "success",
                    "warning",
                    "error"
                ],
                "default": "info",
                "description": "Visual severity level, controls color and icon"
            },
            "title": {
                "type": "string",
                "description": "Callout title text"
            }
        },
        "events": [],
        "examples": [
            "<au-callout variant=\"warning\" title=\"Important\">Please save your work before proceeding.</au-callout>"
        ],
        "tips": [
            "Similar to GitHub alerts — use for docs and guides"
        ]
    },
    "au-card": {
        "name": "au-card",
        "description": "Material Design 3 card container with elevation and padding options",
        "props": {
            "variant": {
                "type": "string",
                "values": [
                    "flat",
                    "elevated",
                    "outlined",
                    "filled"
                ],
                "default": "flat",
                "description": "Visual style. elevated=shadow, outlined=border, filled=background color."
            },
            "padding": {
                "type": "string",
                "values": [
                    "none",
                    "sm",
                    "md",
                    "lg"
                ],
                "default": "md",
                "description": "Inner padding size (none=0, sm=8px, md=16px, lg=24px)"
            }
        },
        "slots": [
            "default"
        ],
        "events": [],
        "examples": [
            "<au-card variant=\"elevated\"><h3>Title</h3><p>Content</p></au-card>",
            "<au-card variant=\"outlined\" padding=\"lg\">Large padding card</au-card>",
            "<au-card padding=\"none\">No padding card</au-card>"
        ],
        "tips": [
            "Use variant=\"elevated\" for prominent cards with shadow",
            "Use variant=\"outlined\" for cards with border only",
            "Nest au-stack or au-grid inside for complex layouts"
        ]
    },
    "au-checkbox": {
        "name": "au-checkbox",
        "description": "Material Design 3 checkbox with indeterminate state support",
        "props": {
            "checked": {
                "type": "boolean",
                "default": false,
                "description": "Whether the checkbox is checked"
            },
            "disabled": {
                "type": "boolean",
                "default": false,
                "description": "Disables the checkbox and prevents user interaction"
            },
            "indeterminate": {
                "type": "boolean",
                "default": false,
                "description": "Visual \"partial\" state, cleared on user click"
            },
            "label": {
                "type": "string",
                "description": "Checkbox label text"
            },
            "name": {
                "type": "string",
                "description": "Form field name"
            }
        },
        "events": {
            "au-change": { "detail": { "checked": "boolean", "indeterminate": "boolean" } }
        },
        "examples": [
            "<au-checkbox label=\"I agree\"></au-checkbox>",
            "<au-checkbox checked>Remember me</au-checkbox>",
            "<au-checkbox indeterminate>Select all</au-checkbox>"
        ],
        "tips": [
            "Use .checked property to get/set state",
            "indeterminate is visual only, cleared on user interaction",
            "Listen to au-change for state updates"
        ],
        "composition": {
            "dynamic-render": {
                "works": true,
                "gotchas": [
                    "In loops, use document.createElement('au-checkbox') instead of innerHTML to avoid re-triggering connectedCallback",
                    "Use a _isRendering guard when updating lists inside au-change handlers to prevent infinite loops"
                ]
            }
        }
    },
    "au-chip": {
        "name": "au-chip",
        "description": "Material Design 3 chip component - toggleable tag or static badge",
        "props": {
            "selected": {
                "type": "boolean",
                "default": false,
                "description": "Whether the chip is in selected state"
            },
            "removable": {
                "type": "boolean",
                "default": false,
                "description": "Shows remove button (X) and emits au-remove on click"
            },
            "variant": {
                "type": "string",
                "values": [
                    "outlined",
                    "filled"
                ],
                "default": "outlined",
                "description": "Visual style of the chip"
            },
            "static": {
                "type": "boolean",
                "default": false,
                "description": "Non-interactive display mode (badge). Disables toggle, ripple, and keyboard activation."
            }
        },
        "events": {
            "au-change": { "detail": { "selected": "boolean" } },
            "au-remove": { "detail": {} }
        },
        "examples": [
            "<au-chip>Default tag</au-chip>",
            "<au-chip selected>Selected</au-chip>",
            "<au-chip removable>Removable</au-chip>",
            "<au-chip variant=\"filled\">Filled</au-chip>",
            "<au-chip static>Badge (non-interactive)</au-chip>",
            "<au-chip static variant=\"filled\">Status badge</au-chip>"
        ],
        "tips": [
            "Use static for display-only badges (priority, status, labels)",
            "Use default (no static) for filter chips the user can toggle",
            "Use removable for tags the user can dismiss"
        ]
    },
    "au-code": {
        "name": "au-code",
        "description": "Code block with syntax highlighting and copy-to-clipboard",
        "props": {
            "language": {
                "type": "string",
                "description": "Programming language for syntax highlighting"
            }
        },
        "events": [],
        "examples": [
            "<au-code language=\"javascript\">const x = 42;</au-code>"
        ],
        "tips": [
            "Place code as text content inside the element"
        ]
    },
    "au-confirm": {
        "name": "au-confirm",
        "description": "Confirmation dialog with Promise-based API. Use auConfirm() for one-liner async confirms.",
        "props": {
            "title": {
                "type": "string",
                "default": "Confirm",
                "description": "Dialog title text"
            },
            "message": {
                "type": "string",
                "description": "Confirmation message text"
            },
            "confirm-text": {
                "type": "string",
                "default": "Confirm",
                "description": "Label for the confirm action button"
            },
            "cancel-text": {
                "type": "string",
                "default": "Cancel",
                "description": "Label for the cancel action button"
            },
            "variant": {
                "type": "string",
                "values": [
                    "primary",
                    "danger",
                    "warning"
                ],
                "default": "primary",
                "description": "Visual style of the confirm button (danger for destructive actions)"
            },
            "open": {
                "type": "boolean",
                "default": false,
                "description": "Whether the confirmation dialog is visible"
            },
            "size": {
                "type": "string",
                "values": [
                    "sm",
                    "md",
                    "lg"
                ],
                "default": "sm",
                "description": "Dialog width (sm=360px, md=480px, lg=640px)"
            }
        },
        "events": {
            "au-confirm": { "detail": {} },
            "au-cancel": { "detail": {} }
        },
        "examples": [
            "const ok = await auConfirm('Delete this item?');",
            "const ok = await auConfirm('Are you sure?', { title: 'Confirm Delete', variant: 'danger' });"
        ],
        "tips": [
            "Use the auConfirm() function for Promise-based one-liners",
            "Variant \"danger\" shows a red confirm button"
        ]
    },
    "au-container": {
        "name": "au-container",
        "description": "Responsive content container with max-width and centering",
        "props": {
            "size": {
                "type": "string",
                "values": [
                    "sm",
                    "md",
                    "lg",
                    "xl",
                    "full"
                ],
                "default": "lg",
                "description": "Maximum width of the container (sm=640px, md=768px, lg=1024px, xl=1280px, full=100%)"
            },
            "padding": {
                "type": "string",
                "values": [
                    "none",
                    "sm",
                    "md",
                    "lg"
                ],
                "default": "md",
                "description": "Inner padding size (none=0, sm=8px, md=16px, lg=24px)"
            },
            "center": {
                "type": "string",
                "default": true,
                "description": "Centers the container with auto margins (on by default). Set center=\"false\" to disable."
            }
        },
        "events": [],
        "examples": [
            "<au-container size=\"md\">\n  <h1>Page Content</h1>\n</au-container>"
        ],
        "tips": [
            "Use as outer wrapper for page content with consistent max-width"
        ]
    },
    "au-datatable": {
        "name": "au-datatable",
        "description": "AI-First smart data table with built-in sorting, pagination, filtering, and row selection",
        "props": {
            "columns": {
                "type": "json",
                "description": "JSON array of column definitions [{field, label, sortable, filterable}]"
            },
            "page-size": {
                "type": "number",
                "default": 10,
                "description": "Rows per page"
            },
            "sortable": {
                "type": "boolean",
                "default": false,
                "description": "Enables column header click-to-sort globally"
            },
            "selectable": {
                "type": "boolean",
                "default": false,
                "description": "Enables row selection with checkboxes"
            },
            "filterable": {
                "type": "boolean",
                "default": false,
                "description": "Shows a search/filter input above the table"
            },
            "empty-message": {
                "type": "string",
                "default": "No data available",
                "description": "Message shown when the table has no rows"
            }
        },
        "methods": [
            "setData(data)",
            "getData()",
            "sortBy(field, dir)",
            "filter(query)",
            "goToPage(n)",
            "getSelectedRows()",
            "getPageInfo()",
            "getSortState()"
        ],
        "events": {
            "au-data-change": { "detail": { "data": "any[]", "count": "number" } },
            "au-sort-change": { "detail": { "column": "string", "direction": "string" } },
            "au-page-change": { "detail": { "page": "number", "pageSize": "number", "total": "number", "totalPages": "number" } },
            "au-selection-change": { "detail": { "selected": "any[]" } }
        },
        "examples": [
            "<au-datatable columns='[{\"field\":\"name\",\"label\":\"Name\",\"sortable\":true},{\"field\":\"email\",\"label\":\"Email\"}]' sortable filterable></au-datatable>",
            "document.querySelector('au-datatable').setData([{name:'Alice',email:'alice@example.com'}])"
        ],
        "tips": [
            "Set data via setData() method, not attributes",
            "Use filterable attribute to enable built-in search",
            "Columns support custom render functions for formatting"
        ]
    },
    "au-divider": {
        "name": "au-divider",
        "description": "Horizontal or vertical visual separator",
        "props": {
            "vertical": {
                "type": "boolean",
                "default": false,
                "description": "Renders the divider vertically instead of horizontally"
            },
            "inset": {
                "type": "boolean",
                "default": false,
                "description": "Adds horizontal margin to inset the divider from the container edges"
            }
        },
        "events": [],
        "examples": [
            "<au-divider></au-divider>",
            "<au-divider vertical></au-divider>"
        ],
        "tips": [
            "Use inset for padded dividers inside lists"
        ]
    },
    "au-doc-page": {
        "name": "au-doc-page",
        "description": "Documentation page container with auto-generated API tables",
        "props": {
            "title": {
                "type": "string",
                "description": "Page heading"
            },
            "selector": {
                "type": "string",
                "description": "Component selector to document"
            },
            "description": {
                "type": "string",
                "description": "Component description"
            }
        },
        "events": [],
        "examples": [
            "<au-doc-page title=\"Button\" selector=\"au-button\" description=\"Interactive button component\"></au-doc-page>"
        ],
        "tips": [
            "Internal component used in the demo site to auto-generate docs"
        ]
    },
    "au-drawer-item": {
        "name": "au-drawer-item",
        "description": "Navigation item inside au-drawer with icon and label",
        "props": {
            "icon": {
                "type": "string",
                "description": "Material icon name"
            },
            "label": {
                "type": "string",
                "description": "Navigation label text"
            },
            "href": {
                "type": "string",
                "description": "Navigation target"
            },
            "active": {
                "type": "boolean",
                "default": false,
                "description": "Highlights item as the current page"
            },
            "badge": {
                "type": "string",
                "description": "Badge text shown beside the label (e.g. notification count)"
            },
            "disabled": {
                "type": "boolean",
                "default": false,
                "description": "Disables the navigation item"
            },
            "layout": {
                "type": "string",
                "description": "Controls display layout variant of the drawer item"
            }
        },
        "events": {
            "au-nav-select": { "detail": { "href": "string", "item": "Element" } }
        },
        "examples": [
            "<au-drawer-item icon=\"home\" label=\"Dashboard\" href=\"#dashboard\" active></au-drawer-item>"
        ],
        "tips": [
            "Set active attribute to highlight the current page"
        ]
    },
    "au-drawer": {
        "name": "au-drawer",
        "description": "Adaptive navigation drawer — expands on desktop, collapses to rail on tablet, modal overlay on mobile",
        "props": {
            "mode": {
                "type": "string",
                "values": [
                    "auto",
                    "permanent",
                    "temporary",
                    "rail"
                ],
                "default": "auto",
                "description": "Display mode. auto=responsive (desktop→permanent, tablet→rail, mobile→overlay), permanent=always visible, temporary=overlay, rail=collapsed icon strip"
            },
            "open": {
                "type": "boolean",
                "default": false,
                "description": "Whether the drawer is expanded. In temporary mode, controls the overlay state."
            },
            "expand-on-hover": {
                "type": "boolean",
                "default": false,
                "description": "In rail mode, expands the drawer to full width on mouse hover"
            },
            "position": {
                "type": "string",
                "values": [
                    "start",
                    "end"
                ],
                "default": "start",
                "description": "Which side of the viewport the drawer appears on (logical direction)"
            }
        },
        "methods": [
            "toggle()"
        ],
        "events": {
            "au-nav-select": { "detail": { "href": "string", "item": "Element" } }
        },
        "examples": [
            "<au-drawer mode=\"auto\">\n  <au-drawer-item icon=\"home\" label=\"Home\" href=\"#home\" active></au-drawer-item>\n  <au-drawer-item icon=\"settings\" label=\"Settings\" href=\"#settings\"></au-drawer-item>\n</au-drawer>"
        ],
        "tips": [
            "Use mode=\"auto\" for responsive behavior across breakpoints",
            "Call toggle() to open/close on mobile"
        ]
    },
    "au-dropdown": {
        "name": "au-dropdown",
        "description": "Material Design 3 select menu with popover API",
        "props": {
            "placeholder": {
                "type": "string",
                "default": "Select",
                "description": "Text shown when no option is selected"
            },
            "value": {
                "type": "string",
                "description": "Selected option value"
            },
            "disabled": {
                "type": "boolean",
                "default": false,
                "description": "Disables the dropdown and prevents opening"
            }
        },
        "events": {
            "au-select": { "detail": { "value": "string", "label": "string" } }
        },
        "examples": [
            "<au-dropdown placeholder=\"Choose\"><au-option value=\"a\">A</au-option></au-dropdown>",
            "<au-dropdown><option value=\"1\">One</option></au-dropdown>"
        ],
        "tips": [
            "Use au-option or standard option children",
            "Listen to au-select for selection changes",
            "Use .value property to get/set selection",
            ".value = 'x' sets the attribute but does NOT update the displayed label — use .select(value, label) instead"
        ],
        "composition": {
            "au-modal": {
                "works": true,
                "gotchas": [
                    "Event listeners on dropdown inside au-modal are LOST — use event delegation on au-modal",
                    "After modal.open(), use dropdown.select(value, label) to pre-populate — .value = does NOT update displayed text",
                    "Listen to au-select events via delegation: modal.addEventListener('au-select', e => { ... })"
                ]
            }
        }
    },
    "au-error-boundary": {
        "name": "au-error-boundary",
        "description": "Catches errors in child components and displays fallback UI",
        "props": {
            "fallback": {
                "type": "string",
                "description": "Fallback HTML content to show on error"
            }
        },
        "events": {
            "au-error": { "detail": { "error": "Error", "componentName": "string" } },
            "au-recover": { "detail": {} }
        },
        "examples": [
            "<au-error-boundary fallback=\"<p>Something went wrong</p>\">\n  <my-component></my-component>\n</au-error-boundary>"
        ],
        "tips": [
            "Prevents one broken component from crashing the entire page"
        ]
    },
    "au-example": {
        "name": "au-example",
        "description": "Component example container used in documentation — shows live preview with source code toggle",
        "props": {
            "title": {
                "type": "string",
                "description": "Example title"
            }
        },
        "events": [],
        "examples": [
            "<au-example title=\"Button sizes\">\n  <au-button size=\"sm\">Small</au-button>\n  <au-button>Medium</au-button>\n</au-example>"
        ],
        "tips": [
            "Internal component used in the demo site"
        ]
    },
    "au-fetch": {
        "name": "au-fetch",
        "description": "Declarative data fetching component — load remote data with just HTML attributes",
        "props": {
            "url": {
                "type": "string",
                "description": "URL to fetch data from"
            },
            "method": {
                "type": "string",
                "values": [
                    "GET",
                    "POST",
                    "PUT",
                    "DELETE"
                ],
                "default": "GET",
                "description": "HTTP method for the request"
            },
            "auto": {
                "type": "boolean",
                "default": false,
                "description": "Auto-fetch on connect"
            },
            "interval": {
                "type": "number",
                "description": "Polling interval in ms"
            }
        },
        "events": {
            "au-data": { "detail": { "data": "any" } },
            "au-loading": { "detail": {} },
            "au-success": { "detail": { "data": "any" } },
            "au-error": { "detail": { "error": "Error" } }
        },
        "examples": [
            "<au-fetch url=\"/api/users\" auto></au-fetch>",
            "document.querySelector('au-fetch').addEventListener('au-success', e => console.log(e.detail.data))"
        ],
        "tips": [
            "Use auto attribute to fetch immediately on page load",
            "Set interval for periodic polling"
        ]
    },
    "au-form": {
        "name": "au-form",
        "description": "Form container with validation and data collection. Use getValues() to read all field data at once.",
        "props": {
            "action": {
                "type": "string",
                "description": "Form action URL (optional)"
            },
            "method": {
                "type": "string",
                "description": "Form method (optional)"
            }
        },
        "methods": [
            "getValues()",
            "getFormData()",
            "validate()",
            "reset()"
        ],
        "events": {
            "au-submit": { "detail": { "data": "object", "isValid": "boolean" } },
            "au-invalid": { "detail": { "data": "object", "errors": "object" } },
            "au-reset": { "detail": {} }
        },
        "examples": [
            "<au-form>\n  <au-input name=\"email\" label=\"Email\" required></au-input>\n  <au-button type=\"submit\" variant=\"filled\">Send</au-button>\n</au-form>",
            "document.querySelector('au-form').getValues() // {email: 'user@example.com'}"
        ],
        "tips": [
            "Use getValues() to collect all named field values as an object",
            "Listen for au-submit event to handle validated form data",
            "Add debug attribute to enable agent validation warnings"
        ]
    },
    "au-grid": {
        "name": "au-grid",
        "description": "CSS Grid layout container with responsive column support",
        "props": {
            "cols": {
                "type": "string",
                "default": "1",
                "description": "Number of columns or responsive pattern"
            },
            "rows": {
                "type": "string",
                "description": "Grid rows definition"
            },
            "gap": {
                "type": "string",
                "values": [
                    "none",
                    "xs",
                    "sm",
                    "md",
                    "lg",
                    "xl"
                ],
                "default": "md",
                "description": "Gap between grid cells using standard spacing tokens"
            },
            "align": {
                "type": "string",
                "description": "Align items"
            }
        },
        "events": [],
        "examples": [
            "<au-grid cols=\"3\" gap=\"md\">\n  <au-card>A</au-card>\n  <au-card>B</au-card>\n  <au-card>C</au-card>\n</au-grid>"
        ],
        "tips": [
            "Use cols=\"auto-fit\" for responsive grid that wraps automatically"
        ]
    },
    "au-icon": {
        "name": "au-icon",
        "description": "Material Design icon component supporting Material Symbols, SVG, and emoji",
        "props": {
            "name": {
                "type": "string",
                "description": "Material Symbols icon name"
            },
            "size": {
                "type": "string",
                "values": [
                    "xs",
                    "sm",
                    "md",
                    "lg",
                    "xl"
                ],
                "default": "24",
                "description": "Icon size — accepts named tokens (xs=16, sm=20, md=24, lg=32, xl=40) or raw pixel values"
            },
            "svg": {
                "type": "string",
                "description": "Inline SVG markup"
            },
            "filled": {
                "type": "boolean",
                "default": false,
                "description": "Uses filled variant of Material Symbols icon"
            },
            "font": {
                "type": "boolean",
                "default": false,
                "description": "Forces Google Fonts rendering instead of bundled SVG. Use for icons not in the bundled set."
            }
        },
        "events": [],
        "bundledIcons": [
            "check", "close", "add", "remove", "edit", "delete", "search", "menu",
            "chevron_right", "chevron_left", "expand_more", "expand_less",
            "home", "arrow_back", "arrow_forward",
            "info", "warning", "error", "check_circle", "cancel", "success",
            "settings", "person", "light_mode", "dark_mode",
            "visibility", "visibility_off",
            "download", "smart_button", "text_fields", "check_box",
            "toggle_on", "radio_button_checked", "arrow_drop_down_circle",
            "view_carousel", "grid_view", "tab", "notifications", "open_in_new",
            "hourglass_empty", "account_circle", "fiber_manual_record", "label",
            "emoji_emotions", "business", "input", "category", "widgets",
            "smart_toy", "notification_important",
            "folder_managed", "shield", "apps", "monitoring"
        ],
        "examples": [
            "<au-icon name=\"home\"></au-icon>",
            "<au-icon name=\"favorite\" filled size=\"lg\"></au-icon>",
            "<au-icon>🎉</au-icon>"
        ],
        "tips": [
            "~60 common icons are bundled as SVG (zero network dependency)",
            "Any other Material Symbols name auto-loads Google Fonts on first use",
            "For emoji, just place it as text content: <au-icon>🚀</au-icon>",
            "Use describe().bundledIcons to see which icons work offline"
        ]
    },
    "au-if": {
        "name": "au-if",
        "description": "Structural conditional directive — renders children only when condition is true. Children are truly removed from the DOM (not just hidden) and restored as the same nodes on toggle.",
        "props": {
            "condition": {
                "type": "boolean",
                "default": false,
                "description": "When present, children are rendered. When absent, children are removed from DOM."
            },
            "else": {
                "type": "string",
                "description": "ID of a <template> element to render when condition is false"
            }
        },
        "events": {
            "au-show": { "detail": {} },
            "au-hide": { "detail": {} }
        },
        "examples": [
            "<au-if condition>\n  <p>This is visible</p>\n</au-if>",
            "<au-if id=\"auth\" else=\"login-tpl\">\n  <p>Welcome back!</p>\n</au-if>\n<template id=\"login-tpl\">\n  <au-button>Login</au-button>\n</template>"
        ],
        "tips": [
            "Children are truly removed from DOM when false — not just hidden",
            "Use .condition property for JS control: el.condition = isLoggedIn",
            "Original DOM nodes are preserved (not recreated) on toggle — event listeners survive",
            "For show/hide without DOM removal, use CSS hidden attribute instead"
        ]
    },
    "au-input": {
        "name": "au-input",
        "description": "Material Design 3 text field with floating label",
        "props": {
            "label": {
                "type": "string",
                "description": "Floating label text"
            },
            "type": {
                "type": "string",
                "values": [
                    "text",
                    "email",
                    "password",
                    "number",
                    "tel",
                    "url"
                ],
                "default": "text",
                "description": "HTML input type, determines keyboard and validation behavior"
            },
            "placeholder": {
                "type": "string",
                "description": "Placeholder hint"
            },
            "value": {
                "type": "string",
                "default": "",
                "description": "Current input value. Use .value property for programmatic access."
            },
            "variant": {
                "type": "string",
                "values": [
                    "outlined",
                    "filled"
                ],
                "default": "outlined",
                "description": "Visual style. outlined=border only, filled=background color."
            },
            "size": {
                "type": "string",
                "values": [
                    "sm",
                    "md",
                    "lg"
                ],
                "default": "md",
                "description": "Input field height (sm=32px, md=40px, lg=48px)"
            },
            "disabled": {
                "type": "boolean",
                "default": false,
                "description": "Disables the input and prevents user interaction"
            }
        },
        "events": {
            "au-input": { "detail": { "value": "string" } },
            "au-focus": { "detail": {} },
            "au-blur": { "detail": {} }
        },
        "methods": ["clear()", "focus()"],
        "examples": [
            "<au-input label=\"Email\" type=\"email\"></au-input>",
            "<au-input label=\"Password\" type=\"password\"></au-input>"
        ],
        "tips": [
            "Use .value property to get/set current value",
            "Use .clear() to reset input (e.g. after adding a todo)",
            "Listen to au-input for keystroke-level changes, au-change for committed value",
            "Always provide label for accessibility"
        ],
        "composition": {
            "au-modal": {
                "works": true,
                "gotchas": [
                    "Event listeners on inputs inside au-modal are LOST — use event delegation on au-modal",
                    "Read values via modal.querySelector('#my-input').value after the modal is open"
                ]
            }
        }
    },
    "au-layout": {
        "name": "au-layout",
        "description": "App shell layout container that orchestrates drawer, navbar, and main content areas",
        "props": {
            "has-drawer": {
                "type": "boolean",
                "default": false,
                "description": "Auto-detected when <au-drawer> is slotted. Adjusts layout to accommodate sidebar navigation."
            },
            "has-bottom-nav": {
                "type": "boolean",
                "default": false,
                "description": "Auto-detected when <au-bottom-nav> is slotted. Adds padding-bottom compensation to prevent content being hidden behind the nav bar."
            },
            "full-bleed": {
                "type": "boolean",
                "default": false,
                "description": "Removes all content padding for edge-to-edge layouts. Bottom-nav padding compensation is automatically preserved when has-bottom-nav is active."
            }
        },
        "events": [],
        "examples": [
            "<au-layout>\n  <au-drawer slot=\"drawer\">...</au-drawer>\n  <au-navbar slot=\"header\">...</au-navbar>\n  <main>Content</main>\n</au-layout>",
            "<au-layout full-bleed><!-- Kanban, maps, dashboards --></au-layout>"
        ],
        "tips": [
            "Use as the root layout for apps with sidebar navigation",
            "Content area has padding: 16px (8px on mobile). Use full-bleed attribute to remove all padding (kanban, maps). Bottom-nav compensation is automatic.",
            "CAUTION: NEVER override padding on .au-layout-content with !important or the padding shorthand — it defeats bottom-nav compensation. Use the full-bleed attribute instead."
        ]
    },
    "au-lazy": {
        "name": "au-lazy",
        "description": "Lazy-loading wrapper that renders children only when visible in viewport",
        "props": {
            "root-margin": {
                "type": "string",
                "default": "200px",
                "description": "Intersection Observer root margin"
            },
            "threshold": {
                "type": "number",
                "default": 0,
                "description": "Visibility threshold (0-1)"
            }
        },
        "events": {
            "au-loaded": { "detail": {} }
        },
        "examples": [
            "<au-lazy>\n  <img src=\"large-image.jpg\" alt=\"Lazy loaded\">\n</au-lazy>"
        ],
        "tips": [
            "Use for below-the-fold content to improve initial load time"
        ]
    },
    "au-modal": {
        "name": "au-modal",
        "description": "Material Design 3 dialog using native <dialog>",
        "props": {
            "open": {
                "type": "boolean",
                "default": false,
                "description": "Whether the modal dialog is visible"
            },
            "size": {
                "type": "string",
                "values": [
                    "sm",
                    "md",
                    "lg",
                    "full"
                ],
                "default": "md",
                "description": "Dialog width (sm=360px, md=480px, lg=640px, full=viewport)"
            }
        },
        "events": {
            "au-open": { "detail": {} },
            "au-close": { "detail": {} }
        },
        "examples": [
            "<au-modal id=\"dialog\"><h2>Title</h2><p>Content</p></au-modal>",
            "<au-button onclick=\"document.getElementById('dialog').open()\">Open</au-button>"
        ],
        "tips": [
            "Use .open() and .close() methods",
            "ESC and backdrop click auto-close",
            "Place action buttons directly inside <au-modal>, not in a slot. Slots are not supported.",
            "WARNING: au-modal copies innerHTML into a native <dialog>. Event listeners on child elements are LOST. Use event delegation: modal.addEventListener('click', e => { if (e.target.closest('#save')) ... })"
        ]
    },
    "au-navbar": {
        "name": "au-navbar",
        "description": "Top app bar with brand, navigation links, and action items",
        "props": {
            "sticky": {
                "type": "boolean",
                "default": false,
                "description": "Sticks the navbar to the top of the viewport on scroll"
            },
            "variant": {
                "type": "string",
                "values": [
                    "standard",
                    "dense"
                ],
                "default": "standard",
                "description": "Visual density. dense reduces height for compact layouts."
            }
        },
        "events": [],
        "examples": [
            "<au-navbar sticky>\n  <au-navbar-brand>My App</au-navbar-brand>\n  <au-navbar-links>\n    <a href=\"#home\">Home</a>\n  </au-navbar-links>\n  <au-navbar-actions>\n    <au-button variant=\"text\">Login</au-button>\n  </au-navbar-actions>\n</au-navbar>"
        ],
        "tips": [
            "Use sticky for fixed top navigation that scrolls with the page"
        ]
    },
    "au-page": {
        "name": "au-page",
        "description": "Route-specific page container used inside au-router",
        "props": {
            "route": {
                "type": "string",
                "description": "Route hash this page responds to"
            },
            "title": {
                "type": "string",
                "description": "Page title for navigation"
            }
        },
        "events": [],
        "examples": [
            "<au-page route=\"settings\" title=\"Settings\">\n  <h1>Settings Page</h1>\n</au-page>"
        ],
        "tips": [
            "Content can be inline or loaded dynamically by au-router"
        ]
    },
    "au-progress": {
        "name": "au-progress",
        "description": "Material Design 3 linear progress bar",
        "props": {
            "value": {
                "type": "number",
                "description": "Current value (0-max or omit for indeterminate)"
            },
            "max": {
                "type": "number",
                "default": 100,
                "description": "Maximum value for the progress bar"
            },
            "variant": {
                "type": "string",
                "values": [
                    "primary",
                    "secondary"
                ],
                "default": "primary",
                "description": "Color variant using MD3 system colors"
            },
            "indeterminate": {
                "type": "boolean",
                "default": false,
                "description": "When present, shows infinite animation (Material Web two-bar style)"
            }
        },
        "events": [],
        "examples": [
            "<au-progress value=\"50\" max=\"100\"></au-progress>",
            "<au-progress indeterminate></au-progress>"
        ],
        "tips": [
            "Omit value for indeterminate animation",
            "MUST add aria-label for accessibility, e.g. <au-progress aria-label=\"Task completion\" value=\"50\"></au-progress>"
        ]
    },
    "au-prompt-ui": {
        "name": "au-prompt-ui",
        "description": "AI chat prompt input with send button — for building agent UIs",
        "props": {
            "placeholder": {
                "type": "string",
                "default": "Type a message...",
                "description": "Placeholder text for the input field"
            },
            "loading": {
                "type": "boolean",
                "default": false,
                "description": "Shows loading state on the send button"
            },
            "disabled": {
                "type": "boolean",
                "default": false,
                "description": "Disables the input and send button"
            },
            "multiline": {
                "type": "boolean",
                "default": false,
                "description": "Enables multiline input (textarea mode)"
            }
        },
        "events": [],
        "examples": [
            "<au-prompt-input></au-prompt-input>"
        ],
        "tips": [
            "Part of the Agent UI toolkit for building chat interfaces"
        ]
    },
    "au-radio": {
        "name": "au-radio",
        "description": "Radio button group container",
        "props": {
            "name": {
                "type": "string",
                "description": "Form field name"
            },
            "value": {
                "type": "string",
                "description": "Selected radio value"
            }
        },
        "events": {
            "au-change": { "detail": { "value": "string" } }
        },
        "examples": [
            "<au-radio-group name=\"size\" value=\"md\"><au-radio value=\"sm\">Small</au-radio><au-radio value=\"md\">Medium</au-radio></au-radio-group>"
        ],
        "tips": [
            "Wrap au-radio items in au-radio-group",
            "Use .value property to get/set selection"
        ]
    },
    "au-repeat": {
        "name": "au-repeat",
        "description": "Template repeater that renders child template for each item in a data array",
        "props": {},
        "methods": [
            "setItems(array)"
        ],
        "events": [],
        "examples": [
            "const repeat = document.querySelector('au-repeat');\nrepeat.setItems([{name: 'Alice'}, {name: 'Bob'}]);"
        ],
        "tips": [
            "For large lists (1000+ items), use au-virtual-list instead"
        ]
    },
    "au-router": {
        "name": "au-router",
        "description": "Hash-based client-side router that loads page content dynamically",
        "props": {
            "base": {
                "type": "string",
                "description": "Base path for content loading"
            },
            "default": {
                "type": "string",
                "description": "Default route to load"
            }
        },
        "events": {
            "au-route-change": { "detail": { "route": "string" } },
            "au-page-loaded": { "detail": { "route": "string" } },
            "au-page-error": { "detail": { "route": "string", "error": "Error" } }
        },
        "examples": [
            "<au-router base=\"content/\" default=\"home\">\n  <au-page route=\"home\" title=\"Home\"></au-page>\n  <au-page route=\"about\" title=\"About\"></au-page>\n</au-router>"
        ],
        "tips": [
            "Routes are based on URL hash: #home, #about, etc.",
            "Pages are loaded lazily from the base path"
        ]
    },
    "au-schema-form": {
        "name": "au-schema-form",
        "description": "AI-First auto-generated form from JSON Schema. Pass a schema object and get a complete form with validation.",
        "props": {
            "submit-label": {
                "type": "string",
                "default": "Submit",
                "description": "Text for the submit button"
            },
            "reset-label": {
                "type": "string",
                "default": "Reset",
                "description": "Text for the reset button"
            },
            "inline": {
                "type": "boolean",
                "default": false,
                "description": "Renders form fields in a horizontal row instead of vertical stack"
            },
            "readonly": {
                "type": "boolean",
                "default": false,
                "description": "Makes all fields read-only (visible but not editable)"
            },
            "disabled": {
                "type": "boolean",
                "default": false,
                "description": "Disables all fields and the submit button"
            }
        },
        "methods": [
            "getValues()",
            "setValues(obj)",
            "validate()",
            "getErrors()",
            "reset()",
            "submit()"
        ],
        "events": {
            "au-submit": { "detail": "object", "description": "Detail IS the form values object directly, e.g. { name: 'foo', email: 'bar' }" },
            "au-change": { "detail": { "field": "string", "value": "any", "values": "object" } },
            "au-reset": { "detail": { "values": "object" } }
        },
        "examples": [
            "const form = document.querySelector('au-schema-form');\nform.schema = {\n  type: 'object',\n  properties: {\n    name: { type: 'string', title: 'Name', minLength: 2 },\n    email: { type: 'string', format: 'email', title: 'Email' },\n    role: { type: 'string', enum: ['user', 'admin'], title: 'Role' }\n  },\n  required: ['name', 'email']\n};"
        ],
        "tips": [
            "THE killer feature for AI agents: generate forms from JSON schema without writing HTML",
            "Set schema property (not attribute) to configure the form",
            "Supports string, number, boolean, enum types with automatic widget selection"
        ]
    },
    "au-sidebar": {
        "name": "au-sidebar",
        "description": "Collapsible sidebar navigation panel",
        "props": {
            "open": {
                "type": "boolean",
                "default": false,
                "description": "Whether the sidebar is expanded. When closed, collapses to 64px icon rail."
            },
            "width": {
                "type": "string",
                "default": "250px",
                "description": "Width of the sidebar when expanded. Accepts any CSS width value."
            }
        },
        "events": {
            "au-sidebar-toggle": { "detail": { "open": "boolean" } },
            "au-sidebar-select": { "detail": { "item": "Element" } }
        },
        "examples": [
            "<au-sidebar open>\n  <au-sidebar-item icon=\"home\" active>Home</au-sidebar-item>\n  <au-sidebar-item icon=\"settings\">Settings</au-sidebar-item>\n</au-sidebar>"
        ],
        "tips": [
            "Use open attribute to control visibility programmatically"
        ]
    },
    "au-skeleton": {
        "name": "au-skeleton",
        "description": "Loading placeholder with shimmer animation",
        "props": {
            "variant": {
                "type": "string",
                "values": [
                    "rect",
                    "text",
                    "circle"
                ],
                "default": "rect",
                "description": "Shape variant (rect=rectangular block, text=line with optional multi-line, circle=round)"
            },
            "width": {
                "type": "string",
                "description": "CSS width (default: 100% for rect/text)"
            },
            "height": {
                "type": "string",
                "description": "CSS height (default: 20px for rect)"
            },
            "size": {
                "type": "string",
                "description": "Width and height for circle variant (default: 40px)"
            },
            "lines": {
                "type": "number",
                "default": 1,
                "description": "Number of text lines (only for variant=text)"
            }
        },
        "events": [],
        "examples": [
            "<au-skeleton variant=\"text\" lines=\"3\"></au-skeleton>",
            "<au-skeleton variant=\"circle\" size=\"48px\"></au-skeleton>",
            "<au-skeleton variant=\"rect\" width=\"100%\" height=\"200px\"></au-skeleton>"
        ],
        "tips": [
            "Use to indicate loading states while fetching async data",
            "For avatar placeholders, use variant=circle with a matching size"
        ]
    },
    "au-spinner": {
        "name": "au-spinner",
        "description": "Material Design 3 circular loading indicator",
        "props": {
            "size": {
                "type": "string",
                "values": [
                    "sm",
                    "md",
                    "lg"
                ],
                "default": "md",
                "description": "Spinner diameter (sm=16px, md=24px, lg=48px)"
            },
            "color": {
                "type": "string",
                "default": "primary",
                "description": "Color using MD3 system color tokens (primary, secondary, error, etc.)"
            }
        },
        "events": [],
        "examples": [
            "<au-spinner></au-spinner>",
            "<au-spinner size=\"lg\" color=\"secondary\"></au-spinner>"
        ],
        "tips": [
            "Use inside buttons or cards during loading"
        ]
    },
    "au-splash": {
        "name": "au-splash",
        "description": "Full-screen loading splash screen shown during app initialization",
        "props": {
            "logo": {
                "type": "string",
                "description": "URL of the logo image to display during loading"
            },
            "duration": {
                "type": "number",
                "default": 2000,
                "description": "Duration in ms before auto-hiding the splash screen"
            },
            "delay": {
                "type": "number",
                "default": 0,
                "description": "Delay in ms before starting the splash animation"
            },
            "spinner": {
                "type": "boolean",
                "default": false,
                "description": "Shows a loading spinner below the logo"
            }
        },
        "events": [],
        "examples": [
            "<au-splash>\n  <img src=\"logo.svg\" alt=\"Loading...\">\n</au-splash>"
        ],
        "tips": [
            "Automatically hides when all components are loaded"
        ]
    },
    "au-stack": {
        "name": "au-stack",
        "description": "Flexbox layout component for horizontal/vertical stacking with gap control",
        "props": {
            "direction": {
                "type": "string",
                "values": [
                    "row",
                    "column"
                ],
                "default": "column",
                "description": "Stack direction. row=horizontal, column=vertical."
            },
            "gap": {
                "type": "string",
                "values": [
                    "none",
                    "xs",
                    "sm",
                    "md",
                    "lg",
                    "xl"
                ],
                "default": "md",
                "description": "Spacing between stacked items using standard tokens"
            },
            "align": {
                "type": "string",
                "values": [
                    "start",
                    "center",
                    "end",
                    "stretch"
                ],
                "description": "Cross-axis alignment (align-items). Default: stretch."
            },
            "justify": {
                "type": "string",
                "values": [
                    "start",
                    "center",
                    "end",
                    "between",
                    "around",
                    "evenly",
                    "space-between",
                    "space-around",
                    "space-evenly"
                ],
                "description": "Main-axis distribution (justify-content). Accepts shortcuts (between, around, evenly) or raw CSS values. Default: flex-start."
            },
            "wrap": {
                "type": "boolean",
                "default": false,
                "description": "Enables wrapping for column direction (row wraps by default)"
            },
            "nowrap": {
                "type": "boolean",
                "default": false,
                "description": "Disables wrapping for row direction (column is nowrap by default)"
            }
        },
        "events": [],
        "examples": [
            "<au-stack direction=\"row\" gap=\"md\" align=\"center\">\n  <au-button>A</au-button>\n  <au-button>B</au-button>\n</au-stack>"
        ],
        "tips": [
            "The most common layout primitive — use for any flex arrangement"
        ]
    },
    "au-switch": {
        "name": "au-switch",
        "description": "Material Design 3 toggle switch",
        "props": {
            "checked": {
                "type": "boolean",
                "default": false,
                "description": "Whether the switch is toggled on"
            },
            "disabled": {
                "type": "boolean",
                "default": false,
                "description": "Disables the switch and prevents toggling"
            },
            "label": {
                "type": "string",
                "description": "Switch label text"
            }
        },
        "events": {
            "au-change": { "detail": { "checked": "boolean" } }
        },
        "examples": [
            "<au-switch label=\"Dark mode\"></au-switch>",
            "<au-switch checked>Notifications</au-switch>"
        ],
        "tips": [
            "Use .checked property to get/set state",
            "Listen to au-change for toggle events"
        ]
    },
    "au-table": {
        "name": "au-table",
        "description": "Static HTML table with MD3 styling, striping, and hover effects",
        "props": {
            "striped": {
                "type": "boolean",
                "default": false,
                "description": "Alternates row background colors for readability"
            },
            "hover": {
                "type": "boolean",
                "default": false,
                "description": "Highlights rows on mouse hover"
            }
        },
        "events": [],
        "examples": [
            "<au-table striped hover>\n  <au-thead><au-tr><au-th>Name</au-th><au-th>Email</au-th></au-tr></au-thead>\n  <au-tbody><au-tr><au-td>John</au-td><au-td>john@mail.com</au-td></au-tr></au-tbody>\n</au-table>"
        ],
        "tips": [
            "For dynamic data with sorting/filtering, use au-datatable instead"
        ]
    },
    "au-tabs": {
        "name": "au-tabs",
        "description": "MD3 tab navigation with sliding indicator animation",
        "props": {
            "active": {
                "type": "string",
                "default": "0",
                "description": "Index of the active tab"
            }
        },
        "events": {
            "au-tab-change": { "detail": { "index": "number" } }
        },
        "examples": [
            "<au-tabs active=\"0\">\n  <au-tab>Overview</au-tab>\n  <au-tab>Details</au-tab>\n  <au-tab>Settings</au-tab>\n</au-tabs>"
        ],
        "tips": [
            "Set active attribute to switch tabs programmatically",
            "Listen for au-tab-change to update content panels"
        ]
    },
    "au-textarea": {
        "name": "au-textarea",
        "description": "Multi-line text input with Material Design 3 styling",
        "props": {
            "placeholder": {
                "type": "string",
                "description": "Placeholder text"
            },
            "rows": {
                "type": "number",
                "default": 4,
                "description": "Number of visible text lines (textarea height)"
            },
            "disabled": {
                "type": "boolean",
                "default": false,
                "description": "Disables the textarea and prevents editing"
            },
            "readonly": {
                "type": "boolean",
                "default": false,
                "description": "Makes the textarea read-only (visible but not editable)"
            },
            "name": {
                "type": "string",
                "description": "Form field name"
            }
        },
        "events": {
            "au-input": { "detail": { "value": "string" } },
            "au-change": { "detail": { "value": "string" } }
        },
        "examples": [
            "<au-textarea placeholder=\"Enter description\"></au-textarea>",
            "<au-textarea rows=\"6\" name=\"bio\"></au-textarea>"
        ],
        "tips": [
            "Use .value property to get/set content",
            "au-input fires on keystroke, au-change on blur"
        ]
    },
    "au-theme-toggle": {
        "name": "au-theme-toggle",
        "description": "Dark/light mode toggle button with sun/moon icon",
        "props": {},
        "events": [],
        "examples": [
            "<au-theme-toggle></au-theme-toggle>"
        ],
        "tips": [
            "Place in navbar for global theme switching",
            "Uses AgentUI.Theme.set() internally"
        ]
    },
    "au-toast": {
        "name": "au-toast",
        "description": "Material Design 3 snackbar/toast notification",
        "props": {
            "severity": {
                "type": "string",
                "values": [
                    "info",
                    "success",
                    "warning",
                    "error"
                ],
                "default": "info",
                "description": "Visual severity level, controls color and icon"
            },
            "duration": {
                "type": "number",
                "default": 3000,
                "description": "Auto-dismiss ms (0=never)"
            },
            "position": {
                "type": "string",
                "values": [
                    "top-left",
                    "top-center",
                    "top-right",
                    "bottom-left",
                    "bottom-center",
                    "bottom-right"
                ],
                "default": "bottom-center",
                "description": "Screen position for the toast notification"
            }
        },
        "events": {
            "au-dismiss": { "detail": {} }
        },
        "examples": [
            "<au-toast severity=\"success\">Saved!</au-toast>",
            "<au-toast duration=\"5000\" position=\"top-right\">Info</au-toast>"
        ],
        "tips": [
            "Use duration=\"0\" to prevent auto-dismiss",
            "Call .dismiss() to close programmatically"
        ]
    },
    "au-tooltip": {
        "name": "au-tooltip",
        "description": "Tooltip overlay that appears on hover/focus of parent element",
        "props": {
            "content": {
                "type": "string",
                "description": "Tooltip text content"
            },
            "position": {
                "type": "string",
                "values": [
                    "top",
                    "bottom",
                    "left",
                    "right"
                ],
                "default": "top",
                "description": "Tooltip placement relative to the parent element"
            }
        },
        "events": [],
        "examples": [
            "<au-tooltip content=\"Click to save\" position=\"bottom\">\n  <au-button variant=\"filled\">Save</au-button>\n</au-tooltip>"
        ],
        "tips": [
            "Wrap the target element inside au-tooltip"
        ]
    },
    "au-virtual-list": {
        "name": "au-virtual-list",
        "description": "Virtualized list for rendering thousands of items efficiently — only visible items are in the DOM",
        "props": {
            "item-height": {
                "type": "number",
                "default": 50,
                "description": "Fixed height of each item in pixels"
            },
            "buffer": {
                "type": "number",
                "default": 5,
                "description": "Extra items rendered above/below viewport"
            }
        },
        "methods": [
            "setItems(array)",
            "setRenderFn(fn)"
        ],
        "events": [],
        "examples": [
            "const list = document.querySelector('au-virtual-list');\nlist.setItems(Array.from({length: 10000}, (_, i) => ({id: i, text: 'Item ' + i})));\nlist.setRenderFn(item => '<div>' + item.text + '</div>');"
        ],
        "tips": [
            "Essential for large datasets — renders only visible items",
            "Set item-height to match your actual row height for accurate scrolling"
        ]
    },
    "au-option": {
        "name": "au-option",
        "description": "Option item for au-dropdown — place inside au-dropdown to define selectable options",
        "props": {
            "value": {
                "type": "string",
                "description": "The value submitted when this option is selected"
            },
            "disabled": {
                "type": "boolean",
                "default": false,
                "description": "Prevents selection of this option"
            }
        },
        "events": [],
        "examples": [
            "<au-dropdown placeholder=\"Pick a color\">\n  <au-option value=\"red\">Red</au-option>\n  <au-option value=\"blue\">Blue</au-option>\n  <au-option value=\"green\" disabled>Green (unavailable)</au-option>\n</au-dropdown>"
        ],
        "tips": [
            "Text content of au-option is used as the display label",
            "The value attribute is what gets emitted in the au-select event detail"
        ]
    },
    "au-tab": {
        "name": "au-tab",
        "description": "Individual tab item — place inside au-tabs to define tab labels",
        "props": {},
        "events": [],
        "examples": [
            "<au-tabs>\n  <au-tab>Overview</au-tab>\n  <au-tab>Details</au-tab>\n  <au-tab>Settings</au-tab>\n</au-tabs>",
            "<au-tabs active=\"1\">\n  <au-tab>Tab A</au-tab>\n  <au-tab>Tab B (active)</au-tab>\n</au-tabs>"
        ],
        "tips": [
            "Tab content is simple text — place it as the text content of au-tab",
            "Set the active tab via the 'active' attribute on the parent au-tabs (0-indexed)",
            "au-tabs manages active state and indicator animation automatically on click"
        ]
    },
    "au-radio-group": {
        "name": "au-radio-group",
        "description": "Container for au-radio elements — manages selection state and emits change events",
        "props": {
            "name": {
                "type": "string",
                "description": "Form field name for the radio group"
            },
            "value": {
                "type": "string",
                "description": "Currently selected radio value"
            }
        },
        "events": {
            "au-change": { "detail": { "value": "string", "source": "string" } }
        },
        "examples": [
            "<au-radio-group name=\"size\" value=\"md\">\n  <au-radio value=\"sm\">Small</au-radio>\n  <au-radio value=\"md\">Medium</au-radio>\n  <au-radio value=\"lg\">Large</au-radio>\n</au-radio-group>"
        ],
        "tips": [
            "Wrap au-radio elements in au-radio-group for proper selection management",
            "The value attribute on au-radio-group sets the initially selected radio"
        ]
    },
    "au-sidebar-item": {
        "name": "au-sidebar-item",
        "description": "Navigation item for au-sidebar — displays icon and label, collapses to icon-only in rail mode",
        "props": {
            "icon": {
                "type": "string",
                "description": "Material Symbols icon name displayed beside the label"
            },
            "active": {
                "type": "boolean",
                "default": false,
                "description": "Highlights this item as the currently active navigation item"
            }
        },
        "events": {
            "au-sidebar-select": { "detail": { "item": "Element" } }
        },
        "examples": [
            "<au-sidebar>\n  <au-sidebar-item icon=\"home\" active>Dashboard</au-sidebar-item>\n  <au-sidebar-item icon=\"settings\">Settings</au-sidebar-item>\n  <au-sidebar-item icon=\"person\">Profile</au-sidebar-item>\n</au-sidebar>"
        ],
        "tips": [
            "Text content is used as the label — hidden when sidebar is in rail/collapsed mode",
            "Listen for au-sidebar-select on the parent au-sidebar for navigation"
        ]
    },
    "au-toast-container": {
        "name": "au-toast-container",
        "description": "Global container for toast notifications — add once to your page, toasts are appended here automatically",
        "props": {
            "position": {
                "type": "string",
                "values": [
                    "top-right",
                    "top-left",
                    "bottom-right",
                    "bottom-left",
                    "top-center",
                    "bottom-center"
                ],
                "default": "bottom-center",
                "description": "Screen position where toasts appear. Default matches Toast.show() default."
            }
        },
        "events": [],
        "examples": [
            "<au-toast-container position=\"bottom-center\"></au-toast-container>\n\n<!-- Show a toast programmatically (recommended) -->\n<script>\n  import { Toast } from 'agentui-wc';\n  Toast.show('Saved!', { severity: 'success' });\n</script>"
        ],
        "tips": [
            "Only one au-toast-container is needed per page",
            "Toasts auto-dismiss after their duration expires"
        ]
    }
};

