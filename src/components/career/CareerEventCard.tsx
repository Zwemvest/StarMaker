import { useState, useCallback } from 'react';
import type { CareerEvent } from '../../types/careers';
import type { LifeEvent } from '../../data/life-events';
import { LIFE_EVENTS } from '../../data/life-events';
import { useCharacterStore } from '../../stores/character';
import { useLoggedRoll } from '../../hooks/useLoggedRoll';
import { resolveUnusualEvent } from '../../engine/unusual-events';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface CareerEventCardProps {
  event: CareerEvent;
  onResolved: (bonusDM: number) => void;
}

/**
 * Compute the advancement DM granted by an event (CRER-11). A plain
 * `advancement_dm` effect contributes its `value`; a `choice` effect contributes
 * its `value` only when the user picked an option whose label mentions
 * "advancement". Returns 0 for events (and life events) that grant no DM.
 */
function computeAdvancementBonus(
  effectSource: { effects: Array<{ type: string; value?: number; options?: string[] }> },
  choiceIndex?: number,
): number {
  let bonus = 0;
  for (const eff of effectSource.effects) {
    if (eff.type === 'advancement_dm' && typeof eff.value === 'number') {
      bonus += eff.value;
    }
    if (eff.type === 'choice' && choiceIndex !== undefined && typeof eff.value === 'number') {
      const option = eff.options?.[choiceIndex];
      if (option && /advancement/i.test(option)) {
        bonus += eff.value;
      }
    }
  }
  return bonus;
}

/**
 * Career event display card (D-03).
 * Shows narrative text with mechanical effects.
 * Rolls on LIFE_EVENTS for event roll 7 (CRER-09).
 * Applies effects to store: skills, contacts, characteristics.
 */
export function CareerEventCard({ event, onResolved }: CareerEventCardProps) {
  const { loggedRoll2D, loggedRoll1D } = useLoggedRoll();
  const addSkill = useCharacterStore((s) => s.addSkill);
  const addContact = useCharacterStore((s) => s.addContact);
  const setPsionicsUnlocked = useCharacterStore((s) => s.setPsionicsUnlocked);

  const [lifeEvent, setLifeEvent] = useState<LifeEvent | null>(null);
  const [lifeEventRolled, setLifeEventRolled] = useState(false);
  const [choiceMade, setChoiceMade] = useState(false);

  const isLifeEventRedirect = event.rollValue === 7;

  const handleRollLifeEvent = useCallback(async () => {
    const roll = await loggedRoll2D('Life Events Table');
    const total = roll.results.reduce((a, b) => a + b, 0);
    const found = LIFE_EVENTS.find((le) => le.rollValue === total) ?? LIFE_EVENTS[5]; // fallback to roll 7 (New Contact)
    setLifeEvent(found);
    setLifeEventRolled(true);
  }, [loggedRoll2D]);

  const applyEffects = useCallback(async (choiceIndex?: number) => {
    const effectSource = lifeEvent ?? event;
    const effects = effectSource.effects;

    for (const eff of effects) {
      // Effects have either {target, value} (life-events) or {detail} (career events)
      const anyEff = eff as { type: string; target?: string; value?: number; detail?: string; description?: string };
      const notes = anyEff.detail ?? anyEff.description ?? '';

      if (eff.type === 'skill') {
        if (anyEff.target && anyEff.value !== undefined) {
          addSkill(anyEff.target, anyEff.value);
        }
      }
      if (eff.type === 'contact') {
        addContact({ name: 'Career Contact', type: 'contact', notes });
      }
      if (eff.type === 'ally') {
        addContact({ name: 'Career Ally', type: 'ally', notes });
      }
      if (eff.type === 'rival') {
        addContact({ name: 'Career Rival', type: 'rival', notes });
      }
      if (eff.type === 'enemy') {
        addContact({ name: 'Career Enemy', type: 'enemy', notes });
      }
    }

    // Apply choice if made
    if (choiceIndex !== undefined && event.hasChoice) {
      const choiceEffect = event.effects.find((e) => e.type === 'choice');
      if (choiceEffect?.options?.[choiceIndex]) {
        const option = choiceEffect.options[choiceIndex];
        const match = option.match(/^(.+?)\s+(\d+)$/);
        if (match) {
          addSkill(match[1], parseInt(match[2], 10));
        }
      }
    }

    // Life Events roll 12 -> roll the 1D Unusual sub-table; result 1 ("Psionics")
    // legitimately unlocks psionics testing (D-2). Other results are narrative.
    if (lifeEvent?.rollValue === 12) {
      const subRoll = await loggedRoll1D('Unusual Event Sub-Table');
      const unusual = resolveUnusualEvent(subRoll.total);
      if (unusual.unlocksPsionics) {
        setPsionicsUnlocked();
      }
    }
  }, [lifeEvent, event, addSkill, addContact, loggedRoll1D, setPsionicsUnlocked]);

  const handleResolve = async (choiceIndex?: number) => {
    await applyEffects(choiceIndex);
    const bonus = computeAdvancementBonus(lifeEvent ?? event, choiceIndex);
    setChoiceMade(true);
    onResolved(bonus);
  };

  const displayEvent = lifeEvent ?? event;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-sans font-medium text-white mb-1">Career Event</h2>
        {isLifeEventRedirect && !lifeEventRolled && (
          <p className="text-sm text-amber-400">Roll on the Life Events table for this result.</p>
        )}
      </div>

      <Card className="border-l-4 border-l-scanner-blue/60">
        <div className="space-y-3">
          <p className="text-sm text-gray-300 italic leading-relaxed">
            {displayEvent.description}
          </p>

          <div className="border-t border-gray-700 pt-2">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Effects</p>
            <p className="text-sm text-scanner-blue">{displayEvent.effectDescription}</p>
          </div>

          {/* Life event redirect */}
          {isLifeEventRedirect && !lifeEventRolled && (
            <Button variant="primary" size="sm" onClick={handleRollLifeEvent} className="w-full">
              Roll on Life Events Table
            </Button>
          )}

          {/* Choice buttons */}
          {(!isLifeEventRedirect || lifeEventRolled) && !choiceMade && (
            <div className="pt-1">
              {event.hasChoice && event.effects.some((e) => e.type === 'choice') ? (
                event.effects
                  .filter((e) => e.type === 'choice')
                  .map((choiceEffect) => (
                    <div key={choiceEffect.detail} className="space-y-2">
                      <p className="text-xs text-gray-400">{choiceEffect.detail}</p>
                      <div className="flex flex-wrap gap-2">
                        {(choiceEffect.options ?? []).map((option, i) => (
                          <Button
                            key={i}
                            variant="secondary"
                            size="sm"
                            onClick={() => handleResolve(i)}
                          >
                            {option}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))
              ) : (
                <Button variant="primary" size="sm" onClick={() => handleResolve()} className="w-full">
                  Continue
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
