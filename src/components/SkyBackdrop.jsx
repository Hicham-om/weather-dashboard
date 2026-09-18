import { useId } from 'react'

// Procedural cloud "photo" for the hero card. Fractal noise becomes a soft cloud mask;
// the mask is filled with a body colour, and the part not covered by a slightly lowered
// copy of itself becomes a lit rim, which gives the clouds volume.
const SKIES = {
  storm: { top: '#0c0c0c', bottom: '#2a2827', body: '#3a3837', rim: '#bcb6b0', cover: 0.62, glow: null },
  rain: { top: '#16171a', bottom: '#3b3d42', body: '#45474c', rim: '#a6a8ad', cover: 0.6, glow: null },
  cloudy: { top: '#2a2826', bottom: '#56524e', body: '#77726d', rim: '#d8d2cc', cover: 0.58, glow: null },
  fog: { top: '#57534f', bottom: '#77726d', body: '#9a958f', rim: '#c9c4be', cover: 0.75, glow: null, haze: 0.35 },
  snow: { top: '#4b4e55', bottom: '#8c9098', body: '#b9bdc4', rim: '#f5f7fa', cover: 0.62, glow: null },
  clear: { top: '#2a3f5c', bottom: '#b07a4a', body: '#c9a283', rim: '#fff1de', cover: 0.4, glow: '#ffbf70' },
  'clear-night': { top: '#05070b', bottom: '#1a1d24', body: '#262a33', rim: '#6f7482', cover: 0.35, stars: true },
  'cloudy-night': { top: '#07080a', bottom: '#22242a', body: '#2c2e34', rim: '#7b7f88', cover: 0.55, stars: true },
  'storm-night': { top: '#050505', bottom: '#1c1b1b', body: '#262524', rim: '#6d6966', cover: 0.62 },
}

function skyFor(key) {
  if (SKIES[key]) return SKIES[key]
  if (key === 'rain-night') return SKIES['storm-night']
  if (key.endsWith('-night')) return SKIES['cloudy-night']
  return SKIES.cloudy
}

function starField(seed) {
  let s = seed + 1
  const random = () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
  return Array.from({ length: 80 }, () => ({
    x: random() * 1000,
    y: random() * 300,
    r: random() * 1.1 + 0.3,
    o: random() * 0.6 + 0.2,
  }))
}

export default function SkyBackdrop({ sky, seed }) {
  const id = useId().replace(/:/g, '')
  const c = skyFor(sky)
  // Noise values sit around 0.5; lowering the cutoff lets more of it become cloud.
  const cutoff = 1.25 - c.cover * 1.1

  return (
    <svg className="sky" viewBox="0 0 1000 460" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-base`} x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0" stopColor={c.top} />
          <stop offset="1" stopColor={c.bottom} />
        </linearGradient>
        {c.glow && (
          <radialGradient id={`${id}-glow`} cx="0.8" cy="0.05" r="0.6">
            <stop offset="0" stopColor={c.glow} stopOpacity="0.9" />
            <stop offset="1" stopColor={c.glow} stopOpacity="0" />
          </radialGradient>
        )}
        <filter id={`${id}-clouds`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.0022 0.0055" numOctaves="7" seed={seed} result="noise" />
          <feColorMatrix
            in="noise"
            type="matrix"
            values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  2.6 0 0 0 ${-cutoff * 2.6 + 0.5}`}
            result="mask"
          />
          <feGaussianBlur in="mask" stdDeviation="2.5" result="softMask" />

          <feFlood floodColor={c.body} result="bodyColor" />
          <feComposite in="bodyColor" in2="softMask" operator="in" result="body" />

          <feOffset in="softMask" dx="-3" dy="9" result="lowered" />
          <feComposite in="softMask" in2="lowered" operator="out" result="rimMask" />
          <feGaussianBlur in="rimMask" stdDeviation="4" result="softRim" />
          <feFlood floodColor={c.rim} result="rimColor" />
          <feComposite in="rimColor" in2="softRim" operator="in" result="rim" />

          <feMerge>
            <feMergeNode in="body" />
            <feMergeNode in="rim" />
          </feMerge>
        </filter>
        <linearGradient id={`${id}-shade`} x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0" stopColor="#000" stopOpacity="0.5" />
          <stop offset="0.6" stopColor="#000" stopOpacity="0.08" />
          <stop offset="1" stopColor="#000" stopOpacity="0.25" />
        </linearGradient>
      </defs>

      <rect width="1000" height="460" fill={`url(#${id}-base)`} />
      {c.glow && <rect width="1000" height="460" fill={`url(#${id}-glow)`} />}
      {c.stars && starField(seed).map((star, i) => <circle key={i} cx={star.x} cy={star.y} r={star.r} fill="#fff" opacity={star.o} />)}
      <rect width="1000" height="460" filter={`url(#${id}-clouds)`} />
      {c.haze && <rect width="1000" height="460" fill={c.body} opacity={c.haze} />}
      <rect width="1000" height="460" fill={`url(#${id}-shade)`} />
    </svg>
  )
}
