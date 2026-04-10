'use client'

import { Task, TaskStep } from '@/shared/domain/entities/Task'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface TaskCardProps {
  task: Task
  onComplete: (taskId: string) => void
  onDelete: (taskId: string) => void
  onCompleteStep: (taskId: string, stepId: string) => void
}

export function TaskCard({ task, onComplete, onDelete, onCompleteStep }: TaskCardProps) {
  const cardClass = `
    bg-white rounded-lg p-6 shadow-lg border-2
    ${task.completed ? 'border-green-500 opacity-75' : 'border-gray-200'}
  `

  const buttonClass = "px-4 py-3 rounded-lg font-medium min-h-[50px] min-w-[100px] transition-all"

  const completedSteps = task.steps.filter(s => s.completed).length
  const totalSteps = task.steps.length
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

  return (
    <div className={cardClass}>
      <div className="mb-4">
        <h3 className={`font-bold mb-2 ${task.completed ? 'line-through' : ''}`}>
          {task.title}
        </h3>
        {task.description && (
          <p className="text-gray-600 mb-2">{task.description}</p>
        )}
        {task.dueDate && (
          <p className="text-sm text-gray-500">
            Prazo: {format(new Date(task.dueDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        )}
        {task.category && (
          <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mt-2">
            {task.category}
          </span>
        )}
        {task.mandatoryVerification && (
          <span className="mt-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">
            Obrigatória (tutor confirma)
          </span>
        )}
        {task.tutorVerificationStatus === 'pending' && (
          <span className="mt-2 block text-sm font-bold text-amber-800">
            ⏳ Aguardando confirmação do tutor
          </span>
        )}
      </div>

      {task.steps.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">Etapas:</span>
            <span className="text-sm text-gray-600">
              {completedSteps} de {totalSteps} concluídas
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
            <div
              className="bg-green-500 h-4 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="space-y-2">
            {task.steps.map((step) => (
              <div key={step.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={step.completed}
                  onChange={() => !step.completed && onCompleteStep(task.id, step.id)}
                  className="w-6 h-6 cursor-pointer"
                  disabled={step.completed}
                />
                <label
                  className={`flex-1 ${step.completed ? 'line-through text-gray-500' : ''}`}
                >
                  {step.title}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-4">
        {!task.completed && (
          <button
            onClick={() => onComplete(task.id)}
            disabled={task.tutorVerificationStatus === 'pending'}
            className={`${buttonClass} bg-green-600 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {task.tutorVerificationStatus === 'pending' ? '⏳ Aguardando tutor' : '✓ Concluir'}
          </button>
        )}
        <button
          onClick={() => onDelete(task.id)}
          className={`${buttonClass} bg-red-600 text-white hover:bg-red-700`}
        >
          🗑️ Excluir
        </button>
      </div>
    </div>
  )
}
