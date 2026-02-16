# AgentUI — Build Skill Guide

> **Practical recipes for building web apps with AgentUI.**
> For framework overview and API concepts, see [AGENTS.md](./AGENTS.md).
> For full API reference, see [AGENTS_REFERENCE.md](./AGENTS_REFERENCE.md).

> **AI-friendly web components framework.** 51 components, zero Shadow DOM.

---

## 📑 Index

| Section | Description |
|---------|-------------|
| [🔥 Schema Form Showcase](#-schema-form-showcase) | Auto-generate entire forms from JSON Schema |
| [🤖 Ready-to-Use Agent Patterns](#-ready-to-use-agent-patterns) | Form data, input values, theme control, discovery |
| [🗄️ State Management](#️-state-management-createstore) | Reactive store with persistence — `createStore()` |
| [📡 Event Bus](#-event-bus-bus) | Component-to-component communication — `bus` |
| [🔗 Advanced Patterns](#-advanced-patterns-store--components) | DataTable + Store, Form + Store, API Cache |
| [🏗️ PWA App Shell Components](#️-pwa-app-shell-components-built-in) | Templates: dashboard, e-commerce, admin, full-bleed |
| [🚀 Modern App Shell Pattern](#-modern-app-shell-pattern-recommended) | Lazy loading, performance, 100/100 Lighthouse |
| [📋 Common Patterns](#common-patterns-copy-these) | Forms, modals, tabs, toast, drag & drop |

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

## 🤖 Ready-to-Use Agent Patterns

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
//   events: ['click'],
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

---

## ⏳ Component Readiness

Two-level readiness system for safe async component initialization.

### Per-Component (AuElement)
Every component has `.ready`, `.isReady`, and emits `au:ready`:

```javascript
const el = document.createElement('au-layout');
document.body.appendChild(el);

// Promise — resolves to element after first render
await el.ready; // → el

// Sync flag
el.isReady; // true

// Event (bubbles to document)
el.addEventListener('au:ready', () => { /* rendered */ });
```

### Framework-Level
Wait for ALL components to be registered:

```javascript
import { whenReady } from 'agentui-wc';
await whenReady();
// All 50+ components are now defined in customElements
```

IIFE usage:
```javascript
await AgentUI.whenReady();
```

---

## 🗄️ State Management (`createStore`)

> **Built-in reactive store.** Proxy-based, zero dependencies, optional localStorage persistence.

#### Basic Usage
```javascript
import { createStore } from 'agentui-wc';
// Or via global: const store = AgentUI.createStore(...)

const store = createStore(
    { tasks: [], filter: 'all', count: 0 },
    { persist: 'my-app' }  // optional: auto-save to localStorage
);

// Read state
console.log(store.state.tasks);

// Write state → subscribers notified automatically
store.state.count = 42;

// Subscribe to a specific key
const unsub = store.subscribe('count', (newVal, oldVal) => {
    document.querySelector('#counter').textContent = newVal;
});

// Subscribe to ALL changes
store.subscribe('*', (key, newVal, oldVal) => {
    console.log(`${key} changed: ${oldVal} → ${newVal}`);
});

// Cleanup
unsub();
store.destroy();
```

#### API Reference

| Method | Signature | Description |
|--------|-----------|-------------|
| `state` | `store.state` | Reactive proxy — read/write properties directly |
| `subscribe` | `subscribe(key, cb)` → `unsub()` | Watch a key or `'*'` for all. Returns unsubscribe fn |
| `batch` | `batch(fn)` | Group changes — subscribers notified once at end |
| `getState` | `getState()` → `Object` | Returns a plain copy (not the proxy) |
| `setState` | `setState(partial)` | Merge partial state, notify affected subscribers |
| `destroy` | `destroy()` | Clear all subscribers |

#### Persistence Pattern
```javascript
// Auto-saves to localStorage under key "agentui:kanban"
const store = createStore(
    { columns: [], tasks: [] },
    { persist: 'kanban' }
);
// On page reload, state is restored automatically.
// Corrupt JSON is handled silently (falls back to initial state).
```

#### Kanban Example (Store + Components)
```javascript
const store = createStore(
    { tasks: [], filter: 'all' },
    { persist: 'kanban-app' }
);

// Render when tasks change
store.subscribe('tasks', (tasks) => {
    const list = document.getElementById('task-list');
    list.innerHTML = tasks
        .filter(t => store.state.filter === 'all' || t.status === store.state.filter)
        .map(t => `<au-card variant="outlined" data-id="${t.id}">
            <h3>${t.title}</h3>
            <au-chip>${t.status}</au-chip>
        </au-card>`).join('');
});

// Add task
function addTask(title) {
    store.state.tasks = [...store.state.tasks, {
        id: Date.now(), title, status: 'todo'
    }];
}

// Batch multiple changes (single re-render)
store.batch(() => {
    store.state.filter = 'done';
    store.state.tasks = store.state.tasks.map(t => 
        t.id === 123 ? { ...t, status: 'done' } : t
    );
});
```

---

## 📡 Event Bus (`bus`)

> **Built-in event bus for component-to-component communication.** LightBus — lightweight, zero dependencies.

#### Basic Usage
```javascript
import { bus, UIEvents, showToast } from 'agentui-wc';
// Or via global: AgentUI.bus, AgentUI.showToast

// Subscribe
const unsub = bus.on('task:created', (data) => {
    console.log('New task:', data.title);
});

// Emit
bus.emit('task:created', { title: 'Buy milk', id: 42 });

// One-time listener
bus.once('app:initialized', () => console.log('App ready'));

// Cleanup
unsub();
```

#### Built-in UI Events
```javascript
import { bus, UIEvents, showToast } from 'agentui-wc';

// Toast (preferred shorthand)
showToast('Saved!', { severity: 'success', duration: 3000 });

// Or via bus directly
bus.emit(UIEvents.TOAST_SHOW, { message: 'Error!', severity: 'error' });

// Listen for framework events
bus.on(UIEvents.THEME_CHANGE, (data) => console.log('Theme:', data));
bus.on(UIEvents.FORM_SUBMIT, (data) => console.log('Form:', data));
bus.on(UIEvents.MODAL_OPEN, () => console.log('Modal opened'));
```

| Event Constant | Value | Fired When |
|---------------|-------|------------|
| `UIEvents.TOAST_SHOW` | `ui:toast:show` | Toast requested |
| `UIEvents.TOAST_DISMISS` | `ui:toast:dismiss` | Toast dismissed |
| `UIEvents.MODAL_OPEN` | `ui:modal:open` | Modal opened |
| `UIEvents.MODAL_CLOSE` | `ui:modal:close` | Modal closed |
| `UIEvents.THEME_CHANGE` | `ui:theme:change` | Theme toggled |
| `UIEvents.FORM_SUBMIT` | `ui:form:submit` | Form submitted |
| *(bus event)* | `au:route-change` | Route changed (includes `previous`) |

#### When to Use Store vs Bus

| Use Case | Use |
|----------|-----|
| App state (tasks, user data, settings) | `createStore()` |
| UI notifications (toasts, modals) | `bus` / `showToast()` |
| Cross-component events ("task created") | `bus.emit()` / `bus.on()` |
| Persistent data (survives reload) | `createStore({ persist: '...' })` |

---

## 🌐 HTTP Client (`http`)

> **Built-in fetch wrapper.** Base URLs, auth headers, isolated instances, typed errors.

#### Basic CRUD
```javascript
import { http } from 'agentui-wc/core/http';

const users = await http.get('/api/users');
await http.post('/api/users', { name: 'John', email: 'j@x.com' });
await http.put('/api/users/1', { name: 'Jane' });
await http.del('/api/users/1');
```

#### Isolated API Client
```javascript
const api = http.create({
    baseURL: 'https://api.example.com/v2',
    headers: { 'Authorization': 'Bearer token123' }
});

// All requests use the base URL and headers
const users = await api.get('/users');      // → https://api.example.com/v2/users
await api.post('/users', { name: 'New' });  // Same auth header
```

#### Error Handling
```javascript
import { http, HttpError } from 'agentui-wc/core/http';

try {
    await http.get('/api/protected');
} catch (err) {
    if (err instanceof HttpError) {
        if (err.status === 401) showToast('Please login', { severity: 'error' });
        if (err.status === 404) showToast('Not found', { severity: 'warning' });
    }
}
```

#### API Reference

| Method | Signature | Description |
|--------|-----------|-------------|
| `get` | `get(url)` → `Promise` | GET, auto-parses JSON |
| `post` | `post(url, body)` → `Promise` | POST with JSON body |
| `put` | `put(url, body)` → `Promise` | PUT with JSON body |
| `del` | `del(url)` → `Promise` | DELETE |
| `request` | `request(url, options)` → `Promise` | Custom request |
| `create` | `create({ baseURL, headers })` → `HttpClient` | Isolated instance |

---

## ⚡ Render Performance

> **DOM-aware utilities for smooth 60fps updates.** rAF batching, memoization, debounce/throttle, fastdom, lazy rendering.

#### Batch DOM Updates
```javascript
import { rafScheduler } from 'agentui-wc/core/render';

// Multiple schedule() calls in the same tick → single rAF frame
items.forEach(item => {
    rafScheduler.schedule(() => {
        item.el.style.transform = `translateX(${item.x}px)`;
    });
});
```

#### Memoize Expensive Computations
```javascript
import { memo } from 'agentui-wc/core/render';

const computeLayout = memo((items) => {
    return items.map(i => calculatePosition(i));
}, { maxSize: 50 });  // LRU: keeps last 50 results
```

#### Debounce / Throttle
```javascript
import { debounce, throttle } from 'agentui-wc/core/render';

// Search input — wait for 300ms of silence
const onSearch = debounce((query) => fetchResults(query), 300);
searchInput.addEventListener('au-input', (e) => onSearch(e.detail.value));

// Scroll handler — max 1 call per 16ms (60fps)
const onScroll = throttle(() => updateStickyHeader(), 16);
window.addEventListener('scroll', onScroll);
```

#### Prevent Layout Thrashing
```javascript
import { domBatch } from 'agentui-wc/core/render';

// ❌ Bad — causes reflow on every iteration
items.forEach(el => {
    const h = el.offsetHeight;       // READ → reflow
    el.style.height = `${h * 2}px`; // WRITE → invalidate
});

// ✅ Good — reads first, then writes
items.forEach(el => {
    domBatch.read(() => { el._h = el.offsetHeight; });
    domBatch.write(() => { el.style.height = `${el._h * 2}px`; });
});
```

#### Process Large Arrays Without Blocking
```javascript
import { processInChunks } from 'agentui-wc/core/render';

// Process 10,000 rows, yielding every 100
await processInChunks(allRows, (row, index) => {
    renderTableRow(row, index);
}, 100);
// The browser stays responsive between chunks
```

#### Lazy Render On Scroll
```javascript
import { createVisibilityObserver } from 'agentui-wc/core/render';

const observer = createVisibilityObserver((el) => {
    el.innerHTML = renderCard(el.dataset);
    el.classList.add('loaded');
}, { rootMargin: '200px' });  // Pre-load 200px ahead

document.querySelectorAll('.placeholder').forEach(el => observer.observe(el));
```

---

## 🗓️ Task Scheduling

> **Priority-based scheduling via `scheduler.postTask()`.** Automatic fallback to `setTimeout`.

#### Priority Levels
```javascript
import { scheduleTask } from 'agentui-wc/core/scheduler';

// Highest — user is waiting for this
await scheduleTask(() => validateForm(), 'user-blocking');

// Normal — visible updates
await scheduleTask(() => updateChart(), 'user-visible');

// Lowest — can wait
await scheduleTask(() => sendAnalytics(), 'background');
```

#### Yield to Main Thread
```javascript
import { yieldToMain } from 'agentui-wc/core/scheduler';

// Long loop — yield periodically to keep UI smooth
async function processAll(items) {
    for (let i = 0; i < items.length; i++) {
        processItem(items[i]);
        if (i % 50 === 0) await yieldToMain();
    }
}
```

#### Process List with Auto-Yield
```javascript
import { processWithYield } from 'agentui-wc/core/scheduler';

await processWithYield(thousandCards, (card) => {
    renderCard(card);
}, 50);  // Yield every 50 items
```

#### Background Tasks + Measure After Paint
```javascript
import { runBackground, afterPaint } from 'agentui-wc/core/scheduler';

// Non-urgent work during idle time
runBackground(() => prefetchNextPage());

// Measure layout after browser has painted
await afterPaint();
const rect = element.getBoundingClientRect();
```

---

## 🧭 SPA Router

> **Hash-based routing with `:param` support.** Zero dependencies, chainable API.

#### Route Registration
```javascript
import { Router } from 'agentui-wc/core/router';

Router
    .on('/', () => renderHome())
    .on('/about', () => renderAbout())
    .on('/user/:id', ({ id }) => renderUser(id))
    .on('/user/:id/post/:postId', ({ id, postId }) => renderPost(id, postId))
    .notFound((path) => render404(path))
    .start();
```

#### Navigation
```javascript
Router.navigate('/user/42');      // Navigate programmatically
console.log(Router.current);     // '/user/42'
```

#### Router + Store + Transitions
```javascript
import { Router } from 'agentui-wc/core/router';
import { createStore } from 'agentui-wc';
import { transition } from 'agentui-wc/core/transitions';

const store = createStore({ currentPage: 'home' });

Router
    .on('/', () => loadPage('home'))
    .on('/settings', () => loadPage('settings'))
    .start();

async function loadPage(name) {
    store.state.currentPage = name;
    const html = await fetch(`/content/${name}.html`).then(r => r.text());
    await transition(() => {
        document.getElementById('content').innerHTML = html;
    });
}
```

#### Cleanup
```javascript
Router.stop();     // Remove listener, keep routes
Router.destroy();  // Full cleanup (routes + listener)
```

---

## 🔗 Advanced Patterns (Store + Components)

> **`createStore()` shines when connecting app-level state to UI components.**

#### DataTable + Store — Reactive Data Source

```javascript
import { createStore } from 'agentui-wc';

const store = createStore(
    { users: [], filter: '', sortField: null },
    { persist: 'admin-panel' }
);

// Fetch → Store → Table (one-way data flow)
const table = document.querySelector('au-datatable');

store.subscribe('users', () => {
    const filtered = store.state.users.filter(u =>
        u.name.toLowerCase().includes(store.state.filter.toLowerCase())
    );
    table.setData(filtered);
});

store.subscribe('filter', () => {
    // Re-trigger the users subscriber by reading the current value
    store.state.users = [...store.state.users];
});

// Load data
const res = await fetch('/api/users');
store.state.users = await res.json();  // table auto-updates

// Search input
searchInput.addEventListener('au-change', (e) => {
    store.state.filter = e.detail.value;
});
```

#### Form + Store — Two-Way Data Binding

```javascript
import { createStore, bus } from 'agentui-wc';

const store = createStore({ email: '', name: '', role: 'user' });

// Store → Form (populate fields on load)
const form = document.querySelector('au-form');
store.subscribe('*', (key, newVal) => {
    const field = form.querySelector(`[name="${key}"]`);
    if (field && field.value !== newVal) field.value = newVal;
});

// Form → Store (sync on submit)
form.addEventListener('au-submit', (e) => {
    store.setState(e.detail.data);
    bus.emit('user:saved', store.getState());
});

// Pre-populate from API
const user = await fetch('/api/me').then(r => r.json());
store.setState(user);
```

#### API Cache + Store — Shared Fetch Cache

```javascript
import { createStore } from 'agentui-wc';

const cache = createStore({}, { persist: 'api-cache' });

async function cachedFetch(url, maxAge = 60_000) {
    const entry = cache.state[url];
    if (entry && Date.now() - entry.ts < maxAge) return entry.data;

    const data = await fetch(url).then(r => r.json());
    cache.state[url] = { data, ts: Date.now() };
    return data;
}

// Multiple components share the cache
const users = await cachedFetch('/api/users');     // fetches
const again = await cachedFetch('/api/users');     // cached!

// Invalidate
delete cache.state['/api/users'];
```

---

## 🏗️ PWA App Shell Components (Built-In)

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

---

## 🚀 Modern App Shell Pattern (RECOMMENDED)

> **For production apps, use this pattern instead of Minimal Page Setup.**
> This is how `demo/index.html` achieves 100/100 Lighthouse with all 51 components.

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

---

## Common Patterns (Copy These)

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
