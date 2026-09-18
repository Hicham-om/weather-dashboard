import { useId, useState } from 'react'
import { ArrowUpIcon, ChevronRightIcon, DropletIcon, GaugeIcon, WindIcon } from './Icons.jsx'
import { WIND_UNITS } from '../lib/api.js'
import { round, uvLevel } from '../lib/weather.js'

const WIDTH = 300
const HEIGHT = 100

const METRICS = [
  {
    key: 'uv',
    name: 'UV index',
    value: (h) => h.uvIndex,
    format: (v) => v.toFixed(1),
    badge: (v) => uvLevel(v),
  },
  {
    key: 'temperature',
    name: 'Temperature',
    value: (h) => h.temperature,
    format: (v) => `${round(v)}°`,
    badge: (_, forecast) => `Feels ${round(forecast.current.feelsLike)}°`,
  },
  {
    key: 'rain',
    name: 'Chance of rain',
    value: (h) => h.precipitationChance,
    format: (v) => `${round(v)}%`,
    badge: (v) => (v >= 60 ? 'Rain likely' : v >= 30 ? 'Possible rain' : 'Dry'),
  },
]

// Catmull-Rom spline through the points, as cubic Bézier segments.
function smoothPath(points) {
  return points
    .map((p, i) => {
      if (i === 0) return `M${p.x},${p.y}`
      const p0 = points[i - 2] ?? points[i - 1]
      const p1 = points[i - 1]
      const p3 = points[i + 1] ?? p
      const c1 = { x: p1.x + (p.x - p0.x) / 6, y: p1.y + (p.y - p0.y) / 6 }
      const c2 = { x: p.x - (p3.x - p1.x) / 6, y: p.y - (p3.y - p1.y) / 6 }
      return `C${c1.x},${c1.y} ${c2.x},${c2.y} ${p.x},${p.y}`
    })
    .join(' ')
}

export default function LiveConditions({ forecast, units }) {
  const [metricIndex, setMetricIndex] = useState(0)
  const gradientId = useId().replace(/:/g, '')
  const metric = METRICS[metricIndex]
  const { current, hourly } = forecast

  const today = current.time.slice(0, 10)
  const hours = hourly.filter((h) => h.time.startsWith(today))
  const nowIndex = Math.max(0, hours.findIndex((h) => h.time.slice(11, 13) === current.time.slice(11, 13)))

  const values = hours.map(metric.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const points = values.map((v, i) => ({
    x: (i / Math.max(1, values.length - 1)) * WIDTH,
    y: 12 + (1 - (v - min) / span) * (HEIGHT - 24),
  }))

  const marker = points[nowIndex]
  const value = values[nowIndex]
  const next = values[Math.min(nowIndex + 1, values.length - 1)]
  const rising = next >= value

  return (
    <section className="card live" id="live-conditions" aria-label="Live conditions">
      <header className="card__header">
        <h2 className="card__title">Live Conditions</h2>
        <button
          type="button"
          className="card__link"
          aria-label={`Show ${METRICS[(metricIndex + 1) % METRICS.length].name.toLowerCase()}`}
          title={`Show ${METRICS[(metricIndex + 1) % METRICS.length].name.toLowerCase()}`}
          onClick={() => setMetricIndex((i) => (i + 1) % METRICS.length)}
        >
          <ChevronRightIcon size={20} />
        </button>
      </header>

      <div className="live__chart">
        <span className="live__chip">
          <ArrowUpIcon size={14} style={{ transform: rising ? 'none' : 'rotate(180deg)' }} />
          {metric.format(value)}
          <span className="live__metric">{metric.name}</span>
        </span>

        <div className="live__plot">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" role="img" aria-label={`${metric.name} today`}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2={WIDTH} y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#38bdf8" />
                <stop offset="0.6" stopColor="#a78bfa" />
                <stop offset="1" stopColor="#f97316" />
              </linearGradient>
            </defs>
            <path d={smoothPath(points)} fill="none" stroke={`url(#${gradientId})`} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
          </svg>

          {marker && (
            <>
              <span
                className="live__marker"
                style={{ left: `${(marker.x / WIDTH) * 100}%`, top: `${(marker.y / HEIGHT) * 100}%` }}
              />
              <span
                className="live__badge"
                style={{
                  left: `${Math.min(82, Math.max(18, (marker.x / WIDTH) * 100))}%`,
                  top: `${(marker.y / HEIGHT) * 100}%`,
                }}
              >
                {metric.badge(value, forecast)}
              </span>
            </>
          )}
        </div>
      </div>

      <dl className="stats">
        <div className="stat">
          <DropletIcon size={18} className="stat__icon" />
          <dt className="stat__label">Humidity</dt>
          <dd className="stat__value">{current.humidity}%</dd>
        </div>
        <div className="stat">
          <WindIcon size={18} className="stat__icon" />
          <dt className="stat__label">Wind</dt>
          <dd className="stat__value">
            {round(current.windSpeed)} {WIND_UNITS[units.wind]}
          </dd>
        </div>
        <div className="stat">
          <GaugeIcon size={18} className="stat__icon" />
          <dt className="stat__label">Pressure</dt>
          <dd className="stat__value">{round(current.pressure)} hPa</dd>
        </div>
      </dl>
    </section>
  )
}
