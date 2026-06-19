---
phase: 04-post-career-and-sheet
plan: 06
type: summary
status: DONE
commit: 3578d03
---

# 04-06 Summary — Character Sheet, Legitimacy Badge, Print/PDF Export

## Status: DONE

## What was built

1. **Dossier extended (SHEE-01)** — `CharacterPanel.tsx` now reads `psiStrength`,
   `psiTalents`, and `ownedEquipment` from the store and renders two new
   collapsible sections after Finances:
   - **Psionics** — "PSI N" strength + each acquired talent (capitalised name +
     level) with a nested list of its powers as "{name} (PSI {cost}, {range})".
     Renders only when `psiStrength !== null`.
   - **Equipment** — each owned item with "×{quantity}" (when > 1) and a
     category-derived key stat (weapons → damage, armour → "Prot {n}", gear → "TL{n}").
     Renders only when `ownedEquipment.length > 0`.
   All existing sections untouched; both new sections updated to `defaultExpanded`
   so live content is visible (the plan's own Equipment test asserts visibility).

2. **LegitimacyBadge (SHEE-04/05)** — new `src/components/sheet/LegitimacyBadge.tsx`.
   Reads `isModified` + `legitimacyHash`. Shows "● Legitimate" (legitimate theme)
   or "▲ Modified" (modified theme) and always renders the full hash (em dash when
   empty). Accepts optional `className`.

3. **Print stylesheet (SHEE-03)** — new `src/components/sheet/print.css`. An
   `@media print` block hides app chrome (`.print-hide` / `[data-print-hide]`),
   reflows the sheet into a dense bordered monochrome "Field Manual" (A4 portrait,
   10mm margins), and documents the no-PDF-library choice. No `@react-pdf` anywhere.

4. **CharacterSheet (SHEE-02)** — new `src/components/sheet/CharacterSheet.tsx`.
   Composes characteristics, skills, careers, equipment, psionics, contacts, and
   finances from the store, plus a prominent `LegitimacyBadge`. Imports `./print.css`
   and applies the `character-sheet` / `sheet-section` / `sheet-pill` / `sheet-grid`
   hooks. A "Print / Save as PDF" button calls `window.print()`; an optional `onDone`
   renders a "Done" button. Both actions carry `print-hide`. Psionics/Equipment
   degrade gracefully when empty. (`Card` already forwarded `className` — no change
   needed.)

5. **Wizard wiring** — `WizardShell.tsx` imports `CharacterSheet` and renders it for
   `currentPhase === 'sheet'`, passing `onDone={() => send({ type: 'SHEET_COMPLETE' })}`.
   `PHASE_TO_INDEX` already mapped `sheet` (to index 6 on this branch, alongside the
   psionics/equipment steps); existing routing unchanged.

## Test results
- `tests/components/sheet.test.ts` — 9 tests, all pass.
- `tests/components/wizard.test.ts` — pass (no regressions).
- Full suite `npx vitest run` — **911 passed / 42 files** (baseline ~902, +9 new).
- `npx tsc --noEmit` — clean (exit 0).
- `npm run build` — succeeds; print.css bundled into `dist/assets/index-*.css`.
- `grep -r "@react-pdf"` across package.json + src — none (browser-native print only).

## Files changed
- `src/components/character-panel/CharacterPanel.tsx` (extended)
- `src/components/sheet/CharacterSheet.tsx` (new)
- `src/components/sheet/LegitimacyBadge.tsx` (new)
- `src/components/sheet/print.css` (new)
- `src/components/wizard/WizardShell.tsx` (sheet branch + import)
- `tests/components/sheet.test.ts` (new)

## Commit
- `3578d03` — Add character sheet, legitimacy badge, and print export

## Concerns / deviations
- The plan body listed grep targets `sheet: 4` and `defaultExpanded={false}` for the
  Equipment section. The branch's actual `PHASE_TO_INDEX` already had `sheet: 6`
  (psionics + equipment are real steps 5/6), so that was kept; and the plan's own
  Equipment test asserts the item text is visible, which requires the section to be
  expanded — so Equipment uses `defaultExpanded={true}`. Both reflect the real
  branch state and keep the plan's tests green.
- No store/engine/data/machine changes were made (constraint honoured).
