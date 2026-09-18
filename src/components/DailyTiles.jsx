import WeatherIcon from './WeatherIcon.jsx'
import { describeWeather, formatWeekday, round } from '../lib/weather.js'

export default function DailyTiles({ days, selected, onSelect }) {
  return (
    <section className="daily" aria-label="7-day forecast">
      {days.map((day, i) => {
        const { label, icon } = describeWeather(day.code)
        const name = i === 0 ? 'Today' : formatWeekday(day.date)
        return (
          <button
            key={day.date}
            type="button"
            className="daily__tile"
            aria-pressed={i === selected}
            aria-label={`${name}: ${label}, high ${round(day.max)}°, low ${round(day.min)}°`}
            onClick={() => onSelect(i)}
          >
            <span className="daily__day">{name}</span>
            <span className="daily__icon">
              <WeatherIcon kind={icon} size={48} />
              {day.precipitationChance >= 10 && <span className="daily__rain">{day.precipitationChance}%</span>}
            </span>
            <span className="daily__max">{round(day.max)}°</span>
            <span className="daily__min">{round(day.min)}°</span>
          </button>
        )
      })}
    </section>
  )
}
