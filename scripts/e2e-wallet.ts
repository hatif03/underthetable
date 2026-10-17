import "./load-env.ts"
import { chromium } from "playwright-core"
import { createWalletClient, http, type Hex } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { tiramisu } from "@arkiv-network/sdk/chains"
import { CHAIN_ID_HEX } from "../src/lib/client.ts"

/**
 * Drives the page the way a person with a browser wallet would, against a running app. The wallet is a stand-in
 * (window.ethereum) that signs with WALLET_TEST_KEY from .env in this process; the key never reaches the page.
 * It FILES A REAL REPORT on Tiramisu from that team test wallet (hidden by default as a demo wallet).
 *   npm run dev, then:  BASE_URL=http://localhost:5173 npx tsx scripts/e2e-wallet.ts
 *   or against production:  BASE_URL=https://underthetable.vercel.app npx tsx scripts/e2e-wallet.ts
 */
const base = process.env.BASE_URL ?? "http://localhost:5173"
const secret = process.env.WALLET_TEST_KEY as Hex | undefined
if (!secret) throw new Error("WALLET_TEST_KEY is not set in .env")
const account = privateKeyToAccount(secret)
const rpc = process.env.ARKIV_RPC_URL ?? tiramisu.rpcUrls.default.http[0]
const headers: Record<string, string> = { "content-type": "application/json" }
if (process.env.ARKIV_ACCESS_KEY) headers["X-API-KEY"] = process.env.ARKIV_ACCESS_KEY
const signer = createWalletClient({ account, chain: tiramisu, transport: http(rpc, { fetchOptions: process.env.ARKIV_ACCESS_KEY ? { headers: { "X-API-KEY": process.env.ARKIV_ACCESS_KEY } } : {} }) })

async function node(method: string, params: unknown[]): Promise<unknown> {
  if (process.env.E2E_DEBUG) console.log("rpc", method, method === "eth_sendTransaction" ? JSON.stringify(Object.fromEntries(Object.entries((params as [Record<string, string>])[0]).map(([k, v]) => [k, String(v).slice(0, 24)]))) : JSON.stringify(params).slice(0, 100))
  switch (method) {
    case "eth_requestAccounts":
    case "eth_accounts":
      return [account.address]
    case "eth_chainId":
      return CHAIN_ID_HEX
    case "wallet_switchEthereumChain":
    case "wallet_addEthereumChain":
      return null
    case "personal_sign": {
      const [message] = params as [Hex]
      return account.signMessage({ message: { raw: message } })
    }
    case "eth_sendTransaction": {
      const tx = (params as [{ to?: Hex; data?: Hex; value?: Hex; gas?: Hex }])[0]
      try {
        return await signer.sendTransaction({ to: tx.to, data: tx.data, value: tx.value ? BigInt(tx.value) : undefined, gas: tx.gas ? BigInt(tx.gas) : undefined })
      } catch (error) {
        if (process.env.E2E_DEBUG) console.log("send failed:", (error as { shortMessage?: string; details?: string; cause?: { details?: string } }).shortMessage, (error as { details?: string }).details, (error as { cause?: { details?: string } }).cause?.details)
        throw error
      }
    }
    default: {
      const res = await fetch(rpc, { method: "POST", headers, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }) })
      const body = (await res.json()) as { result?: unknown; error?: { message: string } }
      if (body.error) throw new Error(body.error.message)
      return body.result
    }
  }
}

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true })
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, geolocation: { latitude: 19.99751, longitude: 73.78981 }, permissions: ["geolocation"] })
await context.exposeFunction("__node", async (method: string, params: string) => {
  try {
    return JSON.stringify({ ok: true, result: await node(method, JSON.parse(params)) })
  } catch (error) {
    return JSON.stringify({ ok: false, message: error instanceof Error ? error.message : String(error) })
  }
})
// A string, not a function: the bundler would add helpers to a function that the page does not have.
await context.addInitScript({
  content: `window.ethereum = {
    request: async ({ method, params }) => {
      const out = JSON.parse(await window.__node(method, JSON.stringify(params || [])))
      if (!out.ok) throw new Error(out.message)
      return out.result
    },
    on: () => undefined,
  }`,
})
const page = await context.newPage()
page.on("pageerror", (error) => console.log("page error:", error.message))
await page.goto(base)
await page.waitForSelector(".hero", { timeout: 60_000 })
await page.getByRole("button", { name: /Report/ }).first().click()
await page.waitForSelector("textarea")
await page.locator("textarea").fill("Last week in Nashik there is a deep pothole on the main road near the bus stand")
await page.waitForTimeout(1500)
console.log("reporter default:", await page.locator(".reporter .seg [aria-checked=true], .reporter [data-state=on]").first().textContent().catch(() => "?"))
await page.getByRole("button", { name: /Connect wallet/ }).click()
await page.waitForSelector("text=Connected", { timeout: 30_000 })
const sawBalance = await page.waitForSelector("text=test GLM", { timeout: 15_000 }).then(() => true).catch(() => false)
console.log("balance shown:", sawBalance)
console.log("connected:", (await page.locator(".reporter-body").first().innerText()).replace(/\s+/g, " ").slice(0, 160))
if (process.env.SHOTS) await page.locator(".reporter").screenshot({ path: "docs/screenshots/17-report-with-wallet.png" })
await page.getByRole("button", { name: /File the report/ }).click()
const done = await Promise.race([page.waitForSelector(".receipt", { timeout: 120_000 }).then(() => "receipt"), page.waitForSelector(".error", { timeout: 120_000 }).then(() => "error")])
if (done === "error") throw new Error("The form showed an error: " + (await page.locator(".error").first().innerText()))
const receipt = (await page.locator(".receipt").innerText()).replace(/\s+/g, " ")
if (process.env.SHOTS) await page.locator(".receipt").screenshot({ path: "docs/screenshots/18-receipt-wallet.png" })
console.log("receipt:", receipt.slice(0, 520))
await page.getByRole("button", { name: /Try to delete it/ }).click()
await page.waitForSelector(".revert", { timeout: 60_000 })
console.log("delete attempt:", (await page.locator(".revert").innerText()).replace(/\s+/g, " ").slice(0, 200))
await browser.close()
