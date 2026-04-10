import { TaskHistory } from '../domain/entities/Task';
import { ITaskRepository } from '../domain/repositories/ITaskRepository';

export class GetTaskHistory {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(userId: string, limit: number = 50): Promise<TaskHistory[]> {
    return await this.taskRepository.findHistory(userId, limit);
  }
}
