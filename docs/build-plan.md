# Build plan: the live, usable underthetable

Written 16 October 2026, 19:30 IST, two days before the 18 October 23:59 London deadline. Companion to [plan.md](../plan.md) (product spec), [arkiv/schema.md](../arkiv/schema.md) (data contract) and [decisions.md](decisions.md) (log). Where this file changes the spec, it says so, and the same change is made in the schema and the log.

## 1. Is the protest and police idea worth building, and does Arkiv justify it?

**Verdict: yes as a narrow, closed-list kind inside this product. No as a case file.**

Evidence that the problem is real, from the Amnesty investigation of the July 2026 Delhi and Siwan march: permission denied, an order banning gatherings of more than five people, barricades and metro closures, an internet shutdown, force used on a crowd, and a month later no officer held accountable. Delhi Police called pellet reports "completely false and misleading" and warned of legal action against people "spreading rumours". (OHCHR and the NYT page could not be fetched: 403 and blocked. Not cited.)

Why Arkiv is a real answer, not a label:

| Harm today | What Arkiv gives |
| --- | --- |
| The custodian is the pressure point. A takedown order, a legal notice, or fear gets a table deleted. bribes.fyi did it on 18 August 2026. | After the batch, `$owner` is `0x…dEaD`, `readonly` is on. We cannot delete a row even when ordered to. |
| A claim about a district has to be countable by anyone, without our API. | Closed-list attributes and compound queries. A reader recomputes the figure from the public RPC. |
| A permanent accusation is its own harm. | Entity Expiration (180 days) and the quote rule: nothing is a headline until 3 different wallets wrote the same desk in the same week. |
| A reporter can be identified. | Nothing but closed slugs and a week goes on chain. No name, no photo, no street, no day. |

What Arkiv does **not** give, and the product must not claim:

- A wallet is a pseudonym, not anonymity. The same address on every report links them. Mitigation: a per-device throwaway identity with a one-tap "new identity", and a faucet that does not log.
- Three wallets are not three people. One person can make three wallets. The quote rule damps a flood. It is not proof of identity. The UI says "wallets", never "people".
- Immutable means a false report stays until it expires. Mitigation: closed lists, readonly, 180 days, "citizen report, not a finding" on every figure.

**Decision (changes the spec on purpose):** add a fifth kind, `restriction`: a public freedom was restricted. It has one department, `police`, role `public`, and six services: `assembly_permission_denied`, `gathering_ban_order`, `barricades_or_closures`, `force_at_gathering`, `detention_without_notice`, `fir_not_registered`. Outcome `noted`, `worsened`, or `cleared`. Severity 1 to 5 in `amount_inr`. District and week only. No person, no unit, no place name, no photo.

Left out on purpose: internet shutdowns (a statutory order register, not a district citizen report), any case file, any named officer or victim, any seeded protest data. Seeding a claim about police conduct in a real district would be a fabricated allegation. The demo files restriction reports live.

## 2. The field, in one paragraph

Six submitted projects. All of them are attestations or infrastructure: canaries (Lapse, Arkiv Canary), audit trails (SiteLog), halt records (Door Ledger), reputation (ProofGraph), page snapshots (Fine Print Ledger). The gallery still showed `Projects (0)` when fetched on 16 October. None of them feels like a place with people in it. The gap we can own: a consumer-grade, live-feeling district board that a person in India can read and file to in a few taps, with the Arkiv properties verifiable from the page. Full per-project notes stay in plan.md section 4.

## 3. Loopholes in the current app

| # | Problem | Severity | Fix |
| --- | --- | --- | --- |
| L1 | A page load makes about 6 RPC calls; changing district repeats them; Record repeats them. The anonymous budget is about 100 queries an hour. Judges will see an error or nothing. Friction F2 and F3 already show it. | Blocker | One snapshot read of every `underthetable` report (48 rows now, one page), cached in `localStorage`, shared by every view. Stale data shows immediately with its age. Everything else (districts, ticker, map, trends) is computed client side. |
| L2 | The hero is a pixel office that has nothing to do with the data. The board is a table under the fold. The page does not look inhabited. | High | New Pulse view: counters, India tile map, live feed, quoted desks as cards, expiry watch. |
| L3 | Filing needs MetaMask, adding a chain, and test GLM. About 12 taps. Almost nobody in India can do it. | High | Throwaway browser identity, funded by a small server faucet. File in 3 taps from a desk card. "Use my wallet" stays. |
| L4 | The `day` attribute plus district plus service lets the official identify a reporter. Unquoted rows show it. | High | Stop writing `day`. The writer picks a week (this week, last week, earlier). Readers treat `day` as optional so the 48 existing rows still load. |
| L5 | The WebSocket fires for every entity on the shared chain (about 9,800 now) and each event triggers a `getEntity`. That burns the whole budget. | High | Ignore events whose `creationFlags` are not readonly and not permissionless. Queue at most one `getEntity` every 5 seconds. |
| L6 | The sentence goes to a third-party model after a regex pass that misses names, spaced Aadhaar, plates, FIR numbers. The key was pasted in chat. | High | Local parser fills the slip on the device. No network. The model route is an opt-in second button. Wider redaction. Rotate the key. |
| L7 | Seeded rows look like real findings about real offices. | Medium | Rows from the four known demo wallets carry a "demo wallet" badge. |
| L8 | `$createdAt` cannot be filtered although AGENTS.md says to range-filter on it (probe run today: `"$createdAt" is returned in query results but carries no index`). | Info | Filter in JS. Record as friction F5. |
| L9 | Third-party art in a public MIT repo (office tiles and characters, CraftPix zips). | Medium | The team confirmed it holds the licence for the office art. See assets.md for the clause to check before the repository is public. |
| L10 | The one-hour Pune row expired hours ago, so there is no expiry to show. | Medium | `npm run seed -- --short` writes a fresh one-hour row right before the video. |
| L11 | Seal properties are claimed, not demonstrated: extend by a second wallet, patch and delete by the creator. | Medium | `npm run verify` runs the four attempts against a live entity and prints each revert. Results go to friction.md. |
| L12 | Not deployed. The README is the organiser copy; the checklist wants setup steps in the README. | Blocker for submission | Vercel-ready `api/` functions. README rewrite in the final pass. Needs your Vercel login. |
| L13 | A relay with the public RPC URL only moves all callers onto one IP, which is worse. | Info | Relay is built but only useful once `ARKIV_RPC_URL` holds an access key from hub.arkiv.network. |

## 4. The experience

### Reader, 0 to 2 taps

1. Land on **Pulse**: a live strip (block, sealed count, last report age), animated counters, the India tile map heated by report count, the feed of what was just sealed, and the desks that are quoted.
2. Type in the search box ("nashik licence", "pune ration"). Pick a result. A sheet opens with that district's desks: median, wallets, outcome bar, trend against last week, and "Report this desk".
3. Last district is remembered on the device. Nothing is sent anywhere.

### Reporter, 3 taps

1. From a desk card, "Report this desk" opens the sheet with kind, district, department, role and service already set.
2. Optional: type a sentence. The slip fills as you type, on the device. A tripwire strikes out a phone number, Aadhaar, email, plate, FIR number or a name after a title, and says which kind it removed.
3. Pick an amount chip (or a severity 1 to 5) and a week chip. Tap **File**.
4. First file only: a throwaway key is made in the browser, the faucet sends a few cents of test GLM, the batch is signed. No wallet UI.
5. Receipt: a seal animation, entity key, transaction, creator, owner shown as the dead address, expiry. A **Try to delete it** button runs `deleteEntity` and shows the revert.

### Click budget

| Task | Before | After |
| --- | --- | --- |
| See Nashik driving licence figure | 4 | 1 (it is on the first screen) or 2 via search |
| File a report with a wallet already connected | about 9 | 3 |
| File a report with no wallet | cannot | 3 |

## 5. Keeping personal details out

Five layers, in order. A failure at any layer stops the write.

1. **No free text on chain.** Twelve attributes, all slugs or numbers. Payload is exactly `{"v":1}`.
2. **Less than before.** `day` is no longer written. Only the ISO week.
3. **On-device sentence.** The textarea is parsed locally against the closed lists and never sent. A live tripwire removes phone numbers, long digit runs, Aadhaar with spaces, email, `@`, `+91`, vehicle plates, PIN codes, FIR numbers, and a name after a title or a "my name is".
4. **Optional model.** "Ask the assistant" sends only the already-cleaned sentence, is off if the server has no key, and is never needed.
5. **Seal.** `sealReport` rejects any value that is not in the lists, any digit run of 10 or more, any `@` or `+91`, and any payload other than `{"v":1}`. The seed script runs the same guard.

Reader side: a single row is shown by week, not day. The creator is a short address. Nothing links an address to a person.

## 6. Arkiv, feature by feature

| Feature | Product reason | Where |
| --- | --- | --- |
| Attributes, queries (`eq`, `gte`, `createdBy`, cursor with `atBlock`) | Snapshot read, the CLI, the flood check | `src/lib/query.ts`, `scripts/query.ts` |
| `getEntityCount` (raw, filtered) | "N matching, M on chain" in the verify strip | `src/lib/query.ts` |
| Entity Expiration | 180 days; one-hour demo row; expiry watch panel | `src/lib/write.ts`, `seed --short` |
| `readonly` and `permissionlessExtension: false` | No edit, no rival extension | `src/lib/write.ts`, `npm run verify` |
| `predictEntityKeys` + `executeBatch` + `ownershipChanges` | Create and hand to the dead address in one transaction | `src/lib/write.ts` |
| `$creator` vs `$owner` | Quote counts creators; receipt shows both | `src/lib/aggregate.ts`, receipt |
| WebSocket `watchEntityEvents` with `creationFlags` filter | Live feed without a poll loop | `src/state/store.ts` |
| Throwaway wallet client | Reporter needs no wallet install | `src/lib/identity.ts` |

What stays off Arkiv: names, phones, email, Aadhaar, offices, streets, GPS, photos, free text, the day, and the typed sentence.

## 7. Interface and libraries

Light, quiet, monochrome with one accent, monospace numerals, no pixel office. Components on Radix: `@radix-ui/react-dialog` (sheets), `-select`, `-tabs`, `-tooltip`, `-toggle-group`. Animation: `motion` (counters, feed entry, seal stamp, layout). Icons: `lucide-react`. Search: `cmdk`. Fonts: `@fontsource-variable/geist`, `@fontsource-variable/geist-mono`. Plain CSS with tokens. No Tailwind, no state library: a 100-line store on `useSyncExternalStore`.

Phaser, the office scene and the tilesets are dropped from the build (bundle drops by roughly 1.4 MB).

## 8. Work order

1. Data: `restriction` kind in vocab, labels, guard, schema, tests. `day` becomes optional. Week-based incident window.
2. Store: snapshot with `localStorage` cache and stale-while-revalidate, throttled live updates, derived selectors (districts, trends, tile map, expiry).
3. Libraries and design tokens, UI primitives.
4. Pulse view, district sheet, search.
5. File sheet: local parser, tripwire, throwaway identity, faucet, receipt, seal check.
6. Record view and "How it is sealed" view (verify strip: CLI commands, explorer links, schema link).
7. `api/rpc.ts` and `api/drip.ts` plus the dev middleware.
8. `npm run verify`, `seed --short`, tests, build, screenshots at phone and desktop widths.
9. Docs: schema.md, friction.md (only calls actually made), decisions.md, README.

## 9a. Update, later the same evening

Done since this plan was written: the dot map of India, the office as a lazy tab, and a location check. See [decisions.md](decisions.md) section 14, [verification.md](verification.md) and [arkiv-usage.md](arkiv-usage.md). Loophole L9 changed: the office art is back but gitignored.

## 9. Needs you

- Vercel login or a deploy target, and a faucet-funded `DRIP_KEY` (SEED_KEY_1 holds about 7 test GLM and works for now).
- An access key from hub.arkiv.network for `ARKIV_RPC_URL`, if you want the relay to help.
- Confirm a team member of Indian nationality (the India prize is void without one).
- Rotate the IFM key that was pasted in chat.
- Record the demo video and fill the Devfolio form.
