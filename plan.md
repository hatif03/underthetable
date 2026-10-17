# underthetable

> **Superseded in places, 16 October 2026.** This is the original spec. Since it was written: a fifth kind `restriction`; the `day` attribute is no longer written; a second entity type `attestation` (location check); a dot map, an Office tab, a throwaway browser wallet and a faucet. The data contract is [arkiv/schema.md](arkiv/schema.md), the Arkiv feature map is [docs/arkiv-usage.md](docs/arkiv-usage.md), and the log is [docs/decisions.md](docs/decisions.md). Where they disagree with this file, they win.

Handoff for the next agent. This file is the product and the technical spec. Build what it says. The published record is four closed kinds: a demand, a failure, an absence, or a diversion. Do not add a fifth kind, free text, a name, a street, or a photo.

`AGENTS.md`, `CLAUDE.md`, `README.md`, `RULES.md`, and `docs/` are exact copies of [Arkiv-Network/global-tour-stop-pre-devcon](https://github.com/Arkiv-Network/global-tour-stop-pre-devcon). Do not edit them. This file is the product spec. The judge-facing contract is [arkiv/schema.md](arkiv/schema.md). If this file and the schema disagree on an attribute, the schema wins. [arkiv/friction.md](arkiv/friction.md) stays empty until a real Arkiv call is made.

The hackathon window is 9–18 October 2026. Submissions close **18 October 2026, 23:59 London time** (22:59 UTC, 19 October 04:29 IST). Keep the deployment up until 23 October 2026. At the deadline the judges record the repo commit SHA. Do not rewrite git history after that.

This repository was initialized on 16 October 2026. The app now exists and is described in [docs/decisions.md](docs/decisions.md). That log is the record of what was decided and what was actually changed. This file remains the original product spec. Pre-existing work for the Devfolio form: **None.** Seed, deployment, and the Devfolio form are still not done.

## 1. What to build

**underthetable** is a public index of district-level corruption in India.

A person can publish a structured report. A demand records which department, which role title, which service, how many rupees, and whether they paid or refused. A failure, an absence, or a diversion records a public condition in that same district: a broken road, a closed counter, a missing medicine, grain that did not arrive. The number on those three is a severity from 1 to 5, not rupees. They do not publish who they are, who the official is, or where the office is.

Readers open one static page, pick a district, and see:

- a **quoted** figure for a department and service only when at least three different wallets reported that same bucket in the same week
- the **median** amount among those wallets
- every single-reporter row underneath, labeled unquoted, with its on-chain creator

The website is not the record. After a report is sealed, this team cannot edit it and cannot delete it. A judge can close the form and still read the rows from the public RPC.

### Who it is for

Someone in India about to walk into an RTO, a police station, a revenue office, or a municipal desk, who wants to know whether people in that district are reporting a demand for a routine service this month. The named case this submission argues:

A person renewing a driving licence in a district, who today has only a private anecdote. bribes.fyi collected those anecdotes and then announced it would delete them. underthetable keeps the non-identifying tally readable after the site operators step away.

### Tracks

Enter both:

1. **Best Indian Use Case** (Devcon 8 ticket + $2,000 USDC). Requires at least one team member of Indian nationality. Awarded first. A team that wins it cannot also win a global prize.
2. **Censorship Resistance** (Devcon 8 ticket + $750 USDC).

Do not enter Privacy, Open Source, or Security. Those pillars are already crowded, and this product’s load-bearing claim is the India user plus a record the custodian cannot erase. One prize per team.

### What this project refuses to be

Decided on 16 October 2026 after reading the field and the rules. Do not relitigate this in code.

- **Not a police-brutality case file.** A case file is a name, a photo, a medical note, an FIR number, an exact place and time. Real personal data on Arkiv, in plaintext or hashed, makes the submission ineligible. A named accusation that has been sealed cannot be corrected. Protest reporting from October 2026 is motivation for the censorship track. It is not seed data.
- **Not a street-level pothole map, and not a case file.** A report can be a demand for money, or a district-level failure, absence, or diversion: a broken road, a closed counter, a missing medicine, grain that did not arrive. It still cannot name a person, a school, a shop, or a street. The custodian problem is the same for all four kinds. The closed lists and the three-wallet quote are what keep it from becoming a dump of accusations.
- **Not a warrant canary, an exchange-halt watcher, a contest-rules archive, or an agent audit log.** Those are already submitted. See section 4.
- **Not an internet-shutdown register.** Shutdown orders are a statutory record of one authority's acts. underthetable records a demand, a failure, an absence, a diversion or a restriction at district level. The Arkiv point is sealing, not a statutory clock.

## 2. Why Arkiv, in the form the judges score

Write these claims only where the code and the chain match them.

**Postgres, or our own API.** bribes.fyi launched on 2 July 2026, collected reports, then on 18 August 2026 its operators shut submissions and said they would permanently delete the recorded data. I Paid a Bribe ended when its funders pulled out; the database had one custodian. A table we control fails the same way the moment we are scared, sued, or simply stop paying the host. A sealed Arkiv entity has no such key.

**IPFS.** A CID can store a document. It cannot answer "RTO, this district, this ISO week, amount at least 500, still unexpired," and it will not drop the row when the 180 days are over.

**A subgraph.** It can index events we emit ourselves. It does not enforce a lifetime, a readonly flag, or an ownership transfer that removes our ability to delete.

**What stays off Arkiv on purpose.** Names, phone numbers, email, Aadhaar numbers, exact office names, street addresses, GPS, photos, video, medical notes, FIR numbers, free-text narratives, and hashes of any of those. The browser may let the person type a story for themselves. That story is never uploaded, never hashed onto a payload, and never put in an attribute.

**How each feature is used.** One feature used for a reason can score the full 25. Use all of the following, each because the product breaks without it:

| Feature | Why this product uses it |
| --- | --- |
| Attributes vs payload | `kind`, district, department, role, service, week, day, outcome, and `amount_inr` (`u64`) are queried. The payload is the constant `{"v":1}` so the explorer has a MIME type and nothing else. |
| Queries | Compound `eq` on the bucket, `gte` on `amount_inr`, `createdBy()` for the flood wallet, cursor pagination pinned with `atBlock`, `getEntityCount`. |
| Entity expiration | 180 days for a normal report, so a demand from this October is not treated as a current fact next year. One seeded report expires in about an hour so judges can see a row leave the board. There is no expiry event. Compare `expiresAt`, and point judges at the creation transaction after it is gone. |
| Creation flag `readonly` | The amount and the bucket cannot be edited after publication. |
| Creation flag `permissionlessExtension: false` | A rival must not be able to pin a report past 180 days. Demonstrate that a second wallet’s `extendEntity` reverts. |
| `executeBatch` + `predictEntityKeys` | Create the report and transfer ownership to `0x000000000000000000000000000000000000dEaD` in one transaction. If the transfer cannot be included, the whole batch reverts. We never leave a deletable report on chain. |
| `$creator` and `$owner` | The quoted median counts distinct creators. After the batch, `$owner` is the dead address and `$creator` is still the writer. The UI shows both. |
| WebSocket `watchEntityEvents` | The district board adds a new report without a refresh loop. Call it with a WebSocket transport and **without** `fromBlock` (`fromBlock` forces polling). Ignore events whose entity is not `project = underthetable`. |

Do not turn on permissionless extension. Door Ledger uses it so the public can keep an archive alive. Here that flag is the attack: anyone could keep a single accusation on the board forever.

## 3. Rules the implementation has to satisfy

Canonical text, if this file disagrees with it: <https://github.com/Arkiv-Network/global-tour-stop-pre-devcon>

- Rubric: <https://github.com/Arkiv-Network/global-tour-stop-pre-devcon/blob/main/docs/scoring-rubric.md>
- Checklist: <https://github.com/Arkiv-Network/global-tour-stop-pre-devcon/blob/main/docs/submission-checklist.md>
- Overview: <https://arkiv.devfolio.co/overview>

Gates, all required before a project is scored:

- Public deployment judges open with no account and no request for access.
- Steps and the exact query reproduce what we claim.
- Public MIT repo. This repo’s `LICENSE` is already MIT.
- `arkiv/schema.md` and `arkiv/friction.md`.
- The wallet addresses that create entities on Tiramisu, listed in the form and in `arkiv/wallets.md`.
- Demo video, 3 minutes or less.
- Every required Devfolio question answered. Drafts are in section 12. Replace the placeholders. Do not invent friction, and do not paste a private key or an RPC URL that contains an access key.
- Work built between 9 and 18 October 2026.
- At least 50/100 to win.
- Synthetic data only. The disqualification line is: private keys, secrets, or real personal data stored in Arkiv, in plaintext or hashed.

Network:

| | |
| --- | --- |
| Name | Tiramisu |
| Chain ID | `7738577` (`0x7614d1`) |
| HTTP RPC | `https://rpc.tiramisu.db-chain.testnet.arkiv.network` |
| WebSocket RPC | `wss://rpc.tiramisu.db-chain.testnet.arkiv.network` |
| Explorer | <https://tiramisu.explorer.arkiv.network> |
| SDK | `@arkiv-network/sdk` `0.8.x` |
| Docs | <https://docs.arkiv.network> |
| Faucet and access keys | <https://hub.arkiv.network/> |

The public RPC is rate limited. Other teams measured about 100 queries per hour per caller, a cost of about 100 units per query, and an `ANON_COST_LIMITED` failure that can come back as HTTP 200 with a non-JSON body. viem will then honour `Retry-After` and sit for a long time. Fail fast. Cache per tab. If an access key is used, it lives only in a server-side relay or in the seed script’s environment. Never in the browser bundle.

Gas token on Tiramisu is test GLM from the faucet. Budget several faucet trips: three seed writers plus one flood wallet.

## 4. Field analysis

Fetched 16 October 2026. The hackathon gallery at <https://arkiv.devfolio.co/projects> rendered **Projects (0)** in a static fetch that morning. The six submissions below are published project pages that say they were built at this hackathon. Treat these seven as the field. Re-check the gallery before submission in case more teams publish.

Counts, remembering that a team can enter more than one track:

| Track | Teams | Who |
| --- | --- | --- |
| Privacy | 1 | SiteLog |
| Open Source | 5 | Lapse, SiteLog, Door Ledger, ProofGraph, Fine Print Ledger |
| Security | 5 | Lapse, SiteLog, Door Ledger, Arkiv Canary, Fine Print Ledger |
| Censorship Resistance | 5 | Lapse, SiteLog, Door Ledger, Arkiv Canary, Fine Print Ledger |

The shared pattern in six of them: write once, freeze the entity, and make deletion hard. Lapse and Arkiv Canary are the same product entered twice. ProofGraph is the only one whose main trick is "stale evidence stops counting," and it is about agent reputation.

### Lapse

<https://devfolio.co/projects/lapse-4e32>

Warrant canaries that die on a missed renewal. Builders: Northstar / Trustrail. Created 11 October 2026. Tracks: Censorship Resistance, Open Source, Security.

A canary is an entity whose expiry is the renewal deadline plus a grace period. Arkiv drops it from queries when the provider stops renewing, so silence is the signal. Trust is `$creator`, bound to a wallet published at `/.well-known/lapse.json` on the provider’s own domain. Same name, other wallet: FORGED. Canaries are readonly. Independent witnesses post "I saw it alive" entities that anyone can extend. A static page and a CLI query the public RPC. No backend.

Friction they logged: the faucet needs SIWE plus a CAPTCHA and an injected wallet, so funding a terminal key meant reverse-engineering the flow. An unfunded write fails with "Execution error without revert data" rather than an insufficient-funds error. Arkiv emits no event when an entity expires. There is no server-side ordering, so they sort client-side on a `u64` `seq`. A writable attribute cannot be the source of trust.

Take: readonly, `$creator` as the only trust signal, a CLI next to the page, no backend. Leave: canaries, witness entities, domain binding, permissionless extension.

### SiteLog

<https://devfolio.co/projects/sitelog-247d>

Open agent audit trail and dispute replay. Builder: Artur Baranouski. Created 9 October 2026. Tracks: all four CROPS pillars. Repo they named: <https://github.com/ttimesai-star/sitelog>. Also still has a construction-site inspector log.

Each LLM call and tool call is a readonly entity: SHA-256 of input and output, hash of the previous step, EIP-191 signature. A batch creates it and hands ownership to the auditor, so the agent cannot delete the trail. Raw files stay in the browser and are never uploaded. Strict mode stores salted hashes only.

Friction: `predictEntityKeys` is on the public client, not the wallet client. The documented example calls it on the same client as `executeBatch`. Two clients fixed custody-from-the-first-block. Permissionless extension on one entry made their atomic "seal + retain" batch revert, so they seal first and retain one by one. The SDK held a reference to a message array that the agent kept appending to after hashing. Cursor pagination broke after one block unless pinned with `atBlock()`. Public RPC about 100 queries per hour.

Take: `predictEntityKeys` on the public client, then `executeBatch` on the wallet client, with the predicted salt, and an ownership change in that same batch. Pin pagination with `atBlock`. Leave: hash chains, agent logs, salted hashes of real content. Hashing personal data is still personal data under the rules.

### Door Ledger

<https://devfolio.co/projects/door-ledger-593b>

Tamper-proof record of exchange deposit and withdrawal halts. Created 9 October 2026, edited 10 October. Tracks: Censorship Resistance, Open Source, Security.

Each closed halt is written once and handed to `0x…dEaD` in the same transaction. Anyone can extend it. Rows count only when `$creator` is a watcher the reader trusts. The page ships with a planted spoof. A second consumer, `tools/consumer_example.py`, was written from the schema alone. First closed record they cite: Gate withdrawals on Cardano, shut about 12.5 hours on 9–10 October 2026.

Friction: numbers in queries must be tagged `u64(...)` or they silently match nothing. A cursor only works with the `atBlock` of its first page. They record a signed transaction before broadcast so a slow receipt cannot produce a duplicate of a burned, permanent episode.

Take: dead-address custody, planted flood wallet, reproduce-by-curl. Leave: permissionless extension, permanent episodes, exchange data.

### ProofGraph

<https://devfolio.co/projects/proofgraph-539f>

Agent capability reputation that expires when the proof is stale. Builder: Serhii Tsopa. Created 10 October 2026. Track: Open Source only.

Each capability is a work proof with an expiration. Fresh proofs are discoverable. Stale ones stop counting. They classified ACTIVE / EXPIRING SOON / STALE from real expiry metadata because the SDK has no display helper for remaining lifetime.

Friction: README examples were pre-Tiramisu. `@arkiv-network/sdk` 0.8.1 wallet client does not expose the read actions the older docs implied. Separate the public client from the wallet client.

Take: derive freshness from `expiresAt`, never from a field the writer can set. Leave: the agent-reputation product. It is also close to Arkiv Hub’s already-catalogued "Capability Canary" idea.

### Arkiv Canary

<https://devfolio.co/projects/arkiv-canary-901e>

Domain-proven warrant canaries. Builder: David J. Created 11 October 2026, edited 12 October. Tracks: Censorship Resistance, Security. Friction file they named: <https://gitlab.com/davidj-builds/arkiv-canary/-/blob/main/arkiv/friction.md>.

Same product as Lapse, built independently. Expiry is the death. States: ALIVE, OVERDUE, DEAD, RETIRED. Domain proof is a DNS TXT record and a `/.well-known` file, both naming `$creator`, checked in the browser, with an impostor demo wallet. Witness receipts are readonly and anyone can extend them. Embeddable badge. CLI exit codes 0–4. No backend.

Friction: anonymous-budget HTTP 200 non-JSON body makes the SDK hang, so they race reads against a probe. Publishing is two transactions when the first receipt must name a key that does not exist yet. No aggregation in queries, so distinct witnesses are counted client-side.

Take: client-side distinct counts, because Arkiv will not aggregate. An explicit impostor or flood wallet on the page. Leave: the canary.

### Fine Print Ledger

<https://devfolio.co/projects/fine-print-ledger-4170>

Verifiable snapshots and diffs of contest rules pages. Builder: HOA NGUYEN. Created 11 October 2026, edited 12 October. Tracks: Censorship Resistance, Open Source, Security.

Readonly, hash-checked copies of public rules pages. A diff when a page changes. They were watching 10 pages across 9 contests. Citing a snapshot extends it for a year. Anyone can read the ledger from the chain.

Friction, 10 entries in `arkiv/friction.md`: uppercase attribute names revert on Tiramisu even though the SDK’s error text lists `A`–`Z` as allowed. Upstream issue arkiv#114. A bare JS number becomes `i32` and silently matches nothing against `u64` (they saw 5 rows vs 0). Keyless read budget, and viem waiting out `Retry-After` for about 40 minutes. Snapshot and diff in one batch required predicting the snapshot key. They also rejected empty snapshots so a failed fetch could not look like a deletion.

Take: snake_case only, constructors on every attribute and every predicate, fail the write rather than record an empty or dirty payload. Leave: page snapshots and "citing extends the life."

### Arkiv Hub, for context only

<https://hub.arkiv.network/ecosystem> catalogs 116 earlier projects and names gaps (shared schemas, a trigger worker, CRDTs, a query dashboard, pay-per-query). Those gaps are not this hackathon’s field. Do not pivot underthetable into one of them. The hub’s official gaps are also where other teams this week may still show up, so they are not free.

Civic cousins, not submissions, so we do not collide with a Devfolio page. They are the product prior art:

- <https://bribesfyi.in/> and the shutdown: <https://theprint.in/feature/bribes-fyi-anti-corruption-site-aryan-nishad/3018441/>, <https://www.ndtv.com/feature/anti-corruption-website-bribes-fyi-shuts-down-indefinitely-after-viral-popularity-11929187>, <https://economictimes.indiatimes.com/news/new-updates/maharaja-agrasen-engineering-students-bribes-fyi-gets-50-lakh-requests-in-48-hours-to-report-bribe-demands-now-shuts-down/articleshow/133339602.cms>
- How the form was shaped: <https://thebetterindia.com/technology/bribe-reporting-platform-india-bribes-fyi-aryan-nishad-maharaja-agrasen-institute-technology-delhi-12391806>
- I Paid a Bribe: <https://participedia.net/case/5579>, <https://www.ideasforindia.in/topics/governance/i-paid-a-bribe-using-technology-to-fight-corruption-in-india>, <https://www.hbs.edu/faculty/Pages/item.aspx?num=42758>, and the Janaagraha index <https://www.janaagraha.org/resources/crowdsourced-retail-bribery-index-crbi/>
- A street-level pothole map, considered and rejected: <https://potholes.fyi/>. A district-level `failure` such as `pothole` is in the vocabulary. It does not store a road, a ward, or a photo.
- Shutdown thread: <https://www.reddit.com/r/india/comments/1vru8mb/anticorruption_site_bribesfyi_shuts_down_forever/>

bribes.fyi’s own public form already avoided names: place, department, position, amount, asked or given, refused, no login. underthetable keeps that shape and removes the administrator who reviewed submissions before publication. That reviewer is a censor. Moderation here is the three-creator rule and the 180-day lifetime, both enforced by what readers query, not by a queue we can be told to empty.

## 5. Data model

One entity type. Tag every entity so it can be found in Arkiv’s shared database.

### `report`

| Attribute | Type | Example | Query |
| --- | --- | --- | --- |
| `project` | `str` | `underthetable` | `eq` |
| `type` | `str` | `report` | `eq` |
| `state` | `str` | `mh` | `eq` |
| `district` | `str` | `nashik` | `eq` |
| `department` | `str` | `rto` | `eq` |
| `role` | `str` | `motor_vehicle_inspector` | `eq` |
| `service` | `str` | `driving_licence` | `eq` |
| `outcome` | `str` | `asked`, `paid`, or `refused` for a demand; `noted`, `worsened`, or `cleared` otherwise | `eq` |
| `kind` | `str` | `demand`, `failure`, `absence`, or `diversion` | `eq` |
| `week` | `str` | `2026-W42` | `eq` |
| `day` | `str` | `2026-10-16` | `eq` |
| `amount_inr` | `u64` | `500` rupees for a demand, or a severity from 1 to 5 otherwise | `eq`, `gte`, `lte` |

That is 12 attributes. The cap is 30. Names are snake_case, 1–32 characters, leading lowercase letter. No `$`, no `--`, no query reserved words. A row with no `kind` is read as `demand`.

Payload: UTF-8 JSON `{"v":1}` only. Content type `application/json`. Nothing else, ever.

Flags: `{ readonly: true, permissionlessExtension: false }`.

Expires: `ExpirationTime.fromDays(180)` for a normal report. The short demo report uses `ExpirationTime.fromHours(1)`.

Owner after the batch: `0x000000000000000000000000000000000000dEaD`.

Creator: the wallet that signed the batch. Immutable. This is what the index counts.

Salt: the salt returned by `predictEntityKeys` for that create. A random salt would land on a different key than the ownership change.

### Bucket

A quoted row is not an entity. Readers compute it.

Bucket key: `kind + state + district + department + service + week`. A severity is never averaged with a rupee amount.

`week` and `day` are Asia/Kolkata calendar values of the **incident date the person picks**, not `createdAt`. One function, `src/lib/week.ts`, used by the form, the seed, and the tests. ISO week, format `YYYY-Www`.

A report counts in a bucket when the query returns it (so it has not expired) and its attributes match. Distinct `$creator`: if one wallet submits twice in the same bucket, count it once, and use the earlier `createdAt` for the amount. **Quoted** when distinct creators are at least 3. The displayed amount is the median of those per-creator amounts. Below 3, the reports still render in an unquoted list with the creator address. They do not move the headline number.

There is no tally entity. A tally written by our server would make us the censor again. A tally written by an arbitrary client would let a griefer publish a fake total.

### Closed vocabularies

The client refuses any value that is not in the list. Free text in a `str` attribute is how a name leaks. Ship the lists in `data/vocab.json` and `data/districts.json`. Slugs are the attribute values. Display names stay in the JSON, off chain.

Departments:

| Slug | Display |
| --- | --- |
| `police` | Police |
| `rto` | RTO / transport |
| `revenue` | Revenue and land records |
| `passport` | Passport |
| `municipal` | Municipal corporation |
| `gst` | GST |
| `electricity` | Electricity board |
| `income_tax` | Income tax |
| `fda` | Food and drug administration |

Roles, keep them short and generic. Expand only inside the JSON, never via a text box.

| Department | Role slugs |
| --- | --- |
| `police` | `station_house_officer`, `constable`, `traffic_constable` |
| `rto` | `motor_vehicle_inspector`, `clerk` |
| `revenue` | `tehsildar`, `patwari`, `clerk` |
| `passport` | `verification_officer`, `clerk` |
| `municipal` | `junior_engineer`, `clerk` |
| `gst` | `inspector`, `clerk` |
| `electricity` | `lineman`, `clerk` |
| `income_tax` | `assessing_officer`, `clerk` |
| `fda` | `inspector`, `clerk` |

Services:

| Department | Service slugs |
| --- | --- |
| `police` | `fir_registration`, `noc`, `traffic_stop` |
| `rto` | `driving_licence`, `vehicle_registration`, `fitness_certificate` |
| `revenue` | `mutation`, `caste_certificate`, `income_certificate` |
| `passport` | `fresh_passport`, `police_verification` |
| `municipal` | `birth_certificate`, `trade_licence`, `building_plan` |
| `gst` | `registration`, `refund` |
| `electricity` | `new_connection`, `name_transfer` |
| `income_tax` | `refund`, `pan` |
| `fda` | `licence` |

`traffic_stop` and `fir_registration` are the policing categories. They record a demand for a service. They do not record an assault, a victim, or an officer’s name.

Districts: every state and union territory, with districts. Use census names and a slug. The 2011 census map is missing later districts (Nuh, Kakching, and others). Include an alias table for those if the dropdown needs them. Do not geocode. Do not store a point.

Amount: integer rupees, `u64`, minimum 1, maximum 10_000_000. Reject decimals in the form by asking for whole rupees. No `i32`. No bare JS number in either the write or the query.

Incident day: required, not in the future in Asia/Kolkata, not more than 180 days before the write. The entity lifetime is also 180 days from the write, so a report about an old incident still expires six months after it was published. Say that on the form.

### Write-time guard

`src/lib/guard.ts` runs in the browser and again in the seed script. It throws before any RPC write if:

- any attribute is missing or not in the vocabulary
- `amount_inr` is out of range
- the payload bytes are not exactly `{"v":1}`
- any string contains a digit run of 10 or more (phone, Aadhaar)
- any string matches an email
- any string contains `@` or `+91`

There is no free-text field to scan beyond the slugs. Keep it that way. Add a unit test that a payload of `{"v":1,"note":"Rahul"}` is rejected.

## 6. Write path

Two clients. The wallet client only writes. `predictEntityKeys`, `select`, `getEntity`, and `getEntityCount` are on the public client. `@arkiv-network/sdk` 0.8.1 does not put those reads on the wallet client (ProofGraph, SiteLog).

```ts
import {
  createPublicClient,
  createWalletClient,
  ExpirationTime,
  jsonToPayload,
} from "@arkiv-network/sdk"
import { str, u64 } from "@arkiv-network/sdk/attr"
import { tiramisu } from "@arkiv-network/sdk/chains"
import { http } from "viem"

const DEAD = "0x000000000000000000000000000000000000dEaD" as const

const publicClient = createPublicClient({
  chain: tiramisu,
  transport: http("https://rpc.tiramisu.db-chain.testnet.arkiv.network"),
})

const [predicted] = await publicClient.predictEntityKeys({
  owner: walletClient.account.address,
  count: 1,
})

const { txHash, createdEntities } = await walletClient.executeBatch({
  creates: [
    {
      payload: jsonToPayload({ v: 1 }),
      contentType: "application/json",
      attributes: {
        project: str("underthetable"),
        type: str("report"),
        state: str("mh"),
        district: str("nashik"),
        department: str("rto"),
        role: str("motor_vehicle_inspector"),
        service: str("driving_licence"),
        outcome: str("asked"),
        week: str("2026-W42"),
        day: str("2026-10-16"),
        amount_inr: u64(500n),
      },
      expires: ExpirationTime.fromDays(180),
      flags: { readonly: true, permissionlessExtension: false },
      salt: predicted.salt,
    },
  ],
  ownershipChanges: [
    { entityKey: predicted.key, newOwner: DEAD },
  ],
})
```

Confirm `createdEntities[0] === predicted.key`. If a prediction is stale because another create from the same wallet landed first, the batch must revert rather than seal the wrong key. Retry the prediction. Do not send two writes from one wallet at once. The SDK fetches the nonce at send time, and two in-flight transactions collide. The seed script writes strictly sequentially.

Browser writes use an injected EIP-1193 wallet (`window.ethereum`) on chain ID 7738577. The seed script uses `privateKeyToAccount` from environment variables. Never import a seed key into the frontend. Never commit a key. `.gitignore` already excludes `.env` and `.env.*`.

If the batch API cannot attach an ownership change to a key created in the same batch, stop and record it in `arkiv/friction.md` with the SDK version. The fallback is not "create now, transfer later." A crash between those transactions leaves a report we can still delete. The fallback is: do not ship a write path that can leave the team as owner. SiteLog’s working approach was public-client `predictEntityKeys` plus one `executeBatch`. Use that.

After a successful write, the UI shows the entity key, the transaction hash, the explorer link, `$owner` (dead), `$creator`, and `expiresAt`. Offer a button that attempts `deleteEntity` with the same wallet and shows the revert. That is the censorship demo.

## 7. Read path

Every board query filters `project` and `type` first.

```ts
import { eq, gte, str, u64 } from "@arkiv-network/sdk/query"

const page = await publicClient
  .select({
    key: true,
    creator: true,
    owner: true,
    createdAt: true,
    expiresAt: true,
    attributes: true,
  })
  .where(
    eq("project", str("underthetable")),
    eq("type", str("report")),
    eq("district", str(district)),
  )
  .limit(200)
  .fetch()
```

If `page` has a cursor, pass it with the **same** `atBlock` as the first page. Do not follow a cursor against the head. Loop until the district is exhausted or a sane cap (a few pages) is hit, and say on screen if the cap was hit.

Amount filter, when the reader sets "at least ₹500":

```ts
.where(
  eq("project", str("underthetable")),
  eq("type", str("report")),
  eq("district", str(district)),
  gte("amount_inr", u64(500n)),
)
```

Both the stored value and the predicate use `u64`. A bare `500` becomes `i32` and matches nothing, silently.

Flood filter, for the demo panel and the CLI:

```ts
.createdBy(floodAddress)
```

Count, for the header:

```ts
publicClient.getEntityCount(/* same predicate */)
```

Live updates: a second public client whose transport is `webSocket("wss://rpc.tiramisu.db-chain.testnet.arkiv.network")`.

```ts
const unwatch = wsClient.watchEntityEvents({
  onEntityCreated: async (event) => {
    const entity = await publicClient.getEntity(event.entityKey)
    if (entity.attributes.project?.value !== "underthetable") return
    // merge into the open district if it matches
  },
  onError: (error) => {
    // surface the message; do not hang
  },
})
```

No `fromBlock`. On unmount, call `unwatch()`. Expiry does not emit. For rows already on screen, if `expiresAt` is in the past relative to the latest block, drop them from the quoted set and keep the key visible under "expired, see the creation transaction" for the short-lived demo entity only.

Cache the last successful page in `sessionStorage` for 60 seconds so a re-render does not burn the anonymous budget. On budget failure, show the error in one sentence and the CLI command that runs the same query. Do not retry for 40 minutes.

### Optional relay

Build it only if the public RPC makes the judge flow unusable during the demo. One serverless function. It accepts only `arkiv_query`, `arkiv_getEntity`, and `arkiv_getEntityCount`. It rejects every other method. It caches identical bodies for 4 seconds. The access key stays in the host’s environment. The page has a "direct" switch that bypasses the relay. The CLI always uses the public RPC directly so judges are not stuck behind our host.

## 8. Interface

The page is a side-view district street with a ledger underneath. The reference for the frame, not the plot, is [Main Bhi Cockroach](https://celadon-lokum-3fef09.netlify.app/): a title, a world line, a news ticker, a mission briefing, then the interactive scene, then a field guide that says the characters are invented. That game's story (a cockroach, Jantar Mantar, a named eraser of voter rolls) is not this project. Do not copy its characters, its ticker lines, or its protest mission.

Vite, React, TypeScript. One page. The phone layout stacks the street, then the slip, then the board.

### The story the screen tells

You are at a counter with a form. The desk names a number of rupees. You do not write your name. You write the district, the department, the role title, the service, and the amount. The slip leaves your hands: one transaction creates it and gives it to an address nobody holds. Three other wallets have to have written the same desk in the same week before the board prints a median. One wallet writing five times is still one voice. After 180 days the slip leaves every current query on its own.

On-screen cast, all fictional, none of them a real official:

| Role in the scene | Sprite | Animations that may play |
| --- | --- | --- |
| The person holding the form | `City_men_1` from the city-man pack | Idle, walk |
| The clerk at the counter | `Trader_1` | Idle, dialogue, approval. The chest-opening frames are the seal. |
| The queue | `City_men_2`, `City_men_3` | Idle. One figure per distinct creator, up to three, then a `+n`. |
| The street | shooter `City_Tileset` road, pavement, and building walls | Static. |
| The notice board | industrial `Board1`–`Board3` | The quoted median is painted on this board. |
| The queue barrier | industrial `Fence1`–`Fence3` | Static. |
| A dog near the bench | street-animal dog, idle only | Optional. Not a character and not a joke about the person reporting. |

Department stalls are doors along that one street, labeled with the vocabulary slugs. Choosing a district changes the world line and reloads the board from Arkiv. Choosing a department walks the applicant to that door. The slip is the real form: state, district, department, role, service, outcome, amount, incident date, connect wallet. No textarea.

### Screen regions, top to bottom

1. **Title.** `UNDER THE TABLE`. World line in the reference's pattern: `World 1 · <district> counter · <week> · Seal: open`. In `?mode=closed` the seal word becomes `Submissions: closed`.
2. **Ticker.** One line per quoted bucket already on chain, for example `Nashik · RTO · driving licence · ₹700 · 3 wallets · sealed`. If the district is empty, the ticker says so. Never invent a row.
3. **Street.** The sprites above. HUD from the shooter UI sheet: a rupee bar for the typed amount, three pips for distinct creators, a button skin for file / seal-check. Buttons have normal, tap, and inactive states in `UI/Buttons`.
4. **Mission briefing.** The story in the paragraph above, in the second person, short enough to read on a phone.
5. **Board.** Quoted table: department, service, week, distinct creators, median rupees, outcome mix. Unquoted list underneath, with the shortened creator and an explorer link. Minimum-amount filter. Empty copy: "No sealed reports in this district yet," plus the CLI command.
6. **Receipt.** After a write: entity key, transaction, dead owner, failed delete. The clerk plays approval once, then the chest stays open on the sealed frame. The delete attempt is the button labeled seal-check, and the revert text is shown in full.
7. **Field guide.** These are citizen reports, not findings. The headline is "3 wallets reported a demand," not "this office takes bribes." Characters are not real people. The page is not affiliated with any department or police force.

`?mode=closed` hides the slip and still loads the street, the ticker, and the board. The video uses both URLs.

The flood is a beat in the street, not a hidden panel. Five copies of one city-man sprite come out of one door. The pips go from 3 to 4, not to 8. A caption says "five slips, one additional voice."

### Asset inventory

Everything under `assets/` is a CraftPix freebie. The [freebie license](https://craftpix.net/file-licenses/) allows use inside a site or game. It does not allow republishing the source zips so someone else can lift the art. Before the repo is public, keep the zips out of git and ship only the cropped frames the page needs. Credit CraftPix in the field guide.

| Pack | Use | Leave unused |
| --- | --- | --- |
| City man, three characters | Applicant and queue. Idle, walk. | Attack, hurt, dead. |
| City trader, three characters | Clerk. Dialogue and approval. | Any frame that is not the counter. |
| Urban shooter top-down kit | The street: road, pavement, building walls, signage. HUD: `UI/UI.png`, `UI/Buttons`, `UI/Icons`. | Characters with guns, grenades, enemies. |
| Industrial zone | Fence, boards, bench, lockers, barrels, as queue props. | Animated machinery as a focus. |
| Street animals | One dog, idle, beside the bench. | Rats, and any animal as a stand-in for a person. |
| Market cartoon tileset | Do not composite into the pixel street. It is a smooth vector style, and several props are swords, shields, and armor. | The whole pack, unless a later pass makes flat department cards and accepts the clash. |
| Homeless character | Do not cast the person filing a report as this sprite. | The whole pack. |
| Cyberpunk townspeople, biker, punk, cyborg | Different palette from the street. | The whole packs. |
| Urban zombie kit | Same UI idea as the shooter kit, plus zombie enemies. | The whole pack. The shooter UI is enough. |

Fonts, in `assets/Press_Start_2P,Silkscreen.zip`. Both are the files to ship. Press Start 2P for the title, the world line, and the ticker. Silkscreen for the slip, the board, and the field guide. The `Font.txt` links inside the CraftPix packs are not licensed with those packs. Do not download or embed Digital Disco or Agency FB.

The police sheet is `assets/craftpix-543219-2d-game-police-character-free-sprite-sheets.zip`. Those three officers are smooth cartoon figures, so they do not stand in the pixel street. Officer 1 or 3, idle only, may sit as a portrait card on the thana door. Officer 2's idle holds handcuffs. Do not play attack, hurt, dead, or any frame with a weapon.

The soldier pack is `assets/craftpix-net-507107-free-soldier-sprite-sheets-pixel-art.zip`. It is the right pixel scale and the wrong picture. Idle and walk on all three soldiers hold a rifle, and the rest of the sheets are shot, grenade, explosion, hurt, and dead. Do not put them on the street, and do not crop the rifle out. The thana door stays the industrial fence plus a board, with `Trader_1` behind the counter. No further character pack is required.

## 9. CLI and reproduction

`scripts/query.ts` uses the public client and the standard library plus the SDK. No API of ours.

```bash
npm run query -- --district nashik
npm run query -- --district nashik --min-inr 500
npm run query -- --created-by 0xFLOOD...
```

It prints the quoted buckets, the unquoted rows, the block number, and the entity keys. The Devfolio "how can judges reproduce this" answer is these three commands plus the closed-mode URL.

`scripts/seed.ts` writes, in order:

1. Three wallets, one report each, same bucket: Maharashtra / Nashik / RTO / motor vehicle inspector / driving licence / the current Kolkata week / outcomes `asked`, `paid`, `refused` / amounts 500, 800, 700. Median 700. This bucket is quoted.
2. The flood wallet, five reports in that same bucket with different amounts. That is a fourth distinct creator, so the quoted set goes from 3 voices to 4, and only the flood wallet’s earliest report supplies its amount. The other four flood entities are visible and do not add voices. Do not special-case this wallet in the aggregator. The panel’s claim is "five entities, one additional voice." Assert the resulting median in the seed test.
3. Wallet 1, one extra report in a different district with `fromHours(1)`, so the quoted Nashik bucket is not disturbed. Record its key and tx. The video shows it, then the board after expiry, then the explorer transaction.

Print every address and transaction hash at the end of seeding. Copy them into `arkiv/wallets.md`. Do not print private keys.

## 10. Repository layout to create

```
underthetable/
  plan.md                 # this file
  README.md               # setup, required by the checklist
  LICENSE
  .gitignore
  .env.example            # names only, no values that are secret
  package.json
  tsconfig.json
  vite.config.ts
  index.html
  arkiv/schema.md         # the data model in section 5, plus the exact queries
  arkiv/friction.md       # filled while building, not in advance
  arkiv/wallets.md        # addresses and roles, after seeding
  data/vocab.json
  data/districts.json
  src/main.tsx
  src/App.tsx
  src/lib/client.ts
  src/lib/guard.ts
  src/lib/week.ts
  src/lib/write.ts
  src/lib/query.ts
  src/lib/aggregate.ts
  src/vite-env.d.ts
  scripts/seed.ts
  scripts/query.ts
  test/guard.test.ts
  test/aggregate.test.ts
  test/week.test.ts
```

`README.md` has to exist before submission: how to install, how to fund a wallet, how to seed, how to run the page, how to run the CLI, the chain parameters, and a pointer to `plan.md`, `arkiv/schema.md`, and `arkiv/friction.md`.

`.env.example`:

```
SEED_KEY_1=
SEED_KEY_2=
SEED_KEY_3=
FLOOD_KEY=
ARKIV_RPC_URL=https://rpc.tiramisu.db-chain.testnet.arkiv.network
```

Dependencies: `react`, `react-dom`, `vite`, `typescript`, `@arkiv-network/sdk@0.8`, `viem`, and a small test runner (`node --test` with `tsx`, so there is no second toolchain). Record the exact SDK version that was installed at the top of `arkiv/friction.md`.

Scripts:

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "seed": "tsx scripts/seed.ts",
  "query": "tsx scripts/query.ts",
  "test": "tsx --test test/*.test.ts"
}
```

Adjust the TypeScript build to whatever the current Vite React-TS scaffold emits. Do not add a database, an auth service, or a component library.

## 11. Deploy

Static host. Vercel or GitHub Pages are both fine. Judges get one HTTPS URL with no login.

The production build contains no private key and no access key. Confirm with a search of `dist/` before calling the deploy done.

Add Tiramisu in the README’s wallet section: chain ID 7738577, the HTTP RPC, currency symbol GLM.

Deployment stays up through 23 October 2026.

## 12. Devfolio answers

Paste these only after the code exists, and only after the wallet addresses and the friction link are real. Private keys never go in the form.

**Project name.** underthetable

**Tagline.** A district bribe index the operators cannot delete.

**The problem it solves.** People in India are asked for money to get a driving licence, a mutation, an FIR, or a power connection. The demand is designed to leave no record. bribes.fyi showed that people will report the district, the department, the role, and the amount, and then its operators shut the site and said they would delete the data. I Paid a Bribe ended when the funders left. underthetable publishes that same non-identifying report as a readonly Arkiv entity and transfers it, in the same transaction, to an address nobody controls. A district shows a median only after three different wallets report the same service in the same week. Names, phone numbers, and office identities are not collected.

**Challenges I ran into.** Summarize `arkiv/friction.md` after it is real. Expect to hit, and write up only if you actually hit: uppercase or camelCase attribute names, bare numbers versus `u64`, cursors without `atBlock`, no expiry event, anonymous RPC budget and HTTP 200 non-JSON bodies, unfunded-wallet errors with no revert data, faucet SIWE, `predictEntityKeys` living on the public client, and nonce collisions on parallel writes.

**Tracks.** Best Indian Use Case. Censorship Resistance.

**Live app URL.** The production URL.

**Indian nationality.** Answer truthfully. The India prize is not awarded without it.

**Why Arkiv?** Section 2, shortened to the form’s length. Name Postgres, IPFS, a subgraph, and our own API. Name what stays off chain.

**How do you use Arkiv?** The table in section 2, each row with a GitHub link to the function that does it.

**Friction link.** `https://github.com/<owner>/underthetable/blob/main/arkiv/friction.md` once the repo is public.

**Wallet addresses.** The three seed writers, the flood wallet, and any browser wallet used in the demo. Role next to each. Creator versus dead owner.

**Schema link.** `.../blob/main/arkiv/schema.md`

**Reproduce.** Open the live URL. Open `?mode=closed` and confirm the board still loads. Run the three CLI commands in section 9. Attempt a delete of a seeded key with a funded wallet and show the revert. Open the short-lived entity’s creation transaction on the explorer.

**Pre-existing work.** None.

**Surfaces.** TypeScript SDK, WebSocket events, Docs, Hub, Faucet, Block Explorer. Add Access keys and Direct JSON-RPC only if the relay was actually built.

**Time to first entity.** Answer from what happened.

**LLMs.** Name the tools actually used, including the agent that wrote this plan.

**One improvement.** Pick the single worst real issue in `arkiv/friction.md`. Do not invent one. Invented complaints score 0.

**Feedback call.** The team’s choice.

**Checkboxes.** The work is this team’s, built inside the window. The repo is public MIT and the links resolve.

## 13. Demo video, under 3 minutes

1. Open a district that already has the quoted Nashik RTO bucket. Say the median and the creator count.
2. Open the flood panel. Five entities, one extra voice.
3. Connect a wallet and submit one synthetic report in a second district. Show the receipt, the dead owner, and the failed delete.
4. Open `?mode=closed`. The form is gone. Reload. The rows are still there. Run one CLI query in a terminal on screen.
5. Show the short-lived report’s explorer transaction and say that judging can use that transaction if the entity has already expired.

No real incident. No names.

## 14. Order of work

1. Scaffold the Vite app and install `@arkiv-network/sdk@0.8` and `viem`. Write the installed version into `arkiv/friction.md`.
2. `arkiv/schema.md` already exists. Implement queries and creates from it. Change the schema and this plan together if an attribute has to move.
3. `week.ts`, `guard.ts`, `aggregate.ts`, with tests.
4. Public client and the district query. Pagination with `atBlock`.
5. Wallet connect, `predictEntityKeys`, `executeBatch`, dead owner. One successful write on Tiramisu before any more UI.
6. Seed script. Fund the four wallets from the faucet. Run it once. Save addresses and hashes to `arkiv/wallets.md`.
7. Board, flood panel, closed mode, seal-check delete button.
8. WebSocket updates.
9. CLI.
10. Deploy. Search `dist/` for key material.
11. Fill `arkiv/friction.md` from the log you kept while doing steps 4–8. Each entry: surface, expected, actual, versions, steps.
12. README, Devfolio form, video.
13. Do not commit `.env`. Do not commit unless the user asks. Do not force-push.

## 15. Friction template

Use this shape. Omit any row you did not actually run.

```markdown
## F1. <surface, e.g. attribute names on create>

- Version: `@arkiv-network/sdk` x.y.z, viem x.y.z, node x, browser
- Expected:
- Actual:
- Steps:
- What would fix it:
```

A smooth path is recorded the same way: what you tested, what you expected, what happened. That scores. Praise with no steps does not.

## 16. Checks before calling it done

- `npm test` passes, including the payload-with-a-name rejection and the median rule.
- A sealed report’s owner is the dead address, seen via `getEntity`, not only via our UI.
- `patchEntity` and `deleteEntity` from the creator revert.
- `extendEntity` from a different wallet reverts.
- The Nashik bucket shows three creators before the flood and four distinct voices after it, with five extra entities from the fourth.
- `?mode=closed` still runs the query.
- The CLI prints the same median as the page for that district.
- No personal data, no hash of personal data, and no private key in the repo, the bundle, or the Devfolio form.
- `arkiv/schema.md` matches the attributes the code writes. Judges will compare them.
