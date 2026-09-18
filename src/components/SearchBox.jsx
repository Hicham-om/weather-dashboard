import { useEffect, useId, useRef, useState } from 'react'
import { mergePlaces, searchOpenMeteo, searchPhoton } from '../lib/api.js'
import { CloseIcon, PinIcon, SearchIcon } from './Icons.jsx'

const SOURCES = [searchOpenMeteo, searchPhoton]
const cache = new Map()

const EMPTY_SEARCH = { query: '', results: [], pending: 0, failed: false }

export default function SearchBox({ expanded, onExpandedChange, recent, onSelect }) {
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState(EMPTY_SEARCH)
  const [listOpen, setListOpen] = useState(false)
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)
  const rootRef = useRef(null)
  const listId = useId()

  const trimmed = query.trim()
  const cacheKey = trimmed.toLowerCase()

  useEffect(() => {
    if (expanded) inputRef.current?.focus()
  }, [expanded])

  // "/" opens search from anywhere.
  useEffect(() => {
    const onKey = (e) => {
      const typing = e.target instanceof HTMLElement && e.target.closest('input, textarea, select')
      if (e.key === '/' && !typing) {
        e.preventDefault()
        onExpandedChange(true)
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onExpandedChange])

  // Query both geocoders and show results as each one answers.
  useEffect(() => {
    if (trimmed.length < 2) return

    if (cache.has(cacheKey)) {
      setSearch({ query: trimmed, results: cache.get(cacheKey), pending: 0, failed: false })
      return
    }

    const controller = new AbortController()
    const timer = setTimeout(() => {
      const lists = SOURCES.map(() => null)
      let settled = 0
      let failures = 0

      SOURCES.forEach((source, i) => {
        source(trimmed, controller.signal)
          .then((places) => {
            lists[i] = places
          })
          .catch(() => {
            failures += 1
          })
          .finally(() => {
            if (controller.signal.aborted) return
            settled += 1
            const results = mergePlaces(trimmed, lists.filter(Boolean))
            const done = settled === SOURCES.length
            if (done && failures < SOURCES.length) cache.set(cacheKey, results)
            setSearch({
              query: trimmed,
              results,
              pending: SOURCES.length - settled,
              failed: done && failures === SOURCES.length,
            })
          })
      })
    }, 200)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [trimmed, cacheKey])

  const showingRecent = trimmed.length < 2
  const current = search.query === trimmed
  const options = showingRecent ? recent : search.results
  const loading = !showingRecent && (!current || search.pending > 0)
  const activeIndex = Math.min(active, options.length - 1)
  const showList = expanded && listOpen && (options.length > 0 || !showingRecent)

  function choose(place) {
    onSelect(place)
    setQuery('')
    setListOpen(false)
    onExpandedChange(false)
  }

  function close() {
    setQuery('')
    setListOpen(false)
    onExpandedChange(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown' && options.length) {
      e.preventDefault()
      setListOpen(true)
      setActive((i) => (Math.min(i, options.length - 1) + 1) % options.length)
    } else if (e.key === 'ArrowUp' && options.length) {
      e.preventDefault()
      setActive((i) => (Math.min(i, options.length - 1) <= 0 ? options.length - 1 : i - 1))
    } else if (e.key === 'Enter' && options[Math.max(activeIndex, 0)]) {
      e.preventDefault()
      choose(options[Math.max(activeIndex, 0)])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      if (listOpen && query) setListOpen(false)
      else close()
    }
  }

  function handleBlur(e) {
    if (rootRef.current?.contains(e.relatedTarget)) return
    setListOpen(false)
    if (!query) onExpandedChange(false)
  }

  if (!expanded) {
    return (
      <button
        type="button"
        className="icon-button"
        aria-label="Search for a city"
        title="Search (press /)"
        onClick={() => {
          onExpandedChange(true)
          setListOpen(true)
        }}
      >
        <SearchIcon size={20} />
      </button>
    )
  }

  return (
    <div className="search" ref={rootRef}>
      <SearchIcon size={18} className="search__icon" />
      <input
        ref={inputRef}
        type="text"
        className="search__input"
        placeholder="Search city, e.g. Hangzhou"
        aria-label="Search for a city"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        autoComplete="off"
        spellCheck="false"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setActive(0)
          setListOpen(true)
        }}
        onFocus={() => setListOpen(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
      {loading && <span className="search__spinner" aria-hidden="true" />}
      <button type="button" className="search__close" aria-label="Close search" onClick={close}>
        <CloseIcon size={16} />
      </button>

      {showList && (
        <div className="search__panel" onMouseDown={(e) => e.preventDefault()}>
          {showingRecent && <p className="search__heading">Recent</p>}
          <ul id={listId} className="search__list" role="listbox" aria-label="City suggestions">
            {options.map((place, i) => (
              <li
                key={place.id ?? `${place.latitude},${place.longitude}`}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === activeIndex}
                className="search__option"
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(place)}
              >
                <PinIcon size={16} className="search__pin" />
                <span className="search__text">
                  <span className="search__name">{place.name}</span>
                  <span className="search__region">{place.region}</span>
                </span>
              </li>
            ))}
          </ul>
          {!showingRecent && options.length === 0 && (
            <p className="search__status" role="status">
              {loading
                ? 'Searching…'
                : search.failed
                  ? 'Search is unavailable. Check your connection.'
                  : `No places found for “${trimmed}”`}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
