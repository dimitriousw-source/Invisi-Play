# Game A — First 10 Minutes Vertical Slice

Status: Production target  
Purpose: Turn the Creative Direction and Visual Bible into a concrete first-session experience.

---

## 1. Success definition

The first ten minutes must make the player want to continue for one reason above all:

They want to see what their Champion can become.

The slice must demonstrate:
- world identity
- meaningful starting choice
- Champion personality
- movement quality
- exploration
- first visible progression
- story mystery
- premium presentation

---

## 2. Sequence

### Beat 1 — World Reveal
Duration target: 45–75 seconds.

Camera moves over an interactive world-map diorama.

Four starting regions are visible:
- Verdant Veil
- Goldenwild
- Sunscale Reach
- High Aerie

Each region animates subtly while highlighted.

The player can inspect them before choosing.

No long narration is required.

Optional short Warden voice/text line:

"The old paths are waking again."

---

### Beat 2 — Choose a Homeland
Duration target: 30–90 seconds.

The player highlights regions and sees:
- region name
- short identity line
- three starter silhouettes
- dominant progression flavor

Example:

Sunscale Reach  
Ancient paths. Enduring strength. Heat, stone, and hidden chambers.

The choice determines the opening chapter, not the entire game.

---

### Beat 3 — Region Fly-in
Duration target: 20–35 seconds.

A short authored transition moves from world map into the selected land.

For Sunscale Reach:
- map camera dives toward sandstone mesas
- distant jade minerals catch sunlight
- a Resonance Shrine is briefly visible
- a small reptile settlement/ruin silhouette hints at a larger world

Region title appears once:

SUNSCALE REACH

No loading-screen feel if avoidable.

---

### Beat 4 — The Warden
Duration target: 45–75 seconds.

The player arrives at a quiet threshold location.

The Warden stands ahead.

Dialogue is short.

Suggested first-pass text:

"You felt it too."

"The bond beneath these lands is waking."

"But no path begins alone."

The Warden gestures toward three Champion spaces.

"Choose the one whose first step feels like your own."

---

### Beat 5 — Champion Selection
Duration target: 1–2 minutes.

Three Champions stand physically in the scene or in a cinematic presentation space.

For Sunscale Reach:
- Scalix
- Shelvora
- Virel

Each Champion:
- plays a unique idle
- reacts when highlighted
- demonstrates one signature movement/ability
- displays three short ability labels
- has a personality descriptor

The UI should not feel like selecting from static cards alone.

The player should be able to orbit or preview each Champion.

---

### Beat 6 — First Bond
Duration target: 20–30 seconds.

On confirmation:
- Champion approaches
- player/Champion bond energy appears
- Warden observes
- Champion markings respond faintly
- music/lighting resolves

The Champion is now emotionally established.

Suggested Warden line:

"Good. Now let the world teach you both."

---

### Beat 7 — First Playable Steps
Duration target: 1–2 minutes.

The player enters the starter environment.

No full tutorial box.

Teach through space:
- open path encourages forward movement
- turn reveals optional scenic object
- low obstacle teaches jump if needed
- run space teaches faster movement naturally

The Champion's locomotion must be polished enough that simply moving is enjoyable.

For keyboard development:
- W / Up = forward
- A/D / Left/Right = turn
- Shift = run
- Space = jump
- E = interact
- drag = camera orbit
- wheel = camera zoom
- R = camera recenter

Hardware later maps into the same controller frame.

---

### Beat 8 — Environmental Discovery
Duration target: 60–90 seconds.

The player sees something slightly off the main path.

Example Sunscale:
a jade mineral formation pulses when approached.

Interaction provides a tiny reward or lore echo.

This teaches:

exploration matters.

The player can continue without collecting it.

---

### Beat 9 — First Resonance Shrine
Duration target: 1–2 minutes.

The shrine is visible before the player reaches it.

Approach sequence:
- ambient sound changes
- channels flicker faintly
- Champion reacts
- relic core begins to glow

Player interacts.

Activation:
1. channels illuminate
2. relic rises
3. Champion looks/reacts
4. energy crosses the space
5. bond animation plays
6. visual marking changes
7. new trait is registered

For Shelvora:
Sunscale Ember activates warm amber shell seams/markings.

---

### Beat 10 — Hook for the Larger Game
Duration target: 20–40 seconds.

After the bond:
a previously dormant path, distant structure, or map signal activates.

The world map briefly indicates another possible direction.

The Warden does not explain everything.

Suggested line:

"One bond remembered."

"Many more are still sleeping."

Return control to player.

End of vertical-slice target.

---

## 3. What the player must understand by minute ten

Without reading a manual, the player should understand:

- there are multiple regions
- they chose one starter
- their Champion is persistent
- exploration gives meaningful growth
- relics visibly change Champions
- abilities will open new paths
- the Warden knows more than they are saying
- this first area is only a small part of the world

---

## 4. What should remain mysterious

Do not explain yet:
- exact cause of the broken bonds
- Warden's full past
- final evolution structure
- number of relics
- final antagonist
- all future regions
- every Champion build possibility

Mystery increases forward momentum.

---

## 5. Quality gates

The first ten minutes are not ready for external showing until:

- Champion locomotion looks grounded
- world map feels premium
- Champion selection includes live character presentation
- Sunscale environment no longer reads as primitives/blockout
- camera orbit/zoom/recenter works
- shrine event has cinematic timing
- relic change is visible from gameplay distance
- UI is readable at TV distance
- Vercel build is stable
- target framerate feels smooth on the development machine

---

## 6. Current implementation alignment

Already represented in the prototype:
- world map
- four starting regions
- Warden concept
- three starter Champions per current region
- Champion selection
- Shelvora GLB pipeline
- Sunscale Reach GLB pipeline
- Champion animation controller
- shrine interaction
- relic state
- orbit/zoom/recenter camera
- universal controller architecture

Still requiring production-quality replacement:
- map art
- Champion selection staging
- Warden model
- Shelvora v002 art
- Sunscale Reach v002 geometry/materials
- environmental discovery beat
- shrine cinematic sequence
- first-bond cinematic
- UI final art
- sound/music
