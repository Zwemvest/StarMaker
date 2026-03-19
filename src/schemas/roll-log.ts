import { z } from 'zod';

/** Valid dice notations */
const diceNotationSchema = z.enum(['1D', '2D', '3D', 'D3', 'D66']);

/** Zod schema for a roll log entry */
export const rollLogEntrySchema = z.object({
  /** UUID v4 identifier */
  id: z.string().uuid(),
  /** Dot-path context, e.g. "characteristics.STR" */
  context: z.string().min(1),
  /** Dice notation used */
  notation: diceNotationSchema,
  /** Individual die results (each positive integer) */
  results: z.array(z.number().int().positive()).min(1),
  /** Sum of results + modifier */
  total: z.number().int(),
  /** Dice modifier applied */
  modifier: z.number().int(),
  /** Target number, or null if no check */
  target: z.number().int().nullable(),
  /** Whether the check succeeded, or null if no check */
  success: z.boolean().nullable(),
  /** Whether override mode was used */
  overridden: z.boolean().default(false),
});

/** Inferred type from the schema */
export type RollLogEntryFromSchema = z.infer<typeof rollLogEntrySchema>;
