'use client'

import { useAccessibilityStore } from '@/store/accessibilityStore'

export type AppTab = 'personalization' | 'tasks' | 'profile' | 'tutor'

interface NavigationProps {
  activeTab: AppTab
  onTabChange: (tab: AppTab) => void
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const interfaceMode = useAccessibilityStore((s) => s.preferences.interfaceMode)
  const base = `px-5 py-4 rounded-xl font-bold transition-all min-h-[56px] min-w-[100px]`
  const active = `${base} bg-indigo-500 text-white ring-2 ring-indigo-300 shadow-md`
  const idle = `${base} bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-600`

  const allTabs: { id: AppTab; label: string; aria: string }[] = [
    { id: 'tasks', label: '📋 Tarefas', aria: 'Aba Tarefas, organizador de atividades' },
    { id: 'personalization', label: '⚙️ Personalização', aria: 'Aba Personalização, acessibilidade' },
    { id: 'tutor', label: '🛡️ Tutor', aria: 'Aba Tutor, aprovações e apoio' },
    { id: 'profile', label: '👤 Perfil', aria: 'Aba Perfil e contato de apoio' },
  ]
  const tabs =
    interfaceMode === 'advanced' ? allTabs : allTabs.filter((t) => t.id !== 'tutor')

  return (
    <nav className="border-b border-slate-200 bg-slate-900 text-white shadow-md mb-8">
      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-3 flex-wrap justify-center sm:justify-start">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onTabChange(t.id)}
              className={activeTab === t.id ? active : idle}
              aria-label={t.aria}
              aria-current={activeTab === t.id ? 'page' : undefined}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
