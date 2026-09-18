// WMO weather interpretation codes used by Open-Meteo.
// [title, subtitle, icon, sky]
const CODES = {
  0: ['Sunny', 'with clear skies', 'clear', 'clear'],
  1: ['Sunny', 'with a few clouds', 'clear', 'clear'],
  2: ['Cloudy', 'with partly cloudy', 'partly', 'cloudy'],
  3: ['Cloudy', 'with overcast skies', 'cloud', 'cloudy'],
  45: ['Foggy', 'with low visibility', 'fog', 'fog'],
  48: ['Foggy', 'with rime fog', 'fog', 'fog'],
  51: ['Drizzle', 'with light drizzle', 'drizzle', 'rain'],
  53: ['Drizzle', 'with moderate drizzle', 'drizzle', 'rain'],
  55: ['Drizzle', 'with dense drizzle', 'drizzle', 'rain'],
  56: ['Icy', 'with freezing drizzle', 'drizzle', 'rain'],
  57: ['Icy', 'with heavy freezing drizzle', 'drizzle', 'rain'],
  61: ['Rainy', 'with light rain', 'rain', 'rain'],
  63: ['Rainy', 'with moderate rain', 'rain', 'rain'],
  65: ['Rainy', 'with heavy rain', 'rain', 'storm'],
  66: ['Icy', 'with freezing rain', 'rain', 'rain'],
  67: ['Icy', 'with heavy freezing rain', 'rain', 'storm'],
  71: ['Snowy', 'with light snow', 'snow', 'snow'],
  73: ['Snowy', 'with moderate snow', 'snow', 'snow'],
  75: ['Snowy', 'with heavy snow', 'snow', 'snow'],
  77: ['Snowy', 'with snow grains', 'snow', 'snow'],
  80: ['Showers', 'with light rain showers', 'rain', 'rain'],
  81: ['Showers', 'with rain showers', 'rain', 'rain'],
  82: ['Stormy', 'with violent showers', 'thunder', 'storm'],
  85: ['Snowy', 'with snow showers', 'snow', 'snow'],
  86: ['Snowy', 'with heavy snow showers', 'snow', 'snow'],
  95: ['Stormy', 'with thunderstorms', 'thunder', 'storm'],
  96: ['Stormy', 'with thunder and hail', 'thunder', 'storm'],
  99: ['Stormy', 'with severe thunder and hail', 'thunder', 'storm'],
}

export function describeWeather(code, isDay = true) {
  const [title, subtitle, icon, sky] = CODES[code] ?? ['Unknown', '', 'cloud', 'cloudy']
  const clearNight = !isDay && title === 'Sunny'
  return {
    title: clearNight ? 'Clear' : title,
    subtitle: clearNight ? subtitle.replace('clear skies', 'starry skies') : subtitle,
    // Short label for lists, e.g. "Partly cloudy", "Light rain".
    label: capitalize(subtitle.replace(/^with (a )?/, '')),
    icon,
    sky: isDay ? sky : `${sky}-night`,
  }
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

const COMPASS = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest']

export function compassDirection(degrees) {
  return COMPASS[Math.round(degrees / 45) % 8]
}

export function uvLevel(uv) {
  if (uv < 3) return 'Low'
  if (uv < 6) return 'Moderate'
  if (uv < 8) return 'High'
  if (uv < 11) return 'Very high'
  return 'Dangerous'
}

export function round(value) {
  const rounded = Math.round(value)
  return Object.is(rounded, -0) ? 0 : rounded
}

/* ---------- Time ----------
 * Open-Meteo returns wall-clock times at the location ("2026-09-16T21:00") with no offset.
 * They are formatted as UTC so the viewer's own time zone never shifts them.
 */

function wallClockDate(iso) {
  const [date, time = '00:00'] = iso.split('T')
  const [y, m, d] = date.split('-').map(Number)
  const [h, min] = time.split(':').map(Number)
  return new Date(Date.UTC(y, m - 1, d, h, min))
}

export function formatHour(iso) {
  return wallClockDate(iso).toLocaleTimeString('en-US', { hour: 'numeric', timeZone: 'UTC' })
}

export function formatTime(iso) {
  return wallClockDate(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' })
}

export function formatWeekday(isoDate) {
  return wallClockDate(isoDate).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })
}

/* Live clock for a location. Uses the IANA zone when the browser knows it and falls back
 * to the UTC offset reported by the API. */
export function zonedClock(now, timezone, utcOffsetSeconds) {
  const options = (extra) => ({ ...extra, timeZone: timezone })
  try {
    return {
      time: now.toLocaleTimeString('en-US', options({ hour: 'numeric', minute: '2-digit' })),
      date: now.toLocaleDateString('en-US', options({ weekday: 'long', month: 'long', day: 'numeric' })),
      offset: formatOffset(utcOffsetSeconds),
    }
  } catch {
    const shifted = new Date(now.getTime() + utcOffsetSeconds * 1000)
    return {
      time: shifted.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }),
      date: shifted.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' }),
      offset: formatOffset(utcOffsetSeconds),
    }
  }
}

function formatOffset(seconds) {
  const sign = seconds < 0 ? '−' : '+'
  const abs = Math.abs(seconds)
  const hours = Math.floor(abs / 3600)
  const minutes = Math.floor((abs % 3600) / 60)
  return `GMT${sign}${hours}${minutes ? `:${String(minutes).padStart(2, '0')}` : ''}`
}

export function timeAgo(timestamp, now) {
  const minutes = Math.floor((now - timestamp) / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  return `${hours} h ago`
}
