---
status: complete
phase: 02-pre-career-creation
source: [inline-fix-commit-36bace6]
started: 2026-04-02T16:00:00Z
updated: 2026-04-02T16:10:00Z
---

## Current Test

[testing complete]

## Tests

### 1. White Screen Fix
expected: After confirming background skills, the app transitions smoothly to the education step. No white screen, no crash.
result: pass

### 2. Drag Snap-Back Fix
expected: Dropping a background skill into a slot no longer causes the drag overlay to briefly snap back to the pool. It disappears cleanly on drop.
result: pass

### 3. Tooltip Readability
expected: Hovering over a relevant background skill (with blue dot) shows a tooltip with the skill description on one line and "Commonly useful in careers and education paths" on a separate line below.
result: issue
reported: "Tooltips are much taller than wide, and poorly legible"
severity: cosmetic

### 4. No Duplicate Skills
expected: Skills from education (university skills, event choices) are not added multiple times. Character summary shows each skill only once.
result: pass
notes: No duplicates confirmed. User notes no visual indicator when selecting an already-owned skill (covered in test 5).

### 5. Already-Owned Skill Indicator
expected: When an education event offers skill choices, skills you already have are visually indicated (dimmed, tagged) so you know the choice would be redundant.
result: issue
reported: "Does not seem to be implemented. Did not see it in basic Education skill selector, nor in skill selection-by-event"
severity: major

### 6. Entry Odds on Cards + Back Button
expected: Education path selection cards show entry odds. After selecting a path, the pre-roll card has a back button to return to path selection without rolling.
result: pass
notes: User notes back buttons are still missing on other pages (characteristics confirmation, background skills confirmation). Broader UX concern for future phases.

## Summary

total: 6
passed: 4
issues: 2
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "Tooltips should be properly sized and legible, not excessively tall and narrow"
  status: failed
  reason: "User reported: Tooltips are much taller than wide, and poorly legible"
  severity: cosmetic
  test: 3
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""

- truth: "Skills already owned should be visually indicated in education skill selectors and event choices"
  status: failed
  reason: "User reported: Does not seem to be implemented. Did not see it in basic Education skill selector, nor in skill selection-by-event"
  severity: major
  test: 5
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""
