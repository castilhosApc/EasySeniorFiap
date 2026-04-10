'use client'

import { useEffect } from 'react'
import { useAccessibilityStore } from '@/store/accessibilityStore'

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const preferences = useAccessibilityStore((state) => state.preferences)
  const applyPreferences = useAccessibilityStore((state) => state.applyPreferences)

  useEffect(() => {
    applyPreferences(preferences)
  }, [preferences, applyPreferences])

  return <>{children}</>
}
