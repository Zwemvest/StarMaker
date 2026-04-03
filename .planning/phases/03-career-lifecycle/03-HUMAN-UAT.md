---
status: partial
phase: 03-career-lifecycle
source: [03-VERIFICATION.md]
started: 2026-04-03T15:36:00Z
updated: 2026-04-03T15:36:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Complete Career Lifecycle End-to-End
expected: Run `npm run dev`. Create a new character through characteristics and background skills. Navigate career selection: verify 12 career grid loads with qualification info. Select Army → Infantry. Complete full term: survival roll (check natural 2 handling), career event (check life events redirect for roll 7), commission roll (military only), advancement roll (check forced-leave/stay), skill table selection (check 4-cap warning). Serve enough terms to trigger aging at 34+. Verify continue/leave card shows pension info. Muster out, verify roll-by-roll with cash limit of 3. Check character panel shows career history, contacts, noble title (if SOC ≥ 11). Try Drifter (no qualification, assignment basic training).
result: [pending]

### 2. CRER-11 Edge Case Decision (Advisory)
expected: In a military career, encounter a career event that grants a +DM to advancement. The event-granted advancement DM should also apply to the commission roll (per Mongoose Traveller 2E rules). Decision required: accept as MVP gap or file gap-fix plan.
result: [pending]

## Summary

total: 2
passed: 0
issues: 0
pending: 2
skipped: 0
blocked: 0

## Gaps
