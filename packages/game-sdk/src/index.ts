import type { ControllerFrameV1 } from "@invisi-play/protocol";
import type { InputEngine } from "@invisi-play/input-core";

export class InvisiController {
  constructor(private readonly engine: InputEngine) {}
  getFrame(): ControllerFrameV1 { return this.engine.getFrame(); }
  subscribe(listener: (frame: ControllerFrameV1) => void) { return this.engine.subscribe(listener); }
}
