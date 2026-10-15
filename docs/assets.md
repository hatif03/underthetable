# Assets and credits

| What | Source | Licence | In the public repo? |
| --- | --- | --- | --- |
| Office tiles, characters, emotes, door, cauldron (`public/tilesets`, `public/characters`, `public/sprites`) | LimeZu, Modern Interiors and Modern Office series on itch.io | The team holds a LimeZu licence (confirmed by the team on 16 October 2026). Credit is given on the Office tab. | Yes. Committed with the repository. |
| Office scene code and map (`src/scene`, `public/maps/office2.json`) | Adapted from an MIT-licensed open-source Phaser office project. Only the scene was taken. | MIT | Yes. The notice is in [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md). |
| India state boundaries behind the dot map and the location check (`src/lib/indiaDots.ts`, `server/geo/states.json`) | DataMeet India community, <https://github.com/datameet/maps> | CC BY 4.0 | Yes, derived and simplified. Rebuild with `node scripts/build-geo.mjs`. |
| Fonts | Geist and Geist Mono (Vercel), Press Start 2P (CodeMan38) via `@fontsource` | SIL OFL 1.1 | npm packages |
| Icons | Lucide | ISC | npm package |
| UI primitives and command menu | Radix UI, cmdk | MIT | npm packages |

The art files are committed because the team confirmed it holds the licence. One thing to check before the repository is made public: LimeZu licences usually allow using the art inside a project and forbid handing the art out as a standalone pack. A public repository can look like the second. If the licence text says so, the fix is to put the three folders back in `.gitignore` and deploy from this machine. If the files are ever missing from a checkout, the Office tab shows a note and everything else works.
