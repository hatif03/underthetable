# Why a project like this needs Arkiv

> **Live:** [underthetable.vercel.app](https://underthetable.vercel.app) · [repository](https://github.com/hatif03/underthetable) · [schema](../arkiv/schema.md) · [friction report](../arkiv/friction.md) · [feature-by-feature](arkiv-usage.md)

underthetable records what happens **under the table**: bribes, broken services, and what an authority did with a public power out of sight. The one property that matters is that **nobody can take a record down, including us.** That is not a feature we can add to a normal database. It is a property of who holds the delete key, so the choice of storage is the product.

This page is the long form of the argument. Every claim is tagged **[official]** (from Arkiv's own documentation, with a link), **[ours]** (something we ran, with the command), or **[limit]** (an honest cost). Nothing here needs trust: the commands are at the bottom.

---

## 1. The threat is the custodian

Records of this kind do not usually die by being disproved. They die because the party that keeps them is reached.

- **bribes.fyi**, an anonymous bribe tracker, collected 600+ reports and over five million requests in its last 48 hours, then closed on 18 August 2026 with a notice that included "the permanent deletion of any recorded data". The operator called it a voluntary, precautionary step, not a response to a complaint ([ThePrint, 18 Aug 2026](https://theprint.in/feature/bribes-fyi-anti-corruption-site-aryan-nishad/3018441/)). We do not say anyone forced it. The point is that **one person could make the whole record vanish, and did.**
- It is a pattern, not an accident of one site: the operator of a table is the one place a notice, a threat, a lawsuit or an unpaid hosting bill can reach.

So the design question is not "how do we store reports". It is **"how do we build a ledger whose operator has nothing to hand over?"**

## 2. What breaks with each alternative

| | Who can delete or change a record | Can it answer our queries | What fails on a hostile day |
| --- | --- | --- | --- |
| **Postgres behind our API** | Whoever has the database login: us, our host, a compromised key, a court order served on us | Yes, but only through our server | The site is the record. Take the site down, or ask us to, and it is gone. |
| **IPFS** | Nobody can edit content-addressed data, but nobody is obliged to keep it either | **No.** A hash cannot answer "this district, this week, severity at least 3, inside this rectangle" | Persistence is not promised: IPFS's own docs say data is cached, garbage-collected unless pinned, and that pinning "doesn't guarantee that any content is persistently available" ([IPFS docs: persistence](https://docs.ipfs.tech/concepts/persistence/)). We would be the pinner, so we are the custodian again. |
| **A subgraph** | The chain's data is whatever is on the chain; the subgraph is a server that indexes it | Yes, if we write and host the indexer | A subgraph "indexes data from a smart contract" ([The Graph docs](https://thegraph.com/docs/en/subgraphs/quick-start/)). The records would sit in a contract we deploy (storage priced forever), and the index is a service we run and can be told to stop. |
| **Our own API on any database** | As Postgres, plus one more place to serve a notice | Yes | The same. |
| **Arkiv** | After our batch: nobody. `$owner` is `0x…dEaD` | Yes, on a public node, no server of ours | Our site can disappear and the rows are still there, readable with `curl`. |

## 3. What Arkiv gives, that we use, with the evidence

### 3.1 Only the owner can delete, so we make the owner an address nobody holds **[official] [ours]**

Arkiv's documentation: *"Only the owner wallet can update, extend, transfer, or delete an entity"*, and one transaction can carry several operations that *"apply as one atomic batch. If one fails, none apply"* ([Fundamentals](https://docs.arkiv.network/start-here/fundamentals/), [Mutating data](https://docs.arkiv.network/typescript-sdk/mutating-data/)).

We turn those two sentences into the whole product: `predictEntityKeys` computes the new entity's key, then one `executeBatch` **creates the report and transfers it to `0x000000000000000000000000000000000000dEaD`** in the same transaction. If the transfer cannot be included, the report is never created. There is no moment when a deletable report exists. Plus `readonly: true` (attributes cannot be patched) and `permissionlessExtension: false` (a stranger cannot extend its life).

- Code: [`src/lib/write.ts`](../src/lib/write.ts), [`server/attest.ts`](../server/attest.ts).
- Evidence **[ours]**: `npm run audit` reads 114 entities, 113 valid reports, every one owned by `0x…dEaD`; the raw count `project = str('underthetable') AND $owner = addr(0x…dEaD)` equals the number that exist ([friction F12](../arkiv/friction.md)); `npm run verify` makes `patchEntity`, `deleteEntity`, `extendEntity` (from the author) and `extendEntity` (from a stranger) against a live report, and **all four fail**; the receipt in the app has a "Try to delete it" button that shows the failure ([friction F7](../arkiv/friction.md)). A postgres `DELETE` has no equivalent test, because it succeeds.

### 3.2 `$creator` is set by the chain, so trust does not depend on what the writer typed **[official] [ours]**

*"The protocol also keeps system attributes on every entity: `$owner`, `$creator`, `$createdAt`, `$updatedAt`, and `$expiresAt`. You can query them. You cannot set them."* ([Fundamentals](https://docs.arkiv.network/start-here/fundamentals/)).

Everything in a public ledger is claimed by someone, so who counts matters. We use `$creator` three ways, each from a short list in the repo:

- a **citizen** wallet is one voice; a desk shows a figure only at **three distinct wallets**, and five slips from one wallet are still one;
- the **location checker** wallet's attestations are believed ([`data/attesters.json`](../data/attesters.json));
- the **press curator** wallet's `source = press` is believed ([`data/curators.json`](../data/curators.json)). Anyone can *write* `source = press`; a row from any other wallet is read as an ordinary citizen row.

A column that the writer fills in, in a database of ours, cannot give this property. Test: [`test/press.test.ts`](../test/press.test.ts) ("only the curator wallet is believed").

### 3.3 Tamper-evidence we can test, with `atBlock` **[official] [ours]**

Arkiv commits state with a keccak Merkle-Patricia trie, "readable with `eth_getProof`", and every write is a signed Ethereum transaction ([Fundamentals](https://docs.arkiv.network/start-here/fundamentals/)). Because a sealed entity cannot be edited, the ledger as of an earlier block must be a subset of the ledger now. The Record page's **Look back** runs the same query `atBlock` an hour earlier and checks it against the head: **49 of 49 rows were present with identical attributes** ([friction F16](../arkiv/friction.md)). A table we run cannot offer that proof, because we could have changed it between the two reads.

### 3.4 Queries on typed attributes, with no indexer of ours **[official] [ours]**

Arkiv markets this as *"Queryable: filter and paginate records through indexed attributes with a Web2-like query language. No external indexer"*, against the "indexer hell" of re-indexing or trusting someone else's server ([Fundamentals](https://docs.arkiv.network/start-here/fundamentals/), [Querying data](https://docs.arkiv.network/typescript-sdk/querying-data/), [JSON-RPC queries](https://docs.arkiv.network/json-rpc/querying-data/#query-syntax)).

We use it for the things a hash or a bare log cannot answer:

- "all reports in this district": `district = str('nashik')`;
- **amounts**: `amount_inr` is `u64`, so `gte(…, u64(500n))` works;
- **the map**: `lat_e5` and `lon_e5` are `i32`, and "what is inside this rectangle" is four `gte`/`lte` predicates, one round trip. The Map tab prints the query and the answer, and returned 1 pin around Nashik and 0 around Bengaluru ([friction F17](../arkiv/friction.md));
- **two entity types in one read**: a location attestation points at its report with a `key(...)` attribute, and one unscoped query returns both ([friction F9](../arkiv/friction.md)).

Honest note: Postgres could answer a bounding box too (two indexed columns). The difference is not capability, it is **whose server answers**: here the question goes to a public node, from a browser or from `curl`, with nothing of ours in the path.

### 3.5 Records that expire on their own **[official] [ours]**

*"Every entity has an expiration block. When it arrives, the entity leaves the query surface. You pay for the lifetime you choose."* ([Fundamentals](https://docs.arkiv.network/start-here/fundamentals/)).

For a ledger of accusations this is a feature, not a limitation. A demand from this October is not a current fact next year, and a stale claim about a district office is both unfair and a privacy liability. We write every report with `ExpirationTime.fromDays(180)`. Nobody schedules the removal, nobody can quietly decide what stays; the explorer still shows the creation transaction ([friction F14](../arkiv/friction.md)). The alternative on any other stack is a cron job we must keep running and could be told to alter.

### 3.6 No smart contracts, by construction **[official]**

Arkiv is *"a chain with a database engine instead of the EVM"*: *"A transaction is accepted only if its `to` address is a known Arkiv operation address. Every other transaction reverts. No bytecode is deployed"* ([Fundamentals](https://docs.arkiv.network/start-here/fundamentals/)). A contract-based registry would carry an upgrade key, an admin role or a pausable switch, and someone would hold it. Here there is no contract to hold.

### 3.7 Ordinary Ethereum tooling, so ordinary people can use it **[official] [ours]**

Wallets, transactions, receipts and JSON-RPC keep their Ethereum shape ([Fundamentals](https://docs.arkiv.network/start-here/fundamentals/)). That is why a visitor with no wallet gets a throwaway key made in the browser, funded with a few cents of test GLM by a faucet route behind a human check, and files in about 16 seconds ([friction F8](../arkiv/friction.md)); why a one-file page ([`public/mirror.html`](../public/mirror.html)) and a `curl` command read the whole ledger with no build and no server of ours; and why a judge, a journalist or a lawyer can verify a record themselves on the [explorer](https://tiramisu.explorer.arkiv.network).

### 3.8 Open reads, with an optional key **[official] [ours]**

Public reads need no account. When the anonymous budget bites (it does, [friction F2, F3, F11](../arkiv/friction.md)), Arkiv's [access keys](https://docs.arkiv.network/start-here/access-keys/) raise it; we tested 120 consecutive reads, all HTTP 200 ([friction F18](../arkiv/friction.md)). The key lives only on the server, never in the page.

## 4. A hostile day, step by step

Imagine a notice arrives on the day the ledger becomes inconvenient.

| Step | Postgres + API | IPFS | Subgraph | **underthetable on Arkiv** |
| --- | --- | --- | --- | --- |
| They ask the operator to remove a record | The operator can | The operator can unpin | The operator can stop indexing | The operator **cannot**: the owner is `0x…dEaD` |
| They take down the website | The record is gone with it | Content may remain, unindexed | The index goes; the chain remains | The rows remain; `mirror.html` and `curl` still read them |
| They ask for the author | We hold none: no account, no name, no network address | Same | Same | A throwaway wallet address, nothing else |
| They wait | A cron job we must keep alive | Content must be kept pinned | We must keep the indexer paid | The record expires on its own at 180 days, with no one deciding |

## 5. Honest limits, so the claims above can be trusted

- **Tiramisu is a testnet.** Earlier Arkiv testnets have been retired (Kaolin on 15 May 2026, Braga on 12 August 2026, per [older networks](https://docs.arkiv.network/networks/older-networks/)), and the maintained Arkiv guidance says their entities cannot be recovered. A testnet is not a promise of permanence ([Tiramisu](https://docs.arkiv.network/networks/tiramisu/)). What we demonstrate is the mechanism. A real deployment for this purpose needs a production network.
- **A single sequencer produces blocks** on this network ([Fundamentals](https://docs.arkiv.network/start-here/fundamentals/)). Nobody can delete a sealed row, but a sequencer could in principle decline to include a *new* write. This is a stated trade-off of the current architecture.
- **Arkiv says records are also committed to Ethereum "for durable archival, so data stays recoverable… even if every Arkiv node disappears"** ([Fundamentals](https://docs.arkiv.network/start-here/fundamentals/)). We did not test that and do not rely on it; our mirror reads from Arkiv nodes.
- **A public chain cannot erase abuse either.** Anyone can write anything. That is why every reader refuses what is not exactly the schema ([`src/lib/validate.ts`](../src/lib/validate.ts), `npm run audit`), and why the vocabulary has no free text.
- **A wallet is a pseudonym.** `$creator` links one wallet's reports to each other. Three wallets are not three people. A phone can fake a position. We say so on the page.
- **The anonymous read budget** is real and was our largest friction ([F2](../arkiv/friction.md)); an access key fixes it.

## 6. Check it yourself

```bash
git clone https://github.com/hatif03/underthetable && cd underthetable && npm ci
npm run audit    # every entity on Tiramisu against the closed lists: expect "outside the schema: 0"
npm run query    # the page's predicates, from the terminal
npm run repro    # friction F13, F5, F14, F15 against the live chain (writes nothing)
```

```bash
# the number of sealed entities, with no code of ours
curl -s https://rpc.tiramisu.db-chain.testnet.arkiv.network -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"arkiv_getEntityCount","params":[{"query":"project = str('"'"'underthetable'"'"') AND $owner = addr(0x000000000000000000000000000000000000dEaD)"}]}'
```

In the app: [**Map**](https://underthetable.vercel.app/#map) → "Search this view on Arkiv"; [**Record**](https://underthetable.vercel.app/#record) → "Look back"; [**mirror**](https://underthetable.vercel.app/mirror.html).

## References

Arkiv: [Fundamentals](https://docs.arkiv.network/start-here/fundamentals/) · [Installation](https://docs.arkiv.network/start-here/installation/) · [Access keys](https://docs.arkiv.network/start-here/access-keys/) · [Querying data (SDK)](https://docs.arkiv.network/typescript-sdk/querying-data/) · [Mutating data (SDK)](https://docs.arkiv.network/typescript-sdk/mutating-data/) · [Live events](https://docs.arkiv.network/typescript-sdk/live-events/) · [JSON-RPC queries](https://docs.arkiv.network/json-rpc/querying-data/) · [JSON-RPC mutations](https://docs.arkiv.network/json-rpc/mutating-entities/) · [Tiramisu](https://docs.arkiv.network/networks/tiramisu/) · [Agent skill and MCP](https://docs.arkiv.network/start-here/agent-skill/) · [Faucet and Hub](https://hub.arkiv.network/faucet) · [Block explorer](https://tiramisu.explorer.arkiv.network).
Others: [ThePrint on bribes.fyi](https://theprint.in/feature/bribes-fyi-anti-corruption-site-aryan-nishad/3018441/) · [IPFS persistence](https://docs.ipfs.tech/concepts/persistence/) · [The Graph subgraphs](https://thegraph.com/docs/en/subgraphs/quick-start/).
Ours: [schema](../arkiv/schema.md) · [friction](../arkiv/friction.md) · [arkiv-usage](arkiv-usage.md) · [submission](submission.md).
