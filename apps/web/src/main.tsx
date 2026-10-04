import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { InputEngine } from "./platform/input";
import { InvisiController } from "./platform/game-sdk";
import { KeyboardSource, SimulatorSource } from "./platform/simulator";
import type { ControllerFrameV1, InputSourceName } from "./platform/protocol";
import { WorldMap } from "./game-a/WorldMap";
import { ChampionSelect } from "./game-a/ChampionSelect";
import type { ChampionDefinition, RegionDefinition } from "./game-a/world";
import "./styles.css";

const engine = new InputEngine();
const simulator = new SimulatorSource(engine);
new KeyboardSource(engine);
const controller = new InvisiController(engine);
const GameA = lazy(() => import("./game-a/GameA"));

type Page = "home" | "lab" | "map" | "champion" | "game";

function App() {
  const [page, setPage] = useState<Page>("home");
  const [frame, setFrame] = useState<ControllerFrameV1>(controller.getFrame());
  const [source, setSource] = useState<InputSourceName>(engine.getActiveSource());
  const [selectedRegion, setSelectedRegion] = useState<RegionDefinition | null>(null);
  const [selectedChampion, setSelectedChampion] = useState<ChampionDefinition | null>(null);

  useEffect(() => controller.subscribe(setFrame), []);

  const selectSource = (next: InputSourceName) => {
    engine.setActiveSource(next);
    setSource(next);
  };

  const beginJourney = () => {
    setPage("map");
  };

  const chooseRegion = (region: RegionDefinition) => {
    setSelectedRegion(region);
    setPage("champion");
  };

  const chooseChampion = (champion: ChampionDefinition) => {
    setSelectedChampion(champion);
    selectSource("keyboard");
    setPage("game");
  };

  const continueGame = () => {
    if (!selectedRegion || !selectedChampion) {
      beginJourney();
      return;
    }
    selectSource("keyboard");
    setPage("game");
  };

  if (page === "map") {
    return <WorldMap onChoose={chooseRegion} onBack={() => setPage("home")} />;
  }

  if (page === "champion" && selectedRegion) {
    return (
      <ChampionSelect
        region={selectedRegion}
        onChoose={chooseChampion}
        onBack={() => setPage("map")}
      />
    );
  }

  if (page === "game" && selectedRegion && selectedChampion) {
    return (
      <main className="full-screen">
        <Suspense fallback={<div className="game-loading">Entering {selectedRegion.name}…</div>}>
          <GameA
            controller={controller}
            region={selectedRegion}
            champion={selectedChampion}
          />
        </Suspense>
        <button className="floating-back" onClick={() => setPage("home")}>
          ← Invisi-Play
        </button>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setPage("home")}>
          INVISI-PLAY
        </button>
        <div className="status-pill">
          <i /> {source === "simulator" ? "Simulator" : "Keyboard"} connected
        </div>
      </header>

      {page === "home" ? (
        <Home
          onPlay={beginJourney}
          onContinue={selectedChampion ? continueGame : undefined}
          activeChampion={selectedChampion}
          activeRegion={selectedRegion}
          onLab={() => setPage("lab")}
        />
      ) : (
        <Lab
          frame={frame}
          source={source}
          onSource={selectSource}
          onBack={() => setPage("home")}
        />
      )}
    </main>
  );
}

function Home({
  onPlay,
  onContinue,
  activeChampion,
  activeRegion,
  onLab,
}: {
  onPlay: () => void;
  onContinue?: () => void;
  activeChampion: ChampionDefinition | null;
  activeRegion: RegionDefinition | null;
  onLab: () => void;
}) {
  return (
    <section className="home-grid">
      <div className="hero-copy">
        <div className="eyebrow">GAME A · STORY & VISUAL PROTOTYPE</div>
        <h1>
          Choose a land.
          <br />
          Shape a Champion.
        </h1>
        <p>
          Cross a living world, discover skills and relics, and watch your
          Champion evolve around the choices you make.
        </p>
        <div className="hero-actions">
          <button className="primary" onClick={onPlay}>
            Begin Journey
          </button>
          {onContinue ? (
            <button className="secondary" onClick={onContinue}>
              Continue with {activeChampion?.name}
            </button>
          ) : null}
          <button className="secondary" onClick={onLab}>
            Open Invisi-Play Lab
          </button>
        </div>
      </div>

      <div className="game-card story-game-card">
        <div className="game-art world-art">
          <div className="mini-continent mini-one" />
          <div className="mini-continent mini-two" />
          <div className="mini-continent mini-three" />
          <div className="map-pulse" />
        </div>
        <div className="game-card-copy">
          <span className="tag">GAME A · EARLY WORLD BUILD</span>
          <h2>{activeChampion ? activeChampion.name : "The Champion Journey"}</h2>
          <p>
            {activeChampion && activeRegion
              ? `${activeChampion.archetype} · ${activeRegion.name}`
              : "Choose your starting realm and first Champion."}
          </p>
          <button className="primary wide" onClick={onContinue ?? onPlay}>
            {onContinue ? "Continue" : "Enter World Map"}
          </button>
        </div>
      </div>
    </section>
  );
}

function Lab({
  frame,
  source,
  onSource,
  onBack,
}: {
  frame: ControllerFrameV1;
  source: InputSourceName;
  onSource: (source: InputSourceName) => void;
  onBack: () => void;
}) {
  const commandJson = useMemo(
    () =>
      JSON.stringify(
        {
          forward: frame.axes.forward,
          turn: frame.axes.turn,
          run: frame.buttons.run.down,
          jump: frame.buttons.jump.down,
          crouch: frame.buttons.crouch.down,
          interact: frame.buttons.interact.down,
          roomX: frame.room.x,
          roomY: frame.room.y,
        },
        null,
        2,
      ),
    [frame],
  );

  return (
    <section className="lab-page">
      <div className="section-heading">
        <div>
          <div className="eyebrow">DEVELOPER TOOL</div>
          <h1>Invisi-Play Lab</h1>
        </div>
        <button className="secondary" onClick={onBack}>
          Back
        </button>
      </div>

      <div className="lab-grid">
        <div className="panel controls-panel">
          <h2>Input Source</h2>
          <div className="segmented">
            <button
              className={source === "simulator" ? "active" : ""}
              onClick={() => onSource("simulator")}
            >
              Simulator
            </button>
            <button
              className={source === "keyboard" ? "active" : ""}
              onClick={() => onSource("keyboard")}
            >
              Keyboard
            </button>
          </div>
          <SimulatorControls disabled={source !== "simulator"} />
        </div>

        <div className="panel">
          <h2>Devices</h2>
          <Device name="Radar A" state="SIMULATED" />
          <Device name="Radar B" state="SIMULATED" />
          <Device name="Waist IMU" state="SIMULATED" />
          <Device name="Left Wrist" state="NOT PURCHASED" muted />
          <Device name="Right Wrist" state="NOT PURCHASED" muted />
        </div>

        <div className="panel room-panel">
          <h2>Physical Room</h2>
          <div className="room-map">
            <div
              className="room-player"
              style={{
                left: `${clamp((frame.room.x / 5) * 100, 4, 96)}%`,
                top: `${clamp((frame.room.y / 5) * 100, 4, 96)}%`,
              }}
            />
          </div>
          <div className="metric-row">
            <Metric label="X" value={`${frame.room.x.toFixed(2)} m`} />
            <Metric label="Y" value={`${frame.room.y.toFixed(2)} m`} />
            <Metric
              label="Confidence"
              value={`${Math.round(frame.room.confidence * 100)}%`}
            />
          </div>
        </div>

        <div className="panel">
          <h2>Normalized Command</h2>
          <div className="meter">
            <span>Forward</span>
            <b>{frame.axes.forward.toFixed(2)}</b>
            <div>
              <i style={{ width: `${frame.axes.forward * 100}%` }} />
            </div>
          </div>

          <div className="meter turn">
            <span>Turn</span>
            <b>{frame.axes.turn.toFixed(2)}</b>
            <div>
              <i style={{ left: `${50 + frame.axes.turn * 50}%` }} />
            </div>
          </div>

          <div className="button-grid">
            {(["run", "jump", "crouch", "interact"] as const).map((key) => (
              <span
                key={key}
                className={frame.buttons[key].down ? "command-on" : ""}
              >
                {key}
              </span>
            ))}
          </div>

          <pre>{commandJson}</pre>
        </div>
      </div>
    </section>
  );
}

function SimulatorControls({ disabled }: { disabled: boolean }) {
  const initial = simulator.getFrame();
  const [forward, setForward] = useState(initial.axes.forward);
  const [turn, setTurn] = useState(initial.axes.turn);
  const [roomX, setRoomX] = useState(initial.room.x);
  const [roomY, setRoomY] = useState(initial.room.y);
  const [run, setRun] = useState(false);
  const [crouch, setCrouch] = useState(false);

  return (
    <fieldset disabled={disabled} className="sim-controls">
      <Slider label="Forward" min={0} max={1} step={0.05} value={forward} onChange={(value) => { setForward(value); simulator.setForward(value); }} />
      <Slider label="Turn" min={-1} max={1} step={0.05} value={turn} onChange={(value) => { setTurn(value); simulator.setTurn(value); }} />
      <Slider label="Room X" min={0} max={5} step={0.1} value={roomX} onChange={(value) => { setRoomX(value); simulator.setRoom(value, roomY); }} />
      <Slider label="Room Y" min={0} max={5} step={0.1} value={roomY} onChange={(value) => { setRoomY(value); simulator.setRoom(roomX, value); }} />
      <div className="sim-buttons">
        <button className={run ? "toggle-on" : ""} onClick={() => { const next = !run; setRun(next); simulator.setButton("run", next); }}>Run</button>
        <button onClick={() => simulator.pulse("jump")}>Jump</button>
        <button className={crouch ? "toggle-on" : ""} onClick={() => { const next = !crouch; setCrouch(next); simulator.setButton("crouch", next); }}>Crouch</button>
        <button onClick={() => simulator.pulse("interact")}>Interact</button>
      </div>
    </fieldset>
  );
}

function Slider({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="slider-row">
      <span>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
      <b>{value.toFixed(2)}</b>
    </label>
  );
}

function Device({
  name,
  state,
  muted = false,
}: {
  name: string;
  state: string;
  muted?: boolean;
}) {
  return (
    <div className={`device-row ${muted ? "muted" : ""}`}>
      <span><i />{name}</span>
      <b>{state}</b>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

createRoot(document.getElementById("root")!).render(<App />);
