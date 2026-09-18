// Interface icons (24×24). Filled or stroked to match the dashboard design.

function Svg({ children, size = 24, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      {children}
    </svg>
  )
}

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export const HomeIcon = (p) => (
  <Svg {...p}>
    <path fill="currentColor" d="M10.6 3.5a2.2 2.2 0 0 1 2.8 0l7 5.8c.4.4.6.9.6 1.4v8.1c0 1.2-1 2.2-2.2 2.2h-3.3v-5.6c0-.6-.5-1-1-1h-5c-.6 0-1 .4-1 1V21H5.2A2.2 2.2 0 0 1 3 18.8v-8.1c0-.5.2-1 .6-1.4z" />
  </Svg>
)

export const PinIcon = (p) => (
  <Svg {...p}>
    <path fill="currentColor" d="M12 2a7.5 7.5 0 0 0-7.5 7.5c0 5.3 6.2 11.7 6.5 12a1.4 1.4 0 0 0 2 0c.3-.3 6.5-6.7 6.5-12A7.5 7.5 0 0 0 12 2m0 10.3a2.8 2.8 0 1 1 0-5.6 2.8 2.8 0 0 1 0 5.6" />
  </Svg>
)

export const RadarIcon = (p) => (
  <Svg {...p}>
    <g {...stroke}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <path d="M5 19 19 5" />
    </g>
  </Svg>
)

export const ChartIcon = (p) => (
  <Svg {...p}>
    <g fill="currentColor">
      <rect x="4" y="14" width="4" height="7" rx="1.2" />
      <rect x="10" y="9" width="4" height="12" rx="1.2" />
      <rect x="16" y="3" width="4" height="18" rx="1.2" />
    </g>
  </Svg>
)

export const SettingsIcon = (p) => (
  <Svg {...p}>
    <g {...stroke} strokeWidth="2">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </g>
  </Svg>
)

export const SearchIcon = (p) => (
  <Svg {...p}>
    <g {...stroke}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </g>
  </Svg>
)

export const CloseIcon = (p) => (
  <Svg {...p}>
    <path {...stroke} d="M6 6l12 12M18 6 6 18" />
  </Svg>
)

export const RefreshIcon = (p) => (
  <Svg {...p}>
    <g {...stroke}>
      <path d="M20 11a8 8 0 0 0-14.3-4.3L4 8.5" />
      <path d="M4 4v4.5h4.5" />
      <path d="M4 13a8 8 0 0 0 14.3 4.3l1.7-1.8" />
      <path d="M20 20v-4.5h-4.5" />
    </g>
  </Svg>
)

export const ChevronRightIcon = (p) => (
  <Svg {...p}>
    <path {...stroke} d="m9 5 7 7-7 7" />
  </Svg>
)

export const ArrowUpIcon = (p) => (
  <Svg {...p}>
    <path {...stroke} d="M12 19V5M6 11l6-6 6 6" />
  </Svg>
)

export const DropletIcon = (p) => (
  <Svg {...p}>
    <path {...stroke} d="M12 3.5s-6 6.4-6 10.8a6 6 0 0 0 12 0C18 9.9 12 3.5 12 3.5z" />
  </Svg>
)

export const WindIcon = (p) => (
  <Svg {...p}>
    <g {...stroke}>
      <path d="M3 9h11a3 3 0 1 0-3-3" />
      <path d="M3 15h15a3 3 0 1 1-3 3" />
      <path d="M3 12h7" />
    </g>
  </Svg>
)

export const GaugeIcon = (p) => (
  <Svg {...p}>
    <g {...stroke}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </g>
  </Svg>
)

export const LocateIcon = (p) => (
  <Svg {...p}>
    <g {...stroke}>
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </g>
  </Svg>
)

export const SunriseIcon = (p) => (
  <Svg {...p}>
    <g {...stroke}>
      <path d="M5 17a7 7 0 0 1 14 0" />
      <path d="M3 21h18M12 3v5M9.5 5.5 12 3l2.5 2.5M4.2 10.2l1.4 1.4M19.8 10.2l-1.4 1.4" />
    </g>
  </Svg>
)

export const SunsetIcon = (p) => (
  <Svg {...p}>
    <g {...stroke}>
      <path d="M5 17a7 7 0 0 1 14 0" />
      <path d="M3 21h18M12 3v5M9.5 5.5 12 8l2.5-2.5M4.2 10.2l1.4 1.4M19.8 10.2l-1.4 1.4" />
    </g>
  </Svg>
)
