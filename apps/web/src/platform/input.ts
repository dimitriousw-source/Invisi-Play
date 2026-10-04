import type { ControllerFrameV1, InputSourceName } from "./protocol";
import { createNeutralFrame } from "./protocol";

export type InputListener = (frame: ControllerFrameV1) => void;

export class InputEngine {
  private activeSource: InputSourceName = "simulator";
  private frames = new Map<InputSourceName, ControllerFrameV1>();
  private listeners = new Set<InputListener>();

  constructor() {
    this.frames.set("simulator", createNeutralFrame("simulator"));
    this.frames.set("keyboard", createNeutralFrame("keyboard"));
  }

  setActiveSource(source: InputSourceName) {
    this.activeSource = source;
    this.emit();
  }

  getActiveSource() {
    return this.activeSource;
  }

  update(source: InputSourceName, frame: ControllerFrameV1) {
    this.frames.set(source, frame);
    if (source === this.activeSource) this.emit();
  }

  getFrame(): ControllerFrameV1 {
    return this.frames.get(this.activeSource) ?? createNeutralFrame(this.activeSource);
  }

  subscribe(listener: InputListener) {
    this.listeners.add(listener);
    listener(this.getFrame());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit() {
    const frame = this.getFrame();
    for (const listener of this.listeners) listener(frame);
  }
}
