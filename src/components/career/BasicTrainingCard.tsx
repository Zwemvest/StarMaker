import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { getBasicTrainingSkills } from '../../engine/career';
import { useCharacterStore } from '../../stores/character';
import type { CareerData, SkillEntry } from '../../types/careers';

interface BasicTrainingCardProps {
  career: CareerData;
  assignmentIndex: number;
  isFirstCareer: boolean;
  onComplete: () => void;
}

/** Convert a SkillEntry to a display string */
function skillLabel(entry: SkillEntry): string {
  if (typeof entry === 'string') return entry;
  return entry.specialty ? `${entry.name} (${entry.specialty})` : entry.name;
}

/** Extract plain skill name from a SkillEntry */
function skillName(entry: SkillEntry): string {
  if (typeof entry === 'string') return entry;
  return entry.specialty ? `${entry.name} (${entry.specialty})` : entry.name;
}

/**
 * Basic training skill display and selection.
 *
 * For first career (CRER-04): Shows all service skills granted at level 0.
 * For subsequent careers: Shows service skills as buttons; pick one at level 0.
 * For Citizen/Drifter exception (CRER-05): Uses assignment specialist skills
 * instead of service skills.
 */
export function BasicTrainingCard({ career, assignmentIndex, isFirstCareer, onComplete }: BasicTrainingCardProps) {
  const addSkill = useCharacterStore((s) => s.addSkill);
  const skills = useCharacterStore((s) => s.skills);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [committed, setCommitted] = useState(false);

  const trainingSkills = getBasicTrainingSkills(career, isFirstCareer, assignmentIndex);

  // Determine if this is a "pick one" scenario (subsequent careers)
  const isPickOne = !isFirstCareer;

  // For first career: get service skills to display (or specialist for exception)
  const displaySkills = isFirstCareer
    ? trainingSkills
    : (career.basicTrainingException
        ? career.assignments[assignmentIndex].specialistSkills
        : career.skillTables.serviceSkills);

  const handleGrantAll = () => {
    // First career: grant all training skills at level 0
    for (const entry of trainingSkills) {
      addSkill(skillName(entry), 0);
    }
    setCommitted(true);
    onComplete();
  };

  const handlePickOne = () => {
    if (!selectedSkill) return;
    addSkill(selectedSkill, 0);
    setCommitted(true);
    onComplete();
  };

  const isException = career.basicTrainingException;
  const skillSource = isException ? 'specialist' : 'service';

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-sans font-medium text-white">Basic Training</h2>

      <Card>
        {isFirstCareer ? (
          <>
            <p className="text-sm text-gray-300 mb-3">
              You receive all {skillSource} skills at level 0:
              {isException && (
                <span className="text-xs text-gray-500 ml-1">
                  ({career.name} uses assignment specialist skills)
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {displaySkills.map((entry, i) => {
                const name = skillName(entry);
                const alreadyOwned = skills.some((s) => s.name === name);
                return (
                  <span
                    key={i}
                    className={`px-2 py-1 rounded text-xs font-mono border ${
                      alreadyOwned
                        ? 'bg-gray-800 border-gray-600 text-gray-500'
                        : 'bg-scanner-blue/10 border-scanner-blue/30 text-scanner-blue'
                    }`}
                  >
                    {skillLabel(entry)} 0
                    {alreadyOwned && <span className="ml-1 text-gray-600">(owned)</span>}
                  </span>
                );
              })}
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleGrantAll}
              disabled={committed}
            >
              {committed ? 'Skills Granted' : 'Accept Basic Training'}
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-300 mb-3">
              Choose one {skillSource} skill at level 0:
              {isException && (
                <span className="text-xs text-gray-500 ml-1">
                  ({career.name} uses assignment specialist skills)
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {displaySkills.map((entry, i) => {
                const name = skillName(entry);
                const isSelected = selectedSkill === name;
                const alreadyOwned = skills.some((s) => s.name === name);
                return (
                  <button
                    key={i}
                    onClick={() => !committed && setSelectedSkill(name)}
                    disabled={committed}
                    className={`px-2 py-1 rounded text-xs font-mono border transition-colors ${
                      isSelected
                        ? 'bg-scanner-blue/20 border-scanner-blue text-scanner-blue'
                        : alreadyOwned
                          ? 'bg-gray-800 border-gray-600 text-gray-500 cursor-pointer'
                          : 'bg-terminal-surface border-gray-600 text-gray-300 hover:border-scanner-blue/50 cursor-pointer'
                    } disabled:cursor-not-allowed`}
                  >
                    {skillLabel(entry)} 0
                    {alreadyOwned && <span className="ml-1 text-gray-600">(owned)</span>}
                  </button>
                );
              })}
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handlePickOne}
              disabled={committed || !selectedSkill}
            >
              {committed ? 'Skill Granted' : 'Accept Skill'}
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
