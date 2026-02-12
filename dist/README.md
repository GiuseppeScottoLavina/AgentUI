<p align="center">
  <img src="https://raw.githubusercontent.com/GiuseppeScottoLavina/AgentUI/main/assets/banner-400.webp" alt="AgentUI" width="400">
</p>

<h1 align="center">AgentUI</h1>

<p align="center">
  <strong>50 web components that tell AI agents what they can do.</strong>
</p>

<p align="center">
  <a href="https://giuseppescottolavina.github.io/AgentUI/demo/"><img src="https://img.shields.io/badge/🚀_Live_Demo-Try_It-6750A4?style=for-the-badge" alt="Live Demo"></a>
</p>

<p align="center">
  <a href="https://github.com/GiuseppeScottoLavina/AgentUI/actions/workflows/ci.yml"><img src="https://github.com/GiuseppeScottoLavina/AgentUI/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://www.npmjs.com/package/agentui-wc"><img src="https://img.shields.io/npm/v/agentui-wc?color=6750A4" alt="npm version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-blue" alt="License"></a>
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen" alt="Zero Dependencies">
  <img src="https://img.shields.io/badge/60KB_gzipped-brightgreen" alt="Bundle Size">
  <img src="https://img.shields.io/badge/Material_Design_3-6750A4?logo=materialdesign&logoColor=white" alt="MD3">
  <a href="https://pagespeed.web.dev/analysis?url=https://giuseppescottolavina.github.io/AgentUI/demo/"><img src="https://img.shields.io/badge/Lighthouse-100%2F100%2F100%2F100-brightgreen" alt="Lighthouse"></a>
</p>
<p align="center">
  <img src="https://img.shields.io/badge/W3C-Web_Components-005A9C?logo=w3c&logoColor=white" alt="W3C Web Components">
  <a href="./SECURITY.md"><img src="https://img.shields.io/badge/XSS-Safe-2ea44f?logo=shieldsdotio&logoColor=white" alt="XSS Safe"></a>
  <img src="https://img.shields.io/badge/CSP-Compatible-2ea44f?logo=shieldsdotio&logoColor=white" alt="CSP Compatible">
  <img src="https://img.shields.io/badge/eval()-None-2ea44f" alt="No eval()">
  <img src="https://img.shields.io/badge/tests-1670+-blue" alt="1670+ Tests">
</p>

---

```javascript
// Any agent can ask any component what it is and how to use it
customElements.get('au-button').describe()
// → { props: { variant: ['filled','outlined','text'], disabled: 'boolean' },
//     events: ['au-click'],
//     examples: ['<au-button variant="filled">Save</au-button>'] }

// Or discover the entire framework at once
const components = await AgentUI.discoverAll()
// → 50 components, fully documented, at runtime — no docs lookup needed
```

**No hallucinations. No guessing the API. The UI describes itself.**

---

## ⚡ Performance by Default

No Virtual DOM. No runtime framework overhead. Just native Custom Elements doing native things.

- **60KB total** — All 50 components, JS + CSS, gzipped. Smaller than most frameworks' "hello world".
- **Lighthouse 100/100/100/100** — Performance, Accessibility, Best Practices, SEO. [Verify it yourself →](https://pagespeed.web.dev/analysis?url=https://giuseppescottolavina.github.io/AgentUI/demo/)
- **DOM Speed** — 500 instantiations <8ms, 500 updates <3ms.
- **Zero Config** — One `<script>` tag. No bundler, no build step, no npm required.
- **`au-ready` Event** — Framework fires `au-ready` when all 50 components are registered. No `setTimeout` hacks.

## 🔒 Secure by Default

Security isn't an add-on — it's baked into every component from day one.

- **XSS-safe `html` template** — All interpolated values are auto-escaped. [Details →](./SECURITY.md)
- **20 components** with explicit `escapeHTML()` protection on user-facing content.
- **CSP-compatible** — No `eval()`, no `Function()`, no `document.write`. Works with strict Content Security Policy.
- **Zero dependencies** — Nothing in `node_modules`. No supply chain risk. No `npm audit` surprises. Ever.

## 🏛️ Built on Standards — No Migration Treadmill

Built on W3C Web Components. The same APIs that work today worked in 2018 and will work in 2030.

- **W3C Custom Elements** — Not a framework. Not a compiler. Native browser APIs with zero abstraction tax.
- **Light DOM** — No Shadow DOM. Full `querySelector` access. Agents can inspect and modify anything.
- **No breaking changes** — No React 16→17→18→19... No Angular version roulette. The platform IS the framework.
- **`querySelector` has worked since 1998** — and it will work the same way in your next project, and the one after that.

---

## 🤖 Self-Describing Components

What makes AgentUI different from every other component library:

AI agents already write excellent code. The problem isn't code generation — it's **runtime knowledge**. An agent can write a React form from memory, but it can't ask a running application what components are available or what props they accept.

AgentUI gives agents something no other framework does: **runtime introspection of the entire component surface** — props, events, slots, and working examples — without relying on training data or documentation that may be outdated.

<p align="center">
  <a href="./PHILOSOPHY.md"><strong>📖 Read the full Philosophy →</strong></a>
</p>

---

## How It Compares

| | AgentUI | Typical Framework |
|---|---|---|
| **Agent Introspection** | `describe()` on every component — runtime API discovery | None — agents rely on memorized docs |
| **Bundle** | 60KB gzipped (JS+CSS), all 50 components | Tree-shake to ~20KB, then add deps |
| **Performance** | Lighthouse 100/100/100/100 ([verify](https://pagespeed.web.dev/analysis?url=https://giuseppescottolavina.github.io/AgentUI/demo/)) | Varies |
| **XSS Protection** | Auto-escape `html` template + `escapeHTML()` in 20 components | Trust your deps |
| **Dependencies** | Zero. Forever. | npm audit anxiety |
| **CSP** | No `eval()`, no `Function()` — strict CSP compatible | Often requires `unsafe-eval` |
| **Stability** | W3C Web Components — same API since 2018 | React 16→17→18→19... |
| **Accessibility** | ARIA roles, 48px touch targets, keyboard navigation | Add-on library |

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
| **Tests** | 1670+ (unit + E2E), 0 failures, 113 isolated test files |
| **Security** | XSS-audited, CSP-compatible, no `eval()`, [full policy →](./SECURITY.md) |
| **Memory** | Managed listeners (AbortController), zero leaks verified |
| **DOM Speed** | 500 instantiations <8ms, 500 updates <3ms |
| **Stability** | W3C Web Components — no framework migration treadmill |
| **Agent Docs** | [AGENTS.md](./AGENTS.md) (usage), [AGENTS_DEV.md](./AGENTS_DEV.md) (extending), [llms.txt](./llms.txt), [component-schema.json](./component-schema.json) |

> 💡 **Long-term maintainability by design** — `querySelector` has worked the same since 1998 and will work the same in 2030. Zero dependencies means zero abandoned transitive packages and zero "waiting for library X to support framework Y."

---

## 📚 Resources

| Resource | Description |
|----------|-------------|
| [🤖 Agent Guide](./AGENTS.md) | Using components to build apps |
| [🛠️ Dev Guide](./AGENTS_DEV.md) | Extending framework with new components |
| [📋 llms.txt](./llms.txt) | Quick reference for LLMs/agents |
| [💡 Philosophy](./PHILOSOPHY.md) | The deeper "why" behind the design |
| [🔒 Security](./SECURITY.md) | Security policy |
| [📈 Roadmap](./ROADMAP.md) | Planned features and next steps |

---

## Contributing

We welcome contributions of all kinds — bug reports, feature ideas, documentation improvements, and code.

See [CONTRIBUTING.md](./CONTRIBUTING.md) to get started, or [open a discussion](https://github.com/GiuseppeScottoLavina/AgentUI/discussions) if you want to talk first.

---

## Status

AgentUI is in **alpha** (v0.1.x). The 50 components, agent API, and build system are stable and used in real projects. The API surface may evolve before v1.0.

We're building in public — [watch the progress](https://github.com/GiuseppeScottoLavina/AgentUI), [give feedback](https://github.com/GiuseppeScottoLavina/AgentUI/discussions), or [dive in](./CONTRIBUTING.md).

---

<p align="center">
  <sub>Apache-2.0 © 2026 Giuseppe Scotto Lavina</sub><br>
  <sub>Built for a world where humans and AI agents code together.</sub>
</p>
