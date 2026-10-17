# Friction

Reads and the demo seed below are calls that were actually made.

Append a section only after a call is actually made. For each one, record the surface, what you expected, what happened, the versions, and the steps another person can run. A path that worked is recorded the same way. Do not write a complaint you did not reproduce. Invented complaints score 0 on the friction criterion.

## F1. District read on the public HTTP RPC

- Version: `@arkiv-network/sdk` 0.8.1, `viem` 2.57.7, Node v24.20.0
- Expected: `npm run query -- --district nashik` returns underthetable reports for that district, or an empty page, pinned to one block. The filtered count matches that page. The chain-wide count is a different number.
- Actual: Block 648647, matching 0, quoted 0, unquoted 0. A second run printed the chain-wide count as well: block 648686, matching 0, chain 9606, quoted 0, unquoted 0. The page at `npm run dev` then showed block 648755, matching reports 0, entities on the chain 9607, and the empty-board sentence. The page and the filtered count agree. `getEntityCount()` in this SDK sends empty params, so the district figure uses raw `arkiv_getEntityCount` with the same predicate. Using the unfiltered helper for the header would have shown about 9600.
- Steps: `npm run query -- --district nashik`
- What would fix it: a filtered argument on `getEntityCount()`.

## F2. Anonymous query budget

- Version: `@arkiv-network/sdk` 0.8.1, `viem` 2.57.7, Node v24.20.0. Public HTTP RPC, no access key. Client transport `retryCount: 0`, timeout 10 seconds.
- Expected: `npm run query -- --district pune` returns a page or an empty page, as Nashik had.
- Actual: HTTP 429 in about 17 seconds, not a multi-minute retry. `HttpRequestError` details were `"ANON_COST_LIMITED"`. Status 429. The method was `arkiv_query` for `project = str('underthetable') AND type = str('report') AND district = str('pune')` at block `0x9e6b4`. The browser, after the Nashik reads above, showed the same refusal for Pune and, at that moment, also the empty-board sentence. The empty sentence is no longer shown when the read fails.
- Steps: `npm run query -- --district pune`
- What would fix it: a higher anonymous budget, or a documented `Retry-After` the client can show. This run's thrown `headers` did not enumerate a wait time.

## F3. A funded write still cannot be read back

- Version: `@arkiv-network/sdk` 0.8.1, `viem` 2.57.7, Node v24.20.0. Public HTTP RPC, no access key. Wallet transport `retryCount: 0`, timeout 20 seconds.
- Expected: `npm run seed` reads any rows already created by `0x13398a1803eCa909D909193F1547FfFc1e05eF4F`, writes the missing demo reports, then `getEntity` confirms the dead owner.
- Actual: Every `arkiv_query` and the `getEntity` after `executeBatch` returned HTTP 429 with `"ANON_COST_LIMITED"`. The batches themselves returned. `eth_getTransactionReceipt` for the five hashes was `success` in blocks 653401, 653404, 653407, 653411 and 653414. Attributes were not read back. The same anonymous refusal is what the page shows on the Nashik board.
- Steps: `npm run seed`, then `eth_getTransactionReceipt` for the hashes in `arkiv/wallets.md`.
- What would fix it: an anonymous budget that still allows one read after a write, or a documented access key for reads. The seed records a transaction hash and does not send that report again.

## F4. Test GLM can be transferred, and the create still mines

- Version: `@arkiv-network/sdk` 0.8.1, `viem` 2.57.7, Node v24.20.0.
- Expected: `0x13398a1803eCa909D909193F1547FfFc1e05eF4F` can send 1 test GLM to each of the other three demo accounts, and those accounts can then create reports. A receipt of `success` means the batch was mined.
- Actual: The three transfers mined. The following creates, including driving-licence demands in ten cities and the extra Nashik voices, also returned `success` from `eth_getTransactionReceipt`. This run did not call `arkiv_query`. Attribute read-back is still the gap in F3.
- Steps: `npm run seed` after the first five Nashik entities already had recorded hashes. A second run skips a job once its hash is in `arkiv/seed-progress.json`.

## F5. `$createdAt` cannot be filtered, although AGENTS.md says to range-filter on it

- Version: `@arkiv-network/sdk` 0.8.1, `viem` 2.57.7, Node v24.20.0, 16 October 2026.
- Expected: AGENTS.md says "range-filter on `$createdAt`", so a "reports since block N" delta query should work and let the page fetch only new rows.
- Actual: `select({ key: true, createdAt: true }).where(eq("project", str("underthetable")), eq("type", str("report")), gte("$createdAt", u64(head - 2000n))).limit(5).fetch()` threw: `"$createdAt" is returned in query results but carries no index, so it cannot be filtered on. Select it and filter the results in JavaScript instead.` The error is clear. The guide is the part that is wrong.
- Steps: the query above, with `head` from `getBlockNumber()`.
- What would fix it: correct the line in AGENTS.md, or index `$createdAt`. We read one snapshot and sort and filter in JavaScript.

## F6. Creation events carry no attributes, and the chain is busy

- Version: `@arkiv-network/sdk` 0.8.1, WebSocket transport, no `fromBlock`, 16 October 2026.
- Expected: a way to subscribe to only our entities, for example by an attribute.
- Actual: `onEntityCreated` gives `entityKey`, `owner`, `expiresAt`, `creationFlags`, `blockNumber`, `transactionHash`. No attributes. Counted for 90 seconds, twice: 77 creates (12 of them `readonly` and not extendable), then 61 creates (none readonly, all with a lifetime of about 1,000 blocks). Reading each one with `getEntity` to check `project` would spend the anonymous budget of about 100 queries an hour in two minutes.
- Steps: subscribe with `watchEntityEvents({ onEntityCreated })` on `webSocket("wss://rpc.tiramisu.db-chain.testnet.arkiv.network")`, count events, group `creationFlags` and `expiresAt - blockNumber`.
- What would fix it: an attribute or creator filter on `watchEntityEvents`. Workaround in `src/state/store.ts`: act only on events that are readonly, not extendable, and live 7,776,000 blocks (180 days), then at most one `getEntity` every 5 seconds. Checked end to end: one browser filed, a second browser with the page open showed the new row without a reload.

## F7. A stranger's `extendEntity` on a sealed report reverts on ownership, not on the flag

- Version: `@arkiv-network/sdk` 0.8.1, `viem` 2.57.7, Node v24.20.0.
- Expected: `permissionlessExtension: false` is what stops a rival pinning a report past 180 days, and a stranger's `extendEntity` fails because of it.
- Actual: `npm run verify` on `0x2c85e4cb…a0aa0ab`: `$owner` is `0x…dEaD`; `patchEntity`, `deleteEntity` and `extendEntity` from the creator, and `extendEntity` from another team wallet, all failed at gas estimation with `entity … is owned by 0x…dEaD, not 0x…`. Every refusal is the owner check. The flag is set at creation, but with a dead owner nothing here shows the flag doing its own job, and a refusal that happened at estimation spent no GLM.
- Steps: `npm run verify`.
- What would fix it: a revert reason that names the rule, so a builder can tell which creation flag refused. The seal we rely on is the dead owner plus `readonly`; the flag is set on every entity and has not been shown refusing anything on its own.

## F8. First report from a browser with no wallet, start to finish

- Version: `@arkiv-network/sdk` 0.8.1, `viem` 2.57.7, headless Chrome, Node v24.20.0, 16 October 2026.
- Expected: a key made in the page, funded by a server route, can create and hand over a report with no wallet extension.
- Actual: it worked. `generatePrivateKey()` in the page, `POST /api/drip` sent 0.02 test GLM and waited for the receipt, then `predictEntityKeys` on the public client and one `executeBatch` on the wallet client. 15.8 seconds from the button to the receipt. `getEntity` showed `$owner` `0x…dEaD`, and the same wallet's `deleteEntity` failed with `entity … is owned by 0x…dEaD`. A funded wallet gave no unfunded-write error because the funds landed first.
- Steps: `npm run dev`, press Report, type "small pothole in Pune this week", File, then "Try to delete it".

## F9. An entity-key reference between two entity types

- Version: `@arkiv-network/sdk` 0.8.1, `viem` 2.57.7, Node v24.20.0, 16 October 2026.
- Expected: an attestation can point at a report with a `key` attribute, read back as a key, and be found by an equality query on that attribute.
- Actual: it worked. Written as `report: key(entityKey)`. Read back as `{"type":"key","value":"0x647f…65a0"}`, lower case. `eq("report", key(ref))` returned 1 entity for the known report and 0 for a made-up key. One `project = str('underthetable')` query with no `type` term returned reports and attestations together (50 and 1), so a second entity type cost no extra query. An attribute of type `key` did not need to be a string, and the server could not forge another wallet's attestation because the reader filters on `$creator`.
- Steps: file a report with the location check on, then `npm run query` ("location-checked 1") and `npm run verify` ("attestation owner is the dead address").
- What would fix it: nothing needed. A line in the docs that `key` attributes are queryable with `eq` would have saved a test.

## F10. Two wallets, two batches, one tap

- Version: same as F9, headless Chrome with a mocked position, 16 October 2026.
- Expected: the filing wallet creates the report; a second wallet (the checker) creates the attestation after it, each as one `executeBatch` with an ownership change.
- Actual: 22.7 seconds from pressing File to the receipt showing "Inside Maharashtra", including the permission prompt, the faucet, the report batch, a signature, and the attestation batch. The checker read the report with `getEntity` right after the first batch, so the report's `$creator` and `$createdAt` were available at once. A report written from Bengaluru for Maharashtra was stopped in the browser in 133 ms before any write.
- Steps: `npm run dev`, press Report with the location check on, allow the position.

## F11. The anonymous read budget after a seeding run

- Version: `@arkiv-network/sdk` 0.8.1, `viem` 2.57.7, Node v24.20.0, public HTTP RPC with no access key, 16 October 2026.
- Expected: after `npm run seed:press` finishes, `npm run query` reads the 26 new rows back.
- Actual: the seed wrote 26 reports sequentially (one `predictEntityKeys` read and one receipt wait each, no attribute read-back) and every receipt came back `success`. The next `npm run query`, about a minute later, was refused by the node and the CLI printed "The public Arkiv node refused this read". Earlier the same day the same project had made roughly 20 other reads, a 90-second WebSocket count, and several browser test runs. Same class of failure as F2 and F3.
- Steps: `npm run seed:press`, then `npm run query` straight away.
- What would fix it: an access key for reads (hub.arkiv.network), or a documented budget that separates `predictEntityKeys` and receipt reads from `arkiv_query`. The page works around it by caching the last snapshot, but a first-time visitor during a refusal sees an error, which is why the optional `/api/rpc` relay exists.

## F12. Reading payloads and filtering by owner over raw JSON-RPC

- Version: raw `arkiv_query` and `arkiv_getEntityCount` over HTTP, the SDK 0.8.1 `select({ payload: true })`, 16 October 2026.
- Expected: a reader can fetch the payload of every entity in one query and count entities by owner without our code.
- Actual: it worked. `select({ key, creator, owner, createdAt, expiresAt, attributes, payload: true })` with the cursor and `atBlock` returned 77 entities (76 reports, 1 attestation) with payload bytes, so the audit could check each payload against `{"v":1}`. The raw count `project = str('underthetable') AND $owner = addr(0x…dEaD)` returned 77, equal to the number that exist. A raw query by `district = str('barnala')` returned the press report with `amount_inr` as the hex quantity `0x7530` (30,000), which a script must decode, and `owner` and `creator` in lower case.
- Steps: `npm run audit`; the two curl commands on the Sealed page.
- What would fix it: nothing needed. A line in the docs that `$owner = addr(...)` is valid in `arkiv_getEntityCount` would help; it is only in a third-party submission's schema.

## F13. A bare number against a u64 attribute silently matches nothing

- Version: `@arkiv-network/sdk` 0.8.1, Tiramisu, block 658638, 16 October 2026. Run by `npm run repro` (R1).
- Expected: `gte("amount_inr", 500)` either works or fails loudly.
- Actual: `gte("amount_inr", 500)` returned **0 rows**, no error. `gte("amount_inr", u64(500n))` returned **36 rows** over the same data. A bare JavaScript number is an `i32`, and an `i32` predicate on a `u64` attribute matches nothing.
- Steps: `npm run repro`.
- What would fix it: reject a type-mismatched comparison, or coerce a bare integer to the attribute's declared type. **Independently reproduced:** Door Ledger, Fine Print Ledger and at least one other team's public friction file recorded the same thing. Four teams hitting one silent failure is the strongest case for fixing it.

## F14. An expired entity and one that never existed are indistinguishable to `getEntity`

- Version: same as F13. `npm run repro` (R3).
- Expected: an app can tell "this report expired" from "this key was never a report".
- Actual: `getEntity` on the one-hour Pune demo row (written and expired on 16 October 2026) and on `0x1111…1111` returned the same text: "No live entity with key … It was never created, or it has been deleted or has expired." The page works around it by remembering the creation transaction for the one demo row.
- What would fix it: a distinct error, or the expiry block in the error. **Independently reproduced** in another team's public friction file.

## F15. An unfunded write fails with no reason

- Version: same as F13. `npm run repro` (R4). A fresh generated key with no balance.
- Expected: an error that says the account has no funds.
- Actual: "Transaction failed: Execution error without revert data". Nothing in it names the balance. The browser flow therefore asks the faucet before the first write and does not rely on this error.
- What would fix it: surface the insufficient-balance reason. **Independently reproduced:** Lapse's friction file.

## F16. A historical query at an earlier block

- Version: `@arkiv-network/sdk` 0.8.1, `select().atBlock(n)`, Tiramisu, 16 October 2026.
- Expected: the chain can be read as it was at an earlier block, so the claim "a sealed entity was never edited" can be tested.
- Actual: it worked. At block 656,889 (about one hour before the head) the same query returned 49 valid reports. All 49 are on the chain at the head, with the same attributes. At block 647,889 (six hours earlier) it returned 0, which matches the first write that evening. The Record page's "Look back" control does this and prints the comparison. A retained history of a few hours is confirmed; how far back Tiramisu keeps it is not.
- Steps: open Record, "Look back", "As of 1 hour ago".
- What would fix it: nothing needed. The documented retention window would be useful.

## F17. `i32` coordinates and a bounding-box query

- Version: `@arkiv-network/sdk` 0.8.1, `viem` 2.57.7, Node v24.20.0, Tiramisu, 17 October 2026.
- Expected: an optional pair of signed integer attributes (`lat_e5`, `lon_e5`, degrees times 100,000) can be written on a report, read back as numbers, and a rectangle can be asked for with four range predicates.
- Actual: it worked. `npm run seed:pin` wrote one pothole pin (Nashik) with `lat_e5: i32(1999751)` and `lon_e5: i32(7378981)`; the receipt was `success` (entity `0x311025de…8ab8`). A query with `gte`/`lte` on both attributes around Nashik returned 1 row; the same query around Bengaluru returned 0. Attributes came back as `{type: "i32", value: 1999751}`. The only trap is the one in F13 in reverse: the amount is `u64` and the coordinates are `i32`, so each must be written with its own constructor, and a query that uses the wrong one matches nothing without an error. The map tab's "Search this view on Arkiv" runs this query and prints it.
- Steps: `npm run seed:pin`, open the Map tab, press "Search this view on Arkiv" with the pin in view.
- What would fix it: nothing for this call. A documented example of a range query on a signed attribute would have saved the check that negative longitudes (the Americas) also work; ours are all positive, so negative values were not tested.

## F18. An access key removes the anonymous read budget in practice

- Version: `@arkiv-network/sdk` 0.8.1, raw JSON-RPC over HTTP, Node v24.20.0, 17 October 2026. The key is sent as the `X-API-KEY` header from the server side only. Its value is not recorded here.
- Expected: with an access key from hub.arkiv.network, a burst of reads that the anonymous budget refuses (F2, F3, F11) goes through.
- Actual: 120 `arkiv_getEntityCount` calls in a row, 31 seconds, all HTTP 200, none 429. The same shape of burst without a key is what F2 refused after about a dozen calls. `npm run query` and `npm run audit` then read every report back (78 entities, 77 valid reports, 1 attestation) straight after a seeding run, which F11 could not.
- Steps: put the key in `.env` as `ARKIV_ACCESS_KEY`, run `npm run query` and `npm run audit`. For the page, set the same variable on the host; `server/rpc.ts` and `src/lib/client.ts` add the header on the server side only.
- What would fix it: nothing, this is the intended path. It should be in the quickstart, before the first 429, and the response to an anonymous refusal should say that a key exists. A key pasted into a chat or a repo is a leaked key, so the guide could also say where not to put it: a browser build cannot hold one, which is why this project reads through its own route.

```markdown
## F1. <surface>

- Version: `@arkiv-network/sdk` x.y.z, viem x.y.z, node x
- Expected:
- Actual:
- Steps:
- What would fix it:
```

SDK version: `@arkiv-network/sdk` 0.8.1, read from `node_modules/@arkiv-network/sdk/package.json`. `viem` 2.57.7. Node v24.20.0.
