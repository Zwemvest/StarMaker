import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface QualFailCardProps {
  onDraft: () => void;
  onDrifter: () => void;
  alreadyDrafted: boolean;
}

/**
 * Qualification failure choice card (D-12).
 * Shows Draft or Drifter options when qualification fails (CRER-20).
 */
export function QualFailCard({ onDraft, onDrifter, alreadyDrafted }: QualFailCardProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-sans font-medium text-white mb-1 text-red-400">
          Qualification Failed
        </h2>
        <p className="text-sm text-gray-400">
          You did not qualify for this career. Choose one of the following options.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="space-y-3">
          <h3 className="text-base font-medium text-white">Submit to Draft</h3>
          <p className="text-xs text-gray-400">
            The draft board assigns you to a random military or government career.
            Roll 1D: 1=Navy, 2=Army, 3=Marine, 4=Merchant, 5=Scout, 6=Agent.
          </p>
          {alreadyDrafted && (
            <p className="text-xs text-amber-400">(Already drafted — you may only be drafted once)</p>
          )}
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            disabled={alreadyDrafted}
            onClick={onDraft}
          >
            {alreadyDrafted ? 'Already Drafted' : 'Submit to Draft'}
          </Button>
        </Card>

        <Card className="space-y-3">
          <h3 className="text-base font-medium text-white">Become a Drifter</h3>
          <p className="text-xs text-gray-400">
            No career qualification needed. Enter the Drifter career automatically
            and take any assignment.
          </p>
          <Button variant="primary" size="sm" className="w-full" onClick={onDrifter}>
            Become a Drifter
          </Button>
        </Card>
      </div>
    </div>
  );
}
