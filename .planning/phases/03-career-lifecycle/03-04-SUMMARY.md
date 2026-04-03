---
phase: 03-career-lifecycle
plan: 04
subsystem: state-management
tags: [zustand, xstate, career, state-machine, nested-states]

requires:
  - phase: 03-career-lifecycle (plans 01-03)
    provides: Career data types, engine functions, career data JSON
provides:
  - Extended Zustand character store with career tracking fields and actions
  - XState creation machine with deeply nested career sub-states
  - Career term lifecycle modeled as state machine (qualification -> training -> term loop -> mustering out)
affects: [03-career-lifecycle (plans 05-08), career UI components, mustering out]

tech-stack:
  added: []
  patterns:
    - Nested XState compound states for career term lifecycle
    - Guard-based routing for military vs civilian career paths
    - Context-tracked force flags (forcedToLeave, forcedToStay, justCommissioned)

key-files:
  created: []
  modified:
    - src/stores/character.ts
    - src/machines/creation.ts
    - tests/stores/character.test.ts
    - tests/machines/creation.test.ts

key-decisions:
  - "Commission state uses guard-based routing: isCommissioned sends to advancement, not-commissioned sends to skillSelection with justCommissioned flag (CRER-12)"
  - "Military career detection via hardcoded CareerName array in isMilitary guard rather than loading career data JSON"
  - "needsAging guard calculates age from totalTermsServed (18 + terms*4 >= 34) rather than reading store age"

patterns-established:
  - "Guard-based conditional routing in XState for career path branching"
  - "Context flags for cross-term state tracking (isCommissioned, justCommissioned, forcedToLeave, forcedToStay)"

requirements-completed: [CRER-01, SOCL-01, SOCL-02]

duration: 8min
completed: 2026-04-03
---

# Phase 03 Plan 04: Career State & Machine Summary

**Zustand store extended with 10 career fields and 11 actions; XState machine expanded from flat career state to 14 nested sub-states modeling the full term lifecycle**

## Performance

- **Duration:** 8 min
- **Started:** 2026-04-03T09:35:58Z
- **Completed:** 2026-04-03T09:44:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Zustand character store extended with careerHistory, contacts, age, credits, pension, benefits, drafted, previousCareers, lastCareer, and cashRollsUsed fields
- XState creation machine expanded with deeply nested career sub-states: choosingCareer -> qualificationRoll -> basicTraining -> termLoop (survival -> event -> commission -> advancement -> skill -> aging -> continueOrLeave) -> musteringOut
- Commission/advancement interaction correctly implements CRER-12 (justCommissioned skips advancement same term)
- All 2560 tests pass with zero regressions

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend Zustand store with career state and actions** - `b82cee6` (feat)
2. **Task 2: Expand XState machine with career sub-states** - `71c5399` (feat)

## Files Created/Modified
- `src/stores/character.ts` - Extended with 10 career state fields and 11 career actions (addCareerTerm, addContact, reduceCharacteristic, etc.)
- `src/machines/creation.ts` - Expanded from flat career state to 14 nested sub-states with 6 guards and 5 context-updating actions
- `tests/stores/character.test.ts` - 18 new tests for career store extensions
- `tests/machines/creation.test.ts` - 12 new career transition tests, updated existing tests for nested state structure

## Decisions Made
- Commission state uses guard-based routing: already-commissioned characters go to advancement, newly-commissioned skip advancement same term (CRER-12)
- Military career detection hardcoded as `['army', 'marine', 'navy']` in isMilitary guard rather than loading career data at machine level
- needsAging guard calculates age from totalTermsServed context rather than reading Zustand store age

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Career sub-states ready for UI component wiring (Plan 05+)
- Store actions ready for career event resolution
- Machine guards ready for career engine integration
- All existing education/characteristics transitions preserved

## Self-Check: PASSED

All files verified present. All commit hashes verified in git log.

---
*Phase: 03-career-lifecycle*
*Completed: 2026-04-03*
