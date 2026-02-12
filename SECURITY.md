# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | ✅ Actively maintained |

## Security Features

AgentUI is designed with security as a core principle:

### XSS-Safe Rendering — `html` Tagged Template

The `html` tagged template **automatically escapes** all interpolated values:

```javascript
import { html, safe } from 'agentui-wc';

// ✅ All values auto-escaped — XSS impossible
const userInput = '<script>alert("xss")</script>';
element.innerHTML = html`<h2>${userInput}</h2>`;
// → <h2>&lt;script&gt;alert("xss")&lt;/script&gt;</h2>

// ✅ Use safe() only for trusted HTML you control
const icon = '<au-icon name="home"></au-icon>';
element.innerHTML = html`<div>${safe(icon)}</div>`;

// ❌ Raw template literals bypass protection
element.innerHTML = `<h2>${userInput}</h2>`; // XSS RISK!
```

### Internal Component Protection

`escapeHTML()` is applied in **20 components** that interpolate user-facing content into HTML:
au-api-table, au-button, au-checkbox, au-chip, au-confirm, au-datatable, au-drawer-item, au-dropdown, au-error-boundary, au-example, au-icon, au-input, au-prompt-ui, au-radio, au-repeat, au-router, au-schema-form, au-switch, au-textarea, au-virtual-list.

Remaining components that use `innerHTML` fall into safe categories:
- **Static markup** (au-spinner, au-skeleton, au-progress, etc.) — no user input interpolated
- **Author-provided slot content** (au-alert, au-toast, au-modal) — trusted HTML from page author
- **Developer callbacks** (au-virtual-list, au-repeat, au-fetch) — render functions are developer-controlled (same pattern as React)

### Content Security Policy (CSP)

Demo pages include CSP headers:

```html
<meta http-equiv="Content-Security-Policy"
    content="default-src 'self'; 
             script-src 'self' 'unsafe-inline'; 
             style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
             font-src 'self' https://fonts.gstatic.com; 
             img-src 'self' data:; 
             connect-src 'self';
             frame-ancestors 'none';">
```

**Features**:
- `frame-ancestors 'none'` - Prevents clickjacking
- `connect-src 'self'` - Prevents data exfiltration
- No `'unsafe-eval'` - Blocks dynamic code execution

### Zero Dependencies

The production bundle has **zero runtime dependencies**, eliminating supply chain risks.

### Safe Code Patterns

- ✅ No `eval()` or `Function()` calls
- ✅ No `document.write`
- ✅ No prototype pollution patterns (`__proto__`)
- ✅ No hardcoded secrets or credentials
- ✅ `html` tagged template for automatic XSS-safe rendering
- ✅ Centralized `escapeHTML()` utility as internal safeguard

## Reporting a Vulnerability

Please report security vulnerabilities by opening an issue with the `security` label, or contact the maintainer directly.

**Response Time**: We aim to respond within 48 hours.

## Security Audit

Last audit: **2026-02-07** (v0.1.x)

- Full codebase review completed
- `html` tagged template added for automatic XSS-safe rendering
- `safe()` opt-out for trusted HTML with explicit developer intent
- 20 components with explicit XSS protection via `escapeHTML()`
- All remaining innerHTML usage audited and classified as safe
- Developer callback patterns (renderItem) documented with safety guidance
