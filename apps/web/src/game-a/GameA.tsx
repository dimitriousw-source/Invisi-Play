import { useEffect, useRef, useState } from "react";
import "@babylonjs/loaders/glTF";
import {
  ArcRotateCamera,
  Color3,
  Color4,
  DefaultRenderingPipeline,
  DirectionalLight,
  DynamicTexture,
  Engine,
  GlowLayer,
  HemisphericLight,
  ImageProcessingConfiguration,
  Mesh,
  MeshBuilder,
  ParticleSystem,
  PBRMaterial,
  PointLight,
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
    const engine = new Engine(canvas, true, {
      adaptToDeviceRatio: true,
      antialias: true,
    });
    const scene = new Scene(engine);
    scene.clearColor = Color4.FromHexString(`${region.palette.sky}ff`);

    const camera = new ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      1.03,
      8.2,
      new Vector3(0, 1.0, 0),
      scene,
    );
    camera.inputs.clear();
    camera.minZ = 0.1;
    camera.maxZ = 220;
    camera.fov = 0.84;
    camera.inertia = 0;

    const hemi = new HemisphericLight("hemi", new Vector3(0, 1, 0), scene);
    hemi.intensity = 0.78;
    hemi.diffuse = new Color3(0.8, 0.9, 1);
    hemi.groundColor = new Color3(0.34, 0.19, 0.12);

    const sun = new DirectionalLight("sun", new Vector3(-0.38, -1, 0.28), scene);
    sun.position = new Vector3(18, 28, -18);
    sun.intensity = 2.05;

    const shadows = new ShadowGenerator(2048, sun);
    shadows.usePercentageCloserFiltering = true;
    shadows.filteringQuality = ShadowGenerator.QUALITY_MEDIUM;
    shadows.bias = 0.0006;
    shadows.normalBias = 0.025;

    scene.imageProcessingConfiguration.toneMappingEnabled = true;
    scene.imageProcessingConfiguration.toneMappingType =
      ImageProcessingConfiguration.TONEMAPPING_ACES;
    scene.imageProcessingConfiguration.exposure = 1.08;
    scene.imageProcessingConfiguration.contrast = 1.18;

    scene.fogMode = Scene.FOGMODE_EXP2;
    scene.fogDensity = region.id === "reptile" ? 0.005 : 0.0035;
    scene.fogColor = Color3.FromHexString(region.id === "reptile" ? "#a97b70" : region.palette.sky);

    const glow = new GlowLayer("worldGlow", scene, { blurKernelSize: 32 });
    glow.intensity = 0.28;

    const pipeline = new DefaultRenderingPipeline("presentation", true, scene, [camera]);
    pipeline.fxaaEnabled = true;
    pipeline.bloomEnabled = true;
    pipeline.bloomThreshold = 0.72;
    pipeline.bloomWeight = 0.2;
    pipeline.bloomKernel = 36;

    if (region.id === "reptile") {
      createSunscaleAtmosphere(scene);
    }

    const playerRoot = new TransformNode("playerRoot", scene);
    let visualRoot: TransformNode | null = null;
    let animator: ChampionAnimator | null = null;
    let shrinePosition = new Vector3(0, 0, 11);
    let shrineLight: PointLight | null = null;
    let currentSpeed = 0;
    let verticalVelocity = 0;
    let grounded = true;
    let wasGrounded = true;
    let lastJumpSequence = -1;
    let lastInteractSequence = -1;
    let completed = false;

    let cameraYawOffset = 0;
    let cameraBetaTarget = 1.03;
    let cameraRadiusTarget = 8.2;
    let dragPointerId: number | null = null;
    let lastPointerX = 0;
    let lastPointerY = 0;

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "touch" && event.button !== 0) return;
      dragPointerId = event.pointerId;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      canvas.classList.add("camera-dragging");
      try {
        canvas.setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture is best effort on embedded TV/mobile browsers.
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (dragPointerId !== event.pointerId) return;
      const dx = event.clientX - lastPointerX;
      const dy = event.clientY - lastPointerY;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      cameraYawOffset -= dx * 0.0065;
      cameraBetaTarget = Scalar.Clamp(cameraBetaTarget + dy * 0.0045, 0.52, 1.36);
    };

    const finishPointerDrag = (event: PointerEvent) => {
      if (dragPointerId !== event.pointerId) return;
      dragPointerId = null;
      canvas.classList.remove("camera-dragging");
      try {
        canvas.releasePointerCapture(event.pointerId);
      } catch {
        // Some browsers release capture automatically.
      }
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      cameraRadiusTarget = Scalar.Clamp(
        cameraRadiusTarget + event.deltaY * 0.008,
        5.0,
        12.5,
      );
    };

    const onCameraKey = (event: KeyboardEvent) => {
      if (event.code !== "KeyR") return;
      cameraYawOffset = 0;
      cameraBetaTarget = 1.03;
      cameraRadiusTarget = 8.2;
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", finishPointerDrag);
    canvas.addEventListener("pointercancel", finishPointerDrag);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onCameraKey);

    const setup = async () => {
      try {
        let sandTexture: DynamicTexture | null = null;
        let stoneTexture: DynamicTexture | null = null;

        if (region.id === "reptile") {
          setAssetLabel("Loading Sunscale Reach…");
          sandTexture = createSurfaceTexture(scene, "sunscaleSand", "#d49a72", "#9d6248");
          stoneTexture = createSurfaceTexture(scene, "sunscaleStone", "#866252", "#51382e");

          const env = await SceneLoader.ImportMeshAsync(
            "",
            "/assets/models/environment/sunscale-reach/",
            "sunscale_reach_v002.glb",
            scene,
          );

          env.meshes.forEach((mesh) => {
            mesh.receiveShadows = true;
            if (mesh.name !== "__root__") shadows.addShadowCaster(mesh, true);
          });

          tuneImportedMaterials(scene, sandTexture, stoneTexture);

          const relic = env.meshes.find((mesh) =>
            mesh.name.includes("Sunscale_RelicCore"),
          );
          if (relic) shrinePosition = relic.getAbsolutePosition().clone();

          shrineLight = new PointLight(
            "shrineWarmth",
            shrinePosition.add(new Vector3(0, 1.35, 0)),
            scene,
          );
          shrineLight.diffuse = Color3.FromHexString("#ffc25b");
          shrineLight.intensity = 3.2;
          shrineLight.range = 13;
        } else {
          createFallbackEnvironment(scene, region);
        }

        if (champion.id === "shelvora") {
          setAssetLabel("Loading Shelvora…");
          const imported = await SceneLoader.ImportMeshAsync(
            "",
            "/assets/models/champions/shelvora/",
            "shelvora_v002.glb",
            scene,
          );

          visualRoot = new TransformNode("shelvoraRuntimeRoot", scene);
          for (const node of [...imported.meshes, ...imported.transformNodes]) {
            if (!node.parent) node.parent = visualRoot;
          }

          visualRoot.parent = playerRoot;
          visualRoot.rotation.y = Math.PI;

          imported.meshes.forEach((mesh) => {
            if (mesh.name !== "__root__") shadows.addShadowCaster(mesh, true);
          });

          tuneImportedMaterials(scene, sandTexture, stoneTexture);
          setShelvoraRelicGlow(scene, 0.22);

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
      currentSpeed = Scalar.Lerp(
        currentSpeed,
        targetSpeed,
        1 - Math.exp(-accel * dt),
      );

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
        } else {
          animator.playLoop("Idle");
        }
      }

      if (
        !completed &&
        frame.buttons.interact.pressed &&
        frame.sequence !== lastInteractSequence
      ) {
        lastInteractSequence = frame.sequence;
        const flatPlayer = new Vector3(
          playerRoot.position.x,
          0,
          playerRoot.position.z,
        );
        const flatShrine = new Vector3(
          shrinePosition.x,
          0,
          shrinePosition.z,
        );

        if (Vector3.Distance(flatPlayer, flatShrine) < 3.2) {
          completed = true;
          setObjectiveComplete(true);
          setRelicUnlocked(true);
          setShelvoraRelicGlow(scene, 1.05);
          glow.intensity = 0.48;
          if (shrineLight) shrineLight.intensity = 6.5;
          animator?.playOnce("RelicBond");
        } else {
          animator?.playOnce("Interact");
        }
      }

      const desiredTarget = playerRoot.position.add(new Vector3(0, 0.98, 0));
      camera.setTarget(
        Vector3.Lerp(
          camera.target,
          desiredTarget,
          1 - Math.exp(-7.5 * dt),
        ),
      );

      const desiredAlpha =
        -Math.PI / 2 - playerRoot.rotation.y + cameraYawOffset;
      camera.alpha = Scalar.Lerp(
        camera.alpha,
        desiredAlpha,
        1 - Math.exp(-7 * dt),
      );
      camera.beta = Scalar.Lerp(
        camera.beta,
        cameraBetaTarget,
        1 - Math.exp(-8 * dt),
      );

      const runPullback = frame.buttons.run.down ? 0.65 : 0;
      camera.radius = Scalar.Lerp(
        camera.radius,
        cameraRadiusTarget + runPullback,
        1 - Math.exp(-6 * dt),
      );

      scene.render();
    });

    const resize = () => engine.resize();
    window.addEventListener("resize", resize);

    return () => {
      disposed = true;
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onCameraKey);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", finishPointerDrag);
      canvas.removeEventListener("pointercancel", finishPointerDrag);
      canvas.removeEventListener("wheel", onWheel);
      animator?.dispose();
      pipeline.dispose();
      glow.dispose();
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

      {assetLabel ? <div className="game-loading">{assetLabel}</div> : null}

      <div className="game-hud game-hud-left story-hud">
        <span className="hud-region">{region.name}</span>
        <strong>
          {objectiveComplete ? "FIRST BOND AWAKENED" : "FIRST BOND"}
        </strong>
        <span>
          {objectiveComplete
            ? `${region.relic.name} has bonded with ${champion.name}.`
            : "Travel to the shrine and interact."}
        </span>
      </div>

      <div className="camera-hint">
        <strong>CAMERA</strong>
        <span>Drag to orbit · Scroll to zoom · R to recenter</span>
      </div>

      <div className="game-hud game-hud-right">
        <span>W / ↑ Forward</span>
        <span>A,D / ←,→ Turn</span>
        <span>Shift Run · Space Jump · C Guard · E Interact</span>
      </div>

      <button
        className="champion-menu-button"
        onClick={() => setProfileOpen((value) => !value)}
      >
        <span
          className="champion-menu-dot"
          style={{ background: champion.palette.primary }}
        />
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
            <button
              onClick={() => setProfileOpen(false)}
              aria-label="Close Champion profile"
            >
              ×
            </button>
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
              <div
                className="relic-gem"
                style={{ background: region.palette.accent }}
              />
              <div>
                <strong>
                  {relicUnlocked ? region.relic.name : "Empty relic slot"}
                </strong>
                <span>
                  {relicUnlocked
                    ? "Sunscale energy is now part of Shelvora's form."
                    : "Find relics to change skills and appearance."}
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

function createSunscaleAtmosphere(scene: Scene) {
  const skyTexture = new DynamicTexture(
    "sunscaleSkyGradient",
    { width: 512, height: 256 },
    scene,
    false,
  );
  const skyContext = skyTexture.getContext();
  const skyGradient = skyContext.createLinearGradient(0, 0, 0, 256);
  skyGradient.addColorStop(0, "#4d5f79");
  skyGradient.addColorStop(0.48, "#9a7880");
  skyGradient.addColorStop(0.73, "#d39b70");
  skyGradient.addColorStop(1, "#75514a");
  skyContext.fillStyle = skyGradient;
  skyContext.fillRect(0, 0, 512, 256);
  skyTexture.update(false);

  const sky = MeshBuilder.CreateSphere(
    "sunscaleSky",
    {
      diameter: 150,
      segments: 28,
      sideOrientation: Mesh.BACKSIDE,
    },
    scene,
  );
  sky.isPickable = false;
  sky.infiniteDistance = true;

  const skyMaterial = new StandardMaterial("sunscaleSkyMaterial", scene);
  skyMaterial.disableLighting = true;
  skyMaterial.backFaceCulling = false;
  skyMaterial.disableDepthWrite = true;
  skyMaterial.diffuseColor = Color3.Black();
  skyMaterial.emissiveTexture = skyTexture;
  skyMaterial.emissiveColor = Color3.White();
  sky.material = skyMaterial;

  const sunDisc = MeshBuilder.CreateDisc(
    "sunscaleSunDisc",
    { radius: 5.5, tessellation: 48 },
    scene,
  );
  sunDisc.position = new Vector3(-34, 24, 42);
  sunDisc.billboardMode = Mesh.BILLBOARDMODE_ALL;
  sunDisc.isPickable = false;

  const sunMaterial = new StandardMaterial("sunscaleSunMaterial", scene);
  sunMaterial.disableLighting = true;
  sunMaterial.disableDepthWrite = true;
  sunMaterial.emissiveColor = Color3.FromHexString("#ffd696");
  sunMaterial.alpha = 0.92;
  sunDisc.material = sunMaterial;

  const dustTexture = new DynamicTexture(
    "sunscaleDustTexture",
    { width: 64, height: 64 },
    scene,
    false,
  );
  const dustContext = dustTexture.getContext();
  const dustGradient = dustContext.createRadialGradient(32, 32, 0, 32, 32, 32);
  dustGradient.addColorStop(0, "rgba(255,232,196,.9)");
  dustGradient.addColorStop(0.35, "rgba(255,211,166,.48)");
  dustGradient.addColorStop(1, "rgba(255,196,135,0)");
  dustContext.fillStyle = dustGradient;
  dustContext.fillRect(0, 0, 64, 64);
  dustTexture.hasAlpha = true;
  dustTexture.update(false);

  const dust = new ParticleSystem("sunscaleDust", 220, scene);
  dust.particleTexture = dustTexture;
  dust.emitter = new Vector3(0, 1.2, 4);
  dust.minEmitBox = new Vector3(-18, 0, -20);
  dust.maxEmitBox = new Vector3(18, 8, 20);
  dust.color1 = new Color4(1, 0.78, 0.55, 0.12);
  dust.color2 = new Color4(1, 0.9, 0.72, 0.2);
  dust.colorDead = new Color4(0.8, 0.6, 0.45, 0);
  dust.minSize = 0.03;
  dust.maxSize = 0.11;
  dust.minLifeTime = 4;
  dust.maxLifeTime = 9;
  dust.emitRate = 22;
  dust.gravity = new Vector3(0, 0.018, 0);
  dust.direction1 = new Vector3(-0.04, 0.04, -0.02);
  dust.direction2 = new Vector3(0.08, 0.11, 0.05);
  dust.minEmitPower = 0.05;
  dust.maxEmitPower = 0.16;
  dust.updateSpeed = 0.012;
  dust.start();
}

function createSurfaceTexture(
  scene: Scene,
  name: string,
  base: string,
  fleck: string,
) {
  const texture = new DynamicTexture(
    name,
    { width: 256, height: 256 },
    scene,
    false,
  );
  const context = texture.getContext();

  context.fillStyle = base;
  context.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 220; i += 1) {
    const x = (i * 73) % 256;
    const y = (i * 151 + (i % 7) * 19) % 256;
    const radius = 1 + (i % 5) * 0.75;
    context.globalAlpha = 0.05 + (i % 4) * 0.025;
    context.fillStyle = fleck;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }

  context.globalAlpha = 0.13;
  context.strokeStyle = fleck;
  context.lineWidth = 2;
  for (let y = 18; y < 256; y += 43) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(64, y - 8);
    context.lineTo(160, y + 11);
    context.lineTo(256, y - 2);
    context.stroke();
  }
  context.globalAlpha = 1;

  texture.update(false);
  texture.uScale = 6;
  texture.vScale = 6;
  return texture;
}

function tuneImportedMaterials(
  scene: Scene,
  sandTexture: DynamicTexture | null,
  stoneTexture: DynamicTexture | null,
) {
  for (const candidate of scene.materials) {
    if (!(candidate instanceof PBRMaterial)) continue;

    const name = candidate.name.toLowerCase();
    candidate.metallic = 0;
    candidate.environmentIntensity = 0.9;

    if (name.includes("sand") && sandTexture) {
      candidate.albedoColor = Color3.White();
      candidate.albedoTexture = sandTexture;
      candidate.roughness = 0.88;
    }

    if (
      (name.includes("canyon") ||
        name.includes("ruin") ||
        name.includes("rock")) &&
      stoneTexture
    ) {
      candidate.albedoColor = Color3.White();
      candidate.albedoTexture = stoneTexture;
      candidate.roughness = 0.82;
    }

    if (name.includes("jade")) {
      candidate.roughness = 0.2;
      candidate.emissiveColor = Color3.FromHexString("#59b98b").scale(0.26);
      candidate.clearCoat.isEnabled = true;
      candidate.clearCoat.intensity = 0.45;
      candidate.clearCoat.roughness = 0.25;
    }

    if (name.includes("amber") || name.includes("sunscale_marking")) {
      candidate.roughness = 0.28;
      candidate.emissiveColor = Color3.FromHexString("#ffb63f").scale(0.55);
      candidate.clearCoat.isEnabled = true;
      candidate.clearCoat.intensity = 0.35;
    }

    if (name.includes("shellplate")) {
      candidate.roughness = 0.42;
      candidate.clearCoat.isEnabled = true;
      candidate.clearCoat.intensity = 0.28;
      candidate.clearCoat.roughness = 0.38;
    } else if (name.includes("shell")) {
      candidate.roughness = 0.48;
      candidate.clearCoat.isEnabled = true;
      candidate.clearCoat.intensity = 0.2;
    }

    if (name.includes("eye")) {
      candidate.roughness = 0.18;
      candidate.clearCoat.isEnabled = true;
      candidate.clearCoat.intensity = 0.75;
      candidate.clearCoat.roughness = 0.1;
    }
  }
}

function setShelvoraRelicGlow(scene: Scene, strength: number) {
  for (const candidate of scene.materials) {
    if (!(candidate instanceof PBRMaterial)) continue;
    const name = candidate.name.toLowerCase();

    if (
      name.includes("sunscale_marking") ||
      name.includes("sunscale_core") ||
      name.includes("relicamber")
    ) {
      candidate.emissiveColor =
        Color3.FromHexString("#ffb23f").scale(strength);
    }
  }
}

function material(scene: Scene, name: string, hex: string) {
  const mat = new StandardMaterial(name, scene);
  mat.diffuseColor = Color3.FromHexString(hex);
  mat.specularColor = Color3.Black();
  return mat;
}

function createFallbackEnvironment(scene: Scene, region: RegionDefinition) {
  const ground = MeshBuilder.CreateGround(
    "ground",
    { width: 46, height: 46 },
    scene,
  );
  ground.material = material(scene, "groundMat", region.palette.ground);

  const path = MeshBuilder.CreateGround(
    "path",
    { width: 7, height: 35 },
    scene,
  );
  path.position.z = 5;
  path.position.y = 0.02;
  path.material = material(scene, "pathMat", region.palette.path);
}

function createFallbackChampion(
  scene: Scene,
  champion: ChampionDefinition,
) {
  const root = new TransformNode("fallbackChampion", scene);
  const body = MeshBuilder.CreateCapsule(
    "fallbackBody",
    { height: 1.4, radius: 0.5 },
    scene,
  );
  body.parent = root;
  body.position.y = 0.7;
  body.material = material(
    scene,
    "fallbackMaterial",
    champion.palette.primary,
  );
  return root;
}
