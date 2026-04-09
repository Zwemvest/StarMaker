# Phase 03 — Deferred Items

Out-of-scope discoveries logged during execution of phase 03 gap-closure plans.
These are pre-existing issues that are NOT caused by the current plan's changes;
they exist in the base commit and should be addressed as a separate cleanup pass.

## Pre-existing TS6133 unused-variable errors (from base commit 5a092ff)

Discovered independently during plan 03-10 and plan 03-11 verification when
running `npm run build`. None of the files below are modified by those plans —
they are pre-existing build failures in the base commit. Verified by stashing
each plan's changes and re-running the build on the clean baseline.

| File | Line | Symbol | Kind |
|------|------|--------|------|
| src/components/career/CareerGrid.tsx | 6 | `Card` | unused import (removed in-scope during 03-10) |
| src/components/career/CareerStep.tsx | 23 | `CreationEvent` | unused import |
| src/components/career/CareerStep.tsx | 117 | `diceTotal` | unused var |
| src/components/career/ContinueLeaveCard.tsx | 25 | `termsInCareer` | unused param |
| src/components/career/SkillTableTabs.tsx | 73 | `diceTotal` | unused var |
| src/components/mustering-out/BenefitRoll.tsx | 49 | `diceTotal` | unused var |

**Status:**
- Tests pass cleanly on all Wave 1 gap-closure plans (03-09, 03-10, 03-11).
- `npm run build` fails on the above errors even on a clean baseline.
- Plan 03-10 removed the `CareerGrid.tsx` `Card` import in-scope (file being modified).

**Recommendation:** address the remaining 5 errors in a dedicated cleanup plan
(e.g. 03-14) or alongside plan 03-13 (commission/advancement DM migration),
which refactors `CareerStep.tsx` and related files anyway.
