---
status: pending
phase: 04-post-career-and-sheet
source: [04-05-SUMMARY.md, 04-06-SUMMARY.md, 04-07-PLAN.md]
started:
updated:
---

## How to run

1. `npm run dev` and open the app.
2. Build (or resume) a character through to **mustering out done** — the post-career
   sequence (Psionics → Equipment → Sheet) begins after mustering out.
3. Walk each numbered test below. For every test, fill in `result:` with `pass` or
   `issue`, and for issues add `reported:` and `severity:` (cosmetic / minor / major / blocker).
4. Pay special attention to the **legitimacy badge** (`● Legitimate` vs `▲ Modified`)
   called out in each test — it is the integrity signal Phase 4 must get right.

## Current Test

[not started]

## Tests

### 1. Reach muster-out done
expected: The mustering-out summary shows the final **credits** balance, the list of
**benefits**, and any **pension** (Cr for 5+ terms). The flow then advances into the
post-career sequence (first stop: the Psionics step). The legitimacy badge reads
**● Legitimate** (no overrides taken).
result:

### 2. Psionics gate — SKIP path (not unlocked)
expected: Because the character was never flagged for psionic potential (no Unusual
Event roll-12 → 1D result 1), the Psionics step shows a **gate** with a primary
**"Skip Psionic Testing"** button and a clearly-secondary **"Test anyway (untested
path)"** link. Clicking **Skip** advances straight to the **Equipment** step and
changes nothing about the character. The badge **STAYS ● Legitimate**.
result:

### 3. Psionics gate — FORCE-UNLOCK path ("Test anyway")
expected: Restart or branch a character to the locked gate again. Click **"Test
anyway (untested path)"**. An **amber confirmation** appears warning that "Testing
without a trigger flips your character to ▲ Modified (logged)." with **"Yes, test
anyway"** / **"Cancel"**. Cancelling backs out with no change. Confirming:
  - rolls **PSI = 2D − terms served** (PSIN-01),
  - grants **Telepathy automatically** if it is the first talent chosen (no roll),
  - applies a **cumulative −1** penalty to each subsequent talent attempt,
  - and **FLIPS the badge to ▲ Modified**, with a force-unlock entry logged in the
    roll log.
The badge must read **▲ Modified** from this point on.
result:

### 4. Psionics — legitimate unlock (if reproducible)
expected: If you can engineer the **Life Events roll 12 → Unusual Event 1D result 1**
during career creation, reaching the Psionics step this way should present the PSI
test directly (no gate) and keep the badge **● Legitimate** through PSI roll and
talent learning. Mark **N/A** if not reproducible in-session — this path is covered
deterministically by the GP7 automated golden test.
result:

### 5. Equipment purchase with budget enforcement
expected: The Equipment step shows the **full Core Rulebook catalog** filterable
across **6 categories** (weapons, armour, survival, electronics, medical, tools).
Each item shows real stats (damage/range for weapons, protection for armour, cost,
TL, traits). With a known credit balance, **buying a weapon + an armour** decrements
the **visible balance** by exactly their combined cost. Attempting to **overspend**
is **blocked** (the buy control is disabled / the purchase is rejected) and the
balance **never goes negative** (EQUP-03). The badge state is unchanged by purchases.
result:

### 6. Final sheet review (Mission Dossier)
expected: Reaching the character sheet shows the **Mission Dossier**: characteristics
with DMs, skills, full **career history**, **owned equipment** with stats, **psionic
talents and their powers** (if any were learned), **contacts**, **credits**, and the
**legitimacy hash**. The on-screen data matches what was actually rolled/purchased
(no placeholder values).
result:

### 7. Print / PDF (Field Manual)
expected: Trigger **Ctrl+P** (or the export/print control). A **dense Field-Manual
print layout** renders (light/print theme, NOT the dark dashboard), includes the
**legitimacy hash** and the **Legitimate / Modified indicator**, and degrades
gracefully when psionics and/or equipment are empty (no broken/empty sections).
result:

### 8. Badge consistency across paths
expected: Confirm the badge stays consistent end-to-end:
  - **Skip path** (test 2): **● Legitimate** on the gate, the equipment step, the
    final sheet, AND the printed sheet.
  - **Force-unlock path** (test 3): **▲ Modified** on the gate aftermath, the
    equipment step, the final sheet, AND the printed sheet.
The badge shown on the final sheet/print must match the path actually taken.
result:

## Summary

- Tests passed: __ / 8
- Issues found: __
- Blockers: __

## Gaps

(record any gaps, surprises, or rulebook-fidelity concerns here)
