import { mkdirSync } from "node:fs"
import { chromium, type Page } from "playwright-core"

/**
 * Takes the screenshots in docs/screenshots from a running app. It reads only; it never files a report.
 *   npm run dev            (in another terminal)
 *   npm run screenshots    (BASE_URL defaults to http://localhost:5173)
 */
const base = process.env.BASE_URL ?? "http://localhost:5173"
const out = "docs/screenshots"
mkdirSync(out, { recursive: true })

const chrome = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe"
const browser = await chromium.launch({ executablePath: chrome, headless: true })

async function settle(page: Page, ms = 2500) {
  await page.waitForLoadState("networkidle").catch(() => undefined)
  await page.waitForTimeout(ms)
}

async function shot(page: Page, name: string, full = false) {
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: full })
  console.log("saved", name)
}

const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: "en-IN", geolocation: { latitude: 19.99751, longitude: 73.78981 }, permissions: ["geolocation"] })
const page = await desktop.newPage()
await page.goto(base)
await page.waitForSelector(".hero", { timeout: 60_000 })
await settle(page, 4000)

await shot(page, "01-pulse")
await shot(page, "02-pulse-full", true)
await page.locator(".cats").scrollIntoViewIfNeeded()
await page.locator(".cats").screenshot({ path: `${out}/03-what-can-be-documented.png` })
console.log("saved 03-what-can-be-documented")
await page.locator(".dotmap-wrap").first().screenshot({ path: `${out}/04-dot-map.png` })
console.log("saved 04-dot-map")
const press = page.locator("section", { hasText: "news reports from the last week" }).first()
if (await press.count()) {
  await press.scrollIntoViewIfNeeded()
  await press.screenshot({ path: `${out}/05-press-records.png` })
  console.log("saved 05-press-records")
}

// The map tab, with the demo pin shown
await page.goto(`${base}/#map`)
await page.waitForSelector(".bigmap", { timeout: 30_000 })
const demo = page.getByRole("button", { name: "Show the demo pin" })
if (await demo.count()) await demo.click()
await settle(page, 6000)
await shot(page, "06-map")
const search = page.getByRole("button", { name: /Search this view on Arkiv/ })
await search.click()
await page.waitForTimeout(5000)
await shot(page, "07-map-arkiv-range-query")

// The report form: a pothole with the pin picker
await page.goto(base)
await page.waitForSelector(".hero")
await page.getByRole("button", { name: /Report/ }).first().click()
await page.waitForSelector("textarea")
await page.locator("textarea").fill("Last week in Nashik there is a deep pothole on the main road near the bus stand")
await page.waitForTimeout(1500)
await page.waitForSelector(".pinmap", { timeout: 30_000 }).catch(() => undefined)
await page.waitForTimeout(2000)
await page.getByRole("button", { name: /Use my current location/ }).click()
await page.waitForTimeout(5000)
await page.locator(".pinmap").scrollIntoViewIfNeeded()
await page.evaluate(() => document.querySelector(".pinmap")?.scrollIntoView({ block: "center" }))
await page.waitForTimeout(1500)
await shot(page, "08-report-form-pin")

// A rights violation: an internet shutdown from a sentence
await page.locator("textarea").fill("Mobile internet was shut down in New Delhi for two days this week")
await page.waitForTimeout(1500)
await shot(page, "09-report-form-shutdown")
await page.keyboard.press("Escape")

// Record, Sealed, Hindi, Office
await page.goto(`${base}/#record`)
await settle(page, 3000)
await shot(page, "10-record", true)
await page.goto(`${base}/#sealed`)
await settle(page, 2500)
await shot(page, "11-sealed", true)
await page.goto(`${base}/#office`)
await settle(page, 7000)
await shot(page, "12-office")

await page.goto(base)
await page.waitForSelector(".hero")
await page.locator("button.lang").click()
await settle(page, 2000)
await shot(page, "13-pulse-hindi")

// A phone
const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const mobile = await phone.newPage()
await mobile.goto(base)
await mobile.waitForSelector(".hero", { timeout: 60_000 })
await settle(mobile, 4000)
await shot(mobile, "14-pulse-mobile")
await mobile.goto(`${base}/#map`)
await mobile.waitForSelector(".bigmap")
const mobileDemo = mobile.getByRole("button", { name: "Show the demo pin" })
if (await mobileDemo.count()) await mobileDemo.click()
await settle(mobile, 6000)
await shot(mobile, "15-map-mobile")

// The one-file mirror, which reads Arkiv with no server of ours
await page.goto(`${base}/mirror.html`)
await settle(page, 6000)
await shot(page, "16-mirror", true)

await browser.close()
