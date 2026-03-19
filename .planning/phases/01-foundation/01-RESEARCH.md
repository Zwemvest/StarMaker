# Phase 1: Foundation - Research

**Researched:** 2026-03-19
**Domain:** Project scaffolding, dice engine, legitimacy hash, XState workflow, Zustand store, TypeScript types, CI/CD
**Confidence:** HIGH

## Summary

Phase 1 is pure infrastructure for a greenfield React + TypeScript + Vite SPA. The core work is: scaffold the project with the locked stack, build a cryptographically sound dice engine with append-only roll logging, implement SHA-256 legitimacy hashing, create the XState creation workflow skeleton, set up the Zustand character data store with Immer, define the TypeScript type system for all game concepts, and deploy to GitHub Pages via GitHub Actions.

The stack is fully locked by user decisions. All libraries are current and compatible. The main technical risks are: (1) getting the roll log canonical serialization right from day one (the hash depends on it), (2) modulo bias in dice rolling with `crypto.getRandomValues()`, and (3) Web Crypto API availability in the Vitest/jsdom test environment requiring a setup polyfill.

**Primary recommendation:** Design the roll log format and canonical serialization FIRST, before writing any dice or hash code. Everything downstream depends on this being deterministic.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Hash: 8-character truncated hex display, click-to-copy, "Legitimate" (green) vs "Modified" (amber) badge, verification page at /verify, hash from canonical serialization of roll log (roll ID + context + results only, no timestamps, sorted keys)
- Dice: Instant results with ~200ms pop animation, styled number chips, full roll context, optional sound (off by default)
- Visual: Sci-fi terminal theme, scanner blue accent, dark default + light toggle, mono + sans-serif typography mix
- Stack: React 19 + TypeScript 5.9 + Vite 8 + XState 5 + Zustand + Immer + Tailwind v4 + Zod + Vitest
- Web Crypto API for dice (getRandomValues) and hash (SHA-256)
- GitHub Pages deployment via GitHub Actions

### Claude's Discretion
- Exact Tailwind config and theme token setup
- XState machine state naming conventions
- Zustand store slice structure
- CI/CD pipeline configuration details
- Zod schema organization
- Project folder structure (guided by ARCHITECTURE.md research)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FNDN-01 | App scaffolded with React 19 + TypeScript + Vite, building to static assets for GitHub Pages | Vite 8 scaffolding with `npm create vite@latest`, `@vitejs/plugin-react` v6, `base: '/StarMaker/'` config |
| FNDN-02 | Dice engine using crypto.getRandomValues() produces correct distributions for 1D, 2D, 3D, D3, D66 | Rejection sampling pattern to avoid modulo bias, Uint32Array approach, pure function architecture |
| FNDN-03 | Every dice roll recorded in append-only roll log with roll ID, context, and results | Roll log schema design with Zod validation, canonical serialization format |
| FNDN-04 | SHA-256 legitimacy hash computed from canonically serialized roll log | Web Crypto API `crypto.subtle.digest()`, TextEncoder, deterministic JSON serialization with sorted keys |
| FNDN-05 | XState creation workflow state machine models full creation lifecycle with nested states | XState 5 `setup().createMachine()` with hierarchical states, guards, typed context/events |
| FNDN-06 | Zustand character data store holds all character state with Immer | Zustand 5 `create()` with `immer()` middleware, typed store slices |
| FNDN-07 | TypeScript type system covers all game concepts | Discriminated unions for characteristics, skills, careers, ranks, equipment |
| DEPL-01 | App deployed to GitHub Pages as static site | Vite builds to `dist/`, GitHub Actions workflow with `actions/deploy-pages@v4` |
| DEPL-02 | CI/CD pipeline builds and deploys on push to main | Official Vite deploy workflow with checkout, install, build, upload artifact, deploy |
</phase_requirements>

## Standard Stack

### Core (Phase 1 scope)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.x | UI framework | Locked by user decision. React 19 compiler eliminates manual memoization. |
| TypeScript | 5.9.x | Type safety | Locked. Strict mode required for XState 5 and Zod 4. |
| Vite | 8.x | Build tool + dev server | Locked. Vite 8 ships with Rolldown bundler. Requires Node.js 20.19+ or 22.12+. |
| @vitejs/plugin-react | 6.x | React support for Vite | v6 uses Oxc for React Refresh transform, no Babel dependency. |
| XState | 5.x | Creation workflow FSM | Locked. `setup().createMachine()` pattern for TypeScript. |
| @xstate/react | 5.x | React hooks for XState | `useActor` / `useMachine` hooks for component integration. |
| Zustand | 5.x | Character data store | Locked. Lightweight, TypeScript-first, middleware support. |
| Immer | 11.x | Immutable updates | Locked. Zustand's built-in `immer()` middleware from `zustand/middleware/immer`. |
| Tailwind CSS | 4.x | Styling | Locked. CSS-native config, no `tailwind.config.js` needed. |
| @tailwindcss/vite | 4.x | Vite plugin for Tailwind | First-party Vite plugin, replaces PostCSS approach. |
| Zod | 4.x | Runtime validation | Locked. Schema-first validation for roll log, character data, game concepts. |
| Vitest | 4.x | Testing | Locked. Native Vite integration, same transform pipeline. |

### Supporting (Phase 1 scope)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @testing-library/react | latest | Component testing | Testing React components with user-centric queries |
| @testing-library/jest-dom | latest | DOM matchers | Custom matchers like `toBeInTheDocument()` |
| jsdom | latest | DOM environment for tests | Vitest environment for component tests |
| ESLint | 10.x | Linting | Flat config with `@eslint/js` + `typescript-eslint` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| N/A | N/A | All choices locked by user decision |

**Installation:**
```bash
# Scaffold
npm create vite@latest StarMaker -- --template react-ts

# State management + workflow
npm install zustand immer xstate @xstate/react

# Validation
npm install zod

# Styling
npm install tailwindcss @tailwindcss/vite

# Dev dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
npm install -D eslint @eslint/js typescript-eslint
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/          # React UI components
│   └── common/          # Shared UI (minimal in Phase 1)
├── machines/            # XState state machines
│   └── creation.ts      # Main creation workflow FSM
├── stores/              # Zustand stores
│   └── character.ts     # Character data store
├── engine/              # Pure domain logic (no React)
│   ├── dice.ts          # Dice rolling with crypto.getRandomValues()
│   ├── roll-log.ts      # Append-only roll log management
│   └── hash.ts          # SHA-256 legitimacy hash computation
├── types/               # TypeScript type definitions
│   ├── character.ts     # Character, characteristics, skills
│   ├── careers.ts       # Career, assignment, rank types
│   ├── dice.ts          # Roll, RollLog, DiceNotation types
│   └── equipment.ts     # Equipment types (stubs for Phase 1)
├── schemas/             # Zod schemas (source of truth for types)
│   ├── roll-log.ts      # Roll log entry validation
│   └── character.ts     # Character data validation
├── App.tsx              # Root component
├── main.tsx             # Entry point
└── index.css            # Tailwind import + theme tokens
tests/
├── setup.ts             # Vitest setup (Web Crypto polyfill)
├── engine/
│   ├── dice.test.ts     # Dice distribution tests
│   ├── roll-log.test.ts # Roll log append-only tests
│   └── hash.test.ts     # Hash determinism tests
├── machines/
│   └── creation.test.ts # State machine transition tests
└── stores/
    └── character.test.ts # Store tests
```

### Pattern 1: Pure Engine Functions (No Side Effects)
**What:** All game logic lives in `engine/` as pure functions. No React, no state management, no DOM.
**When to use:** Every dice roll, hash computation, modifier calculation, validation check.
**Example:**
```typescript
// engine/dice.ts
// Pure function: input -> output, no side effects
export function rollDie(sides: number): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  // Rejection sampling to avoid modulo bias
  const max = Math.floor(0xFFFFFFFF / sides) * sides;
  let value = array[0];
  while (value >= max) {
    crypto.getRandomValues(array);
    value = array[0];
  }
  return (value % sides) + 1;
}
```

### Pattern 2: XState setup() with Typed Guards and Actions
**What:** Use XState 5's `setup().createMachine()` pattern for full TypeScript inference.
**When to use:** The creation workflow state machine.
**Example:**
```typescript
// machines/creation.ts
import { setup, assign } from 'xstate';

export const creationMachine = setup({
  types: {
    context: {} as {
      currentPhase: CreationPhase;
      characterId: string;
    },
    events: {} as
      | { type: 'START_CREATION' }
      | { type: 'CHARACTERISTICS_COMPLETE' }
      | { type: 'BACKGROUND_COMPLETE' }
      | { type: 'BEGIN_CAREER_TERM' }
      | { type: 'MUSTER_OUT' },
  },
  guards: {
    hasCharacteristics: ({ context }) => /* check */,
  },
}).createMachine({
  id: 'creation',
  initial: 'idle',
  states: {
    idle: { on: { START_CREATION: 'characteristics' } },
    characteristics: { /* nested states */ },
    backgroundSkills: { /* ... */ },
    preCareeerEducation: { /* optional */ },
    careerTerm: { /* deeply nested */ },
    musteringOut: { /* ... */ },
    complete: { type: 'final' },
  },
});
```

### Pattern 3: Zustand + Immer Store with Typed Slices
**What:** Single Zustand store with Immer middleware for mutable-style immutable updates.
**When to use:** Character data, roll log state.
**Example:**
```typescript
// stores/character.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface CharacterStore {
  characteristics: Characteristics;
  skills: Map<string, number>;
  rollLog: RollLogEntry[];
  legitimacyHash: string;
  // Actions
  setCharacteristic: (id: CharacteristicId, value: number) => void;
  appendRoll: (entry: RollLogEntry) => void;
}

export const useCharacterStore = create<CharacterStore>()(
  immer((set) => ({
    characteristics: initialCharacteristics(),
    skills: new Map(),
    rollLog: [],
    legitimacyHash: '',
    setCharacteristic: (id, value) => set((state) => {
      state.characteristics[id] = value;
    }),
    appendRoll: (entry) => set((state) => {
      state.rollLog.push(entry);
    }),
  })),
);
```

### Pattern 4: Canonical Serialization for Hash Determinism
**What:** Deterministic JSON serialization with sorted keys, no timestamps, for hash input.
**When to use:** Computing the legitimacy hash from the roll log.
**Example:**
```typescript
// engine/hash.ts
export function canonicalizeRollLog(entries: RollLogEntry[]): string {
  // Only include hash-relevant fields, sorted keys
  const canonical = entries.map(entry => ({
    context: entry.context,
    id: entry.id,
    results: entry.results,
  }));
  // JSON.stringify with sorted keys via replacer
  return JSON.stringify(canonical, Object.keys(canonical[0]).sort());
}

export async function computeHash(rollLog: RollLogEntry[]): Promise<string> {
  const canonical = canonicalizeRollLog(rollLog);
  const encoder = new TextEncoder();
  const data = encoder.encode(canonical);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.substring(0, 8); // 8-char truncated display
}
```

### Anti-Patterns to Avoid
- **Game logic in React components:** Untestable, coupled to UI. Keep all dice, hash, and validation logic in `engine/`.
- **`JSON.stringify()` without key sorting:** Non-deterministic key order breaks hash reproducibility across browsers/sessions.
- **`Math.random()` for dice:** User decision mandates `crypto.getRandomValues()`.
- **Timestamps in hash input:** Makes hash non-reproducible. Only roll ID, context, and results matter.
- **Monolithic XState machine:** Use hierarchical states. Career term should be a nested sub-machine, not 50 top-level states.
- **`useState` for character data:** Defeats undo/snapshot capability. Use Zustand from day one.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| State machine | Boolean flags + if/else chains | XState 5 | Creation workflow has 10+ states with nested sub-states, guards, and forced transitions. Hand-rolled FSMs become unmaintainable. |
| Immutable nested updates | Spread operator chains | Zustand + Immer middleware | Character state is deeply nested (careers[2].skills[3].level). Spread chains are error-prone. |
| SHA-256 hashing | Third-party crypto library | Web Crypto API (`crypto.subtle.digest`) | Browser built-in, hardware-accelerated, zero bundle cost. |
| Random number generation | `Math.random()` | `crypto.getRandomValues()` | User-mandated. Cryptographic quality randomness. |
| CSS framework | Custom CSS / CSS-in-JS | Tailwind v4 | Utility-first eliminates stylesheet sprawl for form-heavy data UI. |
| Runtime validation | Manual `if` checks | Zod schemas | Single source of truth for types + validation. Catches data errors at boundaries. |

**Key insight:** This phase establishes patterns that all future phases inherit. Getting the architecture wrong here means rewriting in Phase 2-3.

## Common Pitfalls

### Pitfall 1: Modulo Bias in Dice Rolling
**What goes wrong:** `crypto.getRandomValues()[0] % 6 + 1` produces a biased distribution because 2^32 is not evenly divisible by 6.
**Why it happens:** The modulo of a uniform random over a non-power-of-2 range gives lower values slightly higher probability.
**How to avoid:** Use rejection sampling: if the random value falls in the "biased zone" at the top of the 32-bit range, reroll.
**Warning signs:** Statistical tests show non-uniform distribution over large sample sizes.

### Pitfall 2: Non-Deterministic Hash Serialization
**What goes wrong:** Same roll log produces different hashes on different browsers/runs.
**Why it happens:** `JSON.stringify()` does not guarantee property order. Object key insertion order varies.
**How to avoid:** Explicitly sort keys in the canonical serialization. Use only primitive values (no undefined, no functions). Test determinism explicitly.
**Warning signs:** Hash verification page shows mismatch for a character that was never modified.

### Pitfall 3: Web Crypto API Unavailable in Tests
**What goes wrong:** `crypto.subtle` is `undefined` when running Vitest with jsdom environment.
**Why it happens:** jsdom does not fully implement the Web Crypto API. Node.js has `crypto.webcrypto` but it's not automatically wired into `globalThis.crypto` in jsdom.
**How to avoid:** Create a Vitest setup file that polyfills `globalThis.crypto` from `node:crypto`:
```typescript
// tests/setup.ts
import { webcrypto } from 'node:crypto';
if (!globalThis.crypto?.subtle) {
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
  });
}
```
**Warning signs:** Tests pass locally on Node 22+ but fail in CI or with jsdom.

### Pitfall 4: XState Context vs Zustand Store Confusion
**What goes wrong:** Storing character data in XState context AND Zustand, leading to sync bugs.
**Why it happens:** Unclear boundary between "workflow state" (XState) and "data state" (Zustand).
**How to avoid:** Strict rule: XState manages ONLY workflow position (what step, what transitions are legal). Zustand manages ONLY character data (stats, skills, roll log). They never duplicate data.
**Warning signs:** Two sources of truth for the same piece of state; stale data after state transitions.

### Pitfall 5: Roll Log Schema Retrofit
**What goes wrong:** Roll log format designed without thinking about what the hash needs, requiring later refactoring.
**Why it happens:** Dice engine built first, hash system added later, schema doesn't match.
**How to avoid:** Design the `RollLogEntry` Zod schema FIRST. Then build the dice engine to produce entries matching that schema. Then build the hash to consume entries in that schema.
**Warning signs:** Hash function needs to "transform" roll log entries before hashing.

### Pitfall 6: GitHub Pages Base Path
**What goes wrong:** App deploys but all assets return 404. Routing breaks.
**Why it happens:** Vite defaults `base` to `'/'` but GitHub Pages serves from `/<repo-name>/`.
**How to avoid:** Set `base: '/StarMaker/'` in `vite.config.ts`. For the verification page at `/verify`, use hash-based routing or handle the base path in route configuration.
**Warning signs:** Works on `npm run dev` but breaks on GitHub Pages.

## Code Examples

### Vite Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/StarMaker/',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
  },
});
```

### Tailwind CSS Entry Point (v4 style)
```css
/* src/index.css */
@import "tailwindcss";

/* Theme tokens for sci-fi terminal theme */
@theme {
  --color-scanner-blue: #00d4ff;
  --color-terminal-bg: #0a0e17;
  --color-terminal-surface: #111827;
  --color-legitimate: #22c55e;
  --color-modified: #f59e0b;
  --font-mono: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
  --font-sans: 'Inter', system-ui, sans-serif;
}
```

### GitHub Actions Deploy Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: ['main']
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v6
      - name: Set up Node
        uses: actions/setup-node@v6
        with:
          node-version: lts/*
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test -- --run
      - name: Build
        run: npm run build
      - name: Setup Pages
        uses: actions/configure-pages@v5
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v4
        with:
          path: './dist'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Vitest Setup for Web Crypto
```typescript
// tests/setup.ts
import { webcrypto } from 'node:crypto';
import '@testing-library/jest-dom/vitest';

// Polyfill Web Crypto API for jsdom environment
if (!globalThis.crypto?.subtle) {
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
  });
}
```

### Dice Engine with Rejection Sampling
```typescript
// engine/dice.ts
export function rollDie(sides: number): number {
  if (sides < 1) throw new Error(`Invalid die: d${sides}`);
  const array = new Uint32Array(1);
  const limit = Math.floor(0x100000000 / sides) * sides;
  do {
    crypto.getRandomValues(array);
  } while (array[0] >= limit);
  return (array[0] % sides) + 1;
}

export function rollDice(count: number, sides: number): number[] {
  return Array.from({ length: count }, () => rollDie(sides));
}

export function rollD66(): number {
  const tens = rollDie(6);
  const ones = rollDie(6);
  return tens * 10 + ones; // 11-66
}

export function rollD3(): number {
  return rollDie(3);
}
```

### Roll Log Entry Schema
```typescript
// schemas/roll-log.ts
import { z } from 'zod';

export const rollLogEntrySchema = z.object({
  id: z.string().uuid(),
  context: z.string(),        // e.g., "characteristics.STR", "career.marines.survival"
  notation: z.string(),       // e.g., "2D", "1D", "D66"
  results: z.array(z.number().int().positive()),
  total: z.number().int(),
  overridden: z.boolean().default(false),
});

export type RollLogEntry = z.infer<typeof rollLogEntrySchema>;
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` | CSS-native `@theme` + `@import "tailwindcss"` | Tailwind v4 (2025) | No config file needed, use `@tailwindcss/vite` plugin |
| `createMachine(config, options)` | `setup({ types, actions, guards }).createMachine(config)` | XState v5 (2023) | Better TypeScript inference, named sources |
| `create<T>()(fn)` without middleware | `create<T>()(immer(fn))` | Zustand 5 (2025) | Cleaner middleware composition |
| Vite + Rollup | Vite + Rolldown | Vite 8 (Dec 2025) | Faster builds, same config API |
| `@vitejs/plugin-react` (Babel) | `@vitejs/plugin-react` v6 (Oxc) | v6 with Vite 8 | Smaller install, faster transforms |

**Deprecated/outdated:**
- `tailwind.config.js` -- replaced by CSS-native `@theme` in v4
- `@tailwind base; @tailwind components; @tailwind utilities;` -- replaced by `@import "tailwindcss"` in v4
- XState `createMachine()` with second argument for implementations -- use `setup()` in v5
- Zod 3.x `z.object()` -- Zod 4 has new API patterns (verify during implementation)

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.x |
| Config file | `vite.config.ts` (inline test config) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FNDN-01 | Vite builds to static assets | smoke | `npm run build` | N/A -- Wave 0 |
| FNDN-02 | Dice distributions correct for 1D, 2D, 3D, D3, D66 | unit | `npx vitest run tests/engine/dice.test.ts -x` | Wave 0 |
| FNDN-03 | Roll log append-only with ID, context, results | unit | `npx vitest run tests/engine/roll-log.test.ts -x` | Wave 0 |
| FNDN-04 | SHA-256 hash deterministic from canonical roll log | unit | `npx vitest run tests/engine/hash.test.ts -x` | Wave 0 |
| FNDN-05 | XState machine models creation lifecycle | unit | `npx vitest run tests/machines/creation.test.ts -x` | Wave 0 |
| FNDN-06 | Zustand store holds character state with Immer | unit | `npx vitest run tests/stores/character.test.ts -x` | Wave 0 |
| FNDN-07 | TypeScript types cover all game concepts | unit | `npx tsc --noEmit` | N/A -- compile check |
| DEPL-01 | Deployed to GitHub Pages | smoke | Manual -- verify URL loads after deploy | manual-only |
| DEPL-02 | CI/CD builds and deploys on push | integration | `gh run list --workflow=deploy.yml --limit=1` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run && npm run build`
- **Phase gate:** Full suite green + successful GitHub Pages deploy before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/setup.ts` -- Web Crypto API polyfill for jsdom
- [ ] `tests/engine/dice.test.ts` -- covers FNDN-02
- [ ] `tests/engine/roll-log.test.ts` -- covers FNDN-03
- [ ] `tests/engine/hash.test.ts` -- covers FNDN-04
- [ ] `tests/machines/creation.test.ts` -- covers FNDN-05
- [ ] `tests/stores/character.test.ts` -- covers FNDN-06
- [ ] Vitest config in `vite.config.ts` (globals, jsdom, setupFiles)
- [ ] Framework install: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`

## Open Questions

1. **Zod 4 API Changes**
   - What we know: Zod 4.x is the locked version, major rewrite from Zod 3
   - What's unclear: Exact API differences (e.g., `.infer` behavior, new methods)
   - Recommendation: Verify Zod 4 API during implementation; the patterns above may need minor adjustments

2. **Vite 8 + @vitejs/plugin-react v6 Exact Config**
   - What we know: v6 uses Oxc instead of Babel, installed as `@vitejs/plugin-react`
   - What's unclear: Whether any config options changed from v5
   - Recommendation: Scaffold with `npm create vite@latest` which generates correct config

3. **Hash Canonical Serialization Edge Cases**
   - What we know: Must sort keys, exclude timestamps, include only roll ID + context + results
   - What's unclear: How to handle the empty roll log (hash of empty array?), and whether `context` string format needs strict normalization
   - Recommendation: Define the canonical format in a Zod schema, test with empty/single/multi-entry logs, document the format as a constant

## Sources

### Primary (HIGH confidence)
- [Vite official deploy guide](https://vite.dev/guide/static-deploy) -- GitHub Actions workflow YAML
- [Vite 8 announcement](https://vite.dev/blog/announcing-vite8) -- Rolldown integration, Node.js requirements
- [XState v5 setup docs](https://stately.ai/docs/setup) -- `setup().createMachine()` pattern
- [XState guards docs](https://stately.ai/docs/guards) -- Guard typing with `setup()`
- [Tailwind CSS v4 docs](https://tailwindcss.com/docs) -- Vite plugin setup, `@import "tailwindcss"`
- [MDN Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest) -- `crypto.subtle.digest()` usage
- [MDN crypto.getRandomValues](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues) -- Random value generation

### Secondary (MEDIUM confidence)
- [Zustand immer middleware](https://deepwiki.com/pmndrs/zustand/3.6-immer-middleware) -- DeepWiki docs, verified against GitHub discussions
- [Vitest Web Crypto discussion](https://github.com/vitest-dev/vitest/discussions/893) -- jsdom crypto polyfill pattern
- [Node.js Web Crypto docs](https://nodejs.org/api/webcrypto.html) -- `webcrypto` module for test polyfill

### Tertiary (LOW confidence)
- Zod 4 specific API -- based on version number from STACK.md, exact API should be verified during implementation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all versions verified in STACK.md via npm registry, installation commands well-documented
- Architecture: HIGH -- patterns from ARCHITECTURE.md research + verified XState/Zustand docs
- Pitfalls: HIGH -- modulo bias is well-documented, hash determinism is a known issue, jsdom crypto limitation confirmed in Vitest discussions
- CI/CD: HIGH -- GitHub Actions workflow taken directly from official Vite docs

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (stable stack, 30-day validity)
