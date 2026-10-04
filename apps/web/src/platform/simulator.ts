import type { ButtonName, ControllerFrameV1 } from "./protocol";
import { createNeutralFrame } from "./protocol";
import type { InputEngine } from "./input";

function nextButton(previous: boolean, next: boolean) {
  return {
    down: next,
    pressed: !previous && next,
    released: previous && !next,
  };
}

export class SimulatorSource {
  private frame = createNeutralFrame("simulator");

  constructor(private readonly engine: InputEngine) {
    this.publish();
  }

  getFrame() {
    return this.frame;
  }

  setForward(value: number) {
    this.patch({ axes: { ...this.frame.axes, forward: clamp(value, 0, 1) } });
  }

  setTurn(value: number) {
    this.patch({ axes: { ...this.frame.axes, turn: clamp(value, -1, 1) } });
  }

  setRoom(x: number, y: number) {
    this.patch({ room: { ...this.frame.room, x, y } });
  }

  setButton(name: ButtonName, down: boolean) {
    const previous = this.frame.buttons[name].down;
    this.patch({
      buttons: {
        ...this.frame.buttons,
        [name]: nextButton(previous, down),
      },
    });
  }

  pulse(name: ButtonName, durationMs = 120) {
    this.setButton(name, true);
    window.setTimeout(() => this.setButton(name, false), durationMs);
  }

  private patch(partial: Partial<ControllerFrameV1>) {
    this.frame = {
      ...this.frame,
      ...partial,
      sequence: this.frame.sequence + 1,
      timestamp: performance.now(),
      quality: { overall: 1, ageMs: 0 },
    };
    this.publish();
  }

  private publish() {
    this.engine.update("simulator", this.frame);
  }
}

export class KeyboardSource {
  private frame = createNeutralFrame("keyboard");
  private keys = new Set<string>();

  constructor(private readonly engine: InputEngine) {
    window.addEventListener("keydown", this.onKeyDown, { passive: false });
    window.addEventListener("keyup", this.onKeyUp, { passive: false });
    this.publish();
  }

  destroy() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }

  private onKeyDown = (event: KeyboardEvent) => {
    if (["ArrowUp", "ArrowLeft", "ArrowRight", " "].includes(event.key)) {
      event.preventDefault();
    }
    this.keys.add(event.key);
    this.recompute();
  };

  private onKeyUp = (event: KeyboardEvent) => {
    this.keys.delete(event.key);
    this.recompute();
  };

  private recompute() {
    const forward = this.has("w") || this.has("ArrowUp") ? 1 : 0;
    const left = this.has("a") || this.has("ArrowLeft");
    const right = this.has("d") || this.has("ArrowRight");
    const previous = this.frame;
    const button = (name: ButtonName, down: boolean) =>
      nextButton(previous.buttons[name].down, down);

    this.frame = {
      ...previous,
      sequence: previous.sequence + 1,
      timestamp: performance.now(),
      axes: {
        forward,
        turn: left === right ? 0 : left ? -1 : 1,
      },
      buttons: {
        run: button("run", this.has("Shift")),
        jump: button("jump", this.has(" ")),
        crouch: button("crouch", this.has("c")),
        interact: button("interact", this.has("e")),
      },
      quality: { overall: 1, ageMs: 0 },
    };
    this.publish();
  }

  private has(key: string) {
    return this.keys.has(key) || this.keys.has(key.toUpperCase());
  }

  private publish() {
    this.engine.update("keyboard", this.frame);
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
