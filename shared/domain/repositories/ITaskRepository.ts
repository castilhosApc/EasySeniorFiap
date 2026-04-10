import { Task, TaskHistory } from '../entities/Task';

export interface ITaskRepository {
  findAll(userId: string): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  save(task: Task): Promise<Task>;
  update(task: Task): Promise<Task>;
  delete(id: string): Promise<void>;
  findHistory(userId: string, limit?: number): Promise<TaskHistory[]>;
  addHistory(history: TaskHistory): Promise<TaskHistory>;
}
