import { useCallback, useState, useMemo } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useCharacterStore } from '../../stores/character';
import { LIFE_EVENTS } from '../../data/life-events';
import { rollDie } from '../../engine/dice';
import type { CareerEventEntry } from '../../types/careers';

/** Life event entry shape — matches data/life-events.ts */
interface LifeEvent {
  rollValue: number;
  description: string;
  effectDescription: string;
  effects: Array<{ type: string; detail: string; options?: string[] }>;
  hasChoice?: boolean;
}

interface CareerEventCardProps {
  event: CareerEventEntry;
  onResolved: () => void;
}

/**
 * Career event display card (D-03).
 *
 * Follows the same scanner-blue border, italic flavor text pattern
 * as the education EventCard. For roll=7, redirects to the life
 * events table (CRER-09).
 *
 * Shows event description and mechanical effects. If the event
 * has choices, renders choice buttons. Applies effects to the
 * character store on resolution.
 */
export function CareerEventCard({ event, onResolved }: CareerEventCardProps) {
  const addSkill = useCharacterStore((s) => s.addSkill);
  const setCharacteristic = useCharacterStore((s) => s.setCharacteristic);
  const characteristics = useCharacterStore((s) => s.characteristics);
  const skills = useCharacterStore((s) => s.skills);
  const existingSkillNames = useMemo(() => skills.map((s) => s.name), [skills]);

  // For roll=7 life event redirect (CRER-09)
  const [lifeEvent, setLifeEvent] = useState<LifeEvent | null>(() => {
    if (event.rollValue === 7) {
      // Roll on life events table
      const roll1 = rollDie(6);
      const roll2 = rollDie(6);
      const lifeEventRoll = roll1 * 10 + roll2; // D66
      const found = LIFE_EVENTS.find((le: LifeEvent) => le.rollValue === lifeEventRoll);
      return found || null;
    }
    return null;
  });

  // If this is a life event redirect, display the life event instead
  const displayEvent = lifeEvent
    ? {
        description: lifeEvent.description,
        effectDescription: lifeEvent.effectDescription,
        effects: lifeEvent.effects,
        hasChoice: lifeEvent.hasChoice || false,
      }
    : event;

  const applyEffects = useCallback(
    (choiceIndex?: number) => {
      const effects = displayEvent.effects || [];

      for (const effect of effects) {
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
              const charMatch = effect.detail.match(
                /^(STR|DEX|END|INT|EDU|SOC)\s*([+-]\d+)$/,
              );
              if (charMatch) {
                const charId = charMatch[1] as keyof typeof characteristics;
                const delta = parseInt(charMatch[2], 10);
                setCharacteristic(
                  charId,
                  Math.max(0, characteristics[charId] + delta),
                );
              }
            }
            break;
          }
          case 'choice': {
            // Apply the chosen option if a choice was made
            if (choiceIndex !== undefined && effect.options && effect.options[choiceIndex]) {
              const option = effect.options[choiceIndex];
              const match = option.match(/^(.+?)\s+(\d+)$/);
              if (match) {
                addSkill(match[1], parseInt(match[2], 10));
              }
            }
            break;
          }
          case 'contact':
          case 'ally':
          case 'rival':
          case 'enemy':
            // SOCL-01: Tracked in character store contacts array
            break;
          case 'benefit':
          case 'special':
          case 'injury':
            // These effects are noted in the description for the player
            break;
          default:
            break;
        }
      }

      onResolved();
    },
    [displayEvent.effects, addSkill, setCharacteristic, characteristics, onResolved],
  );

  // Extract choice effects
  const choiceEffects = (displayEvent.effects || []).filter((e) => e.type === 'choice');
  const nonChoiceEffects = (displayEvent.effects || []).filter((e) => e.type !== 'choice');

  return (
    <Card className="border-l-4 border-l-scanner-blue/60">
      <div className="space-y-3">
        {/* Life event redirect indicator */}
        {lifeEvent && (
          <p className="text-xs text-scanner-blue uppercase tracking-wide">
            Life Event
          </p>
        )}

        {/* Narrative description */}
        <p className="text-sm text-gray-300 italic leading-relaxed">
          {displayEvent.description}
        </p>

        {/* Mechanical effects */}
        <div className="border-t border-gray-700 pt-2">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Effects</p>
          <p className="text-sm text-scanner-blue">{displayEvent.effectDescription}</p>
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
          {displayEvent.hasChoice && choiceEffects.length > 0 ? (
            choiceEffects.map((effect) =>
              effect.options && effect.options.length > 0 ? (
                <div key={effect.detail} className="w-full space-y-2">
                  <p className="text-xs text-gray-400">{effect.detail}</p>
                  <div className="flex flex-wrap gap-2">
                    {effect.options.map((option, optIdx) => {
                      const match = option.match(/^(.+?)\s+(\d+)$/);
                      const isOwned = match
                        ? existingSkillNames.includes(match[1])
                        : false;
                      return (
                        <Button
                          key={optIdx}
                          variant="secondary"
                          size="sm"
                          onClick={() => applyEffects(optIdx)}
                          className={isOwned ? 'opacity-50' : ''}
                        >
                          {option}
                          {isOwned && (
                            <span className="text-gray-500 text-xs ml-1">
                              (already owned)
                            </span>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <Button
                  key={effect.detail}
                  variant="secondary"
                  size="sm"
                  onClick={() => applyEffects(0)}
                >
                  {effect.detail}
                </Button>
              ),
            )
          ) : (
            <Button variant="primary" size="sm" onClick={() => applyEffects()}>
              Continue
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
