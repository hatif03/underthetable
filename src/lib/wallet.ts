import { createWalletClient, type WalletArkivClient } from "@arkiv-network/sdk"
import { tiramisu } from "@arkiv-network/sdk/chains"
import { custom, isAddress, type Address, type EIP1193Provider } from "viem"
import { CHAIN_ID_HEX, EXPLORER } from "./client"

export type Connection = {
  address: Address
  provider: EIP1193Provider
  client: WalletArkivClient
}

export async function connectWallet(provider: {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}): Promise<Connection> {
  const injected = provider as EIP1193Provider
  const addresses = await injected.request({ method: "eth_requestAccounts" })
  const account = Array.isArray(addresses) ? addresses[0] : undefined
  if (typeof account !== "string" || !isAddress(account)) {
    throw new Error("Connect a valid wallet account.")
  }
  try {
    await injected.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CHAIN_ID_HEX }],
    })
  } catch (error) {
    const code = typeof error === "object" && error !== null && "code" in error ? error.code : undefined
    if (code !== 4902) throw error
    await injected.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: CHAIN_ID_HEX,
          chainName: "Arkiv Tiramisu Testnet",
          nativeCurrency: tiramisu.nativeCurrency,
          rpcUrls: [tiramisu.rpcUrls.default.http[0]],
          blockExplorerUrls: [EXPLORER],
        },
      ],
    })
    await injected.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CHAIN_ID_HEX }],
    })
  }
  const chainId = await injected.request({ method: "eth_chainId" })
  if (chainId !== CHAIN_ID_HEX) throw new Error("The wallet is not on Tiramisu, chain 7738577.")
  const current = await injected.request({ method: "eth_accounts" })
  const selected = Array.isArray(current) ? current[0] : undefined
  if (typeof selected !== "string" || selected.toLowerCase() !== account.toLowerCase()) {
    throw new Error("The wallet account changed during connection.")
  }
  return {
    address: account,
    provider: injected,
    client: createWalletClient({ chain: tiramisu, account, transport: custom(injected) }),
  }
}

export async function assertSameAccount(connection: Connection): Promise<void> {
  const chainId = await connection.provider.request({ method: "eth_chainId" })
  if (chainId !== CHAIN_ID_HEX) throw new Error("Switch the wallet to Tiramisu, chain 7738577.")
  const current = await connection.provider.request({ method: "eth_accounts" })
  const selected = Array.isArray(current) ? current[0] : undefined
  if (typeof selected !== "string" || selected.toLowerCase() !== connection.address.toLowerCase()) {
    throw new Error("The wallet account changed. Connect again.")
  }
}
