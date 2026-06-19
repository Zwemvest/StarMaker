/** Equipment categories from Mongoose Traveller 2E */
export type EquipmentCategory =
  | 'weapons'
  | 'armour'
  | 'survival'
  | 'electronics'
  | 'medical'
  | 'tools';

/** Fields shared by every piece of equipment */
interface EquipmentBase {
  name: string;
  tl: number;
  /** Cost in credits */
  cost: number;
  /** Mass in kg */
  mass: number;
  traits: string[];
}

/** A weapon, with combat stats */
export interface WeaponItem extends EquipmentBase {
  category: 'weapons';
  /** e.g. "Melee", "10m", "50m" */
  range: string;
  /** e.g. "3D", "2D-2" */
  damage: string;
  magazine: number | null;
  magazineCost: number | null;
}

/** A suit or piece of armour */
export interface ArmourItem extends EquipmentBase {
  category: 'armour';
  protection: number;
  rad: number;
}

/** Generic gear (survival, electronics, medical, tools) */
export interface GearItem extends EquipmentBase {
  category: 'survival' | 'electronics' | 'medical' | 'tools';
  description: string;
}

/** A single piece of equipment, discriminated by category */
export type Equipment = WeaponItem | ArmourItem | GearItem;

/** An owned piece of equipment with a quantity (used by store/sheet) */
export interface OwnedEquipment {
  item: Equipment;
  quantity: number;
}
