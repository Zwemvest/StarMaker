import type { GearItem } from '../../types/equipment';

/**
 * Survival / field gear from the Mongoose Traveller 2E Core Rulebook
 * (Printer Friendly).
 *
 * Stats (TL / KG / Cost) come from the Survival Gear table (p.112); the
 * descriptions are transcribed from the item write-ups on pages 114-115.
 *
 * Conventions:
 *   - "Cr" prefix and thousands commas stripped from cost.
 *   - "-" mass -> 0.
 *   - Items appearing at two Tech Levels (Habitat Module, Breather Mask,
 *     Respirator, Tent) are split into one item per variant, with the name
 *     disambiguated by TL so catalog names stay unique.
 */
export const SURVIVAL: readonly GearItem[] = [
  { category: 'survival', name: 'Artificial Gill', tl: 8, cost: 4000, mass: 4, traits: [], description: 'Extracts oxygen from water, allowing the wearer to breathe underwater. Only works on worlds with breathable atmospheres (type 4-9).' }, // p.114
  { category: 'survival', name: 'Environment Suit', tl: 8, cost: 500, mass: 1, traits: [], description: 'A suit with hood, gloves and boots that protects the wearer from extreme cold or heat, leaving the face exposed. A mask or rebreather can be attached.' }, // p.114
  { category: 'survival', name: 'Grav Belt', tl: 12, cost: 100000, mass: 6, traits: [], description: 'A harness with artificial gravity modules that lets the wearer fly at Medium speed. The internal battery lasts four hours before recharging.' }, // p.114
  { category: 'survival', name: 'Habitat Module (TL8)', tl: 8, cost: 10000, mass: 1000, traits: [], description: 'Modular unpressurised quarters for six people, able to withstand anything short of hurricane-force winds. Includes survival rations and battery power.' }, // p.112/114
  { category: 'survival', name: 'Habitat Module (TL10)', tl: 10, cost: 20000, mass: 500, traits: [], description: 'A pressurised habitat module for six people, with life-support for one week (1000 person/hours).' }, // p.112/114
  { category: 'survival', name: 'Filter Mask', tl: 7, cost: 100, mass: 0, traits: [], description: 'A breathing mask that strips harmful elements such as dangerous gases or dust particles from the air the character inhales.' }, // p.114
  { category: 'survival', name: 'Breather Mask (TL8)', tl: 8, cost: 150, mass: 0, traits: [], description: 'Combines a filter and a respirator into a single package.' }, // p.112/114
  { category: 'survival', name: 'Breather Mask (TL10)', tl: 10, cost: 2000, mass: 0, traits: [], description: 'An advanced breather mask whose filter is small enough to fit into the nose, or even be a lung implant.' }, // p.112/114
  { category: 'survival', name: 'Portable Fusion Generator', tl: 10, cost: 500000, mass: 20, traits: [], description: 'A light-duty portable fusion generator capable of recharging weapons and other equipment for up to one month of use.' }, // p.115
  { category: 'survival', name: 'Rescue Bubble', tl: 9, cost: 600, mass: 2, traits: [], description: 'A 2-metre plastic bubble that recharges from the user\'s movements, powers a distress beacon and provides two person/hours of life support. Serves as an emergency lifeboat on space and sea vessels.' }, // p.115
  { category: 'survival', name: 'Respirator (TL6)', tl: 6, cost: 100, mass: 0, traits: [], description: 'A rebreather that concentrates inhaled oxygen, allowing a Traveller to breathe on worlds with a thin atmosphere. Takes the form of a face mask or mouthpiece.' }, // p.112/115
  { category: 'survival', name: 'Respirator (TL10)', tl: 10, cost: 2000, mass: 0, traits: [], description: 'An advanced respirator small enough to fit into the nose, or even be a lung implant.' }, // p.112/115
  { category: 'survival', name: 'Tent (TL3)', tl: 3, cost: 200, mass: 6, traits: [], description: 'A basic tent that provides shelter for two people against the weather.' }, // p.112/115
  { category: 'survival', name: 'Tent (TL7)', tl: 7, cost: 2000, mass: 5, traits: [], description: 'A pressurised tent for two people. It has no airlock and is depressurised when opened.' }, // p.112/115
] as const;
