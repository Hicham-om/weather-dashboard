const OPEN_METEO_GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const PHOTON_URL = 'https://photon.komoot.io'
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'

export const TEMPERATURE_UNITS = {
  celsius: { label: '°C', precipitation: 'mm' },
  fahrenheit: { label: '°F', precipitation: 'inch' },
}

export const WIND_UNITS = {
  kmh: 'km/h',
  ms: 'm/s',
  mph: 'mph',
  kn: 'kn',
}

/* ---------- Place search ---------- */

// Photon (OpenStreetMap) does prefix matching and knows alternate spellings such as
// "Marrakech"; Open-Meteo's geocoder is fast and has population data. Both are queried
// and merged so suggestions appear quickly and still find what people type.

const PHOTON_PLACE_RANK = {
  city: 0,
  town: 1,
  municipality: 1,
  borough: 2,
  village: 2,
  suburb: 3,
  hamlet: 3,
  locality: 3,
}

export async function searchOpenMeteo(query, signal) {
  const params = new URLSearchParams({ name: query, count: '10', language: 'en', format: 'json' })
  const res = await fetch(`${OPEN_METEO_GEOCODING_URL}?${params}`, { signal })
  if (!res.ok) throw new Error('Open-Meteo search failed')

  const data = await res.json()
  return (data.results ?? [])
    .filter((r) => r.feature_code?.startsWith('PPL'))
    .map((r) => ({
      id: `om-${r.id}`,
      name: r.name,
      region: [r.admin1 !== r.name ? r.admin1 : null, r.country].filter(Boolean).join(', '),
      country: r.country ?? '',
      countryCode: (r.country_code ?? '').toUpperCase(),
      latitude: r.latitude,
      longitude: r.longitude,
      population: r.population ?? 0,
      rank: openMeteoRank(r),
    }))
}

function openMeteoRank({ feature_code: code, population = 0 }) {
  if (code === 'PPLC' || population >= 500_000) return 0
  if (code === 'PPLA' || code === 'PPLA2' || population >= 50_000) return 1
  if (population >= 2_000) return 2
  return 3
}

export async function searchPhoton(query, signal) {
  const params = new URLSearchParams({ q: query, limit: '10', lang: 'en', osm_tag: 'place' })
  const res = await fetch(`${PHOTON_URL}/api/?${params}`, { signal })
  if (!res.ok) throw new Error('Photon search failed')

  const data = await res.json()
  return (data.features ?? [])
    .filter((f) => f.properties.osm_key === 'place' && f.properties.osm_value in PHOTON_PLACE_RANK)
    .map((f) => {
      const p = f.properties
      const [longitude, latitude] = f.geometry.coordinates
      return {
        id: `ph-${p.osm_type}${p.osm_id}`,
        name: p.name,
        region: [p.state !== p.name ? p.state : null, p.country].filter(Boolean).join(', '),
        country: p.country ?? '',
        countryCode: (p.countrycode ?? '').toUpperCase(),
        latitude,
        longitude,
        population: 0,
        rank: PHOTON_PLACE_RANK[p.osm_value],
      }
    })
}

export function mergePlaces(query, lists, limit = 6) {
  const q = normalize(query)
  const merged = []

  for (const place of lists.flat()) {
    const duplicate = merged.find(
      (m) =>
        m.countryCode === place.countryCode &&
        normalize(m.name) === normalize(place.name) &&
        distanceKm(m, place) < 40,
    )
    if (duplicate) {
      duplicate.rank = Math.min(duplicate.rank, place.rank)
      duplicate.population = Math.max(duplicate.population, place.population)
    } else {
      merged.push({ ...place })
    }
  }

  const score = (p) => (normalize(p.name).startsWith(q) ? 0 : 4) + p.rank
  return merged
    .map((place, order) => ({ place, order }))
    .sort((a, b) => score(a.place) - score(b.place) || b.place.population - a.place.population || a.order - b.order)
    .slice(0, limit)
    .map(({ place }) => place)
}

function normalize(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

function distanceKm(a, b) {
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(b.latitude - a.latitude)
  const dLon = toRad(b.longitude - a.longitude)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(h))
}

export async function reverseGeocode(latitude, longitude, signal) {
  const params = new URLSearchParams({ lat: String(latitude), lon: String(longitude), lang: 'en' })
  const res = await fetch(`${PHOTON_URL}/reverse?${params}`, { signal })
  if (!res.ok) throw new Error('Reverse geocoding failed')

  const p = (await res.json()).features?.[0]?.properties
  if (!p) return null
  const name = p.city ?? p.town ?? p.village ?? p.name
  return {
    name,
    region: [p.state !== name ? p.state : null, p.country].filter(Boolean).join(', '),
    country: p.country ?? '',
    countryCode: (p.countrycode ?? '').toUpperCase(),
  }
}

/* ---------- Forecast ---------- */

function unitParams(units) {
  return {
    temperature_unit: units.temperature,
    wind_speed_unit: units.wind,
    precipitation_unit: TEMPERATURE_UNITS[units.temperature].precipitation,
  }
}

export async function fetchForecast({ latitude, longitude }, units, signal) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    timezone: 'auto',
    forecast_days: '7',
    ...unitParams(units),
    current: [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'precipitation',
      'weather_code',
      'is_day',
      'wind_speed_10m',
      'wind_direction_10m',
      'pressure_msl',
    ].join(','),
    hourly: ['temperature_2m', 'weather_code', 'precipitation_probability', 'is_day', 'uv_index'].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_probability_max',
      'sunrise',
      'sunset',
      'uv_index_max',
    ].join(','),
  })

  const res = await fetch(`${FORECAST_URL}?${params}`, { signal })
  if (!res.ok) throw new Error('Could not load the forecast')
  return normalizeForecast(await res.json())
}

function normalizeForecast({ current, hourly, daily, timezone, utc_offset_seconds }) {
  return {
    timezone,
    utcOffsetSeconds: utc_offset_seconds,
    current: {
      // Wall-clock time at the location, e.g. "2026-09-16T21:15".
      time: current.time,
      temperature: current.temperature_2m,
      feelsLike: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      precipitation: current.precipitation,
      code: current.weather_code,
      isDay: current.is_day === 1,
      windSpeed: current.wind_speed_10m,
      windDirection: current.wind_direction_10m,
      pressure: current.pressure_msl,
    },
    // All 7 days, hour by hour, starting at local midnight today.
    hourly: hourly.time.map((time, i) => ({
      time,
      temperature: hourly.temperature_2m[i],
      code: hourly.weather_code[i],
      precipitationChance: hourly.precipitation_probability[i] ?? 0,
      isDay: hourly.is_day[i] === 1,
      uvIndex: hourly.uv_index[i] ?? 0,
    })),
    daily: daily.time.map((date, i) => ({
      date,
      code: daily.weather_code[i],
      max: daily.temperature_2m_max[i],
      min: daily.temperature_2m_min[i],
      precipitationChance: daily.precipitation_probability_max[i] ?? 0,
      sunrise: daily.sunrise[i],
      sunset: daily.sunset[i],
      uvIndex: daily.uv_index_max[i],
    })),
  }
}

// Current conditions for several places in one request (used by "Recently Searched").
export async function fetchCurrentForPlaces(places, units, signal) {
  if (places.length === 0) return []
  const params = new URLSearchParams({
    latitude: places.map((p) => p.latitude).join(','),
    longitude: places.map((p) => p.longitude).join(','),
    timezone: 'auto',
    ...unitParams(units),
    current: 'temperature_2m,weather_code,is_day',
  })

  const res = await fetch(`${FORECAST_URL}?${params}`, { signal })
  if (!res.ok) throw new Error('Could not load recent places')

  const data = await res.json()
  return (Array.isArray(data) ? data : [data]).map(({ current }) => ({
    temperature: current.temperature_2m,
    code: current.weather_code,
    isDay: current.is_day === 1,
  }))
}
