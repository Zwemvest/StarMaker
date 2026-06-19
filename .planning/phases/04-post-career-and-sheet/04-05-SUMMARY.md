---
phase: 04-post-career-and-sheet
plan: 05
type: summary
status: DONE
---

# 04-05 Summary — Post-career UI (psionics + equipment steps)

## Status: DONE

Built the two post-career wizard steps (psionics, equipment) that consume the
locked Phase 4 store/engine/data/machine contract, plus their mounting in
WizardShell and component tests. No store/engine/data/machine files were
touched — only step components, their mounting, and tests.

## Components built

### Psionics (`src/components/psionics/`)
- **PsionicsStep.tsx** — orchestrator. Local flow `gate → test → talents → done`.
  Reads `psionicsUnlocked`, `psiStrength`, `psiTalents`, `careerHistory`. Drives
  force-unlock, PSI roll, and ordered talent learning; `termsServed =
  careerHistory.length`; cumulative `-priorAttempts` penalty; `isTelepathyAutoGranted`
  for Telepathy-first; sends `PSIONICS_COMPLETE` exactly once (guarded by a ref).
- **PsiGate.tsx** — locked gate (D-2): primary "Skip Psionic Testing" and a
  clearly-secondary underlined "Test anyway", which reveals an inline amber
  confirm before `onForce` (→ `forcePsionicsUnlock`) runs. No mutation before confirm.
- **PsiTestCard.tsx** — PSI strength roll via `DiceRollButton` →
  `rollPsiStrength(diceTotal, termsServed)`; shows result then continues.
- **TalentLearnCard.tsx** — per-talent card. Powers list always shows name, PSI
  cost, and range (PSIN-06). Auto-grant path learns with no roll; otherwise
  `DiceRollButton` → `resolveTalentLearn`, success calls `onLearned`.

### Equipment (`src/components/equipment/`)
- **EquipmentStep.tsx** — orchestrator. `filterCatalog(EQUIPMENT_CATALOG, category,
  maxTL)` via `useMemo`; `handleBuy` calls `addEquipment` + `spendCredits`; sends
  `EQUIPMENT_COMPLETE`.
- **CategoryFilter.tsx** — category buttons (`all` + 6 categories) and a max-TL
  select (Any / 0..15).
- **CatalogBrowser.tsx** — maps filtered items to EquipmentCards; empty state.
- **EquipmentCard.tsx** — per-category stats (weapon range/damage, armour
  protection, gear description) + cost/TL/traits; Buy disabled when
  `!canAfford(credits, item.cost)`.
- **PurchaseCart.tsx** — running balance + owned list.

### Mounting (`src/components/wizard/WizardShell.tsx`)
- Imported and mounted `PsionicsStep` / `EquipmentStep` keyed to the `psionics`
  and `equipment` phases, each passed `send`. Extended `STEPS` (+Psionics,
  +Equipment) and `PHASE_TO_INDEX` (`psionics:5, equipment:6, sheet:6,
  complete:6`). `sheet` falls through to the existing placeholder (04-06 scope).

## Test results
- `tests/components/psionics.test.ts` — 8 passed.
- `tests/components/equipment.test.ts` — 6 passed.
- Full suite: **902 passed (41 files)**, no regressions (baseline ~888).
- `npx tsc --noEmit` — clean.
- `npm run build` — succeeds.

## Files changed
- src/components/psionics/PsionicsStep.tsx (new)
- src/components/psionics/PsiGate.tsx (new)
- src/components/psionics/PsiTestCard.tsx (new)
- src/components/psionics/TalentLearnCard.tsx (new)
- src/components/equipment/EquipmentStep.tsx (new)
- src/components/equipment/CatalogBrowser.tsx (new)
- src/components/equipment/CategoryFilter.tsx (new)
- src/components/equipment/EquipmentCard.tsx (new)
- src/components/equipment/PurchaseCart.tsx (new)
- src/components/wizard/WizardShell.tsx (modified)
- tests/components/psionics.test.ts (new)
- tests/components/equipment.test.ts (new)

## Commits
- 18ff16c Add psionics step: gate, PSI strength roll, and talent learning
- 2bf02cf Add equipment step: filtered catalog browser and budgeted purchase
- a03715e Mount psionics and equipment steps in the wizard shell

## Notes / concerns
- Plan referenced `src/data/equipment.ts`; the real path is the barrel
  `src/data/equipment/index.ts`, imported as `../../data/equipment` (resolves to
  the index). No change needed.
- For the auto-granted Telepathy path, the "Learn telepathy" button both records
  the talent and advances in one click (calls `onLearned` then `onSkip`), to avoid
  a redundant second click on the no-roll path.
