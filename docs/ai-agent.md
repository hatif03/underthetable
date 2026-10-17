# Is there a genuine use for an AI agent here?

Written 17 October 2026. Short answer: **one, narrow, and it is built as a script, not as a feature of the app.** An AI should not be a verifier in the sense of a judge of what is true, and it should not write to the chain.

## The question that matters

The product's promise is that no single party controls the record. An AI agent is a single party: whoever runs it chooses the model, the prompt and the key, and it can be wrong with confidence. So the only acceptable roles are ones where it cannot decide anything, only add a reading that a person can overrule, and where its failure is visible.

## What I tried: an independent second reader for press records

The weakest link in this project is the press curator wallet: one party reading one article and turning it into a closed-list record. I made mistakes there. Two independent AI fact-checking agents (separate sessions that re-opened every cited page) re-read all 36 new records today and found problems in eleven (a figure that is not in any cited article, four overstated severities, a quote from an official that no cited article contains, a claim made for a district that the article makes only for "several rural areas").

[`scripts/ai-check.ts`](../scripts/ai-check.ts) (`npm run ai:check`) gives a language model the same job: fetch each cited article, take the record's structured claim, and answer one narrow question, "does this article support this claim?", returning `yes`, `partly` or `no` with the specific unsupported details quoted. It reads and prints. It writes nothing to Arkiv.

**What it did**, with the IFM K2 model through its OpenAI-compatible API:

| Test | Result |
| --- | --- |
| Four correct records, first run | The ones that returned an answer said `yes`, with the same severity as ours (3). |
| The wrong claim I had actually written for a march in Delhi: "detained about 250 people, per police figures cited by PTI", severity 4, checked against the Tribune article | **`partly`.** "The summary says 'detained about 250 people', but the article only reports that 'Several Opposition leaders who were briefly detained' and gives no figure of 250", and "the article does not cite police figures or PTI". Its own severity: 3. It found the same defect the fact-checking agents found. |
| The wrong claim for Mandsaur power cuts ("rural cuts of 2 to 8 hours and a three-hour road blockade", severity 4), against two articles | **`partly`** on both. One article's check listed those three details as unsupported; the other gave its own severity as 3 against our 4. |
| Ten of the newest records in a batch | Only 4 of 10 returned a verdict. The rest ran out of tokens while the reasoning model was still thinking, or timed out. The 4 that did agreed with the record. Raw output: [ai-check.md](ai-check.md) (the `error` rows are real). |

So it is **useful as a second pair of eyes, and unreliable as a process**: a good answer when it finishes, and it cannot be the only check, because silence is not agreement. It has a different failure mode from the curator (it has no reason to want the record to be true), which is exactly the point of a non-aligned reader, but it is not a neutral oracle. It shares the training data of every other model, it cannot read a page that blocks scripts or sits behind a paywall (Prabhat Khabar returned HTTP 410 to our fetcher), and it can say `yes` to something wrong.

## The rules that make it safe to have

1. **Advisory only.** Its output is a table for a person. It never creates an entity, an attestation or a flag on the public page.
2. **`unreadable` is not agreement.** A page it could not fetch is reported as such.
3. **No personal data goes in.** Only public article text and our own closed-list claim; the system prompt tells it not to repeat any name.
4. **It runs on a maintainer's machine, with a key that never touches the page.** `IFM_API_KEY` is read from `.env` by this script only.
5. **A disagreement means "a person should look again", not "the record is wrong".**

## Uses I considered and rejected

| Idea | Why not |
| --- | --- |
| **An AI wallet that writes attestations** ("a non-human verifier on chain") | It would be trusted by `$creator`, so whoever holds its key holds a credential that the page believes. That turns a second reader into a second authority, and its errors would be permanent and public. It also invites exactly the reading we are trying to avoid: that a model "verified" something. Not built, and I would not build it. |
| **A chatbot that turns a typed sentence into a slip** (this is what `/api/assist` did) | It sends what a person typed to a third party. The on-device parser already fills the slip with nothing leaving the phone, which is the better answer for a product whose promise is that nothing about you leaves the device. The route stays in the repository, unused and not deployed. |
| **Scoring citizen reports for "credibility"** | A model cannot know whether a stranger's report is true. It would add a hidden, unaccountable filter in a product built so that nobody can quietly decide what stays. |
| **Auto-generating press records** | This is the failure we just corrected by hand. A model that writes records from news at scale would write the same "about 250" mistakes at scale, onto a ledger nobody can delete. |
| **Summaries or Q&A over the ledger** | Possible, harmless, and not worth shipping in this deadline: the data is already a table and a map. |

## If it goes further

- Run it on every new press record before it is written, as a pre-write gate for the maintainer, and publish its disagreement in `docs/press-records.md` next to the record.
- Make the checker retry with a larger budget and a non-reasoning mode, so that 4 of 10 becomes close to 10 of 10.
- Ask two unrelated models and report only the disagreements.

## A note on the key

The IFM key was pasted into a chat earlier in the project. It is in the git-ignored `.env`, it is not in the deployed environment, and it should be revoked and replaced once the hackathon is over.
