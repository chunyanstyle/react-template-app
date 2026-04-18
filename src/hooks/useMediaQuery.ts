import { useSyncExternalStore } from 'react'

export const useMediaQuery = (query: string): boolean => {
  const subscribe = (callback: () => void) => {
    const controller = new AbortController()
    const mql = window.matchMedia(query)
    mql.addEventListener('change', callback, { signal: controller.signal })
    return () => controller.abort()
  }

  const getSnapshot = () => window.matchMedia(query).matches

  const getServerSnapshot = () => false

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
