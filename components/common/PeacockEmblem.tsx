/**
 * Vector peacock emblem inspired by the Geetham Silks logo — a displayed
 * peacock with a fan of eye-feathers, drawn in rose-gold gradient strokes.
 * Built as a watermark/atmospheric element: tint, blur and opacity are
 * controlled by the parent. currentColor is unused; strokes use the gradient.
 */
export function PeacockEmblem({ className }: { className?: string }) {
  const cx = 300
  const cyBase = 430
  const N = 15
  const spread = 204
  const baseLen = 300
  const step = spread / (N - 1)

  const feathers = Array.from({ length: N }, (_, i) => {
    const ang = -spread / 2 + step * i
    const t = Math.abs(ang) / (spread / 2) // 0 centre → 1 edge
    const len = baseLen * (1 - 0.16 * t)
    return { ang, len }
  })

  return (
    <svg viewBox="0 60 600 500" className={className} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="peacock-rosegold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e2acab" />
          <stop offset="0.5" stopColor="#c9747a" />
          <stop offset="1" stopColor="#b8986a" />
        </linearGradient>
      </defs>

      <g
        stroke="url(#peacock-rosegold)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Fan of eye-feathers */}
        {feathers.map((f, i) => (
          <g key={i} transform={`rotate(${f.ang} ${cx} ${cyBase})`}>
            {/* shaft with a gentle double curve */}
            <path
              d={`M${cx} ${cyBase}
                  C ${cx - 9} ${cyBase - f.len * 0.38}, ${cx + 9} ${cyBase - f.len * 0.72}, ${cx} ${cyBase - f.len}`}
            />
            {/* eye */}
            <g transform={`translate(${cx} ${cyBase - f.len})`}>
              <ellipse cx="0" cy="0" rx="15" ry="23" />
              <path d="M0 -13 C 7 -6, 7 7, 0 11 C -7 7, -7 -6, 0 -13 Z" />
              <circle cx="0" cy="-1" r="3.6" fill="url(#peacock-rosegold)" stroke="none" />
            </g>
          </g>
        ))}

        {/* small feather filaments between eyes near the base for fullness */}
        {feathers.map((f, i) => (
          <g key={`fil-${i}`} transform={`rotate(${f.ang + step / 2} ${cx} ${cyBase})`}>
            <path d={`M${cx} ${cyBase} L ${cx} ${cyBase - f.len * 0.5}`} opacity="0.7" />
          </g>
        ))}

        {/* Body, neck and head (displayed peacock in profile) */}
        <g>
          <ellipse cx={cx} cy={cyBase + 22} rx="26" ry="34" />
          <path d={`M${cx + 2} ${cyBase + 2} C ${cx - 2} ${cyBase - 36}, ${cx + 26} ${cyBase - 50}, ${cx + 16} ${cyBase - 82}`} />
          <circle cx={cx + 18} cy={cyBase - 90} r="11" />
          {/* beak */}
          <path d={`M${cx + 28} ${cyBase - 90} l 15 4 l -14 5`} />
          {/* eye dot */}
          <circle cx={cx + 15} cy={cyBase - 92} r="1.6" fill="url(#peacock-rosegold)" stroke="none" />
          {/* crest */}
          {[-7, 1, 9].map((dx, j) => (
            <g key={j}>
              <path d={`M${cx + 18} ${cyBase - 100} Q ${cx + 18 + dx} ${cyBase - 112}, ${cx + 18 + dx} ${cyBase - 120}`} />
              <circle cx={cx + 18 + dx} cy={cyBase - 122} r="2.6" fill="url(#peacock-rosegold)" stroke="none" />
            </g>
          ))}
        </g>

        {/* kolam dotted arc beneath, echoing the logo */}
        {Array.from({ length: 20 }).map((_, i) => {
          const a = Math.PI * (0.14 + (0.72 * i) / 19) // lower arc
          const r = 66
          const px = cx + r * Math.cos(a)
          const py = cyBase + 46 + r * Math.sin(a)
          return <circle key={`k${i}`} cx={px} cy={py} r={i % 3 === 0 ? 2.4 : 1.3} fill="url(#peacock-rosegold)" stroke="none" />
        })}
      </g>
    </svg>
  )
}
