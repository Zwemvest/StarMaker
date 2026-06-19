import { z } from 'zod';

/** Fields shared by every equipment variant */
const equipmentBaseFields = {
  name: z.string().min(1),
  tl: z.number().int(),
  /** Cost in credits */
  cost: z.number(),
  /** Mass in kg */
  mass: z.number(),
  traits: z.array(z.string()),
};

/** Weapon variant: combat stats */
const weaponSchema = z.object({
  ...equipmentBaseFields,
  category: z.literal('weapons'),
  range: z.string(),
  damage: z.string(),
  magazine: z.number().nullable(),
  magazineCost: z.number().nullable(),
});

/** Armour variant: protection + radiation rating */
const armourSchema = z.object({
  ...equipmentBaseFields,
  category: z.literal('armour'),
  protection: z.number(),
  rad: z.number(),
});

/**
 * Generic gear variant. Gear spans four categories; z.discriminatedUnion
 * needs a single literal discriminator per member, so we expand gear into
 * one literal member per category.
 */
const gearCategories = ['survival', 'electronics', 'medical', 'tools'] as const;
const gearSchemas = gearCategories.map((category) =>
  z.object({
    ...equipmentBaseFields,
    category: z.literal(category),
    description: z.string(),
  }),
);

/** Discriminated union validating every equipment variant */
export const equipmentSchema = z.discriminatedUnion('category', [
  weaponSchema,
  armourSchema,
  ...gearSchemas,
]);

/** Schema for a catalog (array) of equipment */
export const equipmentCatalogSchema = z.array(equipmentSchema);

/** Inferred type from the schema */
export type EquipmentFromSchema = z.infer<typeof equipmentSchema>;
