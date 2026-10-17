# Screenshots

Taken 17 October 2026 from the running app with `npm run screenshots` (reads only; it never files a report). They show the live Tiramisu data at block 687,429: 62 press-sourced records, 51 synthetic demo rows hidden by default, and one demo map pin.

| File | What it shows |
| --- | --- |
| [01-pulse.png](01-pulse.png), [02-pulse-full.png](02-pulse-full.png) | The Pulse: totals, the six things that can be documented (with the original animated drawings), the dot map, the live feed |
| [03-what-can-be-documented.png](03-what-can-be-documented.png) | The categories strip: demand, failure, absence, diversion, rights violation, internet shutdown |
| [04-dot-map.png](04-dot-map.png) | One dot per half degree, coloured by reports per state |
| [05-press-records.png](05-press-records.png) | Press-sourced incidents, each with its articles, never counted as a citizen |
| [06-map.png](06-map.png) | The Map tab: pinned public-infrastructure problems on a street map |
| [07-map-arkiv-range-query.png](07-map-arkiv-range-query.png) | "Search this view on Arkiv": four `i32` range predicates and the result, with the exact query printed |
| [08-report-form-pin.png](08-report-form-pin.png) | The report form for a pothole, with the pin picker and the public summary including the pin |
| [09-report-form-shutdown.png](09-report-form-shutdown.png) | A sentence ("Mobile internet was shut down in New Delhi...") filling a rights-violation slip on the device |
| [10-record.png](10-record.png) | The Record, with "Look back" (an `atBlock` query) |
| [11-sealed.png](11-sealed.png) | "How it is sealed": the checks anyone can run |
| [12-pulse-dark.png](12-pulse-dark.png) | The dark theme, from the sun/moon toggle in the header |
| [13-pulse-hindi.png](13-pulse-hindi.png) | The Hindi interface |
| [14-pulse-mobile.png](14-pulse-mobile.png), [15-map-mobile.png](15-map-mobile.png) | A 390 px phone |
| [16-mirror.png](16-mirror.png) | `mirror.html`: one file, no server of ours, reads Arkiv directly |
| [terminal-query.txt](terminal-query.txt), [terminal-audit.txt](terminal-audit.txt), [terminal-verify.txt](terminal-verify.txt), [terminal-repro.txt](terminal-repro.txt) | Terminal output of `npm run query`, `audit`, `verify` and `repro` against the live chain |

Not included: a filing receipt. Filing writes a permanent public entity, so no synthetic citizen report was created just for a picture. The receipt, with its `$creator`, `$owner`, human-check and location-check lines, can be produced by following step 6 of [../submission.md](../submission.md).
