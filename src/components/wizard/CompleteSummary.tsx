import { useCharacterStore } from '../../stores/character';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { characteristicModifier, CHARACTERISTIC_IDS } from '../../types/common';
import { getNobleTitle } from '../../engine/career';

/**
 * Terminal view for completed characters. Shown when currentPhase === 'complete'.
 * Read-only summary of everything accumulated during creation. Rendered after
 * mustering out and also on a page refresh (via the persisted creationPhase flag).
 */
export function CompleteSummary() {
  const characteristics = useCharacterStore((s) => s.characteristics);
  const skills = useCharacterStore((s) => s.skills);
  const careerHistory = useCharacterStore((s) => s.careerHistory);
  const credits = useCharacterStore((s) => s.credits);
  const pension = useCharacterStore((s) => s.pension);
  const benefits = useCharacterStore((s) => s.benefits);
  const age = useCharacterStore((s) => s.age);
  const legitimacyHash = useCharacterStore((s) => s.legitimacyHash);
  const contacts = useCharacterStore((s) => s.contacts);

  const nobleTitle = getNobleTitle(characteristics.SOC);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center py-4">
        <h1 className="text-3xl font-sans text-white mb-1">Character Complete</h1>
        <p className="text-sm text-gray-400">
          Age {age} · {careerHistory.length} {careerHistory.length === 1 ? 'term' : 'terms'} served
          {nobleTitle && ` · ${nobleTitle}`}
        </p>
      </div>

      <Card>
        <h2 className="text-sm text-gray-400 uppercase tracking-wide mb-3">Characteristics</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
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

      <Card>
        <h2 className="text-sm text-gray-400 uppercase tracking-wide mb-3">Skills ({skills.length})</h2>
        {skills.length === 0 ? (
          <p className="text-xs text-gray-500">No skills acquired.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <span
                key={s.name}
                className="px-2 py-1 bg-scanner-blue/10 border border-scanner-blue/30 rounded text-sm text-scanner-blue font-mono"
              >
                {s.name} {s.level}
              </span>
            ))}
          </div>
        )}
      </Card>

      <Card>
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

      <Card>
        <h2 className="text-sm text-gray-400 uppercase tracking-wide mb-3">Muster Out</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
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

      {contacts.length > 0 && (
        <Card>
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

      <Card>
        <h2 className="text-sm text-gray-400 uppercase tracking-wide mb-1">Legitimacy Hash</h2>
        <p className="text-xs text-gray-500 font-mono break-all">{legitimacyHash || '—'}</p>
      </Card>

      <div className="text-center pt-4">
        <Button variant="secondary" disabled>
          Post-Career Features (Phase 4)
        </Button>
      </div>
    </div>
  );
}
