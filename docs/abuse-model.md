# Fake reports and personal data: what stops them, and what cannot be stopped

Written 16 October 2026. Two promises this product makes, and the honest limits of each.

1. **Nothing personal ever goes on Arkiv.**
2. **A fake report cannot pass for a finding.**

The ground rule that makes both tractable: **a report has no free text.** It is eleven closed-list attributes and the payload `{"v":1}`. A person cannot type a name, a rumour, an accusation or a phone number into a field, because there is no field. What a liar can do is assert a false closed-list fact: "a bribe of ₹700 for a driving licence in Nashik this week". The damage a single false report can do is bounded to that sentence.

## Promise 1: personal data never reaches Arkiv

Arkiv is a public chain. A write cannot be undone, and a modified client can write anything to it. So the rule is enforced in four places, and the last one matters most.

| Layer | What it does | Where |
| --- | --- | --- |
| No free text | There is nowhere to put a sentence. | the schema |
| Write guard | Every value must be on a closed list; the payload must be exactly `{"v":1}`; any digit run of 10 or more, any `@`, any `+91` is refused before the transaction is built. | `src/lib/guard.ts` |
| Sentence handling | The optional sentence is parsed on the device, never sent, never stored. A live tripwire strikes out phone numbers, Aadhaar with spaces, email, vehicle numbers, case numbers, PIN codes and a name after a title. | `src/lib/guard.ts`, `src/lib/parse.ts` |
| **Reader validation** | Anything on the chain that is not a valid, sealed report is **ignored by the page, the CLI and the audit**. An attribute outside the schema, a district that is not on the list for its state, a payload with a note in it, a week in the future, an entity its writer could still delete: all dropped, never shown, never counted. | `src/lib/validate.ts` |
| Chain audit | `npm run audit` reads every underthetable entity with its payload and reports anything outside the closed lists or that looks like a phone number, email or name. | `scripts/audit.ts` |

What this does not do, and cannot: **stop a hostile person from writing junk to a public chain.** No application can. The guarantee is that our pages and tools never display it or count it, the junk expires in 180 days, and the audit shows exactly what is there. The position of a person using the location check is never written; the attestation schema has no field for it, and the validator rejects an attestation that carries one.

Sealing makes a privacy mistake permanent, so the check has to run on what is already on the chain, not only before a write. That is what `npm run audit` is for, and it can be run by anyone.

## Promise 2: a fake report cannot pass for a finding

There is no way to prove a claim about a bribe from a phone. What the product does instead is make a fake expensive, make it visible, and refuse to call anything a finding.

| Attack | Defence | Residual risk |
| --- | --- | --- |
| A remote troll files about a district they have never visited | **Location check** (state level, rounded to about 5 km, signed by the filing wallet, vouched by a checker wallet). A wrong state is stopped in the browser. | A phone can fake a position. A check mark is a hint. |
| One person files from many wallets to fake a figure | Nothing shows a figure until **3 distinct wallets** wrote the same desk in the same week. One wallet writing five times is one voice. Each new wallet needs a faucet drip, which is limited per network address and per day. **Corroborated** needs 3 *location-checked* wallets. | One determined person can still make three wallets and fake three positions. The page says "wallets", never "people". A zero-knowledge proof of a valid Aadhaar would close this and is documented as the next step. |
| A burst of reports to push a figure | A desk whose first reports arrived within about ten minutes is marked **Filed in a burst**, with a tooltip that says it could be one event or one person. | A real event looks the same. The mark informs, it does not decide. |
| One wild amount to drag the number | The figure is a **median of one amount per wallet**, so one liar among three cannot move it. The desk shows its **range**, and an amount more than four times off the median is tagged **outlier**. | Two liars in three can move it. |
| An invented incident | A report counts in a figure only with 3 wallets. The **Press** section is separate, and each press report links its articles, so a reader can check the source. A citizen desk that matches a press report in the same district and week is marked **Also in the press**, and a press report shows how many citizens agree. | A press report is one curator wallet's reading of an article. The articles are public and each was re-read before it was written. |
| A false press record | Only the curator wallet is believed to say `source = press`. Anyone else who writes it is read as an ordinary citizen. | The curator is a single trusted wallet. It cannot edit or delete what it wrote, and every record cites its articles in the repository. |
| A forged check mark | An attestation counts only if its `$creator` is the checker wallet in `data/attesters.json`, it is sealed, it has exactly the schema, and its state matches the report. The request must be signed by the wallet that filed the report, within 30 minutes. | If the checker key leaks, an attacker could add false marks. They are hints; they cannot edit a report. Rotate the key and the list. |
| Keeping a false report alive forever | `permissionlessExtension` is off. A report leaves every query after 180 days, and nothing can extend it. | None. |
| A report its writer could delete after it did its work | The reader counts only reports owned by the dead address. A writer who skipped the transfer is ignored. | None. |
| Naming or smearing a person or an office | There is no field for a name. The role is a title, never a person. The district is the most precise place. | A district-level claim about police or a department is still a claim about an institution. Every figure is labelled a citizen report, not a finding, and a single report is not a figure. |
| Blocking or pressuring the site | The data is on Arkiv. `npm run query`, the curl commands on the Sealed page, and the one-file mirror read it without our server. | The location check needs our server. Everything else does not. |

## What we deliberately do not do

- **No moderation queue.** A reviewer who can refuse a report is a censor. The only moderation is what a reader's query returns: validity, the 3-wallet rule, and the 180-day lifetime.
- **No identity.** No phone, no Aadhaar, no login. The faucet does not log, and the checker does not store.
- **No claim of proof.** Nothing here says a report is true.

## Checks

```bash
npm test          # hostile-input tests: a name in a slug, an extra attribute, a note in the payload, an unsealed entity, a future week, a position on an attestation
npm run audit     # every underthetable entity on Tiramisu against the same rules
npm run verify    # a sealed report and an attestation cannot be edited or deleted
```
