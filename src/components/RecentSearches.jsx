import { useEffect, useState } from 'react'
import WeatherIcon from './WeatherIcon.jsx'
import { ChevronRightIcon } from './Icons.jsx'
import { fetchCurrentForPlaces } from '../lib/api.js'
import { describeWeather, round } from '../lib/weather.js'

const COLLAPSED_COUNT = 2

export default function RecentSearches({ places, units, onSelect }) {
  const [expanded, setExpanded] = useState(false)
  const [conditions, setConditions] = useState({ key: '', list: [] })

  const key = JSON.stringify([places.map((p) => [p.latitude, p.longitude]), units])

  useEffect(() => {
    if (places.length === 0) return
    const controller = new AbortController()
    fetchCurrentForPlaces(places, units, controller.signal)
      .then((list) => setConditions({ key, list }))
      .catch(() => {})
    return () => controller.abort()
    // `key` captures every input that changes the request.
  }, [key])

  const visible = expanded ? places : places.slice(0, COLLAPSED_COUNT)
  const weather = conditions.key === key ? conditions.list : []

  return (
    <section className="card recent" aria-label="Recently searched">
      <header className="card__header">
        <h2 className="card__title">Recently Searched</h2>
        {places.length > COLLAPSED_COUNT && (
          <button type="button" className="card__link card__link--text" onClick={() => setExpanded((e) => !e)}>
            {expanded ? 'Show less' : 'See All'}
            <ChevronRightIcon size={16} style={{ transform: expanded ? 'rotate(-90deg)' : 'none' }} />
          </button>
        )}
      </header>

      {places.length === 0 ? (
        <p className="recent__empty">Cities you search for will show up here.</p>
      ) : (
        <ul className="recent__list">
          {visible.map((place, i) => {
            const now = weather[i]
            const description = now ? describeWeather(now.code, now.isDay) : null
            const country = place.country || place.region.split(', ').pop()
            return (
              <li key={`${place.latitude},${place.longitude}`}>
                <button type="button" className="recent__item" onClick={() => onSelect(place)}>
                  <span className="recent__icon">
                    {description ? <WeatherIcon kind={description.icon} isDay={now.isDay} size={44} /> : <span className="skeleton skeleton--icon" />}
                  </span>
                  <span className="recent__text">
                    <span className="recent__name">
                      {place.name}
                      {country && country !== place.name ? `, ${country}` : ''}
                    </span>
                    <span className="recent__condition">{description ? description.label : 'Loading…'}</span>
                  </span>
                  <span className="recent__temp">{now ? `${round(now.temperature)}°` : '–'}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
