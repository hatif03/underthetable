# Decision log

> **Live:** [underthetable.vercel.app](https://underthetable.vercel.app) · [mirror](https://underthetable.vercel.app/mirror.html) · [repository](https://github.com/hatif03/underthetable) · [all screenshots](screenshots/README.md)

Written 16 October 2026, after the app was running and before seed or deployment. This file records decisions and the changes that followed them. [plan.md](../plan.md) is still the original product spec. [arkiv/schema.md](../arkiv/schema.md) is still the judge-facing data contract. If those two disagree on an attribute, the schema wins.

`AGENTS.md`, `CLAUDE.md`, `README.md`, `RULES.md`, `docs/scoring-rubric.md`, and `docs/submission-checklist.md` are the organiser copies. They were not rewritten. `docs/setup.md` and this file were added for the product.

Nothing in this repository has written an Arkiv entity. `npm run seed` has not been run. No private key has been put in source, in the page, or in this log.

## 1. What the submission is

The challenge is the Arkiv Global Tour Stop, 9–18 October 2026. Submissions close 18 October 2026, 23:59 London time. The canonical rules are this repository, not a differing Devfolio page. The network is Tiramisu, chain ID `7738577`. Arkiv is described as the Web3 database. Its rows are Arkiv entities. The expiry primitive is Entity Expiration. Renewal would be Lifetime Extension. The word TTL is not used.

The product is **underthetable**: a public index of retail bribe demands in India. A person publishes a closed-vocabulary slip: state, district, department, role title, service, whole rupees, outcome, and the incident date. They do not publish who they are, who asked, or which office.

Tracks entered, and only these two:

- Best Indian Use Case. The person it is for is someone in India about to deal with a routine desk, starting with a driving licence in a district. The prize requires one team member of Indian nationality. That nationality has not been confirmed in the project notes.
- Censorship Resistance. The harm is that bribes.fyi collected the same kind of non-identifying report and then said the data would be deleted, and that I Paid a Bribe ended when its funders left. A sealed entity has no operator key that can erase the row.

Privacy, Open Source, and Security were not entered. One prize per team. Attending Devcon is not required to win.

## 2. Ideas that were studied and refused

Submitted projects that were read before the idea was chosen: Lapse, SiteLog, Door Ledger, Proofgraph, Arkiv Canary, and Fine Print Ledger.

A police-brutality case file was considered and refused. A case file needs a name, a photo, a medical note, an FIR number, or an exact place. Real personal data on Arkiv, in plaintext or hashed, makes the submission ineligible. A sealed accusation cannot be corrected. Protest reporting from October 2026 can explain the censorship track. It is not seed data.

The original spec also refuses a pothole map, a warrant canary, an exchange-halt watcher, a contest-rules archive, an agent audit log, and a second internet-shutdown register. The reason for refusing potholes, written in `plan.md`, is that a pothole table does not depend on a custodian being unable to delete it. See section 11 for the later request to widen the product. That widening is not in the schema and not in the running page.

## 3. Why the row is an Arkiv entity

| Store | Why it was not enough |
| --- | --- |
| Postgres or an API we run | The operator can shut the form and delete the table, which is what happened to the sites this one answers. |
| IPFS | A CID does not answer "this district, this department, this week, amount at least 500, still unexpired," and it does not drop the row when the 180 days end. |
| A subgraph | It can index events we emit. It does not enforce Entity Expiration, `readonly`, or an ownership transfer that removes the writer's ability to delete. |

What stays off Arkiv on purpose: names, phone numbers, email, Aadhaar numbers, exact office names, street addresses, GPS, photos, video, medical notes, FIR numbers, free-text narratives, and hashes of any of those.

Features the spec requires the app to use, each for a product reason:

- Queryable attributes, with the payload fixed at `{"v":1}`.
- Filtered queries, a numeric range on `amount_inr`, `createdBy()`, and cursor pages pinned to one block.
- Entity Expiration of 180 days, plus one seeded report of about one hour in a different district.
- `readonly: true`, so the slip cannot be patched.
- `permissionlessExtension: false`, so a rival cannot keep one slip alive. Lifetime Extension is not used.
- `predictEntityKeys` and `executeBatch`: create the entity and transfer it to `0x000000000000000000000000000000000000dEaD` in one transaction.
- Trust is the immutable `$creator`. `$owner` is the dead address and only controls writes.
- `watchEntityEvents` on a WebSocket transport with no `fromBlock`. With `fromBlock`, or over HTTP, the SDK polls instead of opening a socket.

## 4. The data contract that the code implements

One entity type, `report`. Project attribute `underthetable`.

Bucket: state, district, department, service, and the ISO week of the incident date in Asia/Kolkata (`YYYY-Www`). The day is `YYYY-MM-DD`. Amount is a `u64` of whole rupees from 1 to 10,000,000. Outcome is `asked`, `paid`, or `refused`. Departments, roles, and services are the closed lists in `data/vocab.json`. Districts are the lists in `data/districts.json`, which is a working set of major districts, not a full census of every district.

A bucket is quoted at 3 or more distinct `$creator` values. If one creator writes twice, the earlier `createdAt` and its amount are kept. The displayed amount is the median of those per-creator amounts. An even count uses `Math.round` of the two middle values. Below 3, the rows stay unquoted and show the creator. There is no tally entity.

The flood wallet's five reports are one additional voice. They are not ignored, and they are not five voices. The intended seed is three wallets at 500, 800, and 700, then the flood wallet's earliest amount 1000, so the quoted median is 750 from 4 voices. The browser always uses `ExpirationTime.fromDays(180)`. Only the seed script may pass a one-hour expiry, and only for the Pune demo row.

The payload is exactly the UTF-8 bytes of `{"v":1}`, content type `application/json`. A payload that also contains a note is rejected. Tests cover the week rule, the Kolkata date, that payload rejection, the guard, the three-wallet median, and the flood wallet.

Seed keys, if they are ever filled, live only in `.env` as `SEED_KEY_1`, `SEED_KEY_2`, `SEED_KEY_3`, and `FLOOD_KEY`. The seed script loads that file itself, does not print the keys, writes reports one at a time, skips a report that already matches, and writes `arkiv/wallets.md` only when it is run. The frontend does not import those keys. A live write has not been authorized.

## 5. How reads and writes behave

Queries use `select().where().limit().fetch()`, plus `ownedBy()`, `createdBy()`, and `cursor()`. There is no server-side ordering. The client sorts. Ranges are only on numeric attributes. The page size cap is 200. The app stops after 5 pages and says the median may be incomplete.

`getEntityCount()` in SDK 0.8.1 sends empty params, so it is the chain-wide count. A district figure uses raw `arkiv_getEntityCount` with the same predicate as the page. Nashik was read at blocks 648647, 648686, and 648755: matching reports 0, chain-wide count about 9606–9607. That difference is friction F1 in `arkiv/friction.md`.

A filtered read is cached in `sessionStorage` for 60 seconds. Bigints are stored as strings. `fresh` skips the cache. A cursor failure retries the whole read once. User rejection code 4001 is not retried. One write is in flight per page. The predicted key is retried only if `executeBatch` throws. A failed `getEntity` after a successful batch is not treated as a reason to write again.

The public RPC's anonymous budget answered a Pune query with HTTP 429 and `"ANON_COST_LIMITED"` in about 17 seconds. That is friction F2. The page maps that class of failure to one sentence plus `npm run query`. It does not describe the district as empty when the read failed. `npm run query` with no district and no creator reads every underthetable report still on Tiramisu. The Record view uses that unscoped read, once, when the tab is opened.

The browser wallet path is EIP-1193. It switches or adds chain `0x7614d1`, then checks the account and chain again before signing. The window provider is typed more loosely than viem's provider and cast inside `connectWallet`.

## 6. What the running page is

The running UI is a Vite, React, and TypeScript page. Section 6 below is the page as it was when the slip, the record, and the assistant first worked. Section 11 is what the page is after the office, the light theme, and the four report kinds.

The page the browser showed at that point:

- A 3 by 3 town of counters. Buildings are crops of the CraftPix urban tileset: `public/world/shop.png` and `public/world/block.png`. Streets use `public/sprites/road.png`. The selected counter has a speech bubble. On a phone the bubble is a caption under the map, because an absolutely positioned bubble stretched the row and covered the neighbouring buildings.
- Town, Slip, and Record. On a screen at most 800px wide those are separate screens and the navigation is fixed to the bottom. On a wider screen the town and the slip sit side by side.
- The slip has four steps: Place, Desk, What happened, Review. Filing is offered on Review. The review text is the list of fields a wallet would publish.
- An optional sentence. If it is used, it is sent once to `POST /api/assist`. The page says that sentence is not the record. `?mode=closed` hides the slip and the sentence and still shows the town and the record.
- Record lists every slip still on Tiramisu, including earlier weeks and other districts, filterable by district and department, grouped by week. A card can jump back to that district's town. Opening Record during verification hit the anonymous budget, so the page showed the refusal sentence rather than an empty archive.
- Filing without a connected wallet reports that a Tiramisu wallet is required. The file button stays clickable so that explanation can appear.
- A district board remains under the town: quoted rows, unquoted rows, and short-lived rows whose expiry has passed. Expired short-lived keys stay listed as "expired, see the creation transaction." They leave the quoted set.
- The field guide says these are citizen reports, not findings, and that the characters and buildings are not real offices.

Checked in headless Chrome on 16 October 2026: nine counters, a police tap setting the slip to Police / station house officer / FIR registration, the phone slip replacing the town, the select staying inside the slip, and the wallet warning. `npx tsc --noEmit` passed after that UI. `npm test` passed, 6 tests. Those checks were before the office-scene copy in section 10, which has not been typechecked as part of the page.

Visual choices that were rejected along the way:

- A side-view strip of clerks, an applicant, and a police portrait. It read as loose sprites, not a place.
- Top-down shooter frames from the CraftPix pack. The idle pose is a helmeted figure with a gun. Those frames are not on the map.
- The soldier pack. It was added to `assets/` and left unused, because the idle and walk frames hold a rifle.
- Playing police attack, hurt, or dead frames.

The reference for "a world, not a sprite strip" was GemeindeSim (`https://github.com/hatif03/gemeindesim`). The plot of that project was not copied. The first version of this town was the CSS grid above, using the CraftPix buildings already in the repo.

Fonts on the page are Press Start 2P and Silkscreen, from `assets/`, served under `public/fonts`. The palette of the running page is still the dark brown pixel UI. A lighter theme was requested and is not applied. See section 11.

## 7. The sentence and the assistant

People should be able to describe what happened without that description becoming the public record. The decision is:

- The sentence is optional.
- The browser rejects an email, `@`, `+91`, and a run of 10 or more digits before the request is sent.
- The server route calls IFM K2, then passes the model's object through `sealReport`. A slug that is not in the lists cannot come back as a filed field.
- The sentence is not logged and is not an Arkiv attribute or payload.
- The key is `IFM_API_KEY` in `.env` only. `.env.example` has the name empty. `IFM_BASE_URL` is `https://api.ifm.ai/v1`. `IFM_MODEL` is `IFM/K2-Horizon-375B-A23B`.
- `npm run dev` serves `/api/assist` from `server/assist.ts`. `api/assist.ts` is the same call for a host that runs a server function and reads the key from the environment.
- The key was pasted into the chat on 16 October 2026. It should be rotated. It is not repeated in this file.

What the K2 calls actually did, from the development machine, with a synthetic sentence about Nashik, an RTO inspector, 700 rupees, and not paying:

- The model spends completion tokens on reasoning. A small `max_tokens` returns a truncated thought and no object. The call uses `max_tokens: 900`, `temperature: 0`, and `reasoning_effort: "low"`.
- Reasoning often continues into `content`, including a `</ifm|think>` marker. The parser reads the JSON after that marker.
- `response_format: { type: "json_object" }` sometimes still returns prose with no braces. The route tries once more, then tells the person to fill the lists.
- The same format sometimes returns `{"type":"object"}` before the slip. The parser keeps the object that has a state, district, department, or amount.
- The model returned `role: "inspector"` for the RTO. The only RTO roles are `motor_vehicle_inspector` and `clerk`. If the model's slug is contained in exactly one allowed slug, that slug is used. Otherwise `sealReport` rejects it.
- A prose fallback that scanned for the words "state" and "district" was tried and removed. It latched onto the echoed key list and produced `state: "district"`.
- An assistant-message prefill of `{`, and `reasoning_effort: "none"`, made the HTTP call fail. They are not used.
- One successful object, before the role repair, was Maharashtra / Nashik / RTO / inspector / driving licence / asked / 700 / a day in the previous week. "I did not pay" is outcome `asked` ("Asked, not paid"), not `refused`.

This is not written up as Arkiv friction. The friction file is for Arkiv calls. No product slip has been filed.

## 8. Assets and other people's code

CraftPix zips stay gitignored under `assets/*.zip`. The page ships cropped frames, the two building stamps, the road tile, and the two fonts.

The office scene (Phaser 3.90, pathfinding, wandering characters, doors) was adapted on 16 October 2026 from an MIT-licensed open-source project. Only the scene was taken, not its server, terminal, session store or plot. The notice that licence requires is in [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md).

Characters in that office are the premade 48×48 sheets. Their original labels were personal names. In the copied animation table those four labels were changed to Window, Counter, Queue, and Bench, so the scene does not introduce named people. The camera clear color in the copy was changed from the brown `#1a1814` to `#f4f4f2`, and the default zoom is lower when the canvas is under 800px wide.

## 9. Repository layout that this work added

| Path | Role |
| --- | --- |
| `src/App.tsx`, `src/Record.tsx`, `src/styles.css`, `src/scene/` | The running page. `Town.tsx` was removed when the office was mounted. |
| `src/lib/` | Week, labels, guard, aggregate, Arkiv client, query, wallet, write, format. |
| `src/scene/` | Copied office scene. Not mounted. |
| `server/assist.ts`, `api/assist.ts`, `vite.config.ts` | The assistant. The key stays on the server. |
| `scripts/seed.ts`, `scripts/query.ts` | The only writers and the CLI reader. |
| `test/rules.test.ts` | The contract tests. |
| `data/vocab.json`, `data/districts.json` | Closed lists. |
| `arkiv/schema.md` | The entity contract. |
| `arkiv/friction.md` | F1 and F2 only. |
| `docs/setup.md` | How to run the product. |
| `plan.md` | Original spec. |
| `.env` | Gitignored. Seed keys empty. Assistant key present. |
| `.env.example` | Names only. |

`package.json` dependencies include `@arkiv-network/sdk` ^0.8.1 (installed 0.8.1), `viem` ^2.37 (installed 2.37, resolved in this environment as 2.57.7 where the friction notes say so), `phaser` ^3.90.0, React 19, and Vite 7. Node used for the friction notes is v24.20.0.

## 10. Started, and not part of the running page

On the evening of 16 October 2026 the office scene was copied into `src/scene/` and the tiles, map, characters, door, emote, and cauldron sheets were copied into `public/`. Imports that pointed at the Next.js `@/` alias were rewritten to relative paths. `phaser` was added to `package.json`.

The page was switched over later the same evening. `App.tsx` mounts `PhaserGame`. `Town.tsx` was removed. Residents are spawned from the map seats. The interaction menu is "Hear the line" and "Walk on". A tap works when there is no keyboard.

## 11. Built the same evening

The five changes asked for on 16 October 2026 are in the page and in `arkiv/schema.md`. `plan.md` was edited in the same change.

1. The chrome is a light ground with black type, close to [nothing.tech](https://nothing.tech/). The pixel office stays pixel. The form uses a system sans.
2. The CSS town is gone. The office is the place.
3. A report is still one entity type. `kind` is `demand`, `failure`, `absence`, or `diversion`. Departments now include ration, health, and school. A demand stores whole rupees. The other kinds store a severity from 1 to 5 in the same `amount_inr` attribute, and the page says "severity". The bucket includes `kind`. There is still no street, no name, and no free text on Arkiv.
4. `redactText` runs before the assistant sees a sentence. It removes an email, an Indian mobile number, a long digit run, an honorific plus a name, "my name is" plus a name, and a room, ward, office, thana, or shop number. The note on screen names the category, not the value. `sealReport` still only accepts closed lists.
5. On a phone, the slip replaces the office. The office stays mounted on the town and slip views so it is not rebuilt on every tab. People walk, and every few seconds a bubble repeats the public line. That line is a quoted figure already on the board, or a fixed explanation when the board is empty. The timer does not call the model, and it does not repeat the sentence someone typed.

Also not done, from the start of the build: funding the four test wallets, running the seed, writing `arkiv/wallets.md`, a public deployment, the Devfolio form, and the demo video. The video has to be at most 3 minutes. The form questions are listed in `docs/submission-checklist.md`.

## 12. Decisions that should stay closed unless the spec is edited on purpose

- Synthetic data only. No real personal data, plaintext or hashed.
- One `report` entity until `arkiv/schema.md` and `plan.md` are changed together.
- Payload stays `{"v":1}`.
- Three distinct creators before a figure is quoted. Five slips from one wallet are one voice.
- The dead address owns the entity. The creator is the trust signal.
- 180 days, and one short-lived Pune row when the seed is eventually run.
- Seed keys and the assistant key stay in `.env`.
- Organiser copies stay unmodified.
- No gun sprites, no soldier walk cycle, no police attack or death frames.
- Do not commit, push, or seed unless that is asked for.

## 13. The overhaul of 16 October 2026 evening

Written after the work. The full reasoning and the loophole list are in [build-plan.md](build-plan.md). What changed, and what was found by running it:

- **Seed state, corrected.** Section 7 above says nothing had been written. That was stale. `arkiv/wallets.md` and `arkiv/seed-progress.json` hold the receipts: 48 reports across 12 districts from four team wallets. They are synthetic and the page labels them **demo**.
- **One read.** The page was making about 6 RPC calls per district view against an anonymous budget of about 100 queries an hour. It now makes one unscoped read of every report (48 rows, one page), caches it in `localStorage`, shows the last read at once, refreshes at most every 2 minutes, and computes districts, desks, the map and trends in the browser. `$createdAt` cannot be filtered (friction F5), so no delta query.
- **Live updates filtered.** The WebSocket fires for every entity on the shared chain, about 0.85 a second when counted. The page acts only on readonly, non-extendable events with a 180-day lifetime (friction F6).
- **New UI.** Radix (dialog, select, tabs, tooltip, toggle group, popover), cmdk for search, motion for counters and the feed, Lucide icons, Geist fonts, plain CSS tokens, light and dark. Phaser, the office scene and every tile and character sheet were removed from the build and moved to `.retired/` (gitignored). That also removes third-party art from a public MIT repo.
- **A fifth kind, `restriction`, on purpose.** Police only, role `public`, six services, severity 1 to 5. Reason: the documented pattern around the July 2026 Delhi march was permission denied, gathering bans, barricades, force and no accountability, and the custodian of any record of that is the pressure point. Left out: internet shutdowns (a statutory order register, not a district citizen report), any case file, any person, any seeded protest row. Seeding a claim about police conduct in a real district would be a fabricated allegation, so it is filed live in the demo.
- **`day` is no longer written.** A day plus a district plus a service can identify a reporter to the official. The writer picks a week. Old rows keep their `day`; readers ignore it.
- **No wallet needed.** The browser makes a throwaway key, `POST /api/drip` sends 0.02 test GLM, and the report is filed from that key. The `$creator` is the throwaway address, so the three-wallet rule still counts distinct creators. This is a flood damper, not Sybil resistance: one person can make three keys, and the UI says "wallets", not "people". "Use my wallet" remains.
- **Sentence parsed on the device.** `src/lib/parse.ts` fills the slip with no network call. The model route still exists but is not called by the page. `findPrivate` strikes out phones, Aadhaar with spaces, email, vehicle numbers, case numbers, PIN codes and a name after a title.
- **Checked by running it.** `npm test` 12 pass. `npm run verify` on a live report: owner dead, four writes reverted (friction F7). A full browser flow on Tiramisu: throwaway key, faucet, sealed in 15.8 s, delete reverted. A second browser saw the new row over the socket.
- **Phone bug found by driving it.** A `backdrop-filter` on the sticky header became the containing block of the fixed bottom nav and covered the Report button. Fixed.
- **README.** The organiser README was copied to `docs/challenge-brief.md` and `README.md` is now the project README, because the checklist requires setup steps in it.
- **Still open.** Deployment, the Devfolio form, the demo video, the Indian-nationality confirmation, rotating the IFM key that was pasted in chat, and an access key from hub.arkiv.network if the relay is wanted. `plan.md` still describes four kinds and the `day` attribute; this log and `arkiv/schema.md` win.

## 14. Dot map, office back, and a location check (16 October, later)

- **Dot map.** The tile grid was replaced by a dot map of India: one dot per half degree inside the state boundaries, 1,031 dots, 36 states and territories, coloured by reports and labelled with the state code. Generated by `scripts/build-geo.mjs` from DataMeet's state boundaries (CC BY 4.0). Ladakh is drawn apart from Jammu and Kashmir by a rough line; it is a drawing, not a boundary. A new report makes its state ripple.
- **Icon bug.** The kind badge on every desk card stacked its icon over its text. Cause: the badge's tone class `plain` collided with a list style also named `plain` that sets `display: grid`. Found by reading the computed style in a real browser. The tone class is no longer emitted for the default tone.
- **The office is back, as a tab.** `src/scene`, the map, the tilesets and the characters were restored. Phaser is pinned to 3.90 (`npm i phaser` pulled 4.2 and was rolled back) and loads only when the Office tab opens. The residents repeat figures already on the board, and a button opens that district. **Licence:** the art is LimeZu's Modern series, bought by the upstream author, and the upstream README tells users to bring their own. It is therefore gitignored (`public/tilesets`, `public/characters`, `public/sprites`), ships in the hosted build only, and the tab shows a note in a clone without it. The team should confirm the licence covers a public site. See [assets.md](assets.md).
- **A location check.** Written up in [verification.md](verification.md). A second entity type, `attestation`, written by a checker wallet, linked to its report by a `key` attribute, sealed the same way, trusted by `$creator`. The browser rounds the position to about 5 km on the device and warns about a wrong state before filing. The server compares it with DataMeet state polygons, checks the filing wallet's signature and a 30-minute window, and writes the attestation. The position is not stored. A check is a hint against remote trolls, not proof. State level only: district level needs boundaries we may redistribute.
- **Two tiers on a desk.** Quoted = 3 distinct wallets, unchanged. Corroborated = 3 wallets with a trusted location attestation. A toggle on the Pulse shows only corroborated desks. The seeded rows are demo wallets and are never checked, so the toggle is honestly empty until real reports arrive.
- **Checker wallet.** `0xabd68359A33fAb9A03Bb706B56272370A011E5b6`, key in `.env` as `ATTEST_KEY`, 0.5 test GLM from `SEED_KEY_1`. Listed in `data/attesters.json` and `arkiv/wallets.md`. Replace both if the key is ever rotated.
- **Checked by running it.** 16 tests pass. A browser at a Bengaluru position was stopped in 133 ms when filing for Maharashtra. A browser at a Pune position filed, was attested, and the check mark appeared on the board; `npm run verify` confirmed the attestation is owned by `0x…dEaD`. That test wrote one extra report (Pune water supply) and its attestation to the chain.
- **Ideas weighed and left out:** Anon Aadhaar, phone codes, DigiLocker, IP only, receipt photos. Reasons in verification.md.

## 15. Real cases instead of invented ones (16 October)

The team asked for the board to be seeded from real reports between 9 October and today, not from the invented rows.

- **Researched, then re-read.** Three research agents searched news for restrictions, bribe cases, and service failures dated 9 to 16 October. I re-fetched the articles behind every record that was written (date, district, figure) before it went on chain. Items I could not confirm, or that needed a loose mapping, were left out: nine bribe cases that did not fit the closed lists, a force-on-journalists item whose location the source did not give, and a dozen single-outlet shortage reports I could not read twice. The yield is thin and skewed to Uttar Pradesh because the articles that could be dated and read were mostly from one Hindi-language outlet's English-slug pages.
- **26 records written** by a new curator wallet: 12 restrictions (Delhi, Noida, Mumbai, Chennai, Bengaluru), 2 bribe traps (Balangir, Barnala), and 12 failures, absences and diversions in 9 districts. List with article links: [press-records.md](press-records.md).
- **Press is not a citizen voice.** A report written from an article carries `source = press`, is believed only from the curator wallet, never counts toward the 3-wallet figure, and is shown in its own section with its articles. Reason: if one wallet could stand for three, a news item would fake the "3 citizens reported" claim the product rests on. The cost is that the board has no quoted desks until real citizens file.
- **The invented rows are hidden, not deleted.** They are sealed: nobody, including us, can delete them, and they expire in 180 days. The page now hides every row from the four seed wallets and the three test wallets by default, with a switch to show them, labelled "demo". The press section invites citizens to add their own report to each incident ("Were you there?").
- **Closed lists grew by what the news needed:** role `revenue_inspector`, service `land_conversion`, and twelve districts that were missing (Surajpur, Kannauj, Sitapur, Hardoi, Balrampur, Bijnor, Rampur, Fatehpur, Gautam Buddh Nagar, Ratlam, Balangir, Barnala).
- **What this is not.** Not a finding about any office or person. A press-sourced report says an outlet reported an incident of this type in this district in this week. Some figures are contested between outlets and say so in the note.
- **Read-back, later.** Once the budget recovered, `npm run audit` read 77 entities: 76 valid reports (50 older, 26 press) and 1 valid attestation, none outside the schema. A raw count of underthetable entities owned by the dead address returned 77, equal to the number that exist.
- **Read budget.** Right after the 26 writes the public RPC refused the next query. That is the anonymous budget the whole read path was designed around; see friction F11.

- **Office art, later.** The team confirmed it holds the LimeZu licence, so the three art folders are no longer gitignored (see assets.md for the one clause to check before the repo goes public).

## 16. Fake reports, personal data, and the pitch (16 October, night)

The team asked for a sharper pitch and for every protection we can build against fake reports and against personal data reaching Arkiv. Pitch and demo script: [pitch.md](pitch.md). Threat model: [abuse-model.md](abuse-model.md).

- **The gap I found in our own design.** The privacy guard lived in the browser. A modified client can write any value or a note in the payload straight to a public chain, and it cannot be removed. The page would have displayed it. Now every reader refuses anything that is not a valid, sealed report ([validate.ts](../src/lib/validate.ts)); the attestation schema rejects a position field; `npm run audit` checks the whole chain, payload included. 24 tests, including one per kind of hostile input.
- **Signals, not verdicts.** A desk shows its range; an amount four times off the median is tagged outlier; three wallets whose reports landed within ten minutes are marked "filed in a burst"; a citizen desk and a press report in the same district, kind, service and week are cross-marked ("Also in the press", "N citizen wallets reported the same"). None of these hides or deletes anything.
- **What I did not build:** proof-of-work on the faucet (a speed bump, not a defence), a reputation score (needs history we do not have), a moderation queue (a censor), and Anon Aadhaar (see verification.md).
- **Deployable as shipped.** The server routes are bundled into plain JavaScript in `api/` (`npm run build:api`, committed), because I could not test how Vercel resolves `.ts` imports. Each bundle was called directly with a fake request: the snapshot returned 76 rows, bad input was rejected, a write method was refused. A Hub access key is read from `ARKIV_ACCESS_KEY`, sent as `X-API-KEY` only to an arkiv.network address, and absent from the browser. The snapshot refreshes at most every five minutes so a key's 1,000,000-unit month (about 10,000 queries) lasts. `docs/deploy.md` has the steps. `npm run wallet` makes and funds keys without printing them.
- **Added for resilience:** a one-file mirror (`public/mirror.html`), copy-paste curl commands on the Sealed page, a Hindi and English toggle for the core flow (navigation, first screen, report form, receipt, kinds, outcomes, departments; services and districts stay in English, and the sentence box reads English only). Left: offline queue, replay, corrections as new entities.
- **The first screen** now says what the board has: sealed reports, districts, press reports, citizen wallets. The "0 quoted desks" tile is gone; a desk figure appears in its own section once three citizens agree.
- **Hardened after comparing with a public PII filter from another team's repository.** That filter normalises non-ASCII digits, blanks dates and clock times, catches a 10-plus digit run with separators, UPI handles and emails spelled out, and Hindi honorifics. Ours missed Hindi digits and UPI. `findPrivate` now does all of it, with tests. It also flags the word "Aadhaar"; ours does not, because the sentence never leaves the device.
- **A snapshot route for judges.** The public RPC allows about 100 queries an hour per caller, so every judge loading the page was a risk. `/api/snapshot` reads Arkiv once, validates with the same code, serves it from memory for two minutes, and serves the last good answer if Arkiv refuses. The page uses it first and falls back to reading directly. Verified: the page loaded with zero direct RPC calls. A switch in the footer reads directly instead.
- **Look back.** The Record can read the chain as of an earlier block and check that every row seen then is still there (49 of 49 an hour ago). Entities are sealed, so history is a subset of the present; Arkiv's own historical query is what proves it (friction F16).
- **Friction with reproductions.** `npm run repro` reproduces F5 and F13 to F15 against the live chain and writes nothing.
- **A defect found by driving the page:** the Press badge sat inside the feed row's button, so tapping it opened the district sheet instead of the sources. It now sits beside the time.

## 17 October 2026

- **Internet shutdowns and rights violations are in scope.** The product records what an authority did with a public power for something other than the public. A bribe, a missing doctor and a closed network are the same failure. `restriction` now has twelve services (custody, journalists, evictions, demolitions, shutdowns, blocking, plus the earlier six) and a department `administration`. Severity is the same 1 to 5 scale. A shutdown is recorded as a citizen's account of losing the network, not as the order itself.
- **A pin is allowed only on broken public infrastructure.** Exact place plus a week can identify a person, so only potholes, streetlights, drains, garbage and broken roads may carry `lat_e5` and `lon_e5`. The writer and the reader both enforce it. A pin outside India, or not within one dot of the report's state, is refused.
- **Human check without identity.** Before the faucet funds a throwaway key, the browser proves it is driven by a person: Turnstile if the host configures it, otherwise a signed 16-bit proof of work. 18 bits took 4.4 seconds in pure JavaScript on a desktop, which would be too slow on a phone. It is a price on a flood, not proof of a unique human, and the interface says so.
- **Press records now cover 2 to 17 October.** 36 more were written after two independent agents re-read every article and corrected eleven. One record was dropped because every source URL contains a victim's full name.
- **Illustrations are original SVG.** The Lottie pack the team wanted could not be licensed or downloaded here, so eight small animated drawings (envelope under a table, car over a pothole, empty shelf, leaking sack, blocked megaphone, shutdown signal, lock, magnifier) were drawn from scratch. They are CSS-animated, need no library and stop under reduced motion.
- **No filing receipt screenshot.** Filing writes a permanent public entity; a picture is not a reason to add one.

- **The Office tab was removed.** It was a pixel office on its own tab, unrelated to recording anything. It cost a 1.2 MB library, art that was not ours to license in a public repository, and code adapted from another project. The idea it stood for (the ledger is always being written to) is shown where it is true: the live feed and the live dot on the Pulse. Removed with its art, its scene code, Phaser and the pixel font.
- **A theme toggle.** The page followed the system theme with no way to change it. There is now a sun/moon button in the header; the choice is saved on the device and applied before first paint.
- **A defect found on the deployed site.** Map tiles showed OpenStreetMap's "Access blocked" because the site sent `Referrer-Policy: no-referrer` and OpenStreetMap's tile policy requires a referrer. The tile layers now send the origin only. It had worked on localhost, which is why tests did not catch it.

- **Reporters bring their own wallet.** A single faucet wallet paying for everyone is the first thing that breaks under load (one wallet cannot have two transactions in flight, and it holds a finite amount). So the main path is now a connected browser wallet: the person pays about 0.0002 test GLM, nothing of ours is in the way, and `$creator` is their address. The one-tap throwaway key stays for people with no wallet. The form defaults to the wallet when the browser has one, adds the Tiramisu network, shows the balance, and points to the faucet when it is too low.
- **The faucet is sturdier, not unlimited.** It sends 0.005 test GLM a key (enough for about thirty reports, down from 0.02), uses several wallets in random order, and sends from each wallet one transaction at a time, handing over to the next on a nonce or funds error. Eight simultaneous top-ups all succeeded. Not done, and needing an outside account or store: shared rate limits across serverless instances, Cloudflare Turnstile keys, and a production network with real gas.
