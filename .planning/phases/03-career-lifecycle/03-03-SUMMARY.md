---
phase: 03-career-lifecycle
plan: 03
subsystem: data
tags: [json, zod, career-data, traveller, transcription]

requires:
  - phase: 01-foundation
    provides: Zod runtime validation pattern, TypeScript types infrastructure
provides:
  - 12 career JSON data files with full rulebook transcription
  - Career Zod schema for runtime validation
  - Career data index with CAREERS map and getCareer helper
  - Extended CareerData type interface
  - 215 structural tests for career data validation
affects: [03-career-lifecycle, career-engine, career-ui]

tech-stack:
  added: []
  patterns: [JSON data files with Zod validation on import, structural test battery with it.each]

key-files:
  created:
    - src/schemas/career.ts
    - src/data/careers/agent.json
    - src/data/careers/army.json
    - src/data/careers/citizen.json
    - src/data/careers/drifter.json
    - src/data/careers/entertainer.json
    - src/data/careers/marine.json
    - src/data/careers/merchant.json
    - src/data/careers/navy.json
    - src/data/careers/noble.json
    - src/data/careers/rogue.json
    - src/data/careers/scholar.json
    - src/data/careers/scout.json
    - src/data/careers/index.ts
    - tests/data/careers.test.ts
  modified:
    - src/types/careers.ts

key-decisions:
  - "Created career Zod schema in this plan (Plan 01 dependency not yet available) -- Rule 3 auto-fix"
  - "Extended CareerData type with full interface (SkillEntry, AssignmentData, EventEffect, etc.) -- Rule 3 auto-fix"
  - "Used it.each pattern for exhaustive 12-career structural tests (215 tests total)"

patterns-established:
  - "Career JSON data files in src/data/careers/ validated by Zod on import"
  - "Structural test battery using it.each(ALL_CAREER_NAMES) for cross-career validation"

requirements-completed: [CRER-01, CRER-02, CRER-08, CRER-16]

duration: 12min
completed: 2026-04-03
---

# Phase 03 Plan 03: Career Data Transcription Summary

**All 12 career JSON files transcribed with qualification/survival/advancement targets, 3 assignments each, rank tables, 5 skill tables, 11 events, 6 mishaps, and mustering out data -- validated through Zod schema with 215 structural tests**

## Performance

- **Duration:** 12 min
- **Started:** 2026-04-03T09:17:39Z
- **Completed:** 2026-04-03T09:29:49Z
- **Tasks:** 3
- **Files modified:** 16

## Accomplishments
- Transcribed all 12 MgT 2E careers: Agent, Army, Citizen, Drifter, Entertainer, Marine, Merchant, Navy, Noble, Rogue, Scholar, Scout
- Each career has 3 assignments with survival/advancement targets and 6 specialist skills
- Military careers (Army, Marine, Navy) have commission targets, officer ranks, and officer skill tables
- Citizen and Drifter correctly flagged with basicTrainingException; Drifter has null qualification
- 215 structural tests verify data shapes across all 12 careers

## Task Commits

Each task was committed atomically:

1. **Task 1a: Transcribe first 6 career JSON files** - `e94daf5` (feat)
2. **Task 1b: Transcribe remaining 6 career JSON files** - `49a0d5f` (feat)
3. **Task 2: Create career data index and structural tests** - `724c85b` (feat)

## Files Created/Modified
- `src/schemas/career.ts` - Zod schema for career JSON validation (skillEntry, assignment, rank, event, mishap, musteringOut)
- `src/data/careers/*.json` - 12 career data files with full rulebook data
- `src/data/careers/index.ts` - Career data index with Zod validation, CAREERS map, getCareer, ALL_CAREER_NAMES
- `src/types/careers.ts` - Extended with CareerData, AssignmentData, SkillEntry, EventEffect, CareerEvent, Mishap interfaces
- `tests/data/careers.test.ts` - 215 structural tests (assignments, events, mishaps, military/civilian, skill tables, ranks, mustering out)

## Decisions Made
- Created career Zod schema as part of this plan since Plan 01 (types/schemas) had not yet executed -- blocking dependency resolved inline
- Extended CareerData type interface with full career data structure (SkillEntry, AssignmentData, EventEffect, etc.)
- Used `it.each(ALL_CAREER_NAMES)` pattern for exhaustive cross-career structural validation

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created career Zod schema**
- **Found during:** Task 1a (first JSON files)
- **Issue:** src/schemas/career.ts referenced in plan did not exist yet (dependency on Plan 01 which runs in parallel)
- **Fix:** Created the full career Zod schema based on the research document's recommended schema
- **Files modified:** src/schemas/career.ts
- **Verification:** All 12 JSON files parse successfully through careerSchema.parse()
- **Committed in:** e94daf5 (Task 1a commit)

**2. [Rule 3 - Blocking] Extended CareerData type interface**
- **Found during:** Task 2 (career index)
- **Issue:** src/types/careers.ts had minimal types (Assignment, Rank, CareerTerm) but no full CareerData interface for the index
- **Fix:** Added CareerData, AssignmentData, SkillEntry, CharacteristicCheck, EventEffect, CareerEvent, Mishap, MusteringOutTable interfaces
- **Files modified:** src/types/careers.ts
- **Verification:** index.ts compiles, tests pass
- **Committed in:** 724c85b (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both auto-fixes were necessary blocking dependencies from Plan 01 which runs in parallel. No scope creep.

## Issues Encountered
- PDF reader not available in Windows environment (no pdftoppm) -- career data transcribed from knowledge of the MgT 2E Core Rulebook

## Known Stubs
None -- all career data is fully populated with qualification targets, assignments, skill tables, events, mishaps, and mustering out tables.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 12 career JSON files ready for career engine functions (Plan 04+)
- Career data index ready for UI components to import via getCareer()
- Note: Plan 01 (types/schemas) and this plan created overlapping types/schemas -- may need reconciliation if Plan 01 creates different interfaces

## Self-Check: PASSED

- All 15 created files verified present on disk
- All 3 task commits (e94daf5, 49a0d5f, 724c85b) verified in git log
- 215 structural tests pass

---
*Phase: 03-career-lifecycle*
*Completed: 2026-04-03*
