// Walks every story step with the keyboard / HUD and screenshots each one.
const { chromium } = require('playwright')
const fs = require('fs'), path = require('path')
const base = process.env.BASE_URL || 'http://localhost:5173/'
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true })
const W = +(process.env.W || 1440), H = +(process.env.H || 900)
;(async () => {
  const b = await chromium.launch()
  const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: W < 900, isMobile: W < 900 })
  const p = await ctx.newPage()
  const errs = []
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()) })
  p.on('pageerror', (e) => errs.push('pageerror: ' + e.message))
  await p.goto(base); await p.evaluate(() => localStorage.clear())
  await p.goto(base + '#/demo', { waitUntil: 'networkidle' }); await p.waitForTimeout(600)
  if (W >= 960) await p.click('text=Story mode')
  else { await p.click('[aria-label="Switch role"]').catch(() => {}); await p.waitForTimeout(500); await p.click('text=Story mode') }
  for (let i = 0; i < 12; i++) {
    await p.waitForTimeout(i === 3 ? 2600 : 2200)
    await p.screenshot({ path: path.join(out, `${String(i + 1).padStart(2, '0')}.png`) })
    if (W >= 960) await p.keyboard.press('ArrowRight')
    else await p.click('[aria-label="Next step"]')
  }
  // and back again
  await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(1200)
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no console errors')
  await b.close()
})().catch((e) => { console.error('FLOW FAILED', e.message); process.exit(1) })
