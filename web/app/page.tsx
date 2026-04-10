'use client'

import { useAccessibilityStore } from '@/store/accessibilityStore'
import { PersonalizationPanel } from '@/components/PersonalizationPanel'
import { TaskOrganizer } from '@/components/TaskOrganizer'
import { UserProfile } from '@/components/UserProfile'
import { TutorPanel } from '@/components/TutorPanel'
import { Navigation, type AppTab } from '@/components/Navigation'
import { OnboardingWizard } from '@/components/OnboardingWizard'
import { AiAssistBanner } from '@/components/AiAssistBanner'
import { useState, useEffect } from 'react'
import { isOnboardingComplete } from '@/lib/onboardingStorage'

function MainApp() {
  const [activeTab, setActiveTab] = useState<AppTab>('tasks')
  const preferences = useAccessibilityStore((state) => state.preferences)
  const applyPreferences = useAccessibilityStore((state) => state.applyPreferences)

  useEffect(() => {
    applyPreferences(preferences)
  }, [preferences, applyPreferences])

  useEffect(() => {
    if (preferences.interfaceMode === 'basic' && activeTab === 'tutor') {
      setActiveTab('tasks')
    }
  }, [preferences.interfaceMode, activeTab])

  return (
    <div className={`min-h-screen ${preferences.contrast}`}>
      <AiAssistBanner />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="container mx-auto px-4 py-8 pb-16">
        {activeTab === 'personalization' && <PersonalizationPanel />}
        {activeTab === 'tasks' && <TaskOrganizer />}
        {activeTab === 'tutor' && <TutorPanel />}
        {activeTab === 'profile' && <UserProfile />}
      </main>
    </div>
  )
}

export default function Home() {
  const [onboarded, setOnboarded] = useState<boolean | null>(null)

  useEffect(() => {
    void isOnboardingComplete().then(setOnboarded)
  }, [])

  if (onboarded === null) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-slate-50"
        role="status"
        aria-label="A carregar"
      >
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    )
  }

  if (!onboarded) {
    return <OnboardingWizard onComplete={() => setOnboarded(true)} />
  }

  return <MainApp />
}
