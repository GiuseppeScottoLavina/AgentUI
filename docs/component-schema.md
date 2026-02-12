# Component Schema Specification

> **Version**: 1.0.0-draft  
> **Status**: Planning Phase

---

## Overview

AgentUI components are defined via **JSON schemas** that are compiled at definition-time into optimized render functions. This approach is AI-optimal because:

1. **Structured**: Entirely JSON-serializable, easy to generate/modify
2. **Introspectable**: Full metadata available at runtime
3. **Validated**: Schema errors caught at definition-time, not render-time
4. **Zero-cost**: Compilation eliminates runtime overhead

---

## Schema Structure

```javascript
{
  // Required
  "name": "Button",              // PascalCase, unique identifier
  
  // Optional metadata
  "description": "Interactive button component",
  "category": "input",           // layout|input|feedback|overlay|data|nav
  "version": "1.0.0",
  
  // Props definition
  "props": {
    "propName": { /* PropDefinition */ }
  },
  
  // Slots definition
  "slots": {
    "slotName": { /* SlotDefinition */ }
  },
  
  // EventBus messages
  "messages": {
    "emit": ["category:component:action"],
    "listen": ["category:component:action"]
  },
  
  // CSS Variables used (for documentation/theming)
  "cssVars": [
    "--au-color-primary",
    "--au-radius-md"
  ]
}
```

---

## PropDefinition

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | `PropType` | ✅ | Data type |
| `required` | `boolean` | ❌ | Default: `false` |
| `default` | `any` | ❌ | Default value |
| `values` | `string[]` | ❌ | For `enum` type only |
| `description` | `string` | ❌ | Human/AI readable |
| `validate` | `function` | ❌ | Custom validator |

### PropType Values

| Type | Description | Example Default |
|------|-------------|-----------------|
| `string` | Text value | `""` |
| `number` | Numeric value | `0` |
| `boolean` | True/false | `false` |
| `object` | Object/map | `{}` |
| `array` | Array/list | `[]` |
| `function` | Callback | `() => {}` |
| `enum` | One of `values` | First value |
| `action` | Event handler (semantic) | `null` |
| `node` | uhtml template/component | `null` |

---

## Complete Example: Button

```javascript
const ButtonSchema = {
  name: "Button",
  description: "Primary action trigger",
  category: "input",
  
  props: {
    // Content
    label: {
      type: "string",
      required: true,
      description: "Button text"
    },
    
    // Appearance
    variant: {
      type: "enum",
      values: ["primary", "secondary", "ghost", "danger"],
      default: "primary",
      description: "Visual style variant"
    },
    size: {
      type: "enum",
      values: ["sm", "md", "lg"],
      default: "md",
      description: "Size preset"
    },
    
    // State
    disabled: {
      type: "boolean",
      default: false,
      description: "Disable interaction"
    },
    loading: {
      type: "boolean",
      default: false,
      description: "Show loading state"
    },
    
    // Behavior
    type: {
      type: "enum",
      values: ["button", "submit", "reset"],
      default: "button",
      description: "HTML button type"
    },
    
    // Events (semantic actions)
    onClick: {
      type: "action",
      description: "Click handler"
    }
  },
  
  slots: {
    default: {
      description: "Button content (overrides label)"
    },
    icon: {
      description: "Leading icon"
    },
    iconEnd: {
      description: "Trailing icon"
    }
  },
  
  messages: {
    emit: [
      "ui:button:click",
      "ui:button:focus",
      "ui:button:blur"
    ],
    listen: [
      "ui:button:setLoading",
      "ui:button:setDisabled"
    ]
  },
  
  cssVars: [
    "--au-color-primary",
    "--au-color-primary-dark",
    "--au-radius-md",
    "--au-font-weight-medium",
    "--au-shadow-sm",
    "--au-duration-fast"
  ]
};
```

---

## Schema Compilation

At definition-time, the schema compiles into:

1. **Default resolver function**: Pre-computed defaults object
2. **Prop validator**: DEV-only validation (stripped in prod)
3. **Message bindings**: Auto-wired EventBus listeners
4. **CSS class generator**: Based on variant/size props

```javascript
// Compilation output (conceptual)
{
  defaults: { variant: "primary", size: "md", disabled: false, loading: false, type: "button" },
  required: ["label"],
  variantClasses: { primary: "au-btn--primary", secondary: "au-btn--secondary", ... },
  sizeClasses: { sm: "au-btn--sm", md: "au-btn--md", lg: "au-btn--lg" }
}
```

---

## Initial Component Library (10 Components)

| Component | Category | Priority | Schema Complexity |
|-----------|----------|----------|-------------------|
| `Button` | input | P0 | Medium |
| `Input` | input | P0 | High |
| `Stack` | layout | P0 | Low |
| `Text` | typography | P0 | Low |
| `Card` | layout | P1 | Low |
| `Modal` | overlay | P1 | High |
| `Alert` | feedback | P1 | Medium |
| `Spinner` | feedback | P1 | Low |
| `Select` | input | P2 | High |
| `Tabs` | nav | P2 | High |

---

## Validation Rules

### Name Pattern
- Must be PascalCase: `/^[A-Z][a-zA-Z0-9]+$/`
- Must be unique in registry

### Props
- `required` cannot have `default`
- `enum` must have non-empty `values`
- `action` type implies event handler semantics

### Messages
- Format: `category:component:action`
- Categories: `ui`, `state`, `nav`, `app`
- Actions use past tense for emits: `clicked`, `changed`
- Actions use imperative for listens: `setLoading`, `focus`
