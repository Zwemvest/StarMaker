---
phase: 02-pre-career-creation
plan: 11
subsystem: ui
tags: [react, tailwind, tooltip, drag-and-drop, education]

requires:
  - phase: 02-pre-career-creation
    provides: EducationSkillPicker, Tooltip, SkillPool components
provides:
  - Already-owned skill visual indicators in education skill picker
  - Horizontally proportioned tooltip sizing
affects: [03-career-lifecycle]

tech-stack:
  added: []
  patterns:
    - "existingSkills prop pattern for owned-skill awareness (matches EventCard)"

key-files:
  created: []
  modified:
    - src/components/education/EducationSkillPicker.tsx
    - src/components/education/EducationStep.tsx
    - src/components/ui/Tooltip.tsx
    - src/components/background-skills/SkillPool.tsx

key-decisions:
  - "Keep owned skills draggable (informational only, per Traveller rules)"

patterns-established:
  - "existingSkills prop pattern: pass character skill names array for dimming/labelling"

requirements-completed: []

duration: 2min
completed: 2026-04-03
---

# Phase 02 Plan 11: Owned-Skill Indicators and Tooltip Sizing Summary

**Already-owned skill dimming with '(already owned)' labels in education picker, plus horizontally proportioned tooltips with min-w-[200px] max-w-sm**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-03T13:58:50Z
- **Completed:** 2026-04-03T14:01:20Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- University skill picker shows dimmed skills with "(already owned)" label when character already has them
- Academy auto-granted skill badges show the same owned-skill indicators
- Tooltips now render with min-width 200px and max-width sm (384px), wrapping naturally instead of tall/narrow
- Background skill tooltip separator changed from newline to em-dash for horizontal layout

## Task Commits

Each task was committed atomically:

1. **Task 1: Add already-owned skill indicators to EducationSkillPicker** - `96cd72b` (feat)
2. **Task 2: Fix tooltip sizing to be horizontally proportioned** - `a28871c` (fix)

## Files Created/Modified
- `src/components/education/EducationSkillPicker.tsx` - Added existingSkills prop, opacity-50 + "(already owned)" label on owned skills in both university and academy views
- `src/components/education/EducationStep.tsx` - Passes existingSkillNames to EducationSkillPicker
- `src/components/ui/Tooltip.tsx` - Changed from whitespace-pre-line max-w-xs to whitespace-normal min-w-[200px] max-w-sm
- `src/components/background-skills/SkillPool.tsx` - Changed newline separator to em-dash in tooltip text

## Decisions Made
- Keep owned skills draggable in university picker (informational indicator only) -- per Traveller rules players CAN still pick already-owned skills, it just won't benefit them

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 02 UAT gaps from RETEST4 are now addressed
- All 5600 tests pass, TypeScript compiles cleanly

## Self-Check: PASSED

All 4 modified files verified on disk. Both task commits (96cd72b, a28871c) verified in git log.

---
*Phase: 02-pre-career-creation*
*Completed: 2026-04-03*
