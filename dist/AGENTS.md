# AgentUI - AI Agent Documentation

> **FOR AI AGENTS: This document is for USING AgentUI components to build web apps and PWAs.**
> To develop new components or extend the framework, see [AGENTS_DEV.md](./AGENTS_DEV.md).

> **AI-friendly web components framework.** 50 components, zero Shadow DOM.

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
| [🔥 Schema Form Showcase](#-schema-form-showcase) | Auto-generate entire forms from JSON Schema |
| [⚠️ Common Gotchas](#️-common-gotchas-for-ai-agents) | Top 10 mistakes and instant fixes |
| [📋 TL;DR Templates](#tldr---copy-paste-templates) | Agent API, Enterprise features |
| [📦 Component Quick Reference](./AGENTS_REFERENCE.md#quick-reference) | Component attributes table (in AGENTS_REFERENCE.md) |
| [🎯 Common Patterns](./AGENTS_REFERENCE.md#-common-patterns-for-ai-agents) | Forms, modals, CRUD (in AGENTS_REFERENCE.md) |
| [🏗️ PWA Development](./AGENTS_REFERENCE.md#pwa-development-for-agents) | Service Worker, manifests, caching (in AGENTS_REFERENCE.md) |
| [🏢 Architecture](./AGENTS_REFERENCE.md#architecture-for-large-apps-10-pages) | State management, routing, code splitting (in AGENTS_REFERENCE.md) |

> **Need to extend the framework with new components?** See [AGENTS_DEV.md](./AGENTS_DEV.md) for development guidelines, mandatory patterns, and testing procedures.

---

## 🔥 Schema Form Showcase

> **`au-schema-form` is AgentUI's killer feature for AI agents.** Define a JSON Schema → get a complete, validated, accessible form with zero boilerplate.

### How It Works

```html
<au-schema-form id="my-form"></au-schema-form>

<script type="module">
const form = document.getElementById('my-form');

form.schema = {
    title: "User Registration",
    required: ["email", "password", "name"],
    properties: {
        name:     { type: "string", title: "Full Name", minLength: 2, maxLength: 50 },
        email:    { type: "string", title: "Email", format: "email" },
        password: { type: "string", title: "Password", minLength: 8, placeholder: "Min 8 characters" },
        age:      { type: "integer", title: "Age", minimum: 18, maximum: 120 },
        bio:      { type: "string", title: "Bio", multiline: true, maxLength: 500 },
        role:     { type: "string", title: "Role", enum: ["user", "admin", "editor"], enumLabels: ["User", "Administrator", "Editor"] },
        newsletter: { type: "boolean", title: "Subscribe to newsletter" }
    }
};

form.addEventListener('au-submit', (e) => {
    console.log('Form data:', e.detail);
    // { name: "John", email: "j@x.com", password: "...", age: 25, bio: "...", role: "admin", newsletter: true }
});
</script>
```

**What you get automatically:**
- ✅ `string` → `au-input` (with type detection: email, url, password)
- ✅ `string` + `multiline: true` → `au-textarea`
- ✅ `integer`/`number` → `au-input type="number"` with min/max
- ✅ `boolean` → `au-switch`
- ✅ `enum` → `au-dropdown` with `au-option`s
- ✅ Built-in validation: `required`, `minLength`, `maxLength`, `pattern`, `minimum`, `maximum`, `format` (email/url)
- ✅ Submit + Reset buttons with customizable labels
- ✅ Error messages displayed per-field
- ✅ XSS-safe (all schema values are escaped)

### Attributes

| Attribute | Description | Default |
|-----------|-------------|---------|
| `submit-label` | Submit button text | `"Submit"` |
| `reset-label` | Reset button text | `"Reset"` |
| `inline` | Horizontal layout | `false` |
| `readonly` | All fields read-only | `false` |
| `disabled` | All fields disabled | `false` |

### API

```javascript
form.schema = { ... };       // Set/update schema (triggers re-render)
form.getValues();             // Get current values as object
form.setValues({ name: "..." }); // Set values programmatically
form.validate();              // Returns boolean, shows errors
form.getErrors();             // Get error object { field: ["error"] }
form.reset();                 // Reset to defaults
form.submit();                // Trigger submit programmatically
```

### Example: Settings Page

```javascript
form.schema = {
    title: "App Settings",
    required: ["appName"],
    properties: {
        appName:   { type: "string", title: "App Name", minLength: 1 },
        darkMode:  { type: "boolean", title: "Dark Mode" },
        language:  { type: "string", title: "Language", enum: ["en", "it", "es", "de"], enumLabels: ["English", "Italiano", "Español", "Deutsch"] },
        maxItems:  { type: "integer", title: "Max Items Per Page", minimum: 10, maximum: 100 },
        apiUrl:    { type: "string", title: "API Endpoint", format: "url", placeholder: "https://..." }
    }
};
```

### Example: Contact Form with Pattern Validation

```javascript
form.schema = {
    required: ["name", "email", "message"],
    properties: {
        name:    { type: "string", title: "Name", minLength: 2 },
        email:   { type: "string", title: "Email", format: "email" },
        phone:   { type: "string", title: "Phone", pattern: "^\\+?[0-9]{8,15}$", patternError: "Enter a valid phone number" },
        subject: { type: "string", title: "Subject", enum: ["general", "support", "sales"], enumLabels: ["General Inquiry", "Technical Support", "Sales"] },
        message: { type: "string", title: "Message", multiline: true, minLength: 10, maxLength: 1000 }
    }
};
```

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

**3. Agent API  - LLM-Friendly Component Access**
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

**5. Agent Automation  - 2026 Multimodal & MCP-Compatible Action Schema**

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
    // { version: '0.1.23', components: 50, timestamp: ... }
    
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


### 🤖 Ready-to-Use Agent Patterns


> **Copy-paste these patterns directly.** Tested and verified for AI agent workflows.

#### Form Data Collection
```javascript
// Get all form values at once (PREFERRED)
const form = document.querySelector('au-form');
const data = form.getValues();  // { email: '...', password: '...' }

// Validate before submission
if (form.validate()) {
    // All required fields are filled
    console.log('Form data:', data);
}
```

#### Manual Input Collection (without au-form)
```javascript
// Collect all au-input values by name
const inputs = document.querySelectorAll('au-input[name]');
const data = {};
inputs.forEach(input => {
    data[input.getAttribute('name')] = input.value;
});
```

#### Setting Input Values Programmatically
```javascript
// Set value - works like native input
const input = document.querySelector('au-input');
input.value = 'new value';
console.log(input.value); // 'new value'

// Trigger validation
input.setAttribute('value', 'another value');
```

#### Component Discovery via describe()
```javascript
// Get component metadata at runtime
const ButtonClass = customElements.get('au-button');
const schema = ButtonClass.describe();
// Returns: {
//   name: 'au-button',
//   description: 'Material Design 3 button',
//   props: { variant: { type: 'string', values: [...] }, ... },
//   events: ['au-click'],
//   examples: ['<au-button variant="filled">Click</au-button>']
// }

// Supported on: au-button, au-input, au-card, au-checkbox, au-switch,
// au-dropdown, au-textarea, au-radio-group, au-alert, au-toast,
// au-modal, au-spinner, au-progress
```

#### Find All Interactive Components
```javascript
// Get all clickable/focusable AgentUI components
const interactive = document.querySelectorAll(
    'au-button, au-input, au-checkbox, au-switch, au-chip, au-dropdown'
);

// Get component state
interactive.forEach(el => {
    console.log(el.tagName, {
        disabled: el.hasAttribute('disabled'),
        value: el.value,
        checked: el.checked
    });
});
```

#### Theme Control
```javascript
// Toggle dark/light mode
import { Theme } from 'agentui-wc';
Theme.toggle();

// Set specific theme
Theme.set('dark');
Theme.set('light');

// Get current theme
const current = Theme.get(); // 'dark' | 'light'
```

### 🏗️ PWA App Shell Components (Built-In)

> **AgentUI includes a complete, responsive App Shell system.** You don't need to build it — just compose these components.

AgentUI provides 5 components that together form a full PWA App Shell with responsive behavior baked in:

| Component | Role | Key Features |
|-----------|------|--------------|
| `au-layout` | **Shell container** — orchestrates header, drawer, content, footer, bottom nav. Use `full-bleed` for zero-padding layouts (kanban, maps). | 5 named slots: `header`, `drawer`, `main` (default), `footer`, `bottom`. Attr: `full-bleed` |
| `au-drawer` | **Side navigation** — responsive sidebar | `mode`: `auto` (recommended), `permanent`, `temporary`, `rail`. Supports `expand-on-hover` |
| `au-drawer-item` | **Nav item** inside drawer | `icon`, `label`, `href`, `active`, `data-page` |
| `au-navbar` | **Top app bar** | `sticky`, `variant` (surface, primary) |
| `au-bottom-nav` | **Mobile bottom nav** — auto-shows on compact screens | Hidden on desktop, visible on mobile |

#### How au-layout Slots Work

```
┌──────────────────────────────────────────────────────┐
│  slot="header"     → au-navbar (sticky top bar)      │
├──────────┬───────────────────────────────────────────┤
│          │                                           │
│ slot=    │  default slot (main content area)          │
│ "drawer" │  ← Your page content goes here            │
│          │                                           │
│ au-drawer│                                           │
│          │                                           │
├──────────┴───────────────────────────────────────────┤
│  slot="footer"     → Optional footer                 │
├──────────────────────────────────────────────────────┤
│  slot="bottom"     → au-bottom-nav (mobile only)     │
└──────────────────────────────────────────────────────┘
```

#### au-drawer Responsive Modes (Automatic with `mode="auto"`)

| Screen Size | Drawer Behavior | Bottom Nav |
|-------------|----------------|------------|
| **Desktop** (≥ 840px) | Expanded sidebar, always visible | Hidden |
| **Tablet** (600-839px) | Rail mode (icons only), expand on hover | Hidden |
| **Mobile** (< 600px) | Hidden (opens as overlay on tap) | Visible |

> **This is 100% automatic with `mode="auto"`.** No media queries, no JavaScript — the components handle all responsive transitions internally.

#### Template 1: Dashboard App Shell (Most Common)

```html
<au-layout>
    <!-- Top bar with branding and actions -->
    <au-navbar slot="header" sticky>
        <au-navbar-brand>My Dashboard</au-navbar-brand>
        <au-navbar-actions>
            <au-theme-toggle></au-theme-toggle>
            <au-icon-button icon="notifications"></au-icon-button>
            <au-avatar src="user.jpg"></au-avatar>
        </au-navbar-actions>
    </au-navbar>

    <!-- Sidebar: auto-responsive (expanded → rail → overlay) -->
    <au-drawer slot="drawer" mode="auto" expand-on-hover>
        <au-drawer-item icon="dashboard" href="#dashboard" active>Dashboard</au-drawer-item>
        <au-drawer-item icon="people" href="#users">Users</au-drawer-item>
        <au-drawer-item icon="analytics" href="#analytics">Analytics</au-drawer-item>
        <au-drawer-item icon="settings" href="#settings">Settings</au-drawer-item>
    </au-drawer>

    <!-- Main content: changes on navigation -->
    <au-container>
        <main id="content">
            <!-- Page content loads here -->
        </main>
    </au-container>

    <!-- Mobile bottom nav: auto-visible on compact screens only -->
    <au-bottom-nav slot="bottom">
        <au-bottom-nav-item icon="dashboard" label="Dashboard" active></au-bottom-nav-item>
        <au-bottom-nav-item icon="people" label="Users"></au-bottom-nav-item>
        <au-bottom-nav-item icon="analytics" label="Analytics"></au-bottom-nav-item>
        <au-bottom-nav-item icon="settings" label="Settings"></au-bottom-nav-item>
    </au-bottom-nav>
</au-layout>
```

This gives you:
- ✅ Sticky header with branding and user actions
- ✅ Responsive sidebar (expanded → rail → overlay, zero config)
- ✅ Mobile bottom navigation (auto-shows < 600px)
- ✅ Scrollable content area (independent from header/drawer)
- ✅ Dark/light theme toggle
- ✅ **All of this in ~20KB gzipped initial load**

#### Template 2: E-Commerce Shell (No Drawer)

```html
<au-layout>
    <au-navbar slot="header" sticky>
        <au-navbar-brand>ShopName</au-navbar-brand>
        <au-navbar-actions>
            <au-icon-button icon="search"></au-icon-button>
            <au-icon-button icon="shopping_cart"></au-icon-button>
        </au-navbar-actions>
    </au-navbar>

    <au-container>
        <main id="content"><!-- Products grid --></main>
    </au-container>

    <au-bottom-nav slot="bottom">
        <au-bottom-nav-item icon="home" label="Home" active></au-bottom-nav-item>
        <au-bottom-nav-item icon="category" label="Categories"></au-bottom-nav-item>
        <au-bottom-nav-item icon="shopping_cart" label="Cart"></au-bottom-nav-item>
        <au-bottom-nav-item icon="person" label="Account"></au-bottom-nav-item>
    </au-bottom-nav>
</au-layout>
```

#### Template 3: Admin Panel (Permanent Drawer)

```html
<au-layout>
    <au-navbar slot="header" sticky variant="primary">
        <au-navbar-brand>Admin Panel</au-navbar-brand>
    </au-navbar>

    <!-- Permanent drawer: always visible, never collapses -->
    <au-drawer slot="drawer" mode="permanent">
        <au-drawer-item icon="dashboard" href="#overview" active>Overview</au-drawer-item>
        <au-drawer-item icon="group" href="#users">Users</au-drawer-item>
        <au-drawer-item icon="assessment" href="#reports">Reports</au-drawer-item>
        <au-drawer-item icon="admin_panel_settings" href="#config">Config</au-drawer-item>
    </au-drawer>

    <main id="content"></main>
</au-layout>
```

> 💡 **Key insight for agents:** `au-layout` is NOT just a CSS grid wrapper — it's a responsive orchestrator. When you put `au-drawer` in `slot="drawer"` and `au-bottom-nav` in `slot="bottom"`, the layout automatically coordinates their visibility across breakpoints. You don't write any responsive CSS or JavaScript — the components talk to each other internally.

> [!CAUTION]
> **NEVER** override `padding` on `.au-layout-content` — it silently defeats bottom-nav compensation.
> For zero-padding layouts (kanban, maps, dashboards), use `<au-layout full-bleed>`.
> The framework emits a `console.warn` at runtime if it detects the override.

#### Template 4: Full-Bleed Layout (Kanban, Maps, Dashboards)

```html
<au-layout full-bleed>
    <au-navbar slot="header" sticky>
        <au-navbar-brand>Kanban Board</au-navbar-brand>
    </au-navbar>

    <!-- Content fills edge-to-edge, zero padding -->
    <div id="kanban-board" style="display: flex; gap: 16px; height: 100%; padding: 16px;">
        <!-- Your columns -->
    </div>

    <au-bottom-nav slot="bottom">
        <au-bottom-nav-item icon="view_kanban" label="Board" active></au-bottom-nav-item>
        <au-bottom-nav-item icon="list" label="List"></au-bottom-nav-item>
    </au-bottom-nav>
</au-layout>
```

### 🚀 Modern App Shell Pattern (RECOMMENDED)

> **For production apps, use this pattern instead of Minimal Page Setup.**
> This is how `demo/index.html` achieves 100/100 Lighthouse with all 50 components.

**Why App Shell?**
| Approach | Initial Load | Lighthouse | DX for Agents |
|----------|--------------|------------|---------------|
| Minimal (all-in-one) | ~60KB + content | 70-85 | Simple but suboptimal |
| **App Shell (lazy)** | ~20KB shell → routes lazy | **100/100** | Optimal performance |

#### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    INITIAL LOAD (~20KB)                     │
│  index.html + agentui.css + shell-critical.js               │
│  → Renders navbar, drawer, footer instantly                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   ON NAVIGATION (lazy)                      │
│  dist/routes/{page}.js  → Component bundle for that page    │
│  content/{page}.html    → HTML content fragment             │
└─────────────────────────────────────────────────────────────┘
```

#### Minimal App Shell Template (Copy This)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My AgentUI App</title>
    
    <!-- Critical CSS: async load prevents render blocking -->
    <link rel="preload" as="style" href="dist/agentui.css">
    <link rel="stylesheet" href="dist/agentui.css" media="print" onload="this.media='all'">
    <noscript><link rel="stylesheet" href="dist/agentui.css"></noscript>
    
    <!-- Modern 2026: Speculation Rules for prefetch -->
    <script type="speculationrules">
    {
        "prefetch": [{ "urls": ["/dist/routes/home.js", "/dist/routes/dashboard.js"], "eagerness": "moderate" }]
    }
    </script>
    
    <style>
        /* Font + critical inline CSS */
        @font-face { font-family: 'Roboto'; font-display: swap; src: url('https://fonts.gstatic.com/s/roboto/v47/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWubEbVmUiA8.woff2') format('woff2'); }
        body { font-family: var(--md-sys-typescale-font); background: var(--md-sys-color-background); margin: 0; }
        :root { --md-sys-color-background: #FFFBFE; }
        [data-theme="dark"] { --md-sys-color-background: #141218; }
        
        /* Modern: Lazy render off-screen content */
        au-example { content-visibility: auto; contain-intrinsic-size: auto 300px; }
    </style>
</head>
<body>
    <!-- App Shell: renders instantly -->
    <au-layout>
        <header slot="header">
            <au-theme-toggle></au-theme-toggle>
        </header>
        
        <au-drawer slot="drawer" mode="auto">
            <au-drawer-item icon="home" href="#home" data-page="home" active>Home</au-drawer-item>
            <au-drawer-item icon="dashboard" href="#dashboard" data-page="dashboard">Dashboard</au-drawer-item>
        </au-drawer>
        
        <!-- Dynamic content area -->
        <main id="content"></main>
    </au-layout>

    <script type="module">
        // ====================================
        // LAZY LOADING ENGINE (copy this!)
        // ====================================
        const loadedRoutes = new Set();
        const contentArea = document.getElementById('content');
        
        // Load route bundle on demand
        async function loadRoute(name) {
            if (loadedRoutes.has(name)) return;
            loadedRoutes.add(name);
            await import(`./dist/routes/${name}.js`);
        }
        
        // Load HTML content fragment
        async function loadContent(pageId) {
            const response = await fetch(`./content/${pageId}.html`);
            return response.ok ? await response.text() : null;
        }
        
        // Navigate with View Transitions (smooth)
        async function showPage(pageId) {
            await loadRoute(pageId);
            const content = await loadContent(pageId);
            
            const updateDOM = () => {
                contentArea.innerHTML = content || `<h1>${pageId}</h1>`;
                // Execute inline scripts
                contentArea.querySelectorAll('script').forEach(s => {
                    const newScript = document.createElement('script');
                    newScript.textContent = s.textContent;
                    s.replaceWith(newScript);
                });
            };
            
            // Modern: View Transitions API for smooth navigation
            if (document.startViewTransition) {
                await document.startViewTransition(updateDOM).finished;
            } else {
                updateDOM();
            }
        }
        
        // Prefetch on hover (anticipate navigation)
        document.querySelectorAll('au-drawer-item').forEach(item => {
            item.addEventListener('mouseenter', () => loadRoute(item.dataset.page));
            item.addEventListener('click', e => {
                e.preventDefault();
                window.location.hash = item.dataset.page;
            });
        });
        
        // Hash-based routing
        window.addEventListener('hashchange', () => showPage(location.hash.slice(1) || 'home'));
        showPage(location.hash.slice(1) || 'home');
    </script>
</body>
</html>
```

#### Performance Techniques Explained

| Technique | Code | Why It Matters |
|-----------|------|----------------|
| **Async CSS** | `media="print" onload="this.media='all'"` | Prevents render-blocking |
| **Speculation Rules** | `<script type="speculationrules">` | Browser prefetches likely routes |
| **content-visibility** | `content-visibility: auto` | Skips rendering off-screen content |
| **View Transitions** | `document.startViewTransition()` | Smooth page transitions |
| **Hover prefetch** | `mouseenter → loadRoute()` | Loads before user clicks |
| **Route caching** | `loadedRoutes.has(name)` | Never re-download same route |

#### File Structure for App Shell

```
my-app/
├── index.html              # App shell (copy template above)
├── content/                # HTML fragments (lazy loaded)
│   ├── home.html
│   ├── dashboard.html
│   └── settings.html
├── dist/
│   ├── agentui.css
│   ├── agentui.esm.js
│   └── routes/             # Route bundles (auto-generated by build)
│       ├── home.js
│       ├── dashboard.js
│       └── settings.js
└── app/
    └── pages/              # Source pages (build input)
        ├── home.html
        ├── dashboard.html
        └── settings.html
```

#### Build Command

```bash
bun run build   # Generates dist/routes/*.js from app/pages/*.html
```

### Common Patterns (Copy These)

```html
<!-- Form with validation -->
<au-form>
    <au-stack gap="md">
        <au-input label="Email" type="email" required></au-input>
        <au-input label="Password" type="password" required></au-input>
        <au-button variant="filled">Submit</au-button>
    </au-stack>
</au-form>

<!-- Card layout -->
<au-grid cols="3" gap="md">
    <au-card variant="elevated">
        <h3>Title</h3>
        <p>Content</p>
        <au-button variant="text">Action</au-button>
    </au-card>
</au-grid>

<!-- Navigation tabs -->
<au-tabs active="0">
    <au-tab>Tab 1</au-tab>
    <au-tab>Tab 2</au-tab>
</au-tabs>

<!-- Modal dialog -->
<au-modal id="my-modal">
    <h2>Modal Title</h2>
    <p>Content</p>
    <au-button onclick="this.closest('au-modal').close()">Close</au-button>
</au-modal>
<au-button onclick="document.getElementById('my-modal').open()">Open Modal</au-button>

<!-- Toast notification -->
<script type="module">
import { showToast } from './dist/agentui.esm.js';
showToast('Success!', { severity: 'success', duration: 3000 });
</script>

<!-- Drag & Drop (native HTML5, works with any component) -->
<au-card draggable="true" data-id="123"
         ondragstart="event.dataTransfer.setData('text/plain', this.dataset.id)"
         ondragend="this.style.opacity = '1'">
    Drag me
</au-card>

<au-card ondragover="event.preventDefault(); this.classList.add('drag-over')"
         ondragleave="this.classList.remove('drag-over')"
         ondrop="handleDrop(event, this)">
    Drop here
</au-card>
```

---


---

## Full API Reference

For detailed component documentation, responsive breakpoints, JavaScript API,
PWA development, accessibility, performance patterns, error handling,
state management, and architecture for large apps, see:

**[AGENTS_REFERENCE.md](./AGENTS_REFERENCE.md)**
