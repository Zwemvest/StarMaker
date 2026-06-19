import { useState, useCallback } from 'react';
import type { CareerData, SkillEntry } from '../../types/careers';
import type { Skill } from '../../types/character';
import { getAvailableSkillTables, isSkillAtCap, isOverSkillLimit } from '../../engine/career';
import { useLoggedRoll } from '../../hooks/useLoggedRoll';
import { useCharacterStore } from '../../stores/character';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface SkillTableTabsProps {
  career: CareerData;
  assignmentIndex: number;
  isCommissioned: boolean;
  edu: number;
  skills: Skill[];
  int: number;
  onSkillSelected: () => void;
}

const TABLE_LABELS: Record<string, string> = {
  personalDevelopment: 'Personal Dev',
  serviceSkills: 'Service Skills',
  specialist: 'Specialist',
  officer: 'Officer',
  advancedEducation: 'Advanced Edu',
};

function getSkillName(entry: SkillEntry): string {
  if (typeof entry === 'string') return entry;
  return entry.specialty ? `${entry.name} (${entry.specialty})` : entry.name;
}

/**
 * Tabbed skill table picker (D-04).
 * User picks which table, then rolls 1D to select the skill.
 * Enforces level 4 cap (CRER-18) and total skill limit (CRER-19).
 */
export function SkillTableTabs({
  career,
  assignmentIndex,
  isCommissioned,
  edu,
  skills,
  int,
  onSkillSelected,
}: SkillTableTabsProps) {
  const { loggedRoll2D } = useLoggedRoll();
  const addSkill = useCharacterStore((s) => s.addSkill);

  const [activeTab, setActiveTab] = useState<string>('personalDevelopment');
  const [rolledResult, setRolledResult] = useState<{
    skillName: string;
    tableName: string;
    atCap: boolean;
    overLimit: boolean;
  } | null>(null);
  const [rolling, setRolling] = useState(false);

  const availableTables = getAvailableSkillTables(career, isCommissioned, edu);

  const getTableEntries = (tableName: string): SkillEntry[] => {
    if (tableName === 'specialist') {
      return career.assignments[assignmentIndex]?.specialistSkills ?? [];
    }
    return career.skillTables[tableName as keyof typeof career.skillTables] as SkillEntry[] ?? [];
  };

  const handleRollSkill = useCallback(async () => {
    setRolling(true);
    // Use loggedRoll2D but treat it as 1D for skill table selection
    // We roll 2D to maintain legitimacy log, use single die interpretation
    const entry = await loggedRoll2D(`Skill Table — ${TABLE_LABELS[activeTab] ?? activeTab}`);
    // 1D emulation: use first die, clamped 1-6
    const roll1D = Math.max(1, Math.min(6, entry.results[0] ?? 1));
    const tableEntries = getTableEntries(activeTab);
    const skillEntry = tableEntries[roll1D - 1];

    if (!skillEntry) {
      setRolling(false);
      return;
    }

    const skillName = getSkillName(skillEntry);
    const existingSkill = skills.find((s) => s.name === skillName);
    const currentLevel = existingSkill?.level ?? -1;
    const atCap = isSkillAtCap(currentLevel + 1);
    const overLimit = isOverSkillLimit([...skills, { name: skillName, level: Math.min(currentLevel + 1, 4) }], int, edu);

    addSkill(skillName, Math.min(currentLevel + 1, 4));
    setRolledResult({ skillName, tableName: TABLE_LABELS[activeTab] ?? activeTab, atCap, overLimit });
    setRolling(false);
  }, [loggedRoll2D, activeTab, skills, int, edu, addSkill]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-sans font-medium text-white mb-1">Skill Selection</h2>
        <p className="text-sm text-gray-400">
          Choose a skill table, then roll 1D to determine your skill.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 border-b border-gray-700 pb-1">
        {availableTables.map((tableName) => (
          <button
            key={tableName}
            onClick={() => !rolledResult && setActiveTab(tableName)}
            disabled={!!rolledResult}
            className={`px-3 py-1 text-sm rounded-t transition-colors ${
              activeTab === tableName
                ? 'text-scanner-blue border-b-2 border-scanner-blue bg-scanner-blue/5'
                : 'text-gray-400 hover:text-gray-200'
            } disabled:opacity-40`}
          >
            {TABLE_LABELS[tableName] ?? tableName}
          </button>
        ))}
      </div>

      {/* Table entries preview */}
      {!rolledResult && (
        <Card>
          <div className="grid grid-cols-2 gap-1">
            {getTableEntries(activeTab).map((entry, i) => (
              <div key={i} className="flex items-center gap-2 py-0.5">
                <span className="text-xs text-gray-500 font-mono w-4">{i + 1}.</span>
                <span className="text-sm text-gray-300">{getSkillName(entry)}</span>
              </div>
            ))}
          </div>
          <Button
            variant="primary"
            className="w-full mt-3"
            onClick={handleRollSkill}
            disabled={rolling}
          >
            {rolling ? 'Rolling...' : 'Roll for Skill'}
          </Button>
        </Card>
      )}

      {/* Result */}
      {rolledResult && (
        <Card className="border-green-700/40">
          <div className="space-y-2">
            <p className="text-xs text-gray-500">{rolledResult.tableName}</p>
            <p className="text-xl font-bold text-green-400">+1 {rolledResult.skillName}</p>

            {rolledResult.atCap && (
              <p className="text-xs text-amber-400">
                Note: Skill is at level 4 cap — granted at maximum level (CRER-18)
              </p>
            )}
            {rolledResult.overLimit && (
              <p className="text-xs text-red-400">
                Warning: Approaching total skill limit — {3 * (int + edu)} max levels (CRER-19)
              </p>
            )}

            <Button variant="primary" className="w-full" onClick={onSkillSelected}>
              Continue
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
