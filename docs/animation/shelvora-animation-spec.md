# Shelvora Animation Specification

## General
Frame rate authoring target: 30 fps.
Runtime blending handled in Babylon.js.
All locomotion clips should loop cleanly where noted.

## Required clips

### Idle
Name: `Idle`
Length: 90 frames / 3.0 s
Loop: yes
Behavior:
- breathing through body/shell rise
- subtle head look
- tiny weight shift
- occasional blink can be handled separately later
Root motion: no

### Walk
Name: `Walk`
Length: 30 frames / 1.0 s
Loop: yes
Behavior:
- readable four-foot contact
- shell counter-sway
- head slightly stabilizes against body motion
- vertical body bob 2–4 cm
Root motion: no

### Run
Name: `Run`
Length: 20 frames / 0.67 s
Loop: yes
Behavior:
- compressed fast gait
- stronger forward lean
- faster shell sway
- feet lift clearly
Root motion: no

### Turn Left
Name: `TurnLeft`
Length: 18 frames / 0.6 s
Loop: no
Target: ~45 degree presentation turn
Behavior:
- head leads
- outside feet plant
- shell follows

### Turn Right
Name: `TurnRight`
Mirror of TurnLeft.

### Jump Start
Name: `JumpStart`
Length: 12 frames / 0.4 s
Loop: no
Behavior:
- compress
- head lowers
- push through all four legs
- final pose airborne

### Jump Loop
Name: `JumpLoop`
Length: 12 frames / 0.4 s
Loop: yes
Behavior:
- compact airborne pose
- slight leg tuck
- shell stable

### Land
Name: `Land`
Length: 14 frames / 0.47 s
Loop: no
Behavior:
- feet contact
- body compression
- shell overshoot and settle
- recover to idle/run blend-ready pose

### Crouch / Guard In
Name: `GuardIn`
Length: 12 frames / 0.4 s
Loop: no
Behavior:
- legs lower
- neck retracts
- shell dominates silhouette

### Guard Hold
Name: `GuardHold`
Length: 45 frames / 1.5 s
Loop: yes
Very subtle breathing.

### Guard Out
Name: `GuardOut`
Length: 12 frames / 0.4 s
Loop: no

### Interact
Name: `Interact`
Length: 30 frames / 1.0 s
Loop: no
Behavior:
- stop
- look toward target
- lift head/front body
- small shell/neck pulse

### Relic Bond
Name: `RelicBond`
Length: 75 frames / 2.5 s
Loop: no
Behavior:
- surprise/look up
- brace
- energy impact reaction
- shell expands/settles subtly
- proud final pose

## Optional polish clips
- IdleLookLeft
- IdleLookRight
- Sniff/Inspect
- PushStart
- PushLoop
- PushEnd
- HurtLight

## Runtime parameters
Animation state machine inputs:
- speed: 0..1
- grounded: bool
- verticalVelocity: float
- crouch: bool
- interacting: trigger
- relicBond: trigger
- turnRate: -1..1

## Blend targets
- Idle ↔ Walk: 0.18–0.25 s
- Walk ↔ Run: 0.15–0.2 s
- locomotion → JumpStart: <=0.1 s
- Land → locomotion: 0.12–0.2 s
- locomotion ↔ Guard: ~0.2 s

## Foot contact
Foot sliding is unacceptable for the benchmark.
The gait should be authored around obvious plant phases. Runtime speed will be tuned to match clip cadence rather than arbitrarily scaled.

## Root policy
No authored forward root motion for M1. Translation remains controller-driven so it works consistently with the Invisi-Play input engine.
