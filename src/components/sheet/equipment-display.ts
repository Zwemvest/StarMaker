import type { Equipment } from '../../types/equipment';

/**
 * Derive the single "key stat" shown next to an equipment item in the
 * Dossier and the final character sheet: weapons show damage, armour shows
 * protection, all other gear shows its tech level.
 *
 * The switch is exhaustive over the {@link Equipment} discriminated union so
 * that adding a future variant fails the build.
 */
export function equipmentKeyStat(item: Equipment): string {
  switch (item.category) {
    case 'weapons':
      return item.damage;
    case 'armour':
      return `Prot ${item.protection}`;
    case 'survival':
    case 'electronics':
    case 'medical':
    case 'tools':
      return `TL${item.tl}`;
    default: {
      const _exhaustive: never = item;
      return _exhaustive;
    }
  }
}
