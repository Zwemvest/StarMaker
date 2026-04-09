/**
 * Dice engine for Mongoose Traveller 2E.
 * Uses crypto.getRandomValues() with rejection sampling to avoid modulo bias.
 */

/**
 * Roll a single die with the given number of sides.
 * Uses rejection sampling for unbiased results.
 * @param sides Number of sides (must be >= 1)
 * @returns Integer in range [1, sides]
 */
export function rollDie(sides: number): number {
  if (sides < 1 || !Number.isInteger(sides)) {
    throw new Error(`Invalid die: d${sides}`);
  }
  if (sides === 1) return 1;

  const array = new Uint32Array(1);
  const limit = Math.floor(0x100000000 / sides) * sides;

  do {
    crypto.getRandomValues(array);
  } while (array[0] >= limit);

  return (array[0] % sides) + 1;
}

/**
 * Roll multiple dice with the given number of sides.
 * @returns Array of individual die results
 */
export function rollDice(count: number, sides: number): number[] {
  return Array.from({ length: count }, () => rollDie(sides));
}

/** Roll 1D6, return the result (1-6) */
export function roll1D(): number {
  return rollDie(6);
}

/** Roll 2D6, return the sum (2-12) */
export function roll2D(): number {
  return rollDice(2, 6).reduce((a, b) => a + b, 0);
}

/** Roll 3D6, return the sum (3-18) */
export function roll3D(): number {
  return rollDice(3, 6).reduce((a, b) => a + b, 0);
}

/** Roll D3 (1-3) */
export function rollD3(): number {
  return rollDie(3);
}

/** Roll D66: tens die * 10 + ones die (11-66, valid values only) */
export function rollD66(): number {
  const tens = rollDie(6);
  const ones = rollDie(6);
  return tens * 10 + ones;
}

/**
 * Probability of rolling `target` or higher on 2D6 with a given DM.
 *
 * Enumerates all 36 outcomes of 2D6 exhaustively and returns the rounded
 * percentage (0-100). Inputs are clamped so that an effective target of
 * 2 or less always returns 100, and an effective target above 12 always
 * returns 0.
 *
 * @param target Target number to beat or equal
 * @param dm Dice modifier applied to the roll
 * @returns Integer percentage in the range [0, 100]
 */
export function probability2DAtLeast(target: number, dm: number): number {
  const effectiveTarget = target - dm;
  if (effectiveTarget <= 2) return 100;
  if (effectiveTarget > 12) return 0;
  let successes = 0;
  for (let d1 = 1; d1 <= 6; d1++) {
    for (let d2 = 1; d2 <= 6; d2++) {
      if (d1 + d2 >= effectiveTarget) successes++;
    }
  }
  return Math.round((successes / 36) * 100);
}
