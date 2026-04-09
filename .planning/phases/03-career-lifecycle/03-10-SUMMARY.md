---
phase: 03-career-lifecycle
plan: 10
subsystem: career-lifecycle
tags: [engine, ui, refactor, gap-closure, uat]
requirements: [CRER-01, CRER-02, CRER-03, EDUC-01]
requires:
  - src/types/character.ts
  - src/hooks/useLoggedRoll.ts
  - src/engine/career.ts
provides:
  - src/engine/dice.ts::probability2DAtLeast
  - src/engine/skill-benefit.ts::classifySkillBenefit
  - src/components/shared/DiceRollButton.tsx
  - src/components/shared/SkillSelectButton.tsx
affects:
  - src/components/career/CareerGrid.tsx
  - src/components/education/EducationStep.tsx
  - src/components/education/EventCard.tsx
tech-stack:
  added: []
  patterns:
    - "Engine helpers over component-local useCallbacks (lift probability math up)"
    - "Level-aware skill benefit classification mirrors addSkill reducer semantics"
    - "Reusable primitives in src/components/shared/ (DiceRollButton, SkillSelectButton)"
key-files:
  created:
    - src/engine/skill-benefit.ts
    - src/components/shared/DiceRollButton.tsx
    - src/components/shared/SkillSelectButton.tsx
    - tests/engine/skill-benefit.test.ts
    - tests/components/dice-roll-button.test.ts
    - tests/components/skill-select-button.test.ts
    - tests/components/career-grid.test.ts
    - .planning/phases/03-career-lifecycle/deferred-items.md
  modified:
    - src/engine/dice.ts
    - src/components/career/CareerGrid.tsx
    - src/components/education/EducationStep.tsx
    - src/components/education/EventCard.tsx
    - tests/engine/dice.test.ts
    - tests/components/education.test.ts
decisions:
  - "[03-10]: probability2DAtLeast lives in src/engine/dice.ts (engine, not component) so it can be consumed by any future roll site without duplication"
  - "[03-10]: classifySkillBenefit mirrors addSkill reducer semantics exactly — same case-sensitive comparison, same 'equal level is no benefit' rule"
  - "[03-10]: SkillSelectButton dims 'no benefit' options with opacity-50 but does NOT disable them — the UI informs the user, it does not block them"
  - "[03-10]: EventCard now receives Skill[] directly from the character store instead of pre-mapped string[], enabling level-aware classification"
metrics:
  duration: 10min
  completed: 2026-04-09
---

# Phase 03 Plan 10: Lift probability helpers & add DiceRollButton/SkillSelectButton primitives Summary

Lifted the probability math and skill benefit classifier into the engine, built two reusable React primitives (DiceRollButton, SkillSelectButton), retrofitted CareerGrid to show per-career qualification odds, and fixed the name-only owned-skill bug in EventCard so "Admin 1 offered to a char with Admin 0" now correctly annotates as "(upgrade)" instead of the incorrect "already owned".

## Objective

Close UAT gaps 4 and 5 together: lift probability helpers into the engine, create reusable DiceRollButton and SkillSelectButton primitives, show qualification odds on the CareerGrid, and fix the name-only owned-skill bug in EventCard.

## What Was Done

### Task 1 — Engine helpers (TDD) `93d486b`

Added two pure functions to the engine:

- **`probability2DAtLeast(target, dm)`** in `src/engine/dice.ts` — enumerates all 36 outcomes of 2D6 and returns the rounded percentage of rolls meeting `target` after applying `dm`. Clamps effective target to `[2, 12]` (always 100% or 0% at the extremes).
- **`classifySkillBenefit(existing, name, level)`** in `src/engine/skill-benefit.ts` (NEW FILE) — returns `'new' | 'upgrade' | 'none'`. Mirrors the addSkill reducer semantics exactly: case-sensitive match, equal level is no benefit.

Test coverage (12 tests):
- `probability2DAtLeast`: table-driven tests for known values (2→100, 8→42, 8+DM2→72, 12→3, 13→0, 5-DM2→58, 7→58), plus edge cases (clamping, integer return).
- `classifySkillBenefit`: empty list, non-empty list without match, upgrade, equal-level no-benefit, higher-level no-benefit, case sensitivity, non-mutation, multi-skill lookup.

### Task 2 — Shared primitives (TDD) `2429cd9`

Added two reusable React components in `src/components/shared/`:

- **`DiceRollButton`** — wraps `useLoggedRoll2D` + `Button` + an odds pill. Computes odds via `probability2DAtLeast(target, dm)` and colors them green (≥50%) or amber (<50%). Shows "Rolling..." and disables itself while the roll is in-flight. Emits both the `RollLogEntry` and the raw dice total via `onRolled` so callers can use either representation. Tooltip on both button and pill shows the DM breakdown ("Target N+, DM +N").
- **`SkillSelectButton`** — wraps `classifySkillBenefit` + `Button`. Renders a `(upgrade from N)` or `(no benefit)` annotation based on the classification. `'none'` gets `opacity-50` but is NOT disabled — the user is informed, not blocked. `onSelect` always fires.

Test coverage (19 tests):
- `DiceRollButton`: label rendering, odds pill with correct color, click → mocked loggedRoll2D → onRolled invoked with entry and diceTotal, disabled-while-rolling state, DM breakdown tooltip with positive and negative DMs.
- `SkillSelectButton`: all 3 benefit states rendered correctly, opacity-50 class applied only for 'none', click always fires onSelect, custom label override, disabled prop respected.

### Task 3 — Integration `dbccbee`

Wired the new helpers and primitives into the existing components:

- **`CareerGrid`**: imports `probability2DAtLeast`, computes `odds` per career, renders an absolute-positioned odds pill in the top-right of each card (green ≥50%, amber <50%). Careers with no qualification (Drifter) render no pill. Also removed a pre-existing unused `Card` import.
- **`EducationStep`**: deleted the local `calculateOdds` useCallback (15 lines), imported `probability2DAtLeast` from the engine, and replaced both call sites (`calculateOdds(...)` → `probability2DAtLeast(...)`). Drop-in replacement — UI behavior unchanged. Also changed the `<EventCard>` call to pass `skills` (Skill[]) instead of `existingSkillNames` (string[]).
- **`EventCard`**: prop type changed from `existingSkills?: string[]` to `existingSkills?: Skill[]`. Replaced the broken `existingSkills.includes(match[1])` check with `classifySkillBenefit(existingSkills, name, level)`. Annotations now distinguish `(upgrade)` from `(no benefit)` and only the `'none'` case dims with `opacity-50`.

Test coverage (7 new tests):
- `tests/components/career-grid.test.ts`: renders all 12 careers; Army odds match `probability2DAtLeast`; green color on easy qualifications; amber color on hard qualifications; Drifter has no pill; previous-career DM-1 penalty propagates to odds.
- `tests/components/education.test.ts`: EventCard owned-skill classification — "Admin 0 + Admin 1" → upgrade (not no-benefit); "Admin 1 + Admin 1" → no benefit; "Admin 2 + Admin 1" → no benefit; new skill has no annotation; click always fires onResolve.

## Verification

**Test suite:** `npx vitest run` — **730/730 tests pass** (up from 703 before this plan; +27 new tests across 4 new/extended test files).

**Build:** `npm run build` — plan 03-10 files compile cleanly. TypeScript reports 5 pre-existing TS6133 unused-variable errors in unrelated files that were NOT touched by this plan:
- `src/components/career/CareerStep.tsx` (2)
- `src/components/career/ContinueLeaveCard.tsx` (1)
- `src/components/career/SkillTableTabs.tsx` (1)
- `src/components/mustering-out/BenefitRoll.tsx` (1)

Per the scope-boundary rule, these are documented in `.planning/phases/03-career-lifecycle/deferred-items.md` for a future cleanup pass.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Removed pre-existing unused `Card` import from CareerGrid.tsx**
- **Found during:** Task 3 build verification.
- **Issue:** The base commit's `CareerGrid.tsx` had an unused `import { Card } from '../ui/Card';` that produced a TS6133 error during build.
- **Fix:** Removed the import (no functional change).
- **Files modified:** src/components/career/CareerGrid.tsx
- **Commit:** dbccbee
- **Rationale:** Since this plan already touches CareerGrid and the build was the verification target, cleaning up the unused import in this file was in scope.

**2. [Rule 3 - Blocking] Pre-existing unused-variable errors in OTHER files → deferred**
- **Found during:** Task 3 build verification.
- **Issue:** 5 TS6133 errors in files NOT touched by this plan.
- **Action:** Documented in `.planning/phases/03-career-lifecycle/deferred-items.md`. Not fixed — per scope-boundary rule, out-of-scope pre-existing issues should not be auto-fixed.
- **Impact:** plan 03-10 itself compiles clean; full build has pre-existing failures that predate this plan.

### Test Expectation Adjustment

**3. [Rule 1 - Bug in test]: CareerGrid green-color test assumed 100% at END 12**
- **Found during:** Task 3 test run.
- **Issue:** The initial test expected `screen.getAllByText('100%')` when END=12, but END 12 gives DM+2 → target 5 → effective target 3 → 97% (not 100%, because effective target 3 is still rollable and 35/36 ≠ 100%). Also, the `{odds}%` JSX renders as two separate text nodes, which would have broken the exact match anyway.
- **Fix:** Changed the test to assert on the presence of a `.text-green-400` CSS class instead of a specific percentage string. This is semantically what we want to test anyway.
- **Files modified:** tests/components/career-grid.test.ts

## Known Stubs

None. All new code paths are wired to real data.

## How to Verify Manually

```bash
npm run dev
```

1. Complete characteristics → background skills → education → land on "Choose a Career".
2. Each of the 11 careers with a qualification should show a small percentage pill in the top-right (green ≥50%, amber <50%). Drifter should show no pill.
3. Hover the pill to see the DM breakdown in the tooltip.
4. Navigate back to Education → University term → roll for an event. If the event offers a skill you already have at a higher level, the option should show "(no benefit)" in dim text. If you only have a lower level, it should show "(upgrade)" in blue.

## Self-Check: PASSED

- [x] `src/engine/dice.ts` — `probability2DAtLeast` added
- [x] `src/engine/skill-benefit.ts` — created with `classifySkillBenefit`
- [x] `src/components/shared/DiceRollButton.tsx` — created
- [x] `src/components/shared/SkillSelectButton.tsx` — created
- [x] `src/components/career/CareerGrid.tsx` — odds pill rendered
- [x] `src/components/education/EducationStep.tsx` — `calculateOdds` retired, uses `probability2DAtLeast`
- [x] `src/components/education/EventCard.tsx` — uses `classifySkillBenefit`, receives `Skill[]`
- [x] `tests/engine/dice.test.ts` — extended with probability tests
- [x] `tests/engine/skill-benefit.test.ts` — created, 9 tests
- [x] `tests/components/dice-roll-button.test.ts` — created, 9 tests
- [x] `tests/components/skill-select-button.test.ts` — created, 10 tests
- [x] `tests/components/career-grid.test.ts` — created, 6 tests
- [x] `tests/components/education.test.ts` — extended with 6 EventCard tests
- [x] Commits exist: 93d486b (Task 1), 2429cd9 (Task 2), dbccbee (Task 3)
- [x] All 730 tests pass
- [x] Plan 03-10 files compile clean (pre-existing unrelated errors documented in deferred-items.md)
