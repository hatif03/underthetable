// Bundles server/handlers/*.ts into api/*.js, plain JavaScript with its dependencies inside.
// Vercel runs those files as they are, so no TypeScript import resolution is left to the host.
// The outputs are committed. Run this after changing anything in server/ or src/lib/.
import { build } from "esbuild"
import { readdirSync } from "node:fs"

const entries = readdirSync("server/handlers").filter((file) => file.endsWith(".ts")).map((file) => `server/handlers/${file}`)
await build({
  entryPoints: entries,
  outdir: "api",
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  legalComments: "none",
  logLevel: "warning",
  // A CommonJS dependency inside an ES module bundle needs require.
  banner: { js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);" },
  external: ["ws", "bufferutil", "utf-8-validate"],
})
console.log(`bundled ${entries.length} handlers into api/`)
