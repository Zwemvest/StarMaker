import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface QualFailCardProps {
  onDraft: () => void;
  onDrifter: () => void;
  alreadyDrafted: boolean;
}

/**
 * Qualification failure card (D-12 pattern).
 *
 * Shows two options when a character fails qualification:
 * 1. Submit to Draft — onDraft handler rolls 1D and sends CHOOSE_DRAFT (CRER-20)
 * 2. Become a Drifter — onDrifter handler sends CHOOSE_DRIFTER
 */
export function QualFailCard({ onDraft, onDrifter, alreadyDrafted }: QualFailCardProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-sans font-medium text-modified">Qualification Failed</h2>
      <p className="text-sm text-gray-400">
        You did not meet the qualification requirements. Choose how to proceed:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Draft option */}
        <Card className={alreadyDrafted ? 'opacity-40' : 'hover:border-scanner-blue transition-colors'}>
          <h3 className="text-white font-sans font-medium mb-2">Submit to Draft</h3>
          <p className="text-xs text-gray-400 mb-3">
            The military assigns you to a random career. Roll 1D on the draft table
            to determine your service branch.
          </p>
          <p className="text-xs text-gray-500 mb-3 italic">
            You may be assigned to any of: Navy, Army, Marines, Merchants, Scouts, or Agents.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={onDraft}
            disabled={alreadyDrafted}
          >
            {alreadyDrafted ? '(Already drafted)' : 'Submit to Draft'}
          </Button>
        </Card>

        {/* Drifter option */}
        <Card className="hover:border-scanner-blue transition-colors">
          <h3 className="text-white font-sans font-medium mb-2">Become a Drifter</h3>
          <p className="text-xs text-gray-400 mb-3">
            Live on the fringes of society. No qualification required.
            Drifter careers use specialist skills for basic training instead of service skills.
          </p>
          <p className="text-xs text-gray-500 mb-3 italic">
            Assignments: Barbarian, Wanderer, or Scavenger.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={onDrifter}
          >
            Become a Drifter
          </Button>
        </Card>
      </div>
    </div>
  );
}
