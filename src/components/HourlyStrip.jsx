import { useEffect, useRef } from 'react'
import WeatherIcon from './WeatherIcon.jsx'
import { describeWeather, formatHour, round } from '../lib/weather.js'

export default function HourlyStrip({ forecast, dayIndex }) {
  const listRef = useRef(null)
  const { current, hourly, daily } = forecast
  const date = daily[dayIndex].date
  const nowHour = `${current.time.slice(0, 13)}:00`

  const start = Math.max(0, hourly.findIndex((h) => h.time >= nowHour))
  const hours = dayIndex === 0 ? hourly.slice(start, start + 24) : hourly.filter((h) => h.time.startsWith(date))

  useEffect(() => {
    listRef.current?.scrollTo({ left: 0 })
  }, [dayIndex, forecast])

  return (
    <section className="card hourly" aria-label={dayIndex === 0 ? 'Next 24 hours' : `Hourly forecast for ${date}`}>
      <ol className="hourly__list" ref={listRef}>
        {hours.map((hour, i) => {
          const isNow = dayIndex === 0 && i === 0
          const { label, icon } = describeWeather(hour.code, hour.isDay)
          return (
            <li key={hour.time} className={isNow ? 'hourly__item hourly__item--now' : 'hourly__item'}>
              <span className="hourly__time">{isNow ? 'Now' : formatHour(hour.time)}</span>
              <span className="hourly__rain">{hour.precipitationChance >= 10 ? `${hour.precipitationChance}%` : ''}</span>
              <WeatherIcon kind={icon} isDay={hour.isDay} size={40} />
              <span className="visually-hidden">{label}</span>
              <span className="hourly__temp">{round(hour.temperature)}°</span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
