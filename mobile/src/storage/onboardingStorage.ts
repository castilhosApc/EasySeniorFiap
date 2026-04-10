import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'seniorease-onboarding-v1';
const PREFERENCES_KEY = 'seniorease-preferences';

export async function isOnboardingComplete(): Promise<boolean> {
  try {
    if ((await AsyncStorage.getItem(KEY)) === '1') return true;
    // Quem já tinha preferências guardadas (app antigo) não é obrigado a refazer o onboarding.
    const prefs = await AsyncStorage.getItem(PREFERENCES_KEY);
    if (prefs) {
      await AsyncStorage.setItem(KEY, '1');
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function setOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(KEY, '1');
}
