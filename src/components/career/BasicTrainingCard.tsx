import { useState } from 'react';
import type { CareerData } from '../../types/careers';
import { getBasicTrainingSkills } from '../../engine/career';
import { useCharacterStore } from '../../stores/character';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface BasicTrainingCardProps {
  career: CareerData;
  assignmentIndex: number;
  isFirstCareer: boolean;
  onComplete: () => void;
}

/**
 * Basic training skill display.
 * First career: all service skills at level 0 (CRER-04).
 * Subsequent careers: pick one service skill at level 0.
 * Citizen/Drifter: uses assignment specialist skills (CRER-05).
 */
export function BasicTrainingCard({
  career,
  assignmentIndex,
  isFirstCareer,
  onComplete,
}: BasicTrainingCardProps) {
  const addSkill = useCharacterStore((s) => s.addSkill);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [granted, setGranted] = useState(false);

  const skills = getBasicTrainingSkills(career, isFirstCareer, assignmentIndex);

  const getSkillName = (skill: string | { name: string; specialty?: string }): string => {
    if (typeof skill === 'string') return skill;
    return skill.specialty ? `${skill.name} (${skill.specialty})` : skill.name;
  };

  const handleGrantAll = () => {
    for (const skill of skills) {
      addSkill(getSkillName(skill), 0);
    }
    setGranted(true);
    onComplete();
  };

  const handleSelectSkill = (skillName: string) => {
    setSelectedSkill(skillName);
    addSkill(skillName, 0);
    setGranted(true);
    onComplete();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-sans font-medium text-white mb-1">Basic Training</h2>
        <p className="text-sm text-gray-400 capitalize">
          {career.name} — {career.assignments[assignmentIndex]?.name}
        </p>
      </div>

      <Card>
        {isFirstCareer ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-300">
              You receive all service skills at level 0:
            </p>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-scanner-blue/10 border border-scanner-blue/30 rounded text-sm text-scanner-blue font-mono"
                >
                  {getSkillName(skill)} 0
                </span>
              ))}
            </div>
            <Button variant="primary" onClick={handleGrantAll} className="w-full mt-2">
              Accept Basic Training
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-300">
              Choose one service skill at level 0:
            </p>
            {skills.length > 0 ? (
              <div className="grid grid-cols-2 gap-2" data-testid="basic-training-pick-grid">
                {skills.map((skill, i) => {
                  const name = getSkillName(skill);
                  return (
                    <button
                      key={i}
                      onClick={() => !granted && handleSelectSkill(name)}
                      disabled={granted}
                      className={`px-3 py-2 rounded border text-sm text-left transition-colors ${
                        selectedSkill === name
                          ? 'border-scanner-blue bg-scanner-blue/20 text-scanner-blue'
                          : 'border-gray-700 bg-terminal-surface/30 text-gray-300 hover:border-gray-600'
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      {name} 0
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2" data-testid="basic-training-empty-fallback">
                <p className="text-xs text-amber-400">
                  No basic training skills available for this career.
                </p>
                <Button variant="primary" onClick={onComplete} className="w-full">
                  Continue
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
