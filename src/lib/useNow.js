import { useEffect, useState } from 'react'

// Re-renders every `intervalMs`, lined up with the wall clock so minutes flip on time.
export default function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    let timer
    const tick = () => {
      setNow(new Date())
      timer = setTimeout(tick, intervalMs - (Date.now() % intervalMs))
    }
    timer = setTimeout(tick, intervalMs - (Date.now() % intervalMs))
    return () => clearTimeout(timer)
  }, [intervalMs])

  return now
}
