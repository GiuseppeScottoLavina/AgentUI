# Message Protocol Specification

> **Version**: 1.0.0-draft  
> **Status**: Planning Phase

---

## Overview

AgentUI uses **LightBus** for all inter-component communication, following a strict message-based architecture. This enables:

1. **Decoupling**: Components don't know about each other
2. **Traceability**: All messages flow through a central bus
3. **AI-Friendly**: Predictable, structured communication

---

## Message Naming Convention

```
{category}:{component}:{action}

Examples:
  ui:button:click
  ui:input:change
  state:user:update
  nav:route:push
  app:init:complete
```

### Categories

| Category | Direction | Description |
|----------|-----------|-------------|
| `ui` | Component → App | UI events from user interaction |
| `state` | App → Components | State mutations |
| `nav` | Bidirectional | Navigation/routing |
| `app` | App → Components | Application lifecycle |

### Actions (naming convention)

| Type | Style | Examples |
|------|-------|----------|
| Events (emitted) | Past tense | `clicked`, `changed`, `focused`, `submitted` |
| Commands (listened) | Imperative | `update`, `setLoading`, `focus`, `reset` |
| Requests | Verb | `get`, `fetch`, `validate` |

---

## Message Envelope

```javascript
{
  // Routing
  type: "ui:button:click",        // Message type
  dest: "app" | "component-id",   // Destination (optional)
  
  // Payload
  data: {
    // Arbitrary payload
  },
  
  // Metadata (auto-populated by framework)
  _meta: {
    source: "button-123",         // Source component ID
    timestamp: 1705678901234,     // Unix timestamp
    correlationId: "uuid"         // For request/response
  }
}
```

---

## Standard Messages

### UI Events

| Message | Data | Description |
|---------|------|-------------|
| `ui:*:click` | `{ target, originalEvent? }` | Element clicked |
| `ui:*:focus` | `{ target }` | Element focused |
| `ui:*:blur` | `{ target }` | Element blurred |
| `ui:input:change` | `{ name, value, previousValue }` | Input value changed |
| `ui:form:submit` | `{ formData }` | Form submitted |
| `ui:modal:open` | `{ modalId }` | Modal opened |
| `ui:modal:close` | `{ modalId, reason }` | Modal closed |

### State Commands

| Message | Data | Description |
|---------|------|-------------|
| `state:update` | `{ path, value }` | Update state at path |
| `state:patch` | `{ path, patch }` | Merge patch at path |
| `state:reset` | `{ scope? }` | Reset state (optionally scoped) |
| `state:sync` | `{ snapshot }` | Sync entire state |

### Navigation

| Message | Data | Description |
|---------|------|-------------|
| `nav:push` | `{ path, params?, query? }` | Navigate to path |
| `nav:replace` | `{ path, params?, query? }` | Replace current route |
| `nav:back` | `{}` | Go back in history |
| `nav:forward` | `{}` | Go forward |
| `nav:changed` | `{ from, to, params }` | Route changed |

### Application Lifecycle

| Message | Data | Description |
|---------|------|-------------|
| `app:init` | `{ config }` | App initializing |
| `app:ready` | `{}` | App ready |
| `app:error` | `{ error, context }` | Global error |
| `app:theme:changed` | `{ theme }` | Theme switched |

---

## Component Message Patterns

### Pattern 1: Fire-and-Forget (emit)

```javascript
// In component
bus.emit('ui:button:click', { label: props.label });

// Listening in app
bus.on('ui:button:click', ({ label }) => {
  console.log(`Button "${label}" clicked`);
});
```

### Pattern 2: Request-Response

```javascript
// In component
const user = await bus.request('state:user:get', { id: userId });

// Handler
bus.handle('state:user:get', async ({ id }) => {
  return await fetchUser(id);
});
```

### Pattern 3: Broadcast

```javascript
// App broadcasts theme change
bus.broadcast('app:theme:changed', { theme: 'dark' });

// All components receive
bus.on('app:theme:changed', ({ theme }) => {
  updateLocalTheme(theme);
});
```

### Pattern 4: Targeted

```javascript
// Target specific component
bus.emit('ui:modal:close', { reason: 'confirm' }, 'settings-modal');
```

---

## Component Integration

### Auto-wiring from Schema

```javascript
const ButtonSchema = {
  name: 'Button',
  messages: {
    emit: ['ui:button:click'],
    listen: ['ui:button:setLoading', 'ui:button:setDisabled']
  }
};

// Framework auto-generates:
// 1. emit helper: ctx.emit('ui:button:click', data)
// 2. listeners for setLoading/setDisabled
```

### Manual Subscription

```javascript
// Subscribe to events with auto-cleanup
const sub = bus.on('state:form:reset', () => {
  // Reset local state
});

// Cleanup when done
sub.unsubscribe();
```

---

## Message Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         APPLICATION                              │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                      LIGHTBUS (Hub)                         │ │
│  │                                                             │ │
│  │   on('ui:*')     on('state:*')     on('nav:*')             │ │
│  │       ▲               │                 ▲                  │ │
│  └───────┼───────────────┼─────────────────┼──────────────────┘ │
│          │               │                 │                    │
│          │      emit     │     emit        │                    │
│          │   ┌───────────┴───────────┐     │                    │
│          │   ▼                       ▼     │                    │
│  ┌───────────────┐           ┌───────────────┐                  │
│  │   Component   │           │   Component   │                  │
│  │   (Button)    │           │   (Input)     │                  │
│  │               │           │               │                  │
│  │ emit('click') │           │ emit('change')│                  │
│  └───────────────┘           └───────────────┘                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Error Handling

### Unhandled Messages

```javascript
// DEV mode: warn on unhandled messages
bus.on('*', (data, envelope) => {
  if (!envelope._handled && process.env.NODE_ENV !== 'production') {
    console.warn(`Unhandled message: ${envelope.type}`);
  }
});
```

### Timeout Configuration

```javascript
// Request timeout (default 30s)
await bus.request('state:data:fetch', data, dest, { 
  timeout: 5000 
});
```

---

## DevTools Integration

Message flow can be logged/inspected:

```javascript
// Enable message tracing
AgentUI.enableMessageTrace((envelope) => {
  console.log(`[${envelope.type}]`, envelope.data);
});
```
