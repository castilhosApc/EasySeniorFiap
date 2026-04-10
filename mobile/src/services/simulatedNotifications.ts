import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';

/** Canal Android compartilhado (lembretes de prazo e simulações do tutor). */
export const ANDROID_CHANNEL_ID = 'seniorease-default';

let handlerConfigured = false;

function configureHandlerOnce() {
  if (handlerConfigured) return;
  handlerConfigured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/** Chame na inicialização do app para notificações em primeiro plano funcionarem bem. */
export function initSimulatedNotificationHandler() {
  configureHandlerOnce();
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'SeniorEase',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    sound: 'default',
  });
}

/**
 * Permissões para notificações locais (simulação de push).
 * @param options.silent — se true, não exibe alertas (útil para sincronizar lembretes em segundo plano).
 */
export async function ensureNotificationPermissions(options?: {
  silent?: boolean;
}): Promise<boolean> {
  configureHandlerOnce();
  const silent = Boolean(options?.silent);

  if (Platform.OS === 'web') {
    if (!silent) {
      Alert.alert(
        'Simulação',
        'Notificações do sistema não estão disponíveis na versão web. Use o app no celular com Expo Go.'
      );
    }
    return false;
  }

  await ensureAndroidChannel();

  const { status: existing } = await Notifications.getPermissionsAsync();
  let final = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    final = status;
  }

  if (final !== 'granted') {
    if (!silent) {
      Alert.alert(
        'Permissão necessária',
        'Ative as notificações nas configurações do aparelho para ver alertas e lembretes.'
      );
    }
    return false;
  }

  return true;
}

/**
 * Simula o alerta que o tutor receberia pedindo aprovação da baixa da tarefa.
 */
export async function simulateTutorApprovalNotification(taskTitle: string, taskId?: string) {
  const ok = await ensureNotificationPermissions();
  if (!ok) return false;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'SeniorEase — Pedido do idoso',
      body: `Pedido de conclusão: "${taskTitle}". Abra o app e confirme na aba Tutor quando estiver correto.`,
      data: { type: 'tutor_approval_baixa', taskId: taskId ?? '' },
      ...(Platform.OS === 'android' && { android: { channelId: ANDROID_CHANNEL_ID } }),
    },
    trigger: null,
  });
  return true;
}

/**
 * Simula lembrete enviado pelo tutor para o idoso cumprir a tarefa.
 */
export async function simulateElderTaskReminderNotification(taskTitle: string) {
  const ok = await ensureNotificationPermissions();
  if (!ok) return false;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'SeniorEase — Lembrete do tutor',
      body: `Olá! O tutor pediu para lembrar: faça com calma a tarefa "${taskTitle}". Abra Tarefas quando puder.`,
      data: { type: 'elder_reminder', taskTitle },
      ...(Platform.OS === 'android' && { android: { channelId: ANDROID_CHANNEL_ID } }),
    },
    trigger: null,
  });
  return true;
}
