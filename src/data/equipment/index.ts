import type { Equipment } from '../../types/equipment';
import { WEAPONS } from './weapons';
import { ARMOUR } from './armour';
import { SURVIVAL } from './survival';
import { ELECTRONICS } from './electronics';
import { MEDICAL } from './medical';
import { TOOLS } from './tools';

export { WEAPONS, ARMOUR, SURVIVAL, ELECTRONICS, MEDICAL, TOOLS };

/**
 * The full Core Rulebook equipment catalog (all six categories concatenated).
 *
 * Transcribed from the Mongoose Traveller 2E Core Rulebook (Printer Friendly)
 * Equipment chapter. Item names are unique across the catalog, so they can be
 * used as identity keys by the store.
 */
export const EQUIPMENT_CATALOG: readonly Equipment[] = [
  ...WEAPONS,
  ...ARMOUR,
  ...SURVIVAL,
  ...ELECTRONICS,
  ...MEDICAL,
  ...TOOLS,
];
