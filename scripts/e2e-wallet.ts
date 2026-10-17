import "./load-env.ts"
import { chromium } from "playwright-core"
import { type Hex } from "viem"
import { tiramisu } from "@arkiv-network/sdk/chains"
import { installStandInWallet } from "./standin-wallet.ts"

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
const rpc = process.env.ARKIV_RPC_URL ?? tiramisu.rpcUrls.default.http[0]

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true })
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, geolocation: { latitude: 19.99751, longitude: 73.78981 }, permissions: ["geolocation"] })
await installStandInWallet(context, secret, rpc, process.env.ARKIV_ACCESS_KEY)
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
