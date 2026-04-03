---
phase: 03-career-lifecycle
plan: 05
subsystem: career-ui
tags: [react, components, career-selection, qualification, basic-training, wizard]

requires:
  - phase: 03-career-lifecycle (plans 01, 03, 04)
    provides: Career engine functions, career data index, XState career sub-states
provides:
  - CareerGrid component for 12-career selection with DM display
  - AssignmentCards component for 3-assignment selection
  - QualFailCard for draft/drifter qualification failure handling
  - BasicTrainingCard for first/subsequent/exception basic training
  - CareerStep orchestrator with sub-state routing
  - WizardShell integration at career step position
affects: [03-career-lifecycle (plans 06-08), wizard-flow]

tech-stack:
  added: []
  patterns:
    - Props-based sub-state routing (CareerStep receives subState/send from WizardShell)
    - Callback props for event dispatch (onChoose, onDraft, onComplete)
    - Local state for qualification roll flow (matches EducationStep pattern)

key-files:
  created:
    - src/components/career/CareerGrid.tsx
    - src/components/career/AssignmentCards.tsx
    - src/components/career/QualFailCard.tsx
    - src/components/career/BasicTrainingCard.tsx
    - src/components/career/CareerStep.tsx
  modified:
    - src/components/wizard/WizardShell.tsx

key-decisions:
  - "CareerStep uses props pattern (subState/send) from WizardShell, matching EducationStep architecture rather than calling useCreationMachine directly"
  - "QualFailCard and BasicTrainingCard use callback props for event dispatch -- CareerStep orchestrator handles all XState communication"
  - "AssignmentCards renders SkillEntry union type (string | object) via skillEntryLabel helper function"

patterns-established:
  - "Career component directory (src/components/career/) with orchestrator + sub-components"
  - "calculateOdds utility duplicated from EducationStep (candidate for extraction to shared hook)"

requirements-completed: [CRER-01, CRER-02, CRER-03, CRER-04, CRER-05, CRER-20, CRER-21, CRER-22]

duration: 4min
completed: 2026-04-03
---

# Phase 03 Plan 05: Career Selection UI Summary

**Career entry UI with 12-career grid, 3-assignment cards, qualification roll with DM breakdown, draft/drifter failure handling, and first/subsequent/exception basic training -- all wired into WizardShell via CareerStep orchestrator**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-03T09:47:36Z
- **Completed:** 2026-04-03T09:51:28Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- CareerGrid displays all 12 careers in responsive grid (4/3/2 cols) with qualification targets, user DMs, and DM-1 penalty indicators
- Drifter correctly shows "No Qualification Required"; locked careers grayed out per CRER-24
- AssignmentCards shows 3 assignments per career with survival/advancement targets and 6 specialist skills
- QualFailCard offers Draft (with already-drafted disable) and Drifter options on qualification failure
- BasicTrainingCard handles three scenarios: first career (all service skills), subsequent (pick one), and Citizen/Drifter exception (specialist skills)
- CareerStep orchestrates all sub-states: choosingCareer, choosingAssignment, qualificationRoll, qualificationFailed, basicTraining
- Qualification roll card shows target, characteristic DM, previous careers penalty, total DM, and odds percentage
- Placeholders render for termLoop (Plan 06) and musteringOut (Plan 07)
- CareerStep registered in WizardShell at career position (step 4 of 5)

## Task Commits

Each task was committed atomically:

1. **Task 1: CareerGrid and AssignmentCards** - `e879580` (feat)
2. **Task 2: QualFailCard, BasicTrainingCard, CareerStep orchestrator** - `58d78db` (feat)

## Files Created/Modified
- `src/components/career/CareerGrid.tsx` - 12-career selection grid with qualification info and DM penalties
- `src/components/career/AssignmentCards.tsx` - 3-assignment cards with survival/advancement targets and specialist skills
- `src/components/career/QualFailCard.tsx` - Qualification failure card with draft/drifter options
- `src/components/career/BasicTrainingCard.tsx` - Basic training skill display with first/subsequent/exception handling
- `src/components/career/CareerStep.tsx` - Main orchestrator routing on XState sub-states
- `src/components/wizard/WizardShell.tsx` - Added CareerStep import and rendering at career phase

## Decisions Made
- CareerStep uses props pattern (subState/send) from WizardShell rather than calling useCreationMachine directly -- consistent with EducationStep architecture
- QualFailCard and BasicTrainingCard use callback props -- CareerStep handles all XState event dispatch
- AssignmentCards handles SkillEntry union type (string | {name, specialty?}) via helper function

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs
- termLoop sub-state renders placeholder text ("Term loop content will be implemented in Plan 06")
- musteringOut sub-state renders placeholder text ("Mustering out content will be implemented in Plan 07")
- These are intentional per the plan and will be resolved in Plans 06-07

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Career entry flow complete: grid -> assignment -> qualification -> failure handling -> basic training
- CareerStep ready for Plan 06 to add term loop components (survival, events, commission, advancement)
- CareerStep ready for Plan 07 to add mustering out components
- WizardShell integration complete -- career step accessible after education

## Self-Check: PASSED

- All 5 created files verified present on disk
- Both task commits (e879580, 58d78db) verified in git log
- WizardShell correctly imports and renders CareerStep

---
*Phase: 03-career-lifecycle*
*Completed: 2026-04-03*
