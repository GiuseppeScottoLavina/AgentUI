# Design System

AgentUI implements Material Design 3 (Material You) tokens and styling.

## Color Tokens

### System Colors

```css
/* Primary */
--md-sys-color-primary
--md-sys-color-on-primary
--md-sys-color-primary-container
--md-sys-color-on-primary-container

/* Secondary */
--md-sys-color-secondary
--md-sys-color-on-secondary

/* Tertiary */
--md-sys-color-tertiary
--md-sys-color-on-tertiary

/* Error */
--md-sys-color-error
--md-sys-color-on-error

/* Surface */
--md-sys-color-surface
--md-sys-color-on-surface
--md-sys-color-surface-variant
--md-sys-color-surface-container
--md-sys-color-surface-container-low
--md-sys-color-surface-container-high

/* Outline */
--md-sys-color-outline
--md-sys-color-outline-variant
```

### Usage

```html
<div style="background: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary);">
    Primary surface
</div>
```

---

## Typography

### Type Scale

```css
/* Display */
--md-sys-typescale-display-large-size: 57px;
--md-sys-typescale-display-medium-size: 45px;
--md-sys-typescale-display-small-size: 36px;

/* Headline */
--md-sys-typescale-headline-large-size: 32px;
--md-sys-typescale-headline-medium-size: 28px;
--md-sys-typescale-headline-small-size: 24px;

/* Title */
--md-sys-typescale-title-large-size: 22px;
--md-sys-typescale-title-medium-size: 16px;
--md-sys-typescale-title-small-size: 14px;

/* Body */
--md-sys-typescale-body-large-size: 16px;
--md-sys-typescale-body-medium-size: 14px;
--md-sys-typescale-body-small-size: 12px;

/* Label */
--md-sys-typescale-label-large-size: 14px;
--md-sys-typescale-label-medium-size: 12px;
--md-sys-typescale-label-small-size: 11px;
```

---

## Shape (Border Radius)

```css
--md-sys-shape-corner-none: 0;
--md-sys-shape-corner-extra-small: 4px;
--md-sys-shape-corner-small: 8px;
--md-sys-shape-corner-medium: 12px;
--md-sys-shape-corner-large: 16px;
--md-sys-shape-corner-extra-large: 28px;
--md-sys-shape-corner-full: 9999px;
```

---

## Elevation (Shadows)

```css
--md-sys-elevation-level0: none;
--md-sys-elevation-level1: 0 1px 2px rgba(0,0,0,0.3), 0 1px 3px 1px rgba(0,0,0,0.15);
--md-sys-elevation-level2: 0 1px 2px rgba(0,0,0,0.3), 0 2px 6px 2px rgba(0,0,0,0.15);
--md-sys-elevation-level3: 0 1px 3px rgba(0,0,0,0.3), 0 4px 8px 3px rgba(0,0,0,0.15);
--md-sys-elevation-level4: 0 2px 3px rgba(0,0,0,0.3), 0 6px 10px 4px rgba(0,0,0,0.15);
--md-sys-elevation-level5: 0 4px 4px rgba(0,0,0,0.3), 0 8px 12px 6px rgba(0,0,0,0.15);
```

---

## Motion

```css
/* Duration */
--md-sys-motion-duration-short1: 50ms;
--md-sys-motion-duration-short2: 100ms;
--md-sys-motion-duration-medium1: 250ms;
--md-sys-motion-duration-medium2: 300ms;

/* Easing */
--md-sys-motion-easing-standard: cubic-bezier(0.2, 0, 0, 1);
--md-sys-motion-easing-emphasized: cubic-bezier(0.2, 0, 0, 1);
```

---

## Spacing

```css
--au-spacing-1: 4px;
--au-spacing-2: 8px;
--au-spacing-3: 12px;
--au-spacing-4: 16px;
--au-spacing-6: 24px;
--au-spacing-8: 32px;
```

---

## Dark Mode

Dark mode is automatic based on system preference, or can be forced:

```html
<!-- Force dark -->
<html data-theme="dark">

<!-- Force light -->
<html data-theme="light">

<!-- System (default) -->
<html>
```

Toggle programmatically:

```javascript
import { Theme } from 'agentui-wc';
Theme.toggle();
```

Or use the component:

```html
<au-theme-toggle></au-theme-toggle>
```

### Custom Dark Theme Setup

If you're implementing your own dark theme, define these **critical CSS variables**:

```css
[data-theme="dark"] {
    /* Required Surface Colors */
    --md-sys-color-surface: #121212;
    --md-sys-color-surface-variant: #1e1e1e;
    --md-sys-color-surface-container: #1a1a1a;
    --md-sys-color-surface-container-low: #151515;
    --md-sys-color-surface-container-high: #252525;
    
    /* Required On-Surface (text) Colors */
    --md-sys-color-on-surface: #e0e0e0;
    --md-sys-color-on-surface-variant: rgba(255, 255, 255, 0.7);
    
    /* Required Outline Colors */
    --md-sys-color-outline: rgba(255, 255, 255, 0.12);
    --md-sys-color-outline-variant: rgba(255, 255, 255, 0.08);
    
    /* Primary (your brand color) */
    --md-sys-color-primary: #bb86fc;
    --md-sys-color-on-primary: #000;
    --md-sys-color-primary-container: #3700b3;
    --md-sys-color-on-primary-container: #e0b6ff;
    
    /* Secondary */
    --md-sys-color-secondary: #03dac6;
    --md-sys-color-on-secondary: #000;
    
    /* Error */
    --md-sys-color-error: #cf6679;
    --md-sys-color-on-error: #000;
}
```

> **Tip:** AgentUI's default tokens.css includes a complete dark theme. Only define these if you're overriding the defaults.

---

## Customizing Tokens

Override tokens in your CSS:

```css
:root {
    /* Custom primary color */
    --md-ref-palette-primary40: #1976D2;
    --md-ref-palette-primary80: #90CAF9;
    
    /* Custom font */
    --md-sys-typescale-font: 'Inter', sans-serif;
}
```
