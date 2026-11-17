// Round 2: real-artist catalog, generic purchase, waitlist, Maya → Ben story.
const { chromium } = require('playwright')
const fs = require('fs'), path = require('path')
const base = process.env.BASE_URL || 'http://localhost:5173/'
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true })
const W = +(process.env.W || 390), H = +(process.env.H || 844)
;(async () => {
  const b = await chromium.launch()
  const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: W < 900, isMobile: W < 900 })
  const p = await ctx.newPage()
  const errs = []
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()) })
  p.on('pageerror', (e) => errs.push('pageerror: ' + e.message))
  p.on('response', (r) => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()) })
  let n = 0
  const shot = async (name) => { n++; await p.screenshot({ path: path.join(out, `${String(n).padStart(2, '0')}_${name}.png`) }) }
  const wait = (ms) => p.waitForTimeout(ms)
  const click = async (sel) => { await p.locator(sel).first().click() }
  await p.goto(base); await p.evaluate(() => localStorage.clear())
  await p.goto(base + '#/demo', { waitUntil: 'networkidle' }); await wait(1200)
  await shot('discover')
  await p.mouse.move(W / 2, H / 2); await p.mouse.wheel(0, 700); await wait(700); await shot('discover_scrolled')
  await click('text=Harry Styles'); await wait(1200); await shot('harry_event')
  await p.mouse.wheel(0, 650); await wait(600); await shot('harry_event_scrolled')
  await click('text=Find tickets'); await wait(1000); await shot('harry_seats')
  await click('text=Back'); await wait(600); await p.locator('[aria-label="Back"]').first().click(); await wait(800)
  await click('text=Taylor Swift'); await wait(1100); await shot('taylor')
  await p.getByRole('button', { name: 'Join the verified waitlist' }).last().click(); await wait(800); await shot('taylor_joined')
  await p.locator('[aria-label="Back"]').first().click(); await wait(800)
  await p.mouse.wheel(0, -2000); await wait(500)
  await p.locator('button:has-text("DeBÍ TiRAR MáS FOToS World Tour")').first().click(); await wait(1200); await shot('nova_event')
  await p.getByRole('button', { name: 'Join the verified presale' }).last().click(); await wait(1200); await click('text=Simulate bot attack'); await wait(1200); await shot('queue_attack')
  await wait(5600); await click('text=Choose seats'); await wait(1000); await shot('nova_seats')
  for (const s of [7, 5, 6, 8]) { await click(`[aria-label="Row 14 seat ${s}"]`); await wait(120) }
  await click('[aria-label="Row 14 seat 9"]'); await wait(300); await shot('seat_limit')
  for (const s of [5, 6, 8]) { await click(`[aria-label="Row 14 seat ${s}"]`); await wait(100) }
  await wait(500); await click('button:has-text("$100.00")'); await wait(900); await shot('pay')
  await p.locator('[aria-label="Double-tap to confirm payment"]').dblclick(); await wait(2600); await shot('purchased')
  await click('text=View in My Tickets'); await wait(1500); await shot('wallet')
  await click('text=Done'); await wait(900); await shot('wallet_stack')
  await st(p, () => window.__demo.getState().ensure('benBought'))
  await st(p, () => window.__demo.getState().setRole('ben')); await wait(1200); await shot('ben_wallet')
  await st(p, () => { const s = window.__demo.getState(); s.advanceTo('doors'); s.setRole('gate') }); await wait(1000)
  await click('text=Scan Ben'); await wait(1800); await shot('gate_welcome')
  await wait(3400)
  for (const r of ['organizer', 'artist', 'proof']) { await st(p, (r) => window.__demo.getState().setRole(r), r); await wait(1500); await shot(r) }
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no console errors')
  await b.close()
})().catch((e) => { console.error('FLOW FAILED:', e.message.split('\n')[0]); process.exit(1) })
async function st(p, fn, arg) { await p.evaluate(fn, arg) }
