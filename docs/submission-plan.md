# Submission plan

> **Live:** [underthetable.vercel.app](https://underthetable.vercel.app) · [mirror](https://underthetable.vercel.app/mirror.html) · [repository](https://github.com/hatif03/underthetable) · [all screenshots](screenshots/README.md)

Written 16 October 2026, for the 18 October 23:59 London deadline (22:59 UTC). Legend: **DONE** is in the repository now; **YOU** needs the team (accounts, people, a camera).

## The gates. A project that fails one is not scored.

| Gate | Status | Action | Owner |
| --- | --- | --- | --- |
| Public deployment judges can open without access | **DONE** 17 October: https://underthetable.vercel.app | Open it in a private window and file one report, to check the whole flow from production. | YOU, 5 min |
| Reproducible steps, public MIT repository | Ready | README and LICENSE exist. Put the repository on GitHub. Check the office-art licence allows a public repository (see [assets.md](assets.md)); if not, gitignore the three art folders. | YOU, 15 min |
| `arkiv/schema.md`, `arkiv/friction.md` | **DONE** | | |
| Wallet addresses that create entities | **DONE** in `arkiv/wallets.md` | Seven seed and test wallets, the checker, the curator. Browser throwaway keys are made by visitors and cannot be listed: say so in the form. | YOU, in the form |
| Demo video, 3 minutes or less | **Not done**. (`docs/media/corruption-animation.mp4` is a 6-second stock animation, not the demo.) | The script is in [pitch.md](pitch.md). Run `npm run seed -- --short` first. | YOU, 1 h |
| Every required form question answered | Drafts in [pitch.md](pitch.md) | Paste; answer nationality and tools truthfully. | YOU |
| Built 9 to 18 October; disclose pre-existing work | Repository started 16 October | In the form: the office scene code is adapted from an MIT-licensed project ([THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md)); the office art is LimeZu's; state boundaries are DataMeet's (CC BY 4.0). Give the baseline commit SHA after the first commit. | YOU |
| At least 50 of 100 | Comfortable if the gates pass | | |

## The four scored criteria

### Why India
- **Demand proven by the thing we replace.** bribes.fyi: launched 2 July 2026, over 600 reports, more than 5 million requests and 200,000 new users in its last 48 hours, then it announced the data would be permanently deleted (ThePrint, 18 August 2026). On the Sealed page, with the link.
- **A record has an effect.** I Paid a Bribe fed an ombudsman whose April 2016 passport report recommended dropping address verification by police, which often involves bribes (Ideas for India, June 2016). On the Sealed page.
- **Real incidents from the week**: 62 sourced press reports, each with its articles ([press-records.md](press-records.md)). **DONE.**
- **Named users**: a person about to renew a licence; a family that relies on a health centre; a journalist covering a protest; a lawyer needing a district-and-week record. In [pitch.md](pitch.md). **DONE.**
- **Real citizen reports. Zero today.** Ask 10 to 20 people in different states to file one location-checked report each, on real phones, before the video. It turns "0 citizen wallets" into a live number and shows the press-to-citizen cross-check. Do not fabricate. **YOU.** This is the most valuable item on this page.

### Why Arkiv
- **The custodian is the threat, and it happened**: sealed, dead owner, "Try to delete it" fails on screen. **DONE.**
- **A public chain gets garbage, so the reader is the defence**: `npm run audit` (77 entities, none outside the schema), hostile-input tests. **DONE.**
- **Trust by `$creator`, three ways**: checker, curator, demo wallets. **DONE.**
- **A reasoned "no" to permissionless extension**: here it would let a rival pin an accusation. In the schema and [abuse-model.md](abuse-model.md). **DONE.**
- **History you can check**: the Record's "Look back" runs an `atBlock` query and verifies every earlier row is still there (49 of 49 an hour ago). **DONE.**
- **Expiry on screen**: `npm run seed -- --short` before recording, so the Entity Expiration panel shows a row leaving. **YOU, before the video.**

### How you use Arkiv
- Each feature with its reason and its code in [arkiv-usage.md](arkiv-usage.md), 15 rows, with a column of real entity keys. **DONE.**

### Friction report
- 18 entries (F1 to F18), each from a call that was made. `npm run repro` reproduces the main ones against the live chain and writes nothing. Entries that other teams also hit say so. **DONE.**
- The Devfolio form asks for one improvement: choose the worst real issue. The best candidate is F13, a bare number against a `u64` attribute silently matching nothing. **YOU choose.**

## Product feel and resilience (all DONE)
- One line: "Press can report it once. Citizens can add to it. Nobody can take it down."
- Hindi and English for the core flow.
- Works when the site does not: `mirror.html`, curl commands, the CLI, the audit.
- Works when the public RPC refuses: a server snapshot read once for everyone, a browser cache, a "read directly" switch, and an optional Hub access key.
- Mobile with no overflow at 390 px. 32 tests.

## Order of work
1. **Tonight, YOU:** get the keys ([deploy.md](deploy.md)), deploy, ask real people to file, confirm Indian nationality.
2. **Tomorrow morning, YOU:** `seed --short`, rehearse, record, fill the form.
3. **Tomorrow afternoon, BOTH:** a dry run from a private window on a phone; fix what breaks; commit; note the baseline SHA.
4. **Before 18 October 23:59 London:** submit with margin. Do not rewrite history afterwards. Keep the deployment up to 23 October.
