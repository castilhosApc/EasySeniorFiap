import { ITaskRepository } from '../domain/repositories/ITaskRepository';
import { TaskHistory } from '../domain/entities/Task';

export class CompleteTask {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(taskId: string, userId: string): Promise<void> {
    const task = await this.taskRepository.findById(taskId);
    
    if (!task) {
      throw new Error('Tarefa não encontrada');
    }

    // Marca todos os passos como completos
    task.steps.forEach(step => {
      step.completed = true;
    });

    task.completed = true;
    task.updatedAt = new Date();

    await this.taskRepository.update(task);

    // Adiciona ao histórico
    const history: TaskHistory = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      taskId: task.id,
      action: 'completed',
      timestamp: new Date(),
      details: `Tarefa "${task.title}" concluída com sucesso!`,
    };

    await this.taskRepository.addHistory(history);
  }
}
