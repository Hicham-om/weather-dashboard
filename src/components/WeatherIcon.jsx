// Soft, lightly shaded weather icons in the style of the dashboard design.
// Gradients are defined once by <WeatherIconDefs /> and referenced by id.

export function WeatherIconDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="wi-cloud" x1="0" y1="14" x2="0" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f4f4f5" />
          <stop offset="1" stopColor="#8d8d93" />
        </linearGradient>
        <linearGradient id="wi-cloud-dark" x1="0" y1="10" x2="0" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#d4d4d8" />
          <stop offset="1" stopColor="#5f5f66" />
        </linearGradient>
        <radialGradient id="wi-sun" cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#ffe08a" />
          <stop offset="1" stopColor="#ff9f0a" />
        </radialGradient>
        <linearGradient id="wi-moon" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4f4f5" />
          <stop offset="1" stopColor="#a1a1aa" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function Sun({ cx = 32, cy = 32, r = 9, rays = true }) {
  return (
    <g>
      {rays &&
        Array.from({ length: 8 }, (_, i) => {
          const angle = (i * Math.PI) / 4
          const inner = r + 5
          const outer = r + 10
          return (
            <line
              key={i}
              x1={cx + Math.cos(angle) * inner}
              y1={cy + Math.sin(angle) * inner}
              x2={cx + Math.cos(angle) * outer}
              y2={cy + Math.sin(angle) * outer}
              stroke="#ffae1a"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
          )
        })}
      <circle cx={cx} cy={cy} r={r} fill="url(#wi-sun)" />
    </g>
  )
}

function Moon({ transform }) {
  return (
    <path
      transform={transform}
      fill="url(#wi-moon)"
      d="M38 10a20 20 0 1 0 16 30A17 17 0 0 1 38 10z"
    />
  )
}

function Cloud({ dark = false, y = 0 }) {
  return (
    <g fill={dark ? 'url(#wi-cloud-dark)' : 'url(#wi-cloud)'} transform={`translate(0 ${y})`}>
      <circle cx="23" cy="37" r="11" />
      <circle cx="35" cy="30" r="14" />
      <circle cx="47" cy="39" r="9" />
      <rect x="12" y="37" width="44" height="13" rx="6.5" />
    </g>
  )
}

function Drops({ color = '#38bdf8', dots = false }) {
  const xs = [24, 33, 42]
  return (
    <g stroke={color} strokeWidth="2.6" strokeLinecap="round">
      {xs.map((x, i) =>
        dots ? (
          <circle key={x} cx={x} cy={52 + (i % 2) * 5} r="1.6" fill={color} stroke="none" />
        ) : (
          <line key={x} x1={x} y1={50 + (i % 2) * 3} x2={x - 3} y2={57 + (i % 2) * 3} />
        ),
      )}
    </g>
  )
}

export default function WeatherIcon({ kind, isDay = true, size = 40, className }) {
  let content

  switch (kind) {
    case 'clear':
      content = isDay ? <Sun r={11} /> : <Moon transform="translate(-4 -2) scale(1.05)" />
      break
    case 'partly':
      content = (
        <>
          {isDay ? <Sun cx={24} cy={23} r={8} /> : <Moon transform="translate(-8 -8) scale(0.72)" />}
          <Cloud y={4} />
        </>
      )
      break
    case 'cloud':
      content = <Cloud y={-3} />
      break
    case 'fog':
      content = (
        <>
          <Cloud y={-8} />
          <g stroke="#a1a1aa" strokeWidth="2.6" strokeLinecap="round">
            <line x1="14" y1="50" x2="50" y2="50" />
            <line x1="20" y1="57" x2="44" y2="57" />
          </g>
        </>
      )
      break
    case 'drizzle':
      content = (
        <>
          <Cloud y={-8} />
          <Drops dots />
        </>
      )
      break
    case 'rain':
      content = (
        <>
          <Cloud y={-8} />
          <Drops />
        </>
      )
      break
    case 'snow':
      content = (
        <>
          <Cloud y={-8} />
          <Drops color="#e0f2fe" dots />
        </>
      )
      break
    case 'thunder':
      content = (
        <>
          <Cloud dark y={-8} />
          <path fill="#ffc53d" d="M35 38h-8l-4 12h6l-3 11 11-15h-6z" />
        </>
      )
      break
    default:
      content = <Cloud />
  }

  return (
    <svg className={className} width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      {content}
    </svg>
  )
}
