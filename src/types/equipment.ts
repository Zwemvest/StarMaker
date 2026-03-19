/** Equipment categories from Mongoose Traveller 2E */
export type EquipmentCategory =
  | 'weapons'
  | 'armour'
  | 'survival'
  | 'electronics'
  | 'medical'
  | 'tools';

/** A single piece of equipment */
export interface Equipment {
  name: string;
  category: EquipmentCategory;
  /** Cost in credits */
  cost: number;
  /** Tech level required */
  tl: number;
  /** Equipment traits/properties */
  traits: string[];
}
