/**
 * Remove dados locais do SeniorEase no navegador (localStorage + flags de lembretes na sessão).
 */

const LOCAL_STORAGE_KEYS = [
  'seniorease-preferences',
  'seniorease-tasks',
  'seniorease-tutor',
  'seniorease-trust-contact',
  'seniorease-onboarding-v1',
] as const;

const SESSION_PREFIX = 'seniorease-due-notified-';

export function clearAllWebLocalData(): void {
  if (typeof window === 'undefined') return;
  LOCAL_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  try {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k?.startsWith(SESSION_PREFIX)) keys.push(k);
    }
    keys.forEach((k) => sessionStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

/** Limpa dados e recarrega a página para repor o estado em memória (Zustand, etc.). */
export function clearAllWebLocalDataAndReload(): void {
  clearAllWebLocalData();
  window.location.reload();
}
