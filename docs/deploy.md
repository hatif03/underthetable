# Deploying, and where each key comes from

Written 16 October 2026. Everything here was checked against the official Arkiv documentation or run on this machine, except the Vercel and Hub screens, which I could not open and so describe from their documentation.

## What runs where

- **The page** is static (`dist/`). It needs no key. It reads Arkiv through `/api/snapshot`, and falls back to the public RPC.
- **Five server routes** are in `api/*.js`, plain JavaScript with their dependencies bundled inside (built by `npm run build:api` from `server/handlers/`, and committed, so Vercel runs them as they are). They are tested by calling each one directly.

| Route | Needs | Does |
| --- | --- | --- |
| `/api/snapshot` | `ARKIV_ACCESS_KEY` (optional) | One shared read of Arkiv, cached five minutes |
| `/api/drip` | `DRIP_KEY` | Sends 0.02 test GLM to a visitor's new browser key |
| `/api/attest` | `ATTEST_KEY` | Writes a location attestation |
| `/api/rpc` | `ARKIV_ACCESS_KEY` (optional) | Read-only relay. Off unless the build sets `VITE_RPC_RELAY=1`. |
| `/api/assist` | `IFM_API_KEY` | Not used by the page. Leave it unset. |

## The keys

| Name | What it is | Where it lives | How to get it |
| --- | --- | --- | --- |
| `DRIP_KEY` | A wallet that pays the first gas for new visitors | Vercel, and your `.env` | **Already made.** `npm run wallet -- DRIP_KEY` created it, address `0x0812fed1e90C8d2bff9C3EdB0D3D46CbEf5FA303`, funded with 3 test GLM (about 150 visitors). Top up: `npm run wallet -- fund 0x0812fed1e90C8d2bff9C3EdB0D3D46CbEf5FA303 2`. |
| `ATTEST_KEY` | The location checker wallet. Its address must be in `data/attesters.json`. | Vercel, and your `.env` | **Already made**, address `0xabd68359A33fAb9A03Bb706B56272370A011E5b6`, about 0.5 GLM (hundreds of attestations). Use the same key on Vercel, because the page only believes this address. |
| `ARKIV_ACCESS_KEY` | A Hub access key. It raises the RPC budget. | Vercel, and your `.env` | See the next section. |
| `ARKIV_RPC_URL` | The RPC address | Vercel | Leave the default, `https://rpc.tiramisu.db-chain.testnet.arkiv.network`. Do not put the key in it. |
| `PRESS_KEY` | The press curator wallet | **Your machine only** | Already made, address `0xC26DEbe828cd500c6d31F184BaeCce2782847eA3`. Never on a host. |
| `SEED_KEY_1..3`, `FLOOD_KEY` | The synthetic seed wallets | **Your machine only** | Already made. `SEED_KEY_1` pays for transfers and holds about 2.9 GLM. |
| `IFM_API_KEY` | An optional text assistant | Nowhere | **Do not deploy it.** The page does not call it. The key was pasted into a chat on 16 October: revoke it in the provider's dashboard and leave the variable empty. |
| Vercel login | Your account | Your machine | `npm i -g vercel`, then `vercel login` (an emailed link or GitHub sign-in). |

To read a key you need to paste into Vercel, open `.env` yourself in an editor. Nothing here prints one. Check what every wallet holds with `npm run wallet -- balances`.

## Getting the Hub access key

From the official documentation (docs.arkiv.network, "Access Keys"):

1. Open **https://hub.arkiv.network/access-keys** in a browser that has a wallet extension.
2. Connect a wallet you control and sign in. Use your own wallet, not one of the project keys: you do not want a project key inside a browser extension.
3. Register a project if the page asks. Choose the **Tiramisu** network, because a key works on one network only. Complete the CAPTCHA.
4. Copy the key. There is **one key per wallet per network**, with a **monthly quota of 1,000,000 cost units** (about 10,000 queries at roughly 100 units each). The Hub's Usage tab shows what is left.
5. Put it in `.env` as `ARKIV_ACCESS_KEY=...` and in Vercel (below). The code sends it as the `X-API-KEY` header, only to an `arkiv.network` address, and only from a server or a script. It does not exist in the browser. Never put it in a variable that starts with `VITE_`: that would put it in the page.

The Hub pages showed only "Loading" when I opened them without a wallet, so I could not read the steps from the screen. The steps above are from the documentation, and the Hub may differ in small ways. You do not need the key to deploy: the site works without it, only with a smaller budget. With it, the snapshot route can serve many judges comfortably.

The faucet (https://hub.arkiv.network/faucet) is the same kind of flow, a connected wallet and a CAPTCHA. You do not need it: `SEED_KEY_1` already holds test GLM and `npm run wallet -- fund` moves it.

## Deploy

```bash
npm i -g vercel
vercel login
vercel link                    # create a new project, accept the detected Vite settings
vercel env add DRIP_KEY production
vercel env add ATTEST_KEY production
vercel env add ARKIV_ACCESS_KEY production      # skip if you have no key yet
vercel deploy --prod
```

Each `env add` asks for the value; paste it from `.env`. Add them as **sensitive**/encrypted if Vercel offers it. After the first deploy, any change to an environment variable needs a new deploy.

The office art is committed, so it ships with the deploy. If you decide it must not be in a public repository, gitignore `public/tilesets`, `public/characters` and `public/sprites` and run `vercel deploy --prod` from this folder: the deploy uploads your local files, not the repository.

## Check it, from a private window and a phone

1. The page loads with data and the footer says "through our snapshot cache".
2. `/api/snapshot` returns JSON with a header `X-Snapshot: fresh`.
3. Press Report with the location check on, allow the position, file. The receipt shows the dead owner and a link to the attestation. If the faucet or the checker is missing a variable, the receipt says so in a sentence.
4. `/mirror.html` lists the same rows.
5. In the Vercel dashboard, Functions, check that `/api/attest` and `/api/drip` show no errors.

If an `/api/*` route returns 500, read its log in the dashboard first. The usual cause is a missing environment variable. If the bundles are out of date, run `npm run build:api` and redeploy.

## Keep up to 23 October

The deployment must stay up until 23 October. The keyed budget is about 10,000 queries a month. The snapshot route reads at most once every five minutes and only when someone asks, which stays under that.
