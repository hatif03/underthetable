# Schema

underthetable stores two Arkiv entity types on Tiramisu (chain ID `7738577`): `report`, the claim, and `attestation`, a location check on a report. Arkiv is the Web3 database. Every entity is publicly readable. This file is the contract the app and the CLI both implement.

Network: HTTP `https://rpc.tiramisu.db-chain.testnet.arkiv.network`, WebSocket `wss://rpc.tiramisu.db-chain.testnet.arkiv.network`. SDK `@arkiv-network/sdk` 0.8.x.

If this file and [plan.md](../plan.md) disagree on an attribute, this file wins. Update both in the same change.

## report

A single non-identifying observation in a district, in a given week. `kind` says what it is. A `demand` is a rupee amount asked for a routine service. A `failure`, `absence`, or `diversion` is another district-level public condition: a broken road or light, a counter or post that is empty, or grain, fuel, a meal, or material that did not arrive. A `restriction` is a public freedom that was restricted: permission to assemble denied, a ban on gatherings, barricades or closures, force used at a gathering, a detention without notice, or an FIR not registered. None of these name a person, a unit, an office, or a street.

Changed 16 October 2026: `restriction` was added as a fifth kind, and new reports no longer write `day`. A day plus a district plus a service lets the official identify the reporter. The writer picks a week (this week, last week, or earlier) and the ISO week is the only date on chain. The 48 rows written before the change still carry `day`; readers treat it as optional and do not display it.

### Attributes

All names are snake_case. Values are wrapped in the SDK constructors at write time and in query predicates. Strings are slugs from `data/vocab.json` and `data/districts.json`, except `project`, `type`, `week`, `day`, and `outcome`.

| Attribute | Type | Query | Meaning |
| --- | --- | --- | --- |
| `project` | `str` | `eq` | Always `underthetable`. Every query includes this. The database is shared. |
| `type` | `str` | `eq` | Always `report`. |
| `state` | `str` | `eq` | State or union-territory slug, for example `mh`. |
| `district` | `str` | `eq` | District slug, for example `nashik`. No street, no GPS. |
| `department` | `str` | `eq` | One of `police`, `rto`, `revenue`, `passport`, `municipal`, `gst`, `electricity`, `income_tax`, `fda`, `ration`, `health`, `school`. |
| `role` | `str` | `eq` | A role title from the vocabulary, never a person's name. |
| `service` | `str` | `eq` | A service slug from the vocabulary for that department. |
| `outcome` | `str` | `eq` | For `demand`: `asked`, `paid`, or `refused`. For the other kinds: `noted`, `worsened`, or `cleared`. |
| `kind` | `str` | `eq` | `demand`, `failure`, `absence`, `diversion`, or `restriction`. A row written before this attribute existed is read as `demand`. |
| `week` | `str` | `eq` | ISO week of the incident in Asia/Kolkata, `YYYY-Www`. Chosen by the writer from the last 12 weeks. |
| `day` | `str` | `eq` | Legacy, optional, no longer written. It was the incident date, `YYYY-MM-DD`. |
| `source` | `str` | `eq` | Optional. `press` only, and only believed when `$creator` is a wallet in [data/curators.json](../data/curators.json). A report a curator wrote from a published news article. Absent on every citizen report. |
| `amount_inr` | `u64` | `eq`, `gte`, `lte` | For `demand`, whole rupees from 1 to 10000000. For the other kinds, a severity from 1 to 5. The same number field is used because ranges only work on numeric attributes. The page labels it rupees or severity from `kind`. |

`week` is computed by one shared function (`src/lib/week.ts`) from the week the writer picks. The week is not in the future, and not more than 180 days before the write, in Asia/Kolkata. `day` is accepted by the guard only as the input to that function and is never put on an entity.

Role slugs are only valid for their department:

| Department | Roles | Services |
| --- | --- | --- |
| `police` | `station_house_officer`, `constable`, `traffic_constable` | `fir_registration`, `noc`, `traffic_stop` |
| `rto` | `motor_vehicle_inspector`, `clerk` | `driving_licence`, `vehicle_registration`, `fitness_certificate` |
| `revenue` | `tehsildar`, `patwari`, `clerk` | `mutation`, `caste_certificate`, `income_certificate` |
| `passport` | `verification_officer`, `clerk` | `fresh_passport`, `police_verification` |
| `municipal` | `junior_engineer`, `clerk` | `birth_certificate`, `trade_licence`, `building_plan` |
| `gst` | `inspector`, `clerk` | `registration`, `refund` |
| `electricity` | `lineman`, `clerk` | `new_connection`, `name_transfer` |
| `income_tax` | `assessing_officer`, `clerk` | `refund`, `pan` |
| `fda` | `inspector`, `clerk` | `licence` |

`demand` uses the role and service columns above. The other kinds use the role `public` and a service from `data/vocab.json` `conditions`. Examples: municipal `pothole` or `broken_road` as a failure, health `medicine_missing` as an absence, ration `grain_short` as a diversion, police `assembly_permission_denied`, `gathering_ban_order`, `barricades_or_closures`, `force_at_gathering`, `detention_without_notice` or `fir_not_registered` as a restriction. The bucket includes `kind`, so a severity is never averaged with a rupee amount.

Internet shutdown orders are deliberately not a `restriction` service: they are a statutory order recorded elsewhere, not a district-level citizen report.

The quote rule is unchanged. Three distinct creators, earliest amount per creator, median. For a failure, absence, or diversion, that median is a severity.

### Press-sourced reports

Added 16 October 2026. A curator wallet (`0xC26DEbe828cd500c6d31F184BaeCce2782847eA3`, `PRESS_KEY`) writes a report from a published news article, with the same closed lists and the same batch, plus `source = press`. The reader treats it differently from a citizen report:

- It is **not a voice.** It never counts toward the 3-wallet figure, so a news article cannot make a desk look corroborated by citizens. It appears in its own section and in the feed, with a Press badge.
- It is believed only if its `$creator` is in `data/curators.json`. Anyone can write `source = press`; a row from any other wallet is read as an ordinary citizen row.
- The articles behind it are not on Arkiv (a URL is free text). They are in [data/press-sources.json](../data/press-sources.json), keyed by entity key, and listed in [docs/press-records.md](../docs/press-records.md).
- Severity on a non-demand press report is the curator's reading of the article, with the rule: 5 a death or serious harm, 4 mass detention or many people affected for days, 3 clearly reported with local impact or an order enforced, 2 limited or an order with no enforcement reported, 1 minor. A rupee amount is the amount the article states.
- Only incidents dated 9 to 16 October 2026 were written. No name appears in any field or note.

### Payload

Exactly the UTF-8 bytes of `{"v":1}`. Content type `application/json`. The payload is not queryable and carries no story, name, phone number, email, office, photo, or hash.

### Entity Expiration

Normal report: `ExpirationTime.fromDays(180)`. One seeded demo report: `ExpirationTime.fromHours(1)`, in a different district from the quoted example, so judges can see it leave queries. Entity Expiration emits no event. After it passes, judges use the creation transaction on the explorer.

Lifetime Extension is not used. `permissionlessExtension` is `false`. A second wallet's `extendEntity` must revert. A rival must not be able to keep one report alive past its Entity Expiration.

### Flags and ownership

`readonly: true`. Attributes and payload cannot be patched.

Created and transferred in one `executeBatch`. `predictEntityKeys` runs on the public client. The create uses that prediction's salt. The same batch's `ownershipChanges` sets the owner to `0x000000000000000000000000000000000000dEaD`.

After the batch:

- `$creator` is the writer. Immutable. The index trusts this, not any attribute.
- `$owner` is the dead address. The writer cannot delete the entity. The app shows a failed `deleteEntity` from the creator as the seal check.

### What is not an entity

The quoted district figure is computed by the reader.

Bucket: `kind`, `state`, `district`, `department`, `service`, `week`. A demand and a failure in the same district and week are different buckets.

Count distinct `$creator`. If one creator wrote twice, keep the earlier `$createdAt` and its `amount_inr`. The bucket is quoted at 3 or more distinct creators. The displayed amount is the median of those per-creator amounts. Below 3, show the rows as unquoted with the creator address. Do not write a tally entity.

## attestation

The second entity type, added 16 October 2026. A location check: a trusted checker wallet vouches that the wallet that filed a report was inside the report's state when it filed. The design and its limits are in [docs/verification.md](../docs/verification.md).

| Attribute | Type | Query | Meaning |
| --- | --- | --- | --- |
| `project` | `str` | `eq` | Always `underthetable`. |
| `type` | `str` | `eq` | Always `attestation`. |
| `report` | `key` | `eq` | The entity key of the report it vouches for. An entity-key reference, not a copy of any data. |
| `method` | `str` | `eq` | `geo`. |
| `scope` | `str` | `eq` | `state`. District scope is not built. |
| `state` | `str` | `eq` | The state slug the position was inside. It must equal the report's `state` to count. |

Payload `{"v":1}`. Flags `{ readonly: true, permissionlessExtension: false }`. `ExpirationTime.fromDays(180)`. Created and handed to `0x000000000000000000000000000000000000dEaD` in one `executeBatch`, like a report.

**Trust is `$creator`.** Anyone can write an entity that looks like this one. A reader counts an attestation only if its `$creator` is in [data/attesters.json](../data/attesters.json). The checker wallet today is `0xabd68359A33fAb9A03Bb706B56272370A011E5b6`. It signs nothing else.

What is deliberately not here: the position, the time, the network address, the signature, the filing wallet's address. The attestation says "inside" the state, and nothing more. The report it points at already names the district and week.

Counting: for each bucket the reader counts wallets that have at least one report in it with a matching, trusted attestation (`verifiedVoices`). A bucket with 3 or more is **corroborated**. Quoting is unchanged: 3 distinct creators, checked or not.

## What counts as valid

Anyone can write anything to a public chain, and an entity cannot be removed. So every reader applies one rule, defined in [src/lib/validate.ts](../src/lib/validate.ts), before it counts or shows an entity. The page, the CLI (`npm run query`) and `npm run audit` use the same code. The one-file mirror applies the structural part of it.

A **report** is valid if all of these hold:

- Its attributes are a subset of the schema's twelve names. Any other attribute makes it invalid.
- `project` is `underthetable` and `type` is `report`.
- Its payload is exactly `{"v":1}`.
- Its **owner is `0x…dEaD`**, so its writer could not delete it later.
- `state` is on the list; `district` is on the list **for that state**; `department`, `role`, `service`, `outcome` and `kind` are on the lists for that kind, and the role belongs to the department.
- `amount_inr` is a `u64`: 1 to 10,000,000 for a demand, 1 to 5 otherwise.
- `week` looks like `2026-W42`, is not in the future, and is not more than 400 days old.
- `day`, if present, looks like a date. `source`, if present, is `press`.

An **attestation** is valid if its attributes are exactly `project`, `type`, `report` (a key), `method = geo`, `scope = state` and `state`, its payload is `{"v":1}`, and its owner is the dead address. A position field makes it invalid.

An invalid entity is ignored: not shown, not counted, not a voice. It stays on the chain until it expires. `npm run audit` lists every entity that fails, and anything whose string values look like a phone number, an email, a case number or a name.

## Queries

Replace `<district>` and `<address>`. Always pass `u64` for amounts. Paginate with the cursor and the first page's `atBlock`. Cap is 200 per page. Sort on the client. There is no `orderBy`.

District board:

```
project = str('underthetable') AND type = str('report') AND district = str('<district>')
```

```ts
publicClient
  .select({
    key: true,
    creator: true,
    owner: true,
    createdAt: true,
    expiresAt: true,
    attributes: true,
  })
  .where(
    eq("project", str("underthetable")),
    eq("type", str("report")),
    eq("district", str(district)),
  )
  .limit(200)
  .fetch()
```

Minimum amount, same district:

```
project = str('underthetable') AND type = str('report') AND district = str('<district>') AND amount_inr >= u64(500)
```

Flood wallet:

```ts
.where(
  eq("project", str("underthetable")),
  eq("type", str("report")),
)
.createdBy(floodAddress)
```

Count for the header: `getEntityCount` with the district predicate.

The attestation for one report:

```
project = str('underthetable') AND type = str('attestation') AND report = key('<report key>')
```

```ts
publicClient
  .select({ key: true, creator: true, attributes: true })
  .where(
    eq("project", str("underthetable")),
    eq("type", str("attestation")),
    eq("report", key(reportKey)),
  )
  .limit(1)
  .fetch()
```

The page makes one unscoped read of **every `underthetable` entity, reports and attestations together** (`project = str('underthetable')` with no `type` term, one page of up to 200, `atBlock` pinned, 50 reports and 1 attestation when last run), tells them apart by the `type` attribute, and computes districts, desks, the map and trends in the browser. The anonymous budget is about 100 queries an hour, so a district change is not a new query.

Live board: `watchEntityEvents` on a public client whose transport is the WebSocket RPC, with no `fromBlock`. The event carries `entityKey`, `owner`, `expiresAt` and `creationFlags`, but no attributes. The chain is shared (77 creates in 90 seconds when measured), so the page ignores an event unless `readonly` is true, `permissionlessExtension` is false, and `expiresAt - blockNumber` is within 2,000 blocks of 7,776,000 (180 days at 2 seconds). Only then does it call `getEntity`, at most once every 5 seconds, and keeps the row if `project` is `underthetable`. A one-hour demo row is picked up by the next snapshot read instead.

Seal check, `npm run verify`: `getEntity` on a live report, then `patchEntity` and `deleteEntity` and `extendEntity` from its creator and `extendEntity` from another wallet. All four must revert.

## Write

One batch, sequential per wallet. Two in-flight transactions from the same wallet collide on nonce.

```ts
const [predicted] = await publicClient.predictEntityKeys({
  owner: walletClient.account.address,
  count: 1,
})

await walletClient.executeBatch({
  creates: [{
    payload: jsonToPayload({ v: 1 }),
    contentType: "application/json",
    attributes: {
      project: str("underthetable"),
      type: str("report"),
      state: str("mh"),
      district: str("nashik"),
      department: str("rto"),
      role: str("motor_vehicle_inspector"),
      service: str("driving_licence"),
      outcome: str("asked"),
      kind: str("demand"),
      week: str("2026-W42"),
      amount_inr: u64(500n),
    },
    expires: ExpirationTime.fromDays(180),
    flags: { readonly: true, permissionlessExtension: false },
    salt: predicted.salt,
  }],
  ownershipChanges: [{
    entityKey: predicted.key,
    newOwner: "0x000000000000000000000000000000000000dEaD",
  }],
})
```

The guard rejects the write before RPC if any slug is off-list, the amount is out of range, the payload is not `{"v":1}`, or any string contains an email, `+91`, or a run of 10 or more digits.
