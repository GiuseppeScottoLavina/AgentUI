# Core Utilities Reference

> AgentUI ships 12 utility modules alongside its 57 components.  
> Import from `agentui-wc` or the direct path shown in each section.

---

## HTTP Client (`http.js`)

Simple fetch wrapper with instance isolation, base URLs, and error handling.

```javascript
import { http } from 'agentui-wc/core/http';

// Quick requests
const data = await http.get('/api/users');
await http.post('/api/users', { name: 'John' });
await http.put('/api/users/1', { name: 'Jane' });
await http.del('/api/users/1');
```

### Isolated Client Instances

```javascript
import { http } from 'agentui-wc/core/http';

const api = http.create({
    baseURL: 'https://api.example.com/v2',
    headers: { 'Authorization': 'Bearer token123' }
});

const users = await api.get('/users');       // → https://api.example.com/v2/users
await api.post('/users', { name: 'John' });  // Same base + headers
```

### Error Handling

```javascript
import { HttpError } from 'agentui-wc/core/http';

try {
    const data = await http.get('/api/protected');
} catch (err) {
    if (err instanceof HttpError) {
        console.log(err.status);     // 401
        console.log(err.statusText); // "Unauthorized"
        console.log(err.body);       // Response body
    }
}
```

### API

| Method | Signature | Description |
|--------|-----------|-------------|
| `get` | `get(url)` → `Promise` | GET request, auto-parses JSON |
| `post` | `post(url, body)` → `Promise` | POST with JSON body |
| `put` | `put(url, body)` → `Promise` | PUT with JSON body |
| `del` | `del(url)` → `Promise` | DELETE request |
| `request` | `request(url, options)` → `Promise` | Custom request with full options |
| `create` | `create({ baseURL, headers })` → `HttpClient` | Create isolated instance |

---

## Reactive Store (`store.js`)

Proxy-based reactive state management with optional `localStorage` persistence.

> **Full guide with patterns:** See [SKILL.md — State Management](../SKILL.md#️-state-management-createstore)

```javascript
import { createStore } from 'agentui-wc';

const store = createStore(
    { count: 0, items: [] },
    { persist: 'my-app' }  // auto-save to localStorage
);

// Read/write reactively
store.state.count = 42;

// Subscribe to changes
const unsub = store.subscribe('count', (newVal, oldVal) => {
    console.log(`Count: ${oldVal} → ${newVal}`);
});

// Batch changes (single notification)
store.batch(() => {
    store.state.count = 100;
    store.state.items = ['a', 'b'];
});

unsub();          // Cleanup
store.destroy();  // Remove all subscriptions
```

### API

| Method | Signature | Description |
|--------|-----------|-------------|
| `state` | `store.state` | Reactive proxy — read/write directly |
| `subscribe` | `subscribe(key, cb)` → `unsub()` | Watch key or `'*'` for all |
| `batch` | `batch(fn)` | Group changes, notify once |
| `getState` | `getState()` → `Object` | Plain copy (not proxy) |
| `setState` | `setState(partial)` | Merge partial state |
| `destroy` | `destroy()` | Clear all subscribers |

---

## Render Utilities (`render.js`)

Performance utilities for large-scale DOM operations.

```javascript
import { 
    rafScheduler, memo, debounce, throttle, 
    domBatch, createVisibilityObserver, processInChunks 
} from 'agentui-wc/core/render';
```

### rAF Batching

```javascript
// Batch multiple DOM updates into a single animation frame
rafScheduler.schedule(() => element.style.transform = 'translateX(10px)');
rafScheduler.schedule(() => element.style.opacity = '1');
// Both execute in the same rAF frame
```

### Memoization

```javascript
const expensiveFn = memo(computeLayout, { maxSize: 100 });
// LRU eviction at 100 entries
```

### Debounce & Throttle

```javascript
const onResize = debounce(() => recalculate(), 200);
const onScroll = throttle(() => updatePosition(), 16);
window.addEventListener('resize', onResize);
window.addEventListener('scroll', onScroll);
```

### DOM Read/Write Batching (fastdom pattern)

```javascript
// Prevents layout thrashing — reads first, then writes
domBatch.read(() => { height = element.offsetHeight; });
domBatch.write(() => { element.style.height = `${height * 2}px`; });
```

### Visibility Observer (Lazy Rendering)

```javascript
const observer = createVisibilityObserver(
    (el) => el.classList.add('visible'),
    { rootMargin: '200px' }
);

document.querySelectorAll('.lazy-card').forEach(el => observer.observe(el));
// Each element fires callback once when entering viewport
```

### Chunked Processing

```javascript
// Process 10,000 items without blocking the main thread
await processInChunks(largeArray, (item, index) => {
    renderRow(item);
}, 100);  // 100 items per chunk, yields between chunks
```

### API

| Export | Signature | Description |
|--------|-----------|-------------|
| `rafScheduler` | `.schedule(callback)` | Batch DOM updates into single rAF |
| `memo` | `memo(fn, { keyFn?, maxSize? })` | Memoize with optional LRU eviction |
| `debounce` | `debounce(fn, delay=100)` | Delay until silence |
| `throttle` | `throttle(fn, limit=100)` | At most one call per `limit` ms |
| `domBatch` | `.read(fn)` / `.write(fn)` | Prevent layout thrashing |
| `createVisibilityObserver` | `(onVisible, options?)` → `{ observe, disconnect }` | Lazy rendering via IntersectionObserver |
| `processInChunks` | `(items, processFn, chunkSize=100)` → `Promise` | Yield-based chunked iteration |

---

## Task Scheduler (`scheduler.js`)

Priority-based task scheduling using `scheduler.postTask()` (2026 standard) with `setTimeout` fallback.

```javascript
import { scheduleTask, yieldToMain, processWithYield, runBackground, afterPaint } from 'agentui-wc/core/scheduler';
```

### Priority Scheduling

```javascript
// Run with priority ('user-blocking' | 'user-visible' | 'background')
await scheduleTask(() => validateForm(), 'user-blocking');
await scheduleTask(() => updateAnalytics(), 'background');
```

### Yield to Main Thread

```javascript
// In a long-running task, yield to let the browser paint
for (const item of items) {
    processItem(item);
    await yieldToMain();  // Browser can render, handle events
}
```

### Process Large Lists with Yield

```javascript
// Auto-yields every N items
await processWithYield(thousandItems, (item) => {
    renderCard(item);
}, 50);  // yield every 50 items
```

### Background Tasks

```javascript
// Run non-urgent work when idle
runBackground(() => {
    preCacheImages();
});
```

### After Next Paint

```javascript
// Wait for the browser to paint, then measure
await afterPaint();
const rect = element.getBoundingClientRect();
```

### API

| Function | Signature | Description |
|----------|-----------|-------------|
| `scheduleTask` | `(fn, priority?)` → `Promise` | Schedule with priority |
| `yieldToMain` | `()` → `Promise` | Yield main thread to browser |
| `processWithYield` | `(items, fn, chunkSize?)` → `Promise` | Chunked processing with yield |
| `runBackground` | `(fn)` → `Promise` | Run during idle time |
| `afterPaint` | `()` → `Promise` | Wait for next paint |

---

## View Transitions (`transitions.js`)

Wraps the View Transitions API for smooth, GPU-accelerated page transitions. Falls back gracefully.

```javascript
import { transition, transitionNamed, navigateWithTransition, supportsViewTransitions } from 'agentui-wc/core/transitions';
```

### Basic Transition

```javascript
await transition(() => {
    document.querySelector('#content').innerHTML = newHTML;
});
// Smooth cross-fade applied automatically
```

### Named Transition (Custom Animation)

```javascript
await transitionNamed(() => {
    contentArea.innerHTML = newPageHTML;
}, { name: 'page-slide' });
```

```css
/* Custom animation for the named transition */
::view-transition-old(page-slide) {
    animation: slide-out 0.3s ease-in;
}
::view-transition-new(page-slide) {
    animation: slide-in 0.3s ease-out;
}
```

### Navigate with Transition

```javascript
// Combines navigation + transition
await navigateWithTransition('#/about', () => {
    renderAboutPage();
});
```

### Feature Detection

```javascript
if (supportsViewTransitions) {
    // Use transitions
} else {
    // Fallback: direct DOM update
}
```

### API

| Function | Signature | Description |
|----------|-----------|-------------|
| `transition` | `(updateFn)` → `Promise` | Cross-fade transition |
| `transitionNamed` | `(updateFn, { name })` → `Promise` | Named transition for custom CSS |
| `navigateWithTransition` | `(path, renderFn)` → `Promise` | URL change + transition |
| `supportsViewTransitions` | `boolean` (const) | `true` if browser supports View Transitions API |

---

## SPA Router (`router.js`)

Hash-based routing with parameter support.

```javascript
import { Router } from 'agentui-wc/core/router';

Router
    .on('/', () => renderHome())
    .on('/about', () => renderAbout())
    .on('/user/:id', ({ id }) => renderUser(id))
    .notFound((path) => render404(path))
    .start();
```

### Navigation

```javascript
Router.navigate('/user/42');      // Navigate programmatically
console.log(Router.current);     // '/user/42'
```

### Cleanup

```javascript
Router.stop();     // Remove listener, keep routes
Router.destroy();  // Full cleanup
```

### API

| Method | Signature | Description |
|--------|-----------|-------------|
| `on` | `on(path, handler)` → `Router` | Register route (chainable). Supports `:param` |
| `notFound` | `notFound(handler)` → `Router` | Set 404 handler |
| `navigate` | `navigate(path)` | Navigate to path |
| `current` | (getter) → `string` | Current route path |
| `start` | `start()` → `Router` | Start listening (chainable) |
| `stop` | `stop()` | Stop listening, keep routes |
| `destroy` | `destroy()` | Full cleanup |

---

## HTML Safety (`utils.js`)

XSS-safe HTML generation via tagged template literals.

```javascript
import { html, safe, escapeHTML } from 'agentui-wc';
```

### Tagged Template — Auto-Escaping

```javascript
const userInput = '<script>alert("xss")</script>';
element.innerHTML = html`<h2>${userInput}</h2>`;
// → <h2>&lt;script&gt;alert("xss")&lt;/script&gt;</h2>
```

### Trusted HTML — `safe()`

```javascript
const icon = '<au-icon name="home"></au-icon>';
element.innerHTML = html`<div>${safe(icon)}</div>`;
// → <div><au-icon name="home"></au-icon></div>
```

### Composable Templates

```javascript
const items = ['One', 'Two', '<Three>'];
element.innerHTML = html`<ul>${items.map(i => html`<li>${i}</li>`)}</ul>`;
// → <ul><li>One</li><li>Two</li><li>&lt;Three&gt;</li></ul>
```

### API

| Function | Signature | Description |
|----------|-----------|-------------|
| `html` | `` html`...${value}...` `` → `SafeHTML` | Tagged template — auto-escapes interpolations |
| `safe` | `safe(trustedString)` → `SafeHTML` | Mark string as trusted (no escaping) |
| `escapeHTML` | `escapeHTML(str)` → `string` | Escape `& < > " '` entities |

---

## Keyboard Manager (`keyboard.js`)

Stack-based ESC key handler for layered UI (modals, dropdowns, tooltips).

```javascript
import { keyboard } from 'agentui-wc/core/keyboard';

// Open overlay — register handler at top of stack
const unsub = keyboard.pushEscapeHandler(element, () => {
    closeOverlay();
});

// ESC closes only the topmost handler

// On close — remove from stack
unsub();
```

### API

| Method | Signature | Description |
|--------|-----------|-------------|
| `pushEscapeHandler` | `(element, callback)` → `unsub()` | Register ESC handler |
| `isTopmost` | `(element)` → `boolean` | Check if element is top of stack |
| `stackDepth` | (getter) → `number` | Current stack depth |

---

## Layer System (`layers.js`)

Centralized Z-index constants. Auto-injected as CSS custom properties.

```javascript
import { Z_INDEX } from 'agentui-wc/core/layers';

this.style.zIndex = Z_INDEX.modal;
```

```css
/* CSS tokens (auto-injected) */
.my-modal   { z-index: var(--z-modal); }
.my-tooltip { z-index: var(--z-tooltip); }
```

### Layer Hierarchy

| Token | Value | Use For |
|-------|-------|---------|
| `base` | 1 | Default content |
| `sticky` | 100 | Sticky headers, FABs |
| `dropdown` | 1000 | Dropdowns, menus |
| `drawer` | 1100 | Navigation drawers |
| `modal` | 1200 | Modal dialogs |
| `toast` | 1300 | Toast notifications |
| `tooltip` | 1400 | Tooltips |
| `overlay` | 9999 | Full-screen overlays |
| `devtools` | 999999 | Agent dev tools |

---

## Ripple Effects (`ripple.js`)

MD3 ripple touch feedback. GPU-accelerated, positions once per attach.

```javascript
import { attachRipple, createRipple, RippleMixin } from 'agentui-wc/core/ripple';
```

### Attach to Any Element

```javascript
const cleanup = attachRipple(myButton);
// Ripple effect on click/touch — auto-positions

cleanup();  // Remove when done
```

### Manual Ripple

```javascript
// Create ripple at specific coordinates
createRipple(element, { clientX: 100, clientY: 50 });
```

### Component Mixin

```javascript
class MyButton extends RippleMixin(AuElement) {
    // Ripple automatically attached on connect, cleaned on disconnect
}
```

### API

| Export | Signature | Description |
|--------|-----------|-------------|
| `attachRipple` | `(element)` → `cleanup()` | Auto-ripple on click/touch |
| `createRipple` | `(element, event)` | Manual ripple at event coordinates |
| `RippleMixin` | `(BaseClass)` → `Class` | Mixin for custom components |

---

## Responsive Breakpoints (`breakpoints.js`)

MD3-compliant reactive breakpoint observer.

> **Full guide:** See [AGENTS_REFERENCE.md — Breakpoints](../AGENTS_REFERENCE.md#responsive-breakpoints-md3)

```javascript
import { breakpoints, BREAKPOINTS } from 'agentui-wc/core/breakpoints';

// Reactive subscription
const unsub = breakpoints.subscribe((size) => {
    console.log(size); // 'compact' | 'medium' | 'expanded'
});

// Live queries
if (breakpoints.isCompact)  { /* mobile */ }
if (breakpoints.isMedium)   { /* tablet */ }
if (breakpoints.isExpanded) { /* desktop */ }

unsub();
```

### Size Classes

| Class | Width | Typical Devices |
|-------|-------|-----------------|
| **compact** | < 600px | Mobile phones |
| **medium** | 600–839px | Tablets, foldables |
| **expanded** | ≥ 840px | Desktops, large tablets |

---

## Agent API (`agent-api.js`)

Structured APIs for AI agents interacting with AgentUI via DOM or MCP.

```javascript
import { AgentAPI } from 'agentui-wc/core/agent-api';
// Or individual exports:
import { getAuComponentTree, describe, enableVisualMarkers, getMCPActions } from 'agentui-wc/core/agent-api';
```

### Component Tree

```javascript
// Get all components
const tree = getAuComponentTree();

// Filter: visible + interactive only
const buttons = getAuComponentTree(document.body, {
    visibleOnly: true,
    interactiveOnly: true,
    types: ['au-button', 'au-input']
});

// Each returns: { tag, id, label, description, state, actions, rect, interactive, visible }
```

### Describe a Component

```javascript
const desc = describe('#submit-btn');
// → 'Button "Submit". Click to activate.'

const desc2 = describe(document.querySelector('au-input'));
// → 'Text input "Email". Current value: "john@example.com". Placeholder: "Enter email"'
```

### Visual Markers (for Screenshot-Based AI)

```javascript
// Enable markers on interactive elements
const markers = enableVisualMarkers({ markerStyle: 'badge' });
// Take screenshot → Agent sees [B1] Save, [B2] Cancel, [I1] Email

// Map marker IDs to elements
const el = getMarkerElement('B1');  // → HTMLElement for Button 1

// Get all mappings
const map = getMarkerMap();
// → { B1: { tag: 'au-button', label: 'Save', actions: ['click'] }, ... }

// Disable
disableVisualMarkers();
```

### MCP Actions

```javascript
const actions = getMCPActions();
// Returns MCP-compatible schema with:
// - click_button, fill_input, toggle_checkbox
// - select_option, open_modal, close_modal
// - select_tab, get_component_tree
// - enable_visual_markers, confirm_dialog
```

### Other Utilities

```javascript
const components = getRegisteredComponents();  // Map<tag, constructor>
const matches = findByLabel('Submit');          // Fuzzy search by label
```

### API

| Function | Signature | Description |
|----------|-----------|-------------|
| `getAuComponentTree` | `(root?, options?)` → `AuComponentInfo[]` | DOM distillation for agents |
| `describe` | `(element\|selector)` → `string` | Natural language description |
| `findByLabel` | `(query, root?)` → `HTMLElement[]` | Fuzzy label search |
| `getRegisteredComponents` | `()` → `Map<string, Class>` | All registered au-* elements |
| `enableVisualMarkers` | `(options?)` → `Map<string, WeakRef>` | Add visual overlays |
| `disableVisualMarkers` | `()` | Remove overlays |
| `getMarkerElement` | `(markerId)` → `HTMLElement\|null` | Element by marker ID |
| `getMarkerMap` | `()` → `Object` | All marker mappings |
| `getMCPActions` | `()` → `Object` | MCP-compatible action schema |
