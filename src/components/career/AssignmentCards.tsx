import type { CareerData } from '../../types/careers';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface AssignmentCardsProps {
  career: CareerData;
  onChoose: (assignment: string) => void;
}

/**
 * Assignment selection cards (D-11).
 * Displays 3 assignment cards with survival/advancement targets and specialist skills.
 */
export function AssignmentCards({ career, onChoose }: AssignmentCardsProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-sans font-medium text-white mb-1 capitalize">
          {career.name} — Choose Assignment
        </h2>
        <p className="text-sm text-gray-400">Select your specialisation within this career.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {career.assignments.map((assignment) => (
          <Card
            key={assignment.name}
            className="hover:border-scanner-blue/60 transition-colors cursor-pointer"
          >
            <div className="space-y-3">
              <div>
                <h3 className="text-base font-medium text-white">{assignment.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{assignment.description}</p>
              </div>

              <div className="space-y-1 text-xs">
                <p className="text-gray-400">
                  <span className="text-gray-500">Survival:</span>{' '}
                  <span className="text-scanner-blue font-mono">
                    {assignment.survival.characteristic} {assignment.survival.target}+
                  </span>
                </p>
                <p className="text-gray-400">
                  <span className="text-gray-500">Advancement:</span>{' '}
                  <span className="text-scanner-blue font-mono">
                    {assignment.advancement.characteristic} {assignment.advancement.target}+
                  </span>
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Specialist Skills</p>
                <div className="space-y-0.5">
                  {assignment.specialistSkills.map((skill, i) => (
                    <p key={i} className="text-xs text-gray-400">
                      {typeof skill === 'string' ? skill : skill.name}
                    </p>
                  ))}
                </div>
              </div>

              <Button variant="primary" size="sm" className="w-full" onClick={() => onChoose(assignment.name)}>
                Choose {assignment.name}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
