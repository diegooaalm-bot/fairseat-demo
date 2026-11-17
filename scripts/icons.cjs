// Renders PNG app icons from the SVG mark (no rounded corners: the OS masks them).
const { chromium } = require('playwright')
const path = require('path')
const mark = `<path fill="#fff" fill-rule="evenodd" d="M24 6h16c6.6 0 12 5.4 12 12v18H12V18C12 11.4 17.4 6 24 6Zm-1.6 19.2 6.5 6.5 13.2-13.2-3.3-3.3-9.9 9.9-3.2-3.2-3.3 3.3Z"/><rect x="6" y="39" width="52" height="11" rx="5.5" fill="#fff"/><rect x="14" y="50" width="6" height="8" rx="2" fill="#fff"/><rect x="44" y="50" width="6" height="8" rx="2" fill="#fff"/>`
const svg = (size, inset) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64"><defs><radialGradient id="g" cx="70%" cy="0%" r="100%"><stop offset="0" stop-color="#2a4fa8"/><stop offset=".55" stop-color="#0d1430"/><stop offset="1" stop-color="#0a0a0d"/></radialGradient></defs><rect width="64" height="64" fill="url(#g)"/><g transform="translate(${32 - 32 * inset} ${32 - 32 * inset}) scale(${inset})">${mark}</g></svg>`
;(async () => {
  const b = await chromium.launch()
  const p = await b.newPage()
  const out = path.join(__dirname, '..', 'public')
  for (const [name, size, inset] of [['apple-touch-icon.png', 180, 0.6], ['icon-192.png', 192, 0.6], ['icon-512.png', 512, 0.6], ['icon-maskable-512.png', 512, 0.46]]) {
    await p.setViewportSize({ width: size, height: size })
    await p.setContent(`<html><body style="margin:0">${svg(size, inset)}</body></html>`)
    await p.screenshot({ path: path.join(out, name), clip: { x: 0, y: 0, width: size, height: size } })
  }
  await b.close()
})()
