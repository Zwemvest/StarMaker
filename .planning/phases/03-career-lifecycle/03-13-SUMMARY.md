---
phase: 03-career-lifecycle
plan: 13
subsystem: career-lifecycle
tags: [career, crer-11, advancement-dm, commission, event-effects, tdd, uat-gap-8]

# Dependency graph
requires:
  - phase: 03-career-lifecycle
    provides: career JSON data, EventEffect type, careerSchema, creation machine, CareerEventCard, CommissionCard, AdvancementCard
provides:
  - Structured advancement_dm event effects (and valued choice options) across 11 career data files
  - EventEffect.value field + advancement_dm type discriminator (type + Zod schema)
  - bonusAdvancementDM machine context field with start-of-term reset (CHOOSE_CAREER, BASIC_TRAINING_COMPLETE, CONTINUE_CAREER)
  - SET_EVENT_BONUS_DM event handled in termLoop.event
  - CareerEventCard parses plain + choice-variant advancement DMs and reports them via onResolved(bonusDM)
  - CommissionCard and AdvancementCard accept and apply a bonusDM prop (pre-summed into the engine DM) and show an Event DM breakdown row
affects: [04-post-career, 03-HUMAN-UAT retest]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Event grants carried in machine context, applied to both commission and advancement, reset per term"
    - "Choice DM detection by option label matching /advancement/i + a numeric value on the effect"
    - "Engine signatures unchanged (Option A): bonusDM pre-summed into the dm argument"

key-files:
  created:
    - tests/components/career-event-card.test.ts
    - tests/components/commission-card.test.ts
    - tests/components/advancement-card.test.ts
  modified:
    - src/types/careers.ts
    - src/schemas/career.ts
    - src/data/careers/{army,marine,navy,scholar,noble,merchant,scout,citizen,agent,entertainer,rogue}.json
    - src/machines/creation.ts
    - src/components/career/CareerEventCard.tsx
    - src/components/career/CareerStep.tsx
    - src/components/career/CommissionCard.tsx
    - src/components/career/AdvancementCard.tsx
    - tests/engine/golden-path.test.ts
    - tests/data/careers.test.ts
    - tests/machines/creation.test.ts
---

# Plan 03-13 Summary — CRER-11 event advancement DM carry-over

Closes UAT gap 8.

## What changed
- **Data/type/schema**: added `advancement_dm` to the EventEffect type union and Zod enum, plus an optional `value: number`. Migrated every "DM+N to next advancement roll" benefit into a structured `advancement_dm` effect, and put `value: N` on each choice effect whose advancement option grants the DM.
- **Machine**: new `bonusAdvancementDM` context field (default 0), `SET_EVENT_BONUS_DM` handler in `termLoop.event`, and a reset at all three start-of-term transitions.
- **CareerEventCard**: `computeAdvancementBonus` derives the DM from plain `advancement_dm` effects and from chosen advancement options, then reports it via `onResolved(bonusDM)`.
- **CareerStep**: dispatches `SET_EVENT_BONUS_DM` before `EVENT_RESOLVED`, and passes `state.context.bonusAdvancementDM` as `bonusDM` to both CommissionCard and AdvancementCard.
- **Cards**: both pre-sum `bonusDM` into the DM handed to the engine (engine signatures unchanged) and render an "Event DM" breakdown column when the bonus is non-zero.

## Plan deviation
The plan's `computeAdvancementBonus` matches the *selected choice option label* against `/advancement/i`, but scholar's "Cheat" and rogue's "Backstab" options (the DM-granting picks) did not contain "advancement", so the bonus would have silently failed for those two careers. Enriched those option labels to "Cheat (DM+2 advancement)" and "Backstab (DM+4 advancement)" / "Spare them (Ally)", which both fixes detection and clarifies the UI.

## Cleanup
Removed four pre-existing unused locals (`deferred-items.md` TS6133 errors in CareerStep, ContinueLeaveCard, SkillTableTabs, BenefitRoll) so `npm run build` type-checks clean.

## Verification
- `npm run test`: 796 passing (golden-path GP6, CareerEventCard 5 fixtures, commission/advancement card Event-DM tests, machine carry-over + reset tests). `npm run build`: clean.
- Live browser UAT confirmed the commission card correctly omits the Event DM column when the term's bonus is 0 and the bonusDM wiring is threaded through; the +DM application itself is proven by the golden-path and component tests.
