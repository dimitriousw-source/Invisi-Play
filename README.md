# Invisi-Play

Standalone prototype for the Invisi-Play camera-free motion gaming platform.

## M1: Virtual Movement Loop

This repository intentionally contains no dependencies on PRISM, SIVLO, Fam Meal, HomeSense, or any other project.

### Run

```bash
npm install
npm run dev
```

### Build

```bash
npm run typecheck
npm run build
```

### Architecture boundary

Game A consumes only the universal Invisi-Play game SDK/controller frame. It does not import radar, BLE, ESP32, or device-specific adapters.
