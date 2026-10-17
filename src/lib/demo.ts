/** Wallets that wrote synthetic rows: the four seed wallets (arkiv/wallets.md) and three test wallets. The page hides these by default. */
export const DEMO_WALLETS = new Set(
  [
    "0x13398a1803eCa909D909193F1547FfFc1e05eF4F",
    "0x8b34C95Cda664550C4eb9C4Ba14BB7172D6Ada25",
    "0xa81eef553318368e1c98F851c29521Ab247532aD",
    "0xeE368405802Ca49d38572f88dE24b9ba044F2804",
    // Throwaway browser wallets used by the team while testing the filing flow on 16 October 2026.
    "0xc3A64559E2Bee5E542EF3180934646A89c3dB67B",
    "0x7ca1817218D26f2c6FAc7e63fE2D97307c1fb92F",
    "0x80AA599b39308191f323E4bf1C212f4F241d7365",
    // A team wallet that drives the wallet-path test (scripts/e2e-wallet.ts).
    "0x59171D14942E8597311382d36844Df4611846d8C",
  ].map((address) => address.toLowerCase()),
)

export function isDemoWallet(address: string): boolean {
  return DEMO_WALLETS.has(address.toLowerCase())
}
