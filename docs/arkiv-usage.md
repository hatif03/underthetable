# How underthetable uses Arkiv

> **Live:** [underthetable.vercel.app](https://underthetable.vercel.app) · [mirror](https://underthetable.vercel.app/mirror.html) · [repository](https://github.com/hatif03/underthetable) · [all screenshots](screenshots/README.md)
>
<img src="screenshots/07-map-arkiv-range-query.png" alt="Map with the Arkiv range query printed" width="720">

*Feature 14 live: four range predicates on `i32` attributes, with the exact query printed.*   [The Record's "Look back" (feature 9c)](screenshots/10-record.png) · [the one-file mirror reading Arkiv directly](screenshots/16-mirror.png) · [terminal output](screenshots/terminal-audit.txt)

Last updated 17 October 2026. Each row says which Arkiv feature is used, why the product breaks without it, where the code is, and how to check it without the website. The data contract is [arkiv/schema.md](../arkiv/schema.md); what actually happened on each call is [arkiv/friction.md](../arkiv/friction.md).

## Why Arkiv and not something else

| Alternative | What fails |
| --- | --- |
| Postgres or our own API | The operator holds the delete key. bribes.fyi shut its form on 18 August 2026 and said it would delete the data. I Paid a Bribe ended when its funders left. A table we control fails the same way the day we are scared, sued, or stop paying the host. |
| IPFS | A content hash cannot answer "this district, this week, this desk, amount at least 500, still unexpired", and it does not drop a row when 180 days are over. |
| A subgraph | It indexes events we emit. It does not enforce a lifetime, a readonly flag, or an owner that can no longer delete. |

## What is on Arkiv, and what is kept off on purpose

On Arkiv: two entity types. `report`: 11 closed-list attributes (12 on a press-sourced one, which adds `source = press`; 13 on a pinned pothole, which adds the `i32` pair `lat_e5` and `lon_e5`) and the payload `{"v":1}`. `attestation`: 6 attributes and the same payload. Three kinds of wallet write them: citizens (a browser key or their own wallet), the press curator, and the location checker.

Off Arkiv, always: names, phone numbers, email, Aadhaar, offices, streets, GPS, photos, video, free text, the sentence a person types, the day of an incident, the person's position, and any hash of those. The one exact place on chain is the pin on a broken public thing, never on a person-related report. The sentence is parsed on the device. The position is rounded to about 5 km, used once by the checker, and not stored.

## Feature by feature

| # | Arkiv feature | Why the product needs it | Where | Check it |
| --- | --- | --- | --- | --- |
| 1 | **Attributes vs payload** | Everything a reader filters on is an attribute (`kind`, `state`, `district`, `department`, `service`, `week`, `outcome`, `amount_inr`). The payload is constant, so there is no place for a name to hide. | `src/lib/write.ts`, `src/lib/guard.ts` | `npm run query` |
| 2 | **Typed attributes** (`str`, `u64`, `key`) | Amounts are `u64`, so `gte` works and a bare number never silently becomes `i32`. An attestation points at its report with a `key` reference. | `src/lib/write.ts`, `server/attest.ts` | schema.md |
| 3 | **Queries** (`eq`, `gte`, `createdBy`, cursor with `atBlock`) | One read of every underthetable entity builds the whole page. The CLI runs the same predicates. | `src/lib/query.ts`, `scripts/query.ts` | `npm run query -- --district nashik --min-inr 500` |
| 4 | **Raw `arkiv_getEntityCount`** | "N matching, M on chain" in the CLI header. The SDK's `getEntityCount()` takes no filter (friction F1). | `src/lib/query.ts` | `npm run query -- --district nashik` |
| 5 | **Entity Expiration** (180 days; one-hour demo row) | A demand from this October is not a current fact next year. The reader sees a row leave on its own, and nothing was deleted. | `src/lib/write.ts`, `scripts/seed.ts --short`, Pulse "Entity Expiration" | `npm run seed -- --short`, then watch the panel |
| 6 | **`readonly: true`** | Amount and bucket cannot be edited after publishing. | `src/lib/write.ts` | `npm run verify` (patch reverts) |
| 7 | **`permissionlessExtension: false`** | A rival cannot pin one report past its 180 days. Set on every entity; the refusal seen today is the ownership check (friction F7). | `src/lib/write.ts` | `npm run verify` |
| 8 | **`predictEntityKeys` + `executeBatch` + `ownershipChanges`** | Create and hand to `0x…dEaD` in one transaction. If the transfer cannot be included, the whole batch reverts. We never leave a deletable report on chain. The checker wallet seals attestations the same way. | `src/lib/write.ts`, `server/attest.ts` | Receipt: `$owner` is `0x…dEaD`; "Try to delete it" |
| 9 | **`$creator` and `$owner`** | `$creator` is the one trust signal: it counts distinct voices, and it decides which attestations are believed. `$owner` is the dead address. | `src/lib/aggregate.ts`, `src/lib/query.ts` (`toAttestation`) | `data/attesters.json` |
| 9c | **Historical queries (`atBlock`)** | A sealed entity cannot be edited, so the board at an earlier block must be a subset of the board now. The Record's "Look back" runs the query at an earlier block and checks it against the head. A table we run cannot offer that proof. | `src/lib/query.ts` (`atBlock`), `src/views/Record.tsx` | Record, "Look back"; friction F16 |
| 9b | **Reader-side validity** | A public chain cannot be cleaned and a modified client can write anything. So the page, the CLI and the audit count a report only if it is exactly the schema, on the lists, with a `{"v":1}` payload, and owned by the dead address. Anything else is ignored. The query selects `payload` for this. | `src/lib/validate.ts`, `scripts/audit.ts` | `npm run audit`; hostile-input tests |
| 9a | **Trust by `$creator`, three times** | The checker's attestations, the curator's `source = press`, and the team's own demo rows are each recognised by the creator address alone, from a short list in the repository (`data/attesters.json`, `data/curators.json`, `src/lib/demo.ts`). An attribute anyone can write is never believed by itself. | `src/lib/query.ts`, `src/lib/demo.ts` | `npm test` ("only the curator wallet is believed") |
| 10 | **Entity-key reference** | An attestation points at its report without copying data. | `server/attest.ts`, `src/lib/query.ts` | `type = attestation AND report = key(...)` |
| 11 | **Two entity types, one query** | Reports and their checks arrive in the same read, so verification costs no extra queries against the anonymous budget. | `src/lib/query.ts` | `npm run query` shows both counts |
| 12 | **WebSocket `watchEntityEvents`** | New reports appear without a poll loop. The chain is shared (about 0.85 creates a second), so events are filtered by `creationFlags` and lifetime before any read (friction F6). | `src/state/store.ts` | open two browsers, file in one |
| 14 | **Range queries on `i32` attributes (map pins)** | A pothole may carry `lat_e5` and `lon_e5` (degrees times 100,000). "What is inside this rectangle" is four `gte`/`lte` predicates answered by the chain's index, one round trip, no download of the rest. The Map tab prints the query it sent. | `src/lib/query.ts` (`fetchInBox`), `src/views/MapView.tsx`, `scripts/seed-pin.ts` | Map, "Search this view on Arkiv"; friction F17 |
| 15 | **A Hub access key** | Raises the anonymous read budget. Tested: 120 consecutive reads, all 200. Read from `ARKIV_ACCESS_KEY` by servers and scripts only, sent as `X-API-KEY`. | `src/lib/client.ts`, `server/rpc.ts`, `server/snapshot.ts` | friction F18 |
| 13 | **Wallet clients** | Browser throwaway key, injected wallet, seed keys and the checker key all use the same batch code. Reads use the public client only, because the 0.8.1 wallet client does not expose them. | `src/lib/identity.ts`, `src/lib/wallet.ts` | friction F8 |

## Evidence on Tiramisu

Real entities, each openable on the explorer. Open one and look at **Owner**: it is `0x…dEaD` on every row.

| What it shows | Entity | Transaction |
| --- | --- | --- |
| A citizen report written from a browser with a throwaway key, location-checked | [`0x647f040eda…`](https://tiramisu.explorer.arkiv.network/entity/0x647f040eda4574ca23db9312a54e2c632a9a80a4ece4baa08fdc9e741b7665a0) | open the entity page |
| The attestation that vouches for it. It carries a `report` key attribute and no position | [`0x625764fe47…`](https://tiramisu.explorer.arkiv.network/entity/0x625764fe47d01acd05544e65c51852fb5c6a9fcdb734ec29486bd1065b05978c) | open the entity page |
| A press report (Delhi, a detention, 16 October). Creator is the curator wallet, `source = press` | [`0xd9d6fdee29…`](https://tiramisu.explorer.arkiv.network/entity/0xd9d6fdee29b7adf2e667fb1e1c8da1cef67a77fe3af284aeb3a8275ba4a8eaf9) | [`0xd23c4f687d…`](https://tiramisu.explorer.arkiv.network/tx/0xd23c4f687dc7757368fe73fa1eb46d151e80ba3fabf1f0580e2a400f70350ec9) |
| A press report with a rupee amount (Barnala, ₹30,000, a land transfer) | [`0x783f80ff56…`](https://tiramisu.explorer.arkiv.network/entity/0x783f80ff56de6fe9c8d0c4cb8fb469bf9a05794427ba6cc980758b66968f857e) | [`0xcc8126b487…`](https://tiramisu.explorer.arkiv.network/tx/0xcc8126b4872b89a3249d65e5b4a9b692ff3c057201aeb9835ddbfe8b9b372430) |
| The demo map pin: a pothole with `lat_e5 = 1999751`, `lon_e5 = 7378981` | [`0x311025deec…`](https://tiramisu.explorer.arkiv.network/entity/0x311025deec017feb6f5242bcc6aa5fd09781ab22f9d99d190bc0c906aac08ab8) | `0x1641e7a6…6032` |
| A seed report, one of the synthetic demo rows | [`0x8070d5ef45…`](https://tiramisu.explorer.arkiv.network/entity/0x8070d5ef45bc22af1dce0ed027ff601e2aef763b6aa2182bf2b3de5052c551a6) | [`0xeeebd142ce…`](https://tiramisu.explorer.arkiv.network/tx/0xeeebd142ce5f50aca6c5d20fe05b04083d30f55441a7cfe2e7ea2561b3e069c3) |
| A report written with a one-hour Entity Expiration, now expired. The explorer still shows its creation | [`0x3922f6cbef…`](https://tiramisu.explorer.arkiv.network/entity/0x3922f6cbef9b03c6615eda04510103a4b2992d89693517cef89184ac1c509e18) | [`0xefc8ee1ae1…`](https://tiramisu.explorer.arkiv.network/tx/0xefc8ee1ae19dd68e803d9c2c5ed094bfa3d480bd6e4b64701d670e575f922348) |

`npm run verify` runs the four failing writes against a live report and an attestation. `npm run audit` reads every entity at once. The Sealed page has the raw `curl` commands.

## Surfaces that do not need our server

- **Raw JSON-RPC.** `arkiv_query` and `arkiv_getEntityCount` with the `select` projection, `atBlock`, the cursor, and `$owner = addr(...)`. The curl commands are on the Sealed page and are tested.
- **An optional Hub access key**, read from `ARKIV_ACCESS_KEY` by servers and scripts only and sent as `X-API-KEY` to an arkiv.network address. It raises the budget; nothing depends on it.
- **A one-file mirror**, `public/mirror.html`: no build, reads Arkiv directly, applies the structural validity rule.
- **The CLI and the audit**: `npm run query`, `npm run audit`, `npm run verify`.

## The three-wallet rule and the location check

- A desk is **quoted** at 3 distinct `$creator` values. Five slips from one wallet are one voice. The median is of one amount per wallet, the earliest.
- A desk is **corroborated** at 3 wallets that each have a trusted location attestation for the report's state.
- Both are computed by the reader. There is no tally entity, so no server of ours can forge a total.
- Limits stated on the page: a wallet is a pseudonym, 3 wallets are not 3 people, and a phone can fake a position.

## What the servers do and do not do

| Route | Does | Never does |
| --- | --- | --- |
| `/api/human` | Says how a browser must prove it is a person (Cloudflare Turnstile, or a signed proof of work) | Store anything, identify anyone |
| `/api/drip` | Checks the human proof, then sends 0.02 test GLM to a new browser key | Sign a report, store an address, log a client |
| `/api/attest` | Compares a rounded position with a state, then has the checker wallet write one attestation | Store or log the position; write a report; touch a report once sealed |
| `/api/rpc` (optional) | Relays read methods only with a short cache, so an access key can stay on the server | Relay a write |
| `/api/assist` (optional, not used by the page) | Fills the slip from a cleaned sentence | Anything with Arkiv |

The page works with none of them: reads go straight to the public RPC, and a person with a funded wallet files without the faucet. The location check is the only feature that needs our server.

## Form-ready answers

**Why Arkiv?** Name Postgres, IPFS, a subgraph and our own API, with the table at the top. Name what stays off: everything personal, the sentence, the day, the position.

**How do you use Arkiv?** Rows 1 to 13 above, each with its link. The two that matter most to the argument are 8 (the batch that makes a report undeletable by its own author) and 9 (trust from `$creator`, including who may vouch for a report).

**Friction.** `arkiv/friction.md`, entries F1 to F8, each from a call that was made.
