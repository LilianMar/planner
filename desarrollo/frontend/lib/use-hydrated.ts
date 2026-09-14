'use client'

import { useEffect, useState } from 'react'

/** Returns true after the component has mounted on the client.
 *  Use to gate localStorage-backed (zustand persist) reads and avoid
 *  server/client hydration mismatches. */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])
  return hydrated
}
