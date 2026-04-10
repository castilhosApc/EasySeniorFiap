'use client'

import { useState, useEffect, useMemo } from 'react'
import { subDays } from 'date-fns'
import { useAccessibilityStore } from '@/store/accessibilityStore'
import { useTutorStore } from '@/store/tutorStore'
import { useElderInboxStore } from '@/store/elderInboxStore'
import { useAppUiStore } from '@/store/appUiStore'
import { Task } from '@/shared/domain/entities/Task'
import { TaskCard } from './TaskCard'
import { CreateTaskModal } from './CreateTaskModal'
import { TaskHistory } from './TaskHistory'
import { loadTasksFromStorage, saveTasksToStorage } from '@/lib/tasksPersistence'
import { maybeNotifyDueTasksToday, requestNotificationPermission } from '@/lib/taskDueRemindersWeb'
import { AiIntegrationService } from '@/services/aiIntegrationService'
import { ASSISTANT_IDS } from '@/data/mockAssistantData'

export function TaskOrganizer() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const preferences = useAccessibilityStore((state) => state.preferences)
  const notifyMandatoryTask = useTutorStore((s) => s.notifyMandatoryTask)
  const elderBanner = useElderInboxStore((s) => s.banner)
  const clearElderBanner = useElderInboxStore((s) => s.clearBanner)
  const setAiAssistNotice = useAppUiStore((s) => s.setAiAssistNotice)

  useEffect(() => {
    const t = loadTasksFromStorage()
    setTasks(t)
    maybeNotifyDueTasksToday(t, preferences.reminderPreferences.enabled)
    void requestNotificationPermission()
  }, [preferences.reminderPreferences.enabled])

  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks)
    saveTasksToStorage(newTasks)
    maybeNotifyDueTasksToday(newTasks, preferences.reminderPreferences.enabled)
  }

  const showAssistantButton = preferences.interfaceMode === 'advanced'

  const copilotHints = useMemo(
    () => ({
      taskCount: tasks.length,
      incompleteTaskCount: tasks.filter((t) => !t.completed).length,
      awaitingTutorVerificationCount: tasks.filter((t) => t.tutorVerificationStatus === 'pending')
        .length,
    }),
    [tasks]
  )

  const askAssistant = async () => {
    const r = await AiIntegrationService.getAssistance({
      screen_name: 'TasksScreen',
      ui_elements: [
        { id: ASSISTANT_IDS.BTN_NOVA_TAREFA, label: 'Nova Tarefa' },
        { id: ASSISTANT_IDS.BTN_HISTORICO, label: 'Histórico' },
      ],
      user_context: 'Organizador web SeniorEase',
      hints: copilotHints,
    })
    if (r.usedNetworkFallback) {
      setAiAssistNotice(
        'Sem conexão com a assistente na nuvem. Suas tarefas e lembretes seguem normais; as dicas usam o guia local do app.'
      )
    }
    alert(r.voice_response)
  }

  const handleCreateTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'>) => {
    const newTask: Task = {
      ...taskData,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      mandatoryVerification: Boolean(taskData.mandatoryVerification),
      tutorVerificationStatus: taskData.tutorVerificationStatus ?? 'none',
    }
    saveTasks([...tasks, newTask])
    setShowCreateModal(false)

    if (preferences.enhancedFeedback) {
      alert('✓ Tarefa criada com sucesso!')
    }
  }

  const applyCompleteTask = (taskId: string) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        return {
          ...task,
          completed: true,
          steps: task.steps.map((step) => ({ ...step, completed: true })),
          tutorVerificationStatus: 'none' as const,
          updatedAt: new Date(),
        }
      }
      return task
    })
    saveTasks(updatedTasks)
    if (preferences.enhancedFeedback) {
      alert('✓ Tarefa concluída com sucesso! Parabéns!')
    }
  }

  const handleCompleteTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    if (task.mandatoryVerification) {
      if (task.tutorVerificationStatus === 'pending') {
        alert('Esta tarefa só será concluída depois que o tutor confirmar na aba Tutor.')
        return
      }
      const updated = tasks.map((t) =>
        t.id === taskId
          ? { ...t, tutorVerificationStatus: 'pending' as const, updatedAt: new Date() }
          : t
      )
      saveTasks(updated)
      notifyMandatoryTask(taskId, task.title)
      alert('Pedido enviado ao tutor. Confirme na aba Tutor.')
      return
    }

    if (preferences.extraConfirmations) {
      if (!confirm('Tem certeza que deseja marcar esta tarefa como concluída?')) return
    }
    applyCompleteTask(taskId)
  }

  const handleDeleteTask = (taskId: string) => {
    if (preferences.extraConfirmations) {
      if (!confirm('Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.')) {
        return
      }
    }
    saveTasks(tasks.filter((task) => task.id !== taskId))
    if (preferences.enhancedFeedback) {
      alert('✓ Tarefa excluída com sucesso!')
    }
  }

  const handleCompleteStep = (taskId: string, stepId: string) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        return {
          ...task,
          steps: task.steps.map((step) =>
            step.id === stepId ? { ...step, completed: true } : step
          ),
          updatedAt: new Date(),
        }
      }
      return task
    })
    saveTasks(updatedTasks)
  }

  const summary = useMemo(() => {
    const incomplete = tasks.filter((t) => !t.completed)
    const pendingTutor = incomplete.filter((t) => t.tutorVerificationStatus === 'pending').length
    const weekAgo = subDays(new Date(), 7)
    const doneThisWeek = tasks.filter(
      (t) => t.completed && new Date(t.updatedAt).getTime() >= weekAgo.getTime()
    ).length
    return { open: incomplete.length, pendingTutor, doneThisWeek }
  }, [tasks])

  const buttonClass =
    'px-6 py-4 rounded-xl font-bold min-h-[56px] min-w-[140px] transition-all shadow-md'

  return (
    <div className="max-w-6xl mx-auto">
      {elderBanner ? (
        <button
          type="button"
          onClick={clearElderBanner}
          className="mb-6 w-full rounded-xl border-2 border-indigo-200 bg-indigo-50 p-4 text-left"
          aria-label={`${elderBanner.title}. ${elderBanner.body}. Dispensar.`}
        >
          <p className="font-extrabold text-slate-900">{elderBanner.title}</p>
          <p className="mt-1 text-slate-700">{elderBanner.body}</p>
          <p className="mt-2 text-sm font-semibold text-indigo-700">Clique para dispensar</p>
        </button>
      ) : null}

      <div
        className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-md"
        role="region"
        aria-label={`Resumo: ${summary.open} em aberto, ${summary.pendingTutor} aguardando tutor, ${summary.doneThisWeek} concluídas nos últimos sete dias`}
      >
        <h2 className="text-xl font-extrabold text-slate-900 mb-3">Resumo</h2>
        <ul className="space-y-2 text-slate-700">
          <li>
            • Em aberto: <strong className="text-slate-900">{summary.open}</strong>
          </li>
          <li>
            • Aguardando o tutor:{' '}
            <strong className="text-slate-900">{summary.pendingTutor}</strong>
          </li>
          <li>
            • Concluídas nos últimos 7 dias:{' '}
            <strong className="text-slate-900">{summary.doneThisWeek}</strong>
          </li>
        </ul>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-8 flex-wrap">
        <h1 className="text-3xl font-bold text-slate-900">Organizador de Atividades</h1>
        <div className="flex flex-wrap gap-3">
          {showAssistantButton ? (
            <button
              type="button"
              onClick={() => void askAssistant()}
              className={`${buttonClass} bg-slate-700 text-white hover:bg-slate-800`}
              aria-label="Pedir dica da assistente"
            >
              🤖 Ajuda da assistente
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className={`${buttonClass} bg-teal-600 text-white hover:bg-teal-700`}
          >
            ➕ Nova Tarefa
          </button>
          <button
            type="button"
            onClick={() => setShowHistory(true)}
            className={`${buttonClass} bg-indigo-600 text-white hover:bg-indigo-700`}
          >
            📜 Histórico
          </button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-lg border border-slate-200">
          <p className="text-xl mb-4 text-slate-700">Você ainda não tem tarefas cadastradas.</p>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className={`${buttonClass} bg-teal-600 text-white hover:bg-teal-700`}
          >
            Criar Primeira Tarefa
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={handleCompleteTask}
              onDelete={handleDeleteTask}
              onCompleteStep={handleCompleteStep}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateTask}
        />
      )}

      {showHistory && (
        <TaskHistory tasks={tasks} onClose={() => setShowHistory(false)} />
      )}
    </div>
  )
}
