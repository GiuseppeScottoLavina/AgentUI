# Changelog

All notable changes to AgentUI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.64] - 2026-02-08

### Fixed
- **Chrome SEGV on macOS**: E2E tests now use bash spawn + HTTP polling + `puppeteer.connect()` to bypass `SEGV_ACCERR` crash caused by `child_process.spawn()` + `com.apple.provenance` xattr interaction
- **Build regex**: Per-component bundle path fix now catches bare `import"../../chunk-"` (side-effect imports), not just `from"../../chunk-"`

### Added
- **7 new core test files**: breakpoints, bus, keyboard, render, ripple, scheduler, utils
- **E2E coverage gap tests**: 14 browser assertions for LinkedOM-unfriendly code (au-lazy, au-confirm, au-form, debounce/throttle)
- **Shared `launchBrowser()` helper**: `tests/e2e/puppeteer-helper.js` for consistent Chrome management

### Changed
- **1826 tests** (was 1530): 94 isolated test files, 0 fail, 32 skip
- 11 LinkedOM-failing unit tests marked as skip with E2E cross-references
- Updated docs: README, AGENTS.md, demo homepage with current test counts

## [0.1.49] - 2026-02-07

### Changed
- **NPM package size reduced**: Removed `src/`, `docs/`, and 8 unnecessary files from npm bundle
- **Removed stale files**: `app/` (old demo, 41 files), `demo/full.html`, `demo/iife.html`, `lighthouse-audit.mjs`
- **CI**: Updated Bun from pinned 1.3.6 to `latest`

### Added
- **GitHub best practices**: CODEOWNERS, FUNDING.yml
- **README badges**: CI status, npm version, license

### Removed
- `.npmignore` (replaced by `files` whitelist in package.json)
- `./src/*` export (consumers should use `dist/`)

## [0.1.48] - 2026-02-07

### Tests
- **335 new unit tests** (1241 total, 0 fail, 47 skip) covering all 50 components
  - Sprint 1: XSS security regression tests (30)
  - Sprint 2: Simple components - callout, spinner, theme-toggle, api-table (49)
  - Sprint 3: Medium components - code, layout, error-boundary, page (65)
  - Sprint 4: Complex components - bottom-nav, datatable, example, fetch (85)
  - Sprint 5: Dev tools - doc-page, prompt-ui, router, schema-form, confirm (106)

### Fixed
- **Lighthouse Best Practices**: Stabilized from intermittent 96 to consistent 100/100
  - Inlined hero image in `demo/index.html` (eliminates JS `fetch()` race condition)
- **Stale test count**: Updated "900+ tests" → "1241 tests" in demo homepage

### Documentation
- Documentation audit: fixed 15+ inconsistencies across 8 files
- Updated test count in README.md and dist/README.md

## [0.1.42] - 2026-02-06

### Fixed
- **dialog.css 404**: au-modal and au-confirm now use 'overlays.css' (dialog.css never existed)

## [0.1.41] - 2026-02-06

### Fixed
- **CSS 404 errors (v2)**: Improved bundle detection with 5 strategies:
  - Direct link to agentui.css/agentui.min.css
  - node_modules pattern (agentui-wc)
  - components.css loaded
  - style[data-agentui] bundler marker
  - CSS rules check for .au-button/.au-chip

## [0.1.40] - 2026-02-06

### Fixed
- **CSS 404 errors**: Skip lazy CSS loading when `agentui.css` bundle is present
- **CrossBus warning**: Silence dev mode security warning (AgentUI uses local bus only)

### Documentation
- Added icon bundling note: ~50 icons bundled, Google Fonts fallback for others

## [0.1.39] - 2026-02-06

### Added
- **au-chip**: `static` attribute for non-interactive badge mode
  - Static chips display as badges without toggle/click behavior  
  - `describe()` method for AI agent discovery (props, events, examples)

## [0.1.38] - 2026-02-06

### Changed
- Removed all "SOTA" marketing language (framework is alpha/WIP)

## [0.1.37] - 2026-02-06

### Added
- **AI Agent Discovery**:
  - `AgentUI.discoverAll()` - Get ALL component APIs in one call
  - Runtime Discovery section in AGENTS.md TL;DR
  - Updated llms.txt with "AI AGENT: START HERE" section

## [0.1.36] - 2026-02-06

### Documentation
- **AGENTS.md Steve Jobs quality review**:
  - Removed hardcoded line numbers from Index (bad UX for dynamic docs)
  - Clarified CSS import: bundler (`import`) vs HTML (`<link>`)
  - Made installation foolproof for Vite/Webpack and plain HTML

## [0.1.35] - 2026-02-06

### Documentation
- **AGENTS.md overhaul for AI agent usability**:
  - Added Installation section with `npm install` and `bun add` commands
  - Changed CDN URLs from `@0.1.24` to `@latest`
  - Added complete minimal HTML example (copy-paste ready)
  - Updated pinned version from 0.1.23 to 0.1.34

## [0.1.34] - 2026-02-06

### Fixed
- **crossbus dependency**: Moved from `devDependencies` to `dependencies`
  - Users importing from `src/` no longer get "Cannot find module crossbus"
  - The bundled `dist/` version already included crossbus inline

## [0.1.33] - 2026-02-06

### Fixed
- **au-confirm**: Listeners now re-attached on reconnect (idempotent render bug)
- **Codebase audit**: Verified 8 suspected components, only au-confirm had the bug

### Tests
- Added 2 regression tests for listener re-attachment (895 total tests)

## [0.1.32] - 2026-02-06

### Fixed
- **au-input floating label (real fix)**: Listeners now re-attached on reconnect
  - Root cause: idempotent render path returned before attaching listeners
  - Fix: Created `#setupListeners()` method called from both render paths

## [0.1.31] - 2026-02-06

### Fixed
- **au-input floating label**: Label no longer overlaps text after blur
  - `blur` handler now calls `#updateValueState()`
  - `value` setter now calls `#updateValueState()`
  - `update()` for value attr now calls `#updateValueState()`

### Tests
- Added 4 regression tests for floating label state management

## [0.1.30] - 2026-02-06

### Added
- **describe() on 10 components**: au-checkbox, au-switch, au-dropdown, au-textarea, au-radio-group, au-alert, au-toast, au-modal, au-spinner, au-progress
- **Drag & Drop Pattern**: Added native HTML5 drag pattern to AGENTS.md

### Fixed
- **au-bottom-nav**: Event consistency - `change` → `au-change`

## [0.1.29] - 2026-02-06

### Documentation
- **au-button**: Added icon-only button patterns to AGENTS.md
- **Custom class preservation**: Documented in component docs

## [0.1.28] - 2026-02-06

### Fixed
- **au-button**: Icon-only buttons now preserve icon children

## [0.1.27] - 2026-02-06

### Fixed
- **className override bug**: 8 components now use classList.add() to preserve custom classes
  - au-card, au-input, au-badge, au-alert, au-spinner, au-progress, au-tooltip, au-toast

## [0.1.26] - 2026-02-05

### Fixed
- **au-button**: Custom children and classes now preserved during render

## [0.1.18] - 2026-02-05

### Fixed
- **Modal Input Labels**: Context-aware `--au-input-label-bg` CSS variable for outlined inputs in modals
  - Modal dialogs now set `--au-input-label-bg: var(--md-sys-color-surface-container-high)` 
  - This fixes the "sgraficato" (rough) appearance of outlined input labels on modal backgrounds

### Added
- **Modal Actions Slot**: Styled `slot="actions"` for consistent modal action button layout
- **au-textarea**: Improved background with intelligent fallback

### Changed
- **README**: Complete UX redesign with AI-First vision manifesto
- **Demo Animation**: Added animated WebP showcase to README

## [0.1.17] - 2026-02-04

### Documentation
- Minor improvements to demo and documentation

## [0.1.13] - 2026-02-04

### Fixed
- Shell HTML refactoring for cleaner URL structure

## [0.1.12] - 2026-02-03

### Added
- **au-form.getValues()**: Alias for `getFormData()` - cleaner API for agents
- **Dark Theme Docs**: Complete CSS variables list for custom dark theme setup

### Documentation
- **PHILOSOPHY.md**: Long-term stability principle, security FAQ, ecosystem FAQ
- **AGENTS.md**: App Shell pattern, MCP clarification
- **README.md**: Migration-free stability highlighted

## [0.1.11] - 2026-02-03

### Fixed
- **au-alert Icons**: Fixed icon rendering in lazy-loaded contexts

## [0.1.10] - 2026-02-03

### Fixed
- **au-input**: Changed fallback from `#fff` to `transparent` for dark theme compatibility

### Added
- **Agent Discoverability**: `au-card` now has `describe()` static method for AI agent introspection
- All 3 core components (`au-button`, `au-input`, `au-card`) now support `customElements.get('au-*').describe()`

## [0.1.8] - 2026-02-03

### Fixed
- **au-input Dark Theme**: Removed hardcoded `#fff` fallback that caused visual artifacts on dark backgrounds
- **au-badge/au-progress**: Replaced hardcoded hex colors with semantic CSS variables for proper theming
- **Shell Navigation**: Fixed scroll container targeting (`.au-layout-main` instead of `window`)
- **Shell scrollbar-gutter**: Moved to correct scroll container to prevent horizontal layout shift

### Improved
- **View Transitions**: Prefetch content before transition for smoother navigation (no intermediate states)

## [0.1.7] - 2026-02-03

### Fixed
- Hardcoded colors audit for dark theme compatibility

## [0.1.0] - 2026-02-02

### 🎉 Initial Release

**AgentUI** is an AI-First Web Components Library with 50 Material Design 3 components.

### Features

- **Light DOM Architecture**: Full AI agent compatibility - components render in the regular DOM, not Shadow DOM
- **50 Components**: Complete Material Design 3 component library
  - Layout: `au-container`, `au-stack`, `au-grid`, `au-layout`, `au-sidebar`, `au-drawer`
  - Forms: `au-input`, `au-textarea`, `au-checkbox`, `au-switch`, `au-radio`, `au-dropdown`, `au-form`
  - Display: `au-card`, `au-button`, `au-chip`, `au-badge`, `au-avatar`, `au-icon`, `au-divider`
  - Feedback: `au-alert`, `au-toast`, `au-modal`, `au-tooltip`, `au-progress`, `au-skeleton`, `au-spinner`
  - Navigation: `au-tabs`, `au-navbar`, `au-bottom-nav`, `au-drawer-item`
  - Data: `au-table`, `au-datatable`, `au-repeat`, `au-virtual-list`
  - Advanced: `au-router`, `au-lazy`, `au-fetch`, `au-code`, `au-example`
- **Zero Dependencies**: No runtime dependencies, ~168KB ESM bundle
- **Full TypeScript Support**: Complete type definitions included
- **Accessibility**: WCAG 2.1 AA compliant with full keyboard navigation
- **Theming**: Dark/Light mode with CSS custom properties
- **PWA Ready**: Service Worker with intelligent caching strategies

### Security

- Full security audit completed
- XSS vulnerabilities remediated with centralized `escapeHTML()` utility
- CSP-compatible design
- No `eval()` or dynamic code execution

### Documentation

- Getting Started guide
- Component API reference
- Design System documentation
- Agent integration guide (AGENTS.md)

### Live Demo

🌐 https://giuseppescottolavina.github.io/AgentUI/
