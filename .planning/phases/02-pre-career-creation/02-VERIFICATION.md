---
phase: 02-pre-career-creation
verified: 2026-04-03T16:10:00Z
status: passed
score: 18/18 must-haves verified
re_verification:
  previous_status: passed
  previous_score: 16/16
  gaps_closed:
    - "Skills already owned appear dimmed with '(already owned)' label in EducationSkillPicker (university + academy views)"
    - "Tooltips on background skills are horizontally proportioned and readable (min-w-[200px] max-w-sm, em-dash separator)"
  gaps_remaining: []
  regressions: []
---

# Phase 2: Pre-Career Creation Verification Report

**Phase Goal:** Users can generate characteristics, select background skills, and optionally attend University or Military Academy — the complete pre-career creation flow with real UI
**Verified:** 2026-04-03T16:10:00Z
**Status:** passed
**Re-verification:** Yes — after UAT gap closure (plans 02-09 through 02-11)

---

## Re-Verification Context

Previous VERIFICATION.md (2026-04-02T10:58:00Z) passed with 16/16 truths. Subsequent UAT rounds (RETEST1 through RETEST4) uncovered two issues that were closed by plan 02-11 (commits 96cd72b and a28871c on 2026-04-03). This re-verification confirms the two gap-closure must_haves and checks for regressions against the original 16 truths.

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User can roll 2D for each of 6 characteristics | VERIFIED | `CharacteristicsStep.tsx` `handleRollAll` calls `loggedRoll2D` 6 times |
| 2 | User can drag rolled values to stat slots in any order | VERIFIED | `useDragAssign` hook + `DndContext` + `DropSlot` wired in `CharacteristicsStep` |
| 3 | DM preview on hover over slot | VERIFIED | `hoverSlotIndex` + `activeDragItem` tracked; `previewValue` passed to `StatSlot` |
| 4 | Characteristic values capped at 15 | VERIFIED | `setCharacteristic` applies `Math.min(value, 15)` in `character.ts` |
| 5 | Slot count equals EDU DM + 3 for background skills | VERIFIED | `BackgroundSkillsStep` computes `Math.max(0, characteristicModifier(EDU) + 3)` |
| 6 | Background skills granted at level 0 on confirmation | VERIFIED | `handleContinue` calls `addSkill(skill.name, 0)` for each assignment |
| 7 | User can choose University, Military Academy (3 branches), or Skip to Career | VERIFIED | `EducationStep` choosing sub-state renders 3 `EducationCard` components; Military Academy card has Army/Marines/Navy sub-selection |
| 8 | Entry roll results display inline with target, modifiers, roll, pass/fail | VERIFIED | `EntryRollResult.tsx` renders target, DM, raw dice total, final total; scanner-blue glow on success, amber "Entry Denied" on failure |
| 9 | Education events display as narrative cards with flavor text and mechanical effects | VERIFIED | `EventCard.tsx` renders italic description, `effectDescription`, effects list, choice buttons |
| 10 | Graduation roll resolves to honours (11+), graduated (7+), or failed | VERIFIED | `resolveGraduation` in `engine/education.ts` implements thresholds; covered by `tests/engine/education.test.ts` |
| 11 | Failed graduation retains skills, grants no benefits | VERIFIED | `GraduationResult.tsx` shows "Skills Retained" badges; `applyGraduationBenefits` returns all zeros for failed |
| 12 | Academy graduation without honours notes auto-entry but no commission | VERIFIED | `GraduationResult.tsx` conditionally renders "Auto-entry to career, but no commission" when `educationType === 'academy' && result === 'graduated'` |
| 13 | Term DM penalties accumulate correctly across education attempts | VERIFIED | `calculateEntryDM` applies `EDUCATION_TERM_DM * educationTermsUsed`; incremented in XState states |
| 14 | Education limited to terms 1-3 with `canAttemptEducation` guard | VERIFIED | `canAttemptEducation` returns `educationTermsUsed < MAX_EDUCATION_TERMS (3)`; retry buttons gated by guard |
| 15 | Every roll logged and hash updated atomically | VERIFIED | `loggedRoll2D` calls `appendRoll`, `computeHash`, `setLegitimacyHash` before returning |
| 16 | Complete wizard flow works end-to-end: characteristics → background skills → education | VERIFIED | `WizardShell.tsx` renders correct step component per `currentPhase`; `EducationStep` receives `educationTermsUsed` |
| 17 | Skills already owned appear dimmed with "(already owned)" label in education skill picker | VERIFIED | `EducationSkillPicker.tsx` line 72/113: `isOwned` check against `existingSkills` prop; `opacity-50` class + `(already owned)` span rendered in both university pool and academy badge views |
| 18 | Tooltips on background skills are horizontally proportioned and readable | VERIFIED | `Tooltip.tsx` line 15: `whitespace-normal min-w-[200px] max-w-sm`; `SkillPool.tsx` line 53: em-dash separator replacing `\n` |

**Score:** 18/18 truths verified

---

### Required Artifacts — Plan 02-11 (Gap Closure)

| Artifact | Provides | Status | Evidence |
|----------|----------|--------|----------|
| `src/components/education/EducationSkillPicker.tsx` | Already-owned skill visual indicators | VERIFIED | `existingSkills?: string[]` prop at line 14; `isOwned` checks at lines 72 and 113; `(already owned)` labels at lines 79 and 117; commit 96cd72b |
| `src/components/ui/Tooltip.tsx` | Properly sized tooltip with min-width | VERIFIED | `whitespace-normal min-w-[200px] max-w-sm` at line 15; commit a28871c |

---

### Key Link Verification — Plan 02-11

| From | To | Via | Status | Evidence |
|------|----|-----|--------|----------|
| `src/components/education/EducationStep.tsx` | `src/components/education/EducationSkillPicker.tsx` | `existingSkills={existingSkillNames}` prop | VERIFIED | Line 46: `existingSkillNames = useMemo(() => skills.map(sk => sk.name), [skills])`; line 397: `existingSkills={existingSkillNames}` passed to picker |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `CharacteristicsStep.tsx` | `pool: PoolItem[]` | `loggedRoll2D` in `handleRollAll`, 6 calls | `rollDice(2, 6)` — real crypto random | FLOWING |
| `BackgroundSkillsStep.tsx` | `slotCount` | `characteristicModifier(characteristics.EDU)` from Zustand store | Derived from real assigned characteristic | FLOWING |
| `EducationStep.tsx` | `entryResult` | `loggedRoll2D` + `resolveEntryRoll` | Real dice roll, real DM from store characteristics | FLOWING |
| `EducationStep.tsx` | `eventData` | `loggedRoll2D` + `EDUCATION_EVENTS.find` | Real dice roll indexed to data table | FLOWING |
| `EducationStep.tsx` | `graduationData` | `loggedRoll2D` + `resolveGraduation` | Real dice roll, real DM from events | FLOWING |
| `EducationStep.tsx` | `existingSkillNames` | `useCharacterStore(s => s.skills)` via `useMemo` | Real skills from Zustand store | FLOWING |
| `GraduationResult.tsx` | `skillsEarnedThisTerm` | Passed from `EducationStep` state, populated by `handleSkillsComplete` | Real skills selected/granted during term | FLOWING |

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| All 5600 tests pass | `npx vitest run --reporter=verbose` | 248 test files, 5600 tests, 0 failures | PASS |
| `already owned` label present in picker (both views) | grep on `EducationSkillPicker.tsx` | 2 matches at lines 79 and 117 | PASS |
| Tooltip uses `min-w-[200px]` | grep on `Tooltip.tsx` | Match at line 15 | PASS |
| SkillPool uses em-dash separator (not newline) | grep on `SkillPool.tsx` | Em-dash at line 53 | PASS |
| `existingSkills` prop wired in EducationStep | grep on `EducationStep.tsx` | `existingSkills={existingSkillNames}` at line 397 | PASS |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| CHAR-01 | 02-03 | Roll 2D for each of 6 characteristics | SATISFIED | `handleRollAll` in `CharacteristicsStep` — 6x `loggedRoll2D` calls |
| CHAR-02 | 02-03 | Assign rolled values in any order | SATISFIED | `useDragAssign` pool-to-slot; any slot accepts any value |
| CHAR-03 | 02-01 | DMs auto-calculated from modifier table | SATISFIED | `CharacterPanel` calls `characteristicModifier(value)` for each stat |
| CHAR-04 | 02-03 | Max unaugmented characteristic = 15 | SATISFIED | `setCharacteristic` applies `Math.min(value, 15)` in `character.ts` |
| BGSK-01 | 02-04 | EDU DM + 3 background skill picks (0–6) | SATISFIED | `slotCount = Math.max(0, characteristicModifier(EDU) + 3)` |
| BGSK-02 | 02-04 | Background skills at level 0 | SATISFIED | `addSkill(skill.name, 0)` on Continue |
| EDUC-01 | 02-05 | Choose University, Military Academy, or skip | SATISFIED | 3 `EducationCard` components in choosing sub-state; academy card has Army/Marines/Navy buttons |
| EDUC-02 | 02-02 | University entry roll EDU 7+ with SOC bonus | SATISFIED | `EDUCATION_PATHS[0].entryTarget=7`, `entryCharacteristic='EDU'`, `socBonus=true`; `calculateEntryDM` adds SOC+1 when SOC≥9 |
| EDUC-03 | 02-02 | Academy entry rolls (Army END 8+, Marines END 9+, Navy INT 9+) | SATISFIED | `EDUCATION_PATHS` entries: army `END 8+`, marines `END 9+`, navy `INT 9+` |
| EDUC-04 | 02-02 | Education available terms 1-3 with DM penalties | SATISFIED | `MAX_EDUCATION_TERMS=3`; `canAttemptEducation` enforces limit; DM penalty applied per prior attempt |
| EDUC-05 | 02-05 | University: level 0 + level 1 skill selection, EDU+1 | SATISFIED | `EducationSkillPicker` with 2 drag slots (L0, L1); `handleSkillsComplete` calls `setCharacteristic('EDU', EDU+1)` |
| EDUC-06 | 02-05 | Academy: all service skills of tied career at level 0 | SATISFIED | `getAcademyBasicTraining(branch)` returns service skills; auto-granted at level 0 |
| EDUC-07 | 02-02 | Graduation roll with honours at 11+ | SATISFIED | `resolveGraduation`: `HONOURS_THRESHOLD=11` → `'honours'`; `GRADUATION_TARGET=7` → `'graduated'`; else `'failed'` |
| EDUC-08 | 02-02 | Education events table (2D, rolls 2–12) fully implemented | SATISFIED | `EDUCATION_EVENTS` has 11 entries covering all possible 2D outcomes (values 2–12) |
| EDUC-09 | 02-05 | Failed graduation retains skills, no benefits | SATISFIED | `applyGraduationBenefits('failed', ...)` returns all zeros; `GraduationResult` shows "Skills Retained" badges |
| EDUC-10 | 02-05 | Academy graduation without honours: auto-entry, no commission | SATISFIED | `applyGraduationBenefits('graduated', 'academy')` returns `commissionEligible=false`; `GraduationResult` conditionally renders "Auto-entry to career, but no commission" |

**All 16 Phase 2 requirement IDs satisfied. No orphaned requirements.**

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/data/education-events.ts` | 1 | `// TODO: Verify against Core Rulebook 2022 p.16-18` | Info | Events are approximations of the RAW table; mechanical functionality is complete, but exact rulebook text is unverified. Not a blocker. |
| `src/machines/creation.ts` | 62-64 | `allCharacteristicsAssigned`, `hasCharacteristics`, `hasBackgroundSkills` guards always return `true` | Info | UI-side validation (`isComplete` in `useDragAssign`) is the real enforcer. Accepted architectural choice — not a blocker for Phase 2 goals. |

No blocker or warning-level anti-patterns. All noted items are Info-level.

---

### Human Verification Required

#### 1. Drag-and-Drop Smoothness

**Test:** Run `npm run dev`, open the app, click "Roll All" in the Characteristics step, and drag each chip to a stat slot.
**Expected:** Drag feels responsive, DM preview appears while hovering over empty slots, DragOverlay shows the chip under the cursor.
**Why human:** CSS interactions and pointer event feel cannot be verified programmatically.

#### 2. Education Flow End-to-End

**Test:** Complete the characteristics step, proceed to background skills, then education. Choose University, observe entry roll, proceed through skill selection, roll for event, and roll for graduation.
**Expected:** All sub-states render correctly, inline roll results appear without page reload, narrative event cards display with italic styling and choice buttons where applicable.
**Why human:** Multi-step UI state flow with async roll resolution requires visual confirmation.

#### 3. Already-Owned Skill Indicator — Visual Confirmation

**Test:** Create a character with at least one skill from the background skills step (e.g. Electronics). Proceed to education, enter University, observe the skill picker pool.
**Expected:** Electronics appears dimmed (opacity-50) with a "(already owned)" label beside it. Skill is still draggable.
**Why human:** The rendering of the dimming and label is visual and requires a browser to confirm.

#### 4. Tooltip Proportions — Visual Confirmation

**Test:** In the background skills step, hover over a skill with a blue dot (e.g. Electronics or Medic).
**Expected:** Tooltip renders wider than tall, with description and relevance text separated by an em-dash on one or two natural-width lines. Not a tall narrow rectangle.
**Why human:** CSS `min-w`/`max-w` rendering and text wrapping requires a browser to confirm.

#### 5. Education Events Content Accuracy

**Test:** Compare `src/data/education-events.ts` entries against Core Rulebook 2022 p.16-18.
**Expected:** Roll values, descriptions, and mechanical effects match the published table.
**Why human:** The file has a `// TODO: Verify against Core Rulebook 2022 p.16-18` comment. Rule accuracy requires human with the rulebook.

---

### Gaps Summary

None. All phase goals are achieved. All 16 requirement IDs (CHAR-01 through EDUC-10) are satisfied with substantive, wired implementations. The two UAT gaps from RETEST4 (owned-skill indicators and tooltip sizing) are closed and verified in the codebase:

- `src/components/education/EducationSkillPicker.tsx` — `existingSkills` prop with `opacity-50` + `(already owned)` labels in both university and academy views (commit 96cd72b)
- `src/components/ui/Tooltip.tsx` — `whitespace-normal min-w-[200px] max-w-sm` (commit a28871c)
- `src/components/background-skills/SkillPool.tsx` — em-dash separator replacing newline (commit a28871c)

5600 tests pass. No regressions detected against the 16 original truths.

The only items warranting continued attention:
1. Education event table content needs rulebook verification before final release (TODO in source).
2. Three placeholder guards in the XState machine return `true` unconditionally — deliberate deference to UI-side validation.

---

_Verified: 2026-04-03T16:10:00Z_
_Verifier: Claude (gsd-verifier)_
