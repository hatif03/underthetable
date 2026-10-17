import "./load-env.ts"
import { execSync } from "node:child_process"
import { mkdirSync, writeFileSync } from "node:fs"
import { chromium, type Locator } from "playwright-core"
import type { Hex } from "viem"
import { installStandInWallet } from "./standin-wallet.ts"

/**
 * Records a silent screen capture of the whole app working, for a voice-over. It drives a headless Chrome with a
 * visible cursor, types at human speed, and pauses on what matters. It FILES ONE REAL REPORT on Tiramisu through a
 * stand-in wallet from the team test wallet (hidden by default on the page as a demo wallet).
 *
 *   npx tsx scripts/record-demo.ts            full desktop video   -> recordings/demo.mp4 (+ recordings/timeline.md)
 *   MOBILE=1 npx tsx scripts/record-demo.ts   a phone-sized clip   -> recordings/demo-mobile.mp4
 *
 * The two terminal scenes show the real output of `npm run audit` and `npm run query`, captured just before
 * recording and replayed in a terminal-styled page. Record your own terminal over them if you prefer.
 */
const base = process.env.BASE_URL ?? "https://underthetable.vercel.app"
const mobile = Boolean(process.env.MOBILE)
const secret = process.env.WALLET_TEST_KEY as Hex | undefined
if (!secret) throw new Error("WALLET_TEST_KEY is not set in .env")
const rpc = process.env.ARKIV_RPC_URL ?? "https://rpc.tiramisu.db-chain.testnet.arkiv.network"
mkdirSync("recordings", { recursive: true })
const hookOnly = Boolean(process.env.HOOK_ONLY)
const out = hookOnly ? "recordings/hook" : mobile ? "recordings/demo-mobile" : "recordings/demo"

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const started = { at: 0 }
const timeline: string[] = []
function scene(name: string) {
  const seconds = (Date.now() - started.at) / 1000
  const stamp = `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`
  timeline.push(`| ${stamp} | ${name} |`)
  console.log(stamp, name)
}

// Real command output, captured now.
function capture(command: string): string[] {
  try {
    const text = execSync(command, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 120_000 })
    return text.split(/\r?\n/).filter((line) => line.trim().length > 0)
  } catch (error) {
    return [`(command failed: ${error instanceof Error ? error.message.split("\n")[0] : String(error)})`]
  }
}
const auditLines = mobile ? [] : capture("npx tsx scripts/audit.ts")
const queryLines = mobile ? [] : capture("npx tsx scripts/query.ts --district nashik")

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true })
const viewport = mobile ? { width: 390, height: 844 } : { width: 1440, height: 810 }
const context = await browser.newContext({
  viewport,
  deviceScaleFactor: mobile ? 2 : 1,
  isMobile: mobile,
  hasTouch: mobile,
  locale: "en-IN",
  geolocation: { latitude: 19.99751, longitude: 73.78981 },
  permissions: ["geolocation"],
})
await installStandInWallet(context, secret, rpc, process.env.ARKIV_ACCESS_KEY)
const page = await context.newPage()
page.on("pageerror", (error) => console.log("page error:", error.message))

let where = "start"
setInterval(() => console.log("  …still at:", where), 20_000).unref()
async function glide(target: Locator, hold = 400) {
  where = "glide " + target.toString()
  await target.scrollIntoViewIfNeeded()
  await target.hover()
  await sleep(hold)
}
async function click(target: Locator, hold = 700) {
  await glide(target, 350)
  await target.click()
  await sleep(hold)
}
/** Scrolls slowly so a viewer can read what passes. Done inside the page: a wheel event per step makes the recorder wait for each one. */
async function drift(distance: number, ms: number, _where?: { x: number; y: number }) {
  where = "drift on " + page.url()
  // A string, not a function: the bundler adds helpers to named functions that the page does not have.
  await page.evaluate(`new Promise((resolve) => {
    const from = window.scrollY
    const begin = performance.now()
    const step = (now) => {
      const progress = Math.min(1, (now - begin) / ${ms})
      window.scrollTo(0, from + ${distance} * progress)
      if (progress < 1) requestAnimationFrame(step)
      else resolve()
    }
    requestAnimationFrame(step)
  })`)
}
async function toTop() {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }))
  await sleep(900)
}
async function terminal(command: string, lines: string[], hold = 3500) {
  await page.setContent(`<!doctype html><meta charset="utf-8"><title>terminal</title><style>
    html,body{margin:0;height:100%;background:#0b0b0a;color:#e8e8e3;font:20px/1.55 "Cascadia Mono",Consolas,monospace}
    .win{margin:34px auto;width:min(1280px,92vw);border:1px solid #2b2b28;border-radius:14px;overflow:hidden;background:#101010}
    .bar{background:#1b1b19;padding:10px 16px;display:flex;gap:8px;align-items:center;color:#9a9a92;font-size:15px}
    .bar i{width:12px;height:12px;border-radius:50%;background:#444;display:inline-block}
    pre{margin:0;padding:22px 26px;white-space:pre-wrap;min-height:560px}
    .p{color:#ff5a40}.ok{color:#34c58b}
  </style><div class="win"><div class="bar"><i></i><i></i><i></i><span style="margin-left:10px">underthetable</span></div><pre id="t"></pre></div>`)
  const add = async (text: string) => page.evaluate((chunk) => { const el = document.getElementById("t"); if (el) el.textContent += chunk }, text)
  await add("~/underthetable $ ")
  for (const character of command) {
    await add(character)
    await sleep(55)
  }
  await sleep(500)
  await add("\n\n")
  for (const line of lines) {
    await add(line + "\n")
    await sleep(110)
  }
  await sleep(hold)
}
async function card(lines: string[], hold = 4000) {
  await page.setContent(`<!doctype html><meta charset="utf-8"><title>under the table</title><style>
    html,body{margin:0;height:100%;background:#0e0e0d;color:#f3f3ef;font-family:"Geist Variable",system-ui,sans-serif;display:grid;place-items:center;text-align:center}
    h1{font-size:68px;letter-spacing:-.03em;margin:0 0 18px} p{font-size:30px;color:#9a9a92;margin:6px 0} b{color:#ff5a40}
  </style><div><h1>under the <b>table</b></h1>${lines.map((line) => `<p>${line}</p>`).join("")}</div>`)
  await sleep(hold)
}

await page.screencast.start({ path: `${out}.webm`, size: mobile ? { width: 390, height: 844 } : { width: 1440, height: 810 }, quality: 95, fps: 30 })
await page.screencast.showActions({ cursor: "pointer", duration: 700, style: { title: "display:none" } })
started.at = Date.now()

// ---------------------------------------------------------------- Scene 1: the hook
scene("1. The hook: the repository front page, then the live Pulse")
if (!mobile) {
  await page.goto("https://github.com/hatif03/underthetable", { waitUntil: "domcontentloaded" })
  await sleep(2500)
  // down past the file list to the README, with its animation and title
  await drift(1150, 5500)
  await sleep(4500)
}
await page.goto(base, { waitUntil: "domcontentloaded" })
await page.waitForSelector(".hero", { timeout: 60_000 })
await sleep(3500)
await drift(mobile ? 1300 : 620, 5000)
await sleep(2500)
await drift(mobile ? 800 : 700, 4000)
await sleep(3000)
await toTop()
if (hookOnly) {
  await page.screencast.stop()
  await context.close()
  await browser.close()
  execSync(`ffmpeg -v error -y -i ${out}.webm -vf scale=1920:1080:flags=lanczos -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -r 30 -movflags +faststart ${out}.mp4`, { stdio: "inherit" })
  console.log("done:", `${out}.mp4`)
  process.exit(0)
}

// ---------------------------------------------------------------- Scene 2: why it is built this way
if (!mobile) {
  scene("2. Why: How it is sealed")
  await click(page.getByRole("tab", { name: "How it is sealed" }), 1500)
  await drift(500, 5000)
  await sleep(1500)
  await drift(700, 6000)
  await sleep(2000)
  await toTop()
  await click(page.getByRole("tab", { name: "Pulse" }), 1200)
}

// ---------------------------------------------------------------- Scene 3: report with your own wallet
scene("3. Report: a sentence, a pin, connect a wallet, file, the receipt, try to delete it")
await click(page.getByRole("button", { name: /Report/ }).first(), 1200)
const box = page.locator("textarea")
await click(box, 400)
await box.pressSequentially("Last week in Nashik there is a deep pothole on the main road near the bus stand. Call me on 9876543210.", { delay: 48 })
await sleep(2500)
await drift(300, 2000, { x: viewport.width * 0.8, y: viewport.height * 0.6 })
await sleep(1500)
await click(page.getByRole("button", { name: /Use my current location/ }), 1000)
await sleep(5500)
await page.evaluate(() => document.querySelector(".public-box")?.scrollIntoView({ block: "center", behavior: "smooth" }))
await sleep(3500)
await page.evaluate(() => document.querySelector(".reporter")?.scrollIntoView({ block: "center", behavior: "smooth" }))
await sleep(2500)
await click(page.getByRole("button", { name: /Connect wallet/ }), 800)
await page.waitForSelector("text=Connected", { timeout: 30_000 })
await page.waitForSelector("text=test GLM", { timeout: 20_000 }).catch(() => undefined)
await sleep(3500)
if (process.env.SKIP_FILE) {
  // a rehearsal: everything except the write
  await sleep(2000)
  await page.keyboard.press("Escape")
  await sleep(1000)
} else {
  await click(page.getByRole("button", { name: /File the report/ }), 500)
  await page.waitForSelector(".receipt, .error", { timeout: 120_000 })
  await sleep(4500)
  if (await page.locator(".error").count()) throw new Error("The form showed an error: " + (await page.locator(".error").first().innerText()))
  await click(page.getByRole("button", { name: /Try to delete it/ }), 500)
  await page.waitForSelector(".revert", { timeout: 60_000 })
  await sleep(4500)
  await click(page.getByRole("button", { name: /Back to the board/ }), 1500)
}


// ---------------------------------------------------------------- Scene 4: the map
scene("4. The map, and a question only Arkiv answers")
await click(page.getByRole("tab", { name: "Map" }), 1500)
await page.waitForSelector(".bigmap")
await sleep(5000)
const pins = page.locator(".leaflet-marker-icon.pin-wrap")
if ((await pins.count()) > 0) {
  // Leaflet's rotated pin shape confuses the hit test, so the click is forced onto the marker.
  await pins.nth(Math.min(4, (await pins.count()) - 1)).click({ force: true })
  await sleep(1200)
  await sleep(3500)
}
await click(page.getByRole("button", { name: /Search this view on Arkiv/ }), 800)
await page.waitForSelector("text=Arkiv returned", { timeout: 40_000 }).catch(() => undefined)
await sleep(2000)
await drift(260, 1500)
await sleep(4500)

if (!mobile) {
  // ------------------------------------------------------------ Scene 5: prove it, three ways
  scene("5a. Proof: npm run audit, in a terminal")
  await terminal("npm run audit", auditLines, 7000)
  scene("5b. Proof: npm run query")
  await terminal("npm run query -- --district nashik", queryLines, 5500)
  scene("5c. Proof: the Record, Look back")
  // setContent keeps the old URL, so leave it first: a hash-only change would not reload the page.
  await page.goto("about:blank")
  await page.goto(`${base}/#record`, { waitUntil: "domcontentloaded" })
  await page.getByRole("combobox", { name: "Look back" }).waitFor({ timeout: 30_000 })
  await sleep(2500)
  await click(page.getByRole("combobox", { name: "Look back" }), 700)
  await click(page.getByRole("option", { name: "As of 1 hour ago" }), 800)
  await sleep(6500)
  scene("5d. Proof: the one-file mirror, reading Arkiv directly")
  where = "goto mirror"
  await page.goto(`${base}/mirror.html`, { waitUntil: "domcontentloaded" })
  where = "mirror loaded"
  await sleep(7000)
  await drift(600, 5000)
  await sleep(2500)
}

// ---------------------------------------------------------------- Scene 6: close
scene("6. Close: the dark theme, Hindi, the end card")
await page.goto(base, { waitUntil: "domcontentloaded" })
await page.waitForSelector(".hero")
await sleep(2500)
await click(page.locator("button.theme"), 3500)
await click(page.locator("button[aria-label=Language]"), 3500)
await click(page.locator("button[aria-label=Language]"), 1500)
await click(page.locator("button.theme"), 2500)
await card(["A district ledger nobody can delete.", "underthetable.vercel.app", "github.com/hatif03/underthetable"], 5000)

await page.screencast.stop()
await context.close()
await browser.close()

writeFileSync(
  `${out}-timeline.md`,
  `# Recording timeline (${mobile ? "mobile" : "desktop"})\n\nTimes are from the start of the video, before any editing. Match them to the scenes in docs/demo-video-script.md.\n\n| Time | Scene |\n| --- | --- |\n${timeline.join("\n")}\n`,
)
console.log("encoding mp4…")
execSync(`ffmpeg -v error -y -i ${out}.webm -vf scale=${mobile ? "780:1688" : "1920:1080"}:flags=lanczos -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -r 30 -movflags +faststart ${out}.mp4`, { stdio: "inherit" })
console.log("done:", `${out}.mp4`)
