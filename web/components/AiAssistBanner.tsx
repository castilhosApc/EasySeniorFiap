'use client'

import { useEffect, useRef } from 'react'
import { useAppUiStore } from '@/store/appUiStore'

const AUTO_DISMISS_MS = 14_000

export function AiAssistBanner() {
  const aiAssistNotice = useAppUiStore((s) => s.aiAssistNotice)
  const setAiAssistNotice = useAppUiStore((s) => s.setAiAssistNotice)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!aiAssistNotice) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setAiAssistNotice(null), AUTO_DISMISS_MS)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [aiAssistNotice, setAiAssistNotice])

  if (!aiAssistNotice) return null

  return (
    <div
      role="alert"
      className="fixed top-3 left-3 right-3 z-[100] mx-auto max-w-3xl rounded-xl border border-indigo-400/50 bg-slate-800 px-4 py-3 text-slate-100 shadow-lg md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-full"
    >
      <div className="flex items-start gap-3">
        <p className="flex-1 text-[15px] font-semibold leading-snug">{aiAssistNotice}</p>
        <button
          type="button"
          onClick={() => setAiAssistNotice(null)}
          className="min-h-[36px] min-w-[36px] rounded-lg text-slate-400 hover:bg-slate-700"
          aria-label="Fechar aviso"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
