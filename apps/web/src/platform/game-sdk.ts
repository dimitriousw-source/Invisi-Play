import type { ControllerFrameV1 } from "./protocol";
import type { InputEngine } from "./input";

export class InvisiController {
  constructor(private readonly engine: InputEngine) {}

  getFrame(): ControllerFrameV1 {
    return this.engine.getFrame();
  }

  subscribe(listener: (frame: ControllerFrameV1) => void) {
    return this.engine.subscribe(listener);
  }
}
