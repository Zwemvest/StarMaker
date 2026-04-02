import type { GraduationResult as GradResult, EducationType } from '../../types/education';
import type { applyGraduationBenefits } from '../../engine/education';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { canAttemptEducation } from '../../engine/education';

interface GraduationResultProps {
  result: GradResult;
  rollTotal: number;
  benefits: ReturnType<typeof applyGraduationBenefits>;
  educationType: EducationType;
  skillsEarnedThisTerm: string[];
  educationTermsUsed: number;
  onContinue: () => void;
  onRetry?: () => void;
}

/**
 * Graduation outcome display.
 *
 * Honours: celebratory display with bonus skills and EDU increases.
 * Graduated: positive display with standard benefits.
 * Failed: skills retained message, no benefits.
 * Academy graduated (not honours): auto-entry note, no commission.
 */
export function GraduationResult({
  result,
  rollTotal,
  benefits,
  educationType,
  skillsEarnedThisTerm,
  educationTermsUsed,
  onContinue,
  onRetry,
}: GraduationResultProps) {
  const canRetry = canAttemptEducation(educationTermsUsed);

  const resultConfig = {
    honours: {
      title: 'Graduated with Honours!',
      glowColor: '#22c55e',
      titleClass: 'text-legitimate',
    },
    graduated: {
      title: 'Graduated',
      glowColor: '#00d4ff',
      titleClass: 'text-scanner-blue',
    },
    failed: {
      title: 'Failed to Graduate',
      glowColor: undefined,
      titleClass: 'text-modified',
    },
  };

  const config = resultConfig[result];

  return (
    <Card glowColor={config.glowColor}>
      <div className="space-y-3">
        {/* Roll result */}
        <div className="flex items-center gap-3">
          <span className={`text-xl font-sans font-medium ${config.titleClass}`}>
            {config.title}
          </span>
          <span className="text-sm text-gray-400 font-mono">
            (Roll: {rollTotal})
          </span>
        </div>

        {/* Benefits (for graduated/honours) */}
        {result !== 'failed' && (
          <div className="space-y-1">
            {benefits.eduBonus > 0 && (
              <p className="text-sm text-gray-300">
                EDU <span className="text-legitimate font-mono">+{benefits.eduBonus}</span>
              </p>
            )}
            {benefits.skillLevelBonus > 0 && (
              <p className="text-sm text-gray-300">
                All education skills <span className="text-legitimate font-mono">+{benefits.skillLevelBonus}</span> level
              </p>
            )}
            {benefits.commissionEligible && (
              <p className="text-sm text-scanner-blue">
                Eligible for commission
              </p>
            )}
            {/* Academy graduated without honours: no commission note (EDUC-10) */}
            {educationType === 'academy' && result === 'graduated' && (
              <p className="text-sm text-modified">
                Auto-entry to career, but no commission
              </p>
            )}
          </div>
        )}

        {/* Failed graduation: skills retained (EDUC-09) */}
        {result === 'failed' && (
          <div className="space-y-2">
            <p className="text-sm text-gray-400">
              No graduation benefits, but skills earned during this term are retained.
            </p>
            {skillsEarnedThisTerm.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Skills Retained</p>
                <div className="flex flex-wrap gap-1">
                  {skillsEarnedThisTerm.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 bg-legitimate/10 border border-legitimate/30 rounded text-xs text-legitimate font-mono"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          {result === 'failed' && canRetry && onRetry && (
            <Button variant="secondary" size="sm" onClick={onRetry}>
              Try Again (Term {educationTermsUsed + 1})
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={onContinue}>
            {result === 'failed' ? 'Continue to Career' : 'Continue'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
