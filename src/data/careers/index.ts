import { careerSchema } from '../../schemas/career';
import type { CareerName, CareerData } from '../../types/careers';

// Static JSON imports for Vite bundling
import agentJson from './agent.json';
import armyJson from './army.json';
import citizenJson from './citizen.json';
import drifterJson from './drifter.json';
import entertainerJson from './entertainer.json';
import marineJson from './marine.json';
import merchantJson from './merchant.json';
import navyJson from './navy.json';
import nobleJson from './noble.json';
import rogueJson from './rogue.json';
import scholarJson from './scholar.json';
import scoutJson from './scout.json';

const RAW_CAREERS: Record<CareerName, unknown> = {
  agent: agentJson,
  army: armyJson,
  citizen: citizenJson,
  drifter: drifterJson,
  entertainer: entertainerJson,
  marine: marineJson,
  merchant: merchantJson,
  navy: navyJson,
  noble: nobleJson,
  rogue: rogueJson,
  scholar: scholarJson,
  scout: scoutJson,
};

/** All 12 careers validated through Zod on import */
export const CAREERS: Record<CareerName, CareerData> = Object.fromEntries(
  Object.entries(RAW_CAREERS).map(([key, raw]) => {
    const parsed = careerSchema.parse(raw);
    return [key, parsed as CareerData];
  }),
) as Record<CareerName, CareerData>;

/** Get a specific career by name */
export function getCareer(name: CareerName): CareerData {
  return CAREERS[name];
}

/** All career names for iteration */
export const ALL_CAREER_NAMES: readonly CareerName[] = [
  'agent',
  'army',
  'citizen',
  'drifter',
  'entertainer',
  'marine',
  'merchant',
  'navy',
  'noble',
  'rogue',
  'scholar',
  'scout',
] as const;
