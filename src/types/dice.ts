/** Valid dice notations in Mongoose Traveller 2E */
export type DiceNotation = '1D' | '2D' | '3D' | 'D3' | 'D66';

/** Result of a single dice roll operation */
export interface RollResult {
  notation: DiceNotation;
  dice: number[];
  total: number;
}

/** A complete roll log entry with full context for audit trail */
export interface RollLogEntry {
  /** UUID v4 identifier */
  id: string;
  /** Dot-path context, e.g. "characteristics.STR", "career.marines.survival" */
  context: string;
  /** Dice notation used */
  notation: DiceNotation;
  /** Individual die results */
  results: number[];
  /** Sum of results + modifier */
  total: number;
  /** Dice modifier applied */
  modifier: number;
  /** Target number to beat, or null if no check */
  target: number | null;
  /** Whether the check succeeded, or null if no check */
  success: boolean | null;
  /** Whether override mode was used to set this value */
  overridden: boolean;
}
