---
phase: 03-career-lifecycle
plan: 02
subsystem: aging-mustering-out-data
tags: [engine, data, aging, mustering-out, life-events, draft, tdd]
dependency_graph:
  requires: [types/common, types/careers, types/character]
  provides: [engine/aging, engine/mustering-out, data/aging, data/life-events, data/draft]
  affects: [career-term-loop, mustering-out-ui]
tech_stack:
  added: []
  patterns: [pure-engine-functions, typed-data-constants, tdd-red-green]
key_files:
  created:
    - src/data/aging.ts
    - src/engine/aging.ts
    - src/engine/mustering-out.ts
    - src/data/life-events.ts
    - src/data/draft.ts
    - tests/engine/aging.test.ts
    - tests/engine/mustering-out.test.ts
    - tests/data/life-events.test.ts
  modified:
    - src/types/careers.ts
decisions:
  - "EventEffect type added to careers.ts to support event effect system across careers and life events"
  - "Aging reduction amount = target - roll (not fixed -1) matching Core Rulebook aging check mechanic"
  - "Pension formula: Cr10,000 base at 5 terms + Cr2,000 per additional term"
metrics:
  duration: 4min
  completed: "2026-04-03T09:21:00Z"
  tasks_completed: 2
  tasks_total: 2
  test_count: 58
  files_changed: 9
---

# Phase 03 Plan 02: Aging, Mustering Out, Life Events & Draft Data Summary

Aging engine with 4-bracket check system, mustering-out benefit calculator with pension/cash-limit/rank rules, life events table with contact-generation effects, and 1D draft table -- all pure functions with 58 tests.

## Tasks Completed

### Task 1: Aging data, engine, and tests (TDD)
- **Commit:** `4c4b9b5`
- Created `AGING_TABLE` with 4 age brackets (34-45, 46-57, 58-69, 70+) checking STR, DEX, END
- `getAgingChecks(age)` returns null below 34, correct bracket checks otherwise
- `resolveAgingCheck(roll, dm, target)` calculates reduction when roll misses target
- `isAgingCrisis(value, reduction)` detects when characteristic would reach 0 or below
- 21 tests covering all brackets, boundary conditions, DM handling, crisis detection

### Task 2: Mustering-out engine, life events, draft table, and tests (TDD)
- **Commit:** `adef340`
- `calculateBenefitRolls` handles mishap term deduction (min 0)
- `getRankBonusRolls` returns 0-3 bonus rolls based on rank tiers
- `getRankDM` returns +1 for rank 5-6
- `canRollCash` enforces 3-roll lifetime maximum
- `calculatePension` returns 0 below 5 terms, Cr10,000 + Cr2,000/extra term
- `getCombinedRank` sums enlisted + officer rank for benefit calculation
- `LIFE_EVENTS` table: 11 entries (rolls 2-12) with contact/ally/rival/enemy effects
- `DRAFT_TABLE`: 1D mapping (Navy, Army, Marines, Merchant, Scout, Agent)
- Added `EventEffect` type to `careers.ts` for event effect system
- 37 tests covering all mustering-out rules and life events structure

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added EventEffect type to careers.ts**
- **Found during:** Task 2
- **Issue:** Plan referenced `EventEffect` import from `types/careers.ts` but the type did not exist
- **Fix:** Added `EventEffectType` union type and `EventEffect` interface to `src/types/careers.ts`
- **Files modified:** `src/types/careers.ts`
- **Commit:** `adef340`

## Verification Results

All 58 tests pass across 3 test files:
- `tests/engine/aging.test.ts` -- 21 tests passed
- `tests/engine/mustering-out.test.ts` -- 29 tests passed
- `tests/data/life-events.test.ts` -- 8 tests passed

All exported functions verified:
- `src/engine/aging.ts`: getAgingChecks, resolveAgingCheck, isAgingCrisis
- `src/engine/mustering-out.ts`: calculateBenefitRolls, getRankBonusRolls, getRankDM, canRollCash, calculatePension, getCombinedRank

## Known Stubs

None -- all data tables are fully populated and all engine functions are complete implementations.

## Self-Check: PASSED

- All 8 created files exist on disk
- Commit 4c4b9b5 (Task 1) verified in git log
- Commit adef340 (Task 2) verified in git log
- All 58 tests pass
