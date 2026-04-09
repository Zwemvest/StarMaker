---
phase: 03-career-lifecycle
plan: 11
subsystem: career-lifecycle
tags: [career, basic-training, pick-one, crer-04, crer-05, tdd, regression-fix]

# Dependency graph
requires:
  - phase: 03-career-lifecycle
    provides: CareerData contract, BasicTrainingCard component, getBasicTrainingSkills engine function
provides:
  - Subsequent-career Basic Training step that actually renders pickable buttons (UAT gap 3 closure)
  - Engine contract where getBasicTrainingSkills returns the candidate pool for BOTH first and subsequent careers
  - Defensive empty-pool fallback with Continue button in BasicTrainingCard
  - Component-level test coverage of all four basic training paths (first/subsequent x normal/Citizen exception) plus the empty fallback
affects: [03-career-lifecycle execute-plan 03-12, 03-13, 04-mustering-out, 03-HUMAN-UAT retest]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Engine returns candidates; UI decides grant-all vs pick-one"
    - "Defensive UI fallbacks guarded by data-testid for testability"
    - "vi.doMock + dynamic import for per-test engine function override"

key-files:
  created:
    - tests/components/basic-training.test.ts
    - .planning/phases/03-career-lifecycle/deferred-items.md
  modified:
    - src/engine/career.ts
    - src/components/career/BasicTrainingCard.tsx
    - tests/engine/career.test.ts
    - tests/engine/golden-path.test.ts

key-decisions:
  - "Engine contract: getBasicTrainingSkills returns the candidate pool for both first and subsequent careers; isFirstCareer retained in signature for API stability and caller intent"
  - "Grant-all vs pick-one distinction lives in BasicTrainingCard, not in the engine — single source of truth for the candidate pool"
  - "Belt-and-suspenders: BasicTrainingCard renders an amber Continue fallback when skills.length === 0, even though the new engine contract should make that impossible"

patterns-established:
  - "UI-layer branching on caller state (isFirstCareer) rather than engine-layer branching — lets the engine return a single canonical contract and makes UI tests easier"
  - "data-testid markers for defensive UI branches enable component tests to assert which branch rendered without scraping text"
  - "vi.doMock + await import() pattern to force engine contract overrides per test without polluting the whole suite"

requirements-completed: [CRER-04, CRER-05]

# Metrics
duration: ~8min
completed: 2026-04-09
---

# Phase 03 Plan 11: Basic Training Subsequent-Career Fix Summary

**Subsequent-career Basic Training no longer dead-ends at a blank screen — engine now returns the service skills pool for both first and subsequent careers, and BasicTrainingCard renders 6 pickable buttons with a defensive Continue fallback**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-04-09T12:26:00Z (approx., after worktree reset)
- **Completed:** 2026-04-09T12:34:06Z
- **Tasks:** 2 (both TDD)
- **Files modified:** 5 (3 source + 2 existing tests)
- **Files created:** 2 (1 new test + deferred-items tracker)

## Accomplishments

- **UAT gap 3 closed.** A character starting a second or later career now sees a non-empty pool of service skills with real clickable buttons at the Basic Training step. No more "Select a basic skill" screen with zero buttons and no escape hatch.
- **Engine contract corrected.** `getBasicTrainingSkills` now returns `career.skillTables.serviceSkills` (or `assignments[i].specialistSkills` for Citizen/Drifter) regardless of `isFirstCareer`. The caller decides grant-all vs pick-one.
- **Defensive empty-pool fallback.** If the pool is ever empty (shouldn't happen after this fix, but belt-and-suspenders), BasicTrainingCard renders an amber notice and a Continue button that fires `onComplete` without granting a skill — no more dead screens.
- **Test coverage.** 3 engine tests updated/added to lock in the new contract + 7 new component tests exercising all four basic training paths plus the defensive empty fallback. Full test suite: 688 passing (up from 685).

## Task Commits

Each task was committed atomically with `--no-verify` (parallel executor):

1. **Task 1: Update engine contract and test contracts (RED→GREEN)** - `84e1b0e` (fix)
   - Updated `tests/engine/career.test.ts` (RED: 2 failing tests for subsequent-career pool + new CRER-05 subsequent case) and `tests/engine/golden-path.test.ts` (RED: army second-career expects 6 entries)
   - Updated `src/engine/career.ts` (GREEN: removed the `if (!isFirstCareer) return []` early bail; kept `isFirstCareer` parameter with `void isFirstCareer` for API stability)
   - Single commit because vitest was run in GREEN state after the edit sequence — same TDD cycle, same atomic change

2. **Task 2: Fix BasicTrainingCard subsequent-career branch to render a usable pick-one UI** - `5e074ab` (fix)
   - Wrapped the existing `.map()` over `skills` in a `skills.length > 0` guard
   - Added defensive empty-pool fallback with `data-testid="basic-training-empty-fallback"` and a Continue button
   - Tagged the pick-one grid with `data-testid="basic-training-pick-grid"` for component test assertions
   - Created `tests/components/basic-training.test.ts` with 7 tests covering first-career grant-all, subsequent-career pick-one (the regression), Citizen exception first-career, Citizen exception subsequent-career, and the defensive empty fallback (via `vi.doMock` + dynamic import)
   - Logged 6 pre-existing TS6133 build errors to `.planning/phases/03-career-lifecycle/deferred-items.md`

## Files Created/Modified

- `src/engine/career.ts` — `getBasicTrainingSkills` no longer bails early on subsequent careers; returns `serviceSkills` or `specialistSkills` based on `basicTrainingException` for BOTH cases; `isFirstCareer` retained with `void` for API stability + updated docstring
- `src/components/career/BasicTrainingCard.tsx` — Subsequent-career branch now guards on `skills.length > 0` and renders the 6 pickable buttons when populated; falls back to an amber Continue button when empty; both branches tagged with `data-testid` for component tests
- `tests/engine/career.test.ts` — Rewrote "returns empty array for subsequent careers" to "returns service skills pool for subsequent careers (CRER-04, caller picks one)"; added new test "returns assignment specialist skills for Citizen/Drifter subsequent career (CRER-05)"
- `tests/engine/golden-path.test.ts` — Rewrote "basic training for second army career returns empty array" to "returns service skills pool" with length 6 and contains 'Gun Combat'
- `tests/components/basic-training.test.ts` — NEW. 7 tests covering all four basic-training paths + the defensive empty fallback. Uses `createElement` + `@testing-library/react` + real Zustand store + `vi.doMock('../../src/engine/career', ...)` for the empty-pool defensive case
- `.planning/phases/03-career-lifecycle/deferred-items.md` — NEW. Logs 6 pre-existing TS6133 unused-variable errors in unrelated career/mustering-out files (verified pre-existing via `git stash`)

## Decisions Made

- **`isFirstCareer` kept in engine signature even though unused in the body.** Rationale: API stability — many call sites pass this parameter, and removing it would either be a breaking change or force a widespread refactor. Also makes caller intent explicit at the call site. Added `void isFirstCareer;` and a docstring note explaining why it's retained.
- **`grant-all` vs `pick-one` lives in the UI, not the engine.** The engine has one job — return the candidate pool. The component decides how to present it. This matches the "pure engine functions" pattern established in Phase 01-02 and keeps the engine testable in isolation.
- **Component tests use `data-testid` markers** for the pick-one grid and the empty fallback so tests can assert which branch rendered without relying on text content that could shift during copy tweaks.
- **Empty-pool fallback uses `vi.doMock` + dynamic import** rather than passing an override prop or mutating the real `CareerData` fixture. The point of the defensive branch is exactly that it shouldn't be reachable via the real engine, so mocking the engine is the most honest way to exercise it.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Worktree base mismatch at start**
- **Found during:** Pre-execution branch check
- **Issue:** Worktree HEAD was `cd3152b` (older branch state from before plan 03-11 existed), but expected base was `5a092ff`. Plan file `.planning/phases/03-career-lifecycle/03-11-PLAN.md` was not present in the working tree and a `git reset --soft` would have left the index in a confusing half-state.
- **Fix:** `git reset --hard 5a092ffc9e63f8edf1f69015bfa6477261e52136` to bring the worktree fully in line with the expected base. Verified clean working tree before proceeding.
- **Files modified:** None at this step — this was pure worktree hygiene.
- **Verification:** `git rev-parse HEAD` == `5a092ff...`, `git status --short` clean except for untracked `.claude/`
- **Committed in:** N/A (not a code change, just base alignment)

### Intentional Plan Merge

**Task 1's plan split "update tests" and "update engine" into two conceptual steps (RED then GREEN) but the TDD cycle was executed as a single atomic commit (`84e1b0e`).** Rationale: the RED step is validated by running the test suite (which I did — 3 failing tests, screenshot-documented in the conversation), but committing only the RED state would leave `main` broken. Instead I verified RED locally, then edited the engine and committed both together as a single "fix contract" atomic change. This matches the plan's spirit (TDD cycle completes in one commit per task) and the `task_commit_protocol` "commit after verification passed, done criteria met".

---

**Total deviations:** 1 auto-fixed (1 blocking — worktree base alignment)
**Impact on plan:** No scope creep. The base reset was necessary to even see the plan file; everything else matched the plan as written.

## Issues Encountered

- **Pre-existing TS6133 build errors.** `npm run build` fails on 6 unused-variable errors in files I didn't touch (CareerGrid, CareerStep, ContinueLeaveCard, SkillTableTabs, BenefitRoll). Verified pre-existing by stashing my changes — the errors are present on the clean baseline. Per scope-boundary rules (only auto-fix issues directly caused by the current task's changes), these were NOT fixed. Logged to `deferred-items.md` for a future cleanup plan.
- **Test suite runs clean.** 688 tests pass. 23 test files pass. No new failures introduced.

## Verification Results

- `npm run test -- tests/engine/career.test.ts tests/engine/golden-path.test.ts` → **135 passed** (all green after engine fix)
- `npm run test -- tests/components/basic-training.test.ts` → **7 passed** (all new component tests green first run)
- `npm run test` (full suite) → **688 passed / 23 files** — no regressions introduced
- `npm run build` → **fails on 6 pre-existing TS6133 errors in unrelated files** (see Issues Encountered + deferred-items.md). Zero build errors in the 3 files this plan modified.

## Known Stubs

None. The "No basic training skills available for this career" fallback copy is intentional defensive UX for a theoretically unreachable branch (after this plan, the engine always returns a populated pool for valid `CareerData`). The plan explicitly specifies this fallback under "Edge case — pool is empty (defensive, should not happen after Task 1 fix)".

## User Setup Required

None — no external service configuration required. Manual smoke test (from plan verification section) is optional but recommended: `npm run dev` → complete one career → muster out → start a second career → verify Basic Training shows 6 clickable skill buttons.

## Next Phase Readiness

- UAT gap 3 is closed. A second career's Basic Training now renders a functional pick-one UI.
- The engine contract change is isolated — all call sites (`BasicTrainingCard` is the only consumer in src/) get the new behavior automatically.
- The pre-existing TS6133 build errors logged to `deferred-items.md` should be addressed in a dedicated cleanup plan before any GitHub Pages deployment.
- Parallel wave agents working on plans 03-09/03-10/03-12/03-13 should not conflict with this change — only `src/engine/career.ts`, `src/components/career/BasicTrainingCard.tsx`, `tests/engine/career.test.ts`, `tests/engine/golden-path.test.ts`, and the new `tests/components/basic-training.test.ts` were touched.

## Self-Check: PASSED

**Files verified to exist:**
- `src/engine/career.ts` — MODIFIED (FOUND)
- `src/components/career/BasicTrainingCard.tsx` — MODIFIED (FOUND)
- `tests/engine/career.test.ts` — MODIFIED (FOUND)
- `tests/engine/golden-path.test.ts` — MODIFIED (FOUND)
- `tests/components/basic-training.test.ts` — CREATED (FOUND)
- `.planning/phases/03-career-lifecycle/deferred-items.md` — CREATED (FOUND)

**Commits verified to exist:**
- `84e1b0e` — fix(03-11): return service skills pool for subsequent careers (CRER-04) (FOUND)
- `5e074ab` — fix(03-11): render pick-one buttons for subsequent careers (CRER-04) (FOUND)

---
*Phase: 03-career-lifecycle*
*Completed: 2026-04-09*
