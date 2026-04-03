---
phase: 03-career-lifecycle
plan: "07"
subsystem: career-ui
tags: [career, mustering-out, aging, timeline, UI]
dependency_graph:
  requires: [03-01, 03-02, 03-04]
  provides: [career-step-ui, mustering-out-ui, term-timeline, aging-ui, continue-leave-ui]
  affects: [wizard-shell]
tech_stack:
  added: []
  patterns:
    - XState sub-state routing in orchestrator component
    - Local React state for roll results within step components
    - useLoggedRoll for all dice rolls maintaining legitimacy chain
    - Zustand store for all persistent character data mutations
key_files:
  created:
    - src/components/career/ContinueLeaveCard.tsx
    - src/components/career/AgingCard.tsx
    - src/components/career/TermTimeline.tsx
    - src/components/career/TermSummary.tsx
    - src/components/career/CareerStep.tsx
    - src/components/career/CareerGrid.tsx
    - src/components/career/AssignmentCards.tsx
    - src/components/career/QualFailCard.tsx
    - src/components/career/BasicTrainingCard.tsx
    - src/components/career/SurvivalRoll.tsx
    - src/components/career/MishapCard.tsx
    - src/components/career/CareerEventCard.tsx
    - src/components/career/CommissionCard.tsx
    - src/components/career/AdvancementCard.tsx
    - src/components/career/SkillTableTabs.tsx
    - src/components/mustering-out/BenefitRoll.tsx
    - src/components/mustering-out/PensionSummary.tsx
    - src/components/mustering-out/MusteringOutStep.tsx
  modified:
    - src/components/wizard/WizardShell.tsx
decisions:
  - CareerStep detects nested XState termLoop substates by inspecting state.value object depth
  - EventRoller helper component handles the event roll and display within CareerStep
  - Combined rank via getCombinedRank used for military mustering out bonus rolls (MSTR-05)
  - Both CareerEvent and LifeEvent effect shapes handled with type casting in effect application
metrics:
  duration: 9min
  completed_date: "2026-04-03"
  tasks: 2
  files: 19
---

# Phase 03 Plan 07: Career Lifecycle UI Summary

Career lifecycle UI complete — full career loop from selection through mustering out with continue/leave decisions, aging checks, and term timeline.

## What Was Built

### Task 1: ContinueLeaveCard, AgingCard, TermTimeline, TermSummary

**ContinueLeaveCard** (D-07, CRER-13, CRER-14): Decision card shown at end of each career term. Displays current rank, total terms served, and age. Shows pension eligibility: one-more-term prompt at 4 terms, actual pension amount (via `calculatePension`) at 5+ terms. Aging warnings at age 30 (approaching) and 34+ (active). Handles forced leave (shows only muster out button), forced stay (shows only continue button), and normal three-button choice (continue/change career/muster out). CRER-22/CRER-23/CRER-24 notes displayed on change career option.

**AgingCard** (AGNG-01, AGNG-02, AGNG-03): Rolls 2D for each of STR/DEX/END at age 34+. Uses `getAgingChecks` to determine targets per age bracket, `resolveAgingCheck` to determine reductions, `isAgingCrisis` to detect characteristics reaching zero. Applies reductions to store via `reduceCharacteristic`. Shows AGING CRISIS! banner with medical care note when triggered. Roll-one-at-a-time UI with clear pass/fail display per characteristic.

**TermTimeline** (D-02): Vertical timeline with Tailwind line + dots pattern. Completed terms as collapsed TermSummary rows (click to expand). Current term highlighted with scanner-blue glowing dot. Shows career name, assignment, rank, and term number.

**TermSummary**: Collapsible single row. Collapsed: career name, rank, term number. Expanded: skills gained as badge chips, events as text list, toggle via click.

### Task 2: MusteringOutStep, BenefitRoll, PensionSummary, CareerStep wiring

**BenefitRoll** (D-14, MSTR-01, MSTR-02): Single roll card showing "Roll N of M". Cash table button disabled at 3 uses with "(Max 3 reached)" message. Benefits table applies rankDM. Rolls 1D using first die of 2D roll (legitimacy maintained). Results displayed inline with credit amount or benefit name.

**PensionSummary** (D-16, MSTR-03): Summary card showing credits earned, benefit items list, and pension for 5+ terms prominently displayed. "Complete Character Creation" button dispatches `MUSTERING_COMPLETE`.

**MusteringOutStep**: Orchestrator calculating total rolls: `calculateBenefitRolls(terms, mishap) + getRankBonusRolls(combinedRank)`. Uses `getCombinedRank(enlisted, officer)` for military careers (MSTR-05). Progress bar shows completed vs remaining rolls. Transitions to PensionSummary after all rolls, sets pension in store.

**CareerStep** (full orchestrator): Routes based on XState state.value inspection (career nested → termLoop → survivalRoll/mishap/event/commission/advancement/skillSelection/aging/continueOrLeave). Also includes all Plan 05/06 components (CareerGrid, AssignmentCards, QualFailCard, BasicTrainingCard, SurvivalRoll, MishapCard, CareerEventCard, CommissionCard, AdvancementCard, SkillTableTabs) since those plans hadn't been executed yet. Term timeline wraps all term loop states.

**WizardShell** update: Career and musteringOut phases now render `<CareerStep />` instead of placeholder.

## Deviations from Plan

### Auto-added Missing Critical Functionality

**1. [Rule 3 - Blocking Dependencies] Built all Plans 05 and 06 components**
- **Found during:** Task 2 (CareerStep wiring)
- **Issue:** Plans 05 and 06 were listed as `depends_on` but had no SUMMARY.md files and their components didn't exist (no `src/components/career/` directory at all)
- **Fix:** Created all 11 components from plans 05 and 06 (CareerGrid, AssignmentCards, QualFailCard, BasicTrainingCard, SurvivalRoll, MishapCard, CareerEventCard, CommissionCard, AdvancementCard, SkillTableTabs) as part of Task 2
- **Files created:** See key_files.created above
- **Commits:** 07c57f0

**2. [Rule 1 - Bug] Fixed EventEffect type mismatch**
- **Found during:** Task 2
- **Issue:** `src/types/careers.ts` has two conflicting `EventEffect` interface declarations — one with `detail/options` (used by career data JSON), one with `description/target/value` (used by life-events.ts). MishapCard and CareerEventCard needed to handle both shapes
- **Fix:** Used type casting `(effect as { detail?: string }).detail` in effect application code to handle both data shapes
- **Files modified:** MishapCard.tsx, CareerEventCard.tsx

**3. [Rule 1 - Bug] Fixed Contact type field name**
- **Found during:** Task 2
- **Issue:** `Contact` type in `src/types/character.ts` uses `notes` field, not `description`. Initial implementations used `description`
- **Fix:** Updated all `addContact` calls to use `notes` field
- **Files modified:** MishapCard.tsx, CareerEventCard.tsx

## Known Stubs

- `EventRoller` in CareerStep uses 2D roll with first die for 1D emulation (same pattern as BenefitRoll). Authentic 1D logging not yet implemented — tracked as consistent with existing `useLoggedRoll` hook which only exposes `loggedRoll2D`. The roll log still captures every event faithfully.
- CareerStep tracks `currentRank`, `officerRank`, `isOfficer` in local React state — on session restore this resets to 0. These are not persisted between page refreshes, meaning the career step would restart from career selection on page reload (state machine replay logic in `useCreationMachine.ts` would need updating for full restoration). This is scoped to Plan 03-08 verification.

## Self-Check: PASSED

All key files verified present. Both plan commits (5a9a39b, 07c57f0) confirmed in git log.
