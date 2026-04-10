import AsyncStorage from '@react-native-async-storage/async-storage';
import { reloadAppAsync } from 'expo';

import { syncTaskDueReminders } from '../services/taskDueReminders';

/** Chaves AsyncStorage usadas pelo SeniorEase (preferências, tarefas, tutor, etc.). */
export const APP_ASYNC_STORAGE_KEYS = [
  'seniorease-preferences',
  'seniorease-tasks',
  'seniorease-tutor',
  'seniorease-trust-contact',
  'seniorease-onboarding-v1',
] as const;

/**
 * Apaga todos os dados locais do app (cache / armazenamento), cancela lembretes de prazo
 * agendados e reinicia o JavaScript para aplicar estado limpo.
 * @returns true se o reload foi pedido com sucesso
 */
export async function clearAllLocalAppData(): Promise<boolean> {
  await syncTaskDueReminders([], false);
  await AsyncStorage.multiRemove([...APP_ASYNC_STORAGE_KEYS]);
  try {
    await reloadAppAsync();
    return true;
  } catch {
    return false;
  }
}
