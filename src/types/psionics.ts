/** The five common psionic talents from Mongoose Traveller 2E */
export type PsiTalentName =
  | 'telepathy'
  | 'clairvoyance'
  | 'telekinesis'
  | 'awareness'
  | 'teleportation';

/** A single psionic power within a talent */
export interface PsiPower {
  name: string;
  talent: PsiTalentName;
  /** PSI points spent on a successful use */
  psiCost: number;
  /** Reach / range band, e.g. "Distant", "Short", "Personal" */
  range: string;
  description: string;
}

/** Static data for a psionic talent: its learning DM and its powers */
export interface PsiTalentData {
  name: PsiTalentName;
  /** Learning DM applied to the PSI check when learning this talent */
  learnDM: number;
  powers: PsiPower[];
}

/** A talent a character has actually acquired */
export interface AcquiredPsiTalent {
  talent: PsiTalentName;
  level: number;
  powers: PsiPower[];
}
