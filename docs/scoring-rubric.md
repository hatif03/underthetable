# Scoring rubric

Every submission is judged by the Arkiv team in two steps: **gates**, then **score**.

## 1. Gates (pass or fail)

A submission that fails any gate is not scored.

- [ ] **It works.** A public deployment judges can open without asking for access. This applies to every track: a library, CLI or dataset ships with a deployed app or product that shows how it is used and the value it adds.
- [ ] **It can be reproduced.** The steps and the exact query in the submission produce what the submission says.
- [ ] **Public repo under the MIT licence.**
- [ ] **`/arkiv/schema.md`** in the repo: entity types, attributes, expiration per type, the queries the app runs.
- [ ] **On-chain evidence on Tiramisu:** the wallet addresses that create the project's Arkiv entities. Judges find the entities and their creation transactions from them.
- [ ] **`/arkiv/friction.md`** in the repo.
- [ ] **Demo video**, 3 minutes or less.
- [ ] **Every required question** on the Devfolio project form answered (see the [checklist](submission-checklist.md)).
- [ ] **At least one track** chosen on Devfolio: a CROPS pillar or Best Indian Use Case.
- [ ] **Built between 9 and 18 October 2026.** The Arkiv integration and the core logic are new. Pre-existing work is disclosed with the baseline commit SHA and a list of reused components.
- [ ] **Evidence that survives expiry.** If Arkiv entities expire before judging, judges verify their creation transactions on the explorer and review the demo video.

**Not eligible:** the SDK installed but never queried · a Postgres app with an Arkiv logo · private keys, secrets, or real personal data stored in Arkiv in plaintext or hashed.

## 2. Score (100 points)

Four criteria, **25 points each**. Each is scored 0 to 5 and weighted: `points = 25 × (score / 5)`.

A project can enter more than one track. The first criterion depends on the track: "Why this pillar?" for a CROPS pillar, "Why India?" for Best Indian Use Case. It is scored once for each track the project enters; the other three criteria are scored once. A project's **track total** is the sum of its points for that first criterion in that track and for the other three criteria.

| Score | Meaning |
|---|---|
| 0 | Absent |
| 1 | A slogan with no substance |
| 2 | Mentioned, but generic |
| 3 | Solid and specific to this project |
| 4 | Good: thoughtful and clearly reasoned |
| 5 | Excellent: specific enough that another builder could follow it |

### Why this pillar? · 25 (CROPS tracks)

The problem side. Who is harmed today if this data is censored, shut down, leaked or forged, and does the project actually help them?

| 1 | 3 | 5 |
|---|---|---|
| The pillar is named, but no affected user or problem is identified | A real user with a real problem, and the pillar is why today's solution fails them | Names who is censored, exposed or misled today, and what changes for them from day one |

What each pillar asks for:

- **Censorship Resistance:** someone outside the team can read and query the data from Arkiv without the team's backend.
- **Open Source:** another team can build on the dataset or tool without asking permission, from a documented data contract.
- **Privacy:** what is visible on the explorer exposes no personal data; few attributes, encrypted or hashed payloads, expiry the user controls.
- **Security:** the app shows or filters Arkiv entities by their on-chain creator (`$creator`), not by a field anyone can write.

### Why India? · 25 (Best Indian Use Case)

Replaces "Why this pillar?" for this track. It does not need to follow a CROPS pillar. Who in India uses it, and what real problem does it solve for them?

| 1 | 3 | 5 |
|---|---|---|
| India is named, but no user or problem is identified | A real group of users in India with a real problem the app addresses | Names who in India uses it and what changes for them, and the app works for them today |

### Why Arkiv? · 25

The solution side. What breaks on a database an operator controls, on IPFS, a subgraph or your own API?

| 1 | 3 | 5 |
|---|---|---|
| "It's on-chain" is the whole argument | Names at least one property the project loses without Arkiv | The project falls apart without the Arkiv property it relies on, and it says what deliberately stays off Arkiv |

### How you use Arkiv · 25

**We judge how and why you use a feature, not how many you use.** We check usage on chain and in the code; a feature claimed but not found counts against you.

| Feature | Use that scores |
|---|---|
| Attributes vs payload | What you query lives in typed attributes (numbers where you need ranges); the rest in the payload |
| Queries | Compound predicates, ranges, `createdBy()` / `ownedBy()`, cursor pagination |
| Entity Expiration | Lifetimes that differ per entity type and follow product logic |
| Lifetime Extension | `extendEntity` as a lease renewed by activity |
| Creation flags | For example, permissionless extension so a community can keep data alive |
| `$creator` / `$owner` | Verifiable authorship surfaced in the UX; ownership transfer |
| WebSocket entity events | `watchEntityEvents` over a WebSocket transport (no `fromBlock`, which forces polling); the UI reacts without a refresh loop |
| Batch writes | Atomic batches when several writes must land together |

| 1 | 3 | 5 |
|---|---|---|
| A blob in the payload read by key, or features added for show | The features used are correct and tied to the product | Every feature used changes something the user sees, and the team explains why it chose it. One feature used this way can score 5 |

### Friction report · 25

`/arkiv/friction.md`: what got in your way while building with Arkiv.

| 1 | 3 | 5 |
|---|---|---|
| Praise, or "everything was great" | Real issues, or tested paths that worked, each with the surface involved | Each issue has expected vs actual, versions and steps to reproduce, and points at what would fix it. A smooth integration documented with the same rigour (what you tested, what you expected, what happened) scores the same. Invented complaints score 0 |

## 3. Ranking and prizes

- Each total is the average of the judges' totals, unrounded.
- **Minimum score:** 50/100 to win.
- **One prize per team.** A team that has already won is skipped, and the prize goes to the next eligible team.
- **Best Indian Use Case** is allocated first: the highest track total in that track, from a team with at least one member of Indian nationality. That team cannot also win a Global prize.
- **Global prizes (one per pillar):** each pillar ranks the projects that entered it by their track total. If one team tops more than one pillar, it receives the pillar where its track total is highest (ties: in the order Censorship Resistance, Open Source, Privacy, Security), and the other pillars go to their next team.
- **No eligible project for a Global prize:** it goes to the highest-ranked project that has not won, ranked by its highest track total.
- **Best Indian Use Case** only goes to a team with at least one member of Indian nationality. If no such team reaches the minimum score, it is not awarded.
- **Ties:** higher "Why Arkiv?" wins, then higher "How you use Arkiv", then the earlier submission timestamp.
- Judges with a personal or professional connection to a team disclose it and recuse themselves from that entry.
- Judges' decisions are final.
