/**
 * useAiAssistant
 *
 * Orquestra a chamada ao serviço de ajuda e atualiza o co-piloto.
 * Se o usuário trocar de aba durante a requisição, o resultado é descartado
 * (evita mensagem/brilho da tela errada).
 */

import { useCallback, useEffect, useRef } from 'react';
import { AccessibilityInfo } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

import { useAccessibilityContext } from '../context/AccessibilityContext';
import {
  AiIntegrationService,
  UiElement,
  CopilotHints,
} from '../services/AiIntegrationService';
import { prepareCopilotAudio, speakCopilotMessage } from '../services/copilotSpeech';
import { ScreenName } from '../data/mockAssistantData';

interface UseAiAssistantOptions {
  screenName: ScreenName;
  uiElements: UiElement[];
  userContext?: string;
  hints?: CopilotHints;
}

export function useAiAssistant({
  screenName,
  uiElements,
  userContext,
  hints,
}: UseAiAssistantOptions) {
  const isFocused = useIsFocused();
  const applyResultRef = useRef(isFocused);

  useEffect(() => {
    applyResultRef.current = isFocused;
  }, [isFocused]);

  const { triggerAssistant, setAiThinking, setAiAssistNotice } = useAccessibilityContext();

  const requestAssistance = useCallback(async () => {
    setAiThinking(true);

    try {
      await prepareCopilotAudio();

      const result = await AiIntegrationService.getAssistance({
        screen_name: screenName,
        ui_elements: uiElements,
        user_context: userContext,
        hints,
      });

      if (!applyResultRef.current) {
        return;
      }

      if (result.usedNetworkFallback) {
        const msg =
          'Sem conexão com a assistente na nuvem. Suas tarefas e lembretes seguem normais; as dicas usam o guia local do app.';
        setAiAssistNotice(msg);
        AccessibilityInfo.announceForAccessibility(msg);
      }

      triggerAssistant(result.highlight_id, result.voice_response);
      speakCopilotMessage(result.voice_response);

      if (__DEV__) {
        console.log(
          `[useAiAssistant] Fonte: ${result.source} | ID: ${result.highlight_id}`
        );
      }
    } finally {
      setAiThinking(false);
    }
  }, [
    screenName,
    uiElements,
    userContext,
    hints,
    triggerAssistant,
    setAiThinking,
    setAiAssistNotice,
  ]);

  return { requestAssistance };
}
