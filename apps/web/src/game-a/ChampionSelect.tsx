import { useMemo, useState, type CSSProperties } from "react";
import { CreatureMark } from "./CreatureMark";
import {
  getChampionsForRegion,
  type ChampionDefinition,
  type RegionDefinition,
} from "./world";

export function ChampionSelect({
  region,
  onChoose,
  onBack,
}: {
  region: RegionDefinition;
  onChoose: (champion: ChampionDefinition) => void;
  onBack: () => void;
}) {
  const champions = useMemo(
    () => getChampionsForRegion(region.id),
    [region.id],
  );
  const [focusedId, setFocusedId] = useState(champions[0]?.id ?? "");
  const focused = champions.find((champion) => champion.id === focusedId) ?? champions[0];

  if (!focused) return null;

  return (
    <section
      className="journey-screen champion-screen"
      style={{
        "--region-color": region.palette.primary,
        "--region-accent": region.palette.accent,
      } as CSSProperties}
    >
      <div className="journey-topline">
        <button className="story-back" onClick={onBack}>← Back to map</button>
        <div className="story-step">02 · THE FIRST BOND</div>
      </div>

      <div className="warden-scene">
        <div className="warden-visual" aria-hidden="true">
          <div className="warden-glow" />
          <div className="warden-hood">
            <div className="warden-face" />
          </div>
          <div className="warden-cloak" />
          <div className="warden-orb" />
        </div>

        <div className="warden-copy">
          <span className="story-kicker">THE WARDEN</span>
          <p className="warden-dialogue">
            “Every path begins with a bond. The lands will change your Champion —
            and your Champion will change with them. Choose the one whose first
            step feels like your own.”
          </p>
          <span className="warden-location">At the threshold of {region.name}</span>
        </div>
      </div>

      <div className="champion-choice-heading">
        <div>
          <span className="story-kicker">{region.subtitle}</span>
          <h1>Select your Champion</h1>
        </div>
        <p>
          This is your starting form, not your final one. Skills, relics, and
          discoveries across the map will shape what this Champion becomes.
        </p>
      </div>

      <div className="champion-grid">
        {champions.map((champion) => (
          <button
            key={champion.id}
            className={`champion-card ${focused.id === champion.id ? "selected" : ""}`}
            onClick={() => setFocusedId(champion.id)}
            style={{
              "--champion-primary": champion.palette.primary,
              "--champion-secondary": champion.palette.secondary,
              "--champion-accent": champion.palette.accent,
            } as CSSProperties}
          >
            <div className="champion-portrait">
              <div className="champion-aura" />
              <CreatureMark champion={champion} />
            </div>
            <div className="champion-card-copy">
              <span>{champion.archetype}</span>
              <h2>{champion.name}</h2>
              <p>{champion.personality}</p>
            </div>
          </button>
        ))}
      </div>

      <div
        className="champion-detail"
        style={{
          "--champion-primary": focused.palette.primary,
          "--champion-secondary": focused.palette.secondary,
          "--champion-accent": focused.palette.accent,
        } as CSSProperties}
      >
        <div className="champion-detail-copy">
          <span className="story-kicker">YOUR FIRST FORM</span>
          <h2>{focused.name}</h2>
          <p>{focused.description}</p>
        </div>

        <div className="champion-abilities">
          {focused.abilities.map((ability) => (
            <div key={ability.name}>
              <strong>{ability.name}</strong>
              <span>{ability.description}</span>
            </div>
          ))}
        </div>

        <div className="evolution-preview">
          <small>POSSIBLE FUTURE DIRECTIONS</small>
          <div>
            {focused.evolutionPaths.map((path) => (
              <span key={path}>{path}</span>
            ))}
          </div>
        </div>

        <button className="story-primary champion-confirm" onClick={() => onChoose(focused)}>
          Bond with {focused.name}
        </button>
      </div>
    </section>
  );
}
