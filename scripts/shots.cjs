// Usage: node scripts/shots.cjs <outDir> <route>[@w x h][:name] ...
// Captures each route and prints console errors. Base URL from BASE_URL env.
const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')
const base = process.env.BASE_URL || 'http://localhost:5173/'
const out = process.argv[2]
const specs = process.argv.slice(3)
fs.mkdirSync(out, { recursive: true })
;(async () => {
  const b = await chromium.launch()
  for (const spec of specs) {
    const m = spec.match(/^([^@:]*)(?:@(\d+)x(\d+))?(?::(.+))?$/)
    const route = m[1], w = +(m[2] || 1440), h = +(m[3] || 900), name = m[4] || (route.replace(/[^a-z0-9]+/gi, '_') || 'home') + `_${w}`
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: w < 900, isMobile: w < 900 })
    const p = await ctx.newPage()
    const errs = []
    p.on('console', (msg) => { if (msg.type() === 'error' || msg.type() === 'warning') errs.push(`${msg.type()}: ${msg.text()}`) })
    p.on('pageerror', (e) => errs.push('pageerror: ' + e.message))
    if (process.env.CLEAR !== '0') { await p.goto(base); await p.evaluate(() => localStorage.clear()) }
    if (process.env.STATE) { await p.goto(base); await p.evaluate((s) => localStorage.setItem('fairseat-demo-v1', s), fs.readFileSync(process.env.STATE, 'utf8')) }
    await p.goto(base + '#' + route, { waitUntil: 'networkidle' })
    await p.waitForTimeout(+(process.env.WAIT || 1200))
    const full = process.env.FULL === '1'
    await p.screenshot({ path: path.join(out, name + '.png'), fullPage: full })
    console.log(name, errs.length ? '\n  ' + errs.join('\n  ') : 'ok')
    await ctx.close()
  }
  await b.close()
})()
