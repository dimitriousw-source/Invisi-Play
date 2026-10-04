# Shelvora → Babylon.js Integration Specification

## Goal
Replace the procedural placeholder Champion with a Blender-authored GLB while preserving the universal Invisi-Play controller architecture.

## Runtime asset
Expected path:
`/assets/models/champions/shelvora/shelvora_v001.glb`

Game A must not know about BLE, radar, ESP32, or hardware adapters.

## Loading
Use Babylon.js SceneLoader / loadAssetContainerAsync.
Requirements:
- load once per Champion selection
- show loading state until mesh + animation groups are ready
- dispose previous Champion cleanly when switching
- cache asset/container where practical

## Asset contract
GLB must contain:
- one Champion root
- skinned mesh(es)
- armature
- named AnimationGroups matching the animation specification
- material(s)
- optional node `RelicSockets` or named socket empties later

Expected clip names:
- Idle
- Walk
- Run
- TurnLeft
- TurnRight
- JumpStart
- JumpLoop
- Land
- GuardIn
- GuardHold
- GuardOut
- Interact
- RelicBond

## Coordinate conventions
- Blender: Z-up.
- Export GLB using Blender glTF defaults suitable for Babylon.
- Champion forward direction must be consistent across all assets.
- Runtime root should be normalized so ground contact sits at local Y=0 after import.
- World scale must be meters / consistent with Babylon units.

## Animation controller
Create a dedicated ChampionAnimator class separate from GameA scene logic.

Responsibilities:
- index AnimationGroups by name
- track current locomotion state
- blend transitions
- fire one-shot clips
- expose `update(controllerState, dt)`

State priority:
1. RelicBond
2. Interact
3. airborne / landing
4. guard/crouch
5. locomotion
6. idle

## Locomotion mapping
Controller axes remain authoritative for gameplay motion.
Animation selection:
- speed < 0.08 => Idle
- 0.08–0.65 => Walk
- >0.65 or run held => Run

Movement acceleration should be smoothed separately from animation state:
- walk acceleration target: ~0.25 s
- run acceleration target: ~0.35 s
- deceleration target: ~0.2 s

## Turning
For continuous gameplay:
- body yaw driven by normalized `turn`
- animation adds visual weight
- use TurnLeft/TurnRight primarily at low forward speed
- while moving, blend locomotion with body lean rather than stopping for a turn clip

## Jump
Gameplay physics remains code-driven.
Animation events:
- trigger JumpStart on launch
- transition to JumpLoop after takeoff
- detect grounded transition
- play Land
- return to locomotion based on current speed

## Relic visual state
Sunscale Ember state should be controlled independently of the animation.
Approach:
- exported shell material exposes emissive-capable markings, or
- second material/mesh layer hidden by default

On relic unlock:
- play RelicBond
- animate emissive intensity 0 → target
- persist unlocked visual in Champion profile state

## Camera
Replace hard lock with spring smoothing:
- target position follows Champion root with damping
- target yaw follows Champion facing with damping
- camera distance baseline ~6.5–8 m
- mild FOV increase on run
- landing should not cause harsh camera vertical snap

## Grounding
Use Champion collider / simple capsule separate from render mesh.
Render mesh may bob through animation; collider defines gameplay position.
Champion asset root should remain attached to gameplay root.

## Shadows
Required:
- Champion casts dynamic shadow
- receives environment lighting
- contact shadow/blob fallback allowed on weak devices
- performance mode may reduce shadow map size

## Performance
Target:
- 60 fps on desktop development machine.
- Design toward 30–60 fps on future low-cost HDMI target.
- Champion GLB initial target < 8 MB compressed if practical.
- Draco/Meshopt can be evaluated after baseline integration.
- Avoid excessive bones/materials.

## Fallback
Keep procedural Champion behind a development fallback flag until the GLB is verified in production.
