---
phase: 04-post-career-and-sheet
plan: 04
type: summary
status: complete
---

# 04-04 Summary: Store extensions + machine post-career states + psionics wiring

## What was built

### Task 1 — Zustand store (`src/stores/character.ts`, `tests/stores/character.test.ts`)
- Added four persisted fields: `psionicsUnlocked` (false), `psiStrength` (null),
  `psiTalents` ([]), `ownedEquipment` ([]) — present in `CharacterState`,
  `initialState`, and reset via `resetCharacter` (mutable arrays get fresh literals).
- Added actions: `setPsionicsUnlocked` (legitimate; does NOT touch `isModified`),
  `forcePsionicsUnlock` (sets flag + `isModified=true` + pushes a
  `psionics.forceUnlock` RollLogEntry marker so the legitimacy hash reflects the
  modification — SHEE-05), `setPsiStrength`, `addPsiTalent`,
  `addEquipment` (aggregates by `item.name`), `removeEquipment` (decrements, prunes
  at 0), `spendCredits` (`Math.max(0, …)` — EQUP-03).
- 13 new store tests under `describe('post-career: psionics + equipment')`.

### Task 2 — XState machine (`src/machines/creation.ts`, `tests/machines/creation.test.ts`)
- `CreationPhase` gains `psionics | equipment | sheet`.
- `CreationEvent` gains `PSIONICS_COMPLETE | EQUIPMENT_COMPLETE | SHEET_COMPLETE | FORCE_PSIONICS`.
- Flow re-targeted: `career.musteringOut --MUSTERING_COMPLETE--> #creation.psionics
  --PSIONICS_COMPLETE--> equipment --EQUIPMENT_COMPLETE--> sheet --SHEET_COMPLETE--> complete`.
- `psionics` is a top-level state, always entered after mustering out; `FORCE_PSIONICS`
  is an internal self-transition (no actions — the side effect lives in the store).
- `complete` stays `type: 'final'`.
- Updated two pre-existing tests that asserted `MUSTERING_COMPLETE -> complete`
  to thread through the new states; added `describe('post-career sequence')` with
  happy-path, FORCE_PSIONICS self-transition, and a negative case.

### Task 3 — Unusual Event wiring (`src/components/career/CareerEventCard.tsx`, `src/hooks/useLoggedRoll.ts`, `tests/components/career-event-card.test.ts`)
- Confirmed resolution site via grep: `CareerEventCard.tsx` owns the
  `LIFE_EVENTS.find(...)` lookup. Wired there.
- Added `loggedRoll1D` to `useLoggedRoll` (mirrors `loggedRoll2D`, uses `rollDice(1,6)`,
  notation `'1D'`).
- `applyEffects` is now async; on `lifeEvent?.rollValue === 12` it rolls the 1D
  Unusual sub-table, resolves via `resolveUnusualEvent`, and calls
  `setPsionicsUnlocked()` when `unlocksPsionics` (result 1). Legitimate path — no
  `isModified`. `handleResolve` now awaits `applyEffects` before computing the
  advancement bonus / calling `onResolved`.
- Side effect of making resolution async: the 5 existing `career-event-card` tests
  were updated to `async` + `waitFor` (assertions now resolve on a microtask).
- `src/data/life-events.ts` roll-12 entry left unchanged (mechanics live in the
  component, as the plan specified).

## Test results
- `tests/stores/character.test.ts`: 39 passed
- `tests/machines/creation.test.ts`: 60 passed
- `tests/components/career-event-card.test.ts`: 5 passed
- Full suite: **886 passed / 886 (39 files)** — no regressions.
- `npx tsc --noEmit`: clean.

## Files changed
- src/stores/character.ts
- tests/stores/character.test.ts
- src/machines/creation.ts
- tests/machines/creation.test.ts
- src/components/career/CareerEventCard.tsx
- src/hooks/useLoggedRoll.ts
- tests/components/career-event-card.test.ts

## Commits
- 9cacf30 Add psionics and equipment fields to character store
- d84eb87 Add post-career psionics, equipment and sheet states to creation machine
- b7f3e50 Unlock psionics on Life Events unusual sub-table result 1

## Concerns
- None blocking. The store + its tests (Task 1) were already present in the working
  tree from a prior partial run; verified correct against the LOCKED contract,
  passing, and committed.
- Making `applyEffects` async (per plan) deferred `onResolved` past the click's
  synchronous turn; the 5 existing CareerEventCard tests were adapted to `waitFor`.
  This was a necessary consequence of the required async change, not a behavior
  regression.
