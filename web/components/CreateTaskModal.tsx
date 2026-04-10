'use client'

import { useState } from 'react'
import { Task, TaskStep } from '@/shared/domain/entities/Task'
import { useAccessibilityStore } from '@/store/accessibilityStore'

interface CreateTaskModalProps {
  onClose: () => void
  onCreate: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'>) => void
}

export function CreateTaskModal({ onClose, onCreate }: CreateTaskModalProps) {
  const interfaceMode = useAccessibilityStore((s) => s.preferences.interfaceMode)
  const allowMandatory = interfaceMode === 'advanced'
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [mandatoryVerification, setMandatoryVerification] = useState(false)
  const [steps, setSteps] = useState<Omit<TaskStep, 'id' | 'completed'>[]>([])

  const handleAddStep = () => {
    setSteps([...steps, { title: '', description: '', order: steps.length + 1 }])
  }

  const handleStepChange = (index: number, field: 'title' | 'description', value: string) => {
    const updatedSteps = [...steps]
    updatedSteps[index] = { ...updatedSteps[index], [field]: value }
    setSteps(updatedSteps)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      alert('Por favor, preencha o título da tarefa.')
      return
    }

    const taskSteps: TaskStep[] = steps
      .filter(step => step.title.trim())
      .map((step, index) => ({
        id: `step-${Date.now()}-${index}`,
        title: step.title,
        description: step.description,
        completed: false,
        order: index + 1,
      }))

    onCreate({
      title: title.trim(),
      description: description.trim() || undefined,
      category: category.trim() || undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      steps: taskSteps,
      mandatoryVerification: allowMandatory && mandatoryVerification,
      tutorVerificationStatus: 'none',
    })

    // Reset form
    setTitle('')
    setDescription('')
    setCategory('')
    setDueDate('')
    setMandatoryVerification(false)
    setSteps([])
  }

  const inputClass = "w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg min-h-[50px]"
  const buttonClass = "px-6 py-4 rounded-lg font-semibold min-h-[50px] min-w-[120px] transition-all"

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Criar Nova Tarefa</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg font-semibold mb-2">
              Título da Tarefa *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              required
              placeholder="Ex: Estudar para a prova de matemática"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold mb-2">
              Descrição (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
              rows={3}
              placeholder="Adicione mais detalhes sobre a tarefa..."
            />
          </div>

          <div>
            <label className="block text-lg font-semibold mb-2">
              Categoria (opcional)
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
              placeholder="Ex: Estudos, Trabalho, Pessoal"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold mb-2">
              Data de Vencimento (opcional)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={inputClass}
            />
            <p className="mt-1 text-sm text-slate-600">
              Com lembretes ativos, o navegador pode avisar no dia do prazo (se permitir notificações).
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-lg border-2 border-slate-200 p-4">
            <input
              id="mandatory-web"
              type="checkbox"
              checked={allowMandatory ? mandatoryVerification : false}
              onChange={(e) => allowMandatory && setMandatoryVerification(e.target.checked)}
              disabled={!allowMandatory}
              className="mt-1 h-6 w-6 disabled:opacity-50"
            />
            <label htmlFor="mandatory-web" className="text-lg font-semibold leading-snug cursor-pointer">
              Tarefa obrigatória — o tutor confirma a conclusão na aba Tutor
            </label>
          </div>
          {!allowMandatory ? (
            <p className="text-sm text-gray-600 mb-3">
              No modo simples esta opção fica desligada. Ative o modo avançado em Personalização.
            </p>
          ) : null}

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-lg font-semibold">
                Passos da tarefa (opcional)
              </label>
              <button
                type="button"
                onClick={handleAddStep}
                className={`${buttonClass} bg-blue-600 text-white hover:bg-blue-700`}
              >
                ➕ Adicionar passo
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Divida em etapas pequenas: faça uma de cada vez e marque na lista de Tarefas.
            </p>
            {steps.map((step, index) => (
              <div key={index} className="mb-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  value={step.title}
                  onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                  className={`${inputClass} mb-2`}
                  placeholder={`Etapa ${index + 1}: Título`}
                />
                <input
                  type="text"
                  value={step.description || ''}
                  onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                  className={inputClass}
                  placeholder="Descrição (opcional)"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={onClose}
              className={`${buttonClass} bg-gray-300 text-gray-800 hover:bg-gray-400`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`${buttonClass} bg-green-600 text-white hover:bg-green-700`}
            >
              ✓ Criar Tarefa
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
