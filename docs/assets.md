# Assets and credits

> **Live:** [underthetable.vercel.app](https://underthetable.vercel.app) · [mirror](https://underthetable.vercel.app/mirror.html) · [repository](https://github.com/hatif03/underthetable) · [all screenshots](screenshots/README.md)

| What | Source | Licence | In the public repo? |
| --- | --- | --- | --- |
| India state boundaries behind the dot map and the location check (`src/lib/indiaDots.ts`, `server/geo/states.json`) | DataMeet India community, <https://github.com/datameet/maps> | CC BY 4.0 | Yes, derived and simplified. Rebuild with `node scripts/build-geo.mjs`. |
| Hero animation (`docs/media/corruption-animation.mp4` and `.gif`, used at the top of the README) | A stock animation downloaded by the team (the file name is from a stock-animation site) | **Not covered by the project's MIT licence.** The team should confirm the stock licence allows use in a public repository and a README; if it does not, delete `docs/media/` and the image at the top of `README.md`. | Yes, in `docs/media/`. |
| Fonts | Geist and Geist Mono (Vercel) via `@fontsource` | SIL OFL 1.1 | npm packages |
| Icons | Lucide | ISC | npm package |
| UI primitives and command menu | Radix UI, cmdk | MIT | npm packages |

The Office tab (a pixel-art office with LimeZu art and scene code adapted from an MIT-licensed project) was removed on 17 October 2026 because it was unrelated to the product. No part of it remains in the repository or the build.
