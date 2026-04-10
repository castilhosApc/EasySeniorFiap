'use client'

import { useState, useCallback } from 'react'
import { useAccessibilityStore } from '@/store/accessibilityStore'
import { setOnboardingComplete } from '@/lib/onboardingStorage'
import {
  FontSize,
  ContrastLevel,
  InterfaceMode,
  SpacingLevel,
} from '@/shared/domain/entities/User'

const STEPS = 5

interface Props {
  onComplete: () => void
}

export function OnboardingWizard({ onComplete }: Props) {
  const updateFontSize = useAccessibilityStore((s) => s.updateFontSize)
  const updateContrast = useAccessibilityStore((s) => s.updateContrast)
  const updateInterfaceMode = useAccessibilityStore((s) => s.updateInterfaceMode)
  const updateSpacing = useAccessibilityStore((s) => s.updateSpacing)

  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<{
    fontSize: FontSize
    contrast: ContrastLevel
    interfaceMode: InterfaceMode
    spacing: SpacingLevel
  }>({
    fontSize: 'large',
    contrast: 'normal',
    interfaceMode: 'basic',
    spacing: 'comfortable',
  })

  const finish = useCallback(() => {
    updateFontSize(draft.fontSize)
    updateContrast(draft.contrast)
    updateInterfaceMode(draft.interfaceMode)
    updateSpacing(draft.spacing)
    setOnboardingComplete()
    onComplete()
  }, [draft, updateFontSize, updateContrast, updateInterfaceMode, updateSpacing, onComplete])

  const choice = (
    label: string,
    selected: boolean,
    onPress: () => void,
    hint: string
  ) => (
    <button
      type="button"
      key={label}
      onClick={onPress}
      aria-pressed={selected}
      aria-label={label}
      title={hint}
      className={`mb-3 flex w-full items-center justify-between rounded-xl border-2 px-5 py-4 text-left text-lg font-bold transition-colors ${
        selected
          ? 'border-indigo-600 bg-indigo-50 text-slate-900'
          : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
      }`}
    >
      {label}
      {selected ? <span className="text-indigo-600">✓</span> : null}
    </button>
  )

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <p className="py-3 text-center text-sm font-semibold text-slate-500">
        Passo {step + 1} de {STEPS}
      </p>
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {step === 0 && (
          <>
            <h1 className="mb-4 text-3xl font-extrabold text-slate-900">Bem-vindo ao SeniorEase</h1>
            <p className="text-lg leading-relaxed text-slate-600">
              Vamos ajustar letra, contraste e modo da interface. Tudo pode ser alterado depois em
              Personalização.
            </p>
          </>
        )}
        {step === 1 && (
          <>
            <h1 className="mb-4 text-2xl font-extrabold text-slate-900">Tamanho do texto</h1>
            {(
              [
                ['small', 'Pequeno'],
                ['medium', 'Médio'],
                ['large', 'Grande'],
                ['extra-large', 'Muito grande'],
              ] as const
            ).map(([v, label]) =>
              choice(label, draft.fontSize === v, () => setDraft((d) => ({ ...d, fontSize: v })), label)
            )}
          </>
        )}
        {step === 2 && (
          <>
            <h1 className="mb-4 text-2xl font-extrabold text-slate-900">Contraste</h1>
            {choice('Normal', draft.contrast === 'normal', () =>
              setDraft((d) => ({ ...d, contrast: 'normal' }))
            , 'Contraste normal')}
            {choice('Alto contraste', draft.contrast === 'high', () =>
              setDraft((d) => ({ ...d, contrast: 'high' }))
            , 'Mais contraste')}
          </>
        )}
        {step === 3 && (
          <>
            <h1 className="mb-4 text-2xl font-extrabold text-slate-900">Modo da interface</h1>
            {choice(
              'Modo básico (recomendado)',
              draft.interfaceMode === 'basic',
              () => setDraft((d) => ({ ...d, interfaceMode: 'basic' })),
              'Menos opções'
            )}
            {choice(
              'Modo avançado',
              draft.interfaceMode === 'advanced',
              () => setDraft((d) => ({ ...d, interfaceMode: 'advanced' })),
              'Mais detalhes'
            )}
          </>
        )}
        {step === 4 && (
          <>
            <h1 className="mb-4 text-2xl font-extrabold text-slate-900">Espaçamento</h1>
            {choice(
              'Confortável (recomendado)',
              draft.spacing === 'comfortable',
              () => setDraft((d) => ({ ...d, spacing: 'comfortable' })),
              'Mais espaço'
            )}
            {choice('Normal', draft.spacing === 'normal', () =>
              setDraft((d) => ({ ...d, spacing: 'normal' }))
            , 'Normal')}
            {choice(
              'Espaçoso',
              draft.spacing === 'spacious',
              () => setDraft((d) => ({ ...d, spacing: 'spacious' })),
              'Máximo'
            )}
          </>
        )}
      </div>
      <div className="border-t border-slate-200 bg-white p-4">
        {step < STEPS - 1 ? (
          <div className="flex gap-3">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="min-h-[56px] flex-1 rounded-xl border-2 border-slate-300 font-bold text-slate-700"
              >
                Voltar
              </button>
            ) : (
              <div className="flex-1" />
            )}
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="min-h-[56px] flex-1 rounded-xl bg-indigo-600 font-bold text-white hover:bg-indigo-700"
            >
              {step === 0 ? 'Começar' : 'Próximo'}
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="min-h-[56px] flex-1 rounded-xl border-2 border-slate-300 font-bold text-slate-700"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={finish}
              className="min-h-[56px] flex-1 rounded-xl bg-indigo-600 font-bold text-white hover:bg-indigo-700"
            >
              Entrar no app
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
