import type { BackgroundSkill, SkillCategory } from '../../types/skills';
import { DragPool } from '../shared/DragPool';
import { Tooltip } from '../ui/Tooltip';

/** Skills that commonly appear in career/education rolls */
const RELEVANT_SKILLS = new Set([
  'Gun Combat',
  'Medic',
  'Electronics',
  'Mechanic',
  'Admin',
  'Survival',
  'Athletics',
  'Vacc Suit',
]);

const CATEGORY_ORDER: SkillCategory[] = ['Physical', 'Mental', 'Social', 'Technical'];

const CATEGORY_ACCENT: Record<SkillCategory, string> = {
  Physical: 'border-l-red-400',
  Mental: 'border-l-blue-400',
  Social: 'border-l-amber-400',
  Technical: 'border-l-emerald-400',
};

interface SkillPoolProps {
  skills: BackgroundSkill[];
  assignedNames: Set<string>;
  disabled: boolean;
}

export function SkillPool({ skills, assignedNames, disabled }: SkillPoolProps) {
  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    skills: skills.filter((s) => s.category === category),
  })).filter((g) => g.skills.length > 0);

  return (
    <div className="space-y-4">
      {grouped.map(({ category, skills: categorySkills }) => (
        <div key={category}>
          <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-2 font-sans">
            {category}
          </h3>
          <DragPool<BackgroundSkill>
            items={categorySkills}
            getId={(s) => s.name}
            disabled={disabled}
            renderItem={(skill, isDragging) => {
              const isAssigned = assignedNames.has(skill.name);
              const isRelevant = RELEVANT_SKILLS.has(skill.name);
              return (
                <Tooltip text={skill.description}>
                  <div
                    className={`
                      px-3 py-1.5 rounded border-l-2 text-sm font-mono
                      transition-all duration-150 cursor-grab select-none
                      ${CATEGORY_ACCENT[skill.category]}
                      ${isAssigned
                        ? 'opacity-30 pointer-events-none bg-terminal-surface/30 text-gray-500'
                        : isDragging
                          ? 'bg-scanner-blue/20 text-scanner-blue'
                          : 'bg-terminal-surface text-gray-200 hover:bg-terminal-surface/80'
                      }
                    `}
                  >
                    <span>{skill.name}</span>
                    {isRelevant && !isAssigned && (
                      <Tooltip text="Commonly useful in careers and education paths">
                        <span
                          className="inline-block w-1.5 h-1.5 rounded-full bg-scanner-blue ml-1.5 align-middle"
                        />
                      </Tooltip>
                    )}
                  </div>
                </Tooltip>
              );
            }}
          />
        </div>
      ))}
      <p className="text-xs text-gray-500 mt-2">
        Skills marked with a <span className="inline-block w-1.5 h-1.5 rounded-full bg-scanner-blue align-middle mx-0.5" /> blue dot are commonly useful during careers and education.
      </p>
    </div>
  );
}
