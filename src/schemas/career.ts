import { z } from 'zod';

/** Schema for a skill entry: either a simple string or an object with name and optional specialty */
export const skillEntrySchema = z.union([
  z.string(),
  z.object({
    name: z.string(),
    specialty: z.string().optional(),
  }),
]);

/** Schema for an assignment within a career */
const assignmentSchema = z.object({
  name: z.string(),
  description: z.string(),
  survival: z.object({
    characteristic: z.string(),
    target: z.number().int(),
  }),
  advancement: z.object({
    characteristic: z.string(),
    target: z.number().int(),
  }),
  specialistSkills: z.array(skillEntrySchema).length(6),
});

/** Schema for a rank entry */
const rankSchema = z.object({
  level: z.number().int().min(0).max(6),
  title: z.string(),
  bonusSkill: z.string().nullable(),
  bonusSkillLevel: z.number().int().min(0).max(1).optional(),
});

/** Schema for event effects */
const eventEffectSchema = z.object({
  type: z.enum([
    'skill',
    'characteristic',
    'contact',
    'ally',
    'rival',
    'enemy',
    'choice',
    'special',
    'benefit',
    'injury',
  ]),
  detail: z.string(),
  options: z.array(z.string()).optional(),
});

/** Schema for a career event (2D table, rolls 2-12) */
const careerEventSchema = z.object({
  rollValue: z.number().int().min(2).max(12),
  description: z.string(),
  effectDescription: z.string(),
  effects: z.array(eventEffectSchema),
  hasChoice: z.boolean(),
});

/** Schema for a mishap (1D table, rolls 1-6) */
const mishapSchema = z.object({
  rollValue: z.number().int().min(1).max(6),
  description: z.string(),
  effectDescription: z.string(),
  effects: z.array(eventEffectSchema),
});

/** Schema for the mustering out table */
const musteringOutTableSchema = z.object({
  cash: z.array(z.number().int()).length(7),
  benefits: z.array(z.string()).length(7),
});

/** Full career data schema — validates all 12 career JSON files */
export const careerSchema = z.object({
  name: z.string(),
  description: z.string(),
  qualification: z
    .object({
      characteristic: z.string(),
      target: z.number().int(),
    })
    .nullable(),
  assignments: z.array(assignmentSchema).length(3),
  isMilitary: z.boolean(),
  commission: z
    .object({
      characteristic: z.string(),
      target: z.number().int(),
    })
    .nullable(),
  ranks: z.object({
    enlisted: z.array(rankSchema),
    officer: z.array(rankSchema).optional(),
  }),
  skillTables: z.object({
    personalDevelopment: z.array(skillEntrySchema).length(6),
    serviceSkills: z.array(skillEntrySchema).length(6),
    advancedEducation: z.array(skillEntrySchema).length(6),
    officer: z.array(skillEntrySchema).length(6).optional(),
  }),
  events: z.array(careerEventSchema).length(11),
  mishaps: z.array(mishapSchema).length(6),
  musteringOut: musteringOutTableSchema,
  basicTrainingException: z.boolean().default(false),
});

/** Inferred type from the career schema */
export type CareerDataFromSchema = z.infer<typeof careerSchema>;
