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

export default function GameA({ controller }: { controller: InvisiController }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [objectiveComplete, setObjectiveComplete] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: false,
      stencil: true,
    });
    const scene = new Scene(engine);
    scene.clearColor = new Color4(0.035, 0.05, 0.08, 1);

    const camera = new ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      1.08,
      8,
      new Vector3(0, 1.25, 0),
      scene,
    );
    camera.lowerRadiusLimit = 6;
    camera.upperRadiusLimit = 10;
    camera.inputs.clear();

    const hemi = new HemisphericLight("hemi", new Vector3(0, 1, 0), scene);
    hemi.intensity = 0.95;

    const sun = new DirectionalLight("sun", new Vector3(-0.4, -1, 0.25), scene);
    sun.intensity = 0.75;

    const ground = MeshBuilder.CreateGround("ground", { width: 44, height: 44 }, scene);
    const groundMat = new StandardMaterial("groundMat", scene);
    groundMat.diffuseColor = new Color3(0.12, 0.18, 0.17);
    groundMat.specularColor = Color3.Black();
    ground.material = groundMat;

    const path = MeshBuilder.CreateGround("path", { width: 7, height: 34 }, scene);
    path.position.z = 5;
    path.position.y = 0.015;
    const pathMat = new StandardMaterial("pathMat", scene);
    pathMat.diffuseColor = new Color3(0.25, 0.23, 0.19);
    path.material = pathMat;

    for (let i = 0; i < 14; i += 1) {
      const rock = MeshBuilder.CreateSphere(
        `rock-${i}`,
        { diameter: 0.5 + (i % 3) * 0.16, segments: 8 },
        scene,
      );
      rock.scaling.y = 0.55;
      rock.position = new Vector3(
        (i % 2 ? 1 : -1) * (4.5 + (i % 4)),
        0.2,
        -7 + i * 2.2,
      );
      const rockMat = new StandardMaterial(`rockMat-${i}`, scene);
      rockMat.diffuseColor = new Color3(0.24, 0.29, 0.28);
      rock.material = rockMat;
    }

    const playerRoot = new TransformNode("playerRoot", scene);
    const body = MeshBuilder.CreateCapsule(
      "player",
      { height: 1.8, radius: 0.45 },
      scene,
    );
    body.parent = playerRoot;
    body.position.y = 0.9;
    const bodyMat = new StandardMaterial("playerMat", scene);
    bodyMat.diffuseColor = new Color3(0.12, 0.64, 0.95);
    body.material = bodyMat;

    const facing = MeshBuilder.CreateBox(
      "facing",
      { width: 0.22, height: 0.22, depth: 0.8 },
      scene,
    );
    facing.parent = playerRoot;
    facing.position = new Vector3(0, 1.05, 0.45);
    facing.material = bodyMat;

    const objective = MeshBuilder.CreatePolyhedron(
      "objective",
      { type: 1, size: 0.9 },
      scene,
    );
    objective.position = new Vector3(0, 1.25, 11);
    const objectiveMat = new StandardMaterial("objectiveMat", scene);
    objectiveMat.emissiveColor = new Color3(0.95, 0.55, 0.1);
    objectiveMat.diffuseColor = new Color3(0.7, 0.3, 0.05);
    objective.material = objectiveMat;

    let verticalVelocity = 0;
    let grounded = true;
    let completed = false;
    let lastJumpSequence = -1;
    let lastInteractSequence = -1;

    engine.runRenderLoop(() => {
      const dt = Math.min(engine.getDeltaTime() / 1000, 0.05);
      const frame = controller.getFrame();
      const speed = frame.buttons.run.down ? 6.4 : 3.2;

      playerRoot.rotation.y += frame.axes.turn * 2.25 * dt;
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

      body.scaling.y = frame.buttons.crouch.down ? 0.62 : 1;
      body.position.y = frame.buttons.crouch.down ? 0.58 : 0.9;
      facing.position.y = frame.buttons.crouch.down ? 0.68 : 1.05;

      objective.rotation.y += 0.9 * dt;
      objective.position.y =
        1.25 + Math.sin(performance.now() / 450) * 0.12;

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
          objectiveMat.emissiveColor = new Color3(0.25, 1, 0.45);
          objectiveMat.diffuseColor = new Color3(0.08, 0.55, 0.2);
          setObjectiveComplete(true);
        }
      }

      const cameraTarget = playerRoot.position.add(new Vector3(0, 1.15, 0));
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
  }, [controller]);

  return (
    <div className="game-shell">
      <canvas
        ref={canvasRef}
        className="game-canvas"
        aria-label="Game A 3D movement playground"
      />
      <div className="game-hud game-hud-left">
        <strong>GAME A — MOVEMENT PROTOTYPE</strong>
        <span>
          {objectiveComplete
            ? "Objective complete!"
            : "Reach the glowing marker and interact."}
        </span>
      </div>
      <div className="game-hud game-hud-right">
        <span>W / ↑ Forward</span>
        <span>A,D / ←,→ Turn</span>
        <span>Shift Run · Space Jump · C Crouch · E Interact</span>
      </div>
    </div>
  );
}
