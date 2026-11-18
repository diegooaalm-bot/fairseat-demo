import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Check, ChevronRight, Code2, Database, Lock, ShieldCheck, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Pill } from '@/components/ui/Pill'
import { Toggle } from '@/components/ui/Toggle'
import { ADDR, EVENTS } from '@/data/world'
import { haptic } from '@/lib/haptics'
import { int, usd } from '@/lib/money'
import { hashString, short } from '@/lib/prng'
import { spring } from '@/lib/motion'
import { Screen } from '@/demo/shell/Screen'
import { StackView } from '@/demo/shell/StackView'
import { describeTx } from '@/demo/presenter/txText'
import { novaStats, useDemo, type Tx } from '@/store/demo'

export function ProofApp() {
  return <StackView role="proof" root={<Explorer />} render={(r) => (r.name === 'tx' ? <TxDetail id={r.params!.id} /> : null)} />
}

/* ───────────────────────── Explorer ───────────────────────── */
function Explorer() {
  const s = useDemo()
  const st = novaStats(s)
  const push = useDemo((x) => x.push)
  const attempt = useDemo((x) => x.attemptBreak)
  const hood = !!s.flags.hood
  const setFlag = useDemo((x) => x.setFlag)
  const focusTx = useMemo(() => s.ledger.find((t) => t.kind === 'reverted' || t.kind === 'resale'), [s.ledger])
  const reverts = s.ledger.filter((t) => t.kind === 'reverted').length

  return (
    <Screen title="Proof" roleButton titleAccessory={<Pill tone="accent">Base</Pill>}>
      <div className="flex flex-col gap-4 px-4">
        <div className="rounded-[24px] bg-[linear-gradient(150deg,rgba(62,134,255,.18),rgba(62,134,255,.03))] p-5 hairline">
          <ShieldCheck size={26} className="text-accent-soft" />
          <div className="mt-3 text-[24px] leading-tight font-bold tracking-[-0.03em]">Nobody, not even us, can break the rules.</div>
          <div className="mt-2 text-[14px] leading-snug text-fg-2">Every resale is public and checked by code. Anyone can audit it: artists, regulators, journalists.</div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <Stat v={int(st.resales)} k="resales checked" />
            <Stat v="0" k="above the cap" ok />
            <Stat v="0" k="royalties missed" ok />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-[20px] bg-ink-3 px-4 py-3 hairline">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-[11px] bg-accent/15 text-accent-soft">
              <Code2 size={18} />
            </span>
            <div>
              <div className="text-[16px] font-semibold">Under the hood</div>
              <div className="text-[12px] text-fg-3">See the rules as code</div>
            </div>
          </div>
          <Toggle checked={hood} onChange={(v) => setFlag('hood', v)} label="Under the hood" />
        </div>

        <AnimatePresence initial={false}>
          {hood && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={spring.gentle} className="overflow-hidden">
              <div className="flex flex-col gap-4">
                {focusTx && <CodePanel tx={focusTx} key={focusTx.id} />}
                <div className="rounded-[22px] bg-ink-3 p-4 hairline">
                  <div className="mb-1 text-[15px] font-semibold">Try to break it</div>
                  <div className="mb-3 text-[12px] text-fg-3">Send a transaction that breaks a rule and watch the contract refuse it.</div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="md" variant="danger" onClick={() => (haptic('error'), attempt('overCap'))}>
                      Resell at $400
                    </Button>
                    <Button size="md" variant="danger" onClick={() => (haptic('error'), attempt('adminOverride'))}>
                      Admin override
                    </Button>
                  </div>
                  {reverts > 0 && <div className="mt-3 text-[12px] font-semibold text-err">{reverts} attempt{reverts > 1 ? 's' : ''} reverted · no money moved</div>}
                </div>
                <Contracts />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-baseline justify-between px-1 pt-1">
          <div className="text-[20px] font-bold tracking-[-0.02em]">Transactions</div>
          <div className="text-[12px] whitespace-nowrap text-fg-3">≈ $0.01 each · paid by Proof of Seat</div>
        </div>
        <div className="flex flex-col gap-2.5">
          <AnimatePresence initial={false}>
            {s.ledger.slice(0, 14).map((tx) => (
              <motion.div key={tx.id} layout initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={spring.snappy}>
                <TxCard tx={tx} onClick={() => push('proof', { name: 'tx', params: { id: tx.id } })} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </Screen>
  )
}

function Stat({ v, k, ok }: { v: string; k: string; ok?: boolean }) {
  return (
    <div className="rounded-[14px] bg-black/20 px-1 py-2.5">
      <div className={`text-[19px] font-bold tracking-[-0.02em] tabular ${ok ? 'text-ok' : ''}`}>{v}</div>
      <div className="text-[11px] leading-tight text-fg-3">{k}</div>
    </div>
  )
}

export function Addr({ a }: { a?: string }) {
  if (!a) return null
  const h = hashString(a) % 360
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[12px] text-fg-2">
      <span className="h-3.5 w-3.5 rounded-full" style={{ background: `conic-gradient(hsl(${h} 80% 60%), hsl(${(h + 120) % 360} 80% 55%), hsl(${(h + 240) % 360} 80% 60%), hsl(${h} 80% 60%))` }} />
      {short(a)}
    </span>
  )
}

const KIND: Record<Tx['kind'], string> = {
  issue: 'Issue',
  primary: 'Primary sale',
  resale: 'Resale',
  gift: 'Transfer',
  entry: 'Check-in',
  badge: 'Badge',
  reverted: 'Reverted',
}

function TxCard({ tx, onClick }: { tx: Tx; onClick: () => void }) {
  const d = describeTx(tx)
  const Icon = d.icon
  const tone = { accent: 'bg-accent/15 text-accent-soft', ok: 'bg-ok/15 text-ok', err: 'bg-err/15 text-err', gold: 'bg-gold/15 text-gold', neutral: 'bg-white/[0.08] text-fg-2' }[d.tone]
  return (
    <motion.button whileTap={{ scale: 0.985 }} onClick={onClick} className={`w-full rounded-[20px] p-3.5 text-left hairline ${tx.kind === 'reverted' ? 'bg-err/[0.07]' : 'bg-ink-3'}`}>
      <div className="flex items-center gap-3">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-[11px] ${tone}`}>
          <Icon size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-semibold">{KIND[tx.kind]}</span>
            {tx.tokenId && <span className="font-mono text-[12px] text-fg-3">#{tx.tokenId}</span>}
          </div>
          <div className="truncate text-[12px] text-fg-3">
            Block {int(tx.block)} · {tx.at}
          </div>
        </div>
        {d.amount && <span className={`text-[15px] font-semibold tabular ${tx.kind === 'reverted' ? 'text-err line-through' : ''}`}>{d.amount}</span>}
        <ChevronRight size={16} className="text-fg-3" />
      </div>
      {(tx.from || tx.to) && (
        <div className="mt-2.5 flex items-center gap-2 pl-12">
          <Addr a={tx.from} />
          {tx.to && <ArrowRight size={12} className="text-fg-3" />}
          <Addr a={tx.to} />
        </div>
      )}
      {(tx.kind === 'resale' || tx.kind === 'reverted') && tx.checks && (
        <div className="mt-2.5 flex flex-wrap gap-1.5 pl-12">
          {tx.kind === 'resale' ? (
            <>
              <Chip ok>Price ≤ cap</Chip>
              <Chip ok>Royalty paid {usd(tx.breakdown?.royalty ?? 0)}</Chip>
              <Chip ok>Buyer verified</Chip>
            </>
          ) : (
            <Chip>Price {usd(tx.priceCents ?? 0)} &gt; cap $105.00</Chip>
          )}
        </div>
      )}
    </motion.button>
  )
}

function Chip({ ok, children }: { ok?: boolean; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${ok ? 'bg-ok/12 text-ok' : 'bg-err/15 text-err'}`}>
      {ok ? <Check size={11} strokeWidth={3} /> : <X size={11} strokeWidth={3} />}
      {children}
    </span>
  )
}

/* ───────────────────────── Code panel ───────────────────────── */
const CODE = [
  { code: 'function resell(ticket, buyer, price):', kind: 'head' },
  { code: '  require(price <= faceValue * 105%)', kind: 'req', check: 'cap' },
  { code: '  require(isVerified(buyer))', kind: 'req', check: 'verified' },
  { code: '  require(ticketsOf(buyer) < 4)', kind: 'req', check: 'limit' },
  { code: '  require(now < eventStart - 2h)', kind: 'req', check: 'window' },
  { code: '  pay(artist, price * 2%)', kind: 'pay', note: 'royalty' },
  { code: '  pay(platform, price * 2%)', kind: 'pay', note: 'fee' },
  { code: '  pay(seller, price * 96%)', kind: 'pay', note: 'seller' },
  { code: '  transfer(ticket, seller -> buyer)', kind: 'pay', note: 'transfer' },
] as const

export function CodePanel({ tx }: { tx: Tx }) {
  const [step, setStep] = useState(0)
  const reverted = tx.kind === 'reverted'
  const failIdx = reverted ? CODE.findIndex((l) => 'check' in l && l.check === tx.failed) : -1
  const last = reverted ? failIdx : CODE.length - 1
  useEffect(() => {
    setStep(0)
    let i = 0
    const t = setInterval(() => {
      i++
      setStep(i)
      if (i >= last) clearInterval(t)
    }, 320)
    return () => clearInterval(t)
  }, [tx.id, last])
  const br = tx.breakdown
  const notes: Record<string, string> = {
    cap: `${usd(tx.priceCents ?? 0)} ${reverted ? '>' : '≤'} $105.00`,
    verified: 'verified ✓',
    limit: 'holds 0 · max 4',
    window: 'closes Jun 26, 6 PM',
    royalty: br ? `→ artist ${usd(br.royalty)}` : '',
    fee: br ? `→ platform ${usd(br.fee)} · it also pays the gas` : '',
    seller: br ? `→ seller ${usd(br.seller)}` : '',
    transfer: 'atomic · same transaction, all or nothing',
  }
  return (
    <div className="overflow-hidden rounded-[22px] bg-[#07090f] hairline">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
        <span className="font-mono text-[12px] text-fg-3">ProofOfSeatMarket · resell()</span>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${reverted ? 'bg-err/15 text-err' : 'bg-ok/15 text-ok'}`}>
          {reverted ? 'Reverted' : 'Success'} · block {int(tx.block)}
        </span>
      </div>
      <div className="py-2">
        {CODE.map((l, i) => {
          const done = step >= i && i > 0
          const isFail = reverted && i === failIdx && step >= i
          const skipped = reverted && i > failIdx
          const k = 'check' in l ? l.check : 'note' in l ? l.note : ''
          return (
            <motion.div
              key={i}
              className="px-4 py-[3px] font-mono text-[11px] leading-[1.55]"
              animate={{
                backgroundColor: isFail ? 'rgba(255,69,58,.18)' : done && !skipped ? 'rgba(48,209,88,.12)' : 'rgba(0,0,0,0)',
              }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex items-start gap-2">
                <span className={`w-3 shrink-0 ${isFail ? 'text-err' : 'text-ok'}`}>{isFail ? '✗' : done && !skipped ? '✓' : ''}</span>
                <span className={`whitespace-pre-wrap ${skipped ? 'text-fg-3/50 line-through' : l.kind === 'head' ? 'text-accent-soft' : l.kind === 'req' ? 'text-fg' : 'text-[#c9b6ff]'}`}>{l.code}</span>
              </div>
              {(done || isFail) && !skipped && k && notes[k] && <div className={`pl-5 text-[10.5px] ${isFail ? 'text-err' : 'text-ok/80'}`}>// {notes[k]}</div>}
            </motion.div>
          )
        })}
      </div>
      {reverted && step >= failIdx && (
        <div className="border-t border-white/[0.06] px-4 py-2.5 text-[12px] font-semibold text-err">REVERT · rule broken, nothing moved. Not even the admin key can skip a require.</div>
      )}
    </div>
  )
}

function Contracts() {
  return (
    <div className="flex flex-col gap-3 rounded-[22px] bg-ink-3 p-4 hairline">
      <div className="text-[15px] font-semibold">Three contracts on Base</div>
      {[
        ['Tickets', 'ERC-721 + ERC-2981 royalties', ADDR.tickets],
        ['Market', 'Atomic escrow · checks every rule', ADDR.market],
        ['Badges', 'ERC-5192 · soulbound “I was there”', ADDR.badges],
      ].map(([n, d, a]) => (
        <div key={n} className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[14px] font-semibold">{n}</div>
            <div className="truncate text-[12px] text-fg-3">{d}</div>
          </div>
          <Addr a={a} />
        </div>
      ))}
      <div className="mt-1 grid grid-cols-2 gap-2 text-[12px]">
        <div className="rounded-[14px] bg-accent/10 p-3">
          <div className="mb-1 flex items-center gap-1.5 font-semibold text-accent-soft">
            <Database size={13} /> On-chain, public
          </div>
          <div className="leading-snug text-fg-2">Ticket ID, event, seat, face value, rules, owner (anonymous address), history</div>
        </div>
        <div className="rounded-[14px] bg-white/[0.05] p-3">
          <div className="mb-1 flex items-center gap-1.5 font-semibold text-fg">
            <Lock size={13} /> Off-chain, encrypted
          </div>
          <div className="leading-snug text-fg-2">Name, ID document, selfie, email, card. Never on the blockchain.</div>
        </div>
      </div>
    </div>
  )
}

/* ───────────────────────── Detail ───────────────────────── */
function TxDetail({ id }: { id: string }) {
  const tx = useDemo((s) => s.ledger.find((t) => t.id === id))
  const pop = useDemo((s) => s.pop)
  if (!tx) return null
  const ev = EVENTS[tx.eventId]
  const br = tx.breakdown
  return (
    <Screen title={KIND[tx.kind]} large={false} onBack={() => pop('proof')} backLabel="Proof">
      <div className="flex flex-col gap-4 px-4 pt-2">
        <div className="rounded-[22px] bg-ink-3 p-4 hairline">
          <div className="text-[12px] text-fg-3">Transaction</div>
          <div className="mt-0.5 font-mono text-[13px] break-all text-fg-2">{tx.hash}</div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-[13px]">
            <KV k="Block" v={int(tx.block)} />
            <KV k="Network" v="Base (Ethereum L2)" />
            <KV k="Time" v={tx.at} />
            <KV k="Fee" v="≈ $0.01 · paymaster" />
            <KV k="Event" v={tx.eventLabel ?? `${ev.artist} · ${ev.venue}`} />
            {tx.tokenId && <KV k="Ticket" v={`#${tx.tokenId}`} />}
          </div>
        </div>
        {(tx.from || tx.to) && (
          <div className="flex items-center justify-between rounded-[22px] bg-ink-3 p-4 hairline">
            <div>
              <div className="text-[12px] text-fg-3">From</div>
              <Addr a={tx.from} />
            </div>
            <ArrowRight size={16} className="text-fg-3" />
            <div className="text-right">
              <div className="text-[12px] text-fg-3">To</div>
              <Addr a={tx.to} />
            </div>
          </div>
        )}
        {br && (
          <div className="overflow-hidden rounded-[22px] bg-ink-3 hairline">
            {[
              ['Buyer paid', usd(br.buyerTotal)],
              ['Seller received', usd(br.seller)],
              ['Artist royalty (2%)', usd(br.royalty)],
              ['Proof of Seat fee (2%)', usd(br.fee)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-white/[0.06] px-4 py-2.5 text-[14px] last:border-0">
                <span className="text-fg-2">{k}</span>
                <span className="font-semibold tabular">{v}</span>
              </div>
            ))}
          </div>
        )}
        {(tx.kind === 'resale' || tx.kind === 'reverted') && <CodePanel tx={tx} />}
        <p className="px-1 text-[12px] leading-snug text-fg-3">Addresses are anonymous. Only Proof of Seat can link an address to a verified person, and that link never leaves its encrypted systems.</p>
      </div>
    </Screen>
  )
}
function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] text-fg-3">{k}</div>
      <div className="truncate font-semibold">{v}</div>
    </div>
  )
}
