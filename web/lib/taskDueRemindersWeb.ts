import { Task } from '@/shared/domain/entities/Task';
import { isSameDay, startOfDay } from 'date-fns';

const FLAG_PREFIX = 'seniorease-due-notified-';

/** Uma notificação do browser por tarefa/dia (evita spam ao recarregar). */
export function maybeNotifyDueTasksToday(tasks: Task[], remindersEnabled: boolean): void {
  if (typeof window === 'undefined' || !remindersEnabled) return;
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const today = startOfDay(new Date());
  for (const t of tasks) {
    if (t.completed || !t.dueDate) continue;
    const d = new Date(t.dueDate);
    if (!isSameDay(d, today)) continue;
    const flagKey = `${FLAG_PREFIX}${t.id}-${today.toISOString().slice(0, 10)}`;
    if (sessionStorage.getItem(flagKey)) continue;
    sessionStorage.setItem(flagKey, '1');
    try {
      new Notification('SeniorEase — Lembrete amigável', {
        body: `Lembrete: hoje é o dia combinado para “${t.title}”. Abra o site e vá a Tarefas.`,
        tag: `due-${t.id}`,
      });
    } catch {
      /* ignore */
    }
    break;
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const p = await Notification.requestPermission();
  return p === 'granted';
}
