# Phase 4 — Post-Career & Character Sheet · Design

**Date:** 2026-06-19
**Status:** Design approved (brainstorm), pending plan generation
**Core value:** Faithful Mongoose Traveller 2E creation with override mode and legitimacy verification

## Overview

Phase 4 closes out single-character creation. After mustering out, the character
runs a short post-career sequence — optional psionic testing, equipment purchase —
and arrives at a complete character sheet that can be reviewed on screen and
exported to paper/PDF. A live character panel updates throughout the entire
creation flow.

```
[Mustering Out done]
   → ① Psionics gate (only if unlocked; or force → Modified; else skipped)
   → ② Equipment purchase (full Core catalog, spend mustering-out credits)
   → ③ Final Character Sheet (Dossier — stats, skills, careers, gear, contacts, hash)
   → ④ Print / PDF (Field Manual print stylesheet)
```

## Key Decisions

### D-1 · One data model, two presentations
The character sheet is **not** a single layout. The character store is the single
source of truth; it renders two ways:

- **Screen view — "Mission Dossier"**: card dashboard, dark sci-fi theme, skill
  pills, accent rails. Used both as the live progressive panel during creation
  (SHEE-01) and as the final review sheet (SHEE-02).
- **Paper view — "Field Manual"**: a dense, bordered, single-page form (official
  TAS-form feel) produced by a dedicated **print stylesheet**. This *is* the PDF
  export — browser native save-as-PDF, no heavy PDF library (SHEE-03).

Because both read the same store, screen and paper can never disagree.

> **Deviation from prior research:** `research/SUMMARY.md` originally recommended
> `@react-pdf/renderer`. We choose print-CSS as primary (lighter, guaranteed to
> match the screen). `@react-pdf/renderer` is retained as a documented fallback
> only if the print stylesheet proves too limiting for pagination/fidelity.

### D-2 · Psionics is event-gated (strict RAW) with an honest-cheat door
In Core RAW, psionic testing is unusual and requires a trigger. We gate it strictly:

- **Legitimate path:** the Life Events → Unusual Event 1D sub-table result `1`
  ("Psionics") sets a persistent `psionicsUnlocked` flag. Reaching the psionics
  step this way keeps the character **● Legitimate**.
- **Honest-cheat path:** if not unlocked, the user may still choose **"Test
  anyway"**. This force-unlock runs the same testing flow but flips the character
  to **▲ Modified** (logged). No gatekeeping — just truthful bookkeeping.
- If neither, the flow skips psionics entirely and proceeds to equipment.

**Wiring gap to close:** today the Unusual Event (Life Events roll 12) is
narrative-only — its 1D sub-table is flavor text with a generic `special` effect.
Phase 4 must implement that 1D roll for real and set `psionicsUnlocked` on result
`1`. The other five Unusual outcomes have no mechanical state in Core RAW and stay
as narrative text.

### D-3 · Minimal legitimacy machinery now (not the Phase 5 override engine)
SHEE-05 already requires a Legitimate-vs-Modified indicator. Phase 4 introduces the
**minimal** machinery to support it: a `legitimacy` state (`legitimate | modified`),
a logged modification entry, and the badge. The psionics force-unlock is its first
trigger. The **full** override engine (reroll anything, revert to any decision
point — OVRD-01..05) stays in Phase 5.

### D-4 · Equipment = full Core Rulebook catalog
All six categories (weapons, armour, survival, electronics, medical, tools)
transcribed from the Core Rulebook. The current `Equipment` type is too thin;
it becomes a **discriminated union by category** so each item carries its real
stats (weapons: range/damage/magazine/traits; armour: protection/rad; etc.).
Transcription risk is mitigated Phase-3-style: **golden-data validation tests**
(counts + spot-checked known values) so errors surface in CI.

### D-5 · Skill packages deferred; new Phase 6 created
SKPK-01 is a **group** mechanic and has no meaning for a solo character. It is
removed from Phase 4 and re-pointed to a **new Phase 6 — Group & Connections**,
alongside CONN-01/CONN-02 (promoted from v2). Phase 6 is the roadmap capstone
because Connections require the multi-character roster delivered by Phase 5.

## Architecture & Components

Follows the established layering: types/schemas → data → pure engines → store +
XState → UI components.

| Layer | Additions |
|-------|-----------|
| `src/types/` | `equipment.ts` → discriminated union; new `psionics.ts`; legitimacy fields on `character.ts` |
| `src/schemas/` | Zod for equipment union, psionics, legitimacy |
| `src/data/` | full equipment catalog; psionic talents/powers table; Unusual-Events 1D sub-table |
| `src/engine/` | `psionics.ts` (PSI roll, talent learning, Telepathy gateway, cumulative −1); `equipment.ts` (purchase/budget); `legitimacy.ts` (modified flag + log entry); Unusual-Events resolution |
| `src/stores/character.ts` | psionics result, owned equipment, credit balance, legitimacy state |
| `src/machines/creation.ts` | post-career sub-states: `psionics` (guarded by unlock), `equipment`, `sheet` |
| `src/components/` | `psionics/` step, `equipment/` step, `character-panel/` → Dossier; print stylesheet |

## Data Flow — psionics

1. During careers, an Unusual Event may set `psionicsUnlocked = true` (legitimate).
2. Post-career, the `psionics` machine state is entered only if unlocked **or** the
   user elects "Test anyway" (→ sets legitimacy `modified`).
3. Engine rolls PSI = 2D − terms served (PSIN-01).
4. User attempts talents: each attempt applies the talent DM (Telepathy +4 …
   Teleportation +0, PSIN-02), the PSI DM, and a cumulative −1 per prior attempt
   (PSIN-03). Telepathy chosen first is auto-granted, no roll (PSIN-04).
5. Acquired talents + their powers (cost, reach) are stored (PSIN-05/06).

## Error / Edge Handling

- Psionics step is fully skippable; skipping changes nothing and stays Legitimate.
- Equipment purchase clamps to available credits; cannot overspend (EQUP-03).
- Force-unlock requires an explicit confirm (irreversible-ish; flips legitimacy).
- Print view degrades gracefully if equipment/psionics are empty.

## Testing

- TDD for all engines (psionics, equipment/budget, legitimacy, unusual-events).
- Golden-data validation for the equipment catalog (counts + spot values vs PDF).
- Golden-path: an end-to-end character with psionics + purchases reaching a sheet.
- Legitimacy: force-unlock flips badge and is logged; hash reflects it.

## Plan Breakdown (coarse, dependency-ordered)

| Plan | Title | Depends on | Delivers |
|------|-------|-----------|----------|
| 04-01 | Types & data scaffolding | — | equipment union type+Zod, psionics types, legitimacy state; psionic talents table + Unusual-Events sub-table data |
| 04-02 | Equipment catalog data | 04-01 | full Core transcription (6 categories) + golden-data tests (EQUP-01/04) |
| 04-03 | Engines (TDD) | 04-01 | psionics, equipment/budget, legitimacy, unusual-events resolution (PSIN-01/03/04, EQUP-03, SHEE-05) |
| 04-04 | Store + state machine | 04-03 | store extensions; post-career sub-states; psionicsUnlocked wiring |
| 04-05 | Post-career UI | 04-04, 04-02 | psionics step (gate/test/talents/force-unlock) + equipment step (PSIN-06, EQUP-02) |
| 04-06 | Character sheet + export | 04-04 | CharacterPanel → Dossier (SHEE-01/02), legitimacy badge + hash (SHEE-04/05), Field-Manual print → PDF (SHEE-03) |
| 04-07 | Verification + UAT | 04-05, 04-06 | golden-path, traceability, human UAT |

Parallel waves: **A** = 04-02 ∥ 04-03 (after 04-01); **B** = 04-05 ∥ 04-06 (after 04-04).

## Requirements Traceability

**In Phase 4:** PSIN-01..06, EQUP-01..04, SHEE-01..05.
**Moved out:** SKPK-01 → Phase 6 (alongside CONN-01/02, promoted from v2).
**Success criteria:** Roadmap Phase 4 SC 1–5 — (1) PSI test + talent learning,
(2) psionics event-gating + force-unlock→Modified, (3) full equipment catalog +
budgeted purchase, (4) live + final character sheet, (5) PDF/print export with hash
and Legitimate/Modified indicator. The former skill-package SC moved to Phase 6.

## Out of Scope (Phase 4)

- Full override engine (reroll/revert) — Phase 5.
- Multi-character roster / save-load — Phase 5.
- Skill packages, Connections — Phase 6.
- Any equipment beyond the Core Rulebook (Central Supply Catalogue) — out of v1.
