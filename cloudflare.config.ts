import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig({
  worker: defineWorker({
    name: "sckrilla",
    entrypoint: "./worker/entry.ts",
    compatibilityDate: "2026-11-18",
    compatibilityFlags: ["nodejs_compat"],
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    env: {
      ASSETS: bindings.assets(),
      IMAGES: bindings.images(),
      ANALYTICS_KV: bindings.kv({ id: "165e8434d8e04c0cab15b0f1fcb464aa" }),
    },
  }),
});
