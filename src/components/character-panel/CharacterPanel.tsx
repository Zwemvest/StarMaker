import { useCharacterStore } from '../../stores/character';
import { characteristicModifier } from '../../types/common';
import type { CharacteristicId } from '../../types/common';

const PHYSICAL: CharacteristicId[] = ['STR', 'DEX', 'END'];
const MENTAL: CharacteristicId[] = ['INT', 'EDU', 'SOC'];

function CharacteristicCell({ id, value }: { id: CharacteristicId; value: number }) {
  const dm = characteristicModifier(value);
  const dmStr = dm >= 0 ? `+${dm}` : `${dm}`;

  return (
    <div className="flex flex-col items-center p-2 rounded bg-terminal-bg/50">
      <span className="text-xs text-gray-400 uppercase tracking-wide">{id}</span>
      <span className="text-xl font-mono text-white">
        {value || '-'}
      </span>
      <span className="text-xs font-mono text-scanner-blue">
        DM {dmStr}
      </span>
    </div>
  );
}

export function CharacterPanel() {
  const characteristics = useCharacterStore((s) => s.characteristics);
  const skills = useCharacterStore((s) => s.skills);

  return (
    <div className="space-y-6">
      <h2 className="text-sm font-sans font-medium text-scanner-blue uppercase tracking-wider">
        Character Summary
      </h2>

      {/* Characteristics - 2x3 grid: Physical left, Mental right */}
      <div>
        <h3 className="text-xs text-gray-500 uppercase tracking-wide mb-2">
          Characteristics
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Physical column */}
          <div className="space-y-2">
            <span className="text-xs text-gray-500">Physical</span>
            {PHYSICAL.map((id) => (
              <CharacteristicCell
                key={id}
                id={id}
                value={characteristics[id]}
              />
            ))}
          </div>
          {/* Mental column */}
          <div className="space-y-2">
            <span className="text-xs text-gray-500">Mental</span>
            {MENTAL.map((id) => (
              <CharacteristicCell
                key={id}
                id={id}
                value={characteristics[id]}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Skills */}
      <div>
        <h3 className="text-xs text-gray-500 uppercase tracking-wide mb-2">
          Skills
        </h3>
        {skills.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No skills yet</p>
        ) : (
          <ul className="space-y-1">
            {[...skills]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((skill) => (
                <li
                  key={skill.name}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-300">{skill.name}</span>
                  <span className="font-mono text-scanner-blue">{skill.level}</span>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}
