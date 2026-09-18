import { useCallback, useEffect, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import SearchBox from './components/SearchBox.jsx'
import HeroCard from './components/HeroCard.jsx'
import HourlyStrip from './components/HourlyStrip.jsx'
import DailyTiles from './components/DailyTiles.jsx'
import LiveConditions from './components/LiveConditions.jsx'
import RecentSearches from './components/RecentSearches.jsx'
import WindMap from './components/WindMap.jsx'
import { WeatherIconDefs } from './components/WeatherIcon.jsx'
import { LocateIcon, PinIcon } from './components/Icons.jsx'
import { fetchForecast, reverseGeocode } from './lib/api.js'
import { describeWeather, round, zonedClock } from './lib/weather.js'
import { load, save } from './lib/storage.js'
import useNow from './lib/useNow.js'

const DEFAULT_PLACE = {
  name: 'Brooklyn',
  region: 'New York, United States',
  country: 'United States',
  countryCode: 'US',
  latitude: 40.6501,
  longitude: -73.94958,
}

const SEED_RECENT = [
  { name: 'Liverpool', region: 'England, United Kingdom', country: 'UK', countryCode: 'GB', latitude: 53.41058, longitude: -2.97794 },
  { name: 'Palermo', region: 'Sicily, Italy', country: 'Italy', countryCode: 'IT', latitude: 38.11582, longitude: 13.35976 },
]

const DEFAULT_UNITS = { temperature: 'celsius', wind: 'kmh' }
const MAX_RECENT = 8
const REFRESH_EVERY_MS = 10 * 60 * 1000

function loadUnits() {
  const saved = load('units', DEFAULT_UNITS)
  if (saved === 'imperial') return { temperature: 'fahrenheit', wind: 'mph' }
  return saved && typeof saved === 'object' ? { ...DEFAULT_UNITS, ...saved } : DEFAULT_UNITS
}

function loadPlace() {
  const saved = load('place', DEFAULT_PLACE)
  return Number.isFinite(saved?.latitude) && Number.isFinite(saved?.longitude) ? saved : DEFAULT_PLACE
}

const samePlace = (a, b) => Math.abs(a.latitude - b.latitude) < 0.01 && Math.abs(a.longitude - b.longitude) < 0.01

function toStoredPlace({ name, region, country, countryCode, latitude, longitude }) {
  return { name, region, country, countryCode, latitude, longitude }
}

export default function App() {
  const [place, setPlace] = useState(loadPlace)
  const [units, setUnits] = useState(loadUnits)
  const [recent, setRecent] = useState(() => load('recent', SEED_RECENT))
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatedAt, setUpdatedAt] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [selectedDay, setSelectedDay] = useState(0)
  const [searchOpen, setSearchOpen] = useState(false)
  const [locating, setLocating] = useState(false)
  const [activeNav, setActiveNav] = useState('home')
  const now = useNow(1000)

  useEffect(() => save('place', place), [place])
  useEffect(() => save('units', units), [units])
  useEffect(() => save('recent', recent), [recent])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    fetchForecast(place, units, controller.signal)
      .then((data) => {
        setForecast({ ...data, place })
        setUpdatedAt(Date.now())
        setLoading(false)
      })
      .catch((err) => {
        if (controller.signal.aborted) return
        setError(err.message || 'Something went wrong')
        setLoading(false)
      })

    return () => controller.abort()
  }, [place, units, reloadKey])

  useEffect(() => {
    const timer = setInterval(() => setReloadKey((k) => k + 1), REFRESH_EVERY_MS)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!forecast) return
    const { title } = describeWeather(forecast.current.code, forecast.current.isDay)
    document.title = `${forecast.place.name} · ${round(forecast.current.temperature)}° ${title}`
  }, [forecast])

  const selectPlace = useCallback((next) => {
    const stored = toStoredPlace(next)
    setPlace(stored)
    setSelectedDay(0)
    setRecent((list) => [stored, ...list.filter((p) => !samePlace(p, stored))].slice(0, MAX_RECENT))
  }, [])

  function locateMe() {
    if (!navigator.geolocation) {
      setError('Your browser does not support location access.')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude, longitude } = coords
        let named = null
        try {
          named = await reverseGeocode(latitude, longitude, AbortSignal.timeout(8000))
        } catch {
          // The coordinates are enough to load the forecast.
        }
        setLocating(false)
        selectPlace({
          name: named?.name ?? 'My location',
          region: named?.region ?? `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
          country: named?.country ?? '',
          countryCode: named?.countryCode ?? '',
          latitude,
          longitude,
        })
      },
      () => {
        setLocating(false)
        setError('Could not get your location. Allow location access in your browser and try again.')
      },
      { timeout: 10000, maximumAge: 10 * 60 * 1000 },
    )
  }

  function navigate(key) {
    setActiveNav(key)
    if (key === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const target = document.getElementById(key === 'wind' ? 'wind-map' : 'live-conditions')
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const shownPlace = forecast?.place ?? place
  const clock = forecast ? zonedClock(now, forecast.timezone, forecast.utcOffsetSeconds) : null
  const otherRecent = recent.filter((p) => !samePlace(p, shownPlace))
  const day = forecast ? Math.min(selectedDay, forecast.daily.length - 1) : 0

  return (
    <div className="page">
      <WeatherIconDefs />
      <div className="dashboard">
        <Sidebar
          active={activeNav}
          onNavigate={navigate}
          onOpenSearch={() => setSearchOpen(true)}
          units={units}
          onUnitsChange={setUnits}
          onClearRecent={() => setRecent([])}
          updatedAt={updatedAt}
          refreshing={loading && Boolean(forecast)}
          onRefresh={() => setReloadKey((k) => k + 1)}
          now={now}
        />

        <div className="main">
          <header className="topbar">
            <div className="location">
              <PinIcon size={22} className="location__pin" />
              <div className="location__text">
                <p className="location__name">{[shownPlace.name, shownPlace.region].filter(Boolean).join(', ')}</p>
                <p className="location__date">{clock ? `${clock.date} · ${clock.time}` : ' '}</p>
              </div>
            </div>

            <div className={searchOpen ? 'topbar__actions topbar__actions--search' : 'topbar__actions'}>
              <SearchBox
                expanded={searchOpen}
                onExpandedChange={setSearchOpen}
                recent={recent}
                onSelect={selectPlace}
              />
              <button type="button" className="pill-button" onClick={locateMe} disabled={locating}>
                <LocateIcon size={18} />
                <span className="pill-button__label">{locating ? 'Locating…' : 'My Location'}</span>
              </button>
            </div>
          </header>

          {error && (
            <div className="alert" role="alert">
              <span>{error}</span>
              <button type="button" className="pill-button pill-button--small" onClick={() => setReloadKey((k) => k + 1)}>
                Retry
              </button>
            </div>
          )}

          {forecast ? (
            <div className={loading ? 'grid grid--loading' : 'grid'} aria-busy={loading}>
              <div className="grid__primary">
                <HeroCard place={forecast.place} forecast={forecast} now={now} />
                <HourlyStrip forecast={forecast} dayIndex={day} />
                <DailyTiles days={forecast.daily} selected={day} onSelect={setSelectedDay} />
              </div>
              <div className="grid__secondary">
                <LiveConditions forecast={forecast} units={units} />
                <RecentSearches places={otherRecent} units={units} onSelect={selectPlace} />
                <WindMap forecast={forecast} units={units} />
              </div>
            </div>
          ) : (
            !error && <DashboardSkeleton />
          )}

          <footer className="credit">
            <p className="credit__author">
              Designed &amp; built by{' '}
              <a href="https://github.com/Hicham-om" target="_blank" rel="noreferrer">
                Hicham Ouikrim
              </a>{' '}
              · WYDstudio
            </p>
            <p>
              Weather data by{' '}
              <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
                Open-Meteo
              </a>{' '}
              · Places ©{' '}
              <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
                OpenStreetMap
              </a>
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="grid" aria-busy="true" aria-label="Loading forecast">
      <div className="grid__primary">
        <div className="skeleton skeleton--hero" />
        <div className="skeleton skeleton--hourly" />
        <div className="skeleton skeleton--daily" />
      </div>
      <div className="grid__secondary">
        <div className="skeleton skeleton--card" />
        <div className="skeleton skeleton--card" />
        <div className="skeleton skeleton--card" />
      </div>
    </div>
  )
}
