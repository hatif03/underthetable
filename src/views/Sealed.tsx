import { ExternalLink, Fingerprint, Hourglass, Link2, Lock, ShieldOff } from "lucide-react"
import { DEAD, EXPLORER, entityUrl } from "../lib/client"
import { shortAddress } from "../lib/format"
import type { Live } from "../state/useDerived"
import { CopyLine } from "../ui/kit"

const RPC_URL = "https://rpc.tiramisu.db-chain.testnet.arkiv.network"
const CURL_ALL = `curl -s ${RPC_URL} -H "content-type: application/json" -d "{\\"jsonrpc\\":\\"2.0\\",\\"id\\":1,\\"method\\":\\"arkiv_query\\",\\"params\\":[\\"project = str('underthetable') AND type = str('report')\\",{\\"limit\\":\\"0xc8\\",\\"select\\":{\\"key\\":true,\\"owner\\":true,\\"creator\\":true,\\"attributes\\":true}}]}"`
const CURL_DEAD = `curl -s ${RPC_URL} -H "content-type: application/json" -d "{\\"jsonrpc\\":\\"2.0\\",\\"id\\":1,\\"method\\":\\"arkiv_getEntityCount\\",\\"params\\":[{\\"query\\":\\"project = str('underthetable') AND \\$owner = addr(0x000000000000000000000000000000000000dEaD)\\"}]}"`

const NEVER = ["Your name, phone, email, Aadhaar", "Your position (rounded to about 5 km, used once by the location checker, not stored)", "A named officer, office, shop, school or street", "GPS, photos, video", "The day it happened (only the ISO week)", "The sentence you typed", "A hash of any of those"]

export function Sealed({ live }: { live: Live }) {
  const sample = live.d.live.find((row) => row.owner.toLowerCase() === DEAD.toLowerCase())
  const district = sample?.district ?? "nashik"
  return (
    <div className="stack">
      <header className="section-head">
        <h2>How a report is sealed</h2>
        <p className="muted">Every claim below can be checked against the public RPC, without this website.</p>
      </header>

      <section className="card">
        <header className="card-head">
          <h2>Why this exists</h2>
        </header>
        <p>
          In July 2026 a student-built site, bribes.fyi, let people report bribe demands. It collected more than 600 reports. In its last 48 hours it logged over five million requests and more than 200,000 new users. On 18 August its operators ended submissions and said the recorded data would be permanently deleted.
          <a href="https://theprint.in/feature/bribes-fyi-anti-corruption-site-aryan-nishad/3018441/" target="_blank" rel="noreferrer"> ThePrint, 18 August 2026</a>.
        </p>
        <p className="muted">
          A record like this has a use. I Paid a Bribe, run by Janaagraha, fed an ombudsman whose April 2016 passport report recommended dropping the police verification of addresses, which often involves bribes.
          <a href="https://www.ideasforindia.in/topics/governance/i-paid-a-bribe-using-technology-to-fight-corruption-in-india" target="_blank" rel="noreferrer"> Ideas for India, June 2016</a>.
          The record has to outlive the people who keep it. That is the only thing here that needs a chain.
        </p>
      </section>

      <section className="grid-3">
        <article className="card pillar">
          <Lock size={20} />
          <h3>We cannot delete it</h3>
          <p className="muted">One transaction creates the report and transfers it to <code>0x…dEaD</code>. The creator keeps no key. <code>readonly</code> blocks edits.</p>
        </article>
        <article className="card pillar">
          <Hourglass size={20} />
          <h3>It leaves on its own</h3>
          <p className="muted">Entity Expiration of 180 days. <code>permissionlessExtension</code> is off, so nobody can pin a single report past that.</p>
        </article>
        <article className="card pillar">
          <Fingerprint size={20} />
          <h3>A figure needs 3 wallets</h3>
          <p className="muted">The median is computed by you, in the browser, from <code>$creator</code>. There is no tally entity for anyone to forge.</p>
        </article>
      </section>

      <section className="card">
        <header className="card-head">
          <h2>Check one yourself</h2>
        </header>
        {sample ? (
          <dl className="facts">
            <div>
              <dt>Entity</dt>
              <dd>
                <a href={entityUrl(sample.key)} target="_blank" rel="noreferrer">
                  {shortAddress(sample.key)} <ExternalLink size={12} />
                </a>
              </dd>
            </div>
            <div>
              <dt>$owner</dt>
              <dd>
                <code>{sample.owner}</code>
              </dd>
            </div>
            <div>
              <dt>$creator</dt>
              <dd>
                <code>{sample.creator}</code>
              </dd>
            </div>
            <div>
              <dt>Expires at block</dt>
              <dd>
                {sample.expiresAt.toString()} <span className="muted small">(head {live.head.toString()})</span>
              </dd>
            </div>
          </dl>
        ) : (
          <p className="muted">Waiting for the first read from Tiramisu.</p>
        )}
        <p className="small muted">Same rows, no website:</p>
        <CopyLine text={`npm run query -- --district ${district}`} />
        <CopyLine text="npm run query" />
        <CopyLine text="npm run verify" />
        <p className="small muted">
          <Link2 size={12} /> Chain 7738577 · <a href={EXPLORER} target="_blank" rel="noreferrer">explorer</a> · schema in <code>arkiv/schema.md</code>
        </p>
      </section>

      <section className="grid-2">
        <article className="card">
          <header className="card-head">
            <h2>
              <ShieldOff size={16} /> Never stored, anywhere
            </h2>
          </header>
          <ul className="plain">
            {NEVER.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="muted small">The payload of every entity is exactly <code>{'{"v":1}'}</code>. Eleven closed-list attributes, nothing typed.</p>
        </article>
        <article className="card">
          <header className="card-head">
            <h2>Limits we will not hide</h2>
          </header>
          <ul className="plain">
            <li>A wallet is a pseudonym, not anonymity. Use “New identity” to break the link between reports.</li>
            <li>3 wallets are not 3 people. One person can make three. The rule slows a flood; it does not prove identity.</li>
            <li>These are citizen reports, not findings. “3 wallets reported a demand” is not “this office takes bribes”.</li>
            <li>A location check is a hint, not proof. A phone can fake a position, and the check only says “inside this state”. It slows down remote trolls.</li>
            <li>Rows from the four team wallets are labelled <b>demo</b>. They are synthetic and never location-checked.</li>
            <li>Sealed means a wrong report stays until it expires. That is why nothing is free text.</li>
          </ul>
        </article>
      </section>
      <section className="card">
        <header className="card-head">
          <h2>Block this site. The record is still there.</h2>
        </header>
        <p className="muted small">
          Everything on this page comes from Arkiv, and each of these reads it without any server of ours. Paste them into a terminal, or save the <a href="/mirror.html">one-file mirror</a> and open it from your disk.
        </p>
        <p className="small">Every report, with its attributes:</p>
        <CopyLine text={CURL_ALL} />
        <p className="small">How many underthetable entities are owned by the dead address (the answer should equal how many exist):</p>
        <CopyLine text={CURL_DEAD} />
        <p className="small">Everything against the rules the page applies, including the payload of each:</p>
        <CopyLine text="npm run audit" />
      </section>

      <section className="card">
        <header className="card-head">
          <h2>How a fake report is handled</h2>
        </header>
        <ul className="plain">
          <li>There is <b>no free text</b>, so the worst a liar can write is a false closed-list fact: a district, a desk, a week, an amount.</li>
          <li>A figure appears only at <b>3 different wallets</b>, is a <b>median</b> of one amount per wallet, and shows its <b>range</b>. An amount four times off is tagged <b>outlier</b>.</li>
          <li>A desk whose reports all arrived within ten minutes is marked <b>filed in a burst</b>.</li>
          <li>A location check says a wallet was in the state when it filed. A press report is shown apart, with its articles, and a citizen desk that matches one is marked <b>also in the press</b>.</li>
          <li>The page ignores anything on the chain that is outside the closed lists or not sealed, including what a modified client might write. Nothing is called a finding.</li>
        </ul>
        <p className="muted small">The whole model, with what it cannot stop, is in docs/abuse-model.md.</p>
      </section>

      <p className="muted small center">Not affiliated with any department or police force. Built for the Arkiv Global Tour Stop, 9–18 October 2026.</p>
    </div>
  )
}
