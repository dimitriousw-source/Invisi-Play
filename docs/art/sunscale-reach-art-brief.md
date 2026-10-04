# Sunscale Reach — Art Brief

## Purpose
Sunscale Reach is the first production-quality region and establishes the visual bar for Game A.

## Fantasy
An ancient reptile realm shaped by sun, stone, heat, and buried relic energy. It should feel warm and adventurous rather than hostile or barren.

## Visual pillars
- Warm sandstone contrasted with jade/teal mineral life.
- Broad readable forms suitable for TV play.
- Layered canyon depth instead of flat open ground.
- Ancient pathways and ruins embedded into natural rock.
- Magical energy appears sparingly through crystals, shrine seams, and heat-lit relics.
- Stylized animated-feature look: simplified forms, exaggerated scale, soft edges, strong silhouettes.

## Palette
Primary environment:
- sandstone: #C98258
- deep canyon: #704737
- sunlit sand: #DCA66F
- jade mineral: #69A783
- dark jade: #315D4D
- relic amber: #F3C65E
- sky dusk-lavender option: #80636F
- daylight sky option: #70A6B4

Lighting should make the hero colors read without saturating the full scene.

## First playable zone
Working name: Emberstep Basin.

Layout:
1. Arrival overlook
2. Curved descending path
3. Crystal garden
4. Broken reptile ruin gate
5. Small exploration fork
6. Resonance Shrine clearing
7. Vista revealing a larger inaccessible canyon beyond

Target traversal time to shrine: 60–120 seconds at walk speed.

## Environment kit
Create modular Blender assets:
- sandstone_boulder_A/B/C
- canyon_spire_A/B
- flat_rock_step_A/B
- jade_crystal_A/B/C
- ruin_pillar_A/B
- ruin_arch_A
- reptile_totem_A
- sunscale_shrub_A/B
- dry_grass_clump_A
- shrine_base_A
- shrine_ring_A
- relic_pedestal_A

## Scale language
- Small props: 0.2–0.8 m.
- Medium rocks/plants: 1–3 m.
- Hero spires: 5–12 m.
- Distant canyon masses: 20–60 m, low detail.
- Paths should be 3.5–5 m wide to remain readable with motion control.

## Terrain
Do not rely on a single flat plane.
Use:
- sculpted rolling basin
- raised rock shelves
- shallow ramps
- natural borders preventing accidental exits
- distant canyon cards/meshes for depth

Avoid narrow ledges in the first slice; motion-control comfort comes first.

## Lighting
First target:
- one warm directional key sun
- cool sky fill
- soft contact shadows
- restrained ambient occlusion
- fog/haze for distance separation
- slight bloom only on relic/crystal emissives

No photoreal lighting target. Readability and color separation come first.

## Atmosphere
- sparse drifting dust motes near ground
- subtle heat shimmer later if performance allows
- small wind movement on shrubs/grass
- ambient crystal hum near jade formations
- distant bird/creature silhouettes optional

## Shrine
The Resonance Shrine is the visual focal point.
Shape:
- circular stone platform
- 3 broken vertical fins/pillars
- central floating relic core
- carved channels that illuminate on activation

Activation sequence:
1. Champion enters radius
2. low glow begins
3. interaction
4. channels illuminate outward
5. relic rises
6. energy travels to Champion
7. shell markings activate
8. environment settles to a new ambient state

## Performance budget
For first web target:
- First playable zone visible draw calls target: under ~150 before UI.
- Prefer instancing for repeated rocks/crystals.
- Environment textures: mostly 1K–2K.
- Hero shrine textures may use 2K.
- Avoid unique 4K textures.
- Use baked/simple materials where possible.

## Export
Prefer modular GLB exports during production:
- `sunscale_environment_core_v001.glb`
- `sunscale_props_v001.glb`
- `sunscale_shrine_v001.glb`

Long term we may merge/bake after profiling.
