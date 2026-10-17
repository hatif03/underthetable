# under the table

**A district ledger of what Indians are charged, what is broken, and which rights were restricted. Name-free, and once it is written, nobody can delete it, including us.**

<p align="center">
  <a href="https://underthetable.vercel.app"><img src="docs/media/corruption-animation.gif" alt="An animation: a blindfolded figure of justice holding scales, with hands pushing cash toward her from every side" width="640"></a>
</p>

<p align="center">
  <a href="https://underthetable.vercel.app"><b>Open the live app</b></a> ·
  <a href="docs/submission.md">Hackathon submission</a> ·
  <a href="docs/what-is-recorded.md">What can be recorded</a> ·
  <a href="arkiv/schema.md">Schema</a> ·
  <a href="arkiv/friction.md">Friction report</a> ·
  <a href="docs/screenshots/README.md">All screenshots</a>
</p>

Built for the Arkiv Global Tour Stop (9 to 18 October 2026) on the Tiramisu testnet. Tracks: **Best Indian Use Case** and **Censorship Resistance**. MIT licensed.

---

## "History is a set of lies agreed upon"

A line usually attributed to Napoleon, who credited it to someone else (it goes back to Fontenelle in 1724, per [Quote Investigator](https://quoteinvestigator.com/2016/07/05/fable/)). Whoever said it, the point holds: the version of events that survives is the version somebody was able to keep.

India, in the last fortnight:

- **10 and 11 October.** Mass detentions in Delhi around the protests over the voter-roll revision. Mobile internet suspended for 24 hours across central Delhi. At least **43 journalists** detained or assaulted (CPJ). Criticised by the UN human rights office, Human Rights Watch, Amnesty, RSF and CIVICUS.
- **12 and 13 October.** The capital's main protest venue de-notified, and people who entered it detained.
- **15 and 17 October.** A man declared dead after being taken from a police station in Birbhum. Bulldozers in Assam's Hojai and Golaghat against 211 families.
- **Every day.** Water cut for weeks in Kashmir, farmers besieging substations in Telangana, absent doctors in Uttar Pradesh, ₹3,000 taken to enter a land record in Haryana.

And the people who record this lose their records. **bribes.fyi**, an anonymous bribe tracker, got 600+ reports and five million requests in 48 hours in August 2026, then closed on 18 August with a notice that included "the permanent deletion of any recorded data" ([ThePrint](https://theprint.in/feature/bribes-fyi-anti-corruption-site-aryan-nishad/3018441/)). The operator of a table is the one place a notice, a threat or a bill can reach.

India recorded **65 internet shutdowns in 2025, second only to Myanmar** (Access Now). It scores **39/100 and ranks 91st of 182** on the Corruption Perceptions Index. Nearly **7 in 10** businesses in a 9,000-business survey had paid a bribe in the past year.

**under the table puts a second copy of the record somewhere the party it is about cannot reach, and makes it cheap to check.**

---

## What you can document

<table>
<tr>
<td width="55%"><img src="docs/screenshots/03-what-can-be-documented.png" alt="Six categories with animated drawings: demand, failure, absence, diversion, rights violation, internet shutdown"></td>
<td>

| | |
| --- | --- |
| **Demand** | ₹700 asked for a driving licence |
| **Failure** | A pothole, a dead streetlight, no water, no power |
| **Absence** | A clinic with no doctor, a school with no meal |
| **Diversion** | Ration grain that arrived short |
| **Rights violation** | A detention, a journalist stopped, a home demolished, a custody death |
| **Internet shutdown** | A district cut off from the network |

</td>
</tr>
</table>

5 kinds, 13 departments, 52 services, 36 states and union territories, 338 districts. Nothing is free text. [Every kind, desk, field, and why each is an Arkiv attribute.](docs/what-is-recorded.md)

You say it in a sentence or three taps. Nothing about you is stored: a district, a week, a desk and a number go on a public chain, and the record is handed to an address nobody holds.

| | |
| --- | --- |
| ![The Pulse: totals, categories, dot map and live feed](docs/screenshots/01-pulse.png) | ![Report form: a pothole with the exact pin and the public summary](docs/screenshots/08-report-form-pin.png) |
| **The Pulse.** What is being recorded, where, as it is sealed. | **Report.** Say it in a sentence; it is read on your device. Everything that becomes public is shown before you file. |
| ![Map: pinned problems and the Arkiv range query](docs/screenshots/07-map-arkiv-range-query.png) | ![A rights violation read from a sentence](docs/screenshots/09-report-form-shutdown.png) |
| **The map.** Drop a pin on a broken thing. "Search this view on Arkiv" is four range predicates the chain answers itself, printed on the page. | **Rights and shutdowns.** "Mobile internet was shut down in New Delhi" fills the slip, on the device. |

More: [press records](docs/screenshots/05-press-records.png) · [the Record and "Look back"](docs/screenshots/10-record.png) · [how it is sealed](docs/screenshots/11-sealed.png) · [Hindi](docs/screenshots/13-pulse-hindi.png) · [on a phone](docs/screenshots/14-pulse-mobile.png) · [the one-file mirror](docs/screenshots/16-mirror.png).

---

## How it works

**One transaction creates a report and hands it to `0x…dEaD`.** If the transfer cannot be included, the whole batch reverts, so a deletable report never exists. `$owner` is an address nobody holds; the entity is `readonly`; it cannot be extended past its 180 days. Watch yourself fail to delete your own report on the receipt.

**What is on chain:** state, district, department, a role *title* (never a person), service, outcome, a rupee amount or a severity from 1 to 5, an ISO week, and, for a broken public thing, an optional pin. **What is never recorded:** a name, a phone number, an email, a street, a photograph, a free-text story, the exact day, or the position of the person who reported.

**How a number becomes believable without a person on chain:**

- A desk shows a figure only when **3 different wallets** reported it. Five slips from one wallet are one voice.
- An optional **location check**: a checker wallet vouches that the filer was inside the state, and stores only the word "inside".
- A **press curator** wallet writes labelled, sourced records from published news. They seed the board, link their articles, and **never count as a citizen**.
- A **human check** before the faucet funds a throwaway key (Cloudflare Turnstile, or a signed proof of work).
- A public chain cannot be cleaned, so **every reader refuses what is off the closed lists**: the page, the CLI, the audit and the one-file mirror apply one rule.

Honest limits, stated on the page: a wallet is a pseudonym, three wallets are not three people, a phone can fake a position, a press record is a curator's reading of an article. Citizen reports, not findings.

---

## Why Arkiv

| If it were... | What breaks |
| --- | --- |
| **Postgres, behind our API** | We hold the `DELETE`. The only promise becomes "trust us". bribes.fyi is the proof. |
| **IPFS** | A hash cannot answer "this district, this week, severity at least 3, inside this rectangle", has no expiry, and no creator. |
| **A subgraph** | Indexes a chain that holds the data elsewhere, enforces nothing, and is a server we run. |

What only Arkiv gives, in one write: attributes you can range-query (`u64` amounts, `i32` coordinates), an owner nobody holds, `readonly`, Entity Expiration, a chain-set `$creator` to trust, and `atBlock` history that proves a sealed row was never edited. [The full argument with commands](docs/submission.md#c-why-arkiv) · [13 features, each with where it lives and how to check it](docs/arkiv-usage.md).

---

## Try it

**In the browser, in a minute: https://underthetable.vercel.app**

1. Open the **Map** tab, switch on the demo pin, press **Search this view on Arkiv**.
2. Press **Report**. Type "Last week in Nashik there is a deep pothole near the bus stand", drop a pin, file. The receipt shows `$creator`, `$owner` (`0x…dEaD`), the human check and the location check. Press **Try to delete it**.
3. Open [`/mirror.html`](https://underthetable.vercel.app/mirror.html): one file, no server of ours, reads Arkiv directly. It still works if our site does not.

**From the terminal (no website; the read-only commands need no wallet):**

```bash
git clone https://github.com/hatif03/underthetable && cd underthetable && npm ci
npm run query -- --district nashik   # the same predicates the page uses
npm run audit                         # every entity on Tiramisu against the closed lists; expect "outside the schema: 0"
npm run repro                         # friction entries F13, F5, F14, F15 against the live chain (writes nothing)
npm test                              # 32 tests: the rules, parser, PII tripwire, quote rule, pins, the human check
```

[Step-by-step for judges](docs/submission.md#g-how-can-judges-reproduce-our-arkiv-usage) · [terminal output of query, audit, verify and repro](docs/screenshots/README.md).

---

## Docs

| | |
| --- | --- |
| [submission.md](docs/submission.md) | The hackathon answers: problem, challenges, why Arkiv, wallets, reproduction, the one thing to improve |
| [devfolio-form.md](docs/devfolio-form.md) | Every Devfolio field mapped to an answer |
| [what-is-recorded.md](docs/what-is-recorded.md) | Everything a person can document, field by field |
| [arkiv/schema.md](arkiv/schema.md), [arkiv/friction.md](arkiv/friction.md), [arkiv/wallets.md](arkiv/wallets.md) | The data contract, 18 friction entries from real calls, every wallet and its role |
| [arkiv-usage.md](docs/arkiv-usage.md) | Arkiv feature by feature |
| [verification.md](docs/verification.md), [abuse-model.md](docs/abuse-model.md) | How a claim is checked, and what stops fakes and personal data |
| [press-records.md](docs/press-records.md) | The 62 sourced press records and their articles |
| [ai-agent.md](docs/ai-agent.md) | Is there a genuine use for an AI here? One, narrow, advisory |
| [pitch.md](docs/pitch.md), [deploy.md](docs/deploy.md), [decisions.md](docs/decisions.md) | The pitch and demo script, deploying, the decision log |
| [build-plan.md](docs/build-plan.md), [assets.md](docs/assets.md) | Build plan and loopholes found; art and data credits |

---

## Run it yourself

Node 20 or newer.

```bash
npm install
npm test            # 32 tests
npm run dev         # http://localhost:5173
npm run build:api   # rebuilds api/*.js from server/handlers (committed; Vercel runs them as they are)
npm run build       # type-checks, then builds to dist/
```

The page reads Tiramisu directly; no key is needed to read. To file from the page with no wallet, the dev server needs funded keys:

```bash
cp .env.example .env     # fill DRIP_KEY (or SEED_KEY_1) and ATTEST_KEY, a funded key whose address is in data/attesters.json
```

Tiramisu testnet: chain ID `7738577`, HTTP `https://rpc.tiramisu.db-chain.testnet.arkiv.network`, WebSocket `wss://rpc.tiramisu.db-chain.testnet.arkiv.network`, explorer <https://tiramisu.explorer.arkiv.network>, gas token test GLM, faucet <https://hub.arkiv.network/faucet>. SDK `@arkiv-network/sdk` 0.8.1.

More commands:

```bash
npm run query -- --district nashik --min-inr 500
npm run query -- --created-by 0x13398a1803eCa909D909193F1547FfFc1e05eF4F
npm run verify          # patch, delete, extend on a live report and an attestation: all must fail (needs a team key)
npm run seed:press      # writes data/press-records.json to Arkiv from PRESS_KEY (add -- --dry to only check the guard)
npm run seed:pin        # writes one demo map pin (needs FLOOD_KEY)
npm run catalog         # regenerates docs/what-is-recorded.md from the vocabulary
npm run screenshots     # retakes docs/screenshots from a running dev server (reads only)
npm run ai:check        # optional: a language model re-reads cited articles against the records (needs IFM_API_KEY; advisory only)
```

### Where the keys live

- `SEED_KEY_1..3`, `FLOOD_KEY`, `DRIP_KEY` are read from `.env` by scripts, the dev server and the `api/` functions. They are never imported by `src/` and never reach the bundle.
- `ARKIV_ACCESS_KEY` is a Hub access key, server side only, sent as `X-API-KEY`. Never a `VITE_` variable.
- `PRESS_KEY` is the press curator wallet. It writes `source = press` reports only. `ATTEST_KEY` is the checker wallet. It writes attestations only.
- `TURNSTILE_SECRET` and `HUMAN_SECRET` (optional) belong to the human check; without them a signed proof of work is used.
- The browser makes a throwaway key for a person with no wallet and keeps it in `localStorage`. It holds a few cents of test GLM. "New identity" drops it.

### Layout

```text
src/state/store.ts      one snapshot of every report, cached, live over WebSocket
src/lib/                guard (PII, pins), parse (local), write (batch), query, aggregate (quote rule), validate, identity, human
src/views/              Pulse (dot map), Map (Leaflet pins), Office (Phaser, lazy), DistrictSheet, FileSheet, Record, Sealed, Palette
src/ui/                 Radix-based kit, original animated illustrations
scripts/                seed, query, audit, verify, repro, catalog, screenshots, ai-check
server/ api/            faucet, human check, location checker, read relay (all server-side)
data/                   closed vocabularies, districts, the press records
arkiv/                  schema, friction, wallets
docs/                   submission, what is recorded, screenshots, media
```

## Licence

MIT. See [LICENSE](LICENSE). Fonts: Geist and Press Start 2P (OFL). Icons: Lucide (ISC). UI primitives: Radix. State boundaries: DataMeet India (CC BY 4.0). Map tiles: © OpenStreetMap contributors. Office art: LimeZu, used under the team's licence. Office scene code adapted from an MIT-licensed project, see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). The animation at the top is a stock animation downloaded by the team and is **not** covered by the MIT licence; see [docs/assets.md](docs/assets.md).
