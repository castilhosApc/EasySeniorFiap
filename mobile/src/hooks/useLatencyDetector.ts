import { useEffect, useRef, useCallback } from 'react';
import * as Speech from 'expo-speech';
import { useIsFocused } from '@react-navigation/native';

import { useAccessibilityContext } from '../context/AccessibilityContext';
import { ScreenName } from '../data/mockAssistantData';
import { UiElement, CopilotHints } from '../services/AiIntegrationService';
import { useAiAssistant } from './useAiAssistant';

/** Tempo sem interação antes de oferecer ajuda (75% de 30s ≈ 22,5s). */
const HESITATION_TIMEOUT_MS = 22_500;

interface UseLatencyDetectorOptions {
  /** Nome da tela atual */
  screenName: ScreenName;
  /**
   * Elementos visíveis na tela — enviados ao Gemini para escolher
   * qual componente deve brilhar. Se omitido, usa apenas o mock local.
   */
  uiElements?: UiElement[];
  /** Contexto adicional do usuário (opcional) */
  userContext?: string;
  /** Se false, o detector fica inativo (ex: modais) — combinado com foco da aba */
  enabled?: boolean;
  /** Dicas para o mock local */
  hints?: CopilotHints;
}

/**
 * Monitor de hesitação: só ativo quando esta aba está em foco (evita ajuda “da aba errada”).
 */
export function useLatencyDetector({
  screenName,
  uiElements = [],
  userContext,
  enabled: enabledProp = true,
  hints,
}: UseLatencyDetectorOptions) {
  const isFocused = useIsFocused();
  const enabled = enabledProp && isFocused;

  const { clearAssistant } = useAccessibilityContext();
  const { requestAssistance } = useAiAssistant({ screenName, uiElements, userContext, hints });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);
  const requestAssistanceRef = useRef(requestAssistance);
  requestAssistanceRef.current = requestAssistance;

  const triggerAssistance = useCallback(async () => {
    if (firedRef.current) return;
    firedRef.current = true;
    await requestAssistanceRef.current();
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (firedRef.current) {
      firedRef.current = false;
      clearAssistant();
      Speech.stop();
    }

    if (!enabled) return;

    timerRef.current = setTimeout(triggerAssistance, HESITATION_TIMEOUT_MS);
  }, [enabled, triggerAssistance, clearAssistant]);

  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      firedRef.current = false;
      clearAssistant();
      Speech.stop();
      return;
    }

    firedRef.current = false;
    resetTimer();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      clearAssistant();
      Speech.stop();
    };
  }, [screenName, enabled, resetTimer, clearAssistant]);

  return { onUserInteraction: resetTimer };
}
