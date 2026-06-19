import { describe, it, expect } from 'vitest';
import {
  equipmentSchema,
  equipmentCatalogSchema,
} from '../../src/schemas/equipment';
import type {
  WeaponItem,
  ArmourItem,
  GearItem,
  OwnedEquipment,
} from '../../src/types/equipment';
import { psiTalentDataSchema, psiPowerSchema } from '../../src/schemas/psionics';
import type {
  PsiTalentName,
  PsiPower,
  PsiTalentData,
  AcquiredPsiTalent,
} from '../../src/types/psionics';

describe('equipment types and schema', () => {
  const validWeapon: WeaponItem = {
    name: 'Autopistol',
    category: 'weapons',
    tl: 5,
    cost: 200,
    mass: 0.5,
    traits: [],
    range: '10m',
    damage: '3D-3',
    magazine: 15,
    magazineCost: 10,
  };

  const validArmour: ArmourItem = {
    name: 'Flak Jacket',
    category: 'armour',
    tl: 7,
    cost: 100,
    mass: 2,
    traits: [],
    protection: 3,
    rad: 0,
  };

  const validGear: GearItem = {
    name: 'Medikit',
    category: 'medical',
    tl: 8,
    cost: 1000,
    mass: 2,
    traits: [],
    description: 'A portable medical kit.',
  };

  it('parses a valid weapon', () => {
    expect(equipmentSchema.parse(validWeapon)).toEqual(validWeapon);
  });

  it('parses a valid armour item', () => {
    expect(equipmentSchema.parse(validArmour)).toEqual(validArmour);
  });

  it('parses a valid gear item', () => {
    expect(equipmentSchema.parse(validGear)).toEqual(validGear);
  });

  it('throws for a weapon missing damage', () => {
    const { damage, ...broken } = validWeapon;
    void damage;
    expect(() => equipmentSchema.parse(broken)).toThrow();
  });

  it('parses a catalog array of mixed equipment', () => {
    const catalog = [validWeapon, validArmour, validGear];
    expect(equipmentCatalogSchema.parse(catalog)).toEqual(catalog);
  });

  it('supports the OwnedEquipment wrapper', () => {
    const owned: OwnedEquipment = { item: validWeapon, quantity: 2 };
    expect(owned.quantity).toBe(2);
    expect(owned.item.name).toBe('Autopistol');
  });
});

describe('psionics types and schema', () => {
  const validPower: PsiPower = {
    name: 'Life Detection',
    talent: 'telepathy',
    psiCost: 1,
    range: 'Distant',
    description: 'Detect the presence of other minds.',
  };

  const validTalent: PsiTalentData = {
    name: 'telepathy',
    learnDM: 4,
    powers: [validPower],
  };

  it('parses a valid power', () => {
    expect(psiPowerSchema.parse(validPower)).toEqual(validPower);
  });

  it('parses a valid talent', () => {
    expect(psiTalentDataSchema.parse(validTalent)).toEqual(validTalent);
  });

  it('throws for an unknown talent name', () => {
    const broken = { ...validTalent, name: 'pyromancy' };
    expect(() => psiTalentDataSchema.parse(broken)).toThrow();
  });

  it('models acquired talents', () => {
    const acquired: AcquiredPsiTalent = {
      talent: 'telepathy',
      level: 0,
      powers: [validPower],
    };
    expect(acquired.level).toBe(0);
    const name: PsiTalentName = acquired.talent;
    expect(name).toBe('telepathy');
  });
});
