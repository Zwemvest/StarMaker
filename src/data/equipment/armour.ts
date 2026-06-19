import type { ArmourItem } from '../../types/equipment';

/**
 * All Core Rulebook armour.
 *
 * Transcribed from the Mongoose Traveller 2E Core Rulebook (Printer Friendly)
 * Armour table (p.94).
 *
 * Conventions:
 *   - "Cr" prefix and thousands commas stripped from cost.
 *   - "-" in the Rad column -> 0.
 *   - Several armour TYPES list more than one variant (one per Tech Level); each
 *     variant becomes its own item, with the name disambiguated by TL so catalog
 *     names stay unique. The Required Skill column is recorded as a trait.
 *   - protection is the numeric Protection rating. Reflec/Ablat carry their
 *     special "vs. lasers" note as a trait since protection is a single number.
 */
export const ARMOUR: readonly ArmourItem[] = [
  { category: 'armour', name: 'Jack', tl: 1, cost: 50, mass: 1, protection: 1, rad: 0, traits: [] },
  { category: 'armour', name: 'Mesh', tl: 6, cost: 150, mass: 2, protection: 2, rad: 0, traits: [] },
  { category: 'armour', name: 'Cloth (TL7)', tl: 7, cost: 250, mass: 10, protection: 5, rad: 0, traits: [] },
  { category: 'armour', name: 'Cloth (TL10)', tl: 10, cost: 500, mass: 5, protection: 8, rad: 0, traits: [] },
  { category: 'armour', name: 'Flak Jacket (TL7)', tl: 7, cost: 100, mass: 8, protection: 3, rad: 0, traits: [] },
  { category: 'armour', name: 'Flak Jacket (TL8)', tl: 8, cost: 300, mass: 6, protection: 5, rad: 0, traits: [] },
  { category: 'armour', name: 'Reflec', tl: 10, cost: 1500, mass: 1, protection: 10, rad: 0, traits: ['Protection vs. lasers only'] },
  { category: 'armour', name: 'Ablat', tl: 9, cost: 75, mass: 2, protection: 1, rad: 0, traits: ['+6 vs. lasers'] },

  // Combat Armour (p.94)
  { category: 'armour', name: 'Combat Armour (TL10)', tl: 10, cost: 96000, mass: 20, protection: 13, rad: 85, traits: ['Vacc Suit 1'] },
  { category: 'armour', name: 'Combat Armour (TL12)', tl: 12, cost: 88000, mass: 16, protection: 17, rad: 145, traits: ['Vacc Suit 0'] },
  { category: 'armour', name: 'Combat Armour (TL14)', tl: 14, cost: 160000, mass: 12, protection: 19, rad: 180, traits: ['Vacc Suit 0'] },

  // Vacc Suit (p.94)
  { category: 'armour', name: 'Vacc Suit (TL8)', tl: 8, cost: 12000, mass: 17, protection: 4, rad: 10, traits: ['Vacc Suit 1'] },
  { category: 'armour', name: 'Vacc Suit (TL10)', tl: 10, cost: 11000, mass: 10, protection: 8, rad: 60, traits: ['Vacc Suit 0'] },
  { category: 'armour', name: 'Vacc Suit (TL12)', tl: 12, cost: 20000, mass: 8, protection: 10, rad: 90, traits: ['Vacc Suit 0'] },

  // Hostile Environment Vacc Suit (p.94)
  { category: 'armour', name: 'Hostile Environment Vacc Suit (TL9)', tl: 9, cost: 24000, mass: 22, protection: 8, rad: 75, traits: ['Vacc Suit 1'] },
  { category: 'armour', name: 'Hostile Environment Vacc Suit (TL10)', tl: 10, cost: 20000, mass: 13, protection: 9, rad: 90, traits: ['Vacc Suit 1'] },
  { category: 'armour', name: 'Hostile Environment Vacc Suit (TL11)', tl: 11, cost: 22000, mass: 13, protection: 12, rad: 140, traits: ['Vacc Suit 0'] },
  { category: 'armour', name: 'Hostile Environment Vacc Suit (TL13)', tl: 13, cost: 40000, mass: 10, protection: 14, rad: 170, traits: ['Vacc Suit 0'] },
  { category: 'armour', name: 'Hostile Environment Vacc Suit (TL14)', tl: 14, cost: 60000, mass: 9, protection: 15, rad: 185, traits: ['Vacc Suit 0'] },

  // Battle Dress (p.94) - powered armour; mass marked * (does not count against
  // encumbrance while powered & active).
  { category: 'armour', name: 'Battle Dress (TL13)', tl: 13, cost: 200000, mass: 100, protection: 22, rad: 245, traits: ['Vacc Suit 2', 'Powered'] },
  { category: 'armour', name: 'Battle Dress (TL14)', tl: 14, cost: 220000, mass: 100, protection: 25, rad: 290, traits: ['Vacc Suit 1', 'Powered'] },
] as const;
