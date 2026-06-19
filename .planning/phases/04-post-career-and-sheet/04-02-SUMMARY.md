# 04-02 Summary — Core Rulebook Equipment Catalog Data

**Status:** DONE

## What was built
Transcribed the full Mongoose Traveller 2E Core Rulebook (Printer Friendly)
Equipment chapter into typed data, one module per category under
`src/data/equipment/`, plus a concatenated `EQUIPMENT_CATALOG` and a
golden-data test suite. Consumes the locked `Equipment` type and
`equipmentCatalogSchema` from plan 04-01 without modifying them.

## Item counts per category (158 total)
| Category    | Count | Source pages |
|-------------|-------|--------------|
| weapons     | 57    | p.116 (melee), p.118 (slug throwers), p.121 (energy), p.123 (grenades), p.125 (heavy), p.127 (explosives) |
| armour      | 21    | p.94 (Armour table) |
| survival    | 14    | p.112 (Survival Gear table) + descriptions p.114-115 |
| electronics | 46    | p.102 (transceivers), p.103 (mobile comm/bug/commdot), p.105 (computers), p.110-111 (sensors) |
| medical     | 14    | p.108-109 (Medical & Care Supplies: cryoberth, medikits, drugs) |
| tools       | 6     | p.113 (Toolkits table) |

## Files changed
- `src/data/equipment/weapons.ts` (new) — `WEAPONS: readonly WeaponItem[]`
- `src/data/equipment/armour.ts` (new) — `ARMOUR: readonly ArmourItem[]`
- `src/data/equipment/survival.ts` (new) — `SURVIVAL: readonly GearItem[]`
- `src/data/equipment/electronics.ts` (new) — `ELECTRONICS: readonly GearItem[]`
- `src/data/equipment/medical.ts` (new) — `MEDICAL: readonly GearItem[]`
- `src/data/equipment/tools.ts` (new) — `TOOLS: readonly GearItem[]`
- `src/data/equipment/index.ts` (new) — `EQUIPMENT_CATALOG` + re-exports
- `tests/data/equipment.test.ts` (new) — 22 golden-data tests

## Testing
- `npx vitest run tests/data/equipment.test.ts` — 22/22 pass (per-category counts,
  schema validation, magazine/null consistency, melee null-magazine rule,
  category literals, non-empty descriptions, unique names, and spot-checks of
  Gauss Rifle (4D/Cr1500/mag 80), Broadsword (4D/Cr500/Bulky), Combat Armour TL10
  (+13/Cr96000/rad 85), Jack (+1/Cr50/rad 0), Grav Belt (TL12/Cr100000),
  Electronics Toolkit (TL7/Cr2000)).
- `npx tsc --noEmit` — clean (each literal checked against its variant).
- `npx vitest run` (full suite) — 873/873 pass across 39 files, no regressions.

## Transcription decisions / conventions
- Items the book lists at multiple Tech Levels (e.g. Cloth, Combat Armour, Vacc
  Suit, Laser Pistol, Medikit, Portable Computer, transceivers, goggles) are
  split into one item per TL variant, with the name disambiguated by TL (and
  range where needed for transceivers) so catalog names stay unique — required by
  the 04-01 "name as identity" contract.
- Costs strip the "Cr" prefix and thousands commas; `MCr0.5` → 500000.
- Blank / "—" mass → 0; "—" Rad → 0.
- Energy weapons table: the book's "Power Pack Cost" column maps to
  `magazineCost`, and its Magazine column to `magazine`.
- Plasma Rifle ("Unlimited" magazine, no power-pack cost) → magazine/magazineCost
  both null. Grenades and explosives → magazine/magazineCost both null; explosives
  use range `'Placed'`, grenades keep their thrown range (`'20m'`).
- Grenade Launcher / RAM Grenade Launcher: magazine is a number, magazineCost is
  null ("As grenades"). The test allows this specific pairing.
- Reflec / Ablat: protection is the single numeric rating; their special
  "vs. lasers" note is recorded as a trait. Armour "Required Skill" and Battle
  Dress "Powered" notes are recorded as traits.
- Damage cells with no dice (Aerosol/Smoke grenades) → `'0'` to satisfy the
  string `damage` field while staying faithful (no damage listed).

## Uncertainties
- None blocking. The book's transceiver tables (p.102) label rows only by TL and
  range (no item names); I synthesised unique, descriptive names from those two
  faithfully-transcribed fields. All numeric stats are read directly from the PDF.

## Commits (branch: phase-04-post-career)
- `2d82334` Add Core Rulebook weapons and armour catalog data
- `cd354dd` Add Core Rulebook survival, electronics, medical and tools gear data
- `6e8f139` Concatenate equipment catalog and add golden-data tests
