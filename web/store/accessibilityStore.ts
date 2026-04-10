import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserPreferences, FontSize, ContrastLevel, SpacingLevel, InterfaceMode } from '@/shared/domain/entities/User'
import { AccessibilityService } from '@/shared/domain/services/AccessibilityService'

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
        const root = document.documentElement
        const service = AccessibilityService
        
        // Aplica tamanho da fonte
        const fontSize = service.getFontSizeValue(preferences.fontSize)
        root.style.setProperty('--base-font-size', fontSize)
        root.style.fontSize = fontSize
        
        // Aplica espaçamento
        const spacing = service.getSpacingValue(preferences.spacing)
        root.style.setProperty('--base-spacing', spacing)
        
        // Aplica classe de contraste
        root.className = root.className.replace(/contrast-\w+/g, '')
        root.classList.add(service.getContrastClass(preferences.contrast))

        if (preferences.reduceMotion) {
          root.classList.add('reduce-motion')
        } else {
          root.classList.remove('reduce-motion')
        }
        
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
    }
  )
)
