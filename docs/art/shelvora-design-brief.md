# Shelvora — Production Design Brief

## Purpose
Shelvora is the first production-quality Champion for Game A and the visual/technical benchmark for all future Champions.

## Character fantasy
A young turtle-like guardian from Sunscale Reach: calm, sturdy, curious, and quietly powerful. Shelvora should look approachable enough for a family audience while still feeling capable of becoming formidable.

## Visual pillars
- Large readable silhouette at TV distance.
- Low center of gravity; clearly grounded, never floaty.
- Oversized shell as the main evolution canvas.
- Expressive head and eyes with minimal facial complexity.
- Chunky feet that visibly contact the ground.
- Soft stylized forms rather than anatomical realism.
- Shape language: rounded body + broad shell + compact limbs + slightly oversized head.
- Avoid realistic scales, sharp claws, or overly dense detail.

## Proportions
Target world height: approximately 1.15 m from foot plane to top of shell/head.
- Shell: 48% of total visual mass.
- Head: 22% larger than realistic turtle proportion.
- Feet: broad and slightly oversized for readable contact.
- Legs: short, thick, and visibly articulated.
- Tail: short; secondary motion only.
- Neck: enough range for head-led turns and idle personality.

## Color direction
Base palette:
- Shell primary: jade / deep olive.
- Body: muted green-teal.
- Underside: warm sand.
- Eyes: amber/gold.
- Accent markings: pale sun-gold.

Relic energy from Sunscale Reach:
- Warm amber/orange emissive lines appear in shell seams and cheek/leg markings.
- Relic change should be visible from normal gameplay camera distance.
- Keep emissive coverage below roughly 15% of visible surface so it feels special.

## Face and personality
Idle expression: observant and calm.
- Large eyes with clear pupils.
- Slight brow ridge or eyelid shape for expression.
- Mouth should support subtle smile/open reaction but not require lip-sync-quality topology yet.
- Head should lead many turns by a few frames before the body.

## Shell design
The shell is the long-term evolution platform.
Base shell should include:
- 5–7 large readable plates.
- Central crest/plate capable of changing later.
- Recessed seams suitable for emissive relic effects.
- Two attachment zones for future relics, armor growth, crystals, feathers, moss, etc.

## Modeling target
For the first web/HDMI target:
- Champion mesh target: 18k–35k triangles after modifiers.
- One armature.
- Prefer 1–2 skinned meshes, maximum 3.
- Maximum 3 material slots for the base model.
- No subdivision modifier required at runtime.
- Use weighted normals / auto smooth where appropriate.
- Keep topology deformation-friendly around shoulders/hips/neck.

## Rig
Required deform bones:
- root
- pelvis
- spine_01
- neck
- head
- jaw optional
- leg_F.L / lower_leg_F.L / foot_F.L
- leg_F.R / lower_leg_F.R / foot_F.R
- leg_B.L / lower_leg_B.L / foot_B.L
- leg_B.R / lower_leg_B.R / foot_B.R
- tail_01 optional
- shell_root
- shell_secondary optional

Control bones may exist in Blender but only deform bones should be exported when practical.

## Movement personality
Shelvora should feel heavy-but-lively, not slow and sluggish.
- Walk: deliberate 4-beat gait with shell sway.
- Run: compact bounding/trotting gait, faster cadence, stronger body compression.
- Turn: plant outer feet and rotate with head-leading motion.
- Jump: squat/compress, push, tuck slightly, land with shell/body settle.
- Crouch/guard: legs lower, head retracts, shell becomes dominant silhouette.

## Starting abilities represented visually
1. Shell Guard
   - body lowers
   - head retracts slightly
   - shell tilts forward
2. Stone Push
   - shoulders/head brace
   - feet widen
   - forward lean
3. Safe Passage
   - subtle shell glow or protective aura when active later

## Relic milestone: Sunscale Ember
First relic effect:
- amber emissive seams activate across shell
- small golden marking under each eye
- optional warm particle sparks on shrine activation only
- no permanent particle emitter during normal traversal

## Export
Primary runtime asset:
`shelvora_v001.glb`

Blender source:
`shelvora_v001.blend`

Animations should be exported as named actions/NLA clips according to the animation specification.
