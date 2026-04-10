'use client'

import { useAccessibilityStore } from '@/store/accessibilityStore'
import { FontSize, ContrastLevel, SpacingLevel, InterfaceMode } from '@/shared/domain/entities/User'

export function PersonalizationPanel() {
  const preferences = useAccessibilityStore((state) => state.preferences)
  const updateFontSize = useAccessibilityStore((state) => state.updateFontSize)
  const updateContrast = useAccessibilityStore((state) => state.updateContrast)
  const updateSpacing = useAccessibilityStore((state) => state.updateSpacing)
  const updateInterfaceMode = useAccessibilityStore((state) => state.updateInterfaceMode)
  const toggleEnhancedFeedback = useAccessibilityStore((state) => state.toggleEnhancedFeedback)
  const toggleExtraConfirmations = useAccessibilityStore((state) => state.toggleExtraConfirmations)
  const toggleReduceMotion = useAccessibilityStore((state) => state.toggleReduceMotion)

  const isAdvanced = preferences.interfaceMode === 'advanced'

  const sectionClass = "bg-white rounded-lg p-6 mb-6 shadow-lg border border-slate-200"
  const labelClass = "block text-lg font-semibold mb-4"
  const buttonClass = "px-6 py-4 rounded-lg font-medium min-h-[50px] min-w-[100px] transition-all"

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Personalização da Experiência</h1>

      {!isAdvanced ? (
        <p className="mb-6 rounded-xl bg-indigo-50 border border-indigo-200 p-4 text-slate-800 font-semibold leading-relaxed">
          Modo simples: menos botões no menu (sem aba Tutor) e só o essencial abaixo. Ative o modo
          avançado para tutores, assistente e mais opções finas.
        </p>
      ) : null}
      
      {/* Tamanho da Fonte */}
      <section className={sectionClass}>
        <label className={labelClass}>Tamanho da Fonte</label>
        <div className="flex gap-4 flex-wrap">
          {(['small', 'medium', 'large', 'extra-large'] as FontSize[]).map((size) => (
            <button
              key={size}
              onClick={() => updateFontSize(size)}
              className={`${buttonClass} ${
                preferences.fontSize === size
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {size === 'small' && 'Pequeno'}
              {size === 'medium' && 'Médio'}
              {size === 'large' && 'Grande'}
              {size === 'extra-large' && 'Muito Grande'}
            </button>
          ))}
        </div>
      </section>

      {/* Nível de Contraste */}
      <section className={sectionClass}>
        <label className={labelClass}>Nível de Contraste</label>
        <div className="flex gap-4 flex-wrap">
          {(['normal', 'high', 'very-high'] as ContrastLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => updateContrast(level)}
              className={`${buttonClass} ${
                preferences.contrast === level
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {level === 'normal' && 'Normal'}
              {level === 'high' && 'Alto'}
              {level === 'very-high' && 'Muito Alto'}
            </button>
          ))}
        </div>
      </section>

      {/* Espaçamento */}
      <section className={sectionClass}>
        <label className={labelClass}>Espaçamento entre Elementos</label>
        <div className="flex gap-4 flex-wrap">
          {(['compact', 'normal', 'comfortable', 'spacious'] as SpacingLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => updateSpacing(level)}
              className={`${buttonClass} ${
                preferences.spacing === level
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {level === 'compact' && 'Compacto'}
              {level === 'normal' && 'Normal'}
              {level === 'comfortable' && 'Confortável'}
              {level === 'spacious' && 'Espaçoso'}
            </button>
          ))}
        </div>
      </section>

      {/* Modo de Interface */}
      <section className={sectionClass}>
        <label className={labelClass}>Modo de Interface</label>
        <div className="flex gap-4 flex-wrap">
          {(['basic', 'advanced'] as InterfaceMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => updateInterfaceMode(mode)}
              className={`${buttonClass} ${
                preferences.interfaceMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {mode === 'basic' && 'Modo Básico'}
              {mode === 'advanced' && 'Modo Avançado'}
            </button>
          ))}
        </div>
      </section>

      {isAdvanced ? (
        <>
          <section className={sectionClass}>
            <label className={labelClass}>Feedback visual reforçado</label>
            <button
              type="button"
              onClick={toggleEnhancedFeedback}
              className={`${buttonClass} ${
                preferences.enhancedFeedback
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {preferences.enhancedFeedback ? '✓ Ativado' : 'Desativado'}
            </button>
            <p className="mt-2 text-gray-600">
              Mensagens e sombras mais visíveis após cada ação.
            </p>
          </section>

          <section className={sectionClass}>
            <label className={labelClass}>Confirmação adicional</label>
            <button
              type="button"
              onClick={toggleExtraConfirmations}
              className={`${buttonClass} ${
                preferences.extraConfirmations
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {preferences.extraConfirmations ? '✓ Ativado' : 'Desativado'}
            </button>
            <p className="mt-2 text-gray-600">
              Pede confirmação antes de apagar ou concluir tarefas.
            </p>
          </section>

          <section className={sectionClass}>
            <label className={labelClass}>Reduzir movimento</label>
            <button
              type="button"
              onClick={toggleReduceMotion}
              className={`${buttonClass} ${
                preferences.reduceMotion ?? false
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {preferences.reduceMotion ?? false ? '✓ Ativado' : 'Desativado'}
            </button>
            <p className="mt-2 text-gray-600">
              Menos animações e transições na página — recomendado se movimento na tela incomodar.
            </p>
          </section>
        </>
      ) : null}
    </div>
  )
}
