/**
 * Chamada ao backend PHP / Gemini — fallback local com aviso na UI (usedNetworkFallback).
 */

import {
  screenGuides,
  ScreenName,
  ScreenGuide,
  ASSISTANT_IDS,
} from '@/data/mockAssistantData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
const AI_ENDPOINT = `${API_BASE_URL}/api/ai-assistant.php`;
const TIMEOUT_MS = 7_000;

export interface UiElement {
  id: string;
  label: string;
}

export interface CopilotHints {
  taskCount?: number;
  incompleteTaskCount?: number;
  awaitingTutorVerificationCount?: number;
  fontSize?: string;
  contrast?: string;
  openPendingCount?: number;
}

export interface AiAssistantRequest {
  screen_name: ScreenName;
  ui_elements: UiElement[];
  /** Contexto livre para o backend (snake_case alinhado ao PHP). */
  user_context?: string;
  hints?: CopilotHints;
}

export interface AiAssistantResponse {
  voice_response: string;
  highlight_id: string;
  next_step: string;
  source: 'ai' | 'mock';
  usedNetworkFallback?: boolean;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout após ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}

function resolveHighlight(preferred: string, ui: UiElement[]): string {
  if (preferred && ui.some((e) => e.id === preferred)) return preferred;
  return ui[0]?.id ?? preferred;
}

function mockBase(
  voice: string,
  highlightId: string,
  ui: UiElement[],
  next = 'Siga a sugestão na tela.'
): AiAssistantResponse {
  return {
    voice_response: voice,
    highlight_id: resolveHighlight(highlightId, ui),
    next_step: next,
    source: 'mock',
  };
}

function buildTasksMock(hints: CopilotHints | undefined, ui: UiElement[]): AiAssistantResponse {
  const taskCount = hints?.taskCount ?? 0;
  const pending = hints?.awaitingTutorVerificationCount ?? 0;
  const incomplete = hints?.incompleteTaskCount ?? 0;

  if (pending > 0) {
    return mockBase(
      `Você tem ${pending} tarefa(s) esperando confirmação do tutor. Pode ver o histórico enquanto isso.`,
      ASSISTANT_IDS.BTN_HISTORICO,
      ui
    );
  }
  if (taskCount === 0) {
    return mockBase(
      'Você ainda não tem tarefas. Que tal criar a primeira no botão Nova Tarefa?',
      ASSISTANT_IDS.BTN_NOVA_TAREFA,
      ui
    );
  }
  if (incomplete === 0) {
    return mockBase(
      'Todas as tarefas estão concluídas. Use Nova Tarefa ou abra o Histórico.',
      ASSISTANT_IDS.BTN_HISTORICO,
      ui
    );
  }
  return mockBase(
    `Você tem ${incomplete} tarefa(s) para concluir. Abra um cartão para ver as etapas.`,
    ASSISTANT_IDS.BTN_NOVA_TAREFA,
    ui
  );
}

function buildMockResponse(request: AiAssistantRequest): AiAssistantResponse {
  const ui = request.ui_elements ?? [];
  const hints = request.hints;

  switch (request.screen_name) {
    case 'TasksScreen':
      return buildTasksMock(hints, ui);
    case 'TutorScreen': {
      const n = hints?.openPendingCount ?? 0;
      if (n > 0) {
        return mockBase(
          `Há ${n} pedido(s) na fila do tutor. Confirme ou recuse na lista abaixo.`,
          ASSISTANT_IDS.BTN_TUTOR_AJUDA,
          ui
        );
      }
      const guide = screenGuides.TutorScreen;
      return mockBase(guide.message, guide.highlightId, ui);
    }
    default: {
      const guide: ScreenGuide | undefined = screenGuides[request.screen_name];
      return mockBase(
        guide?.message ?? 'Posso te ajudar! Veja os botões principais da página.',
        guide?.highlightId ?? '',
        ui
      );
    }
  }
}

export const AiIntegrationService = {
  async getAssistance(request: AiAssistantRequest): Promise<AiAssistantResponse> {
    try {
      const fetchPromise = fetch(AI_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      const response = await withTimeout(fetchPromise, TIMEOUT_MS);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      if (!data.highlight_id || !data.voice_response) {
        throw new Error('Resposta incompleta');
      }
      return {
        voice_response: data.voice_response,
        highlight_id: data.highlight_id,
        next_step: data.next_step ?? '',
        source: 'ai',
        usedNetworkFallback: false,
      };
    } catch {
      return { ...buildMockResponse(request), usedNetworkFallback: true };
    }
  },
};
