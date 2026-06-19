import type { AcquiredPsiTalent } from '../../types/psionics';

/**
 * Inner presentational content for the Psionics talent/powers list, shared by
 * the Dossier (PsionicsSection) and the final character sheet. Renders only the
 * talent list itself; the surrounding chrome (PSI-strength display, empty-state
 * copy, collapsible vs. card wrapper) is owned by each caller because it differs
 * between the two surfaces.
 */
export function PsionicsTalentList({ talents }: { talents: AcquiredPsiTalent[] }) {
  return (
    <ul className="space-y-2">
      {talents.map((t) => (
        <li key={t.talent}>
          <span className="text-sm text-gray-300 capitalize">
            {t.talent} <span className="text-gray-500">({t.level})</span>
          </span>
          <ul className="mt-0.5 space-y-0.5 pl-3 border-l border-white/5">
            {t.powers.map((p) => (
              <li key={p.name} className="text-xs text-gray-400">
                {p.name}{' '}
                <span className="text-gray-600">(PSI {p.psiCost}, {p.range})</span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
