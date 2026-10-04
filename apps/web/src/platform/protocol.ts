import { z } from "zod";

export const ButtonStateSchema = z.object({
  down: z.boolean(),
  pressed: z.boolean(),
  released: z.boolean(),
});

export const ControllerFrameV1Schema = z.object({
  protocolVersion: z.literal(1),
  playerId: z.string(),
  sequence: z.number().int().nonnegative(),
  timestamp: z.number().nonnegative(),
  source: z.enum(["keyboard", "simulator", "motion-hub", "replay"]),
  axes: z.object({
    forward: z.number().min(0).max(1),
    turn: z.number().min(-1).max(1),
  }),
  buttons: z.object({
    run: ButtonStateSchema,
    jump: ButtonStateSchema,
    crouch: ButtonStateSchema,
    interact: ButtonStateSchema,
  }),
  room: z.object({
    tracked: z.boolean(),
    x: z.number(),
    y: z.number(),
    confidence: z.number().min(0).max(1),
  }),
  quality: z.object({
    overall: z.number().min(0).max(1),
    ageMs: z.number().nonnegative(),
  }),
});

export type ControllerFrameV1 = z.infer<typeof ControllerFrameV1Schema>;
export type ButtonName = keyof ControllerFrameV1["buttons"];
export type InputSourceName = ControllerFrameV1["source"];

export const makeButton = (down = false) => ({
  down,
  pressed: false,
  released: false,
});

export function createNeutralFrame(source: InputSourceName = "simulator"): ControllerFrameV1 {
  return {
    protocolVersion: 1,
    playerId: "p1",
    sequence: 0,
    timestamp: performance.now(),
    source,
    axes: { forward: 0, turn: 0 },
    buttons: {
      run: makeButton(),
      jump: makeButton(),
      crouch: makeButton(),
      interact: makeButton(),
    },
    room: { tracked: true, x: 2.3, y: 1.7, confidence: 1 },
    quality: { overall: 1, ageMs: 0 },
  };
}
