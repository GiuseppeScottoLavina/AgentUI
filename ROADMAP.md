# Roadmap

AgentUI's foundation — 50 components, agent API, build system — is solid and battle-tested. Here's what's next.

## Phase 1 — Enterprise Essentials

| Feature | What & Why |
|---------|------------|
| 🚦 **Router v2** | History API, `/users/:id` params, nested layouts, route guards. The current hash router works for docs sites — enterprise PWAs need real URLs and auth middleware. |
| 📋 **List Component** (`au-list`, `au-list-item`) | MD3 List with checkbox, delete, leading/trailing icons. The most requested missing component for common patterns like todo lists, settings, and navigation menus. |
| 🧠 **Data Query Layer** (`au-query`) | Declarative data fetching with automatic caching, request deduplication, and global interceptors (JWT). Think TanStack Query, but as a web component with `describe()`. |
| 🌍 **i18n** | Native `<au-t key="...">` with reactive language switching. LightBus already provides the event backbone — the wiring is straightforward. |

## Phase 2 — Scale & Power

| Feature | What & Why |
|---------|------------|
| ⚡ **Virtual DataTable** | `au-datatable` already handles sorting/filtering. Adding a `virtual` mode (leveraging the existing `au-virtual-list` engine) enables 10K+ row datasets. |
| 🏗️ **App Shell wrapper** | `au-layout` + `au-drawer` + `au-bottom-nav` already compose into a full app shell (the demo uses this). A convenience `<au-app-shell>` would make this one-liner instead of manual composition. |
| ⌨️ **Command Palette & Hotkeys** | Global `Ctrl+K` search, configurable shortcuts with conflict resolution. Essential for power-user PWAs competing with native apps. |

## Phase 3 — Agent Intelligence

| Feature | What & Why |
|---------|------------|
| 🧪 **Auto-Test Generator** | `describe()` already tells agents what every component can do. A CLI that reads schemas and generates baseline tests would eliminate boilerplate and let teams focus on business logic. |

---

> 💡 **Want to accelerate this?** Every feature above has a clear spec and fits the existing architecture. [Start a discussion](https://github.com/GiuseppeScottoLavina/AgentUI/discussions) or open a PR — contributions move the needle fast on a project this focused.
