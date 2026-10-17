import { ExternalLink, RotateCcw, UserRound, Wallet } from "lucide-react"
import { formatEther } from "viem"
import type { Connection } from "../lib/wallet"
import { shortAddress } from "../lib/format"
import { Seg } from "./kit"

export const FAUCET_URL = "https://hub.arkiv.network/faucet"
/** A report costs about 0.00016 test GLM. This is a margin, not a price. */
export const MIN_WALLET_GLM = 1_000_000_000_000_000n // 0.001

export type Who = "wallet" | "identity"

export function glm(value: bigint): string {
  const n = Number(formatEther(value))
  return n >= 1 ? n.toFixed(2) : n.toFixed(4)
}

/** A rejected wallet prompt is not an error worth a stack trace. */
export function walletProblem(problem: unknown): string {
  const code = typeof problem === "object" && problem !== null && "code" in problem ? (problem as { code?: unknown }).code : undefined
  const text = problem instanceof Error ? problem.message : String(problem)
  if (code === 4001 || /user (rejected|denied)/i.test(text)) return "You declined the request in your wallet. Nothing was sent."
  return text
}

/**
 * Who files the report. Your own wallet is the main path: nothing of ours pays or limits you, and the report is yours
 * to point to. The one-tap key is for people with no wallet, and depends on a small shared faucet.
 */
export function Reporter({
  who,
  onWho,
  connection,
  balance,
  connecting,
  onConnect,
  onDisconnect,
  identity,
  onNewIdentity,
  hasProvider,
}: {
  who: Who
  onWho: (next: Who) => void
  connection: Connection | null
  balance: bigint | null
  connecting: boolean
  onConnect: () => void
  onDisconnect: () => void
  identity: string | null
  onNewIdentity: () => void
  hasProvider: boolean
}) {
  const low = balance !== null && balance < MIN_WALLET_GLM
  return (
    <div className="reporter">
      <Seg
        label="Report with"
        value={who}
        onChange={(next) => onWho(next as Who)}
        options={[
          { value: "wallet", label: "My wallet" },
          { value: "identity", label: "One-tap key" },
        ]}
      />
      {who === "wallet" ? (
        <div className="reporter-body">
          {connection ? (
            <>
              <p className="small">
                <Wallet size={14} /> Connected <code>{shortAddress(connection.address)}</code> on Tiramisu
                {balance !== null ? <> · {glm(balance)} test GLM</> : null}.{" "}
                <button type="button" className="link" onClick={onDisconnect}>
                  Use another
                </button>
              </p>
              {low ? (
                <p className="warn small">
                  This wallet has too little test GLM to pay for a report (about 0.0002 each).{" "}
                  <a href={FAUCET_URL} target="_blank" rel="noreferrer">
                    Get test GLM from the faucet <ExternalLink size={12} />
                  </a>
                  , then file.
                </p>
              ) : null}
            </>
          ) : (
            <div className="reporter-connect">
              <button type="button" className="btn" onClick={onConnect} disabled={connecting || !hasProvider}>
                <Wallet size={16} /> {connecting ? "Waiting for your wallet…" : "Connect wallet"}
              </button>
              <span className="muted small">
                {hasProvider
                  ? "Any browser wallet. It adds the Tiramisu network for you. Nothing is sent until you press File."
                  : "No wallet found in this browser. Install a wallet extension, or choose the one-tap key."}
              </span>
            </div>
          )}
          <p className="muted small">Your wallet pays its own gas (a few thousandths of a cent). No human check, no faucet, and the report is yours to point to: its creator is your address.</p>
        </div>
      ) : (
        <div className="reporter-body">
          <p className="small">
            <UserRound size={14} /> A key is made in this browser. {identity ? <>It is <code>{shortAddress(identity)}</code>. </> : null}
            {identity ? (
              <button type="button" className="link" onClick={onNewIdentity}>
                <RotateCcw size={12} /> New identity
              </button>
            ) : null}
          </p>
          <p className="muted small">After a quick human check, a few cents of test GLM are sent to it. Free, but the shared faucet has limited capacity: if it is resting, connect a wallet instead.</p>
        </div>
      )}
    </div>
  )
}
