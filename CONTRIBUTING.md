# Contributing to AgentUI

AgentUI is an experiment, and experiments need diverse perspectives. We value ideas, criticism, and discussion as much as code.

---

## 💬 Ways to Contribute

### 1. Join the Conversation (No Code Required)

The most valuable contribution you can make right now is **sharing your perspective:**

- **[Start a Discussion](https://github.com/GiuseppeScottoLavina/AgentUI/discussions)** — Share your experience with AI agents and web frameworks
- **Challenge our assumptions** — Think our approach is wrong? Tell us why. Constructive criticism makes better software.
- **Share your pain points** — What friction do you experience when AI agents work with existing frameworks?

We're serious about this: **a well-articulated critique is worth more than a pull request that doesn't address the right problem.**

### 2. Try It and Report Back

```bash
git clone https://github.com/GiuseppeScottoLavina/AgentUI.git
cd AgentUI
bun install
bun run dev
```

Then tell us what an AI agent (Claude, Copilot, etc.) can and can't do with it.

### 3. Code Contributions

If you want to contribute code:

1. **Open a Discussion first** — Let's talk about the approach before you write code
2. Fork the repository
3. Create a feature branch (`git checkout -b feature/your-idea`)
4. Write tests (we follow TDD — `bun run test:isolated`)
5. Submit a Pull Request

---

## 🧪 Development Setup

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Run tests (isolated — avoids cross-contamination)
bun run test:isolated

# Build the framework
bun run build:framework
```

### Project Structure

```
AgentUI/
├── src/
│   ├── components/     # 50 components (MD3 application + dev tools)
│   ├── core/           # AuElement base, utils, scheduler
│   └── styles/         # CSS design tokens (MD3)
├── tests/
│   ├── components/     # Unit tests (linkedom)
│   └── e2e/            # Browser tests (Puppeteer)
├── demo/               # Live demo site
└── dist/               # Build output
```

---

## 📐 Style Guide

- **JS:** ES Modules, vanilla JS with JSDoc, `html` tagged template for safe rendering (or `escapeHTML()` for raw templates)
- **CSS:** Custom Properties, BEM naming (`au-component__element--modifier`)
- **Components:** Extend `AuElement`, Light DOM, include ARIA attributes
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`)

---

## 🤝 Code of Conduct

Be respectful, be constructive, be honest. We're all here to learn.

This project follows the [Contributor Covenant](./CODE_OF_CONDUCT.md).

---

## Questions?

Open a [Discussion](https://github.com/GiuseppeScottoLavina/AgentUI/discussions) — we'd rather have a conversation than a formal issue.
