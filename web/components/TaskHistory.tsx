'use client'

import { Task } from '@/shared/domain/entities/Task'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface TaskHistoryProps {
  tasks: Task[]
  onClose: () => void
}

export function TaskHistory({ tasks, onClose }: TaskHistoryProps) {
  const completedTasks = tasks.filter(t => t.completed).sort((a, b) => {
    const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
    const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
    return dateB - dateA
  })

  const buttonClass = "px-6 py-4 rounded-lg font-semibold min-h-[50px] min-w-[120px] transition-all"

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Histórico de Atividades</h2>
          <button
            onClick={onClose}
            className={`${buttonClass} bg-gray-300 text-gray-800 hover:bg-gray-400`}
          >
            Fechar
          </button>
        </div>

        {completedTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">
              Você ainda não completou nenhuma tarefa.
            </p>
            <p className="text-lg text-gray-500 mt-2">
              Complete tarefas para vê-las aqui!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="bg-green-50 border-2 border-green-300 rounded-lg p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-green-800 mb-2">
                      ✓ {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-gray-700 mb-2">{task.description}</p>
                    )}
                    {task.updatedAt && (
                      <p className="text-sm text-gray-600">
                        Concluída em: {format(new Date(task.updatedAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    )}
                    {task.category && (
                      <span className="inline-block bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm mt-2">
                        {task.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
