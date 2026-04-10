import { InteractionManager, Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

/** Locales comuns para TTS em português (Android às vezes exige pt_BR). */
const VOICE_LOCALES = ['pt-BR', 'pt_BR', 'pt-PT', 'pt'] as const;

let audioModePromise: Promise<void> | null = null;

/**
 * Configura sessão de áudio para voz sair mesmo com silencioso no iPhone e com volume no Android.
 * Chame antes do primeiro speak (e no boot do app).
 */
export function prepareCopilotAudio(): Promise<void> {
  if (audioModePromise) return audioModePromise;
  audioModePromise = (async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (e) {
      if (__DEV__) {
        console.warn('[copilotSpeech] setAudioModeAsync:', e);
      }
    }
  })();
  return audioModePromise;
}

/**
 * Lê em voz alta a mensagem do co-piloto, com ritmo mais calmo e fallbacks de idioma.
 */
export function speakCopilotMessage(text: string): void {
  const trimmed = text?.trim();
  if (!trimmed) return;

  Speech.stop();

  const start = () => {
    tryLocale(trimmed, 0);
  };

  if (Platform.OS === 'android') {
    InteractionManager.runAfterInteractions(() => {
      setTimeout(start, 150);
    });
  } else {
    InteractionManager.runAfterInteractions(start);
  }
}

function tryLocale(text: string, index: number): void {
  const locale = VOICE_LOCALES[Math.min(index, VOICE_LOCALES.length - 1)];

  Speech.speak(text, {
    language: locale,
    pitch: 1,
    rate: Platform.OS === 'ios' ? 0.86 : 0.92,
    volume: 1,
    ...(Platform.OS === 'ios' && {
      useApplicationAudioSession: false,
    }),
    onError: () => {
      if (index < VOICE_LOCALES.length - 1) {
        tryLocale(text, index + 1);
      } else if (__DEV__) {
        console.warn('[copilotSpeech] Falha no TTS após tentar todos os locales');
      }
    },
  });
}
