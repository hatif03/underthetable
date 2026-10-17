# Devfolio form: every field, ready to paste

Prepared 17 October 2026 against the organiser's pinned requirements (`prepare_devfolio`, canonical repository `Arkiv-Network/global-tour-stop-pre-devcon` at commit `4f912d1fa595125621962c053a9f36fdcfca5a54`; rules frozen 9 October 2026). Deadline **18 October 2026, 23:59 London (22:59 UTC)**. Keep the deployment up until 23 October, 18:00 London. The long answers are in [submission.md](submission.md); this file maps them to the 18 questions and the track criteria. Items marked **YOU** are facts only the team can state.

Base for code links: `https://github.com/hatif03/underthetable/blob/main/`

## Standard fields

| Field | Answer |
| --- | --- |
| Project name | underthetable |
| Tagline | A district ledger of what Indians are charged, what is broken, and which rights were restricted, that nobody can delete, including us. |
| Project links | Repo https://github.com/hatif03/underthetable · Live https://underthetable.vercel.app · **YOU:** demo video, 3 minutes or less ([pitch.md](pitch.md) has the script) |
| The problem it solves (required) | [submission.md, section a](submission.md) |
| Challenges I ran into (required) | [submission.md, section b](submission.md) |
| Tracks | **Best Indian Use Case** (needs an Indian-national team member), **Censorship Resistance (Global)**, and, if you want a third, **Privacy (Global)**. One prize per team at most. Each selected track is judged on four 25-point criteria: its own first criterion, plus Why Arkiv, How you use Arkiv, and the Friction report. The first criterion answers are at the bottom of this file. |

## The 18 questions

1. **Live app URL.** https://underthetable.vercel.app
2. **Does any team member hold Indian nationality?** **YOU.** Answer truthfully. Best Indian Use Case is only awarded to a team with at least one Indian national.
3. **Why Arkiv?** [submission.md, section c](submission.md): the table of what breaks with Postgres, IPFS, a subgraph and our own API, and the eight advantages that exist only because of Arkiv, each with a command that proves it.
4. **How do you use Arkiv? (feature, how, why, link to code).**
   - **Typed attributes and a constant payload** (`str`, `u64`, `i32`, `key`): everything a reader filters on is an attribute; the payload is `{"v":1}` so no name can hide in it. [`src/lib/write.ts`](https://github.com/hatif03/underthetable/blob/main/src/lib/write.ts), [`src/lib/guard.ts`](https://github.com/hatif03/underthetable/blob/main/src/lib/guard.ts)
   - **`predictEntityKeys` + `executeBatch` with `ownershipChanges`**: create and hand to `0x…dEaD` in one atomic transaction, so a deletable report never exists. [`src/lib/write.ts`](https://github.com/hatif03/underthetable/blob/main/src/lib/write.ts), [`server/attest.ts`](https://github.com/hatif03/underthetable/blob/main/server/attest.ts)
   - **`readonly: true`, `permissionlessExtension: false`**: nobody can edit an amount or pin an accusation past its life. [`src/lib/write.ts`](https://github.com/hatif03/underthetable/blob/main/src/lib/write.ts), proved by [`scripts/verify.ts`](https://github.com/hatif03/underthetable/blob/main/scripts/verify.ts)
   - **Entity Expiration (180 days)**: records leave queries on their own, with no job and no delete button. [`src/lib/write.ts`](https://github.com/hatif03/underthetable/blob/main/src/lib/write.ts)
   - **`$creator` and `$owner`**: trust by creator address (citizens count as one wallet; the checker's attestations and the press curator's rows are believed by address alone). [`src/lib/query.ts`](https://github.com/hatif03/underthetable/blob/main/src/lib/query.ts), [`src/lib/aggregate.ts`](https://github.com/hatif03/underthetable/blob/main/src/lib/aggregate.ts)
   - **Queries: `eq`, `gte`, `lte`, `createdBy`, cursor, `select` with payload**: one read builds the page; the CLI runs the same predicates. [`src/lib/query.ts`](https://github.com/hatif03/underthetable/blob/main/src/lib/query.ts), [`scripts/query.ts`](https://github.com/hatif03/underthetable/blob/main/scripts/query.ts)
   - **Range queries on `i32` attributes**: the map's "Search this view on Arkiv" is four `gte`/`lte` predicates on `lat_e5`/`lon_e5`. [`src/lib/query.ts`](https://github.com/hatif03/underthetable/blob/main/src/lib/query.ts) (`fetchInBox`), [`src/views/MapView.tsx`](https://github.com/hatif03/underthetable/blob/main/src/views/MapView.tsx)
   - **`atBlock` historical queries**: the Record's "Look back" proves a sealed row was never edited. [`src/views/Record.tsx`](https://github.com/hatif03/underthetable/blob/main/src/views/Record.tsx)
   - **Entity-key reference (`key(...)`) and two entity types in one query**: a location attestation points at its report. [`server/attest.ts`](https://github.com/hatif03/underthetable/blob/main/server/attest.ts)
   - **WebSocket `watchEntityEvents`**: live rows, filtered by `creationFlags` and lifetime because events carry no attributes. [`src/state/store.ts`](https://github.com/hatif03/underthetable/blob/main/src/state/store.ts)
   - **Raw JSON-RPC (`arkiv_query`, `arkiv_getEntityCount`)**: a one-file mirror and `curl` read the chain with no server of ours. [`public/mirror.html`](https://github.com/hatif03/underthetable/blob/main/public/mirror.html)
   - **Access key (`X-API-KEY`)**: server-side only, for the shared snapshot. [`server/snapshot.ts`](https://github.com/hatif03/underthetable/blob/main/server/snapshot.ts), [`server/rpc.ts`](https://github.com/hatif03/underthetable/blob/main/server/rpc.ts)
   - **Reader-side validity**: a public chain cannot be cleaned, so every reader refuses what is off the closed lists. [`src/lib/validate.ts`](https://github.com/hatif03/underthetable/blob/main/src/lib/validate.ts), [`scripts/audit.ts`](https://github.com/hatif03/underthetable/blob/main/scripts/audit.ts)

   The full table with a "check it" column is [docs/arkiv-usage.md](arkiv-usage.md).
5. **Friction report.** https://github.com/hatif03/underthetable/blob/main/arkiv/friction.md
6. **Wallet addresses and roles.** [submission.md, section e](submission.md) (press curator, location checker, three demo creators, flood demo and the pin, three test browser keys, the faucet that creates nothing, and visitors' throwaway keys). Details: [arkiv/wallets.md](../arkiv/wallets.md).
7. **Schema.** https://github.com/hatif03/underthetable/blob/main/arkiv/schema.md
8. **How can judges reproduce?** [submission.md, section g](submission.md).
9. **Pre-existing work reused.** Suggested wording, edit if any of it is wrong: *"None of the application or Arkiv integration was written before 9 October 2026; the repository was started on 16 October 2026 and its first commit is `910bf69e139068d006c7fa78849d35ab3b672307`. Third-party work that is disclosed: the Phaser office scene (map loader, pathfinding, wandering characters, doors) is adapted from an MIT-licensed open-source project, with its licence in THIRD_PARTY_NOTICES.md; the office pixel art is LimeZu's Modern Interiors and Modern Office packs, used under the team's licence; state boundaries are DataMeet India's (CC BY 4.0); fonts Geist and Press Start 2P (OFL); icons Lucide (ISC); UI primitives Radix; map tiles OpenStreetMap contributors. Libraries and frameworks: Vite, React, Phaser, Leaflet, viem and the Arkiv SDK."*
10. **Arkiv surfaces used.** TypeScript SDK (0.8.1) · Direct JSON-RPC · WebSocket events · Docs · Hub (access key) · Faucet · Access keys · Block Explorer · Arkiv MCP · Arkiv skills · Arkiv Plugin. (Tick only what the team actually used; Data Explorer is not claimed.)
11. **If Other.** Not needed.
12. **How long until the first Arkiv entity?** The first entity was written at 13:16 UTC on 16 October 2026 (tx `0xeeebd142ce5f50aca6c5d20fe05b04083d30f55441a7cfe2e7ea2561b3e069c3`). The project folder was created about 09:40 UTC the same day, so the answer is most likely **2 to 24 hours**. **YOU:** confirm your own start time.
13. **Which LLMs?** Claude (via Claude Code; Claude Sonnet 5.5 for most of the build, plus Claude subagents for news research and fact-checking). The IFM K2-Horizon model was used only in an optional maintainer script, `scripts/ai-check.ts`, which is advisory and writes nothing to Arkiv, and in an unused, undeployed form-assist route.
14. **One thing Arkiv should improve first.** [submission.md, section h](submission.md): make read limits legible and survivable (a JSON error that names the limit, the remaining budget and `Retry-After`, with a pointer to access keys, and an access key in the quickstart's first query).
15. **Open to a 20-minute feedback call?** **YOU.**
16. **Team's work, built 9 to 18 October, third-party work disclosed.** Tick, after reading the note below about the commit history.
17. **Public MIT repo, every link accessible.** Tick after opening every link from a private window: the repo, the live app, the two GitHub file links, the explorer links, the video.
18. **Devcon 8 in Mumbai.** Optional. **YOU.**

## Something you must know before ticking 16 and 17

The git history contains `scripts/split-commits.ps1`, a one-off script that split the working tree into commits with **randomised dates between 14 and 17 October 2026**. Several commit timestamps are therefore not the real times of the work, and some are out of order. All of them fall inside the build window, so no pre-9-October work is being hidden, but they are not honest timestamps. The organiser records the SHA at the deadline and says not to rewrite history afterwards, so **do not rewrite it**. Be straightforward instead: in question 9 or 16, say the repository's real start was 16 October 2026 and that the early history was split into commits after the fact, which is why the commit dates are not reliable. The chain timestamps (first entity at 13:16 UTC on 16 October) are the real record.

## Track criteria (the first of the four 25-point criteria)

### Why India? (Best Indian Use Case)

- **A real, named problem at national scale.** India scores 39/100 and ranks 91st of 182 on the 2025 Corruption Perceptions Index (Transparency International). In a LocalCircles survey of 9,000+ businesses in 159 districts, nearly 7 in 10 had paid a bribe in the last year. India recorded 65 internet shutdowns in 2025, second only to Myanmar (Access Now).
- **Demand proven by the thing we replace.** bribes.fyi, an anonymous bribe tracker, got 600+ reports and 5 million requests in 48 hours in August 2026, then closed on 18 August and announced "the permanent deletion of any recorded data" (ThePrint). That is the failure mode we remove.
- **Right now.** The 10 and 11 October protests in Delhi: a 24-hour mobile internet suspension, mass detentions, 43+ journalists detained (CPJ), criticised by the UN human rights office, HRW, Amnesty, RSF and CIVICUS; Section 163 orders; a protest venue de-notified; evictions in Assam on 17 October. 62 sourced records of this fortnight are on Arkiv, each with its articles.
- **Built for how India reports.** District as the unit (338 districts), Hindi and English, 5 departments of ordinary life (RTO, revenue, ration, health, school), a sentence parsed on the device, mobile-first at 390 px, no account.
- **Named users.** A person renewing a licence; a family that relies on a health centre; a journalist covering a protest; a lawyer who needs a district-and-week record.
- **Honest limit.** There are zero real citizen reports yet. The board is seeded with labelled press records, and the page says so.

### Why this pillar? (Censorship Resistance)

- The adversary is the **custodian**: whoever can be pressured to delete the record. Our one transaction creates a report and hands it to `0x…dEaD`, so even the authors cannot edit or delete it; 113 of 113 valid reports on chain are owned by that address (`npm run audit`) and four write attempts all fail (`npm run verify`).
- It **survives our own site**: `public/mirror.html` and `curl` read the record directly from Arkiv.
- No **moderator or admin** exists who could be told to empty a queue. The expiry is automatic (180 days), not editorial.
- A rival cannot **pin or amplify** a record: `permissionlessExtension: false`.
- Honest limit: a public chain cannot erase abusive content either, so the reader refuses anything off the closed lists, and the vocabulary has no free text.

### Why this pillar? (Privacy), if you select it

- No names, no free text, no photos, no day (only an ISO week), no position of the reporter, and no account.
- The sentence is parsed on the device and never sent; a tripwire strips phone numbers, emails, UPI handles and honorifics, in Latin and Hindi digits.
- Pins are allowed only for broken public infrastructure and refused for anything that could identify a person.
- Honest limit: a wallet is a pseudonym; three wallets are not three people; a throwaway key is still linkable to its other reports.
