# underthetable

A district ledger of citizen reports in India that nobody can delete, including us.

People report what they were asked to pay for a routine service, what is broken, what never arrived, and which rights an authority restricted or violated, including internet shutdowns, detentions and press freedom. A report is a closed-list slip: state, district, department, role title, service, outcome, a rupee amount or a severity from 1 to 5, and an ISO week. Broken public infrastructure (a pothole, a dead streetlight) may also carry an exact map pin. No name, no office, no street, no day, no free text. One transaction on Arkiv creates it and hands it to an address nobody holds. The board is seeded from real, dated news reports (2 to 17 October 2026) written by a press curator wallet and labelled **Press**, each with its articles; the team's earlier synthetic rows are hidden by default. A press report is never a citizen voice. A desk shows a figure only when 3 different wallets reported it in the same week, and is marked **corroborated** when 3 of those wallets were also location-checked (a hint against remote trolls, not proof).

Built for the Arkiv Global Tour Stop (9 to 18 October 2026). Tracks: **Best Indian Use Case** and **Censorship Resistance**. The organisers' brief is kept in [docs/challenge-brief.md](docs/challenge-brief.md).

- Live app: https://underthetable.vercel.app
- Hackathon submission answers (problem, challenges, why Arkiv, wallets, reproduction): [docs/submission.md](docs/submission.md)
- Everything a person can document, field by field, and why each is an Arkiv attribute: [docs/what-is-recorded.md](docs/what-is-recorded.md)
- Screenshots of every feature: [docs/screenshots/](docs/screenshots/)
- Demo video: _add the link here_
- Data contract: [arkiv/schema.md](arkiv/schema.md)
- How Arkiv is used, feature by feature: [docs/arkiv-usage.md](docs/arkiv-usage.md)
- How a claim is checked without a person on chain: [docs/verification.md](docs/verification.md)
- Fake reports and personal data, what stops them and what cannot be stopped: [docs/abuse-model.md](docs/abuse-model.md)
- The pitch and demo script: [docs/pitch.md](docs/pitch.md)
- The 62 press-sourced reports and their articles: [docs/press-records.md](docs/press-records.md)
- Deploying, and where each key comes from: [docs/deploy.md](docs/deploy.md)
- Art and data credits, and what is not in the repo: [docs/assets.md](docs/assets.md)
- Friction report: [arkiv/friction.md](arkiv/friction.md)
- Wallets that create entities on Tiramisu: [arkiv/wallets.md](arkiv/wallets.md)
- Build plan and loopholes found: [docs/build-plan.md](docs/build-plan.md); decision log: [docs/decisions.md](docs/decisions.md)

## Run it

Node 20 or newer.

```bash
npm install
npm test            # 32 tests: the rules, the parser, the PII tripwire, the quote rule, the location check, map pins, the human check
npm run dev         # http://localhost:5173
npm run build:api   # rebuilds api/*.js from server/handlers (they are committed, Vercel runs them as they are)
npm run build       # type-checks, then builds to dist/
```

The page reads Tiramisu directly. No key is needed to read. To file from the page with no wallet, the dev server needs a funded key for the small faucet route:

```bash
cp .env.example .env     # then fill DRIP_KEY (or SEED_KEY_1, which the dev server falls back to)
                         # and ATTEST_KEY, a funded key whose address is listed in data/attesters.json
```

Tiramisu testnet: chain ID `7738577`, HTTP `https://rpc.tiramisu.db-chain.testnet.arkiv.network`, WebSocket `wss://rpc.tiramisu.db-chain.testnet.arkiv.network`, explorer <https://tiramisu.explorer.arkiv.network>, gas token test GLM, faucet <https://hub.arkiv.network/faucet>. SDK `@arkiv-network/sdk` 0.8.1.

## Reproduce what we claim

Without the website:

```bash
npm run query                        # every report still on Tiramisu, quoted desks and single wallets
npm run query -- --district nashik
npm run query -- --district nashik --min-inr 500
npm run query -- --created-by 0x13398a1803eCa909D909193F1547FfFc1e05eF4F
npm run repro                        # reproduces the Arkiv friction entries, writes nothing
npm run audit                        # every underthetable entity on Tiramisu against the validity rule, payload included
npm run seed:pin                     # writes one demo map pin (needs FLOOD_KEY); the Map tab's range query finds it
npm run catalog                      # regenerates docs/what-is-recorded.md from the vocabulary
npm run screenshots                  # retakes docs/screenshots from a running dev server (reads only)
npm run seed:press                   # writes data/press-records.json to Arkiv from PRESS_KEY (add -- --dry to only check the guard)
npm run verify                       # patch, delete, extend on a live report, and an attestation: all must hold
node scripts/build-geo.mjs           # rebuilds the dot map and the server polygons from DataMeet's state boundaries
```

On the website:

1. Open the live URL. The Pulse reads one snapshot of every report. Tap a desk or press Ctrl K and type a district.
2. Open `?mode=closed`. The report form is gone and the board still loads from the chain.
3. Press Report. Type a sentence with a phone number: it is struck out and never leaves the device. Leave "Check my location" on and allow the position. File. The receipt shows `$owner` as `0x…dEaD` and "Inside the state when you filed" with a link to the attestation entity. Press "Try to delete it" and read the revert.
4. Run `npm run seed -- --short` (needs the team keys) to write a report that leaves every query in about an hour, then watch it move to "left every query" in the Entity Expiration panel.

Open `/mirror.html` (one file, no server of ours) to read the same data directly from Arkiv. Rows from the team's seven synthetic wallets are labelled **demo** and hidden by default.

## Where the keys live

- `SEED_KEY_1..3`, `FLOOD_KEY`, `DRIP_KEY`, `IFM_API_KEY` are read from `.env` by the seed script, the verify script and the dev server or `api/` functions. They are never imported by `src/` and never reach the bundle.
- `TURNSTILE_SECRET` and `HUMAN_SECRET` (optional) belong to the human check that gates the faucet; without them a signed proof of work is used.
- `ARKIV_ACCESS_KEY` is an optional Hub access key. It stays on a server or in `.env`, never in the page.
- `PRESS_KEY` is the press curator wallet. It writes `source = press` reports and nothing else; its address is in `data/curators.json`.
- `ATTEST_KEY` is the checker wallet. It writes attestation entities and nothing else.
- The browser makes a throwaway key for a person with no wallet and keeps it in `localStorage`. It holds a few cents of test GLM. "New identity" drops it.

## Layout

```text
src/state/store.ts      one snapshot of every report, cached, live over WebSocket
src/lib/                guard (PII), parse (local), write (batch), query, aggregate (quote rule), identity
src/views/              Pulse (dot map), Map (Leaflet pins), Office (Phaser, lazy), DistrictSheet, FileSheet, Record, Sealed, Palette
src/ui/                 Radix-based kit
scripts/                seed, query, verify
server/ api/            faucet, location checker, optional read relay, optional assistant (all server-side)
data/                   closed vocabularies
arkiv/                  schema, friction, wallets
```

## Licence

MIT. See [LICENSE](LICENSE). Fonts: Geist and Press Start 2P (OFL). Icons: Lucide (ISC). UI primitives: Radix. State boundaries: DataMeet India (CC BY 4.0). Office art: LimeZu, used under the team's licence. Office scene code adapted from an MIT-licensed project, see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). See [docs/assets.md](docs/assets.md).
