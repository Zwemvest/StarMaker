import { useRef, useState } from 'react';
import { useCharacterStore } from '../../stores/character';
import { characteristicModifier } from '../../types/common';
import { isTelepathyAutoGranted } from '../../engine/psionics';
import { PSI_TALENTS } from '../../data/psionics';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { PsiGate } from './PsiGate';
import { PsiTestCard } from './PsiTestCard';
import { TalentLearnCard } from './TalentLearnCard';
import type { CreationEvent } from '../../machines/creation';
import type { PsiTalentData } from '../../types/psionics';

interface PsionicsStepProps {
  send: (event: CreationEvent) => void;
}

type Phase = 'gate' | 'test' | 'talents' | 'done';

/**
 * Psionics step orchestrator (D-2, PSIN-01..06).
 *
 * Drives a local flow: gate → test → talents → done.
 * - Locked: PsiGate (primary Skip / secondary Test-anyway with confirm).
 * - Unlocked: roll PSI strength, then learn the five talents in PSI_TALENTS
 *   order with a cumulative -1 per prior attempt; Telepathy-first auto-granted.
 */
export function PsionicsStep({ send }: PsionicsStepProps) {
  const psionicsUnlocked = useCharacterStore((s) => s.psionicsUnlocked);
  const psiStrength = useCharacterStore((s) => s.psiStrength);
  const careerHistory = useCharacterStore((s) => s.careerHistory);
  const forcePsionicsUnlock = useCharacterStore((s) => s.forcePsionicsUnlock);
  const setPsiStrength = useCharacterStore((s) => s.setPsiStrength);
  const addPsiTalent = useCharacterStore((s) => s.addPsiTalent);

  const [phase, setPhase] = useState<Phase>(psionicsUnlocked ? 'test' : 'gate');
  const [talentIndex, setTalentIndex] = useState(0);
  const [priorAttempts, setPriorAttempts] = useState(0);

  const termsServed = careerHistory.length;
  const completedRef = useRef(false);

  const complete = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    setPhase('done');
    send({ type: 'PSIONICS_COMPLETE' });
  };

  const handleForce = () => {
    void forcePsionicsUnlock();
    setPhase('test');
  };

  const handleTestComplete = (strength: number) => {
    setPsiStrength(strength);
    setPhase('talents');
  };

  const advanceTalent = () => {
    const nextIndex = talentIndex + 1;
    setPriorAttempts((p) => p + 1);
    if (nextIndex >= PSI_TALENTS.length) {
      complete();
    } else {
      setTalentIndex(nextIndex);
    }
  };

  const handleLearned = (talent: PsiTalentData) => {
    addPsiTalent({ talent: talent.name, level: 1, powers: talent.powers });
  };

  // --- Gate ---
  if (phase === 'gate') {
    return <PsiGate onSkip={complete} onForce={handleForce} />;
  }

  // --- Test ---
  if (phase === 'test') {
    return <PsiTestCard termsServed={termsServed} onComplete={handleTestComplete} />;
  }

  // --- Talents ---
  if (phase === 'talents') {
    const talent = PSI_TALENTS[talentIndex];
    const autoGranted = isTelepathyAutoGranted(talent.name, priorAttempts);
    const psiDM = characteristicModifier(psiStrength ?? 0);

    return (
      <div className="space-y-4">
        <Card className="border-scanner-blue/40">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 uppercase tracking-wide">
              Talent {talentIndex + 1} of {PSI_TALENTS.length}
            </span>
            <span className="font-mono text-sm text-scanner-blue">
              PSI {psiStrength ?? 0}
            </span>
          </div>
        </Card>

        <TalentLearnCard
          key={talent.name}
          talent={talent}
          psiDM={psiDM}
          priorAttempts={priorAttempts}
          autoGranted={autoGranted}
          onLearned={(t) => handleLearned(t)}
          onSkip={advanceTalent}
        />

        <Button variant="secondary" className="w-full" onClick={complete}>
          Finish Psionics
        </Button>
      </div>
    );
  }

  return null;
}
