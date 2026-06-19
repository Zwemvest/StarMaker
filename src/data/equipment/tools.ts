import type { GearItem } from '../../types/equipment';

/**
 * Toolkits from the Mongoose Traveller 2E Core Rulebook (Printer Friendly)
 * Equipment chapter (Toolkits table, p.113).
 *
 * Each toolkit contains diagnostic sensors, hand tools, computer analysis
 * programs and spare parts for a specific technical skill. The table gives
 * TL / KG / Cost per kit; the descriptions are transcribed from the per-kit
 * notes on p.113. "Cr" prefix stripped from cost.
 */
export const TOOLS: readonly GearItem[] = [
  { category: 'tools', name: 'Electronics Toolkit', tl: 7, cost: 2000, mass: 2, traits: [], description: 'A toolkit for the Electronics skill, required for performing repairs and installing new equipment.' }, // p.113
  { category: 'tools', name: 'Engineering Toolkit', tl: 12, cost: 4000, mass: 12, traits: [], description: 'A toolkit for the Engineering skill, required for performing repairs and installing new equipment.' }, // p.113
  { category: 'tools', name: 'Forensics Toolkit', tl: 8, cost: 2000, mass: 12, traits: [], description: 'A toolkit required for investigating crime scenes and testing samples.' }, // p.113
  { category: 'tools', name: 'Mechanical Toolkit', tl: 5, cost: 1000, mass: 12, traits: [], description: 'A toolkit required for mechanical repairs and construction.' }, // p.113
  { category: 'tools', name: 'Scientific Toolkit', tl: 5, cost: 2000, mass: 8, traits: [], description: 'A toolkit required for scientific testing and analysis.' }, // p.113
  { category: 'tools', name: 'Surveying Toolkit', tl: 6, cost: 1000, mass: 12, traits: [], description: 'A toolkit required for planetary surveys or mapping.' }, // p.113
] as const;
