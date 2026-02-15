# AgentUI: Design Decisions & Trade-offs

> **Why AgentUI makes unusual choices — and the reasoning behind them.**

If you're coming from React, Angular, or Vue, some of AgentUI's architectural decisions might seem unconventional. This document explains the reasoning behind each choice and the trade-offs involved.

---

## 🎯 Design Goals

AgentUI explores two ideas:

### 1. Reducing Friction for AI Agents

**AgentUI is designed so AI agents and human developers can work together with minimal friction.**

This doesn't mean humans are an afterthought — it means every design decision considers what makes both agents *and* humans productive, with a deliberate focus on reducing ambiguity that AI agents struggle with.

#### The Hypothesis

Frameworks designed for human developers rely on conventions, implicit behaviors, and DSLs that humans learn over time. AI agents, being probabilistic systems, may produce fewer errors when working with explicit, inspectable interfaces that use standard web APIs — because those APIs appear extensively in their training data and behave deterministically at runtime.

This is an unproven hypothesis. AgentUI exists to test it.

#### Concrete Example: Form Building

**Framework approach (pseudocode):**
```jsx
// Agent needs framework-specific knowledge:
// - Component lifecycle, state management, build tooling, DSL syntax
const [email, setEmail] = useState('');
return <Input value={email} onChange={e => setEmail(e.target.value)} />;
```

**AgentUI approach:**
```html
<!-- Standard HTML + standard DOM APIs -->
<au-form id="myForm">
  <au-input label="Email" name="email" type="email" required></au-input>
  <au-button variant="filled">Submit</au-button>
</au-form>

<script>
  document.getElementById('myForm')
    .addEventListener('au-submit', (e) => {
      console.log(e.detail); // { email: 'user@example.com' }
    });
</script>
```

The second approach uses web standards that appear extensively in LLM training data. Whether this measurably reduces agent errors is the open question.

### 2. Long-Term Stability

**Your code should work in 5 years without rewrites.**

Framework version upgrades are a real cost: dependency breakage, migration effort, and the "waiting for library X to support framework Y" problem. AgentUI tries to minimize this by building on W3C standards with zero external dependencies.

- Built on **W3C Web Components** — a standard, not a framework
- **Zero external dependencies** — no transitive version conflicts
- **50 components** included — no dependency matrix to manage

**Trade-off acknowledged:** Standards evolve too (Web Components v0 → v1 was a breaking change). "Standards-based" reduces churn but doesn't eliminate it.

> **Light DOM choice:** Shadow DOM is excellent for encapsulation, but it adds complexity for AI agents. They can't easily `querySelector` into it, can't style it with standard CSS, and can't reliably extract component state. Light DOM means agents work with AgentUI the same way they work with any HTML page — and human developers can debug it with standard browser DevTools.

---

## 1. No Declarative Conditionals

**What you're used to:**
```jsx
// React: {isLoggedIn && <UserProfile />}
// Angular: <div *ngIf="isLoggedIn">...</div>
// Vue: <div v-if="isLoggedIn">...</div>
```

**What AgentUI does instead:**
```javascript
// Option 1: Hidden attribute
document.querySelector('.user-profile').hidden = !isLoggedIn;

// Option 2: DOM manipulation
if (isLoggedIn) {
    container.innerHTML = `<au-card>...</au-card>`;
}
```

**Why:**

| Aspect | Declarative DSL | Imperative (AgentUI) |
|--------|----------------|----------------------|
| Mental model | Reactive binding DSL | Standard DOM API |
| Training data coverage | Framework-specific | Universal JavaScript |
| Debugging | Virtual DOM diffing | Direct DOM inspection |
| Predictability | Framework-managed | Explicit control |

**Trade-off acknowledged:** Declarative templates are more concise for humans. AgentUI optimizes for predictability over brevity.

---

## 2. No Virtual DOM

**What most frameworks do:**
React, Vue, and others use a Virtual DOM to batch updates and minimize actual DOM mutations.

**What AgentUI does instead:**
Direct DOM manipulation through Web Components.

**Why:**

The Virtual DOM exists to solve a *human* problem: developers can't easily reason about which DOM nodes need updating. So frameworks abstract this away.

AI agents don't have this limitation. They can:
- Generate complete HTML in one pass
- Track exactly what needs to change
- Apply surgical updates without diffing overhead

```javascript
// Direct update — no diffing needed
this.querySelector('.count').textContent = newCount;
```

**Trade-off acknowledged:** For highly interactive UIs with frequent micro-updates, Virtual DOM can be more efficient. AgentUI optimizes for the common case: AI-generated pages with moderate interactivity.

---

## 3. Light DOM over Shadow DOM

**What the spec recommends:**
Shadow DOM for style encapsulation.

**What AgentUI does instead:**
Light DOM with `au-*` CSS class prefixes.

```html
<!-- AgentUI: Light DOM -->
<au-button class="au-button au-button--filled">
    <span class="au-button__label">Save</span>
</au-button>

<!-- Shadow DOM approach -->
<my-button>
    #shadow-root
        <button class="internal">Save</button>
</my-button>
```

**Why:**

| Aspect | Shadow DOM | Light DOM (AgentUI) |
|--------|-----------|---------------------|
| Global styles | ❌ Blocked | ✅ Work as expected |
| CSS debugging | Hard | Easy |
| E2E testing | Piercing required | Standard selectors |
| AI styling | Complex | `querySelector` works |

**Trade-off acknowledged:** Light DOM requires discipline with class naming. The `au-` prefix convention prevents collisions, but doesn't provide true encapsulation.

---

## 4. No JSX or Template DSL

**What most frameworks use:**
JSX, Angular templates, Vue SFCs — each with its own syntax and build requirements.

**What AgentUI does instead:**
```javascript
import { html, safe } from '../core/utils.js';

// html`` auto-escapes all interpolations by default
this.innerHTML = html`
    <au-card>
        <h2>${title}</h2>
        ${safe(trustedContent)}
    </au-card>
`;
```

**Why:**

1. **Training data**: AI models are trained on far more raw HTML than JSX
2. **No transpilation**: Template literals work directly in browsers
3. **Secure by default**: `html` tagged template auto-escapes all interpolations — use `safe()` only for trusted HTML
4. **Zero build step**: No bundler required

**Trade-off acknowledged:** Template literals lack the ergonomics of JSX for complex component composition. AgentUI targets UI generation, not manual authoring.

---

## 5. Smart Bundle Architecture (61KB Critical Path)

**The tree-shaking argument:**
"I only use 3 components, why download all 50?"

**AgentUI's response:**

The 61KB figure is the **critical path only** — the initial shell that loads instantly. Routes and content are lazy-loaded on demand.

### How It Actually Works

```
Initial Load (61KB gzipped):
┌────────────────────────────────────────────────┐
│ agentui.css + shell.js (critical components)  │
│ → App shell renders immediately               │
└────────────────────────────────────────────────┘
                    ↓
On Navigation (lazy):
┌────────────────────────────────────────────────┐
│ dist/routes/{page}.js  → Component bundle     │
│ content/{page}.html    → Page content         │
└────────────────────────────────────────────────┘
```

### Performance Techniques

| Technique | What It Does |
|-----------|--------------|
| **Route-based code splitting** | Each page loads its own JS bundle on demand |
| **Speculation Rules API** | Browser prefetches likely next routes |
| **`content-visibility: auto`** | Off-screen components skip rendering |
| **`requestIdleCallback`** | Deferred loading of non-critical bundles |
| **View Transitions API** | Smooth page transitions without full reload |

```javascript
// Lazy route loading
async function loadRoute(name) {
    if (loadedRoutes.has(name)) return;
    loadedRoutes.add(name);
    await import('../dist/routes/' + name + '.js');
}

// Prefetch on hover
item.addEventListener('mouseenter', () => loadRoute(pageId));
```

**Result:** 100/100 Lighthouse Performance with all 50 components available.
[**→ Verify it yourself on PageSpeed Insights**](https://pagespeed.web.dev/analysis?url=https://giuseppescottolavina.github.io/AgentUI/demo/)

**Trade-off acknowledged:** The initial 61KB is larger than a minimal tree-shaken app. But the lazy loading architecture means subsequent pages load only what they need, and the developer experience is zero-config.

---

## 6. Imperative Event Handling

**What most frameworks do:**
```jsx
// Declarative binding
<button onClick={handleClick}>Save</button>
```

**What AgentUI does instead:**
```javascript
connectedCallback() {
    super.connectedCallback();
    this.listen(this.querySelector('button'), 'click', () => this.save());
}
```

**Why:**

1. **Explicit lifecycle**: Events are registered when the component connects
2. **Automatic cleanup**: `this.listen()` uses AbortController — no memory leaks
3. **Debuggable**: You can see exactly what's listening to what
4. **No magic**: The connection between element and handler is explicit

```javascript
// this.listen() under the hood
this.listen(target, 'click', handler);
// Equivalent to:
target.addEventListener('click', handler, { signal: this.#abortController.signal });
```

**Trade-off acknowledged:** More verbose than declarative binding. But AI agents don't care about verbosity — they care about correctness and predictability.

---

## Design Decisions Summary

| Decision | AgentUI Approach | Rationale |
|----------|----------------|-----------|
| Conditionals | Imperative DOM | Training data universality |
| Rendering | Direct DOM | Simpler mental model for agents |
| Encapsulation | Light DOM | Global accessibility for inspection |
| Templates | Tagged template literals | No transpilation, secure by default |
| Bundling | Monolithic + lazy loading | Zero config |
| Events | Explicit `.listen()` | Predictable lifecycle |

---

## FAQ

### "But I'm a human developer, should I use AgentUI?"

**Honestly, it depends:**
- You're building with AI assistants and want to test if they're more productive → **Try it**
- You want zero-config deployment → **Try it**
- You prefer explicit over magic → **Try it**
- You need maximum bundle optimization for a massive SPA → **Probably not the best fit**
- Your team is deeply invested in React/Vue patterns → **It may not be worth switching**

AgentUI isn't for everyone, and that's fine.

### "Isn't this just going backwards?"

No. It's going *sideways* to optimize for a different constraint.

Traditional frameworks optimize for:
- Human developer productivity
- Team collaboration patterns
- IDE autocomplete ergonomics

AgentUI optimizes for:
- AI agent productivity
- Zero configuration deployment
- Maximum predictability

Both are valid. Choose based on your use case.

### "Will AgentUI add [feature X] in the future?"

Maybe, but only if it doesn't compromise the core design goals. Focus beats feature count.

### "innerHTML everywhere — isn't that an XSS nightmare?"

**No.** innerHTML is used strategically and safely:

1. **`html` tagged template** auto-escapes all interpolations by default — XSS-safe by construction
2. **`safe()` opt-in** required to inject trusted HTML — makes dangerous paths explicit
3. **`escapeHTML()` utility** for components that use raw template literals
4. **Static templates:** Most innerHTML assigns static HTML strings, not user input

```javascript
import { html, safe, escapeHTML } from '../core/utils.js';

// Option 1: html tagged template (preferred — secure by default)
this.innerHTML = html`<span class="label">${userInput}</span>`;

// Option 2: explicit escapeHTML for raw templates
this.innerHTML = `<span class="label">${escapeHTML(userInput)}</span>`;

// Trusted HTML requires explicit opt-in:
this.innerHTML = html`<div>${safe(trustedHTML)}</div>`;

// What we DON'T do (UNSAFE):
this.innerHTML = userInput; // ❌ Never happens
```

**Additional protections:**
- No `eval()` or `Function()` anywhere in codebase
- No `document.write()`
- CSP headers in demo pages block inline script execution
- Zero dependencies = zero supply chain attack surface

See [SECURITY.md](./SECURITY.md) for full audit details.

### "Where's the ecosystem?"

**Honest answer:** AgentUI doesn't have a large ecosystem, because:

1. **50 components built-in** — Buttons, cards, forms, modals, tables, tabs, tooltips, data tables, schema forms, virtual lists. Most apps need nothing else.

2. **Built-in EventBus** — Lightweight event bus (LightBus) for inter-component messaging is included, not a separate package.

3. **Standard DOM APIs work** — Need charts? `chart.js` works. Need a date picker? Any vanilla JS library works. You're not locked into framework-specific package variants.

**If you need:**
- Complex data visualization → Use Chart.js, D3, etc. directly
- Rich text editor → Use Quill, TipTap, etc. directly
- Maps → Use Leaflet, MapLibre, etc. directly

All work with AgentUI because it's just DOM.

---

## Boundaries: What AgentUI Will Never Be

To stay focused, some things are explicitly **out of scope**:

| Not Planned | Rationale |
|-------------|----------|
| Virtual DOM | Goes against core philosophy — direct DOM is the point |
| JSX support | Use template literals; no transpilation required |
| Shadow DOM by default | Light DOM enables AI inspection and global styling |
| Plugin ecosystem | 50 components built-in; use vanilla JS libraries for the rest |

This isn't stubbornness — it's focus. Every feature has a maintenance cost, and saying "no" to the wrong features is what keeps AgentUI lean.

---

<p align="center">
  <sub>Built with care for the agents and the humans who guide them 🤝</sub>
</p>
