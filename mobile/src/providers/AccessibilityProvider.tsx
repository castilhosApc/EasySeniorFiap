import React, { useEffect } from 'react';
import { useAccessibilityStore } from '../store/accessibilityStore';

/**
 * AccessibilityProvider (Zustand)
 *
 * Garante que as preferências do Zustand (fontSize, contrast, etc.)
 * sejam aplicadas ao montar o app.
 * O AccessibilityContextProvider (Context API) cuida do co-piloto e tutor.
 */
export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const preferences = useAccessibilityStore((state) => state.preferences);
  const applyPreferences = useAccessibilityStore((state) => state.applyPreferences);

  useEffect(() => {
    applyPreferences(preferences);
  }, [preferences, applyPreferences]);

  return <>{children}</>;
}
