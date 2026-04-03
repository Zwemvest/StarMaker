---
phase: 03-career-lifecycle
plan: 01
subsystem: career-engine
tags: [types, schemas, engine, tdd, pure-functions]
dependency_graph:
  requires: [src/types/character.ts, src/types/common.ts]
  provides: [src/types/careers.ts, src/schemas/career.ts, src/engine/career.ts]
  affects: []
tech_stack:
  added: []
  patterns: [pure-engine-functions, zod-schema-validation, tdd-red-green]
key_files:
  created:
    - src/schemas/career.ts
    - src/engine/career.ts
    - tests/schemas/career.test.ts
    - tests/engine/career.test.ts
  modified:
    - src/types/careers.ts
decisions:
  - "SkillEntry union type (string | {name, specialty?}) supports both simple and specialized skill references"
  - "CheckTarget extracted as reusable type for qualification, survival, advancement, commission targets"
  - "getBasicTrainingSkills takes assignmentIndex parameter to support Citizen/Drifter exception correctly"
  - "resolveAdvancementRoll checks both advancement success AND forced-leave/stay independently (both can be true simultaneously)"
metrics:
  duration: 5min
  completed: "2026-04-03T09:22:00Z"
---

# Phase 3 Plan 01: Career Types, Schemas, and Engine Summary

Career type system with 10+ new types, Zod validation schema with strict array lengths, and 15 pure engine functions covering all career roll mechanics, tested with 75 unit tests (TDD).

## What Was Built

### Task 1: Career Types and Zod Schema

Extended `src/types/careers.ts` with the complete career data type system:
- **CareerData**: Master type containing all career JSON fields
- **AssignmentData**: 3 per career, with survival/advancement targets and 6 specialist skills
- **RankEntry**: Level 0-6 with optional bonus skill and level
- **CareerEventEntry**: 11 entries (rolls 2-12) with effects and choice flag
- **MishapEntry**: 6 entries (rolls 1-6) with effects
- **EventEffect**: Typed effects (skill, characteristic, contact, ally, rival, enemy, choice, special, benefit, injury)
- **SkillEntry**: Union type for plain string or object with specialty
- **MusteringOutTable**: 7 cash amounts + 7 benefit descriptions
- **SkillTables**: 4 tables (personal dev, service, advanced education, officer)
- **RankTables**: Enlisted (7 ranks) + optional officer (7 ranks)

Created `src/schemas/career.ts` with Zod schemas enforcing:
- Exactly 3 assignments per career
- Exactly 6 specialist skills per assignment
- Exactly 11 events, 6 mishaps
- Exactly 7 cash entries, 7 benefit entries
- Exactly 7 ranks per rank table
- Nullable qualification (Drifter) and commission (non-military)

### Task 2: Career Engine (15 Pure Functions)

Created `src/engine/career.ts` with all career mechanics:
1. **calculateQualificationDM** — DM-1 per previous career
2. **resolveQualificationRoll** — threshold check
3. **resolveSurvivalRoll** — natural 2 always fails (before DM)
4. **resolveCommissionRoll** — DM-1 per term after first
5. **resolveAdvancementRoll** — natural 12 forced stay, total <= terms forced leave
6. **getAvailableSkillTables** — based on commission status and EDU
7. **applyRankSkill** — rank bonus lookup for enlisted/officer
8. **isSkillAtCap** — level 4 cap
9. **isOverSkillLimit** — total <= 3*(INT+EDU)
10. **getTotalSkillLevels** — sum of all levels
11. **getBasicTrainingSkills** — first career vs subsequent, Citizen/Drifter exception
12. **getDraftCareer** — 1D draft table lookup
13. **canReturnToCareer** — same career = false
14. **resolveAssignmentChange** — same-career vs new-career transitions
15. **getNobleTitle** — SOC 11+ noble title mapping

## Test Coverage

- **14 schema tests**: Valid data acceptance, invalid data rejection (wrong array lengths, null qualification, skill entry variants, effect types)
- **61 engine tests**: All 15 functions with edge cases (natural 2 survival, natural 12 advancement, skill limits, basic training exception, draft table, noble titles)
- **Total: 75 tests, all passing**

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed -0 vs 0 in calculateQualificationDM**
- **Found during:** Task 2 GREEN phase
- **Issue:** `-1 * 0` produces `-0` in JavaScript, which fails `Object.is` equality with `0`
- **Fix:** Added explicit check for 0 count to return `0` instead of `-0`
- **Files modified:** src/engine/career.ts
- **Commit:** ec7b372

## Known Stubs

None - all types, schemas, and engine functions are fully implemented with no placeholder data.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | b386b65 | Career types extension and Zod career schema |
| 2 | ec7b372 | Career engine with 15 pure functions and 61 tests |

## Self-Check: PASSED

All 5 files verified present. Both commit hashes confirmed in git log.
