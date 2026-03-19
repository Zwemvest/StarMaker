# Stack Research

**Domain:** Client-side TTRPG character builder (data-heavy, sequential workflow, static hosting)
**Researched:** 2026-03-19
**Confidence:** HIGH (versions verified via npm registry)

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React | 19.2.4 | UI framework | Dominant ecosystem for complex interactive UIs. Component model maps naturally to character creation steps. React 19 brings improved performance with the compiler (no more manual memoization) and use() hook for cleaner async patterns. |
| TypeScript | 5.9.3 | Type safety | Non-negotiable for a project with 12 careers, dozens of tables, and hundreds of cross-referenced data entries. Catches data-encoding errors at compile time. The career/skill/equipment data model is complex enough that untyped JS would be a maintenance disaster. |
| Vite | 8.0.1 | Build tool + dev server | Fastest DX for React development. Built-in TypeScript support, instant HMR, and trivially produces static builds for GitHub Pages. Vite 8 is stable and battle-tested. |
| Tailwind CSS | 4.2.2 | Styling | Utility-first CSS eliminates stylesheet sprawl. Character sheets and forms benefit from rapid layout iteration. Tailwind v4 uses CSS-native configuration (no more tailwind.config.js), simpler setup with Vite. |

### State Management

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Zustand | 5.0.12 | Global application state | Lightweight, unopinionated, excellent TypeScript support. Perfect for storing the character-in-progress, career history, dice roll log, and override mode state. No boilerplate compared to Redux. Middleware support for persistence (localStorage) and devtools built in. |
| Immer | 11.1.4 | Immutable state updates | Deeply nested character state (careers[2].skills[3].level) is painful to update immutably by hand. Immer's produce() makes nested updates readable. Integrates directly with Zustand via its immer middleware. |
| XState | 5.28.0 | Character creation workflow orchestration | **This is the critical choice.** The character creation lifecycle is a complex state machine: characteristics -> background -> optional education -> career terms (with nested qualify/survive/event/advance sub-states) -> mustering out. XState models this explicitly with states, transitions, and guards. Without it, you end up with a rats-nest of boolean flags and if/else chains. XState v5 has first-class TypeScript support and a visual inspector for debugging state transitions. |

**Architecture note:** Zustand holds the *data* (character stats, roll history, equipment). XState manages the *workflow* (what step are we on, what transitions are legal, can we go back). They complement rather than compete.

### Data Validation

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Zod | 4.3.6 | Runtime schema validation | TypeScript types disappear at runtime. Zod validates that career data, dice rolls, and user inputs conform to expected shapes. Critical for the override mode -- when users manually set values, Zod ensures they remain within legal bounds (e.g., characteristic 2-15, skill level 0-4). Also generates TypeScript types from schemas, single source of truth. |

### PDF Export & Printing

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| @react-pdf/renderer | 4.3.2 | PDF character sheet generation | Renders React components directly to PDF. This means the character sheet layout is defined in JSX -- same mental model as the rest of the app. Supports custom fonts, precise positioning, and tables. Far superior to jsPDF for structured documents because you design the PDF declaratively rather than imperatively calling addText(x, y, "string"). |
| react-to-print | 3.3.0 | Browser print dialog | Quick "print this page" functionality as a fallback. Zero-config way to let users Ctrl+P a nicely formatted character sheet view. Complements @react-pdf/renderer for users who just want paper output without downloading a file. |

### Cryptographic Hashing

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Web Crypto API | (browser built-in) | SHA-256 legitimacy hash | **No library needed.** `crypto.subtle.digest('SHA-256', data)` is available in all modern browsers and is the correct tool. It is async, hardware-accelerated, and cryptographically sound. Using a library for this would be unnecessary bloat. The hash input is a deterministic serialization of all dice rolls in order; the output is a hex string displayed on the character sheet. |

### Testing

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Vitest | 4.1.0 | Unit + integration testing | Native Vite integration means zero config for path aliases, TypeScript, and JSX. Same transform pipeline as your app. This project needs extensive testing because the rules are complex and table-driven -- every career's qualification/survival/advancement/event table needs verification against the book. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint | 10.0.3 | Code linting. Flat config format (eslint.config.js). Use @eslint/js + typescript-eslint. |
| Prettier | Code formatting | Pair with eslint-config-prettier to avoid conflicts. |
| GitHub Actions | CI/CD + deployment | Build, test, deploy to GitHub Pages on push to main. Use `actions/deploy-pages` for deployment. |

## Installation

```bash
# Core
npm install react@19.2.4 react-dom@19.2.4

# State management + workflow
npm install zustand@5.0.12 immer@11.1.4 xstate@5.28.0 @xstate/react@5

# Data validation
npm install zod@4.3.6

# PDF export
npm install @react-pdf/renderer@4.3.2 react-to-print@3.3.0

# Styling
npm install tailwindcss@4.2.2

# Dev dependencies
npm install -D typescript@5.9.3 vite@8.0.1 @vitejs/plugin-react vitest@4.1.0
npm install -D eslint@10.0.3 @eslint/js typescript-eslint prettier eslint-config-prettier
npm install -D @types/react@19.2.14 @types/react-dom
npm install -D @testing-library/react @testing-library/jest-dom jsdom
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| React | Svelte 5 | If the team prefers compiled-away reactivity and smaller bundles. However, React's ecosystem for complex data-driven UIs (tooling, component libraries, XState integration) is unmatched. For a project with this much state and workflow complexity, React + XState is the safer bet. |
| React | Vue 3 | Comparable capability but smaller ecosystem for PDF rendering and state machine tooling. No compelling advantage here. |
| Zustand | Redux Toolkit | If you want extremely strict unidirectional data flow and time-travel debugging. Overkill for this project -- Zustand gives the same patterns with 80% less boilerplate. |
| Zustand | Jotai | If state is mostly atomic/independent. Character state is deeply interconnected (skills depend on career, career depends on qualification rolls, etc.), making Zustand's single-store approach a better fit than Jotai's atom model. |
| XState | Custom state machine | If the workflow were simpler (3-4 steps). With 12 careers, nested sub-states, optional education paths, and override mode, a hand-rolled state machine becomes unmaintainable. XState's visual inspector alone justifies adoption. |
| @react-pdf/renderer | jsPDF 4.2.1 | If you need pixel-perfect control and are comfortable with imperative PDF construction (addText, addLine, moveTo). jsPDF is more manual but has no React dependency -- viable if you want to decouple PDF generation completely. |
| Tailwind CSS | CSS Modules | If the team dislikes utility classes. CSS Modules provide scoping without a framework. But Tailwind's speed for form-heavy, table-heavy UIs is a significant DX win. |
| Vitest | Jest | If you have an existing Jest config. For a new Vite project, Vitest is strictly better -- same API, native Vite integration, faster execution. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Next.js / Remix / Astro | Server-side frameworks. This app has zero server-side needs. GitHub Pages serves static files. Adding SSR complexity buys nothing and complicates deployment. | Vite (plain SPA build) |
| Redux (standalone) | Excessive boilerplate for this project size. Actions, reducers, selectors, thunks -- all unnecessary when Zustand does the same job in 1/5 the code. | Zustand |
| MobX | Implicit reactivity makes debugging complex state interactions harder. When a career event modifies three different stats simultaneously, you want explicit updates, not magic. | Zustand + Immer |
| crypto-js / sjcl | Third-party crypto libraries. The Web Crypto API is built into every modern browser, is faster (hardware-accelerated), and is more secure. Adding a library for SHA-256 is pure bloat. | Web Crypto API (built-in) |
| html2canvas + jsPDF combo | Screenshotting the DOM to make a PDF produces blurry, non-selectable, non-searchable output. Character sheets should have crisp text and be searchable. | @react-pdf/renderer |
| Styled Components / Emotion | CSS-in-JS adds runtime overhead and bundle size. Tailwind generates zero runtime CSS. For a static site where performance matters, avoid runtime styling solutions. | Tailwind CSS |
| React Router (traditional) | For a wizard-style workflow app, URL-based routing is secondary to state-machine-driven navigation. The "current step" should be driven by XState, not the URL. If hash-based bookmarking is desired later, sync XState state to URL rather than using React Router as the source of truth. | XState-driven step rendering |
| localStorage wrapper libraries | `window.localStorage` API is trivial. Zustand's built-in `persist` middleware handles serialization/deserialization. No library needed. | Zustand persist middleware |
| Math.random() for dice | Not cryptographically random, but that is actually fine for dice simulation. However, for reproducibility and the legitimacy hash, use a seeded PRNG or simply `crypto.getRandomValues()` which is both fast and truly random. | `crypto.getRandomValues()` for dice rolls |

## Stack Patterns

**For dice rolling:**
- Use `crypto.getRandomValues(new Uint32Array(1))` to generate random numbers
- Map to dice range: `(value % sides) + 1` for a fair die roll
- Log every roll with timestamp and context (which career, which table) for the legitimacy hash

**For the legitimacy hash:**
- Serialize all dice rolls in sequence: `[roll1, roll2, ..., rollN]`
- Use `crypto.subtle.digest('SHA-256', encoder.encode(serialized))` to produce hash
- Display as truncated hex (first 16 chars is sufficient for visual verification)
- Any override/reroll changes the sequence, producing a different hash
- Store both "original" and "current" roll sequences if override mode is used

**For career data encoding:**
- Define TypeScript types/interfaces for Career, Assignment, SkillTable, EventTable, etc.
- Validate with Zod schemas at app startup (catches encoding errors immediately)
- Store as typed constants in separate files per career (one file per career keeps things manageable)
- Total data: ~12 careers x ~100 data points each = ~1200 structured entries. Large but manageable as typed TS constants.

**For GitHub Pages deployment:**
- Vite builds to `dist/` folder
- Configure `vite.config.ts` with `base: '/StarMaker/'` (repo name as base path)
- GitHub Actions workflow: checkout -> install -> build -> deploy to Pages
- Use `actions/configure-pages` + `actions/upload-pages-artifact` + `actions/deploy-pages`

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| react@19.2.4 | react-dom@19.2.4 | Must match exactly |
| react@19.2.4 | @types/react@19.x | Major version must match |
| vite@8.0.1 | vitest@4.1.0 | Vitest 4 supports Vite 8 |
| zustand@5.0.12 | immer@11.x | Zustand's immer middleware works with Immer 10+ |
| xstate@5.28.0 | @xstate/react@5.x | Must use matching major version |
| tailwindcss@4.2.2 | vite@8.x | Tailwind v4 integrates via `@tailwindcss/vite` plugin |
| typescript@5.9.3 | all above | All listed packages have TS 5.x support |

## Sources

- npm registry (live queries, 2026-03-19) -- all version numbers verified via `npm view [package] version`
- Training data (May 2025 cutoff) -- architectural patterns and library comparisons. MEDIUM confidence; core patterns are stable but specific API details may have shifted.
- Web Crypto API -- browser built-in, stable standard since 2017, no version concerns.

**Confidence notes:**
- Version numbers: HIGH (verified live against npm)
- Library choice rationale: HIGH (these are well-established ecosystem choices, not bleeding-edge)
- XState for workflow: HIGH (state machines for multi-step wizards is a well-documented pattern)
- @react-pdf/renderer capabilities: MEDIUM (verified version exists, but specific API details based on training data)
- Tailwind v4 configuration: MEDIUM (v4 is a major rewrite from v3; CSS-native config approach verified by version number but specific setup steps should be confirmed during implementation)

---
*Stack research for: StarMaker -- Mongoose Traveller 2E Character Builder*
*Researched: 2026-03-19*
