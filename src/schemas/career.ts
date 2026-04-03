import { z } from 'zod';

/** Schema for characteristic IDs used in check targets */
const characteristicIdSchema = z.enum(['STR', 'DEX', 'END', 'INT', 'EDU', 'SOC']);

/** Schema for a check target (characteristic + target number) */
const checkTargetSchema = z.object({
  characteristic: characteristicIdSchema,
  target: z.number().int(),
});

/** Schema for a skill entry: plain string or { name, specialty? } */
const skillEntrySchema = z.union([
  z.string().min(1),
  z.object({
    name: z.string().min(1),
    specialty: z.string().min(1).optional(),
  }),
]);

/** Schema for event effect types */
const eventEffectTypeSchema = z.enum([
  'skill', 'characteristic', 'contact', 'ally', 'rival',
  'enemy', 'choice', 'special', 'benefit', 'injury',
]);

/** Schema for an event effect */
const eventEffectSchema = z.object({
  type: eventEffectTypeSchema,
  detail: z.string(),
  options: z.array(z.string()).optional(),
});

/** Schema for assignment data */
const assignmentDataSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  survival: checkTargetSchema,
  advancement: checkTargetSchema,
  specialistSkills: z.array(skillEntrySchema).length(6),
});

/** Schema for a rank entry */
const rankEntrySchema = z.object({
  level: z.number().int().min(0).max(6),
  title: z.string(),
  bonusSkill: z.string().nullable(),
  bonusSkillLevel: z.number().int().min(0).max(1).optional(),
});

/** Schema for a career event entry (2D table, rolls 2-12) */
const careerEventEntrySchema = z.object({
  rollValue: z.number().int().min(2).max(12),
  description: z.string().min(1),
  effectDescription: z.string().min(1),
  effects: z.array(eventEffectSchema),
  hasChoice: z.boolean(),
});

/** Schema for a mishap entry (1D table, rolls 1-6) */
const mishapEntrySchema = z.object({
  rollValue: z.number().int().min(1).max(6),
  description: z.string().min(1),
  effectDescription: z.string().min(1),
  effects: z.array(eventEffectSchema),
});

/** Schema for mustering out tables */
const musteringOutTableSchema = z.object({
  cash: z.array(z.number()).length(7),
  benefits: z.array(z.string().min(1)).length(7),
});

/** Schema for skill tables */
const skillTablesSchema = z.object({
  personalDevelopment: z.array(skillEntrySchema).length(6),
  serviceSkills: z.array(skillEntrySchema).length(6),
  advancedEducation: z.array(skillEntrySchema).length(6),
  officer: z.array(skillEntrySchema).length(6).nullable(),
});

/** Schema for rank tables */
const rankTablesSchema = z.object({
  enlisted: z.array(rankEntrySchema).length(7),
  officer: z.array(rankEntrySchema).length(7).nullable(),
});

/** Career name enum schema */
const careerNameSchema = z.enum([
  'agent', 'army', 'citizen', 'drifter', 'entertainer', 'marine',
  'merchant', 'navy', 'noble', 'rogue', 'scholar', 'scout',
]);

/** Top-level career data schema for validating career JSON files */
export const careerSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  qualification: checkTargetSchema.nullable(),
  assignments: z.array(assignmentDataSchema).length(3),
  isMilitary: z.boolean(),
  commission: checkTargetSchema.nullable(),
  ranks: rankTablesSchema,
  skillTables: skillTablesSchema,
  events: z.array(careerEventEntrySchema).length(11),
  mishaps: z.array(mishapEntrySchema).length(6),
  musteringOut: musteringOutTableSchema,
  basicTrainingException: z.boolean(),
});

/** Inferred type from the schema */
export type CareerDataFromSchema = z.infer<typeof careerSchema>;
