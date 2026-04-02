import type { EducationEvent } from '../../types/education';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface EventCardProps {
  event: EducationEvent;
  onResolve: (choiceIndex?: number) => void;
}

/**
 * Narrative education event card.
 *
 * Shows flavor text (description), mechanical effects, and choice buttons
 * when applicable. For choice effects with an options array, renders one
 * button per option. Styled with a scanner-blue left border accent and
 * italic description text for a distinct narrative feel.
 */
export function EventCard({ event, onResolve }: EventCardProps) {
  // Extract choice effects (with options) and non-choice effects
  const choiceEffects = event.effects.filter((e) => e.type === 'choice');
  const nonChoiceEffects = event.effects.filter((e) => e.type !== 'choice');

  return (
    <Card className="border-l-4 border-l-scanner-blue/60">
      <div className="space-y-3">
        {/* Narrative description */}
        <p className="text-sm text-gray-300 italic leading-relaxed">
          {event.description}
        </p>

        {/* Mechanical effects */}
        <div className="border-t border-gray-700 pt-2">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Effects</p>
          <p className="text-sm text-scanner-blue">{event.effectDescription}</p>
          {nonChoiceEffects.length > 0 && (
            <ul className="mt-1 space-y-0.5">
              {nonChoiceEffects.map((effect, i) => (
                <li key={i} className="text-xs text-gray-400">
                  {effect.detail}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Choice buttons or Continue */}
        <div className="flex flex-wrap gap-2">
          {event.hasChoice && choiceEffects.length > 0 ? (
            choiceEffects.map((effect) =>
              effect.options && effect.options.length > 0 ? (
                // Render individual option buttons
                <div key={effect.detail} className="w-full space-y-2">
                  <p className="text-xs text-gray-400">{effect.detail}</p>
                  <div className="flex flex-wrap gap-2">
                    {effect.options.map((option, optIdx) => (
                      <Button
                        key={optIdx}
                        variant="secondary"
                        size="sm"
                        onClick={() => onResolve(optIdx)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                // Fallback for choice effects without options array
                <Button
                  key={effect.detail}
                  variant="secondary"
                  size="sm"
                  onClick={() => onResolve(0)}
                >
                  {effect.detail}
                </Button>
              ),
            )
          ) : (
            <Button variant="primary" size="sm" onClick={() => onResolve()}>
              Continue
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
