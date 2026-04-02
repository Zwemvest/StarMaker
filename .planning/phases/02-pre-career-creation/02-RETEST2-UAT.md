---
status: complete
phase: 02-pre-career-creation
source: [02-09-SUMMARY.md, 02-10-SUMMARY.md]
started: 2026-04-02T13:30:00Z
updated: 2026-04-02T13:40:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Background Skills Drag Overlay
expected: Dragging a background skill from the pool now shows a visible object following the cursor (matching the characteristics drag behavior).
result: issue
reported: "Picking up, dragging, and dropping works, but the card shortly zips 'back' to the pool once dropped."
severity: minor

### 2. Tooltip Overlap Fixed
expected: Hovering over a background skill with a blue relevance marker shows a single combined tooltip with both the skill description and relevance explanation. No overlapping tooltips.
result: issue
reported: "Long text makes the tooltip unreadable now. Maybe show the 'Commonly used for career paths' text on a new line?"
severity: cosmetic

### 3. No Duplicate Skills
expected: Skills from education (university skills, event choices) are not added multiple times. The character summary shows each skill only once.
result: issue
reported: "White, empty screen after background skill selection prevents me from even testing this functionality"
severity: blocker

### 4. Already-Owned Skill Indicator
expected: When an education event offers skill choices, skills you already have are visually indicated so you know the choice would be redundant.
result: blocked
blocked_by: prior-phase
reason: "Blocked by test 3 blocker — white screen after background skills"

### 5. Entry Odds on Selection Page
expected: The education path selection cards show the entry target number and your odds of success before you choose a path.
result: blocked
blocked_by: prior-phase
reason: "Blocked by test 3 blocker — white screen after background skills"

### 6. Entry Roll Back Button
expected: After selecting an education path, the pre-roll card has a back/cancel button to return to path selection without rolling.
result: blocked
blocked_by: prior-phase
reason: "Blocked by test 3 blocker — white screen after background skills"

## Summary

total: 6
passed: 0
issues: 3
pending: 0
skipped: 0
blocked: 3

## Gaps

- truth: "Background skills drag overlay should not snap back to pool after dropping"
  status: failed
  reason: "User reported: Card shortly zips back to the pool once dropped"
  severity: minor
  test: 1
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""

- truth: "Combined tooltip text should be readable with relevance info on a separate line"
  status: failed
  reason: "User reported: Long text makes the tooltip unreadable, show relevance text on a new line"
  severity: cosmetic
  test: 2
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""

- truth: "App should not crash with white screen after background skill confirmation"
  status: failed
  reason: "User reported: White, empty screen after background skill selection"
  severity: blocker
  test: 3
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""
