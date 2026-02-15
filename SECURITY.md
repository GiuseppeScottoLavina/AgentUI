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

**Known limitation**: `style-src 'unsafe-inline'` is required because ~40 components set inline styles programmatically (e.g., `this.style.display = 'block'`). Removing this would require refactoring all components to use CSS classes exclusively.

### Server Security Headers

The development server (`server.js`) sets the following security headers on **all** responses:

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Content-Type-Options` | `nosniff` | Prevents MIME-type sniffing |
| `X-Frame-Options` | `DENY` | Prevents clickjacking |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limits referrer leakage |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Disables sensitive browser APIs |
| `Cross-Origin-Opener-Policy` | `same-origin` | Prevents cross-origin window access |

### Prototype Pollution Protection

The reactive store (`createStore`) blocks `__proto__`, `constructor`, and `prototype` keys from being set via the Proxy, preventing prototype pollution attacks.

### Zero Dependencies

The production bundle has **zero runtime dependencies**, eliminating supply chain risks.

### Safe Code Patterns

- ✅ No `eval()` or `Function()` calls
- ✅ No `document.write`
- ✅ No prototype pollution patterns (`__proto__` blocked in store)
- ✅ No hardcoded secrets or credentials
- ✅ `html` tagged template for automatic XSS-safe rendering
- ✅ Centralized `escapeHTML()` utility as internal safeguard
- ✅ `try/catch` around user-supplied regex patterns (ReDoS protection)
- ✅ Router page content sanitization (strips `<script>`, event handlers, `javascript:` URIs)
- ✅ Syntax highlighting mXSS defense (whitelist-only span tag output)
- ✅ Dynamic import path traversal protection (strict `au-[a-z0-9-]+` validation)
- ✅ localStorage type-checking against initialState schema (poisoning defense)
- ✅ CSS base path same-origin validation (DOM clobbering defense)
- ✅ `au-fetch` slot template sanitization (strip dangerous HTML from `<template>` slots)
- ✅ `/-/clear-cache` CSRF protection (POST-only method enforcement)

### Known Design Decisions

**`javascript:` URIs in `html` tag**: The `html` tagged template escapes HTML entities (`<`, `>`, `&`, `"`, `'`) but does **not** sanitize URL schemes. This means `html\`<a href="${'javascript:alert(1)}'>">\`` will pass through. This is the same behavior as React's JSX — URL validation is the developer's responsibility. Always validate URLs from user input before using them in `href` attributes:

```javascript
// ✅ Safe: validate URL scheme before rendering
const href = userInput.startsWith('http') ? userInput : '#';
element.innerHTML = html`<a href="${href}">Link</a>`;

// ❌ Risky: user-supplied URL directly in href
element.innerHTML = html`<a href="${userInput}">Link</a>`;
```

## Reporting a Vulnerability

Please report security vulnerabilities by opening an issue with the `security` label, or contact the maintainer directly.

**Response Time**: We aim to respond within 48 hours.

## Security Audit

Last audit: **2026-02-15** (v0.1.x) — **Round 2 (Deep Dive)**

### Round 1 — Surface Audit
- Server hardened with 5 security headers on all response paths
- Prototype pollution guard added to reactive store
- ReDoS protection added to schema form validation
- `au-agent-toolbar` migrated from raw template literal to `html` tagged template
- `javascript:` URI passthrough documented as design decision (same as React)
- CSP `unsafe-inline` for `style-src` documented as architectural limitation
- 21 new security tests

### Round 2 — Deep Dive (PortSwigger Grade)
- **R1**: `au-code` mXSS defense — `#sanitizeHighlighted()` whitelist validates highlight output
- **R2**: `au-router` page content sanitization — `_sanitizePageContent()` strips dangerous elements/attributes before innerHTML
- **R3**: Dynamic import path traversal protection — strict `/^au-[a-z0-9-]+$/` regex
- **R4**: `store.js` localStorage poisoning defense — type-check restored values against initialState
- **R5**: `au-icon` confirmed safe by design (parseInt + hardcoded map)
- **R6**: `AuElement._loadComponentCSS` same-origin CSS path validation
- 27 new security tests (5 mXSS + 10 router + 2 CSS + 10 store)

### Round 3 — Final Ultra-Deep
- **R7**: `au-fetch` slot template innerHTML injection — `#sanitizeSlotTemplate()` strips dangerous elements from `<template>` slots
- **R8**: `/-/clear-cache` CSRF DoS — POST-only method enforcement, GET returns 405
- 8 new security tests (6 fetch-template + 2 CSRF)

**Total security tests: 56** (Round 1: 21 + Round 2: 27 + Round 3: 8)

