# Contributing

under the table is MIT-licensed and built to be forked. The rule that matters more than any other: **nothing that identifies a person goes into this repository or onto Arkiv.** No names (also none in a URL slug), no phone numbers, no case numbers, no free-text stories.

## Run it

```bash
npm ci
npm test            # 32 tests; must pass
npm run dev         # http://localhost:5173
npm run build       # type-check and build
```

Reads need no key. Writing from your own machine needs test GLM from the [faucet](https://hub.arkiv.network/faucet) and a key in `.env` (copy `.env.example`; never commit `.env`).

## Things that are easy to contribute

| You want to... | Change | Check |
| --- | --- | --- |
| Add a district, or fix a renamed one | `data/districts.json` | `npm test`, `npm run catalog` |
| Add a service, a role or a kind of violation | `data/vocab.json` (closed lists; no free text), the label in `src/lib/labels.ts`, Hindi in `src/lib/i18n.ts`, a keyword rule in `src/lib/parse.ts` if a sentence should fill it | `npm test`, `npm run catalog` |
| Add a sourced press record | `data/press-records.json`: neutral wording, every source URL opened and read, severity by the scale in [what-is-recorded.md](docs/what-is-recorded.md), nothing that names a person | `npm run seed:press -- --dry` |
| Fix a translation | `src/lib/i18n.ts` | open the app in Hindi |
| Challenge a record | open an issue with the entity key and the article | the maintainers re-read the source |
| Report an Arkiv problem you reproduced | `arkiv/friction.md`: expected, actual, versions, steps. Only calls that were actually made | `npm run repro` for the existing ones |

Changing the data contract (`arkiv/schema.md`, `src/lib/validate.ts`, `src/lib/guard.ts`) changes what every reader accepts. Update the schema, the guard and the validator together, and add a hostile-input test for it.

## Forking it for somewhere else

Replace `data/vocab.json` and `data/districts.json` (and the state map with `node scripts/build-geo.mjs`), change the `project` string `underthetable` everywhere it appears (`grep -rn '"underthetable"' src server scripts`), and you have the same sealed, name-free ledger for another country or topic. See [docs/why-arkiv.md](docs/why-arkiv.md) for why the design depends on Arkiv.

## What is not MIT

The animation in the README is a stock download and is not covered by the MIT licence. See [docs/assets.md](docs/assets.md) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Do not add other third-party assets without recording their licence there.
