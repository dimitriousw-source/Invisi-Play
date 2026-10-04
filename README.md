# Invisi-Play

Standalone prototype for the Invisi-Play camera-free motion gaming platform.

## M1 — Virtual Movement Loop

The first milestone proves the universal input loop before physical hardware integration.

### Architecture

Sensor adapters and motion interpretation are platform concerns. Game A consumes only the universal Invisi-Play game SDK/controller state.

Game A must not import radar, BLE, ESP32, or device-specific code.

### Current inputs

- Sensor simulator
- Keyboard simulator

Both emit the same `ControllerFrameV1` structure that the real local Motion Hub will eventually provide.

### Run

```bash
npm install
npm run dev
```

### Build

```bash
npm run build
```

This repository is intentionally isolated from PRISM, SIVLO, Fam Meal, HomeSense, and every other project.
