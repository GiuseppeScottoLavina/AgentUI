# Components Reference

AgentUI includes 57 Web Components following Material Design 3.

## Form Components

### au-button
Interactive button with MD3 styling and ripple effect.

```html
<au-button variant="filled">Primary</au-button>
<au-button variant="tonal">Tonal</au-button>
<au-button variant="elevated">Elevated</au-button>
<au-button variant="outlined">Outlined</au-button>
<au-button variant="text">Text</au-button>
<au-button disabled>Disabled</au-button>
```

| Attribute | Values | Default |
|-----------|--------|---------|
| `variant` | `filled`, `tonal`, `elevated`, `outlined`, `text`, `primary`, `secondary`, `ghost` | `primary` |
| `size` | `sm`, `md`, `lg` | `md` |
| `disabled` | boolean | `false` |

### au-input
Text input with floating label.

```html
<au-input label="Email" type="email" placeholder="Enter email"></au-input>
<au-input variant="outlined" label="Password" type="password"></au-input>
```

| Attribute | Values | Default |
|-----------|--------|---------|
| `type` | `text`, `email`, `password`, `number`, `tel` | `text` |
| `label` | string | - |
| `variant` | `filled`, `outlined` | `outlined` |
| `disabled`, `required` | boolean | `false` |

**Events:** `au-input`, `au-change`

### au-checkbox
Checkbox for multiple selections.

```html
<au-checkbox>Option 1</au-checkbox>
<au-checkbox checked>Selected</au-checkbox>
```

### au-switch
Toggle switch for on/off states.

```html
<au-switch label="Dark mode"></au-switch>
<au-switch checked>Enabled</au-switch>
```

### au-radio
Radio buttons for single selection.

```html
<au-radio name="size" value="sm">Small</au-radio>
<au-radio name="size" value="md" checked>Medium</au-radio>
<au-radio name="size" value="lg">Large</au-radio>
```

### au-dropdown
Dropdown select menu.

```html
<au-dropdown placeholder="Select option">
    <au-option value="1">Option 1</au-option>
    <au-option value="2">Option 2</au-option>
</au-dropdown>
```

---

## Layout Components

### au-stack
Flexbox layout container.

```html
<au-stack direction="row" gap="md" align="center">
    <div>Item 1</div>
    <div>Item 2</div>
</au-stack>
```

| Attribute | Values | Default |
|-----------|--------|---------|
| `direction` | `row`, `column` | `column` |
| `gap` | `xs`, `sm`, `md`, `lg`, `xl` | `md` |
| `align` | `start`, `center`, `end`, `stretch` | `stretch` |
| `justify` | `start`, `center`, `end`, `space-between` | `start` |
| `wrap` | boolean | `false` |

### au-grid
CSS Grid layout.

```html
<au-grid cols="3" gap="md">
    <au-card>1</au-card>
    <au-card>2</au-card>
    <au-card>3</au-card>
</au-grid>
```

### au-container
Centered content container with max-width.

```html
<au-container size="md">
    <!-- content -->
</au-container>
```

---

## Display Components

### au-card
Container for related content.

```html
<au-card variant="elevated">
    <h3>Title</h3>
    <p>Content</p>
</au-card>
```

| Attribute | Values | Default |
|-----------|--------|---------|
| `variant` | `elevated`, `filled`, `outlined` | `elevated` |

### au-tabs
Tabbed content navigation.

```html
<au-tabs>
    <au-tab label="Tab 1" active>Content 1</au-tab>
    <au-tab label="Tab 2">Content 2</au-tab>
</au-tabs>
```

### au-avatar
User avatar with image or initials.

```html
<au-avatar src="photo.jpg"></au-avatar>
<au-avatar initials="JD"></au-avatar>
```

### au-badge
Count or status indicator.

```html
<au-badge variant="primary">Notifications</au-badge>
<au-badge dot>Updates</au-badge>
```

### au-chip
Compact interactive element.

```html
<au-chip>Tag</au-chip>
<au-chip removable>Removable</au-chip>
```

### au-icon
SVG icon from built-in set.

```html
<au-icon name="check"></au-icon>
<au-icon name="close"></au-icon>
<au-icon name="menu"></au-icon>
```

---

## Feedback Components

### au-alert
Static message display.

```html
<au-alert severity="info">Information</au-alert>
<au-alert severity="success">Success!</au-alert>
<au-alert severity="warning">Warning</au-alert>
<au-alert severity="error">Error</au-alert>
```

### au-modal
Dialog overlay.

```html
<au-modal id="my-modal" title="Dialog">
    <p>Modal content</p>
</au-modal>
<au-button onclick="document.getElementById('my-modal').open()">Open</au-button>
```

**Methods:** `.open()`, `.close()`

### au-toast
Brief notification (via JavaScript).

```javascript
import { showToast } from 'agentui-wc';
showToast('Success!', { severity: 'success', duration: 3000 });
```

### au-progress
Progress indicator.

```html
<au-progress value="50"></au-progress>
<au-progress indeterminate></au-progress>
```

### au-spinner
Loading spinner.

```html
<au-spinner size="md"></au-spinner>
```

---

## Navigation Components

### au-navbar
Top navigation bar.

```html
<au-navbar title="My App">
    <au-nav-item href="/">Home</au-nav-item>
    <au-nav-item href="/about">About</au-nav-item>
</au-navbar>
```

### au-router
Page routing (see [Page-Based Development](../AGENTS.md#page-based-app-development-v32)).

```html
<au-router base="/app/pages" default="home"></au-router>
```

---

## Utility Components

### au-theme-toggle
Light/dark mode toggle.

```html
<au-theme-toggle></au-theme-toggle>
```

### au-virtual-list
Virtualized list for large datasets.

```javascript
const list = document.querySelector('au-virtual-list');
list.items = largeArray;
list.itemHeight = 50;
list.renderItem = (item) => `<div>${item.name}</div>`;
```

---

## Structural Components

Components that control **what** and **when** content renders in the DOM. All use `display: contents` for zero layout impact.

### au-if
Conditional rendering — children are **truly removed** from DOM (not hidden).

```html
<au-if condition>
    <p>Visible when condition is true</p>
</au-if>

<!-- With else template -->
<au-if condition else="fallback-tpl">
    <p>Authenticated content</p>
</au-if>
<template id="fallback-tpl">
    <au-alert severity="info">Please log in.</au-alert>
</template>
```

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `condition` | boolean | absent | Renders children when present |
| `else` | string | — | ID of `<template>` shown when false |

**Events:** `au-show`, `au-hide`

### au-repeat
Declarative list rendering with keyed reconciliation.

```javascript
const list = document.querySelector('au-repeat');
list.keyFn = (item) => item.id;
list.renderItem = (item) => `<au-card>${item.name}</au-card>`;
list.items = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
```

| Property | Type | Description |
|----------|------|-------------|
| `items` | Array | Data array to render |
| `keyFn` | Function | Key extractor for reconciliation |
| `renderItem` | Function | `(item, index) => htmlString` |

### au-show
Show/hide children with `display: none` — **state preserved** (unlike au-if).

```html
<au-show condition>
    <form><!-- input values survive toggle --></form>
</au-show>
```

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `condition` | boolean | absent | Shows children when present |

**Events:** `au-show`, `au-hide`

### au-portal
Teleports children to another DOM location. Solves `overflow: hidden` / z-index issues.

```html
<au-portal target="#my-container">
    <au-modal>I appear inside #my-container!</au-modal>
</au-portal>
```

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `target` | string | `body` | CSS selector for target container |

**Events:** `au-teleport`, `au-return`

### au-intersection
Declarative `IntersectionObserver` wrapper.

```html
<au-intersection threshold="0.5" once>
    <img data-src="lazy.webp" />
</au-intersection>
```

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `threshold` | number | `0` | Visibility ratio (0–1) |
| `root-margin` | string | `0px` | Margin around viewport |
| `once` | boolean | absent | Disconnect after first intersection |

**Events:** `au-visible` (`detail.ratio`), `au-hidden`

### au-media
Responsive rendering — children removed from DOM when media query doesn't match.

```html
<au-media query="(min-width: 768px)">
    <aside>Desktop sidebar</aside>
</au-media>
```

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `query` | string | — | CSS media query |

**Properties:** `matches` (boolean, read-only)
**Events:** `au-match`, `au-unmatch`

### au-transition
CSS class lifecycle for enter/leave animations (Vue-inspired).

```html
<style>
    .fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
    .fade-enter-from, .fade-leave-active { opacity: 0; }
</style>
<au-transition name="fade" active>
    <div>I animate!</div>
</au-transition>
```

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `name` | string | `au` | Class prefix (e.g. `fade-enter-from`) |
| `active` | boolean | absent | Toggle enter/leave |

**Events:** `au-enter`, `au-leave`

### au-timer
Declarative timer with automatic cleanup.

```html
<au-timer interval="1000" autostart></au-timer>
<au-timer interval="1000" countdown="30"></au-timer>
```

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `interval` | number | `1000` | Tick interval (ms, min 100) |
| `countdown` | number | — | Count down from value to 0 |
| `autostart` | boolean | absent | Start on connect |

**Methods:** `.start()`, `.stop()`, `.reset()`
**Events:** `au-tick` (`detail.count`), `au-complete` (countdown only)
