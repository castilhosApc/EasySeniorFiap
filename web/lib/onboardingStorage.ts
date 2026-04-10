const KEY = 'seniorease-onboarding-v1';
const PREFERENCES_KEY = 'seniorease-preferences';

export async function isOnboardingComplete(): Promise<boolean> {
  if (typeof window === 'undefined') return true;
  try {
    if (localStorage.getItem(KEY) === '1') return true;
    const prefs = localStorage.getItem(PREFERENCES_KEY);
    if (prefs) {
      localStorage.setItem(KEY, '1');
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function setOnboardingComplete(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, '1');
}
