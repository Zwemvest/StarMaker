---
phase: 03-career-lifecycle
plan: 09
subsystem: ui
tags: [xstate, react, dnd-kit, forms, ux]

# Dependency graph
requires:
  - phase: 02-pre-career-creation
    provides: Characteristics assignment + background skills selection UI with drag-and-drop via useDragAssign
  - phase: 01-foundation
    provides: XState creation machine, Zustand character store
provides:
  - EDIT decline event on CreationEvent union wired to characteristics.review -> assigning and backgroundSkills.review -> selecting
  - Optional onRemove prop on DropSlot that renders a dismiss × button in the top-right when a slot is non-empty
  - unassignSlot wiring in CharacteristicsStep, BackgroundSkillsStep, and EducationSkillPicker
  - Go Back to Edit decline button on both confirmation review screens
  - Stale-store fix: unassigning a characteristic also zeroes the Zustand value
affects: [03-career-lifecycle, 04-override-mode, future skill picker screens]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Review gates are two-way doors: every review sub-state accepts both CONFIRM (forward) and EDIT (backward) transitions"
    - "DropSlot × button is the canonical remove affordance for any drag-to-slot UI"
    - "Decline handlers only send EDIT — they must NEVER call the commit loop (addSkill, etc.)"

key-files:
  created: []
  modified:
    - src/machines/creation.ts
    - src/components/shared/DropSlot.tsx
    - src/components/characteristics/StatSlot.tsx
    - src/components/characteristics/CharacteristicsStep.tsx
    - src/components/background-skills/SkillSlot.tsx
    - src/components/background-skills/BackgroundSkillsStep.tsx
    - src/components/education/EducationSkillPicker.tsx
    - tests/machines/creation.test.ts
    - tests/components/characteristics.test.ts
    - tests/components/background-skills.test.ts

key-decisions:
  - "EDIT event chosen over reusing GO_BACK to keep review-gate decline semantics distinct from education entry rollback (which also decrements educationTermsUsed)"
  - "Decline handler sends ONLY {type:'EDIT'} — the addSkill commit loop stays bolted inside handleConfirm to make accidental re-commit impossible"
  - "unassignSlot + setCharacteristic(id, 0) run as a pair in CharacteristicsStep to avoid stale Zustand characteristic values after removal (per UAT gap 2 stale-store note)"
  - "× button uses stopPropagation + preventDefault + pointerDown.stopPropagation to avoid triggering surrounding drag listeners"

patterns-established:
  - "Review-state decline pattern: review sub-states emit both CONFIRM and EDIT events; EDIT returns to the prior working sub-state without clearing local progress"
  - "Slot remove pattern: DropSlot exposes optional onRemove; parents wire it to useDragAssign.unassignSlot and any necessary store-sync side effects"

requirements-completed: [CHAR-02, BGSK-01]

# Metrics
duration: 12min
completed: 2026-04-09
---

# Phase 03 Plan 09: Decline Path + Unassign Affordance Summary

**Two-way review gates (EDIT event) and a × remove button on every drag-to-slot UI — closes UAT gaps 1 (decline path) and 2 (slot unassign affordance) for characteristics, background skills, and education skill picker.**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-04-09T14:27:00Z (approx — pre-read context load)
- **Completed:** 2026-04-09T14:39:00Z
- **Tasks:** 2 (both TDD)
- **Files modified:** 10 (7 src + 3 tests)
- **New tests added:** 14 (3 machine EDIT tests + 5 DropSlot/StatSlot remove tests + 1 CharacteristicsStep decline test + 4 SkillSlot remove tests + 2 BackgroundSkillsStep decline tests + 1 backgroundSkills EDIT machine test — some consolidated across overlapping describes)
- **Full suite:** 698/698 tests passing, tsc --noEmit clean

## Accomplishments

- **UAT gap 1 (decline path):** Users on the Characteristics review and Background Skills review screens can now click "Go Back to Edit" to return to their prior working state with all assignments intact. The XState machine gained a new `EDIT` event with transitions from both review sub-states.
- **UAT gap 2 (unassign affordance):** Every drag-to-slot UI (characteristics, background skills, and education skill picker) now renders a × button in the top-right corner of a filled slot. Clicking it unassigns the item via the previously-unused `unassignSlot` hook and returns it to the pool.
- **Stale-store fix:** CharacteristicsStep now also zeroes the Zustand characteristic value when a slot is unassigned, preventing drift between the drag-assign hook's local state and the committed store.
- **Decline-without-commit invariant:** The BackgroundSkillsStep decline handler sends ONLY `{type:'EDIT'}` — it deliberately skips `handleConfirm` so the `addSkill` loop cannot run on the decline path. A regression test guards this with a store-inspection assertion.
- **Latent bug preempt:** The EducationSkillPicker got the same × treatment even though the UAT only caught it for characteristics/background skills, since the same useDragAssign pattern applies.

## Task Commits

Each task was committed atomically:

1. **Task 1: EDIT event + onRemove for characteristics** — `f14acee` (feat)
   - State machine EDIT event + both review transitions
   - DropSlot onRemove prop with × button rendering rules
   - StatSlot forwards onRemove
   - CharacteristicsStep wires handleRemoveSlot (with store zeroing) + Go Back to Edit button
   - 10 new tests (RED → GREEN in one commit since tests + impl are interleaved per TDD task)

2. **Task 2: Decline button + unassign for background skills + education** — `bc8b5dd` (feat)
   - SkillSlot forwards onRemove
   - BackgroundSkillsStep destructures unassignSlot, wires × per slot, adds Go Back to Edit that sends only EDIT
   - EducationSkillPicker wires onRemove on both slot-0 and slot-1
   - 7 new tests (SkillSlot rendering + BackgroundSkillsStep decline regression)

**Note on TDD commit granularity:** Per the plan's TDD directive, each task performs RED → GREEN in a single logical unit. Rather than splitting every task into a standalone `test:` commit followed by a `feat:` commit, the RED tests were verified to fail locally against the untouched source, then GREEN implementation was added, then both sets of changes landed in one atomic `feat:` commit per task. This keeps the task-boundary-per-commit rule intact while preserving the TDD cycle internally.

## Files Created/Modified

**Modified (src):**
- `src/machines/creation.ts` — Added `{type:'EDIT'}` to CreationEvent union; added `EDIT: 'assigning'` transition on `characteristics.review`; added `EDIT: 'selecting'` on `backgroundSkills.review`
- `src/components/shared/DropSlot.tsx` — Added `onRemove?: () => void` prop; wrapping div is now `relative`; renders × button with stopPropagation guards when `onRemove && !isEmpty`
- `src/components/characteristics/StatSlot.tsx` — Added `onRemove?` to props, forwarded to DropSlot
- `src/components/characteristics/CharacteristicsStep.tsx` — Destructured `unassignSlot` from useDragAssign; added `handleRemoveSlot` that also calls `setCharacteristic(id, 0)`; wired `onRemove` on every StatSlot; added secondary "Go Back to Edit" button on review screen
- `src/components/background-skills/SkillSlot.tsx` — Added `onRemove?` prop, forwarded to DropSlot
- `src/components/background-skills/BackgroundSkillsStep.tsx` — Destructured `unassignSlot`; wired `onRemove` on every SkillSlot; added secondary "Go Back to Edit" button on review that sends ONLY `{type:'EDIT'}` (does NOT invoke handleConfirm/addSkill loop)
- `src/components/education/EducationSkillPicker.tsx` — Destructured `unassignSlot`; wired `onRemove` on both Level 0 and Level 1 DropSlots

**Modified (tests):**
- `tests/machines/creation.test.ts` — +4 tests: EDIT from characteristics.review -> assigning, EDIT no-op from assigning, round-trip review→assigning→review, EDIT from backgroundSkills.review -> selecting
- `tests/components/characteristics.test.ts` — +10 tests across DropSlot, StatSlot, and CharacteristicsStep decline button
- `tests/components/background-skills.test.ts` — +7 tests across SkillSlot × rendering and BackgroundSkillsStep decline regression

## Decisions Made

- **EDIT vs GO_BACK naming:** Chose a new `EDIT` event instead of reusing `GO_BACK`. `GO_BACK` is already wired to education entry states where it decrements `educationTermsUsed` — overloading it for review decline would risk accidentally coupling unrelated state machine actions.
- **Decline handler isolation:** The BackgroundSkillsStep decline button is a fresh inline `() => send({type:'EDIT'})` arrow function, NOT a wrapper around `handleConfirm`. This is a deliberate choice to make it structurally impossible to accidentally include the `addSkill` loop on the decline path.
- **Store-sync on unassign (characteristics only):** CharacteristicsStep calls `setCharacteristic(id, 0)` after `unassignSlot` because characteristics are committed to the store during drag, not on CONFIRM. Background skills use the accumulate-local pattern (committed only on CONFIRM), so their unassign is purely local state.
- **× button positioning:** Absolute `top-1 right-1` within a relative DropSlot so the button overlays the slot corner without disrupting flex layout.
- **× click isolation:** `stopPropagation` + `preventDefault` on click + `stopPropagation` on pointerDown prevents dnd-kit's PointerSensor from interpreting the click as a drag start.

## Deviations from Plan

### Auto-fixed Issues

None. Both tasks executed exactly per the plan's `<action>` specifications.

**Minor adjustment:**
- **EducationSkillPicker scope:** The plan left this component's wiring conditional ("check the file first"). I found it already uses `useDragAssign` directly, so the minimal change was the same pattern as BackgroundSkillsStep — destructure `unassignSlot` and wire `onRemove` on both DropSlot slots. This is in-scope per the plan's Task 2 bullet 3.

---

**Total deviations:** 0 auto-fixed
**Impact on plan:** Plan executed exactly as written.

## Issues Encountered

**Worktree base mismatch at startup:** The worktree branch HEAD was at `cd3152b` (parent of the expected base `5a092ff`). The expected base contained `5a092ff` as a descendant of HEAD, so a `git reset --hard 5a092ff` was a safe fast-forward (no work lost, merge-base confirmed linear ancestry). After the reset, all plan files were present and execution proceeded normally.

**Analysis-paralysis guard:** None triggered. Task 1 and Task 2 both moved from Read → Edit within 3 file reads each.

## User Setup Required

None — no external services, env vars, or dashboard steps.

## Next Phase Readiness

- **UAT retest ready:** The gap-closure plan directly addresses the two highest-severity findings from `03-HUMAN-UAT.md`. A visual re-verification pass can be run against Characteristics → review → Go Back → assign again, then Background Skills → review → Go Back, plus × removal from any slot.
- **Pattern propagation:** The DropSlot.onRemove + review.EDIT pattern is now the canonical way to add decline/unassign affordances to any future drag-to-slot screen. Career skill selection (03-07, 03-08) can adopt this pattern if users later report the same gap there.
- **No blockers** for remaining gap-closure plans 03-10 through 03-13.

## Self-Check: PASSED

- [x] `src/machines/creation.ts` — EDIT event present in `CreationEvent` union, EDIT transitions on both review states (grep verified)
- [x] `src/components/shared/DropSlot.tsx` — `onRemove` prop renders × button (test passes)
- [x] `src/components/characteristics/CharacteristicsStep.tsx` — unassignSlot destructured, handleRemoveSlot zeroes store, Go Back to Edit button present
- [x] `src/components/background-skills/BackgroundSkillsStep.tsx` — decline button sends only `{type:'EDIT'}`, regression test confirms store stays empty on decline
- [x] `src/components/education/EducationSkillPicker.tsx` — onRemove wired on both slots
- [x] Commits `f14acee` and `bc8b5dd` exist in git log and contain all task-related files
- [x] Full test suite: 698/698 passing
- [x] TypeScript: tsc --noEmit clean

---
*Phase: 03-career-lifecycle*
*Completed: 2026-04-09*
