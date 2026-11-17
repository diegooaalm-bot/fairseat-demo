export function Avatar({ name, hue = 220, size = 36, ring = false }: { name: string; hue?: number; size?: number; ring?: boolean }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-full font-semibold text-white ${ring ? 'ring-2 ring-accent ring-offset-2 ring-offset-ink' : ''}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: `linear-gradient(140deg, hsl(${hue} 80% 62%), hsl(${(hue + 40) % 360} 70% 42%))`,
      }}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}
