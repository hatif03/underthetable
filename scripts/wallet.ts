import "./load-env.ts"
import { appendFileSync, existsSync, readFileSync } from "node:fs"
import { createWalletClient } from "@arkiv-network/sdk"
import { tiramisu } from "@arkiv-network/sdk/chains"
import { formatEther, isAddress, parseEther } from "viem"
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts"
import { keyedHttp, makePublicClient } from "../src/lib/client.ts"

/**
 * Two chores that come up when preparing keys. Neither ever prints a private key.
 *   npm run wallet -- NAME            makes a new key, appends NAME=<key> to .env, prints only the address
 *   npm run wallet -- fund 0xADDRESS 3   sends 3 test GLM from SEED_KEY_1 to an address
 *   npm run wallet -- balances        prints the address and balance of every key in .env
 */
const [command, a, b] = process.argv.slice(2)
const reader = makePublicClient()

function names(): string[] {
  return existsSync(".env") ? [...readFileSync(".env", "utf8").matchAll(/^([A-Z][A-Z0-9_]*_KEY(?:_\d)?)=/gm)].map((m) => m[1]) : []
}

if (command === "balances") {
  for (const name of names()) {
    const raw = process.env[name]
    if (!raw || !/^0x[0-9a-fA-F]{64}$/.test(raw)) continue
    const address = privateKeyToAccount(raw as `0x${string}`).address
    console.log(name.padEnd(12), address, formatEther(await reader.getBalance({ address })), "GLM")
  }
} else if (command === "fund") {
  const amount = Number(b)
  if (!a || !isAddress(a) || !Number.isFinite(amount) || amount <= 0 || amount > 5) {
    console.error("Usage: npm run wallet -- fund 0xADDRESS 3   (up to 5 GLM)")
    process.exit(1)
  }
  const raw = process.env.SEED_KEY_1
  if (!raw) throw new Error("SEED_KEY_1 is not set in .env. It funds the transfer.")
  const wallet = createWalletClient({ account: privateKeyToAccount(raw as `0x${string}`), chain: tiramisu, transport: keyedHttp() })
  const hash = await wallet.sendTransaction({ to: a, value: parseEther(String(amount)) })
  await reader.waitForTransactionReceipt({ hash })
  console.log(`sent ${amount} GLM to ${a}, tx ${hash}`)
} else if (command && /^[A-Z][A-Z0-9_]*_KEY(?:_\d)?$/.test(command)) {
  if (names().includes(command)) {
    console.error(`${command} is already in .env. Remove the line first if you really want a new one.`)
    process.exit(1)
  }
  const key = generatePrivateKey()
  appendFileSync(".env", `\n${command}=${key}\n`)
  console.log(`${command} added to .env. Address: ${privateKeyToAccount(key).address}`)
} else {
  console.error("Usage: npm run wallet -- NAME | fund 0xADDRESS GLM | balances")
  process.exit(1)
}
