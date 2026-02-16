<p align="center">
  <img src="https://raw.githubusercontent.com/GiuseppeScottoLavina/AgentUI/main/assets/banner-400.webp" alt="AgentUI" width="400">
</p>

<h1 align="center">AgentUI</h1>

<p align="center">
  <strong>51 production-ready web components. Zero dependencies. One script tag.</strong>
</p>

<p align="center">
  <a href="https://giuseppescottolavina.github.io/AgentUI/demo/"><img src="https://img.shields.io/badge/🚀_Live_Demo-Try_It-6750A4?style=for-the-badge" alt="Live Demo"></a>
</p>

<p align="center">
  <a href="https://github.com/GiuseppeScottoLavina/AgentUI/actions/workflows/ci.yml"><img src="https://github.com/GiuseppeScottoLavina/AgentUI/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://www.npmjs.com/package/agentui-wc"><img src="https://img.shields.io/npm/v/agentui-wc?color=6750A4" alt="npm version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-blue" alt="License"></a>
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen" alt="Zero Dependencies">
  <img src="https://img.shields.io/badge/61KB_gzipped-brightgreen" alt="Bundle Size">
  <img src="https://img.shields.io/badge/Material_Design_3-6750A4?logo=materialdesign&logoColor=white" alt="MD3">
  <a href="https://pagespeed.web.dev/analysis?url=https://giuseppescottolavina.github.io/AgentUI/demo/"><img src="https://img.shields.io/badge/Lighthouse-100%2F100%2F100%2F100-brightgreen" alt="Lighthouse"></a>
</p>
<p align="center">
  <img src="https://img.shields.io/badge/W3C-Web_Components-005A9C?logo=w3c&logoColor=white" alt="W3C Web Components">
  <a href="./SECURITY.md"><img src="https://img.shields.io/badge/XSS-Safe-2ea44f?logo=shieldsdotio&logoColor=white" alt="XSS Safe"></a>
  <img src="https://img.shields.io/badge/CSP-Compatible-2ea44f?logo=shieldsdotio&logoColor=white" alt="CSP Compatible">
  <img src="https://img.shields.io/badge/eval()-None-2ea44f" alt="No eval()">
  <img src="https://img.shields.io/badge/tests-1949-blue" alt="1949 Tests">
</p>

---

```html
<au-card variant="elevated">
  <h2>Hello AgentUI!</h2>
  <au-button variant="filled">Get Started</au-button>
</au-card>
```

**Standard HTML. No framework. No build step.**

---

## What's Included

51 components covering everything you need:

| Category | Components |
|----------|------------|
| **Layout** | `au-stack`, `au-grid`, `au-container`, `au-layout`, `au-page`, `au-navbar`, `au-sidebar`, `au-drawer`, `au-bottom-nav`, `au-divider` |
| **Form** | `au-button`, `au-input`, `au-textarea`, `au-form`, `au-dropdown`, `au-checkbox`, `au-switch`, `au-radio`, `au-chip`, `au-prompt-input` |
| **Display** | `au-card`, `au-tabs`, `au-alert`, `au-badge`, `au-callout`, `au-progress`, `au-table`, `au-datatable`, `au-avatar`, `au-skeleton`, `au-code`, `au-message-bubble` |
| **Feedback** | `au-spinner`, `au-modal`, `au-confirm`, `au-toast`, `au-tooltip`, `au-error-boundary`, `au-splash` |
| **Structural** | `au-if`, `au-repeat`, `au-lazy`, `au-virtual-list`, `au-fetch`, `au-router` |
| **Utility** | `au-icon`, `au-theme-toggle`, `au-schema-form` |

---

## ⚡ Performance by Default

No Virtual DOM. No runtime framework overhead. Just native Custom Elements.

- **61KB total** — All 51 components, JS + CSS, gzipped. Smaller than most frameworks' "hello world".
- **Lighthouse 100/100/100/100** — [Verify it yourself →](https://pagespeed.web.dev/analysis?url=https://giuseppescottolavina.github.io/AgentUI/demo/)
- **DOM Speed** — 500 instantiations <8ms, 500 updates <3ms.
- **Zero Config** — One `<script>` tag. No bundler, no build step, no npm required.

## 🔒 Secure by Default

Security isn't an add-on — it's baked into every component from day one.

- **XSS-safe `html` template** — All interpolated values are auto-escaped. [Details →](./SECURITY.md)
- **CSP-compatible** — No `eval()`, no `Function()`, no `document.write`.
- **Zero dependencies** — Nothing in `node_modules`. No supply chain risk.

## 🏛️ Built on Standards

Built on W3C Web Components — native browser APIs with zero abstraction tax.

- **W3C Custom Elements** — Not a framework. Not a compiler. Native browser APIs.
- **Light DOM** — No Shadow DOM. Full `querySelector` access. Agents can inspect and modify any element directly.
- **Zero build step** — Works with a `<script>` tag. No bundler required.

---

## Design Choices

| Decision | AgentUI Approach | Trade-off |
|---|---|---|
| **Bundle** | All 51 components in 61KB gzipped | No tree-shaking — you load everything |
| **XSS** | Auto-escape `html` tagged template | Custom template syntax, not JSX |
| **Dependencies** | Zero | No ecosystem — you build what you need |
| **DOM** | Light DOM (no Shadow DOM) | Full access, but no style encapsulation |
| **Standard** | W3C Web Components | Newer ecosystem, smaller community |

---

## Try It — Zero Setup

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="stylesheet" href="https://unpkg.com/agentui-wc@latest/dist/agentui.css">
</head>
<body>
    <au-card variant="elevated">
        <h2>Hello AgentUI! 👋</h2>
        <au-button variant="filled">Get Started</au-button>
    </au-card>
    <script type="module" src="https://unpkg.com/agentui-wc@latest/dist/agentui.esm.js"></script>
</body>
</html>
```

> 💡 For **Lighthouse 100** scores, use the optimized template in [llms.txt](./llms.txt#L329) (non-blocking CSS, font preload, async JS).

**No npm. No config. No build step.** Just HTML.

---

## Engineering

| Metric | Value |
|--------|-------|
| **Tests** | 1949 (unit + E2E), 0 failures, 103 isolated test files |
| **Security** | XSS-audited, CSP-compatible, no `eval()`, [full policy →](./SECURITY.md) |
| **Memory** | Managed listeners (AbortController), zero leaks verified |
| **DOM Speed** | 500 instantiations <8ms, 500 updates <3ms |
| **Stability** | W3C Web Components — no framework version churn |

---

## 📚 Resources

| Resource | Description |
|----------|-------------|
| [🤖 Agent Guide](./AGENTS.md) | Framework concepts and component discovery |
| [🧩 Skill Guide](./SKILL.md) | Build recipes, templates, and patterns |
| [🛠️ Dev Guide](./AGENTS_DEV.md) | Extending framework with new components |
| [📋 llms.txt](./llms.txt) | Quick reference for LLMs/agents |
| [💡 Philosophy](./PHILOSOPHY.md) | The deeper "why" behind the design |
| [🔒 Security](./SECURITY.md) | Security policy |
| [📈 Roadmap](./ROADMAP.md) | Planned features and next steps |

---

## Contributing

Contributions of all kinds are welcome — bug reports, feature ideas, documentation improvements, and code.

See [CONTRIBUTING.md](./CONTRIBUTING.md) to get started, or [open a discussion](https://github.com/GiuseppeScottoLavina/AgentUI/discussions) if you want to talk first.

---

## Status

AgentUI is an **experimental** library (v0.1.x) — 51 components, 1949 tests, built by a single developer. Functional and tested, but still a work in progress.

Feedback, criticism, and stress-testing are welcome — [open a discussion](https://github.com/GiuseppeScottoLavina/AgentUI/discussions).

---

<p align="center">
  <sub>Apache-2.0 © 2026 Giuseppe Scotto Lavina</sub><br>
  <sub>Built for a world where humans and AI agents code together.</sub>
</p>
