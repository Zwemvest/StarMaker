import type { Mishap } from '../../types/careers';
import { useCharacterStore } from '../../stores/character';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface MishapCardProps {
  mishap: Mishap;
  onResolved: () => void;
}

/**
 * Mishap display card — shown when survival roll fails.
 * Applies mishap effects to the store and forces career exit via MISHAP_RESOLVED.
 */
export function MishapCard({ mishap, onResolved }: MishapCardProps) {
  const addSkill = useCharacterStore((s) => s.addSkill);
  const addContact = useCharacterStore((s) => s.addContact);

  const handleContinue = () => {
    // Apply mishap effects
    for (const effect of mishap.effects) {
      if (effect.type === 'skill') {
        // Mishap effects use 'detail' field from the data structure
        const detail = (effect as { detail?: string }).detail ?? '';
        const match = detail.match(/^(.+?)\s+(\d+)$/);
        if (match) addSkill(match[1], parseInt(match[2], 10));
      }
      if (effect.type === 'contact' || effect.type === 'ally') {
        const detail = (effect as { detail?: string }).detail ?? '';
        addContact({ name: 'Contact from mishap', type: 'contact', notes: detail });
      }
      if (effect.type === 'rival' || effect.type === 'enemy') {
        const detail = (effect as { detail?: string }).detail ?? '';
        addContact({ name: 'Enemy from mishap', type: 'enemy', notes: detail });
      }
    }
    onResolved();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-sans font-medium text-red-400 mb-1">Mishap!</h2>
        <p className="text-sm text-gray-400">
          You have suffered a mishap. You are forced to leave this career.
        </p>
      </div>

      <Card className="border-red-700/50 border-l-4 border-l-red-600">
        <div className="space-y-3">
          <p className="text-sm text-gray-200 italic leading-relaxed">
            {mishap.description}
          </p>

          <div className="border-t border-gray-700 pt-2">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Effects</p>
            <p className="text-sm text-red-300">{mishap.effectDescription}</p>
            {mishap.effects.length > 0 && (
              <ul className="mt-1 space-y-0.5">
                {mishap.effects.map((effect, i) => (
                  <li key={i} className="text-xs text-gray-400">
                    {(effect as { detail?: string }).detail ?? effect.type}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-gray-700 pt-2">
            <p className="text-xs text-amber-400">
              You will proceed to mustering out with reduced benefit rolls.
            </p>
          </div>
        </div>
      </Card>

      <Button variant="secondary" onClick={handleContinue} className="w-full">
        Continue to Mustering Out
      </Button>
    </div>
  );
}
