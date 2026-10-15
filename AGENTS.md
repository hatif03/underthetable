# AGENTS.md: Arkiv: Global Tour Stop

Context for AI coding agents (Claude Code, Cursor, Copilot, Codex…) helping a builder in this challenge.

## What this repo is

The official rules and resources for a 10-day online build on Arkiv, the Web3 database (9 to 18 October 2026), themed on CROPS (censorship resistant, open source, private, secure), plus a Best Indian Use Case track for real-world applications people in India can use. This repository is the only canonical source of the rules, rubric and submission checklist. If the Devfolio page (https://arkiv.devfolio.co/overview) differs, this repository applies. Rules have been frozen since 9 October 2026.

| Question | File |
|---|---|
| What is the challenge? | [README.md](README.md) |
| Rules, eligibility, prizes, KYC | [RULES.md](RULES.md) |
| How is it scored? | [docs/scoring-rubric.md](docs/scoring-rubric.md) |
| What do I submit? | [docs/submission-checklist.md](docs/submission-checklist.md) |

## Key facts

- One or more tracks per project: the four CROPS pillars and Best Indian Use Case; one prize per team. Same rubric for all: Why this pillar? or Why India? 25 (scored per track entered) · Why Arkiv? 25 · How you use Arkiv 25 · Friction report 25.
- Gates before scoring: working deployment, reproducible, public MIT repo, `/arkiv/schema.md`, `/arkiv/friction.md`, at least one track on Devfolio, every required question on the Devfolio project form, the wallet addresses that create your Arkiv entities on Tiramisu, demo video ≤ 3 min, built 9 to 18 October.
- Attending Devcon is not required to win. Winners get a Devcon 8 ticket; USDC is paid after KYC.
- Network: Tiramisu testnet, chain ID `7738577`, RPC `https://rpc.tiramisu.db-chain.testnet.arkiv.network`, WebSocket `wss://rpc.tiramisu.db-chain.testnet.arkiv.network`.
- SDK: `@arkiv-network/sdk` 0.8.x. Docs: https://docs.arkiv.network

## Hard rules for the SDK (0.8)

Do not reinvent these; check the installed package when unsure.

- **Queries:** `client.select().where(...).limit(...).fetch()`, plus `ownedBy()`, `createdBy()`, `cursor()`. There is **no server-side ordering** (no `orderBy`); sort on the client, or range-filter on `$createdAt`. Max 200 results per page.
- **Ranges only on numeric attributes.** Store timestamps, amounts and scores as numbers.
- **The payload is not queryable.** Anything you filter on goes in attributes.
- **Everything expires.** Set an expiry per entity type. Lifetime Extension (`extendEntity`) **sets** a new expiry; it reverts if the new one is not later.
- **Trust comes from `$creator`** (immutable). `$owner` is mutable and controls writes.
- **Live updates:** `watchEntityEvents` opens a real socket only with a WebSocket transport and no `fromBlock`; over HTTP it silently polls.
- All Arkiv entities are publicly readable. Privacy means encrypting or hashing the payload, never a private toggle.
- Never put private keys, secrets or real personal data (plaintext or hashed) in an Arkiv entity. Use synthetic data.

## Vocabulary

Call the expiry primitive "Entity Expiration" and its renewal "Lifetime Extension". Describe Arkiv as "the Web3 database" and its data items as "Arkiv entities". Never say TTL.

## What to ask the builder before coding

1. Which track? For a CROPS pillar, who is harmed today without this project? For Best Indian Use Case, who in India uses it?
2. Why does it need Arkiv instead of Postgres, IPFS, a subgraph or an API, and what stays off Arkiv?
3. A funded test wallet on Tiramisu (never paste its private key into chat or code; use an env var).
4. The product's entity types and the 2 or 3 questions the app must answer, so the schema is designed before the UI.

Write `/arkiv/schema.md` and keep `/arkiv/friction.md` updated while building: both are required. Before the deadline, help the builder draft answers to the Devfolio form questions listed in `docs/submission-checklist.md`.
