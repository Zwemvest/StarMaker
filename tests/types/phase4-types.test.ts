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
