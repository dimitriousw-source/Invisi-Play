import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  publicDir: path.resolve(root, "apps/web/public"),
  resolve: {
    alias: {
      "@invisi-play/protocol": path.resolve(root, "packages/protocol/src/index.ts"),
      "@invisi-play/input-core": path.resolve(root, "packages/input-core/src/index.ts"),
      "@invisi-play/game-sdk": path.resolve(root, "packages/game-sdk/src/index.ts"),
      "@invisi-play/simulator": path.resolve(root, "packages/simulator/src/index.ts"),
      "@invisi-play/game-a": path.resolve(root, "games/game-a/src/index.tsx")
    }
  },
  build: {
    target: "es2022"
  }
});
