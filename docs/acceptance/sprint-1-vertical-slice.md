# Sprint 1 Acceptance Criteria — Shelvora in Sunscale Reach

## Sprint statement
A player can enter Sunscale Reach with Shelvora and experience a polished vertical slice that feels like an actual stylized adventure game rather than a prototype blockout.

## A. Shelvora visual quality
Pass when:
- Shelvora is a Blender-authored model, not procedural primitives.
- Silhouette clearly reads as a turtle-like Champion.
- Face/eyes are readable from gameplay camera.
- Feet visibly meet the ground.
- Shell provides obvious future evolution/relic surfaces.
- Sunscale Ember changes the visible model/material state.

## B. Animation quality
Pass when:
- Idle loops without popping.
- Walk contains visible foot plants and no obvious skating at tuned speed.
- Run is visually distinct from walk.
- Turning stops when input stops.
- Jump has anticipation, airborne pose, and landing recovery.
- Guard/crouch visibly changes the silhouette.
- Interact plays as a one-shot without freezing the controller.
- RelicBond plays once at shrine completion.

## C. Movement feel
Pass when:
- Start/stop is eased, not instant robotic translation.
- Character feels grounded.
- No persistent floating above the terrain.
- Turn rate is controllable.
- Camera does not induce abrupt rotation or vertical snapping.
- W/A/D and arrow controls remain functional until real hardware is connected.

## D. Environment
Pass when:
- Flat test plane is replaced by layered Sunscale Reach terrain.
- At least 8 unique modular environment assets are used.
- Scene has foreground, midground, and background depth.
- Warm sandstone + jade accent palette is consistent.
- Shrine is a clear visual focal point.
- The world beyond the first slice is visible but not accessible.

## E. Lighting / presentation
Pass when:
- Directional sunlight and sky fill create readable form.
- Champion casts a useful shadow/contact shadow.
- Distance haze/fog improves depth.
- Crystals/relic use restrained emissive/bloom.
- HUD does not dominate the game image.

## F. Shrine sequence
Pass when:
1. Player approaches shrine.
2. Shrine gives proximity feedback.
3. Interact triggers activation.
4. Environment channels light.
5. Relic energy reaches Shelvora.
6. RelicBond animation plays.
7. Shell markings activate.
8. Champion profile shows Sunscale Ember.
9. State remains active for the remainder of the session.

## G. Technical pipeline
Pass when:
- Blender source file saved in Invisi-Play asset workspace.
- GLB export is reproducible.
- Game loads GLB from a stable asset path.
- Animation names match documented contract.
- GitHub CI succeeds.
- Vercel deployment succeeds.
- No code/assets/resources from PRISM, SIVLO, HomeSense, Fam Meal, or other projects are used.

## H. Performance
Initial target:
- Desktop browser maintains visually smooth play, ideally 60 fps.
- No multi-second hitch after initial Champion load.
- Model and environment asset sizes documented.
- No runaway object creation per frame.
- Babylon scene disposes cleanly when leaving Game A.

## I. User-facing success test
The slice passes creatively when a new viewer can answer yes to:
- “Does Shelvora look alive?”
- “Does Shelvora look like it is walking rather than sliding?”
- “Does this look like the beginning of a real game?”
- “Can I tell what makes Sunscale Reach different?”
- “Did gaining the relic visibly change my Champion?”

## Not required for Sprint 1
- full combat
- enemies
- NPC population
- voice acting
- final story dialogue
- all regions
- all Champions
- save accounts/cloud saves
- multiplayer
- production sensor hardware
