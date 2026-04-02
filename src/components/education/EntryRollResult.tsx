import type { EducationPath } from '../../types/education';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { canAttemptEducation } from '../../engine/education';

interface EntryRollResultProps {
  result: { success: boolean; total: number; target: number; dm: number };
  path: EducationPath;
  diceTotal: number;
  educationTermsUsed: number;
  skillsGranted?: string[];
  onRetry: () => void;
  onSkip: () => void;
  onContinue: () => void;
}

/**
 * Entry roll result displayed inline on the selected education card.
 * Shows target, DM breakdown, roll result, pass/fail.
 *
 * Success: scanner-blue glow, "Admitted!" with skills listed.
 * Failure: amber "Entry denied" with retry/skip options.
 */
export function EntryRollResult({
  result,
  path,
  diceTotal,
  educationTermsUsed,
  skillsGranted,
  onRetry,
  onSkip,
  onContinue,
}: EntryRollResultProps) {
  const canRetry = canAttemptEducation(educationTermsUsed);

  return (
    <Card
      className="mt-4"
      glowColor={result.success ? '#00d4ff' : undefined}
    >
      <div className="space-y-3">
        {/* Roll breakdown */}
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-400">
            {path.entryCharacteristic} {result.target}+
          </span>
          <span className="text-gray-600">|</span>
          <span className="text-gray-400">
            Roll: <span className="font-mono text-white">{diceTotal}</span>
          </span>
          {result.dm !== 0 && (
            <>
              <span className="text-gray-600">|</span>
              <span className="text-gray-400">
                DM: <span className={`font-mono ${result.dm >= 0 ? 'text-legitimate' : 'text-modified'}`}>
                  {result.dm >= 0 ? '+' : ''}{result.dm}
                </span>
              </span>
            </>
          )}
          <span className="text-gray-600">|</span>
          <span className="text-gray-400">
            Total: <span className="font-mono text-white">{result.total}</span>
          </span>
        </div>

        {/* Result */}
        {result.success ? (
          <div className="space-y-2">
            <p className="text-lg font-sans font-medium text-scanner-blue">
              Admitted!
            </p>
            {skillsGranted && skillsGranted.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Skills Granted</p>
                <div className="flex flex-wrap gap-1">
                  {skillsGranted.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 bg-scanner-blue/10 border border-scanner-blue/30 rounded text-xs text-scanner-blue font-mono"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <Button variant="primary" size="sm" onClick={onContinue}>
              Continue to Term
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-lg font-sans font-medium text-modified">
              Entry Denied
            </p>
            <div className="flex gap-2">
              {canRetry && (
                <Button variant="secondary" size="sm" onClick={onRetry}>
                  Try Again (Term {educationTermsUsed + 1}, DM{' '}
                  {-1 * (educationTermsUsed)})
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onSkip}>
                Skip to Career
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
