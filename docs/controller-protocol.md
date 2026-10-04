# ControllerFrameV1

The universal game-facing state contains:

- `axes.forward` (0..1)
- `axes.turn` (-1..1)
- button states for run, jump, crouch, interact
- physical room position/confidence
- source, sequence, timestamp, and quality metadata

Room position is intentionally separate from virtual locomotion.
