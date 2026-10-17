import { defineConfig, loadEnv, type Plugin } from "vite"
import type { IncomingMessage, ServerResponse } from "node:http"
import react from "@vitejs/plugin-react"
import { suggestSlip } from "./server/assist.ts"
import { attest } from "./server/attest.ts"
import { drip } from "./server/drip.ts"
import { humanMode } from "./server/human.ts"
import { relay } from "./server/rpc.ts"
import { snapshot } from "./server/snapshot.ts"

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = []
    req.on("data", (chunk: Buffer) => chunks.push(chunk))
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")))
  })
}

function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader("Content-Type", "application/json")
  res.end(typeof body === "string" ? body : JSON.stringify(body))
}

/** The same three routes the host runs from api/, served by the dev server. Keys stay on this side. */
function apiPlugin(env: Record<string, string>): Plugin {
  const upstream = env.ARKIV_RPC_URL || "https://rpc.tiramisu.db-chain.testnet.arkiv.network"
  const humanEnv = { secret: env.HUMAN_SECRET || env.DRIP_KEY || env.SEED_KEY_1, turnstileSecret: env.TURNSTILE_SECRET, turnstileSite: env.TURNSTILE_SITEKEY }
  return {
    name: "underthetable-api",
    configureServer(server) {
      server.middlewares.use("/api/assist", (req, res) => {
        if (req.method !== "POST") return send(res, 405, { error: "Send a description with POST." })
        void (async () => {
          try {
            if (!env.IFM_API_KEY) throw new Error("The assistant is not configured on this computer. The slip fills on your device anyway.")
            const body = JSON.parse(await readBody(req)) as { text?: string }
            send(res, 200, { suggestion: await suggestSlip(String(body.text ?? ""), env.IFM_API_KEY) })
          } catch (error) {
            send(res, 400, { error: error instanceof Error ? error.message : "Could not fill the slip." })
          }
        })()
      })
      server.middlewares.use("/api/human", (_req, res) => {
        res.setHeader("Cache-Control", "no-store")
        send(res, 200, humanMode(humanEnv))
      })
      server.middlewares.use("/api/drip", (req, res) => {
        if (req.method !== "POST") return send(res, 405, { error: "Send an address with POST." })
        void (async () => {
          try {
            const body = JSON.parse(await readBody(req)) as { address?: string; proof?: { mode?: string; challenge?: string; nonce?: string; token?: string } }
            const client = req.socket.remoteAddress ?? "local"
            send(res, 200, await drip(body.address, client, { key: env.DRIP_KEY || env.SEED_KEY_1, rpc: upstream, human: humanEnv }, body.proof))
          } catch (error) {
            send(res, 429, { error: error instanceof Error ? error.message : "The faucet failed." })
          }
        })()
      })
      server.middlewares.use("/api/attest", (req, res) => {
        if (req.method !== "POST") return send(res, 405, { error: "POST only." })
        void (async () => {
          try {
            const body = JSON.parse(await readBody(req)) as Record<string, unknown>
            send(res, 200, await attest(body, req.socket.remoteAddress ?? "local", { key: env.ATTEST_KEY, rpc: upstream }))
          } catch (error) {
            send(res, 400, { error: error instanceof Error ? error.message : "The location check failed." })
          }
        })()
      })
      server.middlewares.use("/api/snapshot", (_req, res) => {
        void (async () => {
          const { status, body, stale } = await snapshot(upstream)
          res.setHeader("X-Snapshot", stale ? "stale" : "fresh")
          send(res, status, body)
        })()
      })
      server.middlewares.use("/api/rpc", (req, res) => {
        if (req.method !== "POST") return send(res, 405, { error: "POST only." })
        void (async () => {
          const { status, body } = await relay(await readBody(req), upstream)
          send(res, status, body)
        })()
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  // The access key and the server keys are read by server code through process.env. They are not exposed to the page.
  if (env.ARKIV_ACCESS_KEY) process.env.ARKIV_ACCESS_KEY = env.ARKIV_ACCESS_KEY
  if (env.IFM_BASE_URL) process.env.IFM_BASE_URL = env.IFM_BASE_URL
  if (env.IFM_MODEL) process.env.IFM_MODEL = env.IFM_MODEL
  return {
    plugins: [react(), apiPlugin(env)],
  }
})
