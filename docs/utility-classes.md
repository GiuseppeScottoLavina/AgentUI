# Utility CSS Classes Architecture

> **Version**: 1.0.0-draft  
> **Status**: Planning Phase

---

## Design Goals

1. **Minimal footprint**: Only include what's used
2. **Predictable naming**: AI-friendly patterns
3. **Composable**: Combine classes freely
4. **Theme-aware**: All use CSS variables

---

## Naming Convention

```
.au-{property}-{value}
.au-{property}-{value}-{breakpoint}

Examples:
  .au-p-4          → padding: var(--au-spacing-4)
  .au-text-lg      → font-size: var(--au-font-size-lg)
  .au-bg-primary   → background: var(--au-color-primary)
  .au-flex         → display: flex
  .au-gap-2        → gap: var(--au-spacing-2)
```

---

## Category Reference

### Spacing

| Class Pattern | Property | Values |
|---------------|----------|--------|
| `.au-p-{n}` | padding | 0-32 scale |
| `.au-px-{n}` | padding-inline | 0-32 scale |
| `.au-py-{n}` | padding-block | 0-32 scale |
| `.au-pt-{n}` | padding-top | 0-32 scale |
| `.au-m-{n}` | margin | 0-32 scale, auto |
| `.au-mx-{n}` | margin-inline | 0-32 scale, auto |
| `.au-gap-{n}` | gap | 0-16 scale |

### Layout

| Class | CSS |
|-------|-----|
| `.au-flex` | `display: flex` |
| `.au-grid` | `display: grid` |
| `.au-block` | `display: block` |
| `.au-inline` | `display: inline` |
| `.au-hidden` | `display: none` |
| `.au-flex-row` | `flex-direction: row` |
| `.au-flex-col` | `flex-direction: column` |
| `.au-items-center` | `align-items: center` |
| `.au-items-start` | `align-items: flex-start` |
| `.au-items-end` | `align-items: flex-end` |
| `.au-justify-center` | `justify-content: center` |
| `.au-justify-between` | `justify-content: space-between` |
| `.au-flex-wrap` | `flex-wrap: wrap` |
| `.au-flex-1` | `flex: 1` |

### Typography

| Class Pattern | Property |
|---------------|----------|
| `.au-text-{size}` | font-size (xs-6xl) |
| `.au-font-{weight}` | font-weight |
| `.au-text-{color}` | color |
| `.au-text-center` | text-align: center |
| `.au-text-left` | text-align: left |
| `.au-truncate` | text truncation |

### Colors

| Class Pattern | Property |
|---------------|----------|
| `.au-bg-{color}` | background-color |
| `.au-text-{color}` | color |
| `.au-border-{color}` | border-color |

Color values: `primary`, `secondary`, `accent`, `neutral`, `success`, `warning`, `error`, `info` + scales (50-950)

### Borders

| Class Pattern | Property |
|---------------|----------|
| `.au-border` | border: 1px solid |
| `.au-border-{n}` | border-width |
| `.au-rounded-{size}` | border-radius |

### Shadows

| Class | shadow |
|-------|--------|
| `.au-shadow-none` | none |
| `.au-shadow-sm` | sm |
| `.au-shadow` | md |
| `.au-shadow-lg` | lg |
| `.au-shadow-xl` | xl |

### Sizing

| Class Pattern | Property |
|---------------|----------|
| `.au-w-{value}` | width |
| `.au-h-{value}` | height |
| `.au-min-w-{value}` | min-width |
| `.au-max-w-{value}` | max-width |

Values: `full` (100%), `screen` (100vw/vh), `auto`, spacing scale

### Position

| Class | CSS |
|-------|-----|
| `.au-relative` | position: relative |
| `.au-absolute` | position: absolute |
| `.au-fixed` | position: fixed |
| `.au-sticky` | position: sticky |
| `.au-inset-0` | inset: 0 |
| `.au-top-{n}` | top |
| `.au-right-{n}` | right |
| `.au-bottom-{n}` | bottom |
| `.au-left-{n}` | left |
| `.au-z-{level}` | z-index |

---

## Responsive Breakpoints

| Breakpoint | Min-width | Suffix |
|------------|-----------|--------|
| Base | 0px | (none) |
| sm | 640px | `-sm` |
| md | 768px | `-md` |
| lg | 1024px | `-lg` |
| xl | 1280px | `-xl` |

```css
/* Example responsive usage */
.au-hidden        /* hidden on all */
.au-hidden-md     /* hidden from md up */
.au-flex-md       /* flex from md up */
```

---

## State Modifiers

| Modifier | Trigger |
|----------|---------|
| `hover:` | `:hover` |
| `focus:` | `:focus-visible` |
| `active:` | `:active` |
| `disabled:` | `:disabled, [aria-disabled]` |

```html
<button class="au-bg-primary hover:au-bg-primary-dark">
  Hover me
</button>
```

---

## Component Composition

Components combine utilities with component-specific classes:

```html
<button class="
  au-btn
  au-btn--primary
  au-btn--md
  au-px-4
  au-py-2
  au-rounded-md
  au-font-medium
  hover:au-shadow-lg
">
  Click me
</button>
```

### Component Class Naming

```
.au-{component}             /* Base */
.au-{component}--{variant}  /* Variant */
.au-{component}--{size}     /* Size */
.au-{component}__element    /* Child element */
```

---

## Bundle Strategy

1. **Core utilities**: ~2KB - spacing, flex, text
2. **Extended**: ~4KB - full utility set
3. **Components**: Per-component CSS (~200B each)

All tree-shakeable via PurgeCSS/Lightning CSS.
