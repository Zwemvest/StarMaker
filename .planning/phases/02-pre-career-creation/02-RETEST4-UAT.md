---
status: complete
phase: 02-pre-career-creation
source: [02-RETEST3-UAT.md]
started: 2026-04-03T15:45:00Z
updated: 2026-04-03T15:52:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Already-Owned Skill Indicator
expected: When an education event offers skill choices, skills you already have appear dimmed with "(already owned)" label. Note: this only triggers on choice events with specific skill options, not on the regular skill table.
result: issue
reported: "During skill selection upon entering the University, could add Electronics 0 despite already having it — no visual indicator, warning, or dialog that it'd offer no benefit"
severity: major

### 2. Tooltip Readability
expected: Hovering over a relevant background skill (blue dot) shows a tooltip that is horizontally proportioned and readable — not excessively tall and narrow.
result: issue
reported: "Tooltips are still much taller than they are wide"
severity: cosmetic

## Summary

total: 2
passed: 0
issues: 2
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "Skills already owned should be visually indicated in education skill selectors (university/academy picker and event choices)"
  status: failed
  reason: "User reported: During university skill selection, could add Electronics 0 despite already having it — no indicator or warning"
  severity: major
  test: 1
  root_cause: "EducationSkillPicker component has no awareness of existing character skills; only EventCard checks for already-owned skills"
  artifacts: [src/components/education/EducationSkillPicker.tsx]
  missing: [existing-skill check in EducationSkillPicker, visual dimming/label for owned skills]

- truth: "Tooltips should be properly sized and legible, not excessively tall and narrow"
  status: failed
  reason: "User reported: Tooltips are still much taller than they are wide"
  severity: cosmetic
  test: 2
  root_cause: "Tooltip component uses whitespace-pre-line with max-w-xs (320px); tooltip text contains \\n separator between description and relevance text, causing narrow tall rendering"
  artifacts: [src/components/ui/Tooltip.tsx, src/components/background-skills/SkillPool.tsx]
  missing: [wider min-width on tooltip, or horizontal layout for multi-line content]
