# API Reference

## Core Exports

```javascript
import { 
    Theme,           // Theme management
    bus,             // EventBus (LightBus)
    UIEvents,        // Standard event constants
    showToast,       // Toast notifications
    createStore,     // Reactive state management
    html, safe, escapeHTML,  // XSS-safe HTML templates
    whenReady        // Framework readiness
} from 'agentui-wc';

// Direct module imports for tree-shaking
import { http, HttpError } from 'agentui-wc/core/http';
import { Router } from 'agentui-wc/core/router';
import { breakpoints } from 'agentui-wc/core/breakpoints';
import { keyboard } from 'agentui-wc/core/keyboard';
import { Z_INDEX } from 'agentui-wc/core/layers';
import { rafScheduler, memo, debounce, throttle, domBatch, createVisibilityObserver, processInChunks } from 'agentui-wc/core/render';
import { scheduleTask, yieldToMain, processWithYield, runBackground, afterPaint } from 'agentui-wc/core/scheduler';
import { transition, transitionNamed, navigateWithTransition } from 'agentui-wc/core/transitions';
import { attachRipple, RippleMixin } from 'agentui-wc/core/ripple';
import { AgentAPI, getAuComponentTree, enableVisualMarkers, getMCPActions } from 'agentui-wc/core/agent-api';
```

> **Detailed reference for all utilities:** [Core Utilities](./core-utilities.md)

---

## Theme

Manages light/dark mode themes.

```javascript
import { Theme } from 'agentui-wc';

Theme.init();              // Initialize (reads system preference)
Theme.set('dark');         // Set: 'light' | 'dark' | 'system'
Theme.toggle();            // Toggle light/dark
const current = Theme.get(); // Get current theme
```

---



## EventBus (LightBus)

High-performance event system (~100M ops/sec).

```javascript
import { bus } from 'agentui-wc';

// Subscribe
const unsubscribe = bus.on('user:login', (data) => {
    console.log('User logged in:', data.name);
});

// Emit (synchronous)
bus.emit('user:login', { name: 'John' });

// Unsubscribe
unsubscribe();
```

---

## Toast Notifications

```javascript
import { showToast } from 'agentui-wc';

showToast('Message', {
    severity: 'success',  // 'info' | 'success' | 'warning' | 'error'
    duration: 3000       // ms (0 = persistent)
});
```

---

## Framework Ready Event

AgentUI fires `au-ready` on `document` when all 57 components are registered:

```javascript
document.addEventListener('au-ready', () => {
  // All au-* components are registered and ready to use
  initApp();
});

// Sync check for late-loading scripts
if (window.AgentUI?.ready) initApp();
```

> ⚠️ Do NOT use `setTimeout(init, 100)` — use `au-ready` or `customElements.whenDefined()`.

---

## Component Base Class

All components extend `AuElement`:

```javascript
import { AuElement, define } from 'agentui-wc/core/AuElement.js';

class MyComponent extends AuElement {
    static baseClass = 'my-component';
    static observedAttributes = ['value', 'disabled'];
    
    render() {
        // Called on first connect
    }
    
    update(attr, newVal, oldVal) {
        // Called when observed attribute changes
    }
    
    cleanup() {
        // Called on disconnect
    }
}

define('my-component', MyComponent);
```

### Helper Methods

| Method | Description |
|--------|-------------|
| `attr(name, default)` | Get attribute value with default |
| `has(name)` | Check if attribute exists |
| `emit(event, detail)` | Dispatch custom event |
| `listen(el, event, handler)` | Add auto-cleaned event listener |
| `setTimeout(fn, ms)` | Auto-cleared timeout |
| `setInterval(fn, ms)` | Auto-cleared interval |

---

## Build Commands

```bash
# Build all (framework + app)
bun run build

# Framework only → dist/
bun run build:framework

# App only → app-dist/
bun run build:app

# Development server
bun run dev

# Run tests
bun run test:isolated
```

---

## File Structure

```
dist/
├── agentui.esm.js      # ESM bundle (177 KB)
├── agentui.min.js      # IIFE bundle (178 KB)
├── agentui.css         # Combined CSS (94 KB)
├── agentui.d.ts        # TypeScript types
├── routes/             # Route bundles + route-deps.json
└── components/         # Per-component builds

app-dist/
├── index.html          # App shell
├── pages/              # HTML pages
├── routes/             # Auto-generated bundles
└── pages.json          # Manifest
```
