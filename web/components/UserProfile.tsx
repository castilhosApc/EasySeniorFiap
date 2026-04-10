'use client'

import { useState, useEffect } from 'react'
import { useAccessibilityStore } from '@/store/accessibilityStore'
import { useTrustContactStore, phoneToDialString } from '@/store/trustContactStore'
import { useTutorStore } from '@/store/tutorStore'
import { CRITICAL_ACTIONS } from '@/data/mockAssistantData'
import { clearAllWebLocalDataAndReload } from '@/lib/clearAppStorage'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function UserProfile() {
  const preferences = useAccessibilityStore((state) => state.preferences)
  const trustName = useTrustContactStore((s) => s.name)
  const trustPhone = useTrustContactStore((s) => s.phone)
  const setTrustContact = useTrustContactStore((s) => s.setTrustContact)
  const notifyCriticalAction = useTutorStore((s) => s.notifyCriticalAction)
  const [draftName, setDraftName] = useState(trustName)
  const [draftPhone, setDraftPhone] = useState(trustPhone)

  useEffect(() => {
    setDraftName(trustName)
    setDraftPhone(trustPhone)
  }, [trustName, trustPhone])

  const sectionClass = "bg-white rounded-lg p-6 mb-6 shadow-lg border border-slate-200"
  const labelClass = "block text-lg font-semibold mb-2"
  const valueClass = "text-gray-700 text-lg"
  const inputClass =
    'w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg min-h-[50px] mb-3'

  // Simula dados do usuário (em produção viria de um serviço)
  const userData = {
    name: 'Usuário SeniorEase',
    email: 'usuario@seniorease.com',
    memberSince: new Date('2024-01-01'),
  }

  const getFontSizeLabel = (size: string) => {
    const labels: Record<string, string> = {
      small: 'Pequeno',
      medium: 'Médio',
      large: 'Grande',
      'extra-large': 'Muito Grande',
    }
    return labels[size] || size
  }

  const getContrastLabel = (level: string) => {
    const labels: Record<string, string> = {
      normal: 'Normal',
      high: 'Alto',
      'very-high': 'Muito Alto',
    }
    return labels[level] || level
  }

  const saveTrust = () => {
    setTrustContact(draftName, draftPhone)
    alert('Contato de apoio guardado neste navegador.')
  }

  const dial = phoneToDialString(draftPhone || trustPhone)

  const openCall = () => {
    if (!dial) {
      alert('Preencha e guarde o telefone do contato de apoio primeiro.')
      return
    }
    window.location.href = `tel:${dial}`
  }

  const openSms = () => {
    if (!dial) {
      alert('Preencha e guarde o telefone do contato de apoio primeiro.')
      return
    }
    const body = encodeURIComponent('Olá, preciso de ajuda com o app SeniorEase.')
    window.location.href = `sms:${dial}?body=${body}`
  }

  const handleSaveProfile = () => {
    if (preferences.extraConfirmations) {
      if (!confirm('Guardar alterações do perfil? O tutor verá um pedido na aba Tutor.')) return
    }
    notifyCriticalAction(CRITICAL_ACTIONS.SAVE_PROFILE, 'Pedido simulado na fila do tutor.')
    alert('Pedido registado na aba Tutor (simulação).')
  }

  const handleClearWebData = () => {
    if (
      !confirm(
        'Apagar todos os dados guardados neste navegador?\n\n' +
          'Inclui tarefas, tutores, contacto de apoio, preferências e o primeiro arranque. ' +
          'A página vai recarregar.'
      )
    ) {
      return
    }
    clearAllWebLocalDataAndReload()
  }

  const getSpacingLabel = (level: string) => {
    const labels: Record<string, string> = {
      compact: 'Compacto',
      normal: 'Normal',
      comfortable: 'Confortável',
      spacious: 'Espaçoso',
    }
    return labels[level] || level
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Meu Perfil</h1>

      {/* Informações Pessoais */}
      <section className={sectionClass}>
        <h2 className="text-2xl font-bold mb-4">Informações Pessoais</h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Nome</label>
            <p className={valueClass}>{userData.name}</p>
          </div>
          <div>
            <label className={labelClass}>E-mail</label>
            <p className={valueClass}>{userData.email}</p>
          </div>
          <div>
            <label className={labelClass}>Membro desde</label>
            <p className={valueClass}>
              {format(userData.memberSince, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className="text-2xl font-bold mb-4">Contato de apoio</h2>
        <p className="text-gray-600 mb-4 text-sm">
          Pessoa de confiança para ligar ou enviar SMS (dados ficam só neste navegador).
        </p>
        <label className={labelClass}>Nome</label>
        <input
          className={inputClass}
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          placeholder="Ex.: Maria (filha)"
          aria-label="Nome do contato de apoio"
        />
        <label className={labelClass}>Telefone</label>
        <input
          className={inputClass}
          value={draftPhone}
          onChange={(e) => setDraftPhone(e.target.value)}
          placeholder="Ex.: 11999999999"
          inputMode="tel"
          aria-label="Telefone do contato de apoio"
        />
        <button
          type="button"
          onClick={saveTrust}
          className="mb-4 px-6 py-4 rounded-xl bg-indigo-600 text-white font-bold min-h-[52px] hover:bg-indigo-700"
        >
          💾 Guardar contato
        </button>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={openCall}
            className="px-6 py-4 rounded-xl bg-teal-600 text-white font-bold min-h-[52px] hover:bg-teal-700"
          >
            📞 Ligar
          </button>
          <button
            type="button"
            onClick={openSms}
            className="px-6 py-4 rounded-xl bg-indigo-600 text-white font-bold min-h-[52px] hover:bg-indigo-700"
          >
            💬 SMS
          </button>
        </div>
      </section>

      {/* Configurações de Acessibilidade */}
      <section className={sectionClass}>
        <h2 className="text-2xl font-bold mb-4">Configurações de Acessibilidade</h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Tamanho da Fonte</label>
            <p className={valueClass}>{getFontSizeLabel(preferences.fontSize)}</p>
          </div>
          <div>
            <label className={labelClass}>Nível de Contraste</label>
            <p className={valueClass}>{getContrastLabel(preferences.contrast)}</p>
          </div>
          <div>
            <label className={labelClass}>Espaçamento</label>
            <p className={valueClass}>{getSpacingLabel(preferences.spacing)}</p>
          </div>
          <div>
            <label className={labelClass}>Modo de Interface</label>
            <p className={valueClass}>
              {preferences.interfaceMode === 'basic' ? 'Modo Básico' : 'Modo Avançado'}
            </p>
          </div>
          <div>
            <label className={labelClass}>Feedback Visual Reforçado</label>
            <p className={valueClass}>
              {preferences.enhancedFeedback ? '✓ Ativado' : 'Desativado'}
            </p>
          </div>
          <div>
            <label className={labelClass}>Confirmações Extras</label>
            <p className={valueClass}>
              {preferences.extraConfirmations ? '✓ Ativado' : 'Desativado'}
            </p>
          </div>
          <div>
            <label className={labelClass}>Reduzir movimento</label>
            <p className={valueClass}>
              {preferences.reduceMotion ?? false ? '✓ Ativado' : 'Desativado'}
            </p>
          </div>
        </div>
        <div className="mt-6">
          <p className="text-gray-600 text-sm">
            💡 Para alterar essas configurações, acesse a aba "Personalização" no menu superior.
          </p>
        </div>
      </section>

      {/* Preferências de Lembretes */}
      <section className={sectionClass}>
        <h2 className="text-2xl font-bold mb-4">Preferências de Lembretes</h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Lembretes Ativados</label>
            <p className={valueClass}>
              {preferences.reminderPreferences.enabled ? '✓ Sim' : 'Não'}
            </p>
          </div>
          {preferences.reminderPreferences.enabled && (
            <div>
              <label className={labelClass}>Frequência</label>
              <p className={valueClass}>
                {preferences.reminderPreferences.frequency === 'daily' && 'Diário'}
                {preferences.reminderPreferences.frequency === 'weekly' && 'Semanal'}
                {preferences.reminderPreferences.frequency === 'custom' && 'Personalizado'}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className="text-2xl font-bold mb-4">Dados e cache</h2>
        <p className="text-gray-600 mb-4 text-sm">
          Remove tudo o que o SeniorEase guardou neste navegador (localStorage). Não apaga servidores na
          Internet. A página recarrega em seguida — útil para recomeçar ou limpar antes de emprestar o
          computador.
        </p>
        <button
          type="button"
          onClick={handleClearWebData}
          className="px-6 py-4 rounded-xl bg-red-600 text-white font-bold min-h-[52px] hover:bg-red-700"
          aria-label="Limpar dados e cache guardados no navegador"
        >
          🗑️ Limpar dados e cache
        </button>
      </section>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleSaveProfile}
          className="px-8 py-4 rounded-xl bg-indigo-600 text-white text-lg font-bold min-h-[56px] hover:bg-indigo-700 shadow-lg"
        >
          💾 Salvar perfil (notificar tutor)
        </button>
      </div>
    </div>
  )
}
