import type { GearItem } from '../../types/equipment';

/**
 * Medical and care supplies from the Mongoose Traveller 2E Core Rulebook
 * (Printer Friendly) Equipment chapter (Medical and Care Supplies, p.108-109).
 *
 * The medikit comes in four Tech Level variants (p.109); each is its own item.
 * All medikits mass 1 kg except the TL14 kit, which has an effective mass of
 * 0 kg. The drugs (p.109) have no listed mass, so mass is 0; costs are the
 * per-dose prices from the book. Names are unique across the catalog.
 */
export const MEDICAL: readonly GearItem[] = [
  { category: 'medical', name: 'Cryoberth', tl: 10, cost: 50000, mass: 200, traits: [], description: 'A coffin-like machine that freezes and preserves its occupant almost instantly, placing a severely injured Traveller into stasis until medical treatment is available.' }, // p.109
  { category: 'medical', name: 'Medikit (TL8)', tl: 8, cost: 1000, mass: 1, traits: [], description: 'A field medical kit with diagnostic devices, surgical tools, drugs and antibiotics; can test blood pressure and temperature.' }, // p.109
  { category: 'medical', name: 'Medikit (TL10)', tl: 10, cost: 1500, mass: 1, traits: [], description: 'An advanced field medical kit granting DM+1 on Medic checks performed for first aid.' }, // p.109
  { category: 'medical', name: 'Medikit (TL12)', tl: 12, cost: 5000, mass: 1, traits: [], description: 'An advanced field medical kit granting DM+2 on Medic checks performed for first aid.' }, // p.109
  { category: 'medical', name: 'Medikit (TL14)', tl: 14, cost: 10000, mass: 0, traits: [], description: 'A top-tier field medical kit with a medical densitometer and quantum-level brain scanning, granting DM+3 on Medic checks performed for first aid.' }, // p.109

  // --- Drugs (p.109) ---
  { category: 'medical', name: 'Anagathics', tl: 15, cost: 20000, mass: 0, traits: [], description: 'Drugs that slow the user\'s ageing process. One dose must be taken each month to maintain the effect; illegal or heavily controlled on many worlds. Price per dose.' }, // p.109
  { category: 'medical', name: 'Anti-Rad', tl: 8, cost: 1000, mass: 0, traits: [], description: 'A drug that absorbs up to 100 rads per dose if administered before or within ten minutes after radiation exposure. Usable only once per day. Price per dose.' }, // p.109
  { category: 'medical', name: 'Combat Drugs', tl: 10, cost: 1000, mass: 0, traits: [], description: 'Drugs that grant DM+4 to initiative, a free reaction each round and -2 to damage sustained for about ten minutes, leaving the user Fatigued afterwards. Price per dose.' }, // p.109
  { category: 'medical', name: 'Fast Drug', tl: 10, cost: 200, mass: 0, traits: [], description: 'Also called Hibernation; slows the user\'s metabolism to a ratio of 60 to 1, prolonging life support reserves or acting as a cheap substitute for a cryoberth. Price per dose.' }, // p.109
  { category: 'medical', name: 'Medicinal Drugs', tl: 5, cost: 5, mass: 0, traits: [], description: 'Vaccines, antitoxins and antibiotics. Cost ranges from Cr5 to several thousand depending on rarity; require the Medic skill to use properly. Price per dose (minimum).' }, // p.109
  { category: 'medical', name: 'Metabolic Accelerator', tl: 10, cost: 500, mass: 0, traits: [], description: 'Drugs boosting reaction time to superhuman levels, granting DM+8 to initiative and two free reactions per round for about ten minutes; the user crashes afterwards (2D damage, Fatigued). Price per dose.' }, // p.109
  { category: 'medical', name: 'Panaceas', tl: 8, cost: 200, mass: 0, traits: [], description: 'Wide-spectrum medicinal drugs designed not to interact harmfully; a user may make a Medic check as if Medic 0 when treating infection or disease. Price per dose.' }, // p.109
  { category: 'medical', name: 'Slow Drug', tl: 11, cost: 500, mass: 0, traits: [], description: 'A medical drug that raises metabolism to around thirty times normal, allowing a month of healing in a single day, but only safely in a medical facility. Price per dose.' }, // p.109
  { category: 'medical', name: 'Stims', tl: 8, cost: 50, mass: 0, traits: [], description: 'Drugs that remove Fatigue at the cost of one point of damage (cumulative if used repeatedly without natural sleep). Price per dose.' }, // p.109
] as const;
