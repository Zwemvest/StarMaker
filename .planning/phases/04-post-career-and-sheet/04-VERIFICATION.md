---
phase: 04-post-career-and-sheet
verified: 2026-06-19T00:00:00Z
status: human_needed
score: 13/15 requirements automated; 2 human-only (SHEE-01 panel feel, SHEE-03 print fidelity)
human_verification:
  - test: "Walk 04-HUMAN-UAT.md in the browser (npm run dev)"
    expected: "Skip path stays ● Legitimate; Test-anyway flips to ▲ Modified; equipment budget enforced (no negative balance); Dossier shows real data; Ctrl+P renders the Field-Manual print sheet with hash + Legitimate/Modified indicator"
    why_human: "Plan 04-07 Task 3 is an explicit blocking human-verify checkpoint. Live-panel feel (SHEE-01) and print/PDF visual fidelity (SHEE-03) cannot be asserted programmatically."
---

# Phase 04: Post-Career and Character Sheet — Verification Report

**Phase Goal:** Users can test for psionics, purchase equipment from the full Core
Rulebook catalog, and view/export a complete character sheet — with a legitimacy
system that keeps an event-gated character Legitimate and flips a force-unlocked one
to Modified.

**Verified:** 2026-06-19
**Status:** human_needed (automated gates green; in-browser UAT is a blocking checkpoint)
**Re-verification:** No — initial Phase 4 verification

---

## Success Criteria

The five roadmap Phase 4 success criteria, mapped to pass/fail with evidence.

| # | Success Criterion | Status | Evidence |
|---|-------------------|--------|----------|
| 1 | PSI test (2D − terms), learn all 5 talents with correct DMs + cumulative −1, Telepathy auto-granted if chosen first | PASS | GP7 (`golden-path.test.ts`): `rollPsiStrength(10,3)===7` and clamp at 0; `getTalentLearnDM` Telepathy +4 … Teleportation +0; `resolveTalentLearn` applies psiDM + learnDM − priorAttempts; `isTelepathyAutoGranted('telepathy',0)===true`. Engine `src/engine/psionics.ts`; UI `src/components/psionics/*` |
| 2 | Psionics event-gated; force-unlock flips to Modified and logs the action | PASS | GP7: `resolveUnusualEvent(1).unlocksPsionics===true` + `setPsionicsUnlocked()` keeps `isModified===false`. GP8: `forcePsionicsUnlock()` sets `isModified===true` and appends a `psionics.forceUnlock` overridden roll-log entry; forced hash `3a9e18b7` ≠ legitimate `abc6e95a`. `src/stores/character.ts`, `src/components/psionics/PsiGate.tsx` |
| 3 | Full Core catalog with category filtering + stats + budgeted purchase | PASS | GP7 buys Blade (Cr100) + Mesh (Cr150) against Cr10,000, balance → Cr9,750; over-budget `applyPurchase` throws and balance unchanged. `EQUIPMENT_CATALOG` (158 items, 6 categories); `CategoryFilter.tsx` lists all 6; engine `src/engine/equipment.ts` |
| 4 | Live Mission Dossier during creation + final sheet (stats, skills, career, equipment, contacts) | PASS (UI; human-confirm feel) | `CharacterPanel` rendered in the WizardShell aside at all phases (SHEE-01); `CharacterSheet` rendered at the `complete` phase (SHEE-02). GP7 drives the store to `creationPhase==='complete'`. Live-panel feel is human-verified (UAT test 6). |
| 5 | PDF/print export (Field-Manual stylesheet) with hash + Legitimate/Modified indicator | PASS (logic; human-confirm fidelity) | `src/components/sheet/print.css` (`@media print`); `LegitimacyBadge.tsx` renders `● Legitimate` / `▲ Modified` + hash; GP7 locks the legitimate hash, GP8 the modified hash. Print visual fidelity is human-verified (UAT test 7). |

All five criteria PASS at the engine/store/component-wiring level. Criteria 4 (live-panel
feel) and 5 (print/PDF rendering) retain a **blocking human checkpoint** for visual
fidelity per 04-07 Task 3 — see Human Verification below.

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | A Phase-4 golden character runs end-to-end through pure engines + store | VERIFIED | GP7: unlock → PSI roll → Telepathy auto-grant + rolled Clairvoyance → weapon+armour purchase → `complete` phase with stable hash `abc6e95a` |
| 2 | A second golden character force-unlocks and flips isModified false→true with a logged entry | VERIFIED | GP8: `forcePsionicsUnlock()` → `isModified===true`, `psionics.forceUnlock` marker logged, forced hash `3a9e18b7` ≠ legit |
| 3 | Every Phase 4 requirement maps to a test/component | VERIFIED | Requirements Coverage table below (15/15 mapped) |
| 4 | Full vitest suite green; tsc --noEmit clean | VERIFIED | 921/921 tests pass (42 files); `tsc --noEmit` exit 0; `npm run build` exit 0 |
| 5 | Human UAT script covers both psionics paths, budgeted purchase, sheet, print | VERIFIED | `04-HUMAN-UAT.md` — 8 tests with explicit expected results + per-step badge checks |

---

## Requirements Coverage

| Req | Description | Status | Evidence |
|-----|-------------|--------|----------|
| PSIN-01 | PSI = 2D − terms served (clamped ≥ 0) | SATISFIED | GP7 PSI-roll assertion; `rollPsiStrength` in `src/engine/psionics.ts`; `tests/engine/psionics.test.ts`; `PsiTestCard.tsx` |
| PSIN-02 | Talent DMs (Telepathy +4 … Teleportation +0) | SATISFIED | GP7 `getTalentLearnDM` assertions; `PSI_TALENTS` data; `TalentLearnCard.tsx` |
| PSIN-03 | Cumulative −1 per prior attempt | SATISFIED | GP7 second/third-attempt total assertions (10 → 9 → 5); `resolveTalentLearn`; `PsionicsStep.tsx` `priorAttempts` |
| PSIN-04 | First-chosen Telepathy auto-granted, no roll | SATISFIED | GP7 `isTelepathyAutoGranted` assertions; `PsionicsStep.tsx` autoGranted path |
| PSIN-05 | Acquired talents stored | SATISFIED | GP7 `addPsiTalent` → `psiTalents` assertions; store field `psiTalents`; `PsionicsList.tsx` |
| PSIN-06 | Talent powers (cost/reach) stored | SATISFIED | GP7 powers assertion (Shield PSI 0 / Personal; Life Detection PSI 1 / Distant); `src/data/psionics.ts`; `TalentLearnCard.tsx` |
| EQUP-01 | Full Core catalog (6 categories) | SATISFIED | `EQUIPMENT_CATALOG` (158 items); `tests/data/equipment*`; `CategoryFilter.tsx` (all 6) |
| EQUP-02 | Purchase against mustering-out credits | SATISFIED | GP7 purchase assertion; `canAfford`/`applyPurchase`; `EquipmentStep.tsx` (`spendCredits`, `addEquipment`) |
| EQUP-03 | Clamp to credits, cannot overspend | SATISFIED | GP7 over-budget `applyPurchase` throws + balance unchanged; `spendCredits` clamps via `Math.max(0,…)`; `src/engine/equipment.ts` |
| EQUP-04 | Items carry real stats (discriminated union) | SATISFIED | GP7 reads `blade.damage`/`blade.range`/`mesh.protection`; `src/types/equipment.ts` union; `EquipmentCard.tsx` |
| SHEE-01 | Live progressive panel during creation | SATISFIED (human-confirm feel) | `CharacterPanel` in WizardShell aside at all phases; existing panel tests; UAT test 6 |
| SHEE-02 | Final review sheet | SATISFIED | `CharacterSheet` at `complete` phase; GP7 reaches `creationPhase==='complete'` |
| SHEE-03 | Print/PDF (Field-Manual stylesheet) | SATISFIED (human-confirm fidelity) | `src/components/sheet/print.css` `@media print`; UAT test 7 |
| SHEE-04 | Legitimacy hash on sheet | SATISFIED | GP7 stable-hash assertion (`abc6e95a`); `computeHash` in `src/engine/hash.ts`; `LegitimacyBadge.tsx` |
| SHEE-05 | Legitimate vs Modified indicator | SATISFIED | GP8 `isModified` flip; `LegitimacyBadge.tsx` `● Legitimate`/`▲ Modified`; forced hash differs |

**15/15 requirements mapped.** SHEE-01 (panel feel) and SHEE-03 (print fidelity) carry
a human-confirm dimension routed to 04-HUMAN-UAT.md; their underlying logic/wiring is
verified.

---

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Phase-4 golden tests pass | `npx vitest run tests/engine/golden-path.test.ts` | 85 tests pass (GP1–GP8) | PASS |
| Full suite green | `npx vitest run` | 921/921 pass, 42 files | PASS |
| TypeScript compiles | `npx tsc --noEmit` | exit 0, no errors | PASS |
| Production build | `npm run build` | exit 0, built in ~3s | PASS |
| Legitimate hash is deterministic | GP7 `computeHash(log)` twice | identical `abc6e95a` | PASS |
| Forced hash differs from legitimate | GP8 | `3a9e18b7` ≠ `abc6e95a` | PASS |

Note on suite count: the vitest config excludes `.claude` worktrees, so the genuine
suite is 921 tests across 42 files (not the ~5000+ inflated count seen if orphaned
agent worktrees leak in). 921 = the prior ~909 plus the 12 new GP7/GP8 assertions.

---

## Anti-Patterns Found

None. No feature code was modified for this verification plan. GP7/GP8 drive the real
engines and store; no stubs, no fakes. The legitimacy hash is computed from the real
roll-log canonicalization (`canonicalizeRollLog` → SHA-256 → 8 hex), not hard-faked —
the locked literals were produced by running `computeHash` over the exact roll-log
entries the live flow appends.

---

## Human Verification Required

### 1. Full post-career walkthrough (04-07 Task 3 — Blocking)

**Test:** `npm run dev`, build a character to muster-out, then walk `04-HUMAN-UAT.md`:
skip path (stays Legitimate), force-unlock path (flips to Modified with confirm
dialog), equipment purchase with budget enforcement (no negative balance), final
Dossier review, and Ctrl+P print/PDF.
**Expected:** Both psionics paths show the correct badge; budget cannot be overspent;
the Dossier matches the underlying data; the printed sheet is the Field-Manual layout
with the hash and Legitimate/Modified indicator; badge is consistent across screen and
print.
**Why human:** Plan 04-07 Task 3 is an explicit `checkpoint:human-verify` with
`gate: blocking`. Visual layout, interaction flow, live-panel feel (SHEE-01), and
print/PDF fidelity (SHEE-03) cannot be asserted programmatically.

---

## Gaps Summary

No structural or logical gaps were found in the Phase 4 feature. All 15 requirements
are mapped to concrete evidence; the engines, store, machine, data, and UI components
exist and are wired. The full suite is green (921/921), `tsc --noEmit` is clean, and
`npm run build` succeeds.

Two items are human-only **by nature**, not gaps:
1. **SHEE-01** — live-panel feel during creation (visual/interaction quality).
2. **SHEE-03** — print/PDF visual fidelity of the Field-Manual stylesheet.

Both are routed to the blocking in-browser UAT (04-HUMAN-UAT.md). Until that walkthrough
is recorded, status remains `human_needed`; flip to `verified` once the UAT passes.

---

_Verified: 2026-06-19_
_Verifier: gsd-verifier_
