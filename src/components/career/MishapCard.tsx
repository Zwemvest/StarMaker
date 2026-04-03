import { useCallback } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useCharacterStore } from '../../stores/character';
import type { MishapEntry } from '../../types/careers';

interface MishapCardProps {
  mishap: MishapEntry;
  onResolved: () => void;
}

/**
 * Mishap display card.
 *
 * Shown when a survival roll fails. Displays the mishap description
 * and mechanical effects, then applies effects to the character store.
 * Mishap always forces career exit.
 */
export function MishapCard({ mishap, onResolved }: MishapCardProps) {
  const addSkill = useCharacterStore((s) => s.addSkill);
  const setCharacteristic = useCharacterStore((s) => s.setCharacteristic);
  const characteristics = useCharacterStore((s) => s.characteristics);

  const handleContinue = useCallback(() => {
    // Apply mishap effects to store
    if (mishap.effects) {
      for (const effect of mishap.effects) {
        switch (effect.type) {
          case 'skill':
            if (effect.detail) {
              const match = effect.detail.match(/^(.+?)\s+(\d+)$/);
              if (match) {
                addSkill(match[1], parseInt(match[2], 10));
              }
            }
            break;
          case 'characteristic': {
            if (effect.detail) {
              // Parse characteristic changes like "STR -1" or "END -2"
              const charMatch = effect.detail.match(/^(STR|DEX|END|INT|EDU|SOC)\s*([+-]\d+)$/);
              if (charMatch) {
                const charId = charMatch[1] as keyof typeof characteristics;
                const delta = parseInt(charMatch[2], 10);
                setCharacteristic(charId, Math.max(0, characteristics[charId] + delta));
              }
            }
            break;
          }
          case 'injury':
            // Injury effects reduce physical characteristics
            // The specific reduction is handled by the mishap description
            break;
          case 'contact':
          case 'ally':
          case 'rival':
          case 'enemy':
            // SOCL-01: Contact tracking is managed through the store
            // These are noted in the mishap description for the player
            break;
          default:
            break;
        }
      }
    }

    onResolved();
  }, [mishap, addSkill, setCharacteristic, characteristics, onResolved]);

  return (
    <Card className="border-l-4 border-l-modified/60" glowColor="#ef4444">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-sans font-bold text-modified">MISHAP</h3>
          <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">
            Career Terminated
          </p>
        </div>

        {/* Narrative description */}
        <p className="text-sm text-gray-300 italic leading-relaxed">
          {mishap.description}
        </p>

        {/* Mechanical effects */}
        <div className="border-t border-gray-700 pt-2">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Effects</p>
          <p className="text-sm text-modified">{mishap.effectDescription}</p>
          {mishap.effects && mishap.effects.length > 0 && (
            <ul className="mt-1 space-y-0.5">
              {mishap.effects.map((effect, i) => (
                <li key={i} className="text-xs text-gray-400">
                  {effect.type}: {effect.detail}
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="text-xs text-gray-500 italic">
          You must leave this career and proceed to mustering out.
        </p>

        <Button variant="primary" size="md" onClick={handleContinue} className="w-full">
          Continue to Mustering Out
        </Button>
      </div>
    </Card>
  );
}
