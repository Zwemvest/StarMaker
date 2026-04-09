import { CAREERS, ALL_CAREER_NAMES } from '../../data/careers/index';
import { useCharacterStore } from '../../stores/character';
import { characteristicModifier } from '../../types/common';
import { calculateQualificationDM } from '../../engine/career';
import { probability2DAtLeast } from '../../engine/dice';
import type { CareerName } from '../../types/careers';

interface CareerGridProps {
  onChoose: (career: CareerName) => void;
}

/**
 * Career selection grid (D-10).
 * Displays all 12 careers with qualification info and DM penalties.
 * Grays out careers that cannot be immediately re-entered (CRER-24).
 */
export function CareerGrid({ onChoose }: CareerGridProps) {
  const previousCareers = useCharacterStore((s) => s.previousCareers);
  const lastCareer = useCharacterStore((s) => s.lastCareer);
  const characteristics = useCharacterStore((s) => s.characteristics);

  const qualDM = calculateQualificationDM(previousCareers.length);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-sans font-medium text-white mb-1">Choose a Career</h2>
        {previousCareers.length > 0 && (
          <p className="text-sm text-amber-400">
            DM{qualDM} to qualification rolls (previous career penalty, CRER-03)
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {ALL_CAREER_NAMES.map((careerName) => {
          const career = CAREERS[careerName];
          const isLocked = lastCareer === careerName;
          const qual = career.qualification;

          let qualText = 'No Qualification Required';
          let userDM = qualDM;
          let odds: number | null = null;
          if (qual) {
            const charValue = characteristics[qual.characteristic as keyof typeof characteristics] ?? 0;
            const charDM = characteristicModifier(charValue);
            userDM = qualDM + charDM;
            const dmStr = userDM === 0 ? '' : userDM > 0 ? ` (DM+${userDM})` : ` (DM${userDM})`;
            qualText = `${qual.characteristic} ${qual.target}+${dmStr}`;
            odds = probability2DAtLeast(qual.target, userDM);
          }
          const oddsColor =
            odds !== null && odds >= 50
              ? 'text-green-400 border-green-700'
              : 'text-amber-400 border-amber-700';

          return (
            <button
              key={careerName}
              onClick={() => !isLocked && onChoose(careerName)}
              disabled={isLocked}
              className={`relative text-left rounded-lg border p-3 transition-colors ${
                isLocked
                  ? 'border-gray-700 bg-terminal-surface/20 opacity-40 cursor-not-allowed'
                  : 'border-gray-700 bg-terminal-surface hover:border-scanner-blue/60 hover:bg-terminal-surface/80 cursor-pointer'
              }`}
            >
              {odds !== null && (
                <span
                  className={`absolute top-2 right-2 px-1.5 py-0.5 rounded border text-[10px] font-mono ${oddsColor} bg-terminal-surface`}
                  title={`Qualification odds: ${qual!.characteristic} ${qual!.target}+, DM ${userDM >= 0 ? `+${userDM}` : userDM}`}
                >
                  {odds}%
                </span>
              )}
              <p className="text-sm font-medium text-white capitalize mb-1 pr-10">{careerName}</p>
              <p className="text-xs text-gray-400 mb-2">{qualText}</p>
              <div className="space-y-0.5">
                {career.assignments.map((a) => (
                  <p key={a.name} className="text-xs text-gray-500 truncate">
                    · {a.name}
                  </p>
                ))}
              </div>
              {isLocked && (
                <p className="text-xs text-red-400 mt-1">Cannot re-enter immediately</p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
