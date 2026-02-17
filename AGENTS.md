# AgentUI - AI Agent Documentation

> **FOR AI AGENTS: This document is for UNDERSTANDING AgentUI — installation, discovery, events, and gotchas.**
> For practical build recipes and templates, see [SKILL.md](./SKILL.md).
> To develop new components or extend the framework, see [AGENTS_DEV.md](./AGENTS_DEV.md).

> **AI-friendly web components framework.** 57 components, zero Shadow DOM.

---

## ⚡ TL;DR (Read This First!)

### Installation

**Option 1: npm/bun + Bundler (Vite, Webpack, etc.)**
```bash
npm install agentui-wc
# or
bun add agentui-wc
```
```javascript
// In your main JS file
import 'agentui-wc';  // Auto-registers all components

// CSS - choose ONE method:
import 'agentui-wc/css';  // Vite/Webpack with CSS loader
// OR add to HTML: <link rel="stylesheet" href="./node_modules/agentui-wc/dist/agentui.css">
```

**Option 2: CDN (Zero Build - Works Immediately)**
```html
<!-- Preload CSS + async JS for best performance -->
<link rel="preload" as="style" href="https://unpkg.com/agentui-wc@latest/dist/agentui.css">
<link rel="stylesheet" href="https://unpkg.com/agentui-wc@latest/dist/agentui.css"
      media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="https://unpkg.com/agentui-wc@latest/dist/agentui.css"></noscript>
<script type="module" src="https://unpkg.com/agentui-wc@latest/dist/agentui.esm.js" async></script>
<!-- Font: MD3 default -->
<style>
  @font-face { font-family: 'Roboto'; font-display: swap; src: url('https://fonts.gstatic.com/s/roboto/v47/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWubEbVmUiA8.woff2') format('woff2'); }
  body { font-family: var(--md-sys-typescale-font); margin: 0; }
</style>
```

### Minimal Working Example
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="AgentUI Demo — AI-First Web Components">
  <title>AgentUI Demo</title>
  <link rel="preload" as="style" href="https://unpkg.com/agentui-wc@latest/dist/agentui.css">
  <link rel="stylesheet" href="https://unpkg.com/agentui-wc@latest/dist/agentui.css"
        media="print" onload="this.media='all'">
  <noscript><link rel="stylesheet" href="https://unpkg.com/agentui-wc@latest/dist/agentui.css"></noscript>
  <script type="module" src="https://unpkg.com/agentui-wc@latest/dist/agentui.esm.js" async></script>
  <style>
    @font-face { font-family: 'Roboto'; font-display: swap; src: url('https://fonts.gstatic.com/s/roboto/v47/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWubEbVmUiA8.woff2') format('woff2'); }
    body { font-family: var(--md-sys-typescale-font); margin: 0; }
  </style>
</head>
<body>
  <au-card title="Hello AgentUI">
    <au-input label="Your name" placeholder="Enter name"></au-input>
    <au-button variant="filled">Submit</au-button>
  </au-card>
</body>
</html>
```

### Top 5 Components
```html
<au-button variant="filled">Save</au-button>
<au-input placeholder="Email" name="email"></au-input>
<au-card title="Title">Content</au-card>
<au-modal title="Dialog" open>Content</au-modal>
<au-alert severity="success">Done!</au-alert>
```

### Key CSS Variables
```css
--md-sys-color-primary: #6750A4;
--md-sys-color-surface: #FFFBFE;
--md-sys-color-on-primary: #FFFFFF;
--md-sys-color-error: #B3261E;
```

### Events Convention
- `au-input` - Input value changed
- `au-change` - Selection changed (dropdown, radio)
- `au-close` - Modal/drawer closed
- `au-submit` - Form submitted

### ⚠️ MANDATORY: Component Discovery Before Use

> **NEVER assume standard HTML events (click, input, change) on au-* components.**
> AgentUI components emit their own custom events (e.g., `au-input`, `au-change`, `au-close`).

**Before using ANY au-* component, you MUST call `.describe()` and read the output:**

```javascript
// MANDATORY before using a component:
const schema = customElements.get('au-button').describe();
console.log(schema);
// → { name, description, props, events, methods, examples, tips }

// Or discover ALL components at once:
const allAPIs = AgentUI.discoverAll();
```

**Checklist for every component you use:**
1. ✅ Call `.describe()` or check `AgentUI.discoverAll()` output
2. ✅ Read the `events` array — use ONLY these events, not standard HTML events
3. ✅ Read the `props` object — use ONLY declared attributes
4. ✅ Read `tips` — contains critical usage warnings

### 🤖 Runtime Discovery for AI Agents (RECOMMENDED)
```javascript
// Get ALL component APIs in one call:
const allAPIs = AgentUI.discoverAll();
console.log(allAPIs);
// Returns: { 'au-button': { props: {...}, events: [...] }, 'au-input': {...}, ... }

// Get single component info:
customElements.get('au-button').describe();
// Returns: { name: 'au-button', props: { variant: {...} }, events: ['click'], examples: [...] }
```

---

## 📑 Index

| Section | Description |
|---------|-------------|
| [⚠️ Common Gotchas](#️-common-gotchas-for-ai-agents) | Top 10 mistakes and instant fixes |
| [📋 TL;DR Templates](#tldr---copy-paste-templates) | Agent API, Enterprise features |
| [🔥 Schema Form Showcase](./SKILL.md#-schema-form-showcase) | Auto-generate entire forms from JSON Schema (in SKILL.md) |
| [🤖 Agent Patterns](./SKILL.md#-ready-to-use-agent-patterns) | Form data, input values, theme control (in SKILL.md) |
| [🏗️ PWA App Shell](./SKILL.md#️-pwa-app-shell-components-built-in) | Templates: dashboard, e-commerce, admin (in SKILL.md) |
| [🚀 Modern App Shell](./SKILL.md#-modern-app-shell-pattern-recommended) | Lazy loading, 100/100 Lighthouse (in SKILL.md) |
| [📦 Component Quick Reference](./AGENTS_REFERENCE.md#quick-reference) | Component attributes table (in AGENTS_REFERENCE.md) |
| [🏢 Architecture](./AGENTS_REFERENCE.md#architecture-for-large-apps-10-pages) | State management, routing, code splitting (in AGENTS_REFERENCE.md) |

> **Need to extend the framework with new components?** See [AGENTS_DEV.md](./AGENTS_DEV.md) for development guidelines, mandatory patterns, and testing procedures.

---

## ⚠️ Common Gotchas for AI Agents

> **The most common mistakes AI agents make with AgentUI.** Quick lookup table.

| # | ❌ What You Wrote | ✅ What You Should Write | Why |
|---|---|---|---|
| 1 | `<au-button>Click</au-button>` | `<au-button variant="filled">Click</au-button>` | Always specify `variant` for explicit MD3 styling (default: `primary`) |
| 2 | `<au-input placeholder="Email">` | `<au-input label="Email">` | `label` is required for accessibility (WCAG) |
| 3 | `<div style="display:flex; gap:16px">` | `<au-stack direction="row" gap="md">` | Always use layout components for spacing |
| 4 | `element.addEventListener('change', ...)` | `element.addEventListener('au-change', ...)` | AgentUI events are prefixed with `au-` |
| 5 | `<au-button type="submit">` | `<au-button variant="filled">` + JS submit | `au-button` uses `variant`, not `type` |
| 6 | `modal.open = true` | `modal.open()` | `au-modal` uses methods, not properties |
| 7 | `import { AuButton } from 'agentui-wc'` | `import 'agentui-wc'` | Components auto-register, use HTML tags directly |
| 8 | `<au-input value="test" />` | `<au-input value="test"></au-input>` | Custom elements require closing tags |
| 9 | `innerHTML = \`<p>${userInput}</p>\`` | `import { html } from 'agentui-wc'; innerHTML = html\`<p>${userInput}</p>\`` | Use `html` tagged template for XSS protection |
| 10 | Manual `<form>` with `<button type="submit">` | Use `<au-form>` or `<au-schema-form>` | AgentUI forms have built-in validation |
| 11 | `align-items: flex-end` with au-input + au-button | `align-items: center` or `<au-stack direction="row" align="center">` | au-input includes floating label — `flex-end` pushes the button below the field |

---

## TL;DR - Copy-Paste Templates

### Agent-First Features 
AgentUI is optimized for AI Agents with deep introspection, runtime feedback, enterprise-scale infrastructure, and 2026 multimodal/MCP-compatible action schema support.

**1. Introspection (Metadata)**
A `custom-elements.json` manifest is included in the root. Agents can read this to understand:
- Component Attributes (names, types, defaults)
- Events and payloads
- CSS Custom Properties (theming)

**2. Runtime Debugging (Agent Logger)**
Components validate usage and log structured errors to `window.__AGENTUI_ERRORS__`.
```javascript
// Check for errors in E2E tests
const errors = await page.evaluate(() => window.__AGENTUI_ERRORS__);
if (errors.length > 0) console.error('AgentUI Errors:', errors);
```

**3. Agent API — LLM-Friendly Component Access**
Direct API for LLM agents to introspect and interact with components:

```javascript
// Get all components as structured data (for agent parsing)
const tree = AgentUI.getAuComponentTree();
// Returns: [{ tag, id, label, description, state, actions, rect, interactive, visible }]

// Get only interactive visible components
const buttons = AgentUI.getAuComponentTree(document.body, {
    visibleOnly: true,
    interactiveOnly: true
});

// Describe a component in natural language
AgentUI.describeComponent('#submit-btn');
// Returns: 'Button "Submit". Click to activate.'

// Find components by label (fuzzy match)
const matches = AgentUI.findByLabel('save');

// Get all registered AgentUI components
const components = AgentUI.getRegisteredComponents();
// Returns: Map<tag, constructor>
```

**4. Error Boundaries — Resilient UI**

Catch errors with fallback UI — one error doesn't crash everything:

```html
<!-- === ERROR BOUNDARIES === -->
<!-- Catch errors with fallback UI - one error doesn't crash everything -->
<au-error-boundary fallback="Something went wrong">
    <au-complex-widget></au-complex-widget>
</au-error-boundary>

<!-- Custom error handling -->
<au-error-boundary onerror="logError(event.detail.error)">
    <au-data-table :items="${data}"></au-data-table>
</au-error-boundary>
```

**5. Agent Automation — 2026 Multimodal & MCP-Compatible Action Schema**

Based on UI-TARS, A2UI, and Anthropic MCP research (2025-2026):

```javascript
// === VISUAL MARKERS (for screenshot-based agents) ===
// Enable overlay labels for multimodal AI agents
AgentUI.enableVisualMarkers({ style: 'badge' }); // or 'outline'

// Agent takes screenshot, sees: [B1] Save, [B2] Cancel, [I1] Email
// Then references elements by marker ID:
const saveBtn = AgentUI.getMarkerElement('B1');
saveBtn.click();

// Get all marker mappings
AgentUI.getMarkerMap();
// { B1: { tag: 'au-button', label: 'Save' }, I1: { tag: 'au-input'... } }

AgentUI.disableVisualMarkers(); // Clean up

// === STRUCTURED SCHEMA (for code generation) ===
// Get JSON Schema for type-safe code gen
AgentUI.getComponentSchema('au-button');
// { properties: { variant: { enum: ['filled'...] } }, actions: ['click'] }

AgentUI.getAllSchemas();           // All 11 documented components
AgentUI.getSchemaQuickRef('au-input'); // Minimal summary

// === MCP-COMPATIBLE ACTION SCHEMA ===
// ⚠️ NOTE: This is an ACTION SCHEMA in MCP-compatible format, 
// NOT a full MCP server implementation. Agents can read this schema
// to understand available UI actions without parsing component docs.
AgentUI.getMCPActions();
// Returns structured action definitions:
// {
//   name: 'agentui',
//   version: '3.4.0',
//   description: 'Interact with AgentUI components',
//   actions: [
//     { name: 'click_button', parameters: { selector: {...} } },
//     { name: 'fill_input', parameters: { selector: {...}, value: {...} } },
//     { name: 'toggle_checkbox', ... },
//     { name: 'select_option', ... },
//     { name: 'open_modal', ... },
//     { name: 'close_modal', ... },
//     { name: 'select_tab', ... },
//     { name: 'get_component_tree', ... },
//     { name: 'enable_visual_markers', ... },
//     { name: 'confirm_dialog', ... }
//   ]
// }
```

**Semantic Attributes (auto-inferred):**
```html
<!-- Components auto-add data-au-action and data-au-role -->
<au-button variant="filled">Save</au-button>
<!-- Becomes: data-au-action="submit" data-au-role="primary-action" -->

<au-button variant="text">Cancel</au-button>
<!-- Becomes: data-au-action="cancel" data-au-role="tertiary-action" -->
```

### Minimal Page Setup
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preload" as="style" href="dist/agentui.css">
    <link rel="stylesheet" href="dist/agentui.css"
          media="print" onload="this.media='all'">
    <noscript><link rel="stylesheet" href="dist/agentui.css"></noscript>
    <style>
      @font-face { font-family: 'Roboto'; font-display: swap; src: url('https://fonts.gstatic.com/s/roboto/v47/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWubEbVmUiA8.woff2') format('woff2'); }
      body { font-family: var(--md-sys-typescale-font); margin: 0; }
    </style>
</head>
<body>
    <!-- Your content here -->
    <script type="module" src="dist/agentui.esm.js" async></script>
</body>
</html>
```

### 🚀 Initialization & Debug Mode (v0.1.23+)

#### au-ready Event
Wait for all components to be registered before manipulating them:

```javascript
// Wait for AgentUI to be ready
document.addEventListener('au-ready', (e) => {
    console.log('AgentUI ready!', e.detail);
    // { version: '0.1.150', components: 57, timestamp: ... }
    
    // Now safe to manipulate components
    const input = document.querySelector('au-input');
    input.value = 'pre-filled';
});

// Or check synchronously
if (window.AgentUI?.ready) {
    // Already ready
}
```

#### Debug Mode
Enable verbose logging for troubleshooting:

```html
<script>window.AGENTUI_DEBUG = true;</script>
<script type="module" src="dist/agentui.esm.js"></script>
```

Console output in debug mode:
- `[AgentUI] Debug mode enabled`
- `[AgentUI] All components registered, emitting au-ready`
- `[AgentUI] Registered components: Map(50) {...}`

#### 🎬 Splash Screen (v0.1.24+) - BEST PRACTICE

Prevent janky first-paint on slow hardware with `<au-splash>`. 

> **⚠️ CRITICAL**: Always include the CSS fallback in `<head>` to ensure the splash is visible BEFORE JavaScript loads.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- REQUIRED: CSS-only fallback for instant render -->
    <style>
        /* Shows splash BEFORE JavaScript loads (:not(:defined) = not yet registered) */
        au-splash:not(:defined) {
            position: fixed;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--md-sys-color-surface, #FFFBFE);
            z-index: 99999;
        }
        au-splash:not(:defined)::after {
            content: '';
            width: 48px;
            height: 48px;
            border: 4px solid var(--md-sys-color-primary, #6750A4);
            border-top-color: transparent;
            border-radius: 50%;
            animation: au-splash-spin 1s linear infinite;
        }
        @keyframes au-splash-spin { to { transform: rotate(360deg); } }
        
        /* Dark theme support */
        [data-theme="dark"] au-splash:not(:defined) {
            background: var(--md-sys-color-surface, #141218);
        }
    </style>
    
    <!-- agentui.css: render-blocking HERE is intentional (splash needs styles before JS) -->
    <link rel="stylesheet" href="dist/agentui.css">
    <style>
      @font-face { font-family: 'Roboto'; font-display: swap; src: url('https://fonts.gstatic.com/s/roboto/v47/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWubEbVmUiA8.woff2') format('woff2'); }
      body { font-family: var(--md-sys-typescale-font); margin: 0; }
    </style>
</head>
<body>
    <!-- Splash: visible instantly via CSS, enhanced when JS loads -->
    <au-splash logo="logo.svg"></au-splash>
    
    <!-- App content (hidden until ready) -->
    <div id="app">
        <au-layout>...</au-layout>
    </div>
    
    <script type="module" src="dist/agentui.esm.js"></script>
</body>
</html>
```

**How it works:**
1. `:not(:defined)` CSS shows spinner **instantly** (before JS)
2. JS loads → `au-splash` component upgrades → takes over with enhanced features
3. `au-ready` fires → splash fades out smoothly
4. Splash removes itself from DOM

**Attributes:**
| Attribute | Default | Description |
|-----------|---------|-------------|
| `logo` | - | URL to logo image |
| `duration` | `300` | Fade duration in ms |
| `delay` | `0` | Minimum display time |
| `spinner` | `true` | Show/hide spinner |
| `max-wait` | `10000` | Fallback timeout |

---

## More Resources

For practical build recipes, templates, and copy-paste patterns, see:
**[SKILL.md](./SKILL.md)**

For detailed component documentation, responsive breakpoints, JavaScript API,
PWA development, accessibility, performance patterns, error handling,
state management, and architecture for large apps, see:
**[AGENTS_REFERENCE.md](./AGENTS_REFERENCE.md)**
