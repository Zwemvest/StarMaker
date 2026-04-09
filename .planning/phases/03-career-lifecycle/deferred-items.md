# Deferred Items — Phase 03 Career Lifecycle

Out-of-scope findings discovered during plan execution. Not fixed in the
discovering plan because they are pre-existing and unrelated to that plan's
changes. Track here; address in a dedicated cleanup plan.

## From 03-11 (basic training fix, 2026-04-09)

Pre-existing TypeScript unused-variable warnings (TS6133) in files NOT touched
by plan 03-11. The full `npm run build` fails because of these even on a clean
baseline. Verified by stashing all 03-11 changes and re-running the build.

- `src/components/career/CareerGrid.tsx:6` — `Card` declared but never used
- `src/components/career/CareerStep.tsx:23` — `CreationEvent` declared but never used
- `src/components/career/CareerStep.tsx:117` — `diceTotal` declared but never used
- `src/components/career/ContinueLeaveCard.tsx:25` — `termsInCareer` declared but never used
- `src/components/career/SkillTableTabs.tsx:73` — `diceTotal` declared but never used
- `src/components/mustering-out/BenefitRoll.tsx:49` — `diceTotal` declared but never used

Plan 03-11 files (`src/engine/career.ts`, `src/components/career/BasicTrainingCard.tsx`,
`tests/components/basic-training.test.ts`, `tests/engine/career.test.ts`,
`tests/engine/golden-path.test.ts`) are all clean. All 688 tests pass.
