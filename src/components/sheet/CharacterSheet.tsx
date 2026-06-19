import './print.css';
import { useCharacterStore } from '../../stores/character';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LegitimacyBadge } from './LegitimacyBadge';
import { characteristicModifier, CHARACTERISTIC_IDS } from '../../types/common';
import { getNobleTitle } from '../../engine/career';
import type { OwnedEquipment } from '../../types/equipment';

function keyStat(item: OwnedEquipment['item']): string {
  switch (item.category) {
    case 'weapons':
      return item.damage;
    case 'armour':
      return `Prot ${item.protection}`;
    default:
      return `TL${item.tl}`;
  }
}

/**
 * Final review sheet (SHEE-02), shown at the `sheet` machine state.
 * Screen presentation of the same store the Dossier uses; the print
 * stylesheet (print.css) reflows it into the paper Field Manual (SHEE-03).
 */
export function CharacterSheet({ onDone }: { onDone?: () => void }) {
  const characteristics = useCharacterStore((s) => s.characteristics);
  const skills = useCharacterStore((s) => s.skills);
  const careerHistory = useCharacterStore((s) => s.careerHistory);
  const contacts = useCharacterStore((s) => s.contacts);
  const credits = useCharacterStore((s) => s.credits);
  const pension = useCharacterStore((s) => s.pension);
  const benefits = useCharacterStore((s) => s.benefits);
  const age = useCharacterStore((s) => s.age);
  const psiStrength = useCharacterStore((s) => s.psiStrength);
  const psiTalents = useCharacterStore((s) => s.psiTalents);
  const ownedEquipment = useCharacterStore((s) => s.ownedEquipment);

  const nobleTitle = getNobleTitle(characteristics.SOC);

  return (
    <div className="character-sheet space-y-6 max-w-3xl mx-auto">
      <div className="text-center py-4">
        <h1 className="text-3xl font-sans text-white mb-1">Character Sheet</h1>
        <p className="text-sm text-gray-400">
          Age {age} · {careerHistory.length} {careerHistory.length === 1 ? 'term' : 'terms'} served
          {nobleTitle && ` · ${nobleTitle}`}
        </p>
      </div>

      <LegitimacyBadge className="sheet-section" />

      <Card className="sheet-section">
        <h2 className="text-sm text-gray-400 uppercase tracking-wide mb-3">Characteristics</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 sheet-grid">
          {CHARACTERISTIC_IDS.map((id) => {
            const v = characteristics[id];
            const dm = characteristicModifier(v);
            const dmStr = dm >= 0 ? `+${dm}` : `${dm}`;
            return (
              <div key={id} className="text-center">
                <p className="text-xs text-gray-500 font-mono">{id}</p>
                <p className="text-xl text-white font-mono">{v}</p>
                <p className="text-xs text-gray-500 font-mono">{dmStr}</p>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="sheet-section">
        <h2 className="text-sm text-gray-400 uppercase tracking-wide mb-3">Skills ({skills.length})</h2>
        {skills.length === 0 ? (
          <p className="text-xs text-gray-500">No skills acquired.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {[...skills]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((s) => (
                <span
                  key={s.name}
                  className="sheet-pill px-2 py-1 bg-scanner-blue/10 border border-scanner-blue/30 rounded text-sm text-scanner-blue font-mono"
                >
                  {s.name} {s.level}
                </span>
              ))}
          </div>
        )}
      </Card>

      <Card className="sheet-section">
        <h2 className="text-sm text-gray-400 uppercase tracking-wide mb-3">Career History</h2>
        {careerHistory.length === 0 ? (
          <p className="text-xs text-gray-500">No career terms recorded.</p>
        ) : (
          <ul className="space-y-1">
            {careerHistory.map((t, i) => (
              <li key={i} className="text-sm text-gray-300 font-mono">
                Term {t.term}: <span className="capitalize">{t.career}</span> — {t.assignment} (rank {t.rank})
              </li>
            ))}
          </ul>
        )}
      </Card>

      {ownedEquipment.length > 0 && (
        <Card className="sheet-section">
          <h2 className="text-sm text-gray-400 uppercase tracking-wide mb-3">Equipment</h2>
          <ul className="space-y-1">
            {ownedEquipment.map((owned) => (
              <li key={owned.item.name} className="flex items-center justify-between text-sm">
                <span className="text-gray-300">
                  {owned.item.name}
                  {owned.quantity > 1 && <span className="text-gray-500"> ×{owned.quantity}</span>}
                </span>
                <span className="font-mono text-xs text-scanner-blue">{keyStat(owned.item)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {psiStrength !== null && (
        <Card className="sheet-section">
          <h2 className="text-sm text-gray-400 uppercase tracking-wide mb-3">
            Psionics · PSI {psiStrength}
          </h2>
          {psiTalents.length === 0 ? (
            <p className="text-xs text-gray-500">No talents.</p>
          ) : (
            <ul className="space-y-2">
              {psiTalents.map((t) => (
                <li key={t.talent}>
                  <span className="text-sm text-gray-300 capitalize">
                    {t.talent} <span className="text-gray-500">({t.level})</span>
                  </span>
                  <ul className="mt-0.5 space-y-0.5 pl-3 border-l border-white/5">
                    {t.powers.map((p) => (
                      <li key={p.name} className="text-xs text-gray-400">
                        {p.name} <span className="text-gray-600">(PSI {p.psiCost}, {p.range})</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {contacts.length > 0 && (
        <Card className="sheet-section">
          <h2 className="text-sm text-gray-400 uppercase tracking-wide mb-3">Contacts ({contacts.length})</h2>
          <ul className="space-y-1">
            {contacts.map((c, i) => (
              <li key={i} className="text-sm text-gray-300">
                <span className="capitalize text-scanner-blue">{c.type}</span>: {c.name}
                {c.notes && <span className="text-gray-500 text-xs"> — {c.notes}</span>}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="sheet-section">
        <h2 className="text-sm text-gray-400 uppercase tracking-wide mb-3">Finances</h2>
        <div className="grid grid-cols-2 gap-3 text-sm sheet-grid">
          <div>
            <p className="text-xs text-gray-500">Credits</p>
            <p className="text-white font-mono">Cr{credits.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Pension</p>
            <p className="text-white font-mono">{pension > 0 ? `Cr${pension.toLocaleString()}/yr` : '—'}</p>
          </div>
        </div>
        {benefits.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Benefits</p>
            <ul className="space-y-0.5">
              {benefits.map((b, i) => (
                <li key={i} className="text-sm text-gray-300">· {b}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* Actions — hidden on paper. */}
      <div className="print-hide flex items-center justify-center gap-3 pt-4" data-print-hide="true">
        <Button variant="secondary" onClick={() => window.print()}>
          Print / Save as PDF
        </Button>
        {onDone && (
          <Button variant="primary" onClick={onDone}>
            Done
          </Button>
        )}
      </div>
    </div>
  );
}
