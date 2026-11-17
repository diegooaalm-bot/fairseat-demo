/** All money is integer cents. Never use floats for amounts. */
export const usd = (cents: number, opts: { cents?: boolean } = {}) => {
  const showCents = opts.cents ?? true
  const v = cents / 100
  return v.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  })
}

/** Compact: $123K, $3.7B */
export const usdCompact = (dollars: number) =>
  dollars.toLocaleString('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 })

export const int = (n: number) => Math.round(n).toLocaleString('en-US')
export const pct = (n: number, digits = 0) => `${n.toFixed(digits)}%`
