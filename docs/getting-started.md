# Getting Started with AgentUI

## Installation

### NPM / Bun

```bash
npm install agentui-wc
# or
bun add agentui-wc
```

### CDN

```html
<link rel="stylesheet" href="https://unpkg.com/agentui-wc@latest/dist/agentui.css">
<script type="module" src="https://unpkg.com/agentui-wc@latest/dist/agentui.esm.js"></script>
```

> 💡 For **Lighthouse 100**, use the optimized template in [llms.txt](../llms.txt#L329) (non-blocking CSS, font preload, async JS).

### From Source

```bash
git clone https://github.com/GiuseppeScottoLavina/AgentUI.git
cd agentui
bun install
bun run build
```

> 💡 **Why AgentUI?** Built on W3C Web Components, not a framework that changes every year. No React 18→19 migrations, no "waiting for dependencies to update". Your code works today and in 5 years.

## Quick Start

### 1. Include CSS and JS

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="dist/agentui.css">
</head>
<body>
    <!-- Your content here -->
    <script type="module" src="dist/agentui.esm.js"></script>
</body>
</html>
```

> 💡 For **Lighthouse 100**, use the optimized `<head>` template in [llms.txt](../llms.txt#L329).

### 2. Use Components

AgentUI uses native Web Components. Just use them as HTML tags:

```html
<au-stack gap="md">
    <au-card variant="elevated">
        <h2>Hello AgentUI!</h2>
        <p>This is a card component.</p>
    </au-card>
    
    <au-button variant="filled">Click Me</au-button>
</au-stack>
```

---

## Core Concepts

### 1. Web Components

All AgentUI components are native Web Components. Use them like standard HTML:

```html
<!-- Buttons -->
<au-button variant="filled">Primary</au-button>
<au-button variant="outlined">Secondary</au-button>

<!-- Form inputs -->
<au-input label="Email" type="email"></au-input>
<au-checkbox>Remember me</au-checkbox>

<!-- Layout -->
<au-stack direction="row" gap="md">
    <au-card>Item 1</au-card>
    <au-card>Item 2</au-card>
</au-stack>
```

### 2. Attributes

Configure components via HTML attributes:

```html
<!-- Button variants -->
<au-button variant="filled">Filled</au-button>
<au-button variant="tonal">Tonal</au-button>
<au-button variant="outlined">Outlined</au-button>

<!-- Sizes -->
<au-button size="sm">Small</au-button>
<au-button size="md">Medium</au-button>
<au-button size="lg">Large</au-button>

<!-- States -->
<au-button disabled>Disabled</au-button>
```

### 3. Events

Listen to custom events with standard JavaScript:

```javascript
document.querySelector('au-button').addEventListener('click', () => {
    console.log('Button clicked!');
});

document.querySelector('au-input').addEventListener('au-change', (e) => {
    console.log('Value:', e.detail.value);
});
```

### 4. Theming

Switch between light and dark modes:

```javascript
import { Theme } from 'agentui-wc';

Theme.init();         // Auto-detect from system
Theme.set('dark');    // Force dark mode
Theme.toggle();       // Toggle light/dark
```

Or use the built-in toggle:

```html
<au-theme-toggle></au-theme-toggle>
```

---

## Layout Components

```html
<!-- Stack (Flexbox) -->
<au-stack direction="row" gap="md" align="center">
    <div>Item 1</div>
    <div>Item 2</div>
</au-stack>

<!-- Grid -->
<au-grid cols="3" gap="md">
    <au-card>1</au-card>
    <au-card>2</au-card>
    <au-card>3</au-card>
</au-grid>
```

---

## Building Apps

### The App Shell Standard

AgentUI uses an **App Shell architecture** for production applications. This ensures:
- 🚀 **100/100 Lighthouse** performance scores
- ⚡ **Instant first paint** with lazy-loaded routes
- 📦 **Optimal bundle splitting** (load only what's needed)

> **How it works:** The initial page (`index.html`) loads only the critical UI shell (~20KB). Routes and content are loaded on-demand as users navigate.

```
Initial:  index.html (navbar, drawer) → instant render
Navigate: #dashboard → lazy load dashboard.js + dashboard.html
```

This is the standard pattern used in `demo/index.html` and recommended for all production apps. See [AGENTS.md](../AGENTS.md) for the complete template.

### Page-Based Architecture

Create pages in `app/pages/`:

```html
<!-- app/pages/dashboard.html -->
<au-page route="dashboard" title="Dashboard">
  <script type="x-dependencies">
    au-card
    au-grid
  </script>
  
  <template>
    <h1>Dashboard</h1>
    <au-grid cols="3" gap="md">
      <au-card>Widget 1</au-card>
      <au-card>Widget 2</au-card>
    </au-grid>
  </template>
</au-page>
```

Build and serve:

```bash
bun run build   # Generates route bundles with code splitting
npx serve dist
```

---

## Next Steps

- [Components Reference](./components.md) - All 57 components
- [API Reference](./api-reference.md) - JavaScript API
- [Design System](./design-system.md) - Theming & tokens
