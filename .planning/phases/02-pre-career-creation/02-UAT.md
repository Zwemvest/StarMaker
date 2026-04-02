---
status: diagnosed
phase: 02-pre-career-creation
source: [02-01-SUMMARY.md, 02-02-SUMMARY.md, 02-03-SUMMARY.md, 02-04-SUMMARY.md, 02-05-SUMMARY.md]
started: 2026-04-02T09:00:00Z
updated: 2026-04-02T09:20:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Wizard Shell Layout
expected: App loads with a three-zone layout: progress bar at top showing 5 steps, main content area with character panel sidebar on the right, and a hash bar fixed at the bottom showing a legitimacy badge.
result: pass

### 2. Roll All Characteristics
expected: Clicking "Roll All" generates 6 dice results (2D each). Each result appears as a draggable chip showing the individual dice and total.
result: issue
reported: "The droppable elements appear quite far below the mouse pointer once picked up (instead of directly underneath it), which is slightly disorienting when trying to drop them into dropzones"
severity: cosmetic

### 3. Drag-and-Drop Characteristic Assignment
expected: Dragging a rolled value onto a stat slot (STR, DEX, END, INT, EDU, SOC) assigns it. Hovering over a slot shows a live DM preview. All 6 values can be assigned to all 6 slots.
result: pass
notes: Same drag offset issue as test 2 applies here. Once assigned, a stat cannot be reassigned.

### 4. Character Panel Updates
expected: As characteristics are assigned, the right sidebar panel updates in real-time showing the assigned values in a 2x3 grid with auto-calculated DMs.
result: pass

### 5. Characteristics Review and Continue
expected: After all 6 characteristics are assigned, a review state shows the final assignments. Clicking Continue advances to the next step (Background Skills).
result: issue
reported: "Confirmation page is unclear - layout is same as the actual stat page, confusing at first glance. Would work better as a dialogue: 'Beware: once you confirm your stats and proceed to assigning background skills, you cannot change your stats later'. Also refreshing the page rerolls the stats, losing assignments."
severity: major

### 6. Background Skills Slot Count
expected: Background Skills step shows a number of empty slots equal to EDU DM + 3 (minimum 0, maximum 6). If EDU is 0-2 (DM -2 to -1), fewer slots appear.
result: pass
notes: Slot count confirmed correct. Same drag offset issue. Assigned skills cannot be removed except by dropping another skill on top.

### 7. Background Skills Selection
expected: Skills are grouped by category (Physical, Mental, Social, Technical) with color-coded accents. Dragging a skill from the pool into a slot assigns it. Tooltips show skill descriptions on hover. Some skills have subtle blue relevance markers.
result: issue
reported: "Relevance markers are unexplained, both as to what the blue marker means and why it would be marked as a relevant skill"
severity: minor

### 8. Background Skills Completion
expected: When all slots are filled, the skill pool dims. Clicking Continue grants all selected skills at level 0 and advances to the Education step.
result: pass
notes: User suggests confirmation dialog with warning about irreversibility, same pattern as test 5.

### 9. Education Path Selection
expected: Three cards appear: University, Military Academy, and Skip to Career. Military Academy card has sub-selection buttons for Army, Marines, and Navy branches.
result: pass

### 10. Education Entry Roll
expected: After selecting University or an Academy branch, an entry roll fires automatically. The result displays inline on the card showing target number, modifiers, dice rolled, and pass/fail outcome. Success shows a glow effect with "Admitted" and skill grants listed.
result: issue
reported: "This automatic entry roll should be clearer in the UI and communicated to the user. Maybe a 'Roll for entry' button. Also indicate what the odds of successfully entering University/Academy are"
severity: minor

### 11. Education Entry Failure
expected: If the entry roll fails, the card shows "Entry denied" with options to retry (if eligible) or skip to career. No crash or dead-end state.
result: pass

### 12. Education Event
expected: During the education term, a narrative event card appears with scanner-blue left border, italic description text, and any mechanical effects or choices displayed.
result: issue
reported: "Narrative event card appears with description text, but 'Select one of the following' doesn't actually allow any selection by the user."
severity: major

### 13. Graduation Roll
expected: After the education term, a graduation roll resolves to one of three outcomes: Honours (11+), Graduated (7+), or Failed. Each shows appropriate benefits or lack thereof.
result: pass

### 14. Hash Bar and Roll Log
expected: The hash bar at the bottom updates after each dice roll. Clicking or toggling the roll log shows a drawer listing all rolls made during the session with context labels.
result: issue
reported: "Rolls appear with internal names (characteristics.roll.6)"
severity: minor

### 15. End-to-End Wizard Flow
expected: Complete flow works from start to finish: Roll characteristics → assign all 6 → continue → pick background skills → continue → choose education path → resolve education → reach end of pre-career creation. No dead ends, no crashes.
result: pass

## Summary

total: 15
passed: 9
issues: 6
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "Dragged items should appear directly under the mouse pointer during drag operations"
  status: failed
  reason: "User reported: The droppable elements appear quite far below the mouse pointer once picked up, which is slightly disorienting when trying to drop them into dropzones"
  severity: cosmetic
  test: 2
  root_cause: "DragOverlay uses position:fixed but StepContainer's animation-fill-mode:both keeps a CSS transform active, creating a new containing block. The transform offset + scrollable main container compounds the displacement."
  artifacts:
    - path: "src/index.css"
      issue: "animation-fill-mode: both keeps transform active after animation"
    - path: "src/components/wizard/StepContainer.tsx"
      issue: "Transform-bearing animation wraps DndContext"
    - path: "src/components/wizard/WizardShell.tsx"
      issue: "overflow-y-auto on main compounds offset when scrolled"
  missing:
    - "Hoist DndContext above transform boundary, or portal DragOverlay to document.body"
  debug_session: ""

- truth: "Characteristics review state should clearly indicate finality and be visually distinct from the assignment state"
  status: failed
  reason: "User reported: Confirmation page is unclear - layout is same as the actual stat page, confusing at first glance. Would work better as a dialogue warning about irreversibility."
  severity: major
  test: 5
  root_cause: "Review sub-state renders identical StatSlot grid as assigning state. No confirmation dialog, no irreversibility warning, no visual distinction. BackgroundSkillsStep has no review sub-state at all."
  artifacts:
    - path: "src/components/characteristics/CharacteristicsStep.tsx"
      issue: "Review sub-state (lines 248-299) renders same layout as assignment"
    - path: "src/components/background-skills/BackgroundSkillsStep.tsx"
      issue: "No review/confirmation step before committing skills"
    - path: "src/machines/creation.ts"
      issue: "backgroundSkills state has no nested review sub-state"
  missing:
    - "Add confirmation dialog with irreversibility warning to characteristics review"
    - "Add review sub-state to backgroundSkills in XState machine"
    - "Add confirmation UI to BackgroundSkillsStep"
  debug_session: ""

- truth: "Page refresh should not reroll characteristics and lose assignments"
  status: failed
  reason: "User reported: Refreshing the page rerolls the stats, losing assignments"
  severity: major
  test: 5
  root_cause: "Three layers of ephemeral state: XState actor created fresh on mount (no snapshot persistence), Zustand store has no persist middleware, and dice pool is React-local state. All wiped on refresh."
  artifacts:
    - path: "src/hooks/useCreationMachine.ts"
      issue: "createActor called fresh every mount, no snapshot save/restore"
    - path: "src/stores/character.ts"
      issue: "Zustand store uses only immer middleware, no persist"
    - path: "src/components/characteristics/CharacteristicsStep.tsx"
      issue: "Dice pool is useState local state, lost on unmount"
  missing:
    - "Add Zustand persist middleware (sessionStorage)"
    - "Lift dice pool into Zustand store"
    - "Derive machine position from persisted store data on reload"
  debug_session: ""

- truth: "Relevance markers on background skills should be explained to the user"
  status: failed
  reason: "User reported: Relevance markers are unexplained, both as to what the blue marker means and why it would be marked as a relevant skill"
  severity: minor
  test: 7
  root_cause: "Blue dot only has a native HTML title attribute with hover delay. No styled Tooltip component, no visible legend."
  artifacts:
    - path: "src/components/background-skills/SkillPool.tsx"
      issue: "Lines 68-73: blue dot span uses title attribute instead of Tooltip component"
  missing:
    - "Wrap blue dot in existing Tooltip component with explanatory text"
    - "Consider adding a small legend above/below the skill pool"
  debug_session: ""

- truth: "Education entry roll should be user-initiated with a button and display odds of success"
  status: failed
  reason: "User reported: This automatic entry roll should be clearer in the UI and communicated to the user. Maybe a 'Roll for entry' button. Also indicate what the odds of successfully entering University/Academy are"
  severity: minor
  test: 10
  root_cause: "handleChooseUniversity/handleChooseAcademy fuse path selection and dice roll into one callback. No intermediate UI state between choosing and seeing results."
  artifacts:
    - path: "src/components/education/EducationStep.tsx"
      issue: "Lines 71-116: choose + roll fused in same callback, no pre-roll UI"
  missing:
    - "Split callbacks: choose path sets selectedPath, then show pre-roll UI with target, DM, odds, and Roll button"
    - "Only roll dice on button click"
  debug_session: ""

- truth: "Education event choices marked 'Select one of the following' must be interactive and selectable by the user"
  status: failed
  reason: "User reported: Narrative event card appears with description text, but 'Select one of the following' doesn't actually allow any selection by the user."
  severity: major
  test: 12
  root_cause: "Data model mismatch: choice events store all options in a single effect entry with type:'choice' and concatenated detail string. EventCard renders one button per effect (so just one button with all options as text)."
  artifacts:
    - path: "src/data/education-events.ts"
      issue: "Choice options packed into single detail strings"
    - path: "src/components/education/EventCard.tsx"
      issue: "Lines 47-55: renders one button per effect, not per option"
    - path: "src/types/education.ts"
      issue: "EducationEventEffect type has no options array for choices"
  missing:
    - "Add options:string[] field to choice effect type"
    - "Restructure event data to separate individual options"
    - "Render individual choice buttons in EventCard"
    - "Wire handleEventResolve to apply chosen skill"
  debug_session: ""

- truth: "Roll log should display human-readable labels instead of internal context names"
  status: failed
  reason: "User reported: Rolls appear with internal names (characteristics.roll.6)"
  severity: minor
  test: 14
  root_cause: "RollLogDrawer renders entry.context verbatim. Context is a machine-readable dot-path string, no formatting layer exists."
  artifacts:
    - path: "src/components/shared/RollLogDrawer.tsx"
      issue: "Line 46: displays entry.context directly without formatting"
    - path: "src/hooks/useLoggedRoll.ts"
      issue: "Accepts raw context string with no label companion"
  missing:
    - "Create formatRollContext() utility mapping dot-paths to human-readable labels"
    - "Apply formatter in RollLogDrawer"
  debug_session: ""
