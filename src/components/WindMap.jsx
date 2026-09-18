import { useMemo } from 'react'
import { PinIcon } from './Icons.jsx'
import { WIND_UNITS } from '../lib/api.js'
import { compassDirection, round } from '../lib/weather.js'

const CENTER = { x: 290, y: 130 }

// Swirling streaks around the location pin, like a wind-flow visualisation.
function buildStreaks() {
  let seed = 42
  const random = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  return Array.from({ length: 170 }, () => {
    const radius = 40 + random() ** 0.8 * 300
    const start = random() * Math.PI * 2
    const length = 0.12 + random() * 0.35
    const steps = 6
    const points = Array.from({ length: steps + 1 }, (_, i) => {
      const angle = start + (length * i) / steps
      const r = radius - i * 2.2 // slight inward spiral
      return `${(CENTER.x + Math.cos(angle) * r).toFixed(1)},${(CENTER.y + Math.sin(angle) * r * 0.82).toFixed(1)}`
    })
    return { d: `M${points.join(' L')}`, opacity: 0.08 + random() * 0.3 }
  })
}

export default function WindMap({ forecast, units }) {
  const streaks = useMemo(buildStreaks, [])
  const { windSpeed, windDirection } = forecast.current
  // Faster wind, faster swirl (between ~20 s and ~120 s per turn).
  const duration = Math.max(20, 120 - windSpeed * 3)

  return (
    <section className="card wind" id="wind-map" aria-label="Wind">
      <svg className="wind__streaks" viewBox="0 0 440 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g className="wind__swirl" style={{ animationDuration: `${duration}s`, transformOrigin: `${CENTER.x}px ${CENTER.y}px` }}>
          {streaks.map((s, i) => (
            <path key={i} d={s.d} fill="none" stroke="#fff" strokeOpacity={s.opacity} strokeWidth="1" strokeLinecap="round" />
          ))}
        </g>
      </svg>

      <div className="wind__text">
        <h2 className="card__title">Wind Map</h2>
        <p className="wind__speed">
          {round(windSpeed)} <span>{WIND_UNITS[units.wind]}</span>
        </p>
        <p className="wind__direction">{compassDirection(windDirection)}</p>
      </div>

      <div className="wind__pin" title={`Wind from ${compassDirection(windDirection).toLowerCase()} (${round(windDirection)}°)`}>
        <PinIcon size={26} />
        {/* Arrow points the way the wind is blowing. */}
        <span className="wind__arrow" style={{ transform: `rotate(${windDirection + 180}deg)` }} />
      </div>
    </section>
  )
}
