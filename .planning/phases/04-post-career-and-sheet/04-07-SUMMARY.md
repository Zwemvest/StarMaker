---
phase: 04-post-career-and-sheet
plan: 07
type: execute
status: done
verified: 2026-06-19
---

# 04-07 Summary — Phase 4 Verification + UAT

## What was delivered

1. **Extended `tests/engine/golden-path.test.ts`** with two Phase-4 golden characters
   (GP1–GP6 untouched):
   - **GP7 — Psionic + equipped character (legitimate full path):** Unusual-Event
     roll-12 → 1D result 1 unlock via `setPsionicsUnlocked()` (stays `isModified===false`);
     PSI = 2D − terms (`rollPsiStrength(10,3)===7`, clamp at 0); Telepathy auto-grant
     (`isTelepathyAutoGranted`); a rolled Clairvoyance applying psiDM + learnDM −
     cumulative penalty (`resolveTalentLearn`); talent powers carried through; Blade +
     Mesh purchase against Cr10,000 → Cr9,750 with over-budget `applyPurchase` throwing
     and the balance never going negative; drive store to `creationPhase==='complete'`
     and lock the stable legitimacy hash **`abc6e95a`** (computed twice, identical) with
     `isModified===false`.
   - **GP8 — Force-unlock flips Modified:** `forcePsionicsUnlock()` flips
     `isModified` false→true, appends a `psionics.forceUnlock` overridden roll-log entry,
     and yields a different hash **`3a9e18b7`** (≠ legitimate `abc6e95a`).
   - Both use `beforeEach(resetCharacter)`; all dice supplied explicitly (no randomness).

2. **`04-HUMAN-UAT.md`** — 8-test manual script: muster-out, psionics SKIP path,
   psionics FORCE-UNLOCK path, legitimate unlock (N/A-able), budgeted equipment
   purchase, final Dossier review, Field-Manual print/PDF, and badge consistency —
   each with explicit expected results and ●Legitimate/▲Modified badge checks.

3. **`04-VERIFICATION.md`** — pass/fail against the five roadmap success criteria,
   full PSIN-01..06 / EQUP-01..04 / SHEE-01..05 traceability table (15/15 mapped),
   behavioral spot-checks, and a blocking human-verification block for the in-browser
   walkthrough (SHEE-01 panel feel, SHEE-03 print fidelity).

## Gate results

| Gate | Command | Result |
|------|---------|--------|
| Phase-4 golden tests | `npx vitest run tests/engine/golden-path.test.ts` | 85 pass (GP1–GP8) |
| Full suite | `npx vitest run` | **921/921 pass**, 42 files |
| Typecheck | `npx tsc --noEmit` | exit 0, clean |
| Build | `npm run build` | exit 0 |

Suite count caveat: vitest excludes `.claude` worktrees; 921 is the genuine count
(prior ~909 + 12 new GP7/GP8 assertions).

## Determinism / hash provenance

The locked hashes were produced by running the real `computeHash`
(`canonicalizeRollLog` → SHA-256 → first 8 hex) over the exact roll-log entries the
live flow appends (`Psionics Strength` 2D, `Psionics Talent Learn`, and the
`psionics.forceUnlock` marker). Nothing is faked; GP7/GP8 drive the real engines + store.

## Findings

No bugs found in the Phase 4 feature. No feature code was modified. All 15 requirements
trace to concrete tests/components. Two items (SHEE-01 live-panel feel, SHEE-03 print
fidelity) are human-only by nature and routed to the blocking in-browser UAT, so the
verification status is `human_needed` until that walkthrough is recorded.
