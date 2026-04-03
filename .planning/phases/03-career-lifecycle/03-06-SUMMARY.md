---
phase: 03-career-lifecycle
plan: 06
subsystem: career-term-ui
tags: [components, ui, career-loop, survival, events, commission, advancement, skills]
dependency_graph:
  requires: [src/engine/career.ts, src/types/careers.ts, src/hooks/useLoggedRoll.ts, src/data/life-events.ts]
  provides: [src/components/career/SurvivalRoll.tsx, src/components/career/MishapCard.tsx, src/components/career/CareerEventCard.tsx, src/components/career/CommissionCard.tsx, src/components/career/AdvancementCard.tsx, src/components/career/SkillTableTabs.tsx]
  affects: []
tech_stack:
  added: []
  patterns: [dramatic-roll-reveal, narrative-event-card, tabbed-skill-selection, roll-to-select]
key_files:
  created:
    - src/components/career/SurvivalRoll.tsx
    - src/components/career/MishapCard.tsx
    - src/components/career/CareerEventCard.tsx
    - src/components/career/CommissionCard.tsx
    - src/components/career/AdvancementCard.tsx
    - src/components/career/SkillTableTabs.tsx
  modified: []
decisions:
  - "1D skill rolls logged manually via createRollLogEntry + appendRoll since useLoggedRoll only exposes loggedRoll2D"
  - "Life event redirect for roll=7 uses D66 roll in component init state (eager evaluation)"
  - "Skill cap at level 4 shows warning but still grants skill at existing level (no increase)"
  - "AdvancementCard forced-stay overrides all other states when natural 12 is rolled"
metrics:
  duration: 4min
  completed: "2026-04-03T09:51:30Z"
---

# Phase 3 Plan 06: Career Term Loop UI Components Summary

Six career term UI components: dramatic survival roll with natural-2 handling, mishap display, narrative event cards with life events redirect, commission/advancement rolls with military career mechanics, and tabbed skill selection with roll-to-select and cap enforcement.

## What Was Built

### Task 1: SurvivalRoll, MishapCard, and CareerEventCard

**SurvivalRoll.tsx** (D-05 dramatic roll pattern):
- High-stakes "Roll for Survival" button with red styling
- Green relief glow on pass, red flash + "MISHAP!" on fail
- Natural 2 always-fail with extra dramatic text regardless of DM (CRER-07)
- Calls resolveSurvivalRoll from engine, then 1D for mishap table index on failure

**MishapCard.tsx**:
- Red-bordered card showing mishap description and effects
- Applies skill/characteristic effects to store on continue
- Forces career exit with "Continue to Mustering Out" button (CRER-06)

**CareerEventCard.tsx** (D-03 narrative pattern):
- Scanner-blue border, italic flavor text matching education EventCard
- Choice buttons for events with options
- For roll=7: redirects to LIFE_EVENTS table via D66 roll (CRER-09)
- Applies skill grants, characteristic changes, and contact tracking (SOCL-01)

### Task 2: CommissionCard, AdvancementCard, and SkillTableTabs

**CommissionCard.tsx** (D-06 sequential pattern):
- Commission target, characteristic DM, and DM-1 per term after first (CRER-11)
- On success: grants officer rank 1 and applies bonus skill via applyRankSkill
- Only shown for military careers when not yet commissioned (CRER-10)

**AdvancementCard.tsx** (D-06 sequential pattern):
- Forced to leave when advancement roll total <= terms served (CRER-13)
- Forced to stay on natural 12, locks Traveller in career (CRER-14)
- Rank bonus skills applied immediately on promotion (CRER-15)

**SkillTableTabs.tsx** (D-04 tabbed selection):
- Available tabs determined by getAvailableSkillTables: Personal Dev, Service, Specialist, Advanced Education (EDU 8+, CRER-17), Officer (commissioned only, CRER-17)
- Roll-to-select: user picks table, clicks "Roll for Skill (1D)" button
- Skill level 4 cap enforced with warning (CRER-18)
- Total skill limit (3 x (INT + EDU)) warning shown (CRER-19)
- 1D roll logged manually to maintain legitimacy hash chain

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Extended 1D roll logging for SkillTableTabs**
- **Found during:** Task 2
- **Issue:** useLoggedRoll only exposes loggedRoll2D; SkillTableTabs needs 1D rolls logged for legitimacy chain
- **Fix:** Used createRollLogEntry + appendRoll + computeHash directly in component (same pattern as hook, just for 1D notation)
- **Files modified:** src/components/career/SkillTableTabs.tsx
- **Commit:** c71640d

## Known Stubs

None - all 6 components are fully implemented with no placeholder data. Components import from engine/career.ts functions that exist in plan 03-01 (dependency).

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 8e6b72b | SurvivalRoll, MishapCard, CareerEventCard with dramatic reveals and life events redirect |
| 2 | c71640d | CommissionCard, AdvancementCard, SkillTableTabs with military mechanics and skill caps |
