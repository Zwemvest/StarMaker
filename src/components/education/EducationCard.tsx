import type { EducationPath, AcademyBranch } from '../../types/education';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface EducationCardProps {
  path: EducationPath;
  onSelect: (branch?: AcademyBranch) => void;
  disabled: boolean;
}

/**
 * Education path selection card.
 *
 * Shows entry requirements, description, and what you gain on success.
 * Military Academy card has branch sub-selection buttons (Army/Marines/Navy).
 */
export function EducationCard({ path, onSelect, disabled }: EducationCardProps) {
  if (path.type === 'academy' && !path.branch) {
    // Academy card with branch sub-selection
    return (
      <Card className="flex flex-col gap-3 min-w-[220px] flex-1">
        <h3 className="text-lg font-sans font-medium text-white">Military Academy</h3>
        <p className="text-sm text-gray-400">
          Officer training with basic military skills and potential commission
        </p>
        <div className="border-t border-gray-700 pt-2 mt-auto">
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Choose Branch</p>
          <div className="flex flex-col gap-2">
            {(['army', 'marines', 'navy'] as const).map((branch) => (
              <Button
                key={branch}
                variant="secondary"
                size="sm"
                disabled={disabled}
                onClick={() => onSelect(branch)}
              >
                {branch === 'army' ? 'Army (END 8+)' : branch === 'marines' ? 'Marines (END 9+)' : 'Navy (INT 9+)'}
              </Button>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  // University or Skip card
  const isSkip = path.type === 'university' ? false : true;

  if (path.label === 'Skip to Career') {
    return (
      <Card className="flex flex-col gap-3 min-w-[220px] flex-1">
        <h3 className="text-lg font-sans font-medium text-white">Skip to Career</h3>
        <p className="text-sm text-gray-400">
          Proceed directly to career selection without pre-career education.
        </p>
        <div className="mt-auto">
          <Button
            variant="ghost"
            disabled={disabled}
            onClick={() => onSelect()}
            className="w-full"
          >
            Skip Education
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-3 min-w-[220px] flex-1">
      <h3 className="text-lg font-sans font-medium text-white">{path.label}</h3>
      <p className="text-sm text-gray-400">{path.description}</p>
      <div className="space-y-1 text-xs">
        <p className="text-gray-500">
          Entry: <span className="text-white font-mono">{path.entryCharacteristic} {path.entryTarget}+</span>
        </p>
        {path.socBonus && (
          <p className="text-gray-500">
            SOC 9+ grants <span className="text-scanner-blue font-mono">DM+1</span>
          </p>
        )}
        <p className="text-gray-500">
          Success: <span className="text-legitimate">Skill selection + EDU bonus</span>
        </p>
      </div>
      <div className="mt-auto">
        <Button
          variant="primary"
          disabled={disabled}
          onClick={() => onSelect()}
          className="w-full"
        >
          Apply
        </Button>
      </div>
    </Card>
  );
}
