import { z } from 'zod';

/** Schema for the five common psionic talent names */
export const psiTalentNameSchema = z.enum([
  'telepathy',
  'clairvoyance',
  'telekinesis',
  'awareness',
  'teleportation',
]);

/** Schema for a single psionic power */
export const psiPowerSchema = z.object({
  name: z.string().min(1),
  talent: psiTalentNameSchema,
  psiCost: z.number(),
  range: z.string(),
  description: z.string().min(1),
});

/** Schema for a psionic talent's static data */
export const psiTalentDataSchema = z.object({
  name: psiTalentNameSchema,
  learnDM: z.number().int(),
  powers: z.array(psiPowerSchema),
});

/** Schema for an acquired psionic talent */
export const acquiredPsiTalentSchema = z.object({
  talent: psiTalentNameSchema,
  level: z.number().int().min(0),
  powers: z.array(psiPowerSchema),
});
