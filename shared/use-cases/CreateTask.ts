import { Task } from '../domain/entities/Task';
import { ITaskRepository } from '../domain/repositories/ITaskRepository';

export class CreateTask {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(userId: string, taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'>): Promise<Task> {
    const task: Task = {
      ...taskData,
      id: this.generateId(),
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await this.taskRepository.save(task);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
