import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { UserPreferences, FontSize, ContrastLevel, SpacingLevel, InterfaceMode } from '@/shared/domain/entities/User'

interface AccessibilityState {
  preferences: UserPreferences
  applyPreferences: (preferences: UserPreferences) => void
  updateFontSize: (size: FontSize) => void
  updateContrast: (level: ContrastLevel) => void
  updateSpacing: (level: SpacingLevel) => void
  updateInterfaceMode: (mode: InterfaceMode) => void
  toggleEnhancedFeedback: () => void
  toggleExtraConfirmations: () => void
  toggleReduceMotion: () => void
}

const defaultPreferences: UserPreferences = {
  fontSize: 'medium',
  contrast: 'normal',
  spacing: 'normal',
  interfaceMode: 'basic',
  enhancedFeedback: true,
  extraConfirmations: true,
  reduceMotion: false,
  reminderPreferences: {
    enabled: true,
    frequency: 'daily',
  },
}

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set, get) => ({
      preferences: defaultPreferences,
      
      applyPreferences: (preferences: UserPreferences) => {
        set({ preferences })
      },
      
      updateFontSize: (size: FontSize) => {
        const preferences = { ...get().preferences, fontSize: size }
        get().applyPreferences(preferences)
      },
      
      updateContrast: (level: ContrastLevel) => {
        const preferences = { ...get().preferences, contrast: level }
        get().applyPreferences(preferences)
      },
      
      updateSpacing: (level: SpacingLevel) => {
        const preferences = { ...get().preferences, spacing: level }
        get().applyPreferences(preferences)
      },
      
      updateInterfaceMode: (mode: InterfaceMode) => {
        const preferences = { ...get().preferences, interfaceMode: mode }
        get().applyPreferences(preferences)
      },
      
      toggleEnhancedFeedback: () => {
        const preferences = {
          ...get().preferences,
          enhancedFeedback: !get().preferences.enhancedFeedback,
        }
        get().applyPreferences(preferences)
      },
      
      toggleExtraConfirmations: () => {
        const preferences = {
          ...get().preferences,
          extraConfirmations: !get().preferences.extraConfirmations,
        }
        get().applyPreferences(preferences)
      },

      toggleReduceMotion: () => {
        const preferences = {
          ...get().preferences,
          reduceMotion: !(get().preferences.reduceMotion ?? false),
        }
        get().applyPreferences(preferences)
      },
    }),
    {
      name: 'seniorease-preferences',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
