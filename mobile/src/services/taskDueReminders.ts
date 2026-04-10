import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import { Task } from '@/shared/domain/entities/Task';
import { setHours, setMinutes, setSeconds, startOfDay } from 'date-fns';

import { ANDROID_CHANNEL_ID, ensureNotificationPermissions } from './simulatedNotifications';

const REMINDER_DATA_TYPE = 'task_due_reminder';

function reminderAtNineOnDueDay(due: Date): Date {
  const day = startOfDay(due);
  return setSeconds(setMinutes(setHours(day, 9), 0), 0);
}

/** Só agenda se o horário de lembrete ainda está no futuro (9h do dia do prazo). */
function computeTriggerDate(due: Date): Date | null {
  const at = reminderAtNineOnDueDay(due);
  return at.getTime() > Date.now() ? at : null;
}

async function cancelTaskDueReminders(): Promise<void> {
  if (Platform.OS === 'web') return;
  const all = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    all
      .filter((n) => (n.content.data as { type?: string } | undefined)?.type === REMINDER_DATA_TYPE)
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );
}

/**
 * Reconcilia lembretes locais com a lista de tarefas (incompletas com prazo).
 * Respeita `remindersEnabled` das preferências do usuário.
 */
export async function syncTaskDueReminders(
  tasks: Task[],
  remindersEnabled: boolean
): Promise<void> {
  if (Platform.OS === 'web') return;

  await cancelTaskDueReminders();
  if (!remindersEnabled) return;

  const ok = await ensureNotificationPermissions({ silent: true });
  if (!ok) return;

  const incomplete = tasks.filter((t) => !t.completed && t.dueDate);
  for (const task of incomplete) {
    const due = task.dueDate!;
    const when = computeTriggerDate(due);
    if (!when) continue;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'SeniorEase — Lembrete amigável',
        body: `Lembrete: hoje é o dia combinado para "${task.title}". Abra o app, vá a Tarefas e veja o que falta fazer.`,
        data: { type: REMINDER_DATA_TYPE, taskId: task.id },
        ...(Platform.OS === 'android' && { android: { channelId: ANDROID_CHANNEL_ID } }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: when,
      },
    });
  }
}
