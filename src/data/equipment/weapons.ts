import type { WeaponItem } from '../../types/equipment';

/**
 * All Core Rulebook melee + ranged weapons.
 *
 * Transcribed from the Mongoose Traveller 2E Core Rulebook (Printer Friendly)
 * Equipment chapter:
 *   - Melee Weapons table     (p.116)
 *   - Slug Throwers table     (p.118)
 *   - Energy Weapons table    (p.121)
 *   - Grenade Weapons table   (p.123)
 *   - Heavy Weapons table     (p.125)
 *   - Explosives table        (p.127)
 *
 * Conventions:
 *   - Melee weapons: range 'Melee', magazine/magazineCost both null.
 *   - "Cr" prefix and thousands commas stripped from cost ("Cr1,500" -> 1500).
 *   - Blank / "-" mass -> 0.
 *   - For the energy weapons table the book's "Power Pack Cost" column is the
 *     magazineCost; the magazine size is its Magazine column.
 *   - Where a weapon appears at several Tech Levels the name is disambiguated
 *     with its TL so catalog names stay unique.
 */
export const WEAPONS: readonly WeaponItem[] = [
  // --- Melee Weapons (p.116) ---
  { category: 'weapons', name: 'Blade', tl: 2, cost: 100, mass: 2, range: 'Melee', damage: '2D', magazine: null, magazineCost: null, traits: [] },
  { category: 'weapons', name: 'Broadsword', tl: 2, cost: 500, mass: 8, range: 'Melee', damage: '4D', magazine: null, magazineCost: null, traits: ['Bulky'] },
  { category: 'weapons', name: 'Club', tl: 1, cost: 0, mass: 3, range: 'Melee', damage: '2D', magazine: null, magazineCost: null, traits: [] },
  { category: 'weapons', name: 'Cutlass', tl: 2, cost: 200, mass: 4, range: 'Melee', damage: '3D', magazine: null, magazineCost: null, traits: [] },
  { category: 'weapons', name: 'Dagger', tl: 1, cost: 10, mass: 1, range: 'Melee', damage: '1D+2', magazine: null, magazineCost: null, traits: [] },
  { category: 'weapons', name: 'Improvised Weapon', tl: 0, cost: 0, mass: 0, range: 'Melee', damage: '2D-2', magazine: null, magazineCost: null, traits: [] },
  { category: 'weapons', name: 'Rapier', tl: 3, cost: 200, mass: 2, range: 'Melee', damage: '2D', magazine: null, magazineCost: null, traits: [] },
  { category: 'weapons', name: 'Shield', tl: 1, cost: 150, mass: 6, range: 'Melee', damage: '1D', magazine: null, magazineCost: null, traits: [] },
  { category: 'weapons', name: 'Staff', tl: 1, cost: 0, mass: 3, range: 'Melee', damage: '2D', magazine: null, magazineCost: null, traits: [] },
  { category: 'weapons', name: 'Stunstick', tl: 8, cost: 300, mass: 1, range: 'Melee', damage: '2D', magazine: null, magazineCost: null, traits: ['Stun'] },
  { category: 'weapons', name: 'Unarmed', tl: 0, cost: 0, mass: 0, range: 'Melee', damage: '1D', magazine: null, magazineCost: null, traits: [] },

  // --- Slug Throwers: Pistols (p.118) ---
  { category: 'weapons', name: 'Antique Pistol', tl: 3, cost: 100, mass: 1, range: '5m', damage: '2D-3', magazine: 1, magazineCost: 5, traits: [] },
  { category: 'weapons', name: 'Autopistol', tl: 6, cost: 200, mass: 1, range: '10m', damage: '3D-3', magazine: 15, magazineCost: 10, traits: [] },
  { category: 'weapons', name: 'Body Pistol', tl: 8, cost: 500, mass: 0, range: '5m', damage: '2D', magazine: 6, magazineCost: 10, traits: [] },
  { category: 'weapons', name: 'Gauss Pistol', tl: 13, cost: 500, mass: 1, range: '20m', damage: '3D', magazine: 40, magazineCost: 20, traits: ['AP 3', 'Auto 2'] },
  { category: 'weapons', name: 'Revolver', tl: 5, cost: 150, mass: 1, range: '10m', damage: '3D-3', magazine: 6, magazineCost: 5, traits: [] },
  { category: 'weapons', name: 'Snub Pistol', tl: 8, cost: 150, mass: 0, range: '5m', damage: '3D-3', magazine: 6, magazineCost: 10, traits: ['Zero-G'] },

  // --- Slug Throwers: Rifles (p.118) ---
  { category: 'weapons', name: 'Accelerator Rifle', tl: 9, cost: 900, mass: 2, range: '250m', damage: '3D', magazine: 15, magazineCost: 30, traits: ['Zero-G'] },
  { category: 'weapons', name: 'Advanced Combat Rifle', tl: 10, cost: 1000, mass: 3, range: '450m', damage: '3D', magazine: 40, magazineCost: 15, traits: ['Auto 3', 'Scope'] },
  { category: 'weapons', name: 'Antique Rifle', tl: 3, cost: 150, mass: 6, range: '25m', damage: '3D-3', magazine: 1, magazineCost: 10, traits: [] },
  { category: 'weapons', name: 'Assault Rifle', tl: 7, cost: 500, mass: 4, range: '200m', damage: '3D', magazine: 30, magazineCost: 15, traits: ['Auto 2'] },
  { category: 'weapons', name: 'Autorifle', tl: 6, cost: 750, mass: 5, range: '300m', damage: '3D', magazine: 20, magazineCost: 10, traits: ['Auto 2'] },
  { category: 'weapons', name: 'Gauss Rifle', tl: 12, cost: 1500, mass: 4, range: '600m', damage: '4D', magazine: 80, magazineCost: 40, traits: ['AP 5', 'Auto 3', 'Scope'] },
  { category: 'weapons', name: 'Rifle', tl: 5, cost: 200, mass: 5, range: '250m', damage: '3D', magazine: 5, magazineCost: 10, traits: [] },
  { category: 'weapons', name: 'Shotgun', tl: 4, cost: 200, mass: 4, range: '50m', damage: '4D', magazine: 6, magazineCost: 10, traits: ['Bulky'] },
  { category: 'weapons', name: 'Submachine Gun', tl: 6, cost: 400, mass: 3, range: '25m', damage: '3D', magazine: 20, magazineCost: 10, traits: ['Auto 3'] },

  // --- Energy Weapons: Pistols (p.121) (magazineCost = Power Pack Cost) ---
  { category: 'weapons', name: 'Laser Pistol (TL9)', tl: 9, cost: 2000, mass: 3, range: '20m', damage: '3D', magazine: 100, magazineCost: 1000, traits: ['Zero-G'] },
  { category: 'weapons', name: 'Laser Pistol (TL11)', tl: 11, cost: 3000, mass: 2, range: '30m', damage: '3D+3', magazine: 100, magazineCost: 3000, traits: ['Zero-G'] },
  { category: 'weapons', name: 'Stunner (TL8)', tl: 8, cost: 500, mass: 0.5, range: '5m', damage: '2D', magazine: 100, magazineCost: 200, traits: ['Stun', 'Zero-G'] },
  { category: 'weapons', name: 'Stunner (TL10)', tl: 10, cost: 750, mass: 0.5, range: '5m', damage: '2D+3', magazine: 100, magazineCost: 200, traits: ['Stun', 'Zero-G'] },
  { category: 'weapons', name: 'Stunner (TL12)', tl: 12, cost: 1000, mass: 0.5, range: '10m', damage: '3D', magazine: 100, magazineCost: 200, traits: ['Stun', 'Zero-G'] },

  // --- Energy Weapons: Rifles (p.121) ---
  { category: 'weapons', name: 'Laser Carbine (TL9)', tl: 9, cost: 2500, mass: 4, range: '150m', damage: '4D', magazine: 50, magazineCost: 1000, traits: ['Zero-G'] },
  { category: 'weapons', name: 'Laser Carbine (TL11)', tl: 11, cost: 4000, mass: 3, range: '200m', damage: '4D+3', magazine: 50, magazineCost: 3000, traits: ['Zero-G'] },
  { category: 'weapons', name: 'Laser Rifle (TL9)', tl: 9, cost: 3500, mass: 8, range: '200m', damage: '5D', magazine: 100, magazineCost: 1500, traits: ['Zero-G'] },
  { category: 'weapons', name: 'Laser Rifle (TL11)', tl: 11, cost: 8000, mass: 5, range: '400m', damage: '5D+3', magazine: 100, magazineCost: 3500, traits: ['Zero-G'] },
  { category: 'weapons', name: 'Laser Sniper Rifle', tl: 12, cost: 9000, mass: 6, range: '600m', damage: '5D+3', magazine: 6, magazineCost: 250, traits: ['Scope', 'Zero-G'] },
  { category: 'weapons', name: 'Plasma Rifle', tl: 16, cost: 100000, mass: 6, range: '300m', damage: '6D', magazine: null, magazineCost: null, traits: [] },

  // --- Grenade Weapons (p.123) ---
  { category: 'weapons', name: 'Aerosol Grenade', tl: 9, cost: 15, mass: 0.5, range: '20m', damage: '0', magazine: null, magazineCost: null, traits: ['Blast 9'] },
  { category: 'weapons', name: 'Frag Grenade', tl: 6, cost: 30, mass: 0.5, range: '20m', damage: '5D', magazine: null, magazineCost: null, traits: ['Blast 9'] },
  { category: 'weapons', name: 'Smoke Grenade', tl: 6, cost: 15, mass: 0.5, range: '20m', damage: '0', magazine: null, magazineCost: null, traits: ['Blast 9'] },
  { category: 'weapons', name: 'Stun Grenade', tl: 7, cost: 30, mass: 0.5, range: '20m', damage: '3D', magazine: null, magazineCost: null, traits: ['Blast 9', 'Stun'] },

  // --- Heavy Weapons (p.125) ---
  { category: 'weapons', name: 'FGMP (TL14)', tl: 14, cost: 100000, mass: 12, range: '450m', damage: '2DD', magazine: null, magazineCost: null, traits: ['Radiation', 'Very Bulky'] },
  { category: 'weapons', name: 'FGMP (TL15)', tl: 15, cost: 400000, mass: 12, range: '450m', damage: '2DD', magazine: null, magazineCost: null, traits: ['Bulky', 'Radiation'] },
  { category: 'weapons', name: 'FGMP (TL16)', tl: 16, cost: 500000, mass: 15, range: '450m', damage: '2DD', magazine: null, magazineCost: null, traits: ['Radiation'] },
  { category: 'weapons', name: 'Grenade Launcher', tl: 7, cost: 400, mass: 6, range: '100m', damage: 'As grenade', magazine: 6, magazineCost: null, traits: ['Bulky'] },
  { category: 'weapons', name: 'Machinegun', tl: 6, cost: 1500, mass: 12, range: '500m', damage: '3D', magazine: 60, magazineCost: 100, traits: ['Auto 4'] },
  { category: 'weapons', name: 'PGMP (TL12)', tl: 12, cost: 20000, mass: 10, range: '250m', damage: '1DD', magazine: null, magazineCost: null, traits: ['Very Bulky'] },
  { category: 'weapons', name: 'PGMP (TL13)', tl: 13, cost: 65000, mass: 10, range: '450m', damage: '1DD', magazine: null, magazineCost: null, traits: ['Bulky'] },
  { category: 'weapons', name: 'PGMP (TL14)', tl: 14, cost: 100000, mass: 10, range: '450m', damage: '1DD', magazine: null, magazineCost: null, traits: [] },
  { category: 'weapons', name: 'RAM Grenade Launcher', tl: 8, cost: 800, mass: 2, range: '250m', damage: 'As grenade', magazine: 6, magazineCost: null, traits: ['Auto 3', 'Bulky'] },
  { category: 'weapons', name: 'Rocket Launcher (TL6)', tl: 6, cost: 2000, mass: 8, range: '120m', damage: '4D', magazine: 1, magazineCost: 300, traits: ['Blast 6'] },
  { category: 'weapons', name: 'Rocket Launcher (TL7)', tl: 7, cost: 2000, mass: 8, range: '150m', damage: '4D+3', magazine: 1, magazineCost: 400, traits: ['Blast 6', 'Smart'] },
  { category: 'weapons', name: 'Rocket Launcher (TL8)', tl: 8, cost: 2000, mass: 8, range: '200m', damage: '5D', magazine: 2, magazineCost: 600, traits: ['Blast 6', 'Scope', 'Smart'] },
  { category: 'weapons', name: 'Rocket Launcher (TL9)', tl: 9, cost: 2000, mass: 8, range: '250m', damage: '5D+6', magazine: 2, magazineCost: 800, traits: ['Blast 6', 'Scope', 'Smart'] },

  // --- Explosives (p.127) (no range / placed weapons) ---
  { category: 'weapons', name: 'Plastic Explosive', tl: 6, cost: 200, mass: 0, range: 'Placed', damage: '3D', magazine: null, magazineCost: null, traits: ['Blast 9'] },
  { category: 'weapons', name: 'Pocket Nuke', tl: 12, cost: 250000, mass: 4, range: 'Placed', damage: '6DD', magazine: null, magazineCost: null, traits: ['Blast 1000', 'Radiation'] },
  { category: 'weapons', name: 'TDX', tl: 12, cost: 1000, mass: 0, range: 'Placed', damage: '4D', magazine: null, magazineCost: null, traits: ['Blast 15'] },
] as const;
