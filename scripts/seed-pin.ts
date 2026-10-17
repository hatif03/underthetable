import "./load-env.ts"
import { createWalletClient } from "@arkiv-network/sdk"
import { tiramisu } from "@arkiv-network/sdk/chains"
import { privateKeyToAccount } from "viem/accounts"
import { keyedHttp, makePublicClient } from "../src/lib/client.ts"
import { sealReport } from "../src/lib/guard.ts"
import { submitReport } from "../src/lib/write.ts"
import { kolkataDay } from "../src/lib/week.ts"

/**
 * Writes ONE demo pin, from the synthetic FLOOD_KEY wallet, so the map and the bounding-box query can be shown.
 * It is a synthetic claim, not a finding: the wallet is listed as demo, so the page hides the row by default
 * and labels it demo when shown. Run once.   npm run seed:pin
 */
const raw = process.env.FLOOD_KEY
if (!raw) throw new Error("FLOOD_KEY must be set in .env")
const today = kolkataDay()
const sealed = sealReport({
  state: "mh", district: "nashik", department: "municipal", role: "public", service: "pothole",
  outcome: "noted", amountInr: 3, day: today, today, kind: "failure", geo: { lat: 19.99751, lon: 73.78981 },
})
const wallet = createWalletClient({ account: privateKeyToAccount(raw as `0x${string}`), chain: tiramisu, transport: keyedHttp() })
const receipt = await submitReport(wallet, sealed, false, makePublicClient(), false)
console.log("pinned", receipt.entityKey, receipt.txHash)
