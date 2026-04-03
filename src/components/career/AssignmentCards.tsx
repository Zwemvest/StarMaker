import { Card } from '../ui/Card';
import type { CareerData, SkillEntry } from '../../types/careers';

interface AssignmentCardsProps {
  career: CareerData;
  onChoose: (assignment: string) => void;
}

/** Render a skill entry (string or object with specialty) as display text */
function skillEntryLabel(entry: SkillEntry): string {
  if (typeof entry === 'string') return entry;
  return entry.specialty ? `${entry.name} (${entry.specialty})` : entry.name;
}

/**
 * 3-assignment selection cards (D-11 pattern).
 *
 * Displays each assignment with survival/advancement targets
 * and specialist skills preview. Consistent card styling with
 * scanner-blue border on hover.
 */
export function AssignmentCards({ career, onChoose }: AssignmentCardsProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-sans font-medium text-white mb-1">
          {career.name} — Choose Assignment
        </h2>
        <p className="text-sm text-gray-400">
          Select your specialisation within the {career.name} career.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {career.assignments.map((assignment) => (
          <button
            key={assignment.name}
            onClick={() => onChoose(assignment.name)}
            className="text-left focus:outline-none focus:ring-2 focus:ring-scanner-blue/50 rounded-lg"
          >
            <Card className="h-full hover:border-scanner-blue cursor-pointer transition-colors duration-150">
              <h3 className="text-white font-sans font-medium mb-1">
                {assignment.name}
              </h3>
              <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                {assignment.description}
              </p>

              <div className="space-y-1 mb-3">
                <p className="text-xs text-gray-300">
                  Survival:{' '}
                  <span className="font-mono text-scanner-blue">
                    {assignment.survival.characteristic} {assignment.survival.target}+
                  </span>
                </p>
                <p className="text-xs text-gray-300">
                  Advancement:{' '}
                  <span className="font-mono text-scanner-blue">
                    {assignment.advancement.characteristic} {assignment.advancement.target}+
                  </span>
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  Specialist Skills
                </p>
                <div className="flex flex-wrap gap-1">
                  {assignment.specialistSkills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 bg-scanner-blue/10 border border-scanner-blue/20 rounded text-xs text-scanner-blue/80 font-mono"
                    >
                      {skillEntryLabel(skill)}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}
