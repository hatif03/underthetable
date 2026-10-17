# Setup

> **Live:** [underthetable.vercel.app](https://underthetable.vercel.app) · [mirror](https://underthetable.vercel.app/mirror.html) · [repository](https://github.com/hatif03/underthetable) · [all screenshots](screenshots/README.md)

The root [README.md](../README.md) is the setup guide. This file keeps the chain facts in one place.

Tiramisu, chain ID `7738577` (`0x7614d1`). HTTP `https://rpc.tiramisu.db-chain.testnet.arkiv.network`. WebSocket `wss://rpc.tiramisu.db-chain.testnet.arkiv.network`. Explorer `https://tiramisu.explorer.arkiv.network`. Gas token: test GLM. Faucet: <https://hub.arkiv.network/faucet>.

```bash
npm install
npm test
npm run dev
npm run seed -- --short   # one report that leaves every query in about an hour (needs .env keys)
npm run query
npm run verify
```

Server routes, all keyed from `.env` or the host's environment, never from the bundle: `/api/drip` (faucet for throwaway browser keys, `DRIP_KEY`), `/api/attest` (location checker; writes `attestation` entities with `ATTEST_KEY`, whose address must be in `data/attesters.json`), `/api/rpc` (read relay, used only when the build sets `VITE_RPC_RELAY=1`), `/api/assist` (optional sentence assistant, `IFM_API_KEY`).
