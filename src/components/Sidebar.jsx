import { useEffect, useRef, useState } from 'react'
import { ChartIcon, HomeIcon, PinIcon, RadarIcon, RefreshIcon, SettingsIcon } from './Icons.jsx'
import { TEMPERATURE_UNITS, WIND_UNITS } from '../lib/api.js'
import { timeAgo } from '../lib/weather.js'

export default function Sidebar({ active, onNavigate, onOpenSearch, units, onUnitsChange, onClearRecent, updatedAt, refreshing, onRefresh, now }) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsRef = useRef(null)

  useEffect(() => {
    if (!settingsOpen) return
    const onPointer = (e) => {
      if (!settingsRef.current?.contains(e.target)) setSettingsOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setSettingsOpen(false)
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [settingsOpen])

  const navItem = (key, label, Icon, onClick) => (
    <button
      type="button"
      className="nav__item"
      aria-label={label}
      title={label}
      aria-current={active === key ? 'page' : undefined}
      onClick={onClick}
    >
      <Icon size={24} />
    </button>
  )

  return (
    <nav className="sidebar" aria-label="Dashboard">
      <a
        className="brand"
        href="https://github.com/Hicham-om"
        target="_blank"
        rel="noreferrer"
        title="WYDstudio — Hicham Ouikrim"
        aria-label="WYDstudio, by Hicham Ouikrim"
      >
        WYD
      </a>

      <div className="nav">
        {navItem('home', 'Overview', HomeIcon, () => onNavigate('home'))}
        {navItem('search', 'Search locations', PinIcon, onOpenSearch)}
        {navItem('wind', 'Wind map', RadarIcon, () => onNavigate('wind'))}
        {navItem('live', 'Live conditions', ChartIcon, () => onNavigate('live'))}

        <div className="settings" ref={settingsRef}>
          <button
            type="button"
            className="nav__item"
            aria-label="Settings"
            title="Settings"
            aria-expanded={settingsOpen}
            aria-haspopup="dialog"
            onClick={() => setSettingsOpen((o) => !o)}
          >
            <SettingsIcon size={24} />
          </button>

          {settingsOpen && (
            <div className="popover" role="dialog" aria-label="Settings">
              <p className="popover__label">Temperature</p>
              <div className="segmented" role="group" aria-label="Temperature unit">
                {Object.entries(TEMPERATURE_UNITS).map(([value, { label }]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={units.temperature === value}
                    onClick={() => onUnitsChange({ ...units, temperature: value })}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <p className="popover__label">Wind speed</p>
              <div className="segmented" role="group" aria-label="Wind speed unit">
                {Object.entries(WIND_UNITS).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={units.wind === value}
                    onClick={() => onUnitsChange({ ...units, wind: value })}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="popover__action"
                onClick={() => {
                  onClearRecent()
                  setSettingsOpen(false)
                }}
              >
                Clear recent searches
              </button>
            </div>
          )}
        </div>
      </div>

      <button type="button" className="updated" onClick={onRefresh} disabled={refreshing} title="Refresh now">
        <RefreshIcon size={20} className={refreshing ? 'spin' : undefined} />
        <span>Updated</span>
        <span>{refreshing ? 'Updating…' : updatedAt ? timeAgo(updatedAt, now) : '—'}</span>
      </button>
    </nav>
  )
}
