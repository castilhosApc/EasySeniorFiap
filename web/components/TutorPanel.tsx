'use client'

import { useState, useEffect, useMemo } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useAccessibilityStore } from '@/store/accessibilityStore'
import { useTutorStore } from '@/store/tutorStore'
import { useElderInboxStore } from '@/store/elderInboxStore'
import { loadTasksFromStorage, saveTasksToStorage } from '@/lib/tasksPersistence'
import { Task } from '@/shared/domain/entities/Task'
import { ASSISTANT_IDS } from '@/data/mockAssistantData'
import { AiIntegrationService } from '@/services/aiIntegrationService'
import { useAppUiStore } from '@/store/appUiStore'

export function TutorPanel() {
  const preferences = useAccessibilityStore((s) => s.preferences)
  const tutors = useTutorStore((s) => s.tutors)
  const pendingItems = useTutorStore((s) => s.pendingItems)
  const addTutor = useTutorStore((s) => s.addTutor)
  const removeTutor = useTutorStore((s) => s.removeTutor)
  const setPrimaryTutor = useTutorStore((s) => s.setPrimaryTutor)
  const dismissPending = useTutorStore((s) => s.dismissPending)
  const reminderHistory = useTutorStore((s) => s.reminderHistory ?? [])
  const logReminderSent = useTutorStore((s) => s.logReminderSent)

  const [tasks, setTasks] = useState<Task[]>([])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    setTasks(loadTasksFromStorage())
  }, [])

  const persistTasks = (next: Task[]) => {
    setTasks(next)
    saveTasksToStorage(next)
  }

  const openPendingCount = pendingItems.filter((p) => p.status === 'open').length
  const setAiAssistNotice = useAppUiStore((s) => s.setAiAssistNotice)

  const tutorHints = useMemo(() => ({ openPendingCount }), [openPendingCount])

  const askHelp = async () => {
    const r = await AiIntegrationService.getAssistance({
      screen_name: 'TutorScreen',
      ui_elements: [{ id: ASSISTANT_IDS.BTN_TUTOR_AJUDA, label: 'Ajuda tutor' }],
      hints: tutorHints,
    })
    if (r.usedNetworkFallback) {
      setAiAssistNotice(
        'Sem conexão com a assistente na nuvem. Suas tarefas e lembretes seguem normais; as dicas usam o guia local do app.'
      )
    }
    alert(r.voice_response)
  }

  const toggleMandatory = (taskId: string, value: boolean) => {
    const next = tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            mandatoryVerification: value,
            tutorVerificationStatus: value ? t.tutorVerificationStatus ?? 'none' : 'none',
            updatedAt: new Date(),
          }
        : t
    )
    persistTasks(next)
  }

  const handleApprove = (taskId: string | undefined, pendingId: string) => {
    if (!taskId) return
    const next = tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            completed: true,
            steps: t.steps.map((s) => ({ ...s, completed: true })),
            tutorVerificationStatus: 'approved' as const,
            updatedAt: new Date(),
          }
        : t
    )
    persistTasks(next)
    dismissPending(pendingId)
    alert('Confirmado: tarefa marcada como concluída para o idoso.')
  }

  const handleReject = (taskId: string | undefined, pendingId: string) => {
    if (!taskId) return
    const next = tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            completed: false,
            tutorVerificationStatus: 'none' as const,
            updatedAt: new Date(),
          }
        : t
    )
    persistTasks(next)
    dismissPending(pendingId)
    alert('Recusado: o idoso pode tentar de novo depois.')
  }

  const sendReminder = (task: Task) => {
    useElderInboxStore.getState().showBanner(
      'Lembrete do tutor',
      `Não esqueça de concluir: “${task.title}”.`
    )
    logReminderSent(task.id, task.title)
    alert('Lembrete registado. Veja o aviso na aba Tarefas ao voltar.')
  }

  const openItems = pendingItems.filter((p) => p.status === 'open')
  const incompleteForReminder = tasks.filter(
    (t) => !t.completed && t.tutorVerificationStatus !== 'pending'
  )

  const section = 'rounded-xl bg-white p-6 shadow-lg border border-slate-200 mb-6'
  const input =
    'w-full px-4 py-3 border-2 border-slate-300 rounded-lg text-lg min-h-[50px] mb-3'
  const btn = 'px-4 py-3 rounded-lg font-semibold min-h-[48px] transition-all'

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-slate-900">Área do Tutor</h1>
      <p className="text-slate-600 mb-6">
        Simulação local: cadastre tutores, aprove tarefas obrigatórias e envie lembretes.
      </p>

      <button
        type="button"
        onClick={() => void askHelp()}
        className={`${btn} mb-6 bg-slate-200 text-slate-800 hover:bg-slate-300`}
      >
        ❓ O que é esta aba? (ajuda)
      </button>

      <section className={section}>
        <h2 className="text-xl font-bold mb-3">Perfis de tutor</h2>
        <input
          className={input}
          placeholder="Nome do tutor"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className={input}
          placeholder="Telefone (opcional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          className={input}
          placeholder="E-mail (opcional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          type="button"
          onClick={() => {
            addTutor(name, phone, email)
            setName('')
            setPhone('')
            setEmail('')
          }}
          className={`${btn} bg-indigo-600 text-white hover:bg-indigo-700`}
        >
          ➕ Adicionar tutor
        </button>
        <ul className="mt-4 space-y-2">
          {tutors.map((t) => (
            <li
              key={t.id}
              className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 p-3"
            >
              <span className="font-semibold">
                {t.name} {t.isPrimary ? '(principal)' : ''}
              </span>
              {!t.isPrimary && (
                <button
                  type="button"
                  className="text-sm text-indigo-600 font-semibold"
                  onClick={() => setPrimaryTutor(t.id)}
                >
                  Tornar principal
                </button>
              )}
              <button
                type="button"
                className="text-sm text-red-600 font-semibold ml-auto"
                onClick={() => removeTutor(t.id)}
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className={section}>
        <h2 className="text-xl font-bold mb-3">Pedidos e aprovações</h2>
        {openItems.length === 0 ? (
          <p className="text-slate-600">Nenhum pedido aberto.</p>
        ) : (
          <ul className="space-y-4">
            {openItems.map((p) => (
              <li key={p.id} className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="font-bold">{p.title}</p>
                {p.detail && <p className="text-sm text-slate-700 mt-1">{p.detail}</p>}
                {p.type === 'mandatory_task_completion' && p.taskId && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <button
                      type="button"
                      className={`${btn} bg-teal-600 text-white`}
                      onClick={() => handleApprove(p.taskId, p.id)}
                    >
                      Aprovar conclusão
                    </button>
                    <button
                      type="button"
                      className={`${btn} bg-red-600 text-white`}
                      onClick={() => handleReject(p.taskId, p.id)}
                    >
                      Recusar
                    </button>
                  </div>
                )}
                {p.type === 'critical_action' && (
                  <button
                    type="button"
                    className={`${btn} mt-3 bg-slate-600 text-white`}
                    onClick={() => dismissPending(p.id)}
                  >
                    Marcar como visto
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={section}>
        <h2 className="text-xl font-bold mb-3">Lembretes ao idoso</h2>
        <p className="text-slate-600 mb-3 text-sm">
          Tarefas em aberto (não bloqueadas por “aguardando tutor”):
        </p>
        <ul className="space-y-2">
          {incompleteForReminder.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center gap-2 border rounded-lg p-3">
              <span className="flex-1 font-medium">{t.title}</span>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(t.mandatoryVerification)}
                  onChange={(e) => toggleMandatory(t.id, e.target.checked)}
                />
                Obrigatória
              </label>
              <button
                type="button"
                className={`${btn} bg-orange-600 text-white text-sm`}
                onClick={() => sendReminder(t)}
              >
                Enviar lembrete
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className={section}>
        <h2 className="text-xl font-bold mb-3">Histórico de lembretes</h2>
        {reminderHistory.length === 0 ? (
          <p className="text-slate-600">Ainda não há registos.</p>
        ) : (
          <ul className="text-sm space-y-1">
            {reminderHistory.map((h) => (
              <li key={h.id}>
                {h.taskTitle} —{' '}
                {format(new Date(h.sentAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
