import { useState, useCallback } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useLoggedRoll } from '../../hooks/useLoggedRoll';
import {
  getAvailableSkillTables,
  isSkillAtCap,
  isOverSkillLimit,
  getTotalSkillLevels,
} from '../../engine/career';
import { useCharacterStore } from '../../stores/character';
import { rollDie } from '../../engine/dice';
import { createRollLogEntry } from '../../engine/roll-log';
import { computeHash } from '../../engine/hash';
import type { CareerData, SkillEntry } from '../../types/careers';
import type { Skill } from '../../types/character';

interface SkillTableTabsProps {
  career: CareerData;
  assignmentIndex: number;
  isCommissioned: boolean;
  edu: number;
  skills: Skill[];
  int: number;
  onSkillSelected: () => void;
}

type TabId = 'personal' | 'service' | 'specialist' | 'advanced' | 'officer';

interface TabDef {
  id: TabId;
  label: string;
  skills: SkillEntry[];
}

/**
 * Resolve a SkillEntry to a display string.
 */
function skillEntryToString(entry: SkillEntry): string {
  if (typeof entry === 'string') return entry;
  if (entry.specialty) return `${entry.name} (${entry.specialty})`;
  return entry.name;
}

/**
 * Resolve a SkillEntry to a skill name for addSkill.
 */
function skillEntryToName(entry: SkillEntry): string {
  if (typeof entry === 'string') return entry;
  if (entry.specialty) return `${entry.name} (${entry.specialty})`;
  return entry.name;
}

/**
 * Tabbed skill table picker (D-04).
 *
 * Shows available skill tables as tabs based on rank and EDU.
 * User picks a table, then rolls 1D to select a skill from it.
 * Enforces skill level 4 cap (CRER-18) and total skill limit warning (CRER-19).
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
  const addSkill = useCharacterStore((s) => s.addSkill);
  const appendRoll = useCharacterStore((s) => s.appendRoll);
  const setLegitimacyHash = useCharacterStore((s) => s.setLegitimacyHash);

  const [activeTab, setActiveTab] = useState<TabId | null>(null);
  const [rolledSkill, setRolledSkill] = useState<string | null>(null);
  const [rollResult, setRollResult] = useState<number | null>(null);
  const [atCap, setAtCap] = useState(false);
  const [overLimit, setOverLimit] = useState(false);

  // Determine available tables
  const availableTableNames = getAvailableSkillTables(career, isCommissioned, edu);

  // Build tab definitions from career data
  const tabs: TabDef[] = [];

  if (availableTableNames.includes('personal')) {
    tabs.push({
      id: 'personal',
      label: 'Personal Development',
      skills: career.skillTables.personalDevelopment,
    });
  }
  if (availableTableNames.includes('service')) {
    tabs.push({
      id: 'service',
      label: 'Service Skills',
      skills: career.skillTables.serviceSkills,
    });
  }
  if (availableTableNames.includes('specialist')) {
    const assignment = career.assignments[assignmentIndex];
    if (assignment) {
      tabs.push({
        id: 'specialist',
        label: `Specialist (${assignment.name})`,
        skills: assignment.specialistSkills,
      });
    }
  }
  if (availableTableNames.includes('advanced')) {
    tabs.push({
      id: 'advanced',
      label: 'Advanced Education',
      skills: career.skillTables.advancedEducation,
    });
  }
  if (availableTableNames.includes('officer')) {
    tabs.push({
      id: 'officer',
      label: 'Officer Skills',
      skills: career.skillTables.officerSkills || [],
    });
  }

  // Default to first tab
  const currentTab = activeTab
    ? tabs.find((t) => t.id === activeTab) || tabs[0]
    : tabs[0];

  const handleRollForSkill = useCallback(async () => {
    if (!currentTab) return;

    // Roll 1D to determine skill from table
    const die = rollDie(6);
    const skillIndex = die - 1; // 1D results in 1-6, index 0-5
    const selectedEntry = currentTab.skills[skillIndex];
    if (!selectedEntry) return;

    const skillName = skillEntryToName(selectedEntry);
    setRollResult(die);
    setRolledSkill(skillName);

    // Log the 1D roll manually (useLoggedRoll only has 2D)
    const entry = createRollLogEntry(
      `career.skill.${career.name}.${currentTab.id}`,
      '1D',
      [die],
      0,
    );
    const currentLog = useCharacterStore.getState().rollLog;
    appendRoll(entry);
    const newLog = [...currentLog, entry];
    const hash = await computeHash(newLog);
    setLegitimacyHash(hash);

    // Check skill cap (CRER-18)
    const existing = skills.find((s) => s.name === skillName);
    const currentLevel = existing ? existing.level : -1; // -1 means not owned, will be added at 0
    const newLevel = existing ? existing.level + 1 : 1;

    if (isSkillAtCap(newLevel)) {
      setAtCap(true);
      // Grant at current level (don't exceed cap)
      if (!existing) {
        addSkill(skillName, 0);
      }
      // If already at cap, no level increase
    } else {
      setAtCap(false);
      if (existing) {
        addSkill(skillName, newLevel); // addSkill upgrades if higher
      } else {
        addSkill(skillName, 1);
      }
    }

    // Check total skill limit (CRER-19)
    const totalAfter = getTotalSkillLevels(useCharacterStore.getState().skills);
    if (isOverSkillLimit(useCharacterStore.getState().skills, int, edu)) {
      setOverLimit(true);
    }

    // Brief pause to show result, then continue
    setTimeout(() => onSkillSelected(), 1500);
  }, [
    currentTab,
    career.name,
    skills,
    int,
    edu,
    addSkill,
    appendRoll,
    setLegitimacyHash,
    onSkillSelected,
  ]);

  if (tabs.length === 0) {
    return (
      <Card>
        <p className="text-sm text-gray-400">No skill tables available.</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-sans font-medium text-white">Skill Training</h3>
          <p className="text-sm text-gray-400 mt-1">
            Choose a training table, then roll 1D to determine your skill.
          </p>
        </div>

        {/* Tab buttons */}
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-sm rounded-t-lg border-b-2 transition-colors ${
                (activeTab || tabs[0]?.id) === tab.id
                  ? 'border-scanner-blue text-scanner-blue bg-scanner-blue/10'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-800'
              }`}
            >
              {tab.label}
              {tab.id === 'advanced' && (
                <span className="text-xs text-gray-500 ml-1">(EDU 8+)</span>
              )}
              {tab.id === 'officer' && (
                <span className="text-xs text-gray-500 ml-1">(Officer)</span>
              )}
            </button>
          ))}
        </div>

        {/* Skill list for current tab */}
        {currentTab && (
          <div className="bg-terminal-bg/50 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-1">
              {currentTab.skills.map((entry, i) => {
                const name = skillEntryToString(entry);
                const existing = skills.find((s) => s.name === skillEntryToName(entry));
                const isRolled = rollResult === i + 1;

                return (
                  <div
                    key={i}
                    className={`flex items-center gap-2 px-2 py-1 rounded text-sm ${
                      isRolled
                        ? 'bg-scanner-blue/20 text-scanner-blue font-medium'
                        : 'text-gray-300'
                    }`}
                  >
                    <span className="text-xs font-mono text-gray-500 w-4">
                      {i + 1}
                    </span>
                    <span>{name}</span>
                    {existing && (
                      <span className="text-xs text-gray-500 ml-auto">
                        Lv{existing.level}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Roll button or result */}
        {rolledSkill === null ? (
          <Button
            variant="primary"
            size="md"
            onClick={handleRollForSkill}
            className="w-full"
          >
            Roll for Skill (1D)
          </Button>
        ) : (
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-400">
              Rolled: <span className="font-mono text-scanner-blue">{rollResult}</span>
            </p>
            <p className="text-lg font-sans font-medium text-scanner-blue">
              {rolledSkill}
            </p>
            {atCap && (
              <p className="text-sm text-modified">
                Skill at level 4 cap — cannot increase further (CRER-18)
              </p>
            )}
            {overLimit && (
              <p className="text-sm text-modified">
                Warning: Total skill levels approaching limit of 3 x (INT + EDU) (CRER-19)
              </p>
            )}
          </div>
        )}

        {/* Skill limit indicator */}
        <div className="text-xs text-gray-500 text-right">
          Total skill levels: {getTotalSkillLevels(skills)} / {3 * (int + edu)} max
        </div>
      </div>
    </Card>
  );
}
