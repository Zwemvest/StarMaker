# Phase 03 — Deferred Items

Out-of-scope discoveries logged during execution of phase 03 gap-closure plans.
These are pre-existing issues that are NOT caused by the current plan's changes;
they exist in the base commit and should be addressed as a separate cleanup pass.

## Pre-existing TS6133 unused-variable errors (from base commit 5a092ff)

Discovered while running `npm run build` during plan 03-10 verification.
None of these files are modified by plan 03-10 — they are pre-existing build
failures in the base commit.

| File                                            | Line | Symbol          | Kind           |
| ------------------------------------------------ | ---- | --------------- | -------------- |
| src/components/career/CareerStep.tsx             | 23   | CreationEvent   | unused import  |
| src/components/career/CareerStep.tsx             | 117  | diceTotal       | unused var     |
| src/components/career/ContinueLeaveCard.tsx      | 25   | termsInCareer   | unused param   |
| src/components/career/SkillTableTabs.tsx         | 73   | diceTotal       | unused var     |
| src/components/mustering-out/BenefitRoll.tsx     | 49   | diceTotal       | unused var     |

**Recommendation:** address these in a dedicated cleanup plan (e.g. 03-14) or
alongside plan 03-13 (commission/advancement migration) which refactors several
of the affected files anyway. For plan 03-10 verification purposes, tests pass
cleanly (730/730) and plan-10-specific files compile cleanly.
