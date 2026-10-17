import { createWalletClient, http, type Hex } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { tiramisu } from "@arkiv-network/sdk/chains"
import type { BrowserContext } from "playwright-core"
import { CHAIN_ID_HEX } from "../src/lib/client.ts"

/**
 * A stand-in browser wallet for tests and recordings. It installs window.ethereum in every page of a context, and
 * signs with WALLET_TEST_KEY from .env in this process; the key never reaches the page. It is not a real
 * extension: there are no pop-ups. Anything it files is a real report on Tiramisu from that team test wallet.
 */
export async function installStandInWallet(context: BrowserContext, secret: Hex, rpc: string, accessKey?: string) {
  const account = privateKeyToAccount(secret)
  const headers: Record<string, string> = { "content-type": "application/json" }
  if (accessKey) headers["X-API-KEY"] = accessKey
  const signer = createWalletClient({ account, chain: tiramisu, transport: http(rpc, { fetchOptions: accessKey ? { headers: { "X-API-KEY": accessKey } } : {} }) })

  async function node(method: string, params: unknown[]): Promise<unknown> {
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
        return signer.sendTransaction({ to: tx.to, data: tx.data, value: tx.value ? BigInt(tx.value) : undefined, gas: tx.gas ? BigInt(tx.gas) : undefined })
      }
      default: {
        const res = await fetch(rpc, { method: "POST", headers, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }) })
        const body = (await res.json()) as { result?: unknown; error?: { message: string } }
        if (body.error) throw new Error(body.error.message)
        return body.result
      }
    }
  }

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
  return account.address
}
