# Architecture

## Product path

Sensors -> Local Motion Hub -> Motion Interpretation -> Universal Controller Engine -> Game SDK -> Game A / future games.

## Hard boundary

`games/game-a` may depend on `@invisi-play/game-sdk` but must not import hardware adapters, BLE, radar parsers, ESP32 code, or transport implementations.

## Current M1 input providers

- SimulatorSource
- KeyboardSource

Both emit the same `ControllerFrameV1` shape used later by the real Motion Hub.

## Future hardware path

LD2450 A/B -> ESP32 -> local transport -> radar adapter -> motion engine

WT901BLECL -> local BLE-capable runtime/hub -> IMU adapter -> motion engine

The motion engine emits `ControllerFrameV1`; Game A remains unchanged.
