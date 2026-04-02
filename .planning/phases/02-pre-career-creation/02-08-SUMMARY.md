---
phase: 02-pre-career-creation
plan: 08
subsystem: education-ux
tags: [react, education, ux-fix, roll-log, tooltips, traveller-2e]

requires:
  - phase: 02-pre-career-creation
    plan: 05
    provides: "EducationStep, EventCard, RollLogDrawer, SkillPool, useLoggedRoll"

provides:
  - "formatRollContext() engine function for human-readable roll labels"
  - "options array on EducationEventEffect for individual choice buttons"
  - "Pre-roll entry card with target, DM, odds, and Roll button"
  - "Styled Tooltip on relevance markers with legend text"

affects:
  - "src/types/education.ts — added options field"
  - "src/data/education-events.ts — restructured choice events"
  - "src/components/education/EventCard.tsx — individual option buttons"
  - "src/components/education/EducationStep.tsx — split choose/roll flow, choice skill application"
  - "src/components/shared/RollLogDrawer.tsx — formatted context labels"
  - "src/components/background-skills/SkillPool.tsx — Tooltip + legend"

tech-stack:
  added: []
  patterns:
    - "formatRollContext pattern for dot-path to label mapping"
    - "options array pattern for choice effect rendering"

key-files:
  created:
    - src/engine/format-roll-context.ts
  modified:
    - src/types/education.ts
    - src/data/education-events.ts
    - src/components/education/EventCard.tsx
    - src/components/education/EducationStep.tsx
    - src/components/shared/RollLogDrawer.tsx
    - src/components/background-skills/SkillPool.tsx

decisions:
  - "formatRollContext uses static lookup with dot-to-arrow fallback for unlisted contexts"
  - "Choice skill parsing uses regex match on 'Name Level' pattern; non-skill choices silently skip"

metrics:
  duration: 3min
  completed: "2026-04-02T10:29:00Z"
---

# Phase 02 Plan 08: Education UX Fixes Summary

Four UAT issues resolved: user-initiated entry rolls with odds display, individual event choice buttons, human-readable roll log labels via formatRollContext(), and styled relevance marker tooltips with legend text.

## What Was Done

### Task 1: Fix education event choices and entry roll UX (ab8391b)

**Event choice buttons (major fix):**
- Added `options?: string[]` field to `EducationEventEffect` type
- Restructured 4 choice events (rolls 2, 6, 8, 11) to use individual options arrays
- EventCard now renders one Button per option with the detail text as a label above
- handleEventResolve parses the chosen option string (e.g., "Admin 0") and applies the skill via addSkill

**Entry roll UX (minor fix):**
- Split handleChooseUniversity and handleChooseAcademy to only set path state, not roll
- Added pre-roll card showing target number, DM breakdown, and success odds percentage
- Added calculateOdds helper computing 2D probability for the effective target
- New handleRollEntry function extracts dice rolling logic, user-initiated via "Roll for Entry" button

### Task 2: Add roll log formatting and relevance marker tooltips (5d281bb)

**Roll log labels:**
- Created `src/engine/format-roll-context.ts` with CONTEXT_LABELS mapping 12 dot-paths to readable names
- RollLogDrawer imports formatRollContext and displays "Characteristic Roll 1" instead of "characteristics.roll.1"
- Fallback replaces dots with " > " for any unlisted future contexts

**Relevance marker tooltips:**
- Replaced native `title` attribute on blue relevance dots with styled Tooltip component
- Added legend paragraph below skill pool: "Skills marked with a blue dot are commonly useful during careers and education."

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- All 225 tests pass (npx vitest run)
- Production build succeeds (npx vite build, 339 KB JS)
- Event choices render as individual selectable buttons
- Entry roll shows target, DM, odds, and Roll button before rolling
- Roll log shows human-readable labels
- Relevance markers have styled tooltips and legend text

## Self-Check: PASSED
