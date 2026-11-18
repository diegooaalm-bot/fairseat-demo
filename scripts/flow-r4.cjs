// Round 4: Proof of Seat, 105% cap (2% seller · 2% artist · 1% platform), mid-size catalog.
const { chromium } = require('playwright')
const fs = require('fs'), path = require('path')
const base = process.env.BASE_URL || 'http://localhost:5173/'
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true })
const W = +(process.env.W || 390), H = +(process.env.H || 844)
;(async () => {
  const b = await chromium.launch()
  const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true })
  const p = await ctx.newPage()
  const errs = []
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()) })
  p.on('pageerror', (e) => errs.push('pageerror: ' + e.message))
  p.on('response', (r) => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()) })
  let n = 0
  const shot = async (name) => { n++; await p.screenshot({ path: path.join(out, `${String(n).padStart(2, '0')}_${name}.png`) }) }
  const wait = (ms) => p.waitForTimeout(ms)
  const tab = (name) => p.getByRole('tab', { name }).last()
  const back = () => p.locator('[aria-label="Back"], button:has-text("Back")').last().click()
  const st = (fn, arg) => p.evaluate(fn, arg)
  const scroll = async (dy) => { await p.mouse.move(W / 2, H / 2); await p.mouse.wheel(0, dy); await wait(600) }
  const swapDone = () => p.locator('div.z-\\[80\\] button:has-text("Done")').click()
  await p.goto(base); await p.evaluate(() => localStorage.clear())
  await p.goto(base + '#/demo', { waitUntil: 'networkidle' }); await wait(1200)
  await shot('discover')
  await scroll(520); await shot('discover_resale'); await scroll(800); await shot('discover_upcoming'); await scroll(-3000)
  for (const c of ['Sports', 'Arts & Theater', 'Family']) { await tab(c).click(); await wait(500); await shot('cat_' + c.replace(/\W+/g, '')) }
  await tab('All events').click(); await wait(300)
  // featured presale event and seats
  await p.locator('button:has-text("Underdressed")').first().click(); await wait(1200); await shot('nova_event')
  await scroll(700); await shot('nova_event_map'); await scroll(-3000)
  await p.getByRole('button', { name: 'Join the verified presale' }).last().click(); await wait(1200)
  await p.locator('text=Simulate bot attack').first().click().catch(() => {}); await wait(6200)
  await p.locator('text=Choose seats').first().click(); await wait(1000); await shot('nova_seats')
  await p.click('[aria-label="Row 14 seat 7"]'); await wait(300); await shot('nova_seat_picked')
  await p.locator('button:has-text("$100.00")').last().click(); await wait(900); await shot('pay')
  await p.locator('[aria-label="Double-tap to confirm payment"]').dblclick(); await wait(2600); await shot('purchased')
  await p.locator('text=View in My Tickets').click(); await wait(1500); await shot('wallet')
  await p.getByRole('button', { name: 'Done' }).last().click(); await wait(600)
  // sell the Faye Webster seat
  await p.getByRole('button', { name: 'Resale' }).last().click(); await wait(800)
  await tab('Sell a ticket').click(); await wait(600); await shot('sell_side')
  await p.locator('button:has-text("Faye Webster")').first().click(); await wait(1100); await shot('resell')
  await p.locator('button:has-text("Max allowed")').last().click(); await wait(900); await shot('resell_max')
  await scroll(500); await shot('resell_split')
  await p.locator('button:has-text("List for")').last().click(); await wait(1000); await shot('listed')
  await p.locator('button:has-text("Simulate a verified buyer")').last().click()
  await p.getByText('Sold to a verified fan').first().waitFor(); await wait(900); await shot('swap_sold')
  await swapDone(); await wait(800)
  // buy a sold-out show from resale
  await tab('Buy tickets').click(); await wait(600); await shot('buy_side')
  await p.locator('button:has-text("Sec M2")').first().click(); await wait(1500); await shot('offer')
  await scroll(650); await shot('offer_split')
  await p.locator('button:has-text("Buy for")').last().click(); await wait(900); await shot('offer_pay')
  await p.locator('[aria-label="Double-tap to confirm payment"]').dblclick()
  await p.getByText('The seat is yours').waitFor(); await wait(900); await shot('swap_bought')
  await swapDone(); await wait(1200)
  // other venue maps
  await p.getByRole('button', { name: 'Discover' }).last().click(); await wait(500)
  for (const [c, name, key] of [['Sports', 'Georgia Tech', 'gatech'], ['Concerts', 'Waxahatchee', 'wax']]) {
    await tab(c).click(); await wait(400)
    await p.locator(`button:has-text("${name}")`).first().click(); await wait(1200); await shot(key + '_event')
    await scroll(650); await shot(key + '_map')
    await p.locator('button:has-text("Find tickets")').last().click(); await wait(1000); await shot(key + '_seats')
    await back(); await wait(500); await back(); await wait(700)
  }
  await tab('All events').click()
  for (const r of ['ben', 'gate', 'organizer', 'artist', 'proof']) {
    await st((r) => { const s = window.__demo.getState(); if (r === 'gate') s.advanceTo('doors'); s.setRole(r) }, r); await wait(1400); await shot('role_' + r)
  }
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no console errors')
  await b.close()
})().catch((e) => { console.error('FLOW FAILED:', e.message.split('\n')[0]); process.exit(1) })
