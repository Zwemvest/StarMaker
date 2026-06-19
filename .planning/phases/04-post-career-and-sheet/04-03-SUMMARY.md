---
phase: 04-post-career-and-sheet
plan: 03
subsystem: post-career-engines
tags: [engine, psionics, equipment, unusual-events, tdd, pure-functions]
dependency_graph:
  requires:
    - src/types/psionics.ts
    - src/data/psionics.ts
    - src/types/equipment.ts
    - src/data/unusual-events.ts
  provides:
    - src/engine/psionics.ts
    - src/engine/equipment.ts
    - src/engine/unusual-events.ts
  affects: []
tech_stack:
  added: []
  patterns: [pure-engine-functions, tdd-red-green, caller-supplied-dice-total]
key_files:
  created:
    - src/engine/psionics.ts
    - src/engine/equipment.ts
    - src/engine/unusual-events.ts
    - tests/engine/psionics.test.ts
    - tests/engine/equipment.test.ts
    - tests/engine/unusual-events.test.ts
  modified: []
decisions:
  - "Engines stay pure: every function takes the already-summed diceTotal from the caller and never rolls, keeping them deterministic and side-effect free"
  - "getTalentLearnDM and resolveUnusualEvent throw on unknown talent / out-of-range roll rather than returning undefined, surfacing caller bugs early"
  - "Tests assert success/target against the real PSI_LEARN_TARGET constant (not a hardcoded 8) while asserting the total arithmetic against literal numbers"
  - "Omitted the optional getLegitimacyStatus helper per plan guidance (YAGNI / kept scope tight)"
metrics:
  completed: "2026-06-19"
---

# Phase 4 Plan 03: Post-Career Engines Summary

Three pure Phase 4 engines from the locked 04-01 contract — psionics, equipment
budget/filter, and Unusual Events resolution — implemented TDD with 33 unit tests.

## What Was Built

### Task 1: Psionics engine (`src/engine/psionics.ts`)
- **rollPsiStrength(diceTotal, termsServed)** — `max(0, diceTotal - termsServed)`, never negative (PSIN-01)
- **getTalentLearnDM(talent)** — learning DM from PSI_TALENTS (telepathy +4, clairvoyance +3, telekinesis +2, awareness +1, teleportation +0); throws on unknown talent (PSIN-02)
- **isTelepathyAutoGranted(talent, priorAttempts)** — true only for `telepathy` with `priorAttempts === 0` (PSIN-04)
- **resolveTalentLearn(diceTotal, psiDM, talent, priorAttempts)** — `total = diceTotal + psiDM + getTalentLearnDM(talent) - priorAttempts`; success at `>= PSI_LEARN_TARGET`; the cumulative -1 per prior attempt (PSIN-03) is applied here

### Task 2: Equipment engine (`src/engine/equipment.ts`)
- **canAfford(credits, cost)** — `credits >= cost` (exact balance affordable, EQUP-03)
- **applyPurchase(credits, cost)** — throws on overspend so the balance can never go negative; otherwise returns `credits - cost`
- **filterCatalog(items, category|'all', maxTL|null)** — filters by category ('all' = no filter) and TL ceiling (null = no ceiling); returns a fresh array, never mutates the input (EQUP-02)

### Task 3: Unusual Events engine (`src/engine/unusual-events.ts`)
- **resolveUnusualEvent(rollValue)** — looks up UNUSUAL_EVENTS by rollValue (1..6); result 1 carries `unlocksPsionics === true` (SHEE-05 / D-2); throws on out-of-range input

## Test Coverage
- **psionics.test.ts**: 13 tests
- **equipment.test.ts**: 13 tests
- **unusual-events.test.ts**: 7 tests
- **Total: 33 new tests, all passing**

## Verification
- `npx vitest run` on the three engine files — all pass
- `npx tsc --noEmit` — clean
- Purity: `grep -L "react\|stores/"` lists all three engines (no React, no store imports)
- Export counts: psionics 4, equipment 3, unusual-events 1
- Full suite: **38 files, 851 tests passing** (no regressions; +33 from this plan)

## Deviations from Plan
None. Implemented exactly the three engines + tests specified. The optional
`getLegitimacyStatus` helper was omitted per the plan's YAGNI guidance.

## Known Stubs
None — all functions fully implemented.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | dc2145b | Add psionics engine with PSI strength and talent learning |
| 2 | 3b7a8c3 | Add equipment engine with budget checks and catalog filtering |
| 3 | a88dde5 | Add unusual events engine resolving the 1D sub-table |

## Self-Check: PASSED
All 6 files verified present. Three commit hashes confirmed in git log.
