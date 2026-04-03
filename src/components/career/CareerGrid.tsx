import { Card } from '../ui/Card';
import { CAREERS, ALL_CAREER_NAMES } from '../../data/careers/index';
import { calculateQualificationDM } from '../../engine/career';
import { characteristicModifier } from '../../types/common';
import { useCharacterStore } from '../../stores/character';
import type { CareerName } from '../../types/careers';

interface CareerGridProps {
  onChoose: (career: CareerName) => void;
}

/**
 * 12-career selection grid (D-10 pattern).
 *
 * Displays all careers with qualification info, DM penalties,
 * and assignment previews. Drifter shows "No Qualification Required".
 * Locked if character's last career matches (CRER-24).
 */
export function CareerGrid({ onChoose }: CareerGridProps) {
  const characteristics = useCharacterStore((s) => s.characteristics);
  const previousCareers = useCharacterStore((s) => s.previousCareers);
  const lastCareer = useCharacterStore((s) => s.lastCareer);

  const qualDM = calculateQualificationDM(previousCareers.length);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-sans font-medium text-white mb-2">Choose a Career</h2>
        <p className="text-sm text-gray-400">
          Select a career to pursue. Each career has different qualification requirements and assignments.
          {previousCareers.length > 0 && (
            <span className="text-modified ml-2">
              (DM{qualDM} penalty for {previousCareers.length} previous career{previousCareers.length > 1 ? 's' : ''})
            </span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {ALL_CAREER_NAMES.map((name) => {
          const career = CAREERS[name];
          const isLocked = lastCareer === name;
          const qual = career.qualification;

          // Calculate user's DM for this career's qualification characteristic
          let userDM = 0;
          if (qual) {
            const charValue = characteristics[qual.characteristic as keyof typeof characteristics];
            if (charValue !== undefined) {
              userDM = characteristicModifier(charValue);
            }
          }

          const totalDM = userDM + qualDM;

          return (
            <button
              key={name}
              onClick={() => onChoose(name)}
              disabled={isLocked}
              className="text-left focus:outline-none focus:ring-2 focus:ring-scanner-blue/50 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Card
                className={`h-full transition-colors duration-150 ${
                  isLocked
                    ? 'opacity-40'
                    : 'hover:border-scanner-blue cursor-pointer'
                }`}
              >
                <h3 className="text-white font-sans font-medium capitalize mb-1">
                  {career.name}
                </h3>

                {qual ? (
                  <p className="text-xs text-gray-400 mb-2">
                    Qualification: {qual.characteristic} {qual.target}+
                    {totalDM !== 0 && (
                      <span className={`ml-1 font-mono ${totalDM > 0 ? 'text-legitimate' : 'text-modified'}`}>
                        (DM{totalDM > 0 ? '+' : ''}{totalDM})
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="text-xs text-legitimate mb-2">No Qualification Required</p>
                )}

                <div className="space-y-0.5">
                  {career.assignments.map((a) => (
                    <p key={a.name} className="text-xs text-gray-500 truncate">
                      {a.name}
                    </p>
                  ))}
                </div>

                {isLocked && (
                  <p className="text-xs text-modified mt-2 italic">Cannot return immediately</p>
                )}

                {previousCareers.length > 0 && !isLocked && qual && (
                  <p className="text-xs text-gray-600 mt-1 font-mono">
                    DM-1 per previous career
                  </p>
                )}
              </Card>
            </button>
          );
        })}
      </div>
    </div>
  );
}
