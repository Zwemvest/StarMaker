# Architecture Research: StarMaker

**Researched:** 2026-03-19
**Domain:** TTRPG Character Builder (Mongoose Traveller 2E)
**Confidence:** HIGH

## System Overview

StarMaker is a client-side SPA with no backend. All logic runs in the browser; GitHub Pages serves static assets only.

### 4-Layer Architecture

```
┌─────────────────────────────────────────────┐
│  UI Layer (React Components)                │
│  - Step wizard, career panels, equipment    │
│  - Character sheet renderer                 │
├─────────────────────────────────────────────┤
│  State Layer (XState + Zustand)             │
│  - XState: creation workflow FSM            │
│  - Zustand: character data store            │
│  - Roll log (append-only for hashing)       │
├─────────────────────────────────────────────┤
│  Domain Layer (Pure Functions)              │
│  - Dice engine, modifier calculations       │
│  - Career logic, skill resolution           │
│  - Hash computation, validation             │
├─────────────────────────────────────────────┤
│  Data Layer (Static JSON/TypeScript)        │
│  - Career tables, event tables              │
│  - Equipment catalog                        │
│  - Skill definitions, rank tables           │
└─────────────────────────────────────────────┘
```

## Major Components

### 1. Creation Workflow State Machine (XState)

The character creation lifecycle is a deeply nested FSM:

```
[Start]
  → Characteristics (roll 2D × 6, assign)
  → Background Skills (select EDU DM+3 skills)
  → Pre-Career Education? (optional)
    → University OR Military Academy
    → Entry roll → Skills → Events → Graduation roll
  → Career Term Loop:
    → Choose Career → Qualification Roll
      → Fail: Draft or Drifter
      → Pass: Enter Career
    → Basic Training (first career: all service skills; subsequent: pick one)
    → Survival Roll
      → Fail: Mishap table → Leave career
      → Pass: Continue
    → Event Roll (2D on career event table)
    → Commission? (military only)
    → Advancement Roll
      → Natural 12: forced to stay
      → Roll ≤ terms: forced to leave
    → Skill Roll (pick table, roll 1D)
    → Aging (if 34+)
    → Continue/Leave decision
  → Mustering Out (cash + benefits rolls)
  → Skill Package Selection
  → [Complete]
```

**Key XState features needed:**
- Hierarchical states (career term contains sub-states)
- Guards (qualification checks, aging thresholds, skill limits)
- Context (current character state passed through)
- History states (for undo/revert in override mode)

### 2. Character Data Store (Zustand)

Holds the actual character state:
- Characteristics (STR, DEX, END, INT, EDU, SOC) with current/modified values
- Skills map (skill name → level)
- Career history (array of term records)
- Benefits accumulated
- Equipment purchased
- Contacts/Allies/Rivals/Enemies
- PSI characteristic and psionic talents
- Age, credits, pension

### 3. Dice Engine

Pure function module:
- `roll(count, sides)` → array of individual results
- `rollD66()` → two-digit result (11-66)
- Uses `crypto.getRandomValues()` for randomness
- **Every roll is logged** to an append-only roll log
- Roll log entries: `{ id, context, dice, results, timestamp }`
- Override mode: rolls are flagged as `{ overridden: true, originalResults, newResults }`

### 4. Roll Log & Hash Accumulator

The legitimacy system:
- Append-only log of every dice roll during creation
- Hash = SHA-256 of serialized roll log
- In legitimate mode: all rolls are recorded as-is
- In override mode: overridden rolls are marked, hash changes
- Hash is deterministic: same roll sequence → same hash
- Displayed as truncated hex on character sheet

### 5. Career Data Engine

Data-driven career resolution:
- Career definitions as structured TypeScript objects
- Each career contains: qualification, survival, advancement, commission (if military), ranks, skill tables (5 types × 6 entries), events (12 entries), mishaps (6 entries), cash (7 entries), benefits (7 entries)
- ~1,200 structured data entries across 12 careers
- Career engine takes career definition + character state → resolves rolls → returns updated state

### 6. Equipment Catalog

- Weapons (melee + ranged): damage, range, cost, TL, traits
- Armour: protection, cost, TL, traits
- Survival gear, electronics, medical, tools
- Filter/search by category, TL, cost
- Budget tracking against mustered-out credits

### 7. Character Sheet Renderer

- Real-time display during creation (progressive reveal)
- Final character sheet layout (printable)
- PDF export via @react-pdf/renderer
- Hash/legitimacy indicator prominent

### 8. Undo/History System

- Snapshot-based: capture full state at each decision point
- Override mode: can revert to any previous snapshot
- Re-roll: replace a specific dice result and replay forward
- History tree (not stack — branching possible in override mode)

## Data Flow

### Normal Creation Flow
```
User Action → XState Event → State Transition
  → Domain Logic (dice, modifiers, skill resolution)
  → Zustand Update (character data)
  → Roll Log Append
  → Hash Recompute
  → UI Re-render
```

### Override/Reroll Flow
```
User clicks "Reroll" → Snapshot current state
  → Mark roll as overridden in log
  → New dice roll → Domain Logic
  → Zustand Update
  → Hash Recompute (now different = "modified")
  → UI shows "modified" indicator
```

### Data Loading
```
App Init → Import career JSON/TS modules
  → Career definitions available in memory
  → Equipment catalog loaded
  → XState machine initialized at [Start]
```

### State Persistence
```
Character state → serialize to JSON → localStorage
  → On reload: deserialize → restore XState + Zustand
  → Roll log restored → hash recomputed → verified
```

## Project Structure

```
src/
├── components/          # React UI components
│   ├── creation/        # Step wizard components
│   ├── sheet/           # Character sheet display
│   ├── equipment/       # Equipment browser/selector
│   └── common/          # Shared UI (dice display, modals)
├── machines/            # XState state machines
│   ├── creation.ts      # Main creation workflow
│   └── career-term.ts   # Career term sub-machine
├── stores/              # Zustand stores
│   ├── character.ts     # Character data
│   └── history.ts       # Undo/snapshot history
├── engine/              # Pure domain logic
│   ├── dice.ts          # Dice rolling
│   ├── careers.ts       # Career resolution logic
│   ├── skills.ts        # Skill calculation/limits
│   ├── aging.ts         # Aging effects
│   ├── benefits.ts      # Mustering out
│   ├── psionics.ts      # Psionic testing/training
│   └── hash.ts          # Legitimacy hash
├── data/                # Static game data
│   ├── careers/         # One file per career
│   ├── equipment/       # Equipment by category
│   ├── skills.ts        # Skill definitions
│   └── tables.ts        # Shared tables (aging, life events)
├── types/               # TypeScript type definitions
└── utils/               # Generic utilities
```

## Suggested Build Order

The dependency chain dictates phase ordering:

1. **Foundation:** Project scaffolding, types, dice engine, hash system
2. **Core Creation:** Characteristics, background skills, XState workflow skeleton
3. **Career Engine:** Career data encoding, career resolution logic, all 12 careers
4. **Advanced Creation:** Pre-career education, events, aging, mustering out, psionics
5. **Equipment & Polish:** Equipment catalog, character sheet, override mode UX
6. **Export & Deploy:** PDF export, GitHub Pages deployment, final polish

**Critical path:** Types → Dice Engine → Career Data → XState Machine → UI

## Anti-Patterns to Avoid

| Anti-Pattern | Why It's Bad | Do This Instead |
|-------------|-------------|-----------------|
| Game logic in React components | Untestable, coupled to UI | Pure functions in `engine/`, components just call them |
| Monolithic career file | 1,200+ entries in one file is unmaintainable | One file per career in `data/careers/` |
| Stringly-typed data | `"STR"` instead of typed enums → runtime errors | TypeScript enums/unions for characteristics, skills, careers |
| Retrofitting the hash | Adding hash after dice logic exists → mismatched design | Design roll log format before writing any dice code |
| State spaghetti | useState everywhere → impossible to undo/snapshot | Centralized Zustand store + XState for workflow |
| Encoding data without tests | Typos in 1,200 data entries are inevitable | Test every career table against known values from the book |

## Internal Boundaries

| From | To | Communication |
|------|-----|---------------|
| UI → State | XState events, Zustand actions | Never call domain logic directly from components |
| State → Domain | Pure function calls | Domain functions are stateless, return new values |
| Domain → Data | Import static data | Data is read-only, never mutated |
| UI ← State | React hooks (useActor, useStore) | Components subscribe to state slices |

---
*Researched: 2026-03-19*
