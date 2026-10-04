import { useEffect, useRef, useState } from "react";
import "@babylonjs/loaders/glTF";
import {
  ArcRotateCamera,
  Color3,
  Color4,
  DirectionalLight,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scalar,
  Scene,
  SceneLoader,
  ShadowGenerator,
  StandardMaterial,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import type { InvisiController } from "../platform/game-sdk";
import type { ChampionDefinition, RegionDefinition } from "./world";
import { ChampionAnimator } from "./ChampionAnimator";

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
  const [assetLabel, setAssetLabel] = useState("Preparing world…");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);
    scene.clearColor = Color4.FromHexString(`${region.palette.sky}ff`);

    const camera = new ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      1.05,
      8.2,
      new Vector3(0, 1.0, 0),
      scene,
    );
    camera.inputs.clear();

    const hemi = new HemisphericLight("hemi", new Vector3(0, 1, 0), scene);
    hemi.intensity = 0.95;
    hemi.diffuse = new Color3(0.82, 0.9, 1);

    const sun = new DirectionalLight("sun", new Vector3(-0.35, -1, 0.3), scene);
    sun.intensity = 1.25;
    const shadows = new ShadowGenerator(1024, sun);
    shadows.useBlurExponentialShadowMap = true;
    shadows.blurKernel = 20;

    const playerRoot = new TransformNode("playerRoot", scene);
    let visualRoot: TransformNode | null = null;
    let animator: ChampionAnimator | null = null;
    let shrinePosition = new Vector3(0, 0, 11);
    let currentSpeed = 0;
    let verticalVelocity = 0;
    let grounded = true;
    let wasGrounded = true;
    let lastJumpSequence = -1;
    let lastInteractSequence = -1;
    let completed = false;

    const setup = async () => {
      try {
        if (region.id === "reptile") {
          setAssetLabel("Loading Sunscale Reach…");
          const env = await SceneLoader.ImportMeshAsync(
            "",
            "/assets/models/environment/sunscale-reach/",
            "sunscale_reach_v001.glb",
            scene,
          );
          env.meshes.forEach((mesh) => {
            mesh.receiveShadows = true;
          });
          const relic = env.meshes.find((mesh) => mesh.name.includes("Sunscale_RelicCore"));
          if (relic) shrinePosition = relic.getAbsolutePosition().clone();
        } else {
          createFallbackEnvironment(scene, region);
        }

        if (champion.id === "shelvora") {
          setAssetLabel("Loading Shelvora…");
          const imported = await SceneLoader.ImportMeshAsync(
            "",
            "/assets/models/champions/shelvora/",
            "shelvora_v001.glb",
            scene,
          );
          visualRoot = new TransformNode("shelvoraRuntimeRoot", scene);
          for (const node of [...imported.meshes, ...imported.transformNodes]) {
            if (!node.parent) node.parent = visualRoot;
          }
          visualRoot.parent = playerRoot;
          visualRoot.rotation.y = Math.PI;
          imported.meshes.forEach((mesh) => shadows.addShadowCaster(mesh));
          animator = new ChampionAnimator(imported.animationGroups);
          animator.playLoop("Idle");
        } else {
          visualRoot = createFallbackChampion(scene, champion);
          visualRoot.parent = playerRoot;
        }

        if (!disposed) setAssetLabel("");
      } catch (error) {
        console.error("[GameA] asset load failed", error);
        if (!visualRoot) {
          visualRoot = createFallbackChampion(scene, champion);
          visualRoot.parent = playerRoot;
        }
        if (region.id === "reptile" && !scene.getMeshByName("ground")) {
          createFallbackEnvironment(scene, region);
        }
        if (!disposed) setAssetLabel("Using fallback assets");
      }
    };

    void setup();

    engine.runRenderLoop(() => {
      if (disposed) return;
      const dt = Math.min(engine.getDeltaTime() / 1000, 0.05);
      const frame = controller.getFrame();

      const targetSpeed = frame.axes.forward * (frame.buttons.run.down ? 6.0 : 3.0);
      const accel = targetSpeed > currentSpeed ? 7.5 : 10.5;
      currentSpeed = Scalar.Lerp(currentSpeed, targetSpeed, 1 - Math.exp(-accel * dt));

      playerRoot.rotation.y += frame.axes.turn * 1.9 * dt;
      const forward = new Vector3(
        Math.sin(playerRoot.rotation.y),
        0,
        Math.cos(playerRoot.rotation.y),
      );
      playerRoot.position.addInPlace(forward.scale(currentSpeed * dt));

      if (
        frame.buttons.jump.pressed &&
        frame.sequence !== lastJumpSequence &&
        grounded
      ) {
        lastJumpSequence = frame.sequence;
        verticalVelocity = 5.2;
        grounded = false;
        animator?.playOnce("JumpStart", "JumpLoop");
      }

      verticalVelocity -= 12.2 * dt;
      playerRoot.position.y += verticalVelocity * dt;
      if (playerRoot.position.y <= 0) {
        playerRoot.position.y = 0;
        verticalVelocity = 0;
        grounded = true;
      }

      if (!wasGrounded && grounded) animator?.playOnce("Land");
      wasGrounded = grounded;

      if (animator && !animator.isBusy() && grounded) {
        if (frame.buttons.crouch.down) animator.playLoop("GuardHold");
        else if (currentSpeed > 4.0) animator.playLoop("Run", 1.05);
        else if (currentSpeed > 0.15) animator.playLoop("Walk", 1.0);
        else if (Math.abs(frame.axes.turn) > 0.15) {
          animator.playLoop(frame.axes.turn < 0 ? "TurnLeft" : "TurnRight");
        } else animator.playLoop("Idle");
      }

      if (
        !completed &&
        frame.buttons.interact.pressed &&
        frame.sequence !== lastInteractSequence
      ) {
        lastInteractSequence = frame.sequence;
        const flatPlayer = new Vector3(playerRoot.position.x, 0, playerRoot.position.z);
        const flatShrine = new Vector3(shrinePosition.x, 0, shrinePosition.z);
        if (Vector3.Distance(flatPlayer, flatShrine) < 3.2) {
          completed = true;
          setObjectiveComplete(true);
          setRelicUnlocked(true);
          animator?.playOnce("RelicBond");
        } else {
          animator?.playOnce("Interact");
        }
      }

      const desiredTarget = playerRoot.position.add(new Vector3(0, 0.95, 0));
      camera.setTarget(
        Vector3.Lerp(camera.target, desiredTarget, 1 - Math.exp(-8 * dt)),
      );
      const desiredAlpha = -Math.PI / 2 - playerRoot.rotation.y;
      camera.alpha = Scalar.Lerp(camera.alpha, desiredAlpha, 1 - Math.exp(-6 * dt));
      const desiredRadius = frame.buttons.run.down ? 8.8 : 8.1;
      camera.radius = Scalar.Lerp(camera.radius, desiredRadius, 1 - Math.exp(-4 * dt));

      scene.render();
    });

    const resize = () => engine.resize();
    window.addEventListener("resize", resize);

    return () => {
      disposed = true;
      window.removeEventListener("resize", resize);
      animator?.dispose();
      scene.dispose();
      engine.dispose();
    };
  }, [controller, champion, region]);

  return (
    <div className="game-shell">
      <canvas ref={canvasRef} className="game-canvas" />
      {assetLabel ? <div className="game-loading">{assetLabel}</div> : null}

      <div className="game-hud game-hud-left story-hud">
        <span className="hud-region">{region.name}</span>
        <strong>{objectiveComplete ? "FIRST BOND AWAKENED" : "FIRST BOND"}</strong>
        <span>
          {objectiveComplete
            ? `${region.relic.name} has bonded with ${champion.name}.`
            : "Travel to the shrine and interact."}
        </span>
      </div>

      <div className="game-hud game-hud-right">
        <span>W / ↑ Forward</span>
        <span>A,D / ←,→ Turn</span>
        <span>Shift Run · Space Jump · C Guard · E Interact</span>
      </div>

      <button className="champion-menu-button" onClick={() => setProfileOpen((v) => !v)}>
        <span className="champion-menu-dot" style={{ background: champion.palette.primary }} />
        <span><small>CHAMPION</small><strong>{champion.name}</strong></span>
      </button>

      {profileOpen ? (
        <aside className="champion-panel">
          <div className="champion-panel-head">
            <div><span>{champion.archetype}</span><h2>{champion.name}</h2></div>
            <button onClick={() => setProfileOpen(false)}>×</button>
          </div>
          <div className="bond-meter">
            <div><span>BOND</span><strong>{relicUnlocked ? "15 / 100" : "0 / 100"}</strong></div>
            <div className="bond-track"><i style={{ width: relicUnlocked ? "15%" : "0%" }} /></div>
          </div>
          <section>
            <small>CORE SKILLS</small>
            <div className="profile-skill-list">
              {champion.abilities.map((ability) => (
                <div key={ability.name}><strong>{ability.name}</strong><span>{ability.description}</span></div>
              ))}
            </div>
          </section>
          <section>
            <small>RELICS</small>
            <div className={`relic-slot ${relicUnlocked ? "filled" : ""}`}>
              <div className="relic-gem" style={{ background: region.palette.accent }} />
              <div>
                <strong>{relicUnlocked ? region.relic.name : "Empty relic slot"}</strong>
                <span>{relicUnlocked ? "Sunscale energy is now part of Shelvora's form." : "Find relics to change skills and appearance."}</span>
              </div>
            </div>
          </section>
          <section>
            <small>EVOLUTION POTENTIAL</small>
            <div className="evolution-path-list">
              {champion.evolutionPaths.map((e) => <span key={e}>{e}</span>)}
            </div>
          </section>
        </aside>
      ) : null}
    </div>
  );
}

function material(scene: Scene, name: string, hex: string) {
  const mat = new StandardMaterial(name, scene);
  mat.diffuseColor = Color3.FromHexString(hex);
  mat.specularColor = Color3.Black();
  return mat;
}

function createFallbackEnvironment(scene: Scene, region: RegionDefinition) {
  const ground = MeshBuilder.CreateGround("ground", { width: 46, height: 46 }, scene);
  ground.material = material(scene, "groundMat", region.palette.ground);
  const path = MeshBuilder.CreateGround("path", { width: 7, height: 35 }, scene);
  path.position.z = 5;
  path.position.y = 0.02;
  path.material = material(scene, "pathMat", region.palette.path);
}

function createFallbackChampion(scene: Scene, champion: ChampionDefinition) {
  const root = new TransformNode("fallbackChampion", scene);
  const body = MeshBuilder.CreateCapsule("fallbackBody", { height: 1.4, radius: 0.5 }, scene);
  body.parent = root;
  body.position.y = 0.7;
  body.material = material(scene, "fallbackMaterial", champion.palette.primary);
  return root;
}
