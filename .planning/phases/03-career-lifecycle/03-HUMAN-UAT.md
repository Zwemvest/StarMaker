---
status: diagnosed
phase: 03-career-lifecycle
source: [03-VERIFICATION.md]
started: 2026-04-03T15:36:00Z
updated: 2026-04-09T00:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Complete Career Lifecycle End-to-End
expected: Run `npm run dev`. Create a new character through characteristics and background skills. Navigate career selection: verify 12 career grid loads with qualification info. Select Army → Infantry. Complete full term: survival roll (check natural 2 handling), career event (check life events redirect for roll 7), commission roll (military only), advancement roll (check forced-leave/stay), skill table selection (check 4-cap warning). Serve enough terms to trigger aging at 34+. Verify continue/leave card shows pension info. Muster out, verify roll-by-roll with cash limit of 3. Check character panel shows career history, contacts, noble title (if SOC ≥ 11). Try Drifter (no qualification, assignment basic training).
result: issue
reported: "7 issues found: (1) Confirmation dialogues missing cancel/don't-confirm option — e.g. Confirm Characteristics only allows confirming, no way to decline. Note: steps should NOT have a back button. (2) Can't unassign characteristics or background skills except by overriding with another (returns original to pool). (3) Career screen shows 'Select a basic skill' with no selection options, blocking progress entirely. (4) Career screen does not show odds of getting into a career. (5) No shared component for skill selection/dice rolls — every dice roll location should display odds, every select-a-skill button should indicate if skill provides no benefit (e.g. adding Electronics 0 when already owned). (6) Page refresh allows selecting a new career step even after mustering out. (7) Completing a career step results in 'Career state: unknown - complete'."
severity: blocker

### 2. CRER-11 Edge Case Decision (Advisory)
expected: In a military career, encounter a career event that grants a +DM to advancement. The event-granted advancement DM should also apply to the commission roll (per Mongoose Traveller 2E rules). Decision required: accept as MVP gap or file gap-fix plan.
result: issue
reported: "File a gap-fix plan"
severity: major

## Summary

total: 2
passed: 0
issues: 2
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "Confirmation dialogues must include a cancel/decline option (not a back button — just the ability to not confirm)"
  status: failed
  reason: "User reported: Confirm Characteristics screen only allows confirming, no way to decline. Steps should not have back buttons, but should allow declining confirmation."
  severity: major
  test: 1
  root_cause: "Forward-only confirm gates at both layers. Machine: characteristics.review (creation.ts:150-154) and backgroundSkills.review (creation.ts:165-169) only accept CONFIRM — no back-transition event. UI: CharacteristicsStep.tsx:247-283 and BackgroundSkillsStep.tsx:100-128 render only a single primary Confirm button. No Phase 03 career screens currently have confirm-review gates — only these two exist. BackgroundSkillsStep.handleConfirm runs addSkill loop before sending CONFIRM; a decline path must not run that loop."
  artifacts:
    - path: "src/machines/creation.ts"
      issue: "characteristics.review and backgroundSkills.review states only handle CONFIRM — no EDIT/CANCEL event defined (lines 150-169)"
    - path: "src/components/characteristics/CharacteristicsStep.tsx"
      issue: "Review branch (lines 247-283) has only primary Confirm button, no secondary decline"
    - path: "src/components/background-skills/BackgroundSkillsStep.tsx"
      issue: "Review branch (lines 100-128) has only primary Confirm button, no secondary decline; addSkill loop must stay bound to CONFIRM path only"
  missing:
    - "Add EDIT (or CANCEL_CONFIRM) event to CreationEvent union"
    - "Add EDIT transition on characteristics.review → 'assigning' and backgroundSkills.review → 'selecting'"
    - "Add Button variant='secondary' to both review JSX branches sending EDIT"
    - "Ensure decline handler in BackgroundSkillsStep does NOT commit skills to Zustand store"
  debug_session: .planning/debug/confirm-dialog-missing-cancel.md

- truth: "Users can unassign characteristics and background skills directly (not just override with another)"
  status: failed
  reason: "User reported: Can't unassign characteristics or background skills except by overriding with another one"
  severity: major
  test: 1
  root_cause: "Missing UI affordance — state layer is complete. useDragAssign already exports unassignSlot(slotIndex) (useDragAssign.ts:53-59) and unassignedPool is reactively derived. But none of CharacteristicsStep, BackgroundSkillsStep, or EducationSkillPicker destructure unassignSlot. StatSlot and SkillSlot render no interactive remove element. DragPool is not registered as a droppable, so drag-back-to-pool has no target. Side concern: CharacteristicsStep writes to store on every drop, unlike BackgroundSkillsStep's accumulate-local pattern — an unassign would leave a stale store value unless CharacteristicsStep is refactored to the same pattern."
  artifacts:
    - path: "src/hooks/useDragAssign.ts"
      issue: "unassignSlot is exported but never consumed anywhere"
    - path: "src/components/characteristics/StatSlot.tsx"
      issue: "No interactive remove affordance"
    - path: "src/components/characteristics/CharacteristicsStep.tsx"
      issue: "Does not destructure unassignSlot; writes to Zustand on every drop — stale-store risk on unassign"
    - path: "src/components/background-skills/SkillSlot.tsx"
      issue: "No interactive remove affordance"
    - path: "src/components/background-skills/BackgroundSkillsStep.tsx"
      issue: "Does not destructure unassignSlot"
    - path: "src/components/education/EducationSkillPicker.tsx"
      issue: "Same latent bug; should get same fix"
    - path: "src/components/shared/DropSlot.tsx"
      issue: "Natural home for a new onRemove prop + × button"
  missing:
    - "Add optional onRemove?: () => void prop to DropSlot; render top-right × button when present"
    - "Destructure unassignSlot in all 3 consumers and wire onRemove={() => unassignSlot(i)}"
    - "Refactor CharacteristicsStep to accumulate-local pattern (like BackgroundSkillsStep) OR call setCharacteristic with 0 on unassign"
    - "Tests: useDragAssign unassign path, StatSlot/SkillSlot × button behavior, store-sync regression"
  debug_session: .planning/debug/cannot-unassign-chars-and-skills.md

- truth: "Career basic skill selection always shows available options and never blocks progress"
  status: failed
  reason: "User reported: Career screen shows 'Select a basic skill' with no selection options, blocking progress entirely"
  severity: blocker
  test: 1
  root_cause: "Two-part design bug. (1) getBasicTrainingSkills in engine/career.ts:181-195 short-circuits to [] for subsequent careers — the comment says 'UI handles pick-one' but the engine never hands the UI the candidate pool. (2) BasicTrainingCard.tsx:82-107 maps over the empty pool, renders the header 'Choose one service skill at level 0:' and no buttons — no fallback, no continue. The UAT exposed this for 'first' Army because the Zustand persist()+sessionStorage left previousCareers.length > 0 from a prior run, routing the flow into the broken branch. Tests at career.test.ts:371-375 and golden-path.test.ts:162-165 lock in the broken contract and must update when fix lands."
  artifacts:
    - path: "src/components/career/BasicTrainingCard.tsx"
      issue: "Subsequent-career branch (lines 82-107) has no skill pool and no escape hatch; primary bug site"
    - path: "src/engine/career.ts"
      issue: "getBasicTrainingSkills returns [] for subsequent careers (lines 181-195); contract root"
    - path: "tests/engine/career.test.ts"
      issue: "Test at lines 371-375 asserts the broken empty-array contract"
    - path: "tests/engine/golden-path.test.ts"
      issue: "Test at lines 162-165 asserts the broken empty-array contract"
  missing:
    - "Change getBasicTrainingSkills to return candidate pool for subsequent careers (prefer: add mode: 'grant-all' | 'pick-one' discriminator)"
    - "Update BasicTrainingCard.tsx subsequent-career branch to use the pool and add a Continue/fallback"
    - "Update the two tests that lock in the empty-array contract"
  debug_session: .planning/debug/career-basic-skill-no-options.md

- truth: "Career selection screen shows odds of qualifying for each career"
  status: failed
  reason: "User reported: Career screen does not show odds of getting into a career"
  severity: major
  test: 1
  root_cause: "Probability helper does not exist in the engine. src/engine/dice.ts has only RNG primitives. calculateOdds exists only as a local useCallback inside EducationStep.tsx:91-105 — not importable. CareerGrid.tsx does not render odds. This gap should be resolved together with gap 5 (shared dice-roll component), since a DiceRollButton primitive is the natural consumer of the lifted odds helper. NOTE: agent 3 investigated a stale worktree and incorrectly reported CareerGrid.tsx does not exist. Re-verified on main: CareerGrid exists, no odds helper exists in engine, and no odds are rendered in CareerGrid. Fix-direction is valid."
  artifacts:
    - path: "src/engine/dice.ts"
      issue: "Missing probability2DAtLeast(target, dm) helper"
    - path: "src/components/education/EducationStep.tsx"
      issue: "calculateOdds buried as local useCallback at lines 91-105 — needs to be lifted into engine"
    - path: "src/components/career/CareerGrid.tsx"
      issue: "Does not compute or render qualification odds"
  missing:
    - "Lift probability2DAtLeast(target, dm) from EducationStep into src/engine/dice.ts (count 36 outcomes, clamp 0-100, round)"
    - "Refactor EducationStep to consume the engine helper (retires duplicate)"
    - "Render odds on each CareerGrid card using totalDM = characteristicDM(char) + calculateQualificationDM(previousCareers.length)"
    - "Color-code odds using same threshold convention as EducationCard (green >=50, amber <50)"
  debug_session: .planning/debug/career-qualification-odds-missing.md

- truth: "Shared component for skill selection and dice rolls — dice rolls show odds, skill selection indicates no-benefit picks (e.g. adding skill 0 when already owned)"
  status: failed
  reason: "User reported: No shared component for skill selection/dice rolls. Every dice roll location should display odds. Every select-a-skill button should indicate if skill provides no benefit."
  severity: major
  test: 1
  root_cause: "No shared primitives. Every wizard step reimplements its own buttons ad-hoc. Odds math is imprisoned as a useCallback inside EducationStep.tsx:91-105. Owned-skill indicator lives only in EventCard.tsx:56-73 AND IS WRONG — checks name-only via existingSkills.includes(match[1]), ignoring level, so 'Admin 1' offered to a character with 'Admin 0' is falsely flagged 'already owned' even though addSkill would legitimately upgrade. The canonical no-benefit semantic (existingLevel >= newLevel) lives only inside the addSkill reducer (stores/character.ts:107-119) with no exported helper. Strategic finding: CareerStep and MusteringOutStep will have the highest density of dice rolls and skill pickers in the app — building the primitives NOW (before retrofitting the rest of Phase 03) is 10× cheaper than retrofitting later. Agent also corrects the breadcrumb: owned-skill logic is in EventCard, not EducationSkillPicker (Phase 02-11 was a different feature)."
  artifacts:
    - path: "src/components/education/EducationStep.tsx"
      issue: "Inline calculateOdds (lines 91-105); 3 inline roll buttons; handleTermComplete (line 204) is a checked roll that does not surface odds — inconsistent even within this file"
    - path: "src/components/education/EventCard.tsx"
      issue: "Inline isOwned check (lines 56-73) ignores level — false 'already owned' for legitimate upgrades"
    - path: "src/stores/character.ts"
      issue: "Canonical no-benefit semantic (lines 107-119) not exported as a helper"
    - path: "src/engine/dice.ts"
      issue: "Missing probability2DCheck helper"
    - path: "src/components/shared/"
      issue: "No DiceRollButton or SkillSelectButton primitives exist"
  missing:
    - "New: src/engine/dice.ts → export probability2DCheck(target, dm): number (lift from EducationStep)"
    - "New: src/engine/skill-benefit.ts → export classifySkillBenefit(existing, name, level): 'new' | 'upgrade' | 'none' mirroring addSkill semantics"
    - "New: src/components/shared/DiceRollButton.tsx wrapping useLoggedRoll + Button, showing odds pill + DM breakdown tooltip, firing onRolled(entry) so callers can do special resolution (survival natural-2, advancement natural-12)"
    - "New: src/components/shared/SkillSelectButton.tsx using classifySkillBenefit, dimming but not disabling no-benefit picks"
    - "Migrate: EducationStep (3 roll sites), EducationCard, EventCard choice buttons, CharacteristicsStep Roll All"
    - "Update tests that depended on the EventCard level-ignoring behavior"
  debug_session: .planning/debug/missing-shared-skill-and-dice-components.md

- truth: "Page refresh preserves career completion state — cannot restart career flow after mustering out"
  status: failed
  reason: "User reported: Refreshing the page allows selecting a new career step even after mustering out"
  severity: blocker
  test: 1
  root_cause: "XState machine state is not persisted, and useCreationMachine.deriveReplayEvents() is only aware of pre-career data. On every mount it creates a fresh actor and fast-forwards based on characteristics, skills, rollLog, and dicePool only. Longest replay path ends at SKIP_EDUCATION, parking the machine in career.choosingCareer which renders CareerGrid — regardless of whether the character has mustered out. Phase 02-06 persistence was explicitly scoped pre-career; Phase 03 is the first flow to exercise the gap. Secondary concerns: (a) WizardShell.tsx:130-135 has no real terminal UI for currentPhase === 'complete' (renders a generic StepPlaceholder), so fixing replay alone will move the bug from 'can pick a new career' to 'blank placeholder'. (b) Two actors exist — WizardShell and CareerStep each call useCreationMachine() independently with their own useMemo'd actor; they stay in sync only through deterministic replay and will desync on any actor-local event."
  artifacts:
    - path: "src/hooks/useCreationMachine.ts"
      issue: "deriveReplayEvents() is blind to career-phase state (no branches on careerHistory, previousCareers, lastCareer, benefits)"
    - path: "src/stores/character.ts"
      issue: "No terminal-phase marker (creationPhase or musteredOut flag) for replay to consult"
    - path: "src/components/wizard/WizardShell.tsx"
      issue: "Line 131 has dead 'musteringOut' branch; no terminal UI for 'complete' — renders StepPlaceholder"
    - path: "src/machines/creation.ts"
      issue: "'complete' final state exists but is unreachable from a fresh actor via current replay; no RESTORE_COMPLETE transition"
    - path: "src/components/wizard/WizardShell.tsx + src/components/career/CareerStep.tsx"
      issue: "Two independent useCreationMachine actors; desync risk"
  missing:
    - "Add creationPhase or musteredOut flag to Zustand store; set it on MUSTERING_COMPLETE"
    - "Extend deriveReplayEvents to inspect the flag and fast-forward to the complete state"
    - "Add RESTORE_COMPLETE transition on creation machine from idle → #creation.complete"
    - "Build a real terminal/summary view for currentPhase === 'complete' in WizardShell"
    - "Consider lifting the creation actor into a shared React context to eliminate the two-actor desync risk (recommended but scope-flag)"
    - "(Alternative, more architecturally correct): use XState actor.getPersistedSnapshot() + createActor({snapshot}) for true machine persistence"
  debug_session: .planning/debug/refresh-allows-new-career-after-musterout.md

- truth: "Career completion shows correct state label (not 'unknown - complete')"
  status: failed
  reason: "User reported: Completing a career step results in 'Career state: unknown - complete'"
  severity: major
  test: 1
  root_cause: "CareerStep.tsx:513-519 contains a developer diagnostic fallback that was never replaced: renders 'Career state: {subState ?? termLoopState ?? unknown}' followed by JSON.stringify(state.value). All 14 real career sub-states ARE individually handled above — this is NOT a missing case bug. The fallback is reached via a narrow render-race: WizardShell.tsx:131 routes to CareerStep for currentPhase === 'career' || 'musteringOut', but 'musteringOut' is dead code (nested under career). When MUSTERING_COMPLETE fires, the machine transitions to the root 'complete' final state and CareerStep briefly renders one frame with state.value === 'complete' that no if-block matches. Secondary latent bug: useCreationMachine.ts:115-122 subState selector returns Object.values(value)[0], which for two-level nested states returns an object not a string."
  artifacts:
    - path: "src/components/career/CareerStep.tsx"
      issue: "Diagnostic fallback at lines 513-519 leaks to users; primary file to fix"
    - path: "src/components/wizard/WizardShell.tsx"
      issue: "Line 131 has dead 'musteringOut' branch; contributes to the render-race window"
    - path: "src/hooks/useCreationMachine.ts"
      issue: "subState selector (lines 115-122) returns object for nested state shapes — latent risk"
  missing:
    - "Replace the CareerStep.tsx:513-519 diagnostic block with `return null` (optionally with a DEV-only console.warn)"
    - "(Bundle with gap 6) Fix WizardShell.tsx:131 to remove dead 'musteringOut' branch and add explicit 'complete' handling"
    - "(Bundle with gap 6) Fix useCreationMachine subState selector for nested states"
  debug_session: .planning/debug/career-state-unknown-complete-label.md

- truth: "CRER-11 event-granted advancement DMs also apply to commission rolls in the same term (per Mongoose Traveller 2E rules)"
  status: failed
  reason: "User chose to file a gap-fix plan rather than accept as MVP gap. CreationContext has no bonusDM field; CommissionCard does not accept external DM; research doc planned DM bonuses from events stored in machine context but field is absent."
  severity: major
  test: 2
  root_cause: "Four independent structural gaps, all pre-planned in 03-RESEARCH.md:426 but never implemented across 03-03 through 03-06. (1) DATA: Events encode advancement DMs as unstructured {type:'benefit', detail:'DM+2 to next advancement roll'} — no numeric value field. Found in 9+ events across army, scholar (incl. DM+4), noble, entertainer, merchant, scout, citizen, agent, plus choice-variant events. src/types/careers.ts also has a DUPLICATE EventEffect declaration (lines 52-66 and 141-149) with conflicting shapes. (2) CONTEXT: CreationContext (creation.ts:16-29) has no bonusAdvancementDM field; CreationEvent union has no SET_EVENT_BONUS_DM event; EVENT_RESOLVED has no payload. Three start-of-term transitions (CHOOSE_CAREER 267-274, BASIC_TRAINING_COMPLETE 310-320, CONTINUE_CAREER 399-410) reset per-term flags — a new bonus field would need to be reset there too. (3) CONSUMER: CareerEventCard.applyEffects (lines 44-66) only handles skill|contact|ally|rival|enemy|choice — 'benefit' effects are ignored entirely. (4) ROLL CARDS: Neither CommissionCard nor AdvancementCard accepts a bonusDM prop. Engine signatures (resolveCommissionRoll, resolveAdvancementRoll) are (diceTotal, dm, target, termsInCareer) — can remain unchanged if callers pre-sum charDM + bonusDM (recommended Option A)."
  artifacts:
    - path: "src/types/careers.ts"
      issue: "Duplicate EventEffect type declaration (lines 52-66 and 141-149); primary one needs new 'advancement_dm' effect type OR optional value?: number on benefit type"
    - path: "src/schemas/career.ts"
      issue: "Zod schema must align with the updated type"
    - path: "src/data/careers/army.json (lines 111, 125), scholar.json (173, 225, 241, 269), noble.json (248, 264, 284), entertainer.json (272), merchant.json (284), scout.json (267, 279), citizen.json (253), agent.json (243, 269), marine.json, navy.json, rogue.json"
      issue: "Advancement-DM events are unstructured free-text; need structured numeric value"
    - path: "src/machines/creation.ts"
      issue: "CreationContext missing bonusAdvancementDM field; no SET_EVENT_BONUS_DM event; 3 reset sites missing the field"
    - path: "src/components/career/CareerEventCard.tsx"
      issue: "applyEffects (lines 44-66) ignores 'benefit' effects; onResolved() callback has no DM payload"
    - path: "src/components/career/CareerStep.tsx"
      issue: "handleEventResolved (lines 167-169) dispatches EVENT_RESOLVED with no payload; does not thread bonusDM to CommissionCard/AdvancementCard"
    - path: "src/components/career/CommissionCard.tsx"
      issue: "No bonusDM prop; does not read from machine context"
    - path: "src/components/career/AdvancementCard.tsx"
      issue: "No bonusDM prop"
  missing:
    - "Consolidate duplicate EventEffect declarations in types/careers.ts; add advancement_dm type OR value?: number on benefit"
    - "Update zod schema to match"
    - "Restructure 9+ JSON events with numeric DM value"
    - "Add bonusAdvancementDM: number to CreationContext; add SET_EVENT_BONUS_DM (or payload on EVENT_RESOLVED) event + assign action"
    - "Reset bonusAdvancementDM: 0 in CHOOSE_CAREER, BASIC_TRAINING_COMPLETE, CONTINUE_CAREER transitions"
    - "CareerEventCard.applyEffects detects advancement_dm (plain and inside choice.options); onResolved signature becomes (bonusDM: number) => void"
    - "CareerStep passes state.context.bonusAdvancementDM as bonusDM prop to both CommissionCard and AdvancementCard"
    - "CommissionCard + AdvancementCard add bonusDM?: number prop, display in DM breakdown, pre-sum charDM + bonusDM before calling engine (Option A — no engine signature change)"
    - "Tests: golden-path scenario with event DM+2 on a term that runs both commission and advancement; unit test for CareerEventCard structured DM parsing incl. choice variant"
  debug_session: .planning/debug/crer-11-event-dm-not-applied-to-commission.md
