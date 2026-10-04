import { useMemo, useState, type CSSProperties } from "react";
import { REGIONS, type RegionDefinition, type RegionId } from "./world";

export function WorldMap({
  onChoose,
  onBack,
}: {
  onChoose: (region: RegionDefinition) => void;
  onBack: () => void;
}) {
  const [selectedId, setSelectedId] = useState<RegionId>("insectoid");
  const selected = useMemo(
    () => REGIONS.find((region) => region.id === selectedId)!,
    [selectedId],
  );

  return (
    <section className="journey-screen world-screen">
      <div className="journey-topline">
        <button className="story-back" onClick={onBack}>← Invisi-Play</button>
        <div className="story-step">01 · CHOOSE YOUR BEGINNING</div>
      </div>

      <div className="world-layout">
        <div className="map-stage">
          <div className="map-copy">
            <span className="story-kicker">THE LIVING LANDS</span>
            <h1>Where will your Champion begin?</h1>
            <p>
              Every realm teaches different skills. Your starting choice changes
              the first chapter, but the whole map will eventually open to you.
            </p>
          </div>

          <div className="world-map-canvas" aria-label="Map of the starting realms">
            <svg className="map-land" viewBox="0 0 1000 620" aria-hidden="true">
              <defs>
                <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="18" stdDeviation="18" floodOpacity=".28" />
                </filter>
              </defs>
              <path
                d="M90 186 C140 76 266 65 344 121 C410 166 447 133 518 92 C614 36 739 76 778 170 C810 247 915 243 938 338 C963 442 857 527 748 505 C657 488 601 555 503 534 C412 515 390 463 298 490 C192 522 82 447 74 349 C69 288 60 247 90 186Z"
                fill="#193d3a"
                stroke="#2b5851"
                strokeWidth="8"
                filter="url(#soft-shadow)"
              />
              <path d="M98 360 C199 319 250 382 317 344 C381 307 409 226 491 231" fill="none" stroke="#6b927b" strokeWidth="9" strokeLinecap="round" opacity=".45" />
              <path d="M519 221 C583 265 629 239 681 212 C726 189 775 205 834 250" fill="none" stroke="#6b927b" strokeWidth="9" strokeLinecap="round" opacity=".45" />
              <path d="M443 426 C523 371 603 395 664 454" fill="none" stroke="#6b927b" strokeWidth="9" strokeLinecap="round" opacity=".4" />
              <ellipse cx="505" cy="314" rx="86" ry="55" fill="#17314a" opacity=".92" />
              <ellipse cx="505" cy="314" rx="58" ry="34" fill="#1f4860" opacity=".75" />
              <path d="M137 135 C190 102 229 113 264 147" fill="none" stroke="#52765c" strokeWidth="30" strokeLinecap="round" opacity=".38" />
              <path d="M724 393 C786 359 835 382 868 425" fill="none" stroke="#8b6044" strokeWidth="34" strokeLinecap="round" opacity=".38" />
            </svg>

            {REGIONS.map((region) => {
              const style = {
                "--map-x": `${region.map.x}%`,
                "--map-y": `${region.map.y}%`,
                "--map-scale": region.map.scale,
                "--region-color": region.palette.primary,
                "--region-accent": region.palette.accent,
              } as CSSProperties;

              return (
                <button
                  key={region.id}
                  className={`map-region ${selectedId === region.id ? "selected" : ""} ${region.unlocked ? "" : "locked"}`}
                  style={style}
                  disabled={!region.unlocked}
                  onClick={() => setSelectedId(region.id)}
                  aria-label={region.unlocked ? `Select ${region.name}` : `${region.name}, coming later`}
                >
                  <span className="map-region-beacon" />
                  <span className="map-region-name">{region.name}</span>
                  <span className="map-region-type">{region.subtitle.replace("Realm of the ", "")}</span>
                  {!region.unlocked ? <span className="map-lock">FUTURE</span> : null}
                </button>
              );
            })}
          </div>
        </div>

        <aside
          className="region-detail"
          style={{
            "--region-color": selected.palette.primary,
            "--region-accent": selected.palette.accent,
          } as CSSProperties}
        >
          <div className="region-orb" />
          <span className="story-kicker">{selected.subtitle}</span>
          <h2>{selected.name}</h2>
          <p className="region-mood">{selected.mood}</p>
          <p>{selected.description}</p>

          <div className="region-landmarks">
            {selected.landmarks.map((landmark) => (
              <span key={landmark}>{landmark}</span>
            ))}
          </div>

          <div className="region-relic-preview">
            <small>REGIONAL RELIC</small>
            <strong>{selected.relic.name}</strong>
            <p>{selected.relic.description}</p>
          </div>

          <button
            className="story-primary"
            onClick={() => onChoose(selected)}
          >
            Begin in {selected.name}
          </button>
        </aside>
      </div>
    </section>
  );
}
