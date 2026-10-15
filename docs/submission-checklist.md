# Submission checklist

Everything happens on Devfolio, in two moments: when you **register** and when you **submit** your project. Questions marked * are required.

## 1. When you register (each person)

Devfolio asks for your name, email and GitHub, plus:

- Telegram handle (we use it to reach you during the challenge)
- Country of residence (statistics only, it does not affect eligibility)
- Does any team member hold Indian nationality? (to compete for Best Indian Use Case you need at least one; KYC for that prize is done with that person)
- Builder communities you are part of
- Background (Web2, Web3, Databases, Other) and whether you had used Arkiv before
- How you heard about the challenge
- Optional: whether you plan to attend Devcon 8 in Mumbai (not required to win)
- **USDC payout wallet:** an EVM address. It can differ from the wallets your app uses.
- Acknowledgement that winners complete KYC before payout
- Consent to Arkiv and Devfolio using your contact details for this challenge

## 2. When you submit (once per team)

### In your repo

- [ ] Public, MIT licence, setup instructions in the README
- [ ] `/arkiv/schema.md`: entity types, attributes, expiration per type, the queries your app runs
- [ ] `/arkiv/friction.md`: for each Arkiv surface you used, expected vs actual, versions and steps to reproduce

### On the Devfolio project form

The standard fields: project name, tagline, project media, project links (your repo and a demo video of 3 minutes or less), builders, **The problem it solves** \* and **Challenges I ran into** \*, and **tracks**: pick every track you compete in, a CROPS pillar (Censorship Resistance, Open Source, Privacy, Security) or Best Indian Use Case.

Then our questions. Your answers are private: only organizers and judges see them. Files in your repo, including `/arkiv/schema.md` and `/arkiv/friction.md`, are public.

1. **Live app URL** \* Where judges can try your project right now.
2. **Does any team member hold Indian nationality?** \*
3. **Why Arkiv?** \* What would break if you used Postgres, IPFS, a subgraph or your own API instead? Why did you choose Arkiv, and which advantages do you get only from using it?
4. **How do you use Arkiv?** \* For each Arkiv feature you use, tell us how and why you use it, with a link to the code.
5. **Friction report: link to `/arkiv/friction.md`** \* A GitHub link to the file. For each issue, cover what you expected, what actually happened, the versions you used, and steps to reproduce.
6. **Wallet addresses that create your Arkiv entities** \* List each address and the role it plays in your app.
7. **Link to `/arkiv/schema.md`** \* A GitHub link to the file in your repo.
8. **How can judges reproduce your Arkiv usage?** \* Step-by-step instructions judges can follow to see how your project uses Arkiv.
9. **Pre-existing work you reused** \* Anything you made before 9 October and reused here, like starter code, templates or parts of past projects. Write "None" if you built everything during the hackathon.
10. **Arkiv surfaces you used** \* TypeScript SDK, Direct JSON-RPC, WebSocket events, Docs, Hub, Faucet, Access keys, Block Explorer, Data Explorer, Arkiv MCP, Arkiv skills, Arkiv Plugin, Other.
11. If you selected Other, name it
12. **How long after you started did you write your first Arkiv entity?** \* 2 hours or less · 2 to 24 hours · More than a day
13. **Which LLMs did you use?** \* Write "None" if you didn't use any.
14. **What is the one thing Arkiv should improve first?** \*
15. **Open to a 20-minute feedback call with the Arkiv team?** \*
16. **This is our team's work, built between 9 and 18 October. Any pre-existing or third-party work is disclosed.** \*
17. **Our repo is public under the MIT licence, and every link is accessible to judges.** \*
18. I plan to attend Devcon 8 in Mumbai (optional, not required to win)

Never paste private keys, seed phrases, access key secrets or RPC URLs with credentials into any answer.

## At the deadline

At the deadline we record your repo's commit SHA, and that is what we judge. A force-push that rewrites history after the deadline disqualifies the entry. Keep your deployment up until winners are announced on 23 October. You can edit your Devfolio submission until it closes.
