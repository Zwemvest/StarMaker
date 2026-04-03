import { useState, useMemo } from 'react';
import type { CareerData } from '../../types/careers';
import {
  calculateBenefitRolls,
  getRankBonusRolls,
  getRankDM,
  calculatePension,
  getCombinedRank,
} from '../../engine/mustering-out';
import { useCharacterStore } from '../../stores/character';
import { BenefitRoll } from './BenefitRoll';
import { PensionSummary } from './PensionSummary';
import type { CreationEvent } from '../../machines/creation';

interface MusteringOutStepProps {
  career: CareerData;
  termsInCareer: number;
  totalTermsServed: number;
  mishapTerm: boolean;
  enlistedRank: number;
  officerRank: number;
  isMilitary: boolean;
  send: (event: CreationEvent) => void;
}

/**
 * Mustering out orchestrator (D-14).
 * Calculates total benefit rolls: terms (MSTR-04) + rank bonuses (MSTR-02).
 * Shows BenefitRoll cards sequentially, one at a time.
 * Uses combined rank for military careers (MSTR-05).
 * Shows PensionSummary after all rolls are complete.
 */
export function MusteringOutStep({
  career,
  termsInCareer,
  totalTermsServed,
  mishapTerm,
  enlistedRank,
  officerRank,
  isMilitary,
  send,
}: MusteringOutStepProps) {
  const cashRollsUsed = useCharacterStore((s) => s.cashRollsUsed);
  const credits = useCharacterStore((s) => s.credits);
  const benefits = useCharacterStore((s) => s.benefits);
  const setPension = useCharacterStore((s) => s.setPension);

  // Calculate effective rank for bonus rolls
  const effectiveRank = isMilitary ? getCombinedRank(enlistedRank, officerRank) : enlistedRank;

  // Calculate total benefit rolls
  const baseRolls = calculateBenefitRolls(termsInCareer, mishapTerm);
  const bonusRolls = getRankBonusRolls(effectiveRank);
  const totalRolls = baseRolls + bonusRolls;
  const rankDM = getRankDM(effectiveRank);

  const [completedRolls, setCompletedRolls] = useState(0);
  const [showSummary, setShowSummary] = useState(totalRolls === 0);

  const pension = useMemo(() => calculatePension(totalTermsServed), [totalTermsServed]);

  const handleBenefitRolled = () => {
    const next = completedRolls + 1;
    setCompletedRolls(next);
    if (next >= totalRolls) {
      // Set pension in store
      setPension(pension);
      setShowSummary(true);
    } else {
      send({ type: 'BENEFIT_ROLLED' });
    }
  };

  const handleComplete = () => {
    send({ type: 'MUSTERING_COMPLETE' });
  };

  if (showSummary) {
    return (
      <PensionSummary
        totalTerms={totalTermsServed}
        totalCredits={credits}
        benefits={benefits}
        pension={pension}
        onComplete={handleComplete}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-sans font-medium text-white mb-1">Mustering Out</h2>
        <p className="text-sm text-gray-400">
          You have {totalRolls} benefit roll{totalRolls !== 1 ? 's' : ''} —
          {baseRolls} from {termsInCareer} term{termsInCareer !== 1 ? 's' : ''}
          {bonusRolls > 0 ? `, +${bonusRolls} from rank ${effectiveRank}` : ''}.
          {mishapTerm && ' (Mishap: one fewer roll)'}
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex gap-1.5">
        {Array.from({ length: totalRolls }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${
              i < completedRolls ? 'bg-scanner-blue' : 'bg-gray-700'
            }`}
          />
        ))}
      </div>

      {/* Current roll */}
      <BenefitRoll
        key={completedRolls}
        career={career}
        rollNumber={completedRolls + 1}
        totalRolls={totalRolls}
        cashRollsUsed={cashRollsUsed}
        rankDM={rankDM}
        onRolled={handleBenefitRolled}
      />
    </div>
  );
}
