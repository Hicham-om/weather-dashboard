import SkyBackdrop from './SkyBackdrop.jsx'
import { SunriseIcon, SunsetIcon } from './Icons.jsx'
import { describeWeather, formatTime, round, zonedClock } from '../lib/weather.js'

export default function HeroCard({ place, forecast, now }) {
  const { current, daily, timezone, utcOffsetSeconds } = forecast
  const today = daily[0]
  const { title, subtitle, sky } = describeWeather(current.code, current.isDay)
  const clock = zonedClock(now, timezone, utcOffsetSeconds)
  const seed = Math.abs(Math.round(place.latitude * 97 + place.longitude * 31)) % 1000

  return (
    <section className="hero" aria-label={`Current weather in ${place.name}`}>
      <SkyBackdrop sky={sky} seed={seed} />

      <div className="hero__main">
        <p className="hero__temp">
          {round(current.temperature)}
          <span className="hero__degree">°</span>
        </p>
        <h1 className="hero__title">{title}</h1>
        <p className="hero__subtitle">{subtitle}</p>
        <div className="hero__range">
          <span className="chip">
            <span className="chip__muted">H</span> {round(today.max)}°
          </span>
          <span className="chip">
            <span className="chip__muted">L</span> {round(today.min)}°
          </span>
        </div>
      </div>

      <aside className="hero__glass" aria-label={`Local time in ${place.name}`}>
        <p className="hero__glass-label">Local time</p>
        <p className="hero__clock">{clock.time}</p>
        <p className="hero__zone">
          {timezone.replace(/_/g, ' ')} · {clock.offset}
        </p>
        <div className="hero__sun">
          <span>
            <SunriseIcon size={16} /> {formatTime(today.sunrise)}
          </span>
          <span>
            <SunsetIcon size={16} /> {formatTime(today.sunset)}
          </span>
        </div>
      </aside>
    </section>
  )
}
