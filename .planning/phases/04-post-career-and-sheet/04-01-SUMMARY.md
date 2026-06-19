# 04-01 Summary — Phase 4 foundation: types, schemas, data

## Status: DONE

Established and LOCKED the Phase 4 contract surface (types, Zod schemas, two
non-catalog data tables). No engines, store, machine, or UI — those are later
plans.

## What was built

### Task 1 — Equipment discriminated union + schema
- `src/types/equipment.ts` (REPLACED): `EquipmentCategory` (unchanged 6-value
  union); shared `EquipmentBase` (name, tl, cost, mass, traits); variants
  `WeaponItem` (range, damage, magazine, magazineCost), `ArmourItem`
  (protection, rad), `GearItem` (description, category limited to the 4
  non-weapon/armour categories); `Equipment = WeaponItem | ArmourItem | GearItem`;
  `OwnedEquipment` wrapper ({ item, quantity }).
- `src/schemas/equipment.ts`: `equipmentSchema = z.discriminatedUnion('category', …)`
  with weapon + armour members and one literal gear member per gear category
  (discriminatedUnion needs a literal discriminator per member);
  `equipmentCatalogSchema = z.array(equipmentSchema)`.

### Task 2 — Psionics types + schema
- `src/types/psionics.ts`: `PsiTalentName` (5-value union), `PsiPower`
  (name, talent, psiCost, range, description), `PsiTalentData`
  (name, learnDM, powers), `AcquiredPsiTalent` (talent, level, powers).
- `src/schemas/psionics.ts`: `psiTalentNameSchema`, `psiPowerSchema`,
  `psiTalentDataSchema`, `acquiredPsiTalentSchema`.

### Task 3 — PSI_TALENTS data (transcribed from Core Rulebook, pp. 196-202)
- `src/data/psionics.ts`: `PSI_LEARN_TARGET = 8` (Average 8+ PSI check, confirmed
  by the rulebook's worked example: total 6 fails, total 10 succeeds);
  `PSI_TALENTS` — all 5 talents (telepathy first) with correct learning DMs
  (+4/+3/+2/+1/+0) and every power transcribed with psiCost, range (Reach) and
  description. Awareness powers have no Reach in the rulebook and are recorded
  with range "Personal"; variable-cost powers record their base cost and note
  the scaling in the description.

### Task 4 — UNUSUAL_EVENTS sub-table
- `src/data/unusual-events.ts`: `UnusualEvent` type and the 6-entry 1D sub-table
  (rollValues 1-6) matching the Life Events roll-12 reference. Only rollValue 1
  (Psionics) has `unlocksPsionics: true`.

## Files

Created/modified:
- src/types/equipment.ts (replaced)
- src/types/psionics.ts (new)
- src/schemas/equipment.ts (new)
- src/schemas/psionics.ts (new)
- src/data/psionics.ts (new)
- src/data/unusual-events.ts (new)
- tests/types/phase4-types.test.ts (new)
- tests/data/psionics.test.ts (new)
- tests/data/unusual-events.test.ts (new)

## Test results
- tests/types/phase4-types.test.ts, tests/data/psionics.test.ts,
  tests/data/unusual-events.test.ts — 22 tests, all passing.
- `npx tsc --noEmit` — clean (exit 0).

## Commits
- b1211c7 Add discriminated-union Equipment type and Zod schema
- 616cb38 Add psionics talent and power types with Zod schema
- a39238e Add PSI_TALENTS data table with talents, powers and learning DMs
- 8da2d98 Add Unusual Events 1D sub-table with psionics-unlock flag

## Notes / decisions
- Equipment union uses `z.discriminatedUnion` (not `z.union`): gear is expanded
  into one literal-discriminated member per category, which gives precise
  per-variant validation (a weapon missing `damage` throws). This is stricter
  and cleaner than the plan's fallback suggestion of `z.union` + `z.enum`.
- Teleportation has a single core power ("Teleportation"); the equipment-load
  variants (10kg / 500kg) are described inline rather than as separate powers,
  matching the rulebook presentation.
