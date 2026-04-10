import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, TaskStep } from '@/shared/domain/entities/Task';

const KEY = 'seniorease-tasks';

function reviveStep(s: TaskStep & { completed?: boolean }): TaskStep {
  return {
    ...s,
    completed: Boolean(s.completed),
  };
}

export function reviveTask(raw: Record<string, unknown>): Task {
  const t = raw as unknown as Task & {
    createdAt: string;
    updatedAt: string;
    dueDate?: string;
    steps?: TaskStep[];
  };
  return {
    ...t,
    completed: Boolean(t.completed),
    mandatoryVerification: Boolean(t.mandatoryVerification),
    tutorVerificationStatus: (t.tutorVerificationStatus as Task['tutorVerificationStatus']) ?? 'none',
    createdAt: new Date(t.createdAt as string),
    updatedAt: new Date(t.updatedAt as string),
    dueDate: t.dueDate ? new Date(t.dueDate as string) : undefined,
    steps: (t.steps ?? []).map((s) => reviveStep(s)),
  };
}

export async function loadTasksFromStorage(): Promise<Task[]> {
  try {
    const saved = await AsyncStorage.getItem(KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved) as Record<string, unknown>[];
    return parsed.map((row) => reviveTask(row));
  } catch {
    return [];
  }
}

export async function saveTasksToStorage(tasks: Task[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(tasks));
}
