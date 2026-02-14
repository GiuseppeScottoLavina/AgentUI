# AgentUI — Framework Development Guide

> **FOR AI AGENTS: This document is for DEVELOPING new components for the AgentUI framework.**
> If you need to BUILD APPS using AgentUI components, read [AGENTS.md](./AGENTS.md) instead.

---

## 🚨 MANDATORY RULES

> [!CAUTION]
> These rules can NEVER be violated. Any code that violates these rules must be rejected.

### ❌ NO SHADOW DOM

**AgentUI must NEVER use Shadow DOM.** All components must:
- Use Light DOM (normal DOM)
- Insert elements directly into the document
- Use CSS classes with `au-` prefix for encapsulation
- Never use `this.attachShadow()` or `this.shadowRoot`

```javascript
// ❌ FORBIDDEN - Never use this
this.attachShadow({ mode: 'open' });
this.shadowRoot.innerHTML = '...';

// ✅ CORRECT - Use Light DOM
this.innerHTML = '...';
this.classList.add('au-component');
```

### 🧪 MANDATORY TEST ISOLATION

**Tests MUST be run with `test-isolated.js`**, never with `bun test` directly.

```bash
# ❌ WRONG - Tests fail due to linkedom globalThis pollution
bun test tests/components

# ✅ CORRECT - Each test in separate process
bun run scripts/test-isolated.js

# ✅ CORRECT - E2E tests
bun run test:e2e
```

**Why?** linkedom (used to simulate DOM in unit tests) pollutes `globalThis` and the custom elements registry. When tests are run in parallel in the same process, the registrations conflict.

---

## 🛠️ COMPONENT DEVELOPMENT GUIDELINES

> **Mandatory guidelines for creating new AgentUI components.** Following these rules prevents memory leaks, crashes, and ensures consistency with the framework.

### 📋 Complete Component Template

```javascript
/**
 * au-example.js - Description of what this component does
 * 
 * @example
 * <au-example label="Test" value="123"></au-example>
 */

import { AuElement, define } from '../core/AuElement.js';
import { html, safe } from '../core/utils.js';  // XSS-safe tagged template

export class AuExample extends AuElement {
    static get observedAttributes() {
        return ['label', 'value', 'disabled'];
    }

    static baseClass = 'au-example';
    static cssFile = 'example';

    constructor() {
        super();
        this._internalState = null;
    }

    // ========================
    // LIFECYCLE (MANDATORY)
    // ========================
    
    connectedCallback() {
        super.connectedCallback();  // ⚠️ MANDATORY - Initializes AbortController
        this.render();
    }

    disconnectedCallback() {
        super.disconnectedCallback();  // ⚠️ MANDATORY if using timer/subscriptions
        // Cleanup manual subscriptions (e.g. breakpoints.subscribe)
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (this.isConnected && oldVal !== newVal) {
            this.render();
        }
    }

    // ========================
    // PROPERTIES
    // ========================

    get label() {
        return this.getAttribute('label') || '';
    }

    get value() {
        return this.getAttribute('value') || '';
    }

    get disabled() {
        return this.hasAttribute('disabled');
    }

    // ========================
    // RENDER (XSS-Safe)
    // ========================

    render() {
        // ✅ html`` auto-escapes all interpolated values
        this.innerHTML = html`
            <div class="au-example">
                <label>${this.label}</label>
                <input 
                    type="text" 
                    value="${this.value}"
                    placeholder="${this.getAttribute('placeholder') || ''}"
                    ${this.disabled ? 'disabled' : ''}
                >
            </div>
        `;
        this._attachEventListeners();
    }

    // ========================
    // EVENT LISTENERS (Memory-Safe)
    // ========================

    _attachEventListeners() {
        const input = this.querySelector('input');
        
        // ✅ CORRECT: Use this.listen() for auto-cleanup
        this.listen(input, 'input', (e) => {
            this.dispatchEvent(new CustomEvent('au-input', {
                bubbles: true,
                detail: { value: e.target.value }
            }));
        });

        // ✅ CORRECT: Use this.listen() for window/document events
        this.listen(window, 'resize', () => this._handleResize());
        
        // ✅ CORRECT: Keyboard accessibility
        if (!this.disabled) {
            this.setupActivation(() => this._handleClick());
        }
    }

    // ========================
    // TIMER (Memory-Safe)
    // ========================

    _startPolling() {
        // ✅ CORRECT: Use this.setInterval() for auto-cleanup
        this.setInterval(() => this._poll(), 5000);
    }

    _debounce() {
        // ✅ CORRECT: Use this.setTimeout() for auto-cleanup
        this.setTimeout(() => this._doSomething(), 300);
    }

    // ========================
    // ERROR REPORTING (AI Agent)
    // ========================

    _validate() {
        if (!this.label) {
            // ✅ Report errors for AI agent debugging
            this.logError('MISSING_LABEL', 'au-example requires a label attribute');
        }
    }
}

// Registration (idempotent)
if (!customElements.get('au-example')) {
    customElements.define('au-example', AuExample);
}
```

### ⚠️ ANTI-PATTERN: What NEVER to Do

```javascript
// ❌ FORBIDDEN: Direct addEventListener (memory leak)
this.querySelector('button').addEventListener('click', handler);

// ❌ FORBIDDEN: setTimeout/setInterval raw (memory leak)
setTimeout(() => this.update(), 1000);
setInterval(() => this.poll(), 5000);

// ❌ FORBIDDEN: No super.connectedCallback() (AbortController not initialized)
connectedCallback() {
    this.render();  // this.listen() won't work!
}

// ❌ FORBIDDEN: innerHTML without escaping (XSS vulnerability)
this.innerHTML = `<div>${userInput}</div>`;

// ✅ CORRECT: Use html`` tagged template (auto-escapes)
this.innerHTML = html`<div>${userInput}</div>`;

// ❌ FORBIDDEN: removeEventListener with arrow function (never works)
window.removeEventListener('resize', () => this.handleResize());

// ❌ FORBIDDEN: Temporal dead zone with setTimeout
const id = setTimeout(() => { this._timers.delete(id); }, delay);

// ❌ FORBIDDEN: Shadow DOM
this.attachShadow({ mode: 'open' });

// ❌ FORBIDDEN: DOM Teleportation without resetting listener flag (Bug Jan 2026)
// When a component moves ITSELF in the DOM (e.g. appendChild(this)),
// disconnectedCallback aborts listeners but the flag prevents re-registration
connectedCallback() {
    if (!this._listenerSetup) {  // ⚠️ Flag stays true after disconnect!
        this._listenerSetup = true;
        this.listen(this, 'click', handler);  // Lost after teleportation
    }
}
// ✅ CORRECT: Reset flag in disconnectedCallback
disconnectedCallback() {
    super.disconnectedCallback();
    this._listenerSetup = false;  // Allows re-registration after move
}
```

### ✅ MANDATORY PATTERNS

| Pattern | Method | Why |
|---------|--------|--------|
| **Event Listeners** | `this.listen(target, type, handler)` | Auto-cleanup via AbortController |
| **Timers** | `this.setTimeout()` / `this.setInterval()` | Auto-cleanup on disconnectedCallback |
| **XSS Prevention** | `html` tagged template | Auto-escapes all interpolations, use `safe()` for trusted HTML |
| **Keyboard A11y** | `this.setupActivation(callback)` | Handles Enter/Space for interactive elements |
| **AI Debugging** | `this.logError(code, message)` | Structured errors for AI agents |
| **Lifecycle** | `super.connectedCallback()` | Initializes AbortController for this.listen() |
| **DOM Teleportation** | Reset flag in `disconnectedCallback()` | Prevents orphan listeners after move |

### 🚀 Modern Patterns (Feb 2026)

Modern patterns that should be used for new components and migrations.

#### ✅ Performance CSS (Implemented)

The framework applies **by default** the following optimizations:

| Technique | File | Benefit |
|---------|---------|-----------|
| `will-change` | animations.css | GPU compositor hints for 13+ animation classes |
| `CSS contain` | layout.css, components.css | Isolates repaint scope for au-layout, modals |
| `content-visibility: auto` | components.css | Skip rendering off-screen for au-example |
| Speculation Rules API | index.html | Predictive route bundle prefetch |
| View Transitions API | index.html | Smooth page transitions in SPA |

**Lighthouse Score**: Optimized for high Performance, Accessibility, BP, and SEO scores

```css
/* Framework applies automatically: */
au-example {
    content-visibility: auto;
    contain-intrinsic-size: auto 300px;
}

au-layout {
    contain: layout style;
}

.au-spin {
    animation: au-spin 1s linear infinite;
    will-change: transform;
}
```

#### ✅ Native `<dialog>` for Modal (COMPLETED)
**au-modal** now uses native `<dialog>` with `showModal()`:
- Automatic top-layer (no manual z-index)
- Built-in focus trap
- Native ESC key handling
- Animated `::backdrop` scrim
- `margin: auto` for centering

```javascript
// ✅ Modern: Native dialog
this.#dialog = document.createElement('dialog');
this.#dialog.showModal();

// ❌ OLD: Position fixed + z-index + manual focus trap
this.style.cssText = 'position:fixed;z-index:9999;';
document.body.appendChild(this);
```

#### 🔜 Popover API (CANDIDATES)
The following components could benefit from the **Popover API**:

| Component | Current Pattern | Modern Migration |
|------------|----------------|----------------|
| `au-dropdown` | Portal container + z-index | `popover` attribute |
| `au-tooltip` | Position fixed + z-index | `popover` attribute |

**Popover API Benefits**:
- Automatic light-dismiss (click outside)
- Top-layer (no z-index issues)
- `showPopover()` / `hidePopover()` / `togglePopover()`
- Built-in keyboard accessibility

```html
<!-- Modern: Declarative popover -->
<button popovertarget="my-menu">Open</button>
<div id="my-menu" popover>Menu content</div>
```

---

## 🔒 Security Checklist

Before completing a component, verify:

- [ ] All `innerHTML` assignments use the `html` tagged template
- [ ] Trusted HTML (e.g. icons) is wrapped with `safe()`
- [ ] Slot content controlled (developer-provided) or auto-escaped via `html`
- [ ] No `eval()`, `Function()`, `document.write()`

---

## ♿ Accessibility Checklist

- [ ] Interactive elements have `tabindex="0"`
- [ ] Appropriate ARIA role (`role="button"`, `role="menuitem"`, etc.)
- [ ] `setupActivation()` for keyboard activation (Enter/Space)
- [ ] `aria-label` or associated label for screen readers
- [ ] States (`aria-checked`, `aria-expanded`, etc.) dynamically updated

---

## 🧪 Testing Checklist

- [ ] Unit test with `bun run scripts/test-isolated.js`
- [ ] E2E test for real browser interactions
- [ ] Coverage ≥97%
- [ ] Test memory leak: component added/removed from DOM leaves no listeners

---

## Agent Workflow: Adding a Component

```bash
# 1. Create component file
cat > src/components/au-counter.js << 'EOF'
import { AuElement, define } from '../core/AuElement.js';

export class AuCounter extends AuElement {
  static baseClass = 'au-counter';
  static observedAttributes = ['value'];
  
  render() {
    const value = parseInt(this.attr('value', '0'));
    this.innerHTML = `
      <button class="au-counter__dec">-</button>
      <span class="au-counter__value">${value}</span>
      <button class="au-counter__inc">+</button>
    `;
    this.#setupEvents();
  }
  
  #setupEvents() {
    this.listen(this.querySelector('.au-counter__dec'),
      'click', () => this.#change(-1));
    this.listen(this.querySelector('.au-counter__inc'),
      'click', () => this.#change(1));
  }
  
  #change(delta) {
    const current = parseInt(this.attr('value', '0'));
    this.setAttribute('value', current + delta);
    this.emit('au-change', { value: current + delta });
  }
}

define('au-counter', AuCounter);
EOF

# 2. Add to index.js exports (if needed)
# 3. Build framework
bun run build:framework
```

---

## Build System

### Build Commands

```bash
# Build everything (framework + app)
bun run build

# Or separately:
bun run build:framework   # → dist/
bun run build:app         # → app-dist/

# Serve
npx serve app-dist
```

### File Structure (Source)

```
AgentUI/
├── src/                    # Framework source
│   └── components/         # 50 components
│
├── dist/                   # Framework build
│   ├── agentui.esm.js      # Full ESM bundle (177 KB)
│   ├── agentui.min.js      # Full IIFE bundle (178 KB)
│   ├── agentui.css          # Combined CSS (94 KB)
│   ├── agentui.d.ts         # TypeScript definitions
│   ├── routes/              # Route Bundles (Modern)
│   │   ├── shell.js         # App Shell (Navbar, Theme, Bus) - 13 KB raw / 5 KB gzip
│   │   ├── home.js          # Home route components
│   │   ├── chunk-*.js       # Shared dependencies (deduplicated)
│   │   ├── route-deps.json  # Auto-generated page dependencies
│   │   └── page-components.json  # Debug: components per page
│   └── AGENTS.md            # Consumer documentation
│
├── app/                    # App source
│   ├── pages/              # One file per page
│   │   ├── home.html
│   │   ├── users.html
│   │   └── settings.html
│   └── index.html          # App shell
│
└── app-dist/               # App build (auto-generated)
    ├── routes/             # Auto-bundled from x-dependencies
    ├── pages/              # Copied HTML pages
    └── pages.json          # Manifest
```

### Automatic Bundle Dependencies

> **Build-time static analysis** detects which components each page uses.

The build process scans HTML for `<au-*>` tags and automatically:
1. **Generates `route-deps.json`** - Maps pages to their required route bundles
2. **Generates `page-components.json`** - Lists all au-* components found per page

```bash
bun run build:framework
# Output:
#   ✅ route-deps.json (19 pages with dependencies)
#   ✅ page-components.json (20 pages scanned)
```

**Generated `dist/routes/route-deps.json`:**
```json
{
  "enterprise": ["alerts", "buttons", "cards", "tabs"],
  "buttons": ["cards", "layout", "tabs"],
  "home": ["cards", "icons", "layout"]
}
```

**Runtime:** The demo loads this JSON and auto-fetches required routes before rendering:
```javascript
// Automatic dependency loading
const routeDeps = await fetch('dist/routes/route-deps.json').then(r => r.json());
async function loadRouteWithDeps(name) {
    await Promise.all((routeDeps[name] || []).map(dep => loadRoute(dep)));
    await loadRoute(name);
}
```

### Auto-Versioning

The build script automatically increments the version cache buster in `demo/index.html`:

```bash
bun run build:framework
# Output:
#   🔄 Updating version cache buster...
#   ✅ Version updated
```

---

## 🚀 Development Server

> **CRITICAL**: Use the project's official `server.js` for development and Lighthouse testing.

### Quick Start
```bash
# Start the Lighthouse-optimized dev server
bun server.js

# Server runs on port 5001 (auto-increments if busy)
# 🚀 http://localhost:5001/
```

### URL Routing

| URL | Maps To | Description |
|-----|---------|-------------|
| `/` | `/demo/index.html` | Main showcase |
| `/content/*` | `/demo/content/*` | Content fragments |
| `/sw.js` | `/demo/sw.js` | Service Worker |
| `/manifest.json` | `/demo/manifest.json` | PWA manifest |
| `/-/health` | - | Health check endpoint |
| `/-/clear-cache` | - | Clear browser cache |

### Server Features

The `server.js` is optimized for **high Lighthouse** scores:

1. **Cache-Control Headers** - 1 year for versioned assets, must-revalidate for HTML
2. **Gzip Compression** - Auto-compresses `.html`, `.css`, `.js`, `.json`, `.svg`
3. **Link Preload Headers** - Sends HTTP `Link` headers for critical resources
4. **Security** - Directory traversal protection, `X-Content-Type-Options: nosniff`

---

*This document is for framework developers. For building apps with AgentUI, see [AGENTS.md](./AGENTS.md).*

*Last updated: v0.1.65 - 2026-02-09*
