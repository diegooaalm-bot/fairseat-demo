// Desktop 1440x900 screenshots of every role after the story has run.
const { chromium } = require('playwright')
const fs = require('fs'), path = require('path')
const base = process.env.BASE_URL || 'http://localhost:5173/'
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true })
const W = +(process.env.W || 1440), H = +(process.env.H || 900)
;(async () => {
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: W, height: H } })
  const errs = []
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()) })
  p.on('pageerror', (e) => errs.push('pageerror: ' + e.message))
  await p.goto(base); await p.evaluate(() => localStorage.clear())
  await p.goto(base + '#/demo', { waitUntil: 'networkidle' }); await p.waitForTimeout(500)
  await p.evaluate(() => window.__demo.getState().ensure('benBought'))
  for (const r of ['maya', 'ben', 'organizer', 'artist', 'gate', 'proof']) {
    await p.evaluate((r) => window.__demo.getState().setRole(r), r); await p.waitForTimeout(1600)
    await p.screenshot({ path: path.join(out, `${r}.png`) })
  }
  await p.evaluate(() => { const s = window.__demo.getState(); s.advanceTo('doors'); s.setRole('gate') }); await p.waitForTimeout(1200)
  await p.click('[aria-label="Scan Ben\'s ticket"]'); await p.waitForTimeout(1600)
  await p.screenshot({ path: path.join(out, `gate_scan.png`) })
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no console errors')
  await b.close()
})()
