---
status: complete
phase: 02-pre-career-creation
source: [02-06-SUMMARY.md, 02-07-SUMMARY.md, 02-08-SUMMARY.md]
started: 2026-04-02T12:40:00Z
updated: 2026-04-02T12:55:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Drag Offset Fixed
expected: Dragging a characteristic value or background skill now tracks directly under the mouse pointer, not offset below it.
result: issue
reported: "Pass for attributes. On Background skills, there's no visual object being dragged, though dragging and dropping into the dropzones does work."
severity: major

### 2. Session Persistence
expected: After assigning characteristics and/or background skills, refreshing the page preserves your progress. Characteristics, skills, dice pool, and wizard position are all restored.
result: pass

### 3. Characteristics Confirmation Dialog
expected: After assigning all 6 characteristics, a visually distinct confirmation card appears (not the same grid layout). It shows a compact summary of your assignments with DMs and an amber warning about irreversibility. You must click "Confirm" to proceed.
result: pass

### 4. Background Skills Confirmation Dialog
expected: After filling all background skill slots, a confirmation dialog appears with a warning that skills cannot be changed after proceeding. You must explicitly confirm before skills are committed.
result: pass

### 5. Education Entry Roll UX
expected: After selecting University or an Academy branch, a pre-roll card appears showing the target number, your DM modifier, and the odds of success. A "Roll for Entry" button lets you initiate the roll yourself (it does not auto-fire).
result: issue
reported: "Though the odds of success appear, there is no option to opt out of the Entry Roll. In addition, it's not visible on the overview (University, Military Academy or Career?) page itself"
severity: minor

### 6. Education Event Choices
expected: When an education event offers choices (e.g., "Choose one: Admin 0, Profession 0, or Streetwise 0"), each option appears as a separate clickable button. Selecting one applies that skill.
result: issue
reported: "University/event skills are applied multiple times; Character summary shows duplicate skills (e.g. Admin0 x3, Electronics0 x2). Also needs a visual indicator that a certain option would not result in any benefits (like taking Admin 0 if you already have it)"
severity: major

### 7. Roll Log Labels
expected: Opening the roll log drawer shows human-readable labels (e.g., "Characteristic Roll #1", "University Entry Roll") instead of internal dot-paths like "characteristics.roll.6".
result: pass

### 8. Relevance Marker Tooltips
expected: Hovering over the blue dot on a background skill shows a styled tooltip explaining it marks commonly-used career/education skills. A small legend may also appear near the skill pool.
result: issue
reported: "Two tooltips (tooltip for skill itself and tooltip for the blue dot indicator) overlap."
severity: minor

## Summary

total: 8
passed: 4
issues: 4
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "Background skills should show a visible drag overlay object while being dragged"
  status: failed
  reason: "User reported: On Background skills, there's no visual object being dragged, though dragging and dropping into the dropzones does work."
  severity: major
  test: 1
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""

- truth: "Education path selection page should show entry odds and allow opting out before rolling"
  status: failed
  reason: "User reported: No option to opt out of the Entry Roll. Odds not visible on the overview (University, Military Academy or Career?) page itself"
  severity: minor
  test: 5
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""

- truth: "Skills should not be applied multiple times creating duplicates; redundant choices should be visually indicated"
  status: failed
  reason: "User reported: University/event skills are applied multiple times creating duplicate entries. Needs visual indicator when a choice would not result in any benefit."
  severity: major
  test: 6
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""

- truth: "Relevance marker tooltip and skill description tooltip should not overlap"
  status: failed
  reason: "User reported: Two tooltips (tooltip for skill itself and tooltip for the blue dot indicator) overlap."
  severity: minor
  test: 8
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""
