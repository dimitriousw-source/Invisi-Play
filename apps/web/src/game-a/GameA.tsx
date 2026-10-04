import { useEffect, useRef, useState } from "react";
import {
  ArcRotateCamera,
  Color3,
  Color4,
  DirectionalLight,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scene,
  StandardMaterial,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import type { InvisiController } from "../platform/game-sdk";
import type { ChampionDefinition, RegionDefinition } from "./world";

export default function GameA({
  controller,
  champion,
  region,
}: {
  controller: InvisiController;
  champion: ChampionDefinition;
  region: RegionDefinition;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [objectiveComplete, setObjectiveComplete] = useState(false);
  const [relicUnlocked, setRelicUnlocked] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: false,
      stencil: true,
    });
    const scene = new Scene(engine);
    scene.clearColor = Color4.FromHexString(`${region.palette.sky}ff`);

    const camera = new ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      1.08,
      8.6,
      new Vector3(0, 1.1, 0),
      scene,
    );
    camera.lowerRadiusLimit = 6.5;
    camera.upperRadiusLimit = 10;
    camera.inputs.clear();

    const hemi = new HemisphericLight("hemi", new Vector3(0, 1, 0), scene);
    hemi.intensity = 1.05;
    hemi.diffuse = new Color3(0.9, 0.96, 1);

    const sun = new DirectionalLight("sun", new Vector3(-0.4, -1, 0.25), scene);
    sun.intensity = 0.85;

    createEnvironment(scene, region);

    const playerRoot = new TransformNode("playerRoot", scene);
    const championVisual = createChampion(scene, champion);
    championVisual.root.parent = playerRoot;

    const objective = MeshBuilder.CreatePolyhedron(
      "resonance-shrine",
      { type: 1, size: 1.05 },
      scene,
    );
    objective.position = new Vector3(0, 1.4, 11);
    const objectiveMat = material(scene, "shrine", region.palette.accent, 0.55);
    objective.material = objectiveMat;

    const shrineRing = MeshBuilder.CreateTorus(
      "shrine-ring",
      { diameter: 2.2, thickness: 0.12, tessellation: 32 },
      scene,
    );
    shrineRing.position = new Vector3(0, 0.08, 11);
    shrineRing.material = material(scene, "shrine-ring-mat", region.palette.primary, 0.22);

    let verticalVelocity = 0;
    let grounded = true;
    let completed = false;
    let lastJumpSequence = -1;
    let lastInteractSequence = -1;

    engine.runRenderLoop(() => {
      const dt = Math.min(engine.getDeltaTime() / 1000, 0.05);
      const frame = controller.getFrame();
      const speed = frame.buttons.run.down ? 6.5 : 3.35;

      playerRoot.rotation.y += frame.axes.turn * 2.15 * dt;
      const forward = new Vector3(
        Math.sin(playerRoot.rotation.y),
        0,
        Math.cos(playerRoot.rotation.y),
      );
      playerRoot.position.addInPlace(forward.scale(frame.axes.forward * speed * dt));

      if (
        frame.buttons.jump.pressed &&
        frame.sequence !== lastJumpSequence &&
        grounded
      ) {
        verticalVelocity = 5.4;
        grounded = false;
        lastJumpSequence = frame.sequence;
      }

      verticalVelocity -= 12.5 * dt;
      playerRoot.position.y += verticalVelocity * dt;

      if (playerRoot.position.y <= 0) {
        playerRoot.position.y = 0;
        verticalVelocity = 0;
        grounded = true;
      }

      championVisual.root.scaling.y = frame.buttons.crouch.down ? 0.68 : 1;

      objective.rotation.y += 0.85 * dt;
      objective.rotation.x += 0.3 * dt;
      objective.position.y = 1.4 + Math.sin(performance.now() / 420) * 0.14;
      shrineRing.rotation.y += 0.28 * dt;

      if (
        !completed &&
        frame.buttons.interact.pressed &&
        frame.sequence !== lastInteractSequence
      ) {
        lastInteractSequence = frame.sequence;
        const distance = Vector3.Distance(
          playerRoot.position,
          new Vector3(objective.position.x, 0, objective.position.z),
        );

        if (distance < 2.8) {
          completed = true;
          setObjectiveComplete(true);
          setRelicUnlocked(true);
          objectiveMat.emissiveColor = Color3.FromHexString("#ffffff");
          championVisual.accent.emissiveColor = Color3.FromHexString(region.palette.accent).scale(0.78);
          championVisual.accent.diffuseColor = Color3.FromHexString(region.palette.accent);
        }
      }

      const cameraTarget = playerRoot.position.add(new Vector3(0, 0.95, 0));
      camera.setTarget(
        Vector3.Lerp(camera.target, cameraTarget, Math.min(1, dt * 8)),
      );
      camera.alpha = -Math.PI / 2 - playerRoot.rotation.y;

      scene.render();
    });

    const resize = () => engine.resize();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      scene.dispose();
      engine.dispose();
    };
  }, [controller, champion, region]);

  return (
    <div className="game-shell">
      <canvas
        ref={canvasRef}
        className="game-canvas"
        aria-label={`${champion.name} exploring ${region.name}`}
      />

      <div className="game-hud game-hud-left story-hud">
        <span className="hud-region">{region.name}</span>
        <strong>{objectiveComplete ? "FIRST BOND AWAKENED" : "FIRST BOND"}</strong>
        <span>
          {objectiveComplete
            ? `${region.relic.name} has bonded with ${champion.name}.`
            : "Reach the resonance shrine and interact."}
        </span>
      </div>

      <div className="game-hud game-hud-right">
        <span>W / ↑ Forward</span>
        <span>A,D / ←,→ Turn</span>
        <span>Shift Run · Space Jump · C Crouch · E Interact</span>
      </div>

      <button
        className="champion-menu-button"
        onClick={() => setProfileOpen((open) => !open)}
      >
        <span className="champion-menu-dot" style={{ background: champion.palette.primary }} />
        <span>
          <small>CHAMPION</small>
          <strong>{champion.name}</strong>
        </span>
      </button>

      {profileOpen ? (
        <aside className="champion-panel">
          <div className="champion-panel-head">
            <div>
              <span>{champion.archetype}</span>
              <h2>{champion.name}</h2>
            </div>
            <button onClick={() => setProfileOpen(false)} aria-label="Close Champion profile">×</button>
          </div>

          <div className="bond-meter">
            <div>
              <span>BOND</span>
              <strong>{relicUnlocked ? "15 / 100" : "0 / 100"}</strong>
            </div>
            <div className="bond-track">
              <i style={{ width: relicUnlocked ? "15%" : "0%" }} />
            </div>
          </div>

          <section>
            <small>CORE SKILLS</small>
            <div className="profile-skill-list">
              {champion.abilities.map((ability) => (
                <div key={ability.name}>
                  <strong>{ability.name}</strong>
                  <span>{ability.description}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <small>RELICS</small>
            <div className={`relic-slot ${relicUnlocked ? "filled" : ""}`}>
              <div className="relic-gem" style={{ background: region.palette.accent }} />
              <div>
                <strong>{relicUnlocked ? region.relic.name : "Empty relic slot"}</strong>
                <span>
                  {relicUnlocked
                    ? "Your Champion's markings now carry this realm's energy."
                    : "Explore the world to find items that change skills and form."}
                </span>
              </div>
            </div>
          </section>

          <section>
            <small>EVOLUTION POTENTIAL</small>
            <div className="evolution-path-list">
              {champion.evolutionPaths.map((path) => (
                <span key={path}>{path}</span>
              ))}
            </div>
          </section>
        </aside>
      ) : null}
    </div>
  );
}

function material(
  scene: Scene,
  name: string,
  hex: string,
  emissive = 0,
) {
  const mat = new StandardMaterial(name, scene);
  mat.diffuseColor = Color3.FromHexString(hex);
  mat.specularColor = Color3.Black();
  if (emissive > 0) {
    mat.emissiveColor = Color3.FromHexString(hex).scale(emissive);
  }
  return mat;
}

function createEnvironment(scene: Scene, region: RegionDefinition) {
  const ground = MeshBuilder.CreateGround("ground", { width: 46, height: 46 }, scene);
  ground.material = material(scene, "groundMat", region.palette.ground);

  const path = MeshBuilder.CreateGround("path", { width: 7, height: 35 }, scene);
  path.position.z = 5;
  path.position.y = 0.018;
  path.material = material(scene, "pathMat", region.palette.path);

  if (region.id === "insectoid") {
    for (let i = 0; i < 12; i += 1) {
      const side = i % 2 ? 1 : -1;
      const z = -8 + i * 2.25;
      const stalk = MeshBuilder.CreateCylinder(`stalk-${i}`, { height: 1.7 + (i % 3) * 0.35, diameter: 0.34 }, scene);
      stalk.position = new Vector3(side * (4.8 + (i % 4) * 0.75), stalk.getBoundingInfo().boundingBox.extendSize.y, z);
      stalk.material = material(scene, `stalk-mat-${i}`, "#d7d0b4");
      const cap = MeshBuilder.CreateSphere(`cap-${i}`, { diameter: 1.5 + (i % 2) * 0.35, segments: 12 }, scene);
      cap.scaling.y = 0.42;
      cap.position = stalk.position.add(new Vector3(0, 1.05 + (i % 3) * 0.18, 0));
      cap.material = material(scene, `cap-mat-${i}`, i % 2 ? "#6fa85f" : "#9270b6", 0.06);
    }
  } else if (region.id === "beast") {
    for (let i = 0; i < 12; i += 1) {
      const side = i % 2 ? 1 : -1;
      const z = -8 + i * 2.25;
      const trunk = MeshBuilder.CreateCylinder(`trunk-${i}`, { height: 2.2, diameter: 0.42 }, scene);
      trunk.position = new Vector3(side * (5 + (i % 3) * 1.05), 1.1, z);
      trunk.material = material(scene, `trunk-mat-${i}`, "#6f4e35");
      const crown = MeshBuilder.CreateSphere(`crown-${i}`, { diameter: 2.2 + (i % 3) * 0.25, segments: 10 }, scene);
      crown.position = trunk.position.add(new Vector3(0, 1.75, 0));
      crown.scaling.y = 0.82;
      crown.material = material(scene, `crown-mat-${i}`, i % 2 ? "#587948" : "#6c8547");
    }
  } else if (region.id === "reptile") {
    for (let i = 0; i < 14; i += 1) {
      const side = i % 2 ? 1 : -1;
      const z = -9 + i * 2;
      const crystal = MeshBuilder.CreatePolyhedron(`crystal-${i}`, { type: 1, size: 0.75 + (i % 3) * 0.2 }, scene);
      crystal.scaling.y = 1.4 + (i % 2) * 0.4;
      crystal.position = new Vector3(side * (5 + (i % 4) * 0.8), 0.75, z);
      crystal.rotation.z = side * 0.16;
      crystal.material = material(scene, `crystal-mat-${i}`, i % 2 ? "#d98f57" : "#6e9c76", 0.08);
    }
  } else {
    for (let i = 0; i < 12; i += 1) {
      const side = i % 2 ? 1 : -1;
      const z = -8 + i * 2.3;
      const pillar = MeshBuilder.CreateCylinder(`pillar-${i}`, { height: 1.5 + (i % 4) * 0.5, diameter: 0.8, tessellation: 8 }, scene);
      pillar.position = new Vector3(side * (5.3 + (i % 3) * 0.95), pillar.getBoundingInfo().boundingBox.extendSize.y, z);
      pillar.material = material(scene, `pillar-mat-${i}`, i % 2 ? "#80918f" : "#6f7c84");
      const cloud = MeshBuilder.CreateSphere(`cloud-${i}`, { diameter: 1.8, segments: 8 }, scene);
      cloud.scaling = new Vector3(1.6, 0.42, 0.8);
      cloud.position = new Vector3(side * (7.5 + (i % 2) * 1.4), 4 + (i % 3) * 0.8, z);
      cloud.material = material(scene, `cloud-mat-${i}`, "#d8e5e7", 0.08);
      cloud.visibility = 0.62;
    }
  }
}

function createChampion(scene: Scene, champion: ChampionDefinition) {
  const root = new TransformNode("championVisual", scene);
  const primary = material(scene, "champion-primary", champion.palette.primary);
  const secondary = material(scene, "champion-secondary", champion.palette.secondary);
  const accent = material(scene, "champion-accent", champion.palette.accent, 0.05);

  const sphere = (
    name: string,
    diameter: number,
    position: Vector3,
    scale: Vector3,
    mat: StandardMaterial,
  ) => {
    const mesh = MeshBuilder.CreateSphere(name, { diameter, segments: 12 }, scene);
    mesh.parent = root;
    mesh.position = position;
    mesh.scaling = scale;
    mesh.material = mat;
    return mesh;
  };

  const limb = (
    name: string,
    height: number,
    diameter: number,
    position: Vector3,
    rotation: Vector3,
    mat: StandardMaterial,
  ) => {
    const mesh = MeshBuilder.CreateCylinder(name, { height, diameter, tessellation: 10 }, scene);
    mesh.parent = root;
    mesh.position = position;
    mesh.rotation = rotation;
    mesh.material = mat;
    return mesh;
  };

  switch (champion.model) {
    case "mantis":
      sphere("mantis-body", 1, new Vector3(0, 0.9, 0), new Vector3(0.6, 1.05, 0.48), primary);
      sphere("mantis-head", 0.62, new Vector3(0, 1.58, 0.05), new Vector3(1, 0.82, 0.92), accent);
      limb("mantis-arm-l", 1, 0.12, new Vector3(-0.45, 1.08, 0.28), new Vector3(0.45, 0, -0.78), accent);
      limb("mantis-arm-r", 1, 0.12, new Vector3(0.45, 1.08, 0.28), new Vector3(0.45, 0, 0.78), accent);
      limb("mantis-leg-l", 1.25, 0.14, new Vector3(-0.38, 0.45, -0.05), new Vector3(0.05, 0, -0.45), secondary);
      limb("mantis-leg-r", 1.25, 0.14, new Vector3(0.38, 0.45, -0.05), new Vector3(0.05, 0, 0.45), secondary);
      break;
    case "spider":
      sphere("spider-abdomen", 1.2, new Vector3(0, 0.82, -0.26), new Vector3(0.92, 0.72, 1.05), primary);
      sphere("spider-head", 0.68, new Vector3(0, 0.82, 0.52), new Vector3(1, 0.78, 0.9), accent);
      for (let i = 0; i < 4; i += 1) {
        const z = -0.45 + i * 0.28;
        limb(`spider-leg-l-${i}`, 1.25, 0.11, new Vector3(-0.58, 0.55, z), new Vector3(0, 0, -0.95 + i * 0.1), secondary);
        limb(`spider-leg-r-${i}`, 1.25, 0.11, new Vector3(0.58, 0.55, z), new Vector3(0, 0, 0.95 - i * 0.1), secondary);
      }
      break;
    case "pillbug":
      for (let i = 0; i < 5; i += 1) {
        sphere(`pill-segment-${i}`, 0.9, new Vector3(0, 0.72, -0.55 + i * 0.27), new Vector3(0.95 - Math.abs(2 - i) * 0.08, 0.66, 0.52), i === 4 ? accent : primary);
      }
      break;
    case "bear":
      sphere("bear-body", 1.35, new Vector3(0, 0.78, 0), new Vector3(0.92, 0.82, 1.05), primary);
      sphere("bear-head", 0.82, new Vector3(0, 1.35, 0.48), new Vector3(1, 0.92, 0.9), accent);
      sphere("bear-ear-l", 0.3, new Vector3(-0.25, 1.66, 0.43), Vector3.One(), secondary);
      sphere("bear-ear-r", 0.3, new Vector3(0.25, 1.66, 0.43), Vector3.One(), secondary);
      for (const x of [-0.42, 0.42]) {
        limb(`bear-leg-front-${x}`, 0.72, 0.26, new Vector3(x, 0.36, 0.34), Vector3.Zero(), secondary);
        limb(`bear-leg-back-${x}`, 0.72, 0.26, new Vector3(x, 0.36, -0.34), Vector3.Zero(), secondary);
      }
      break;
    case "wolf":
      sphere("wolf-body", 1.25, new Vector3(0, 0.82, 0), new Vector3(0.82, 0.65, 1.28), primary);
      sphere("wolf-head", 0.72, new Vector3(0, 1.17, 0.77), new Vector3(0.9, 0.86, 1.08), accent);
      limb("wolf-tail", 1.2, 0.18, new Vector3(0, 0.95, -0.95), new Vector3(0.9, 0, 0), secondary);
      for (const x of [-0.35, 0.35]) {
        limb(`wolf-leg-f-${x}`, 0.78, 0.18, new Vector3(x, 0.35, 0.42), Vector3.Zero(), secondary);
        limb(`wolf-leg-b-${x}`, 0.78, 0.18, new Vector3(x, 0.35, -0.42), Vector3.Zero(), secondary);
      }
      break;
    case "ram":
      sphere("ram-body", 1.3, new Vector3(0, 0.8, 0), new Vector3(0.9, 0.72, 1.05), primary);
      sphere("ram-head", 0.78, new Vector3(0, 1.23, 0.58), new Vector3(0.92, 0.9, 1), accent);
      for (const x of [-0.34, 0.34]) {
        const horn = MeshBuilder.CreateTorus(`horn-${x}`, { diameter: 0.52, thickness: 0.12, tessellation: 18 }, scene);
        horn.parent = root;
        horn.position = new Vector3(x, 1.36, 0.48);
        horn.rotation.x = Math.PI / 2;
        horn.material = secondary;
        limb(`ram-leg-${x}`, 0.8, 0.2, new Vector3(x, 0.34, 0), Vector3.Zero(), secondary);
      }
      break;
    case "gecko":
      sphere("gecko-body", 1.15, new Vector3(0, 0.65, 0), new Vector3(0.72, 0.48, 1.25), primary);
      sphere("gecko-head", 0.68, new Vector3(0, 0.78, 0.78), new Vector3(1.05, 0.72, 0.95), accent);
      limb("gecko-tail", 1.45, 0.2, new Vector3(0, 0.66, -0.95), new Vector3(1.2, 0, 0), secondary);
      for (const x of [-0.48, 0.48]) {
        limb(`gecko-arm-${x}`, 0.82, 0.14, new Vector3(x, 0.48, 0.25), new Vector3(0, 0, x > 0 ? 0.9 : -0.9), secondary);
        limb(`gecko-leg-${x}`, 0.82, 0.14, new Vector3(x, 0.48, -0.3), new Vector3(0, 0, x > 0 ? 1.05 : -1.05), secondary);
      }
      break;
    case "turtle":
      sphere("turtle-shell", 1.4, new Vector3(0, 0.68, 0), new Vector3(1, 0.58, 1.18), secondary);
      sphere("turtle-shell-top", 1.18, new Vector3(0, 0.79, -0.02), new Vector3(0.92, 0.54, 1.08), primary);
      sphere("turtle-head", 0.52, new Vector3(0, 0.7, 0.92), Vector3.One(), accent);
      for (const x of [-0.5, 0.5]) {
        limb(`turtle-leg-f-${x}`, 0.58, 0.19, new Vector3(x, 0.35, 0.45), new Vector3(0, 0, x > 0 ? 0.8 : -0.8), primary);
        limb(`turtle-leg-b-${x}`, 0.58, 0.19, new Vector3(x, 0.35, -0.45), new Vector3(0, 0, x > 0 ? 0.8 : -0.8), primary);
      }
      break;
    case "serpent":
      for (let i = 0; i < 8; i += 1) {
        sphere(`serpent-${i}`, 0.56 - i * 0.025, new Vector3(Math.sin(i * 0.75) * 0.16, 0.45 + i * 0.09, -0.65 + i * 0.23), Vector3.One(), i < 2 ? accent : primary);
      }
      break;
    case "falcon":
    case "owl":
    case "songbird":
      sphere("bird-body", 1.05, new Vector3(0, 0.9, 0), new Vector3(0.7, 1, 0.66), primary);
      sphere("bird-head", 0.64, new Vector3(0, 1.5, 0.08), Vector3.One(), accent);
      const leftWing = MeshBuilder.CreateBox("wing-l", { width: 1.15, height: 0.12, depth: 0.65 }, scene);
      leftWing.parent = root;
      leftWing.position = new Vector3(-0.62, 0.95, 0);
      leftWing.rotation.z = 0.25;
      leftWing.material = secondary;
      const rightWing = leftWing.clone("wing-r");
      rightWing.parent = root;
      rightWing.position.x = 0.62;
      rightWing.rotation.z = -0.25;
      limb("bird-leg-l", 0.5, 0.1, new Vector3(-0.2, 0.32, 0), Vector3.Zero(), accent);
      limb("bird-leg-r", 0.5, 0.1, new Vector3(0.2, 0.32, 0), Vector3.Zero(), accent);
      break;
  }

  root.rotation.y = Math.PI;
  return { root, accent };
}
