import { z } from 'zod';
import { rollLogEntrySchema } from './roll-log';

/** Schema for the six core characteristics (each 0-15 integer) */
export const characteristicsSchema = z.object({
  STR: z.number().int().min(0).max(15),
  DEX: z.number().int().min(0).max(15),
  END: z.number().int().min(0).max(15),
  INT: z.number().int().min(0).max(15),
  EDU: z.number().int().min(0).max(15),
  SOC: z.number().int().min(0).max(15),
});

/** Schema for a skill */
const skillSchema = z.object({
  name: z.string().min(1),
  level: z.number().int().min(0),
});

/** Schema for character biographical info */
const characterInfoSchema = z.object({
  name: z.string().min(1),
  age: z.number().int().min(18),
  title: z.string().nullable(),
  credits: z.number().int().min(0),
  pension: z.number().int().min(0),
});

/** Schema for a contact */
const contactSchema = z.object({
  type: z.enum(['contact', 'ally', 'rival', 'enemy']),
  name: z.string().min(1),
  notes: z.string(),
});

/** Schema for a career term */
const careerTermSchema = z.object({
  career: z.enum([
    'agent', 'army', 'citizen', 'drifter', 'entertainer', 'marine',
    'merchant', 'navy', 'noble', 'rogue', 'scholar', 'scout',
  ]),
  assignment: z.string(),
  term: z.number().int().min(1),
  rank: z.number().int().min(0),
  skills: z.array(skillSchema),
  events: z.array(z.string()),
});

/** Full character schema */
export const characterSchema = z.object({
  id: z.string().uuid(),
  info: characterInfoSchema,
  characteristics: characteristicsSchema,
  skills: z.array(skillSchema),
  careers: z.array(careerTermSchema),
  contacts: z.array(contactSchema),
  rollLog: z.array(rollLogEntrySchema),
  legitimacyHash: z.string(),
  isModified: z.boolean(),
  createdAt: z.string(),
});

/** Inferred types from schemas */
export type CharacteristicsFromSchema = z.infer<typeof characteristicsSchema>;
export type CharacterFromSchema = z.infer<typeof characterSchema>;
