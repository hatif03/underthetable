# Official Rules & Terms

> [!NOTE]
> **Frozen since 9 October 2026.** Only dated clarifications may be added. Weights, gates, eligibility and prizes do not change after the opening.

## 1. Overview

Arkiv: Global Tour Stop ("Challenge"), a builder challenge, is organized by Golem Factory GmbH, doing business as "Arkiv Network" ("Organizer"), and distributed through Devfolio. By submitting an entry, participants agree to these rules in full.

This repository is the only canonical source of the rules. It holds the full rules, rubric and submission checklist. If the Devfolio page ([arkiv.devfolio.co](https://arkiv.devfolio.co/overview)) differs, this repository applies.

## 2. Eligibility

- Open to individuals and teams worldwide. Fully online.
- Participants must be 18 or older at the time of submission.
- No purchase necessary.
- Employees of Arkiv / Golem Network and their immediate families are not eligible for prizes.
- Teams have up to 5 members. The roster is frozen when submissions close: members cannot be added or removed afterwards.
- Multiple submissions are allowed only if they are distinct projects. A team wins at most one prize across all its entries.

### Best Indian Use Case

A real-world application built on Arkiv that people in India can use. It does not need to follow a CROPS pillar. To compete, choose the Best Indian Use Case track. Your team must include **at least one person of Indian nationality**. Teams declare it when they register and again in the Devfolio submission form, and KYC for this prize is done with that person.

## 3. Challenge period

All times are London time (BST, UTC+1).

| Date | |
|---|---|
| 7 October 2026 | Registration opens on Devfolio |
| 9 October 2026, 12:00 | Opening, live at Network School Astana; submissions open |
| 18 October 2026, 23:59 (22:59 UTC) | Submissions and registration close |
| 19 to 22 October 2026 | Judging |
| 23 October 2026, 18:00 | Winners announced |
| 25 October 2026 | Deadline for winners to accept their prize |
| 3 to 6 November 2026 | Devcon 8, Mumbai |

Late submissions are not accepted. At the deadline we record each repo's commit SHA and judge that commit; rewriting history after the deadline disqualifies the entry. Deployments stay up until 23 October. The Organizer may adjust these dates; changes are announced on Devfolio and the Arkiv Discord.

## 4. Submission requirements

Submissions are made on Devfolio, the only valid method. What is asked at registration and at submission is listed in [docs/submission-checklist.md](docs/submission-checklist.md).

Every submission must pass these gates to be scored:

| Requirement | Details |
|---|---|
| Working app | Public deployment, connected to the Tiramisu testnet, usable without asking for access |
| Reproducible | Steps and the exact query that produce what the submission claims |
| Public repo | MIT licence, setup instructions in the README |
| `/arkiv/schema.md` | Entity types, attributes, expiration per type, queries |
| On-chain evidence | The wallet addresses that create your Arkiv entities on Tiramisu |
| `/arkiv/friction.md` | Feedback on building with Arkiv |
| Demo video | 3 minutes or less |
| One or more tracks | A CROPS pillar (Censorship Resistance, Open Source, Privacy, Security) or Best Indian Use Case, chosen on Devfolio |
| Submission questions | Every required question on the Devfolio project form answered (listed in the [checklist](docs/submission-checklist.md)) |

### Valid submissions

- Use Arkiv as the primary data layer, through the official SDK (`@arkiv-network/sdk` 0.8.x) or direct RPC.
- Original work created between 9 and 18 October 2026. Libraries, frameworks and boilerplate are allowed; the Arkiv integration and the core logic must be new. Pre-existing work is disclosed in the submission with its baseline commit SHA and the components reused.
- AI coding assistants are allowed.

### Disqualified submissions

- Plagiarised work or code copied from another participant.
- No meaningful Arkiv use (the SDK installed but never queried, or a conventional database app with Arkiv branding).
- Private keys or secrets stored in Arkiv, or real personal data stored in plaintext or hashed form (hashes of emails or phone numbers can be reversed). Use synthetic data; encrypted payloads of test data are fine.
- Malicious code or intentionally introduced vulnerabilities.
- No working app, or submitted after the deadline.

## 5. Prizes

| Prize | Reward |
|---|---|
| Best Indian Use Case | Devcon 8 ticket + $2,000 USDC |
| Censorship Resistance (Global) | Devcon 8 ticket + $750 USDC |
| Open Source (Global) | Devcon 8 ticket + $750 USDC |
| Privacy (Global) | Devcon 8 ticket + $750 USDC |
| Security (Global) | Devcon 8 ticket + $750 USDC |

**Total: $5,000 USDC and five Devcon 8 tickets.**

### Prize conditions

- **Attending Devcon is not required to win.** Each winning team gets one Devcon 8 ticket (Mumbai, 3 to 6 November 2026) to use if it wants to attend.
- **Payment:** prizes are paid within 14 days after the winner completes KYC.
- **One ticket per winning team.** Travel, visa and accommodation are the winner's responsibility.
- **One prize per team.** You can enter more than one track, but your team wins at most one prize. If you win Best Indian Use Case, you cannot also win a Global prize. If you win one Global prize, you cannot win another. Allocation is described in the [rubric](docs/scoring-rubric.md#3-ranking-and-prizes).
- **Minimum score.** A project needs at least 50/100 to win. If a Global prize has no eligible project, it goes to the highest-ranked project that has not won, ranked by its highest track total. Best Indian Use Case only goes to a team with at least one member of Indian nationality; if no such team qualifies, it is not awarded.
- **Currency:** USDC, sent to an EVM wallet address.
- **KYC is required to claim a prize, not to enter.**
- Prizes are non-transferable, except as described in Section 6.
- Taxes are the winner's sole responsibility. The Organizer does not withhold taxes or give tax advice.

## 6. Confirmation and runner-up policy

1. Winners are notified by email and Telegram on 23 October.
2. Each winning team accepts the prize by replying to the notification email within **48 hours** of it being sent. A replacement winner gets its own 48-hour window from its own notification.
3. If a team does not accept, declines, or cannot complete KYC, the prize passes to the next-ranked eligible team:
   - a Global prize goes to the next team in that pillar;
   - Best Indian Use Case goes to the next team in that track with at least one member of Indian nationality;
   - if no eligible team remains, Section 5 (minimum score) applies.
4. Replacements are offered until 28 October 2026. After that, a prize that is declined stays unawarded.

## 7. KYC

Winners complete KYC before payout. The Organizer shares the process with each winning team after the announcement. For Best Indian Use Case, KYC is done with the team member of Indian nationality.

## 8. Judging

The Arkiv team judges every submission against the published [scoring rubric](docs/scoring-rubric.md): gates first, then four criteria at 25 points each. Judges with a conflict of interest recuse themselves. Ties are broken as described in the rubric. Judges' decisions are final and not subject to appeal.

## 9. Intellectual property

- Participants keep full ownership of their submissions, which must be published under the MIT licence.
- By entering, participants grant the Organizer a non-exclusive, royalty-free, worldwide licence to showcase the submission, reference it as an example of Arkiv usage, and fork the repository for educational purposes.
- Teams that plan to attend Devcon 8 can say so in the submission form, so we can showcase their project at the Arkiv booth. It does not affect judging.

## 10. Code of conduct

Treat everyone with respect. No harassment, discrimination, sabotage of other teams, or illegal or harmful content in any Challenge channel. Violations may lead to disqualification at the Organizer's discretion.

## 11. Liability

- The Organizer is not responsible for technical failures, network issues or testnet downtime.
- The Organizer is not responsible for travel, visas, accommodation or any cost beyond the stated prizes.
- The Organizer may extend deadlines or cancel the Challenge if circumstances require, and may add dated clarifications. Changes never apply retroactively against a team, and are announced on Devfolio and the Arkiv Discord.
- The Organizer's total liability is limited to the stated prizes.

## 12. Privacy

- Personal data collected at registration and submission is used only to run the Challenge.
- With the participant's consent at registration, contact details are shared between Arkiv and Devfolio for this Challenge.
- Participants are not added to marketing lists without explicit consent.

## 13. Governing law

These rules are governed by the laws of Switzerland. Disputes are resolved through good-faith negotiation.

## 14. Contact

Questions: the [Arkiv Discord](https://discord.gg/arkiv).
