// Scrolls a page in steps and screenshots each viewport. Usage: node scroll-shots.cjs outDir route WxH step
const { chromium } = require('playwright')
const fs = require('fs'), path = require('path')
const base = process.env.BASE_URL || 'http://localhost:5173/'
const [out, route, size, stepArg] = process.argv.slice(2)
const [W, H] = size.split('x').map(Number)
fs.mkdirSync(out, { recursive: true })
;(async () => {
  const b = await chromium.launch()
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: W < 900, hasTouch: W < 900 })
  const p = await ctx.newPage()
  const errs = []
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()) })
  p.on('pageerror', (e) => errs.push('pageerror: ' + e.message))
  await p.goto(base + '#' + route, { waitUntil: 'networkidle' }); await p.waitForTimeout(1500)
  const total = await p.evaluate(() => document.documentElement.scrollHeight)
  const step = Math.round(H * (+stepArg || 0.9))
  let i = 0
  for (let y = 0; y < total - H / 2; y += step) {
    await p.evaluate((y) => window.scrollTo(0, y), y)
    await p.waitForTimeout(950)
    await p.screenshot({ path: path.join(out, `${String(i++).padStart(2, '0')}_${y}.png`) })
  }
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
  console.log('height', total, 'shots', i, 'h-overflow', overflow)
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no console errors')
  await b.close()
})()
