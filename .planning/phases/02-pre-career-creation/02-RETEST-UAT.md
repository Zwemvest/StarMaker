---
status: diagnosed
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
  root_cause: "DragOverlay in BackgroundSkillsStep.tsx is empty — no onDragStart handler, no activeDragItem state, no rendered children inside DragOverlay. CharacteristicsStep has this pattern but BackgroundSkillsStep was not updated to match."
  artifacts:
    - path: "src/components/background-skills/BackgroundSkillsStep.tsx"
      issue: "Lines 129, 156-159: Missing onDragStart handler and empty DragOverlay content"
  missing:
    - "Add activeDragItem state, onDragStart/onDragEnd handlers, render active skill inside DragOverlay"
  debug_session: ""

- truth: "Education path selection page should show entry odds and allow opting out before rolling"
  status: failed
  reason: "User reported: No option to opt out of the Entry Roll. Odds not visible on the overview (University, Military Academy or Career?) page itself"
  severity: minor
  test: 5
  root_cause: "EducationCard doesn't receive characteristics or odds data. Pre-roll card has no back/cancel button and XState machine has no GO_BACK event on entry sub-states."
  artifacts:
    - path: "src/components/education/EducationCard.tsx"
      issue: "No odds display on selection cards"
    - path: "src/components/education/EducationStep.tsx"
      issue: "Lines 272-317: pre-roll card has no back button"
    - path: "src/machines/creation.ts"
      issue: "No GO_BACK event on universityEntry/academyEntry sub-states"
  missing:
    - "Pass odds to EducationCard, add GO_BACK event and back button on pre-roll card"
  debug_session: ""

- truth: "Skills should not be applied multiple times creating duplicates; redundant choices should be visually indicated"
  status: failed
  reason: "User reported: University/event skills are applied multiple times creating duplicate entries. Needs visual indicator when a choice would not result in any benefit."
  severity: major
  test: 6
  root_cause: "addSkill in character.ts (lines 75-78) does blind push with zero duplicate checking. Every call appends regardless of existing skills."
  artifacts:
    - path: "src/stores/character.ts"
      issue: "Lines 75-78: addSkill lacks duplicate guard"
    - path: "src/components/education/EventCard.tsx"
      issue: "Choice buttons don't indicate already-owned skills"
  missing:
    - "Add duplicate check in addSkill (skip or upgrade level)"
    - "Show visual indicator on choice buttons for already-owned skills"
  debug_session: ""

- truth: "Relevance marker tooltip and skill description tooltip should not overlap"
  status: failed
  reason: "User reported: Two tooltips (tooltip for skill itself and tooltip for the blue dot indicator) overlap."
  severity: minor
  test: 8
  root_cause: "Nested Tooltip components in SkillPool.tsx lines 53-76. Both use CSS group/group-hover which propagates through nesting, making both visible simultaneously."
  artifacts:
    - path: "src/components/background-skills/SkillPool.tsx"
      issue: "Lines 53-76: Nested Tooltip wrappers with conflicting group-hover"
  missing:
    - "Use named Tailwind groups (group/outer, group/inner) or combine into single tooltip showing both description and relevance info"
  debug_session: ""
