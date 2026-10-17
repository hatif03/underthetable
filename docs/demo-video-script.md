# Demo video: what to say, what to record, and how

> **Live:** [underthetable.vercel.app](https://underthetable.vercel.app) · [repository](https://github.com/hatif03/underthetable) · [pitch](pitch.md) · [submission](submission.md)

**Limit: 3 minutes (180 s).** Aim for **2:50**. The narration below is about 490 words, which at a fast but clear pace (about 170 words a minute) is 2:55, so rehearse it with a timer and use the cut list in section 2 if you run over. Judges score Why Arkiv and How you use Arkiv on 25 points each, so a third of the time is spent proving Arkiv does something a normal database cannot. Everything else serves the story.

The one idea the video must land: **"Nobody can delete this, and you can check that yourself."** Every scene either tells the story or proves that sentence.

---

## 0. Before you press record (20 minutes)

### Setup

| Thing | Do this |
| --- | --- |
| Screen recorder | OBS Studio (free), or Windows Game Bar (`Win+G`), or Loom. 1920x1080, 30 fps. Record audio at the same time or record the voice separately afterwards (see the end). |
| Browser | A clean Chrome profile or a private window. Hide the bookmarks bar. Zoom 100%. Window **1440x900** or full screen at 1080p. Turn off extensions that show in the toolbar. |
| Tabs, in this order | 1. https://underthetable.vercel.app 2. https://underthetable.vercel.app/#map 3. https://underthetable.vercel.app/#record 4. `file:///` path of `public/mirror.html` (open it from disk, not from the site) 5. the GitHub repo README |
| Terminal | Large font (18 pt or more), dark theme, window sized to about 100 columns. `cd` into the repo. Run `clear`. |
| Stay off camera | **`.env`, the Vercel dashboard, the Arkiv Hub access-keys page, your password manager, any key.** Never `cat .env` and never open it in the editor while recording. Wallet addresses are public and fine. |
| Notifications | Turn on Do Not Disturb. Close chat apps. |
| Language | English interface. (Show Hindi for two seconds only if you have time.) |

### Pre-flight checks (do each once, in private, before recording)

1. Open the live app. The footer should say it read from Tiramisu. The Pulse shows **73** sealed reports with the demo rows hidden.
2. Map tab: you should see 11 pins across India. Press **Search this view on Arkiv**. It should say Arkiv returned 11 pinned problems at the zoom you recorded at, and print the query.
3. In the terminal run `npm run audit` and `npm run query -- --district nashik`. If either says the public node refused the read, wait a minute or make sure `ARKIV_ACCESS_KEY` is in your `.env`, then retry. Do not record a failure.
4. Open `mirror.html` from disk. It should say about "113 valid of 114 read" (the count moves by one or two as one-hour demo rows expire).
5. Decide the **report you will file** (see Scene 3) and have a wallet ready with test GLM in it. If you file, it writes a **permanent public entity** from that wallet.
6. Optional but strong: to make the Entity Expiration panel move on camera, run `npm run seed -- --short` an hour before recording (needs the team keys). It writes a report that expires in about an hour.

### A decision about Scene 3 (filing a report)

You now file with **your own wallet**, so you need one ready before you record:

1. A browser wallet extension (MetaMask, Rabby, or similar) in the Chrome profile you record in. Create a fresh account for the video; do not show a wallet that holds anything real. Test GLM is worth nothing, but a seed phrase is not: **never show the seed phrase, and close the wallet's "reveal" screens**.
2. **Test GLM in that account.** Get it from https://hub.arkiv.network/faucet (connect the wallet, solve the CAPTCHA). One report costs about 0.0002 GLM, so a faucet drip covers hundreds. Do this the day before, not on camera.
3. Do **one full dry run** with the wallet before recording. The first time, the wallet asks to **add the Tiramisu network** (chain 7738577) and then to **switch** to it. Approve both. Decide whether you want that on camera (it is a good ten seconds: "the app adds the network for me") or already done (cleaner).
4. Know what the wallet pop-up looks like for **File** (a confirmation for a transaction to the Arkiv address) so you are not surprised on camera.

Filing creates a real, permanent, public entity from that wallet. You have two honest options:

- **A. File one real report** about something you actually saw (a pothole near you, with a pin on it). This is the strongest proof. Pick something true and public. Do **not** invent an incident.
- **B. Do not file.** Use the Map tab, then show "you cannot delete it" in the terminal with `npm run verify` (it uses the team's demo wallets and a report that already exists). Say plainly that it is the demo.

Whichever you choose, say which it is out loud. Never present a demo report as a real citizen's. The team's stand-in-wallet test (`npm run e2e:wallet`) already proved the whole path works; do not use its output as if it were a person.

---

## 1. The script

Read it as written, slowly. **[Brackets]** are actions, not words. Times are targets.

### Scene 1: the hook (0:00 to 0:22)

**On screen:** the README top with the animation (tab 5) for 4 seconds, then cut to the live Pulse (tab 1), slowly scrolling to the six category cards.

> In English, a bribe moves *under the table*. An envelope, below the line of sight, and nothing written down.
>
> In India that table hides more than envelopes: the order that cuts a district's internet, the protest ground quietly struck off the list, the bulldozer that comes before the paperwork.
>
> "History is a set of lies agreed upon": a line attributed to Napoleon, who credited someone else. An agreed history needs a record that can be edited.

*(about 65 words)*

### Scene 2: why it has to be built this way (0:22 to 0:45)

**On screen:** the Sealed page (tab, "How it is sealed") or the README bribes.fyi paragraph. Keep the link to ThePrint visible if you can.

> In August a bribe tracker called bribes.fyi collected six hundred reports, then closed, with a notice that included "the permanent deletion of any recorded data". Nobody said it was forced. One person could make the record vanish, and did.
>
> So we built the opposite: a district ledger where the operator has nothing to hand over. No names. No free text. And once written, not even we can delete it.

*(about 60 words)*

### Scene 3: report something, with your own wallet (0:45 to 1:40)

**On screen:** Pulse. Click **Report**.

1. **[Type this sentence into the box; it takes about 5 seconds]** *"Last week in Nashik there is a deep pothole on the main road near the bus stand. Call me on 9876543210."*
   > I type a sentence. It is read on this device and never sent. Watch: the phone number is struck out, and the slip fills itself, a failure, a pothole, Nashik.
2. **[Point at "Taken out of what was read", then at "Filled: kind, desk, district…"]**
3. **[Scroll to the pin map. Click "Use my current location" or click the map on the pothole, then point at the public summary box]**
   > A pothole may carry an exact pin, because it is a broken public thing. A bribe or a detention never can: an exact place and a week could identify a person. And this box is everything that becomes public. No name, no day.
4. **[Scroll to "Report with". "My wallet" is already selected. Press "Connect wallet". Approve in the wallet pop-up. The line changes to "Connected 0x… on Tiramisu · 0.0xxx test GLM"]**
   > I report with my own wallet. No account with us, no sign-up. It connects, adds the network if it has to, and shows my balance. There is a one-tap key for people without a wallet, but this is the way: nothing of ours pays for it or can stop it.
5. **[Leave "Check my location" on. Press "File the report". Approve the transaction in the wallet pop-up. Let the status lines run: Reading your location, Sealing on Tiramisu, Asking the checker to vouch]**
   > One transaction. I sign it myself.
6. **[The receipt appears with the SEALED stamp. Point at `$creator` (your address) and `$owner`]**
   > The creator is my address. The owner is this one, a dead address that nobody holds, set in the same transaction. If the hand-over fails, the report is never created.
7. **[Press "Try to delete it". The failure text appears (the wallet may show a warning that the transaction is expected to fail; that is the point). Hold on it for two seconds]**
   > Watch me try to delete my own report.

*(about 190 words with the narration split across steps; speak over the clicking, do not wait in silence. If this runs long, cut the pin sentence in step 3 and the "one-tap key" sentence in step 4.)*

> **If you chose option B (no filing):** replace steps 5 to 7 with a cut to the terminal, run `npm run verify`, and say: "This is a report that already exists. I try to patch it, delete it, extend its life, and extend it from a stranger's wallet. All four fail, because the owner is a dead address."

### Scene 4: the map, and a question only Arkiv answers (1:35 to 1:58)

**On screen:** tab 2 (Map): eleven pins across India, each from a news report. Click one pin to show its popup and explorer link. Press **Search this view on Arkiv**. Hold on the printed query.

> The map asks the chain a question directly: what is inside this rectangle? Four range predicates on two integer attributes. That is the query, printed here, and Arkiv answers it. There is no server of ours in the way.

*(about 40 words)*

### Scene 5: prove it, three ways (1:58 to 2:32)

**On screen:** the terminal.

1. **[Run `npm run audit`. Let it print. Point at "valid reports: 113" and "outside the schema: 0"]**
   > Every entity on the chain, checked against our closed lists. Nothing outside them. And every one of these reports is owned by that dead address.
2. **[Cut to the Record tab (tab 3). Choose "Look back", "As of 1 hour ago". Point at the line that compares the earlier rows with now]**
   > Sealed rows cannot change, so the ledger an hour ago must be a subset of now. It is: every row, identical. A table we ran could not prove that.
3. **[Cut to `mirror.html` opened from disk (tab 4). Scroll the table. Say the next line over it]**
   > And this is one file, opened from my disk. No server of ours. It reads Arkiv directly. Take our site down and the record is still here.

*(about 85 words)*

### Scene 6: close (2:32 to 2:50)

**On screen:** the Pulse, then the README title with the live URL visible.

> under the table has sixty-two sourced records from this fortnight, a district ledger for India, entered in three tracks: Best Indian Use Case, Censorship Resistance, and Open Source. The code is MIT, the schema and our friction report are in the repository, and every claim here you can re-run yourself.
>
> Bring it out from under the table.

*(about 55 words)*

**End card (hold 3 seconds):** `underthetable.vercel.app` and `github.com/hatif03/underthetable`.

---

## 2. Timing, and what to cut if you run long

| Scene | Start | Length | Words |
| --- | --- | --- | --- |
| 1 Hook | 0:00 | 22 s | 65 |
| 2 Why | 0:22 | 23 s | 60 |
| 3 Report | 0:45 | 55 s | 190 |
| 4 Map | 1:40 | 23 s | 40 |
| 5 Proof | 2:03 | 34 s | 85 |
| 6 Close | 2:37 | 18 s | 55 |
| **Total** | | **2:55** | **about 495** |

If your read-through is over 2:55: cut the Napoleon sentence in Scene 1 to *"'History is a set of lies agreed upon.' An agreed history needs a record that can be edited."*, drop step 3's pin explanation to one sentence, and skip the Look back in Scene 5. **Never cut**: the phone number struck out, "Try to delete it", the map's range query, `npm run audit`, and `mirror.html`. Those are the proof.

## 3. How to record it well

1. **Rehearse twice with a timer**, once reading and once clicking. Then record in one take per scene, not one 3-minute take, and join them. A clean scene is easier to redo than a whole video.
2. **Move the mouse slowly and deliberately.** Point at what you are saying. Pause the cursor on the important line for a full second. Turn on the cursor highlight in OBS (or Windows Pointer options) so viewers can follow it.
3. **Type at a steady speed.** If you fumble, use the paste text above; the app reads it after a short delay, so wait a moment for "Filled:" to appear.
4. **Zoom in on small text.** The receipt, the printed query and the audit output are small. Use browser zoom 125% for those scenes, or an editor zoom of 1.3 to 1.5.
5. **Let the loading states show.** "Getting a few cents of test gas" and "Sealing on Tiramisu" are proof that something real is happening; do not edit them out, but you may speed them up 2x.
6. **Voice.** Record in a quiet room, phone or headset mic 15 cm from your mouth, no echo. Speak a little slower than feels natural. Smile on the first line.
7. **If a read fails on camera** (the public node refusing, a 429): stop, wait a minute, retry. With the access key in `.env` the terminal commands should not fail. The live app has a snapshot cache and a "Read directly instead" link in the footer.
8. **Subtitles.** Add them. Many judges watch muted. YouTube's auto-captions are fine; check the names `Arkiv`, `Tiramisu`, `$owner`.

## 4. Editing and delivery

| Step | Detail |
| --- | --- |
| Editor | CapCut, DaVinci Resolve (free), Clipchamp, or iMovie. Trim, join the scene takes, add subtitles, add the end card. |
| Length check | Final file **under 3:00**. The limit is hard (180 s). Aim for 2:50. |
| Export | 1080p, MP4 (H.264), under about 200 MB. |
| Upload | YouTube set to **Unlisted** (or Loom/Vimeo link). Open the link in a private window to confirm it plays without signing in. |
| Where it goes | The Devfolio **project links** field (the demo video), and the README under the animation: add a line `**[Watch the 3-minute demo](YOUR_LINK)**`. Commit that change before the deadline. |
| Thumbnail | The Pulse screenshot with the words "Under the table". |
| Title | *under the table: a ledger nobody can delete (Arkiv Global Tour Stop)* |
| Description | One line, the live URL, the repo URL, "Entered in Best Indian Use Case, Censorship Resistance and Open Source." |

## 5. A checklist to run just before you upload

- [ ] The video is 3:00 or shorter.
- [ ] No key, no `.env`, no dashboard is visible anywhere. Pause on frames with the terminal and check.
- [ ] The phone number on screen is the fake one in the script, not a real one.
- [ ] You said whether the report you filed was real or a demo.
- [ ] The words "Arkiv", "Tiramisu" and "`$owner`" are clear.
- [ ] The video plays in a private window.
- [ ] The README and Devfolio link to it.

## 6. If you only have 90 seconds

Scene 1 (cut to two sentences), Scene 3 steps 1, 3 and 6 (type the sentence, show the public summary, try to delete), Scene 4, and `npm run audit` plus `mirror.html` from Scene 5. Close with the last line. That covers the story and the proof.
