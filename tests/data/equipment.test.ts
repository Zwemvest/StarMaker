import { describe, it, expect } from 'vitest';
import { WEAPONS } from '../../src/data/equipment/weapons';
import { ARMOUR } from '../../src/data/equipment/armour';
import { SURVIVAL } from '../../src/data/equipment/survival';
import { ELECTRONICS } from '../../src/data/equipment/electronics';
import { MEDICAL } from '../../src/data/equipment/medical';
import { TOOLS } from '../../src/data/equipment/tools';
import { EQUIPMENT_CATALOG } from '../../src/data/equipment/index';
import { equipmentCatalogSchema } from '../../src/schemas/equipment';
import type { EquipmentCategory } from '../../src/types/equipment';

describe('weapons catalog', () => {
  it('contains every transcribed Core Rulebook weapon', () => {
    expect(WEAPONS.length).toBe(57);
  });

  it('validates against equipmentCatalogSchema', () => {
    expect(() => equipmentCatalogSchema.parse(WEAPONS)).not.toThrow();
  });

  it('marks every entry as a weapon', () => {
    for (const w of WEAPONS) {
      expect(w.category).toBe('weapons');
    }
  });

  it('keeps magazine and magazineCost consistent (both number or both null)', () => {
    for (const w of WEAPONS) {
      const magIsNull = w.magazine === null;
      const costIsNull = w.magazineCost === null;
      // Grenade launchers list a magazine but "As grenades" for cost: magazineCost
      // may legitimately be null while magazine is a number. Otherwise they pair up.
      if (typeof w.damage === 'string' && w.damage.startsWith('As grenade')) {
        expect(w.magazine === null || typeof w.magazine === 'number').toBe(true);
      } else {
        expect(magIsNull).toBe(costIsNull);
      }
    }
  });

  it('gives every melee weapon a null magazine', () => {
    for (const w of WEAPONS) {
      if (w.range === 'Melee') {
        expect(w.magazine).toBeNull();
        expect(w.magazineCost).toBeNull();
      }
    }
  });

  it('spot-checks a known weapon', () => {
    // Core Rulebook p.118 - Gauss Rifle: TL12, 600m, 4D, Cr1500, magazine 80, AP 5 / Auto 3 / Scope
    const gaussRifle = WEAPONS.find((w) => w.name === 'Gauss Rifle');
    expect(gaussRifle).toBeDefined();
    expect(gaussRifle?.damage).toBe('4D');
    expect(gaussRifle?.cost).toBe(1500);
    expect(gaussRifle?.magazine).toBe(80);
  });

  it('spot-checks a second known weapon', () => {
    // Core Rulebook p.116 - Broadsword: melee, 4D, Cr500, Bulky
    const broadsword = WEAPONS.find((w) => w.name === 'Broadsword');
    expect(broadsword?.damage).toBe('4D');
    expect(broadsword?.cost).toBe(500);
    expect(broadsword?.traits).toContain('Bulky');
  });
});

describe('armour catalog', () => {
  it('contains every transcribed Core Rulebook armour', () => {
    expect(ARMOUR.length).toBe(21);
  });

  it('validates against equipmentCatalogSchema', () => {
    expect(() => equipmentCatalogSchema.parse(ARMOUR)).not.toThrow();
  });

  it('marks every entry as armour with numeric protection and rad', () => {
    for (const a of ARMOUR) {
      expect(a.category).toBe('armour');
      expect(typeof a.protection).toBe('number');
      expect(typeof a.rad).toBe('number');
    }
  });

  it('spot-checks a known armour', () => {
    // Core Rulebook p.94 - Combat Armour (TL10): protection +13, Cr96000, rad 85
    const combat = ARMOUR.find((a) => a.name === 'Combat Armour (TL10)');
    expect(combat).toBeDefined();
    expect(combat?.protection).toBe(13);
    expect(combat?.cost).toBe(96000);
    expect(combat?.rad).toBe(85);
  });

  it('spot-checks a second known armour', () => {
    // Core Rulebook p.94 - Jack: protection +1, Cr50, rad 0
    const jack = ARMOUR.find((a) => a.name === 'Jack');
    expect(jack?.protection).toBe(1);
    expect(jack?.cost).toBe(50);
    expect(jack?.rad).toBe(0);
  });
});

describe('gear catalogs', () => {
  it.each([
    ['survival', SURVIVAL, 14],
    ['electronics', ELECTRONICS, 46],
    ['medical', MEDICAL, 14],
    ['tools', TOOLS, 6],
  ] as const)('%s has the transcribed count, validates, and has descriptions', (category, array, count) => {
    expect(array.length).toBe(count);
    expect(() => equipmentCatalogSchema.parse(array)).not.toThrow();
    for (const item of array) {
      expect(item.category).toBe(category);
      expect(typeof item.description).toBe('string');
      expect(item.description.length).toBeGreaterThan(0);
    }
  });

  it('spot-checks a known gear item', () => {
    // Core Rulebook p.112 - Grav Belt: TL12, Cr100000
    const gravBelt = SURVIVAL.find((g) => g.name === 'Grav Belt');
    expect(gravBelt).toBeDefined();
    expect(gravBelt?.tl).toBe(12);
    expect(gravBelt?.cost).toBe(100000);
  });

  it('spot-checks a second known gear item', () => {
    // Core Rulebook p.113 - Electronics Toolkit: TL7, Cr2000
    const kit = TOOLS.find((t) => t.name === 'Electronics Toolkit');
    expect(kit?.tl).toBe(7);
    expect(kit?.cost).toBe(2000);
  });
});

describe('EQUIPMENT_CATALOG', () => {
  it('concatenates all six category modules', () => {
    expect(EQUIPMENT_CATALOG.length).toBe(
      WEAPONS.length +
        ARMOUR.length +
        SURVIVAL.length +
        ELECTRONICS.length +
        MEDICAL.length +
        TOOLS.length,
    );
  });

  it('validates the whole catalog against equipmentCatalogSchema', () => {
    expect(() => equipmentCatalogSchema.parse(EQUIPMENT_CATALOG)).not.toThrow();
  });

  it('covers all six equipment categories', () => {
    const expected: EquipmentCategory[] = [
      'weapons',
      'armour',
      'survival',
      'electronics',
      'medical',
      'tools',
    ];
    const present = new Set(EQUIPMENT_CATALOG.map((e) => e.category));
    expect(present.size).toBe(expected.length);
    for (const cat of expected) {
      expect(present.has(cat)).toBe(true);
    }
  });

  it('has unique item names (usable as identity keys)', () => {
    const names = EQUIPMENT_CATALOG.map((e) => e.name);
    expect(new Set(names).size).toBe(EQUIPMENT_CATALOG.length);
  });
});
