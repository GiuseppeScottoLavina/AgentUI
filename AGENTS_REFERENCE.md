# AgentUI — Full API Reference

> This is the detailed API reference. For workflow and quick patterns, see [AGENTS.md](./AGENTS.md).
> For a concise overview, see [llms.txt](./llms.txt).

---

## Quick Reference

### All Components (50)

| Category | Components | Common Attributes |
|----------|------------|-------------------|
| **Layout** | `au-container`, `au-stack`, `au-grid`, `au-navbar`, `au-sidebar`, `au-divider` | `gap="xs\|sm\|md\|lg"`, `direction="row\|column"` |
| **Form** | `au-button`, `au-input`, `au-textarea`, `au-checkbox`, `au-switch`, `au-radio`, `au-radio-group`, `au-dropdown`, `au-option`, `au-chip`, `au-form` | `variant`, `disabled`, `required`, `value` |
| **Display** | `au-card`, `au-tabs`, `au-tab`, `au-table`, `au-avatar`, `au-badge`, `au-progress`, `au-skeleton`, `au-alert`, `au-icon` | `variant="elevated\|outlined\|filled"` |
| **Feedback** | `au-modal`, `au-toast`, `au-toast-container`, `au-tooltip`, `au-spinner`, `au-confirm` | `duration`, `position` |
| **Performance** | `au-virtual-list`, `au-lazy`, `au-repeat` | `items`, `renderItem` |
| **Data** | `au-fetch` | `url`, `auto`, `interval` |
| **Enterprise** | `au-error-boundary` | `fallback` |
| **Utility** | `au-theme-toggle` | - |

### Attribute Cheatsheet

```html
<!-- Sizes -->
size="xs" | size="sm" | size="md" | size="lg" | size="xl"

<!-- Gaps (for layout) -->
gap="xs" (4px) | gap="sm" (8px) | gap="md" (16px) | gap="lg" (24px) | gap="xl" (32px)

<!-- Button variants -->
variant="filled" | variant="elevated" | variant="tonal" | variant="outlined" | variant="text" | variant="danger" | variant="primary" | variant="secondary"

<!-- Card variants -->
variant="elevated" | variant="outlined" | variant="filled"

<!-- Alert severities -->
severity="info" | severity="success" | severity="warning" | severity="error"

<!-- Direction (stack) -->
direction="row" | direction="column"

<!-- Alignment -->
align="start" | align="center" | align="end" | align="stretch"
justify="start" | justify="center" | justify="end" | justify="space-between"
```

---

## Component Details

### au-button
```html
<au-button variant="filled" size="md" disabled>Label</au-button>
```
| Attribute | Values | Default |
|-----------|--------|---------|
| `variant` | `filled`, `elevated`, `tonal`, `outlined`, `text`, `danger`, `primary`, `secondary`, `ghost` | `primary` |
| `size` | `sm`, `md`, `lg` | `md` |
| `disabled` | boolean | `false` |

**Events:** `click` (native)

**Icon Buttons (v0.1.28+):**
```html
<!-- Icon-only button -->
<au-button variant="ghost" size="sm">
    <au-icon name="delete" size="18"></au-icon>
</au-button>

<!-- Icon + text button -->
<au-button variant="filled">
    <au-icon name="save" size="18"></au-icon>
    <span>Save</span>
</au-button>
```

> **✅ Custom Children Preserved:** Icon children are preserved during render. Add icons directly as children, not via attribute.

> **✅ Custom Classes Preserved:** Agent-added classes like `my-custom-class` are preserved when component updates.

### au-input
```html
<au-input label="Email" type="email" placeholder="Enter email" required></au-input>
```
| Attribute | Values | Default |
|-----------|--------|---------|
| `type` | `text`, `email`, `password`, `number`, `tel`, `url` | `text` |
| `label` | string | - |
| `placeholder` | string | - |
| `value` | string | `""` |
| `disabled` | boolean | `false` |
| `required` | boolean | `false` |
| `variant` | `outlined`, `filled` | `outlined` |

**Events:** `au-input` (on keystroke), `au-change` (on blur)
**Accessibility:** Uses `for/id` association, `aria-label` fallback

### au-switch
```html
<au-switch label="Dark mode" checked></au-switch>
```
| Attribute | Values | Default |
|-----------|--------|---------|
| `label` | string | - |
| `checked` | boolean | `false` |
| `disabled` | boolean | `false` |

**Events:** `au-change` with `{ checked: boolean, source: 'user' }`
**Accessibility:** `role="switch"`, `aria-checked`, keyboard (Space/Enter)

### au-radio-group / au-radio
```html
<au-radio-group name="size" value="md">
    <au-radio value="sm">Small</au-radio>
    <au-radio value="md">Medium</au-radio>
    <au-radio value="lg">Large</au-radio>
</au-radio-group>
```
| Attribute | Values | Default |
|-----------|--------|---------|
| `name` | string (group) | - |
| `value` | string | - |
| `disabled` | boolean | `false` |

**Events:** `au-change` with `{ value: string, source: 'user' }` on group
**Accessibility:** `role="radiogroup"`, `role="radio"`, `aria-checked`

### au-dropdown
```html
<au-dropdown placeholder="Select option" value="1">
    <au-option value="1">Option 1</au-option>
    <au-option value="2">Option 2</au-option>
</au-dropdown>
```
| Attribute | Values | Default |
|-----------|--------|---------|
| `placeholder` | string | - |
| `value` | string | - |
| `disabled` | boolean | `false` |

**Events:** `au-change` with `{ value: string, label: string }`
**Accessibility:** `role="listbox"`, `aria-expanded`, full keyboard navigation (Arrows, Enter, Escape, Space)

### au-modal
```html
<au-modal id="dialog">
    <h2>Title</h2>
    <p>Content</p>
</au-modal>
```
**Methods:** `.open()`, `.close()`
**Events:** `au-open`, `au-close`

> **⚠️ LIFECYCLE**: `au-modal` captures its innerHTML as a raw string during `connectedCallback()`,
> BEFORE child custom elements render. It then injects this string into a native `<dialog>`.
> Custom elements inside (au-input, au-dropdown, etc.) **re-initialize correctly**.
> However, event listeners attached directly to children are **lost** — use **event delegation**.

**Pattern: Modal with Form**
```html
<au-modal id="task-modal" size="md">
  <au-input id="task-title" label="Title"></au-input>
  <au-dropdown id="task-priority" label="Priority">
    <au-option value="low">Low</au-option>
    <au-option value="medium" selected>Medium</au-option>
    <au-option value="high">High</au-option>
  </au-dropdown>
  <au-button id="save-btn" variant="filled">Save</au-button>
  <au-button id="cancel-btn" variant="text">Cancel</au-button>
</au-modal>
```
```javascript
const modal = document.getElementById('task-modal');

// Event delegation — events bubble through the dialog
modal.addEventListener('click', (e) => {
  const btn = e.target.closest('au-button');
  if (btn?.id === 'save-btn') {
    const title = modal.querySelector('#task-title').value;
    const priority = modal.querySelector('#task-priority').value;
    console.log({ title, priority });
    modal.close();
  }
  if (btn?.id === 'cancel-btn') modal.close();
});

// Listen for dropdown selection via bubbling custom event
modal.addEventListener('au-select', (e) => {
  console.log('Selected:', e.detail.value, e.detail.label);
});

modal.open();
```

### au-tabs / au-tab
```html
<au-tabs active="0" id="my-tabs">
    <au-tab>First</au-tab>
    <au-tab>Second</au-tab>
</au-tabs>
```
**Events:** `au-change` with `{ index: number }`

### au-stack (Flexbox layout)
```html
<au-stack direction="row" gap="md" align="center" justify="space-between">
    <div>Item 1</div>
    <div>Item 2</div>
</au-stack>
```

### au-grid (CSS Grid)
```html
<au-grid cols="3" gap="md">
    <au-card>1</au-card>
    <au-card>2</au-card>
    <au-card>3</au-card>
</au-grid>
```
**Responsive Behavior:** Grids with `cols="3"`, `cols="4"`, or `cols="6"` **automatically collapse to 1 column** on mobile (< 600px).

### au-virtual-list (10K+ items)
```javascript
const list = document.querySelector('au-virtual-list');
list.items = largeArray;
list.itemHeight = 50;
list.renderItem = (item) => `<div class="item">${item.name}</div>`;
```

---

## Responsive Breakpoints (MD3)

AgentUI follows **Material Design 3 Window Size Classes** for adaptive layouts:

| Class | Width | Components Behavior |
|-------|-------|---------------------|
| **Compact** | < 600px | `au-grid` → 1 column, `au-bottom-nav` visible, `au-drawer` → modal |
| **Medium** | 600-839px | `au-drawer` → rail mode |
| **Expanded** | ≥ 840px | `au-drawer` → expanded, `au-bottom-nav` hidden |

### Breakpoints API
```javascript
import { breakpoints } from 'agentui-wc/core/breakpoints';

// Reactive subscriptions (for components that need to react to changes)
const unsubscribe = breakpoints.subscribe((size) => {
    console.log(`Now in ${size} mode`); // 'compact', 'medium', 'expanded'
});

// Direct checks (live queries - always current, no caching)
if (breakpoints.isCompact) {
    // Mobile-specific logic
}

if (breakpoints.isMedium) {
    // Tablet-specific logic
}

if (breakpoints.isExpanded) {
    // Desktop-specific logic
}

// Cleanup when done
unsubscribe();
```

### Best Practices for Responsive Agents

1. **Don't hardcode media queries** - Use the centralized `breakpoints` utility
2. **Use CSS for simple responsive** - `au-grid` automatically collapses via CSS
3. **Subscribe for complex logic** - Components needing JS-driven adaptation should subscribe
4. **Clean up subscriptions** - Always unsubscribe in `disconnectedCallback()`

```javascript
// Example: Component that adapts to breakpoints
class MyComponent extends AuElement {
    #unsubscribe = null;

    connectedCallback() {
        super.connectedCallback();
        this.#unsubscribe = breakpoints.subscribe(() => {
            this.#updateLayout();
        });
    }

    disconnectedCallback() {
        this.#unsubscribe?.();
    }

    #updateLayout() {
        if (breakpoints.isCompact) {
            this.classList.add('mobile');
        } else {
            this.classList.remove('mobile');
        }
    }
}
```

---

## JavaScript API

### EventBus (LightBus) — Complete API

AgentUI's only communication layer. All inter-component messaging, state notifications, and framework events go through `bus`.

```javascript
import { bus, UIEvents, showToast } from 'agentui-wc';
```

#### Core Methods

```javascript
// Subscribe — returns unsubscribe function
const unsub = bus.on('my:event', (data) => console.log(data));
unsub(); // Always clean up when done

// Subscribe once — auto-unsubscribes after first call
bus.once('app:ready', (data) => initializeApp(data));

// Emit (synchronous, ~100M ops/sec)
bus.emit('my:event', { key: 'value' });

// Emit async (returns Promise<{ delivered: true }>)
await bus.emitAsync('my:event', { key: 'value' });

// Check if anyone is listening
if (bus.hasListeners('my:event')) { /* ... */ }
```

#### Wildcard Subscriptions

```javascript
// Listen to ALL ui events
bus.on('ui:*', (data) => console.log('UI event:', data));

// Matches: ui:toast:show, ui:modal:open, ui:theme:change, etc.
```

#### Request/Response (RPC Pattern)

```javascript
// Register a handler (service side)
const cleanup = bus.handle('user:getProfile', async (payload) => {
    const user = await fetchUser(payload.id);
    return { name: user.name, avatar: user.avatar };
});

// Call the handler (client side)
const profile = await bus.request('agentui', 'user:getProfile', { id: 42 });
console.log(profile.name); // "John"

// Remove handler
cleanup.unsubscribe();
// or: bus.unhandle('user:getProfile');
```

#### UIEvents Constants

Pre-defined event names used by framework components:

```javascript
UIEvents.TOAST_SHOW       // 'ui:toast:show'
UIEvents.TOAST_DISMISS    // 'ui:toast:dismiss'
UIEvents.MODAL_OPEN       // 'ui:modal:open'
UIEvents.MODAL_CLOSE      // 'ui:modal:close'
UIEvents.THEME_CHANGE     // 'ui:theme:change'
UIEvents.TAB_CHANGE       // 'ui:tab:change'
UIEvents.DROPDOWN_SELECT  // 'ui:dropdown:select'
UIEvents.FORM_SUBMIT      // 'ui:form:submit'
UIEvents.FORM_VALIDATE    // 'ui:form:validate'
```

Usage:
```javascript
// Listen for theme changes
bus.on(UIEvents.THEME_CHANGE, (data) => console.log('Theme:', data));

// Show toast via bus (same as showToast() helper)
bus.emit(UIEvents.TOAST_SHOW, { message: 'Saved!', severity: 'success' });
```

#### showToast() Helper

```javascript
showToast('Changes saved!', { severity: 'success', duration: 3000 });
showToast('Something went wrong', { severity: 'error' });
// severity: 'info' | 'success' | 'warning' | 'error'
```

#### Cleanup in Custom Components

**Always unsubscribe** in `disconnectedCallback` to prevent memory leaks:

```javascript
class MyComponent extends AuElement {
    #unsubs = [];

    connectedCallback() {
        super.connectedCallback();
        this.#unsubs.push(
            bus.on('data:updated', (data) => this.render(data)),
            bus.on('auth:change', (data) => this.updateAuth(data))
        );
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.#unsubs.forEach(fn => fn());
        this.#unsubs = [];
    }
}
```

#### Custom Event Naming Convention

Use namespaced colon-separated names: `domain:action`

```javascript
// ✅ Good — clear namespace and action
bus.emit('cart:item-added', { productId: 123 });
bus.emit('auth:login', { user });
bus.emit('settings:theme-changed', { theme: 'dark' });

// ❌ Bad — ambiguous, no namespace
bus.emit('update', data);
bus.emit('click', data);
```

### Keyboard Manager (ESC Stack)

Centralized LIFO stack for handling ESC key in modal-like components. When multiple modals/dropdowns are open, ESC closes only the **topmost** one.

```javascript
import { keyboard } from 'agentui-wc/core/keyboard';

class AuMyModal extends AuElement {
    #unsubEsc = null;

    open() {
        this.hidden = false;
        // Register ESC handler - returns unsubscribe function
        this.#unsubEsc = keyboard.pushEscapeHandler(this, () => this.close());
    }

    close() {
        this.hidden = true;
        // Always unsubscribe when closing
        this.#unsubEsc?.();
        this.#unsubEsc = null;
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.#unsubEsc?.();  // Cleanup on removal
    }
}
```

**API:**
| Method | Returns | Description |
|--------|---------|-------------|
| `pushEscapeHandler(element, callback)` | `() => void` | Register handler, returns unsubscribe function |
| `isTopmost(element)` | `boolean` | Check if element is top of stack |
| `stackDepth` | `number` | Current stack depth (for debugging) |

### Layer System (Z-Index)

Centralized z-index constants to avoid magic numbers. Auto-injected as CSS custom properties.

```javascript
import { Z_INDEX } from 'agentui-wc/core/layers';

// Use in JavaScript
this.style.zIndex = Z_INDEX.modal;
```

```css
/* Use in CSS (auto-injected as --z-* tokens) */
.my-modal { z-index: var(--z-modal); }
.my-tooltip { z-index: var(--z-tooltip); }
```

**Layer Hierarchy (lowest to highest):**
| Token | Value | Use For |
|-------|-------|---------|
| `base` | 1 | Default content |
| `sticky` | 100 | Sticky headers, FABs |
| `dropdown` | 1000 | Dropdowns, menus, popovers |
| `drawer` | 1100 | Navigation drawers |
| `modal` | 1200 | Modal dialogs |
| `toast` | 1300 | Toast notifications |
| `tooltip` | 1400 | Tooltips |
| `overlay` | 9999 | Full-screen overlays |
| `devtools` | 999999 | Agent dev tools (always on top) |

### Confirm Dialog (Agent-Friendly)
```javascript
import { auConfirm } from 'agentui-wc';

// Simple confirm - returns Promise<boolean>
const ok = await auConfirm('Delete this item?');
if (ok) deleteItem();

// With options
const confirmed = await auConfirm('Are you sure?', {
    title: 'Confirm Delete',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    variant: 'danger'  // 'primary' | 'danger' | 'warning'
});
```

### Data Fetcher Component
```html
<!-- Declarative data fetching with automatic states -->
<au-fetch url="/api/users" id="users">
    <template slot="loading"><au-skeleton lines="3"></au-skeleton></template>
    <template slot="error"><au-alert severity="error">${error}</au-alert></template>
    <template slot="empty"><p>No users found</p></template>
</au-fetch>

<script type="module">
const fetcher = document.getElementById('users');

// Set render function for array data
fetcher.renderItem = (user) => `
    <au-card variant="outlined">
        <strong>${user.name}</strong> - ${user.email}
    </au-card>
`;

// Programmatic access
fetcher.data;        // Current data
fetcher.state;       // 'idle' | 'loading' | 'success' | 'error'
fetcher.refetch();   // Re-fetch data

// Events
fetcher.addEventListener('au-success', (e) => {
    console.log('Data loaded:', e.detail.data);
});
</script>
```

### Form State Management
```javascript
import { createFormState } from 'agentui-wc';

const form = document.querySelector('au-form');
const state = createFormState(form, {
    email: { required: true, type: 'email' },
    password: { required: true, minLength: 8 },
    name: { maxLength: 50 }
});

// Check validation
console.log(state.isValid);     // true if all fields valid
console.log(state.isDirty);     // true if any field changed

// Per-field state
state.fields.email.value;       // Current value
state.fields.email.error;       // Error message or null
state.fields.email.touched;     // true after blur
state.fields.email.dirty;       // true if changed from initial

// Actions
state.validate();               // Validate all, mark touched
state.getValues();              // { email: '...', password: '...' }
state.getErrors();              // { email: null, password: 'Min 8 chars' }
state.reset();                  // Reset to initial values
```


### Toast Notifications
```javascript
import { showToast } from 'agentui-wc';

showToast('Operation successful', {
    severity: 'success',  // 'info' | 'success' | 'warning' | 'error'
    duration: 3000       // ms, 0 for persistent
});
```

### Theme Control
```javascript
import { Theme } from 'agentui-wc';

Theme.init();           // Auto-detect or use saved
Theme.set('dark');      // 'light' | 'dark' | 'system'
Theme.toggle();         // Switch light/dark
const current = Theme.get();
```

### View Transitions
```javascript
import { transition } from 'agentui-wc';

await transition(() => {
    document.querySelector('#content').innerHTML = newHTML;
});
```

---

## Cache Control (PWA)

AgentUI includes a Service Worker with intelligent caching. Control via console:

```javascript
// Clear all caches and reload
await AgentUICache.clear();

// Get cache status
await AgentUICache.status();
// Returns: { version: "0.1.0", caches: { "agentui-precache-2.0.18": 5 } }

// Force check for updates
await AgentUICache.update();

// Prefetch URLs into cache
await AgentUICache.prefetch(['/assets/image.webp', '/data.json']);
```

---

## PWA Development for Agents

> **Complete guide for AI agents building Progressive Web Apps with AgentUI.**

### 1. Service Worker Setup

Copy this template to your app root as `sw.js`:

```javascript
// sw.js - AgentUI Service Worker Template
const VERSION = '1.0.0';  // Bump on each deploy
const CACHE_PREFIX = 'myapp';
const PRECACHE_NAME = `${CACHE_PREFIX}-precache-${VERSION}`;
const RUNTIME_NAME = `${CACHE_PREFIX}-runtime-${VERSION}`;

// Critical assets (precached on install)
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/dist/agentui.css',
    '/dist/routes/shell.js',
    '/dist/routes/home.js',
    '/favicon.png'
];

// INSTALL: Precache critical assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(PRECACHE_NAME)
            .then(cache => cache.addAll(PRECACHE_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// ACTIVATE: Cleanup old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(names => 
            Promise.all(names
                .filter(n => n.startsWith(CACHE_PREFIX) && n !== PRECACHE_NAME && n !== RUNTIME_NAME)
                .map(n => caches.delete(n))
            )
        ).then(() => self.clients.claim())
    );
});

// FETCH: Route requests
self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;
    
    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;
    
    // HTML: Network-first (always fresh)
    if (request.destination === 'document') {
        event.respondWith(networkFirst(request));
        return;
    }
    
    // JS/CSS: Stale-while-revalidate (fast + fresh)
    event.respondWith(staleWhileRevalidate(request));
});

async function networkFirst(request) {
    try {
        const response = await fetch(request);
        const cache = await caches.open(PRECACHE_NAME);
        cache.put(request, response.clone());
        return response;
    } catch {
        return caches.match(request) || caches.match('/');
    }
}

async function staleWhileRevalidate(request) {
    const cache = await caches.open(RUNTIME_NAME);
    const cached = await cache.match(request);
    
    const fetchPromise = fetch(request).then(response => {
        if (response.ok) cache.put(request, response.clone());
        return response;
    }).catch(() => null);
    
    return cached || fetchPromise || caches.match('/');
}
```

### 2. Register Service Worker

Add to your `index.html` (after app shell loads):

```html
<script>
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('SW registered:', reg.scope))
        .catch(err => console.error('SW failed:', err));
}
</script>
```

### 3. Caching Strategy Guide

| Asset Type | Strategy | Why |
|------------|----------|-----|
| **HTML** | Network-first | Always get fresh content |
| **JS/CSS/Images** | Stale-while-revalidate | Fast load + background update |
| **Fonts (woff2)** | Cache-first | Immutable, never changes |
| **API calls** | Network-only | Data must be fresh |

### 4. App Shell + Service Worker Integration

```
Initial Load Flow:
─────────────────────────────────────────────────────────
Browser → SW Installed? ─No→ Network → Cache critical assets
                        │
                       Yes
                        │
                        ▼
              Cache → Return shell.js (instant)
                        │
                        ▼
              Render App Shell (navbar, theme)
                        │
                        ▼
              Lazy load route (home.js)
                        │
                        ▼
              Background: Check for SW update
```

### 5. PWA Checklist for Agents

```
[ ] manifest.json created (name, icons, theme_color)
[ ] sw.js in app root  
[ ] PRECACHE_ASSETS includes shell.js + CSS
[ ] VERSION bumped on each deploy
[ ] Meta tags: theme-color, apple-mobile-web-app-capable
[ ] Favicon + PWA icons (192x192, 512x512)
[ ] HTTPS enabled (required for SW)
[ ] Tested offline mode
```

### 6. Manifest Template

```json
{
  "name": "My AgentUI App",
  "short_name": "MyApp",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFFBFE",
  "theme_color": "#6750A4",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### 7. Agent Workflow: Creating a PWA

```bash
# 1. Copy SW template
cp demo/sw.js my-app/sw.js

# 2. Update PRECACHE_ASSETS with your routes
# 3. Create manifest.json
# 4. Add meta tags to index.html
# 5. Register SW in index.html
# 6. Build and test
bun run build
```

---

## Accessibility Compliance (WCAG 2.1)

All form components include proper ARIA attributes:

| Component | Role | Key Attributes |
|-----------|------|----------------|
| `au-checkbox` | `checkbox` | `aria-checked="true\|false\|mixed"`, `tabindex` |
| `au-switch` | `switch` | `aria-checked`, `aria-label` |
| `au-radio` | `radio` | `aria-checked`, `tabindex` |
| `au-radio-group` | `radiogroup` | - |
| `au-dropdown` | trigger + listbox | `aria-haspopup`, `aria-expanded` |
| `au-button` | `button` | `tabindex` |
| `au-input` | - | `for/id` label association, `aria-label` fallback |

**Keyboard navigation:** All interactive components support `Tab`, `Space`, `Enter`.

---

## 🎯 Common Patterns for AI Agents

> **Practical examples based on real agent feedback.** These patterns solve the most common issues agents encounter.

### 1. Dynamic Content Updates

```html
<!-- ✅ CORRECT: Update button text directly -->
<au-button id="submit-btn">Submit</au-button>
<script>
document.getElementById('submit-btn').textContent = 'Processing...';
</script>

<!-- ❌ AVOID: Nested elements for dynamic content -->
<au-button><span id="label">Submit</span></au-button>
```

**Why?** AgentUI components use `textContent` directly. Nested elements break internal structure.

### 2. i18n Integration

```html
<!-- ✅ Modern: Declarative i18n with data attribute -->
<au-button data-i18n="common.submit">Submit</au-button>
<au-input label="Email" data-i18n-label="form.email"></au-input>

<script>
function updateTranslations(t) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-label]').forEach(el => {
        el.setAttribute('label', t(el.dataset.i18nLabel));
    });
}
</script>
```

### 3. Form Handling

```html
<au-input id="email" label="Email" type="email"></au-input>
<au-button id="submit">Submit</au-button>

<script>
const emailInput = document.getElementById('email');
const submitBtn = document.getElementById('submit');

// Listen for value changes
emailInput.addEventListener('au-change', (e) => {
    console.log('Value:', e.detail.value);
});

// Get current value
const value = emailInput.value;

// Form validation
emailInput.addEventListener('au-validate', (e) => {
    if (!e.detail.valid) {
        console.log('Error:', e.detail.message);
    }
});
</script>
```

### 4. Modal & Toast Usage

```javascript
import { bus, UIEvents, showToast } from 'agentui-wc';

// Show toast notification
showToast('Changes saved!', { severity: 'success', duration: 3000 });

// Alternative: Direct bus emit
bus.emit(UIEvents.TOAST_SHOW, { 
    message: 'Error occurred', 
    severity: 'error' 
});

// Open modal programmatically
document.querySelector('au-modal').open();

// Close modal
document.querySelector('au-modal').close();

// Listen for modal close
document.querySelector('au-modal').addEventListener('au-close', () => {
    console.log('Modal closed');
});
```

### 5. Error Handling

```javascript
// Check for component errors (agent debugging)
const errors = window.AgentUIAgent.getErrors();
console.log('Errors:', errors);

// Check specific component
if (window.AgentUIAgent.hasError('au-input', 'A11Y_MISSING_LABEL')) {
    console.log('Input missing label!');
}

// Reset errors
window.AgentUIAgent.reset();

// Listen for validation errors
document.querySelector('au-input').addEventListener('au-error', (e) => {
    console.log('Validation error:', e.detail.message);
});
```

### 6. Runtime Component Discovery

```javascript
// Query component capabilities at runtime
const buttonInfo = customElements.get('au-button')?.describe?.();
console.log(buttonInfo);
// { name: 'au-button', props: [...], events: [...], examples: [...] }

// Check if component is registered
if (customElements.get('au-modal')) {
    // Safe to use au-modal
}
```

---

## Best Practices for AI Agents

### DO ✅
1. **Use semantic components** - `<au-input label="Email">` not `<input placeholder="Email">`
2. **Use layout components** - `<au-stack gap="md">` not manual CSS flexbox
3. **Use declarative HTML** - Attributes over JavaScript for configuration
4. **Always include labels** - For accessibility compliance
5. **Use `variant` attributes** - For consistent MD3 styling
6. **Use `au-virtual-list`** - For lists with 100+ items
7. **Use `au-lazy`** - For below-the-fold heavy components

### DON'T ❌
1. **Don't use raw CSS for layout** - Use `au-stack`, `au-grid`, `au-container`
2. **Don't forget `variant`** - Buttons/cards need explicit variant
3. **Don't manipulate Shadow DOM** - Components manage their own internals
4. **Don't use inline styles for spacing** - Use `gap` attributes
5. **Don't create custom form controls** - Use the provided accessible ones

### CSS Fallback Pattern ⚡
Layout components (`au-stack`, `au-grid`) have **CSS fallback styles** that apply BEFORE JavaScript loads. This prevents Flash of Unstyled Content (FOUC).

```css
/* CSS attribute selectors work immediately */
au-stack { display: flex; flex-direction: column; gap: 16px; }
au-stack[gap="lg"] { gap: 24px; }

au-grid { display: grid; gap: 16px; }
au-grid[cols="3"] { grid-template-columns: repeat(3, 1fr); }
```

**Why this matters:** HTML is parsed before JavaScript executes. Without CSS fallback, layout elements have no styling until custom element upgrade completes.

### Common Mistakes to Avoid
```html
<!-- WRONG: Missing variant -->
<au-button>Click</au-button>

<!-- CORRECT: Explicit variant -->
<au-button variant="filled">Click</au-button>

<!-- WRONG: Raw div layout -->
<div style="display: flex; gap: 16px;">

<!-- CORRECT: Use au-stack -->
<au-stack direction="row" gap="md">

<!-- WRONG: Placeholder only (accessibility issue) -->
<au-input placeholder="Email"></au-input>

<!-- CORRECT: Use label -->
<au-input label="Email"></au-input>
```

### XSS Prevention Patterns ⚠️

AgentUI provides centralized utilities for safe HTML rendering. **Always use the `html` tagged template for dynamic content — it auto-escapes all interpolated values.**

```javascript
// Import the html tagged template (RECOMMENDED)
import { html, safe } from 'agentui-wc';

// ✅ SAFE: html`` auto-escapes all interpolated values
const userName = '<script>alert("xss")</script>';
element.innerHTML = html`<span>${userName}</span>`;
// Result: <span>&lt;script&gt;alert("xss")&lt;/script&gt;</span>

// ✅ SAFE: Use safe() ONLY for trusted HTML you control
const icon = '<au-icon name="home"></au-icon>';
element.innerHTML = html`<div>${safe(icon)}</div>`;
// Result: <div><au-icon name="home"></au-icon></div>

// ✅ SAFE: Nested templates compose correctly
const items = ['One', 'Two', '<script>evil</script>'];
element.innerHTML = html`<ul>${items.map(i => html`<li>${i}</li>`)}</ul>`;
// Result: <ul><li>One</li><li>Two</li><li>&lt;script&gt;evil&lt;/script&gt;</li></ul>

// ✅ SAFE: Use textContent for plain text
element.textContent = userName;

// ❌ UNSAFE: Never use innerHTML with raw template literals
element.innerHTML = `<span>${userName}</span>`; // XSS RISK!
```

| Pattern | When to Use |
|---------|-------------|
| `` html`...${val}...` `` | **Recommended.** Dynamic values in innerHTML — auto-escaped |
| `safe(trustedHTML)` | Opt-out for HTML you trust (e.g., component output) |
| `escapeHTML(str)` | Lower-level utility for manual escaping |
| `textContent` | Displaying plain text (no HTML needed) |
| `createElement` | Creating elements with user-provided attributes |

**Components using these patterns:** `au-datatable`, `au-api-table`, `au-avatar`, `au-fetch`

---

## File Structure
```
dist/
├── agentui.esm.js       # Full ESM bundle (177 KB)
├── agentui.min.js       # Full IIFE bundle (178 KB)
├── agentui.css          # Combined CSS (94 KB)
├── agentui.d.ts         # TypeScript definitions
├── routes/              # Route Bundles (Modern)
│   ├── shell.js         # App Shell (Navbar, Theme, Bus) - 13 KB raw / 5 KB gzip
│   ├── home.js          # Home route components
│   ├── chunk-*.js       # Shared dependencies (deduplicated)
│   ├── route-deps.json  # Auto-generated page dependencies
│   └── page-components.json  # Debug: components per page
└── AGENTS.md            # This file
```

---

## App Shell Architecture 

For Modern performance, use the **App Shell** pattern. Load the critical shell first, then lazily load routes.

```html
<head>
    <link rel="preload" as="style" href="dist/agentui.css">
    <link rel="stylesheet" href="dist/agentui.css"
          media="print" onload="this.media='all'">
    <noscript><link rel="stylesheet" href="dist/agentui.css"></noscript>
</head>
<body>
    <!-- Global Shell Components -->
    <au-navbar>...</au-navbar>
    <au-toast-container></au-toast-container>

    <!-- App Router -->
    <au-router base="/app-dist/pages" default="home"></au-router>

    <!-- Loader Script -->
    <script type="module">
        // 1. Load Shell (Navbar, Theme, EventBus, Toasts)
        await import('./dist/routes/shell.js');
        
        // 2. Initialize Router (which loads pages + their bundles)
        const router = document.querySelector('au-router');
        
        // Helper to manually load a route bundle if needed
        window.loadRoute = async (name) => {
            await import(`./dist/routes/${name}.js`);
        };
    </script>
</body>
```

| Bundle | Content | Size (gzip) |
|--------|---------|-------------|
| `shell.js` | Navbar, Theme, EventBus, Toasts | ~5 KB gzip |
| `home.js` | Landing page components | ~2 KB |
| `forms.js` | (Example) Input, Button, Checkbox | ~7 KB |

**Why this is Modern:** 
- The user only downloads `shell.js` (small) to see the UI.
- Page bundles (`home.js`) are only downloaded when navigating to that page.
- Common code (EventBus, BaseClass) is shared via `chunk-*.js` files automatically.

---

## Performance Metrics
- **Bundle size:** 177 KB full / ~20 KB initial shell (gzipped: 60 KB total / ~20 KB initial)
- **Lighthouse:** 100% Performance, 100% Accessibility, 100% SEO, 100% Best Practices
- **EventBus:** ~100M ops/sec (LightBus emitSync)
- **Virtual List:** Handles 10K+ items at 60fps
- **First paint:** <100ms (precached assets)

---

## Performance Patterns (Modern)

> **Critical patterns for 100% Lighthouse scores and excellent UX.**

### 1. Skeleton Loading (Perceived Performance)

Use `au-skeleton` to show content placeholders while loading:

```html
<!-- Before data loads -->
<au-card>
    <au-skeleton variant="text" width="60%"></au-skeleton>
    <au-skeleton variant="text" lines="3"></au-skeleton>
    <au-skeleton variant="rectangular"></au-skeleton>
</au-card>

<!-- Replace with real content when ready -->
<au-card>
    <h3>User Profile</h3>
    <p>Actual content...</p>
    <au-button>Edit</au-button>
</au-card>
```

| Attribute | Values | Default |
|-----------|--------|---------|
| `variant` | `text`, `circular`, `rectangular` | `text` |
| `width` | CSS width | `100%` |
| `lines` | Number of text lines | `1` |
| `animated` | boolean | `true` |

### 2. Lazy Loading (Below-the-fold)

Use `au-lazy` to defer loading of non-critical content:

```html
<!-- Content loads only when scrolled into view -->
<au-lazy threshold="200px">
    <au-card>
        <img src="heavy-image.webp">
        <p>This loads lazily</p>
    </au-card>
</au-lazy>

<!-- With loading placeholder -->
<au-lazy placeholder="<au-skeleton variant='rectangular'></au-skeleton>">
    <img src="hero.webp" alt="Hero">
</au-lazy>
```

| Attribute | Description | Default |
|-----------|-------------|---------|
| `threshold` | Distance from viewport to trigger load | `100px` |
| `placeholder` | HTML to show while loading | (empty) |

### 3. Resource Hints (Preload Critical Assets)

Add to `<head>` for faster loading:

```html
<head>
    <!-- Preconnect to external origins (fonts, CDN) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    
    <!-- Preload critical assets (above-the-fold) -->
    <link rel="preload" href="/dist/agentui.css" as="style">
    <link rel="preload" href="/dist/routes/shell.js" as="script" crossorigin>
    <link rel="preload" href="/assets/logo.webp" as="image" type="image/webp">
    
    <!-- Prefetch likely next pages (after current page loads) -->
    <link rel="prefetch" href="/dist/routes/home.js">
</head>
```

| Hint | When to Use | Priority |
|------|-------------|----------|
| `preconnect` | External domains you'll fetch from | 🔴 High |
| `preload` | Critical above-the-fold assets | 🔴 High |
| `prefetch` | Next likely navigation | 🟢 Low |
| `dns-prefetch` | External domains (fallback) | 🟢 Low |

### 4. Core Web Vitals Optimization

| Metric | Target | How to Achieve |
|--------|--------|----------------|
| **LCP** (Largest Contentful Paint) | < 2.5s | Preload hero image, inline critical CSS |
| **FID** (First Input Delay) | < 100ms | Code split, defer non-critical JS |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Set dimensions on images, reserve space |

```html
<!-- LCP: Preload hero image with fetchpriority -->
<link rel="preload" as="image" href="/hero.webp" fetchpriority="high">

<!-- CLS: Always set dimensions -->
<img src="photo.webp" width="800" height="600" alt="...">

<!-- CLS: Reserve space for dynamic content -->
<div style="min-height: 300px;">
    <au-lazy><au-card>...</au-card></au-lazy>
</div>
```

### 5. View Transitions (Smooth Navigation)

Use the View Transitions API for cinematic page changes:

```javascript
import { transition, transitionNamed } from 'agentui-wc';

// Basic transition
await transition(() => {
    document.getElementById('content').innerHTML = newHTML;
});

// Named transition with custom animation
await transitionNamed(() => {
    router.navigate('/users');
}, { name: 'page-slide' });
```

```css
/* Custom transition animation */
::view-transition-old(page-slide) {
    animation: slide-out 0.3s ease-out;
}
::view-transition-new(page-slide) {
    animation: slide-in 0.3s ease-out;
}
```

### 6. Virtual List (Large Datasets)

For lists with 100+ items, use `au-virtual-list`:

```javascript
const list = document.querySelector('au-virtual-list');
list.items = largeArray;        // 10K+ items OK
list.itemHeight = 48;           // Fixed height for calculation
list.renderItem = (item, index) => `
    <div class="list-item">
        <span>${item.name}</span>
        <span>${item.email}</span>
    </div>
`;
```

### 7. Speculative Route Preloading

Preload routes on hover for instant navigation:

```javascript
// Add to navigation links
document.querySelectorAll('a[data-route]').forEach(link => {
    link.addEventListener('mouseenter', () => {
        const route = link.dataset.route;
        // Prefetch route bundle
        import(`/dist/routes/${route}.js`);
    });
});
```

### 8. CLS Prevention (Built-In — Zero Config)

AgentUI CSS includes `:not(:defined)` rules for **all 28 components**. These pre-define `display` and `min-height` before JS registers the custom elements, preventing Cumulative Layout Shift (CLS = 0).

**You get this for free — just import `agentui.css`.** No additional action needed.

For additional CLS prevention on dynamic content:

```css
/* Reserve space for async-loaded content areas */
#main-content {
    contain: layout style;
    min-height: 500px;
}

/* SOTA 2026: Lazy-render off-screen content */
/* Up to 7x rendering boost for long lists */
.card-list > au-card {
    content-visibility: auto;
    contain-intrinsic-size: auto 200px;
}

/* Prevent scrollbar CLS */
.scrollable-container {
    scrollbar-gutter: stable;
}
```

### 9. Optimized Asset Loading

Use CSS preload and async JS for zero render-blocking:

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Your app description">
  <title>My App</title>

  <!-- CSS: preload + async (non-render-blocking) -->
  <link rel="preload" as="style" href="https://unpkg.com/agentui-wc@latest/dist/agentui.css">
  <link rel="stylesheet" href="https://unpkg.com/agentui-wc@latest/dist/agentui.css"
        media="print" onload="this.media='all'">
  <noscript><link rel="stylesheet" href="https://unpkg.com/agentui-wc@latest/dist/agentui.css"></noscript>

  <!-- JS: async prevents render-blocking -->
  <script type="module" src="https://unpkg.com/agentui-wc@latest/dist/agentui.esm.js" async></script>
  <!-- Font: MD3 default -->
  <style>
    @font-face { font-family: 'Roboto'; font-display: swap; src: url('https://fonts.gstatic.com/s/roboto/v47/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWubEbVmUiA8.woff2') format('woff2'); }
    body { font-family: var(--md-sys-typescale-font); margin: 0; }
  </style>
</head>
```

> **Why `media="print" onload`?** A regular `<link rel="stylesheet">` blocks rendering even with preload.
> The `media="print"` trick loads CSS without blocking, then `onload` switches it to `all`.
> The built-in `:not(:defined)` rules prevent CLS during this async load.

**Font loading:** The `@font-face` with `font-display: swap` prevents invisible text during font load.

### 10. Accessibility Checklist (Lighthouse 100)

| Rule | Example |
|------|---------|
| Set `lang` on `<html>` | `<html lang="en">` |
| Add `<meta name="description">` | Always include |
| `aria-label` on icon-only buttons | `<au-button aria-label="Close">✕</au-button>` |
| Single `<h1>` per page | Correct heading hierarchy |
| `alt` on all `<img>` tags | `<img alt="User avatar">` |
| Color contrast ≥ 4.5:1 | MD3 tokens handle this by default |

---

## Error Handling Patterns

### 1. Runtime Error Collection

AgentUI logs all component errors to `window.__AGENTUI_ERRORS__`:

```javascript
// In E2E tests or debug console
const errors = window.__AGENTUI_ERRORS__ || [];
errors.forEach(err => {
    console.error(`[${err.component}] ${err.message}`, err.details);
});
```

### 2. Async Error Handling

Wrap async operations with proper error handling:

```javascript
async function loadUserData() {
    try {
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        // Show user-friendly error
        showToast('Failed to load data. Please retry.', { severity: 'error' });
        // Log for debugging
        console.error('loadUserData failed:', error);
        return null;
    }
}
```

### 3. Error Boundary Pattern

Create a wrapper to catch render errors:

```javascript
function safeRender(container, renderFn) {
    try {
        container.innerHTML = renderFn();
    } catch (error) {
        container.innerHTML = `
            <au-alert severity="error">
                Something went wrong. Please refresh the page.
            </au-alert>
        `;
        console.error('Render error:', error);
    }
}

// Usage
safeRender(document.getElementById('content'), () => {
    return `<au-card>${userData.name}</au-card>`;
});
```

### 4. Network Error Handling

```javascript
// Fetch with timeout and retry
async function fetchWithRetry(url, options = {}, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            
            clearTimeout(timeout);
            if (response.ok) return response;
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        }
    }
}
```

### 5. Agent Debugging Tips

```javascript
// Enable verbose logging
window.AGENTUI_DEBUG = true;

// Check component registration
customElements.get('au-button'); // Returns class or undefined

// Inspect component state
const btn = document.querySelector('au-button');
console.log(btn.getAttribute('variant'), btn.disabled);

// Force component re-render
btn.render?.();
```

### 6. Global Error Boundary
```javascript
// Catch all unhandled errors
window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
    showToast('Something went wrong', { severity: 'error' });
    event.preventDefault();
});

// Catch unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled rejection:', event.reason);
    showToast('Network or async error', { severity: 'warning' });
});
```

### 7. API Error Handling Service
```javascript
// services/api.js
export async function fetchAPI(endpoint, options = {}) {
    try {
        const res = await fetch(`/api${endpoint}`, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.message || `HTTP ${res.status}`);
        }
        return res.json();
    } catch (err) {
        showToast(err.message || 'Network error', { severity: 'error' });
        throw err;
    }
}

// Usage
const users = await fetchAPI('/users');
```

---

## Page-Based App Development 

> **For AI Agents building apps with AgentUI.** This is the recommended architecture.

### Creating a New Page

Create a single file in `app/pages/`:

```html
<!-- app/pages/users.html -->
<au-page route="users" title="Users">
  <script type="x-dependencies">
    au-table
    au-button
    au-stack
    au-tabs
  </script>
  
  <template>
    <h1 class="page-title">Users</h1>
    <au-table id="users-table"></au-table>
    <au-button onclick="addUser()">Add User</au-button>
  </template>
</au-page>
```

### Build & Run

```bash
# Build everything (framework + app)
bun run build

# Or separately:
bun run build:framework   # → dist/
bun run build:app         # → app-dist/

# Serve
npx serve app-dist
```

### File Structure

```
AgentUI/
├── src/                    # Framework source
│   └── components/         # 50 components
│
├── dist/                   # Framework build
│   ├── agentui.esm.js      # Full bundle
│   ├── agentui.css         # CSS
│   └── components/         # Per-component builds
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

### How It Works

1. **Agent creates** `app/pages/mypage.html` with `<au-page>` component
2. **Build extracts** dependencies from `<script type="x-dependencies">`
3. **Build generates** route bundle in `app-dist/routes/mypage.js`
4. **Router lazy-loads** page HTML and route bundle on navigation

### au-router

```html
<au-router base="/app-dist/pages" default="home"></au-router>
```

| Attribute | Description | Default |
|-----------|-------------|---------|
| `base` | Path to pages directory | `/app/pages` |
| `default` | Default route when no hash | `home` |

**Events:** `au-route-change`, `au-page-loaded`, `au-page-error`

**Methods:** `.navigate(route)`

### au-page

```html
<au-page route="mypage" title="My Page">
  <script type="x-dependencies">au-button, au-card</script>
  <template><!-- content --></template>
</au-page>
```

| Attribute | Description |
|-----------|-------------|
| `route` | Route name (used in URL hash) |
| `title` | Page title (set on navigation) |

---

## Agent Workflow: Adding a Page

```bash
# 1. Create page file
cat > app/pages/dashboard.html << 'EOF'
<au-page route="dashboard" title="Dashboard">
  <script type="x-dependencies">
    au-card
    au-stack
    au-grid
  </script>
  <template>
    <h1 class="page-title">Dashboard</h1>
    <au-grid cols="3" gap="md">
      <au-card variant="elevated">Widget 1</au-card>
      <au-card variant="elevated">Widget 2</au-card>
      <au-card variant="elevated">Widget 3</au-card>
    </au-grid>
  </template>
</au-page>
EOF

# 2. Build
bun run build:app

# 3. Navigate to: http://localhost:5001/app-dist/#dashboard
```

---

## State Management for Complex Apps

> **For apps with shared state across components and pages.**

### Global Store Pattern
```javascript
// store/index.js - Centralized state with bus notifications
import { createStore, bus } from 'agentui-wc';

const store = createStore({
    user: null,
    items: [],
    loading: false
});

// Derived values (plain getters)
export const getItemCount = () => store.get().items.length;
export const isAuthenticated = () => store.get().user !== null;

// Actions
export async function fetchItems() {
    store.set({ loading: true });
    try {
        const data = await fetch('/api/items').then(r => r.json());
        store.set({ items: data, loading: false });
    } catch (err) {
        store.set({ loading: false });
    }
}

export function login(userData) {
    store.set({ user: userData });
    localStorage.setItem('user', JSON.stringify(userData));
    bus.emit('auth:change', { user: userData });
}

export function logout() {
    store.set({ user: null });
    localStorage.removeItem('user');
    bus.emit('auth:change', { user: null });
}

// Restore on load
const savedUser = localStorage.getItem('user');
if (savedUser) store.set({ user: JSON.parse(savedUser) });

export { store };
```

### Binding State to Components
```javascript
import { store } from './store/index.js';

// Subscribe to all state changes
store.subscribe((state) => {
    document.querySelector('#user-name').textContent = state.user?.name || 'Guest';
    document.querySelector('#login-btn').hidden = !!state.user;
    document.querySelector('#logout-btn').hidden = !state.user;
    document.querySelector('#spinner').hidden = !state.loading;
});
```

### State in Custom Components
```javascript
export class AuUserCard extends AuElement {
    #unsubscribe = null;

    connectedCallback() {
        super.connectedCallback();
        // Subscribe to store changes
        this.#unsubscribe = store.subscribe((state) => {
            this.user = state.user;
            this.render();
        });
    }
    
    disconnectedCallback() {
        super.disconnectedCallback();
        this.#unsubscribe?.();
    }
}
```

---

## Data-Driven Components

> **Components that render dynamic data from arrays/objects.**

### au-repeat (Declarative Lists)
```html
<au-repeat id="user-list"></au-repeat>

<script type="module">
const list = document.getElementById('user-list');

// Set data and render template
list.items = await fetch('/api/users').then(r => r.json());
list.renderItem = (user, index) => `
    <au-card variant="outlined">
        <au-stack direction="row" gap="md" align="center">
            <au-avatar initials="${user.name[0]}" size="md"></au-avatar>
            <au-stack gap="xs">
                <strong>${user.name}</strong>
                <small>${user.email}</small>
            </au-stack>
            <au-button variant="text" data-id="${user.id}">Edit</au-button>
        </au-stack>
    </au-card>
`;

// Listen for item events
list.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-id]');
    if (btn) console.log('Edit user:', btn.dataset.id);
});
</script>
```

### au-table (Data Tables with Sorting)
```html
<au-table id="data-table"></au-table>

<script type="module">
const table = document.getElementById('data-table');

// Configure columns
table.columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'actions', label: '', render: (row) => `
        <au-button variant="text" size="sm" data-action="edit" data-id="${row.id}">
            <au-icon name="edit"></au-icon>
        </au-button>
    `}
];

// Set data
table.data = await fetch('/api/users').then(r => r.json());

// Handle actions
table.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (btn?.dataset.action === 'edit') {
        console.log('Edit:', btn.dataset.id);
    }
});
</script>
```

### au-virtual-list (10K+ Items)
```javascript
const list = document.querySelector('au-virtual-list');
list.items = hugeArray;      // 10,000+ items OK
list.itemHeight = 56;        // Fixed height for virtualization
list.renderItem = (item) => `
    <div class="list-row">${item.name}</div>
`;
```

## Architecture for Large Apps (10+ Pages)

> **Recommended structure for complex multi-page applications.**

### Directory Structure
```
my-app/
├── index.html           # App shell (minimal HTML)
├── sw.js                # Service Worker
├── manifest.json        # PWA manifest
├── store/
│   └── index.js         # Global state (createStore + bus)
├── pages/
│   ├── home.js          # Lazy-loaded route modules
│   ├── users.js
│   ├── settings.js
│   └── not-found.js
├── components/
│   ├── user-card.js     # Reusable custom components
│   ├── data-table.js
│   └── nav-menu.js
├── services/
│   └── api.js           # API client with error handling
└── assets/
    ├── logo.webp
    └── icons/
```

### Route-Based Code Splitting
```html
<!-- index.html - App Shell -->
<body>
    <au-navbar>...</au-navbar>
    <main id="app"></main>
    <au-toast-container></au-toast-container>
    
    <script type="module">
        // Route configuration
        const routes = {
            home: () => import('./pages/home.js'),
            users: () => import('./pages/users.js'),
            settings: () => import('./pages/settings.js'),
            default: () => import('./pages/not-found.js')
        };
        
        async function navigate() {
            const hash = location.hash.slice(1) || 'home';
            const loader = routes[hash] || routes.default;
            
            try {
                const module = await loader();
                document.getElementById('app').innerHTML = '';
                await module.render(document.getElementById('app'));
            } catch (err) {
                console.error('Route error:', err);
                document.getElementById('app').innerHTML = `
                    <au-alert severity="error">Failed to load page</au-alert>
                `;
            }
        }
        
        window.addEventListener('hashchange', navigate);
        navigate(); // Initial load
    </script>
</body>
```

### Page Module Pattern
```javascript
// pages/users.js
import { store } from '../store/index.js';
import { fetchAPI } from '../services/api.js';

export async function render(container) {
    // Show skeleton while loading
    container.innerHTML = `
        <au-doc-page title="Users">
            <au-skeleton variant="text" lines="5"></au-skeleton>
        </au-doc-page>
    `;
    
    // Fetch data
    const users = await fetchAPI('/users');
    store.users.set(users);
    
    // Render content
    container.innerHTML = `
        <au-doc-page title="Users">
            <au-stack gap="md">
                <au-stack direction="row" justify="space-between">
                    <h2>All Users (${users.length})</h2>
                    <au-button variant="filled" id="add-user">Add User</au-button>
                </au-stack>
                <au-repeat id="user-list"></au-repeat>
            </au-stack>
        </au-doc-page>
    `;
    
    // Setup repeat
    const list = container.querySelector('#user-list');
    list.items = users;
    list.renderItem = (user) => `
        <au-card variant="outlined">
            <strong>${user.name}</strong> - ${user.email}
        </au-card>
    `;
}
```

### Performance Checklist for Large Apps
```
[ ] Use route-based code splitting (only load needed code)
[ ] Preload critical routes with <link rel="prefetch">
[ ] Use au-virtual-list for lists with 100+ items
[ ] Use au-lazy for below-the-fold content
[ ] Implement skeleton loading for perceived performance
[ ] Cache API responses with Service Worker
[ ] Use bus for cross-component state (not prop drilling)
[ ] Minimize bundle size with tree-shaking
```

---

## 📦 Component Quick Reference

> **All 50 AgentUI components at a glance.** Key attributes and copy-paste examples.

### Buttons & Actions

| Component | Key Attributes | Example |
|-----------|---------------|---------|
| `au-button` | `variant` (filled/outlined/text/tonal), `disabled`, `icon` | `<au-button variant="filled">Save</au-button>` |
| `au-chip` | `selected`, `removable`, `static`, `variant` | `<au-chip selected>Active</au-chip>` `<au-chip static>Badge</au-chip>` |
| `au-icon` | `name` (MD icon name) | `<au-icon name="home"></au-icon>` |

> [!NOTE]
> **Icons**: AgentUI bundles ~50 common icons (home, settings, edit, delete, etc.). 
> Non-bundled icons use Google Fonts fallback. To use all Material Icons, add:
> `<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">`

### Form Controls

| Component | Key Attributes | Example |
|-----------|---------------|---------|
| `au-input` | `label`, `type`, `value`, `variant` (outlined/filled) | `<au-input label="Email" type="email"></au-input>` |
| `au-textarea` | `label`, `rows`, `value` | `<au-textarea label="Notes" rows="4"></au-textarea>` |
| `au-checkbox` | `checked`, `label`, `disabled` | `<au-checkbox label="Accept terms"></au-checkbox>` |
| `au-switch` | `checked`, `label` | `<au-switch label="Dark mode"></au-switch>` |
| `au-radio` | `name`, `value`, `checked` | `<au-radio name="size" value="lg">Large</au-radio>` |
| `au-dropdown` | `label`, `placeholder` | `<au-dropdown label="Country"><option>Italy</option></au-dropdown>` |
| `au-form` | (none) | `<au-form><au-input label="Name"></au-input></au-form>` |
| `au-schema-form` | `schema` (JSON Schema) | `<au-schema-form schema="..."></au-schema-form>` |

### Layout

| Component | Key Attributes | Example |
|-----------|---------------|---------|
| `au-layout` | (slots: header, drawer, main), `full-bleed` | `<au-layout full-bleed><!-- zero-padding --></au-layout>` |
| `au-container` | `max-width` | `<au-container max-width="lg">...</au-container>` |
| `au-stack` | `gap` (xs/sm/md/lg/xl), `direction` | `<au-stack gap="md">...</au-stack>` |
| `au-grid` | `cols`, `gap` | `<au-grid cols="3" gap="md">...</au-grid>` |
| `au-divider` | `vertical` | `<au-divider></au-divider>` |

### Navigation

| Component | Key Attributes | Example |
|-----------|---------------|---------|
| `au-drawer` | `mode` (auto/permanent/temporary/rail), `open` | `<au-drawer mode="auto">...</au-drawer>` |
| `au-drawer-item` | `icon`, `href`, `active` | `<au-drawer-item icon="home" active>Home</au-drawer-item>` |
| `au-navbar` | `title` | `<au-navbar title="My App"></au-navbar>` |
| `au-sidebar` | (similar to drawer) | `<au-sidebar>...</au-sidebar>` |
| `au-bottom-nav` | (slots for items) | `<au-bottom-nav>...</au-bottom-nav>` |
| `au-tabs` | `active` (index) | `<au-tabs><au-tab>Tab 1</au-tab></au-tabs>` |
| `au-router` | `routes` | `<au-router routes="..."></au-router>` |

### Content Display

| Component | Key Attributes | Example |
|-----------|---------------|---------|
| `au-card` | `variant` (elevated/filled/outlined) | `<au-card variant="elevated">...</au-card>` |
| `au-callout` | `variant` (info/warning/error/success), `title` | `<au-callout variant="warning">Attention!</au-callout>` |
| `au-alert` | `severity` (info/success/warning/error), `dismissible` | `<au-alert severity="error">Failed!</au-alert>` |
| `au-badge` | `value`, `variant` | `<au-badge value="3">Notifications</au-badge>` |
| `au-avatar` | `src`, `alt`, `size` | `<au-avatar src="user.jpg"></au-avatar>` |
| `au-tooltip` | `content`, `position` | `<au-tooltip content="Help">?</au-tooltip>` |
| `au-code` | `lang`, `inline` | `<au-code lang="js">const x = 1;</au-code>` |
| `au-table` | `data` | `<au-table data="..."></au-table>` |
| `au-datatable` | `data`, `columns`, `sortable` | `<au-datatable data="..."></au-datatable>` |
| `au-api-table` | `data` | `<au-api-table data="..."></au-api-table>` |

### Feedback & Overlays

| Component | Key Attributes | Example |
|-----------|---------------|---------|
| `au-modal` | `open`, `title` | `<au-modal open title="Confirm">...</au-modal>` |
| `au-confirm` | `title`, `message` | `<au-confirm title="Delete?"></au-confirm>` |
| `au-toast` | `severity`, `duration` | `showToast('Saved!', { severity: 'success' })` |
| `au-spinner` | `size` | `<au-spinner size="lg"></au-spinner>` |
| `au-progress` | `value`, `max`, `indeterminate` | `<au-progress value="50" max="100"></au-progress>` |
| `au-skeleton` | `variant` (text/circular/rectangular) | `<au-skeleton variant="text"></au-skeleton>` |

### Utility

| Component | Key Attributes | Example |
|-----------|---------------|---------|
| `au-theme-toggle` | (none) | `<au-theme-toggle></au-theme-toggle>` |
| `au-lazy` | `src` | `<au-lazy src="heavy-component.js"></au-lazy>` |
| `au-fetch` | `url`, `method` | `<au-fetch url="/api/data"></au-fetch>` |
| `au-repeat` | `items`, `template` | `<au-repeat items="...">...</au-repeat>` |
| `au-virtual-list` | `items`, `item-height` | `<au-virtual-list items="..." item-height="50"></au-virtual-list>` |
| `au-error-boundary` | `fallback` | `<au-error-boundary fallback="Error">...</au-error-boundary>` |

### Documentation (Demo Only)

| Component | Key Attributes | Example |
|-----------|---------------|---------|
| `au-example` | `title` | `<au-example title="Button Demo">...</au-example>` |
| `au-doc-page` | `title` | `<au-doc-page title="API">...</au-doc-page>` |
| `au-page` | `id` | `<au-page id="home">...</au-page>` |
| `au-prompt-ui` | (internal) | (Used for AI agent UI) |

---

### 🔧 CDN Usage (No npm Required)

```html
<!-- Latest version (non-render-blocking) -->
<link rel="preload" as="style" href="https://unpkg.com/agentui-wc@latest/dist/agentui.css">
<link rel="stylesheet" href="https://unpkg.com/agentui-wc@latest/dist/agentui.css"
      media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="https://unpkg.com/agentui-wc@latest/dist/agentui.css"></noscript>
<script type="module" src="https://unpkg.com/agentui-wc@latest/dist/agentui.esm.js" async></script>
```

---

### ⚠️ Common Troubleshooting

| Problem | Solution |
|---------|----------|
| Components not rendering | Ensure `<script type="module">` is used |
| Styles missing | Include `agentui.css` before components |
| npm package missing `dist/` | Update to v0.1.20+ (fixed) |
| Label overlaps input text | Update to v0.1.22+ (`has-value` fix) |
| Dropdown shows no options | Use `<au-option>` or standard `<option>` tags (v0.1.21+) |

---

*Last updated: v0.1.117 - 2026-02-11*
