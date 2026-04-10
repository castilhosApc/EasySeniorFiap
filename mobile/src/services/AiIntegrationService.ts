/**
 * AiIntegrationService
 *
 * Responsável por chamar o endpoint PHP que consulta o Gemini 1.5 Flash.
 * Em caso de falha (offline, timeout, erro de servidor), retorna o guia estático
 * do mockAssistantData e marca `usedNetworkFallback` para a UI informar o utilizador.
 */

import {
  screenGuides,
  ScreenName,
  ScreenGuide,
  ASSISTANT_IDS,
} from '../data/mockAssistantData';

// ─── Configuração ─────────────────────────────────────────────────────────────

/**
 * URL base do seu servidor PHP.
 * Altere para o domínio real em produção (ex: https://seudominio.com).
 * Em desenvolvimento local com PHP built-in:  http://192.168.x.x:8000
 */
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

const AI_ENDPOINT  = `${API_BASE_URL}/api/ai-assistant.php`;
const TIMEOUT_MS   = 7_000; // 7 segundos — abaixo do timeout do Gemini

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface UiElement {
  id:    string;
  label: string;
}

/** Dicas para o mock local escolher a melhor sugestão por tela (sem backend). */
export interface CopilotHints {
  taskCount?: number;
  incompleteTaskCount?: number;
  awaitingTutorVerificationCount?: number;
  fontSize?: string;
  contrast?: string;
  /** Aba Tutor: itens abertos na fila */
  openPendingCount?: number;
}

export interface AiAssistantRequest {
  screen_name:  ScreenName;
  ui_elements:  UiElement[];
  user_context?: string;
  hints?:       CopilotHints;
}

export interface AiAssistantResponse {
  /** Mensagem lida pelo TTS */
  voice_response: string;
  /** ID do componente SmartButton/SmartCard que deve pulsar */
  highlight_id: string;
  /** Instrução do próximo passo (opcional, exibida na CopilotBubble) */
  next_step: string;
  /** Indica se a resposta veio da IA real ou do mock local */
  source: 'ai' | 'mock';
  /**
   * true quando a API na nuvem falhou (rede, timeout, servidor) e o app usou o guia local.
   * A ajuda continua funcionando; só não veio do modelo remoto.
   */
  usedNetworkFallback?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Cria uma Promise que rejeita após `ms` milissegundos.
 * Usada para abortar chamadas lentas ao backend.
 */
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
  next = 'Toque no botão destacado para continuar.'
): AiAssistantResponse {
  return {
    voice_response: voice,
    highlight_id:   resolveHighlight(highlightId, ui),
    next_step:      next,
    source:         'mock',
  };
}

function buildTasksMock(hints: CopilotHints | undefined, ui: UiElement[]): AiAssistantResponse {
  const taskCount = hints?.taskCount ?? 0;
  const pending = hints?.awaitingTutorVerificationCount ?? 0;
  const incomplete = hints?.incompleteTaskCount ?? 0;

  if (pending > 0) {
    return mockBase(
      `Percebi que você parou um pouco na tela de tarefas. Você tem ${pending} tarefa${
        pending > 1 ? 's' : ''
      } esperando a confirmação do seu tutor. Enquanto isso, pode ver o que já concluiu no histórico. Vou destacar o botão Histórico para você.`,
      ASSISTANT_IDS.BTN_HISTORICO,
      ui
    );
  }

  if (taskCount === 0) {
    return mockBase(
      'Você ainda não tem tarefas na lista. Que tal criar a primeira? O botão Nova Tarefa está piscando bem aqui em cima.',
      ASSISTANT_IDS.BTN_NOVA_TAREFA,
      ui
    );
  }

  if (incomplete === 0) {
    return mockBase(
      'Muito bem! Todas as tarefas desta lista estão concluídas. Se quiser registrar algo novo, use Nova Tarefa. Ou abra o Histórico para rever o que já fez.',
      ASSISTANT_IDS.BTN_HISTORICO,
      ui
    );
  }

  const tick = Math.floor(Date.now() / 25_000) % 2;
  if (tick === 0) {
    return mockBase(
      `Você tem ${incomplete} tarefa${
        incomplete > 1 ? 's' : ''
      } para concluir. Toque num cartão branco para ver as etapas e marcar o que já fez. Se precisar anotar outra coisa, o botão Nova Tarefa está aqui em cima.`,
      ASSISTANT_IDS.BTN_NOVA_TAREFA,
      ui
    );
  }

  return mockBase(
    'Quer ver as tarefas que já terminou? O botão Histórico mostra tudo que foi concluído. Você também pode seguir tocando nos cartões para continuar suas atividades.',
    ASSISTANT_IDS.BTN_HISTORICO,
    ui
  );
}

function buildPersonalizationMock(hints: CopilotHints | undefined, ui: UiElement[]): AiAssistantResponse {
  const contrast = hints?.contrast ?? 'normal';
  const fontSize = hints?.fontSize ?? 'medium';

  if (contrast === 'normal') {
    return mockBase(
      'Se as letras ou o fundo estiverem difíceis de enxergar, o contraste alto deixa tudo mais nítido. Vou destacar o botão Alto contraste para você experimentar.',
      ASSISTANT_IDS.BTN_CONTRASTE_ALTO,
      ui
    );
  }

  if (fontSize === 'small' || fontSize === 'medium') {
    return mockBase(
      'Posso deixar o texto maior para ler com mais calma. O botão Fonte Grande está destacado; depois você pode tentar também Muito Grande.',
      ASSISTANT_IDS.BTN_FONTE_GRANDE,
      ui
    );
  }

  return mockBase(
    'Aqui você ajusta letra, contraste, espaçamento e modo da interface. Toque nas opções que preferir; qualquer dúvida, peça ajuda a alguém de confiança. Destaquei o tamanho da fonte para facilitar.',
    ASSISTANT_IDS.BTN_FONTE_GRANDE,
    ui
  );
}

function buildProfileMock(ui: UiElement[]): AiAssistantResponse {
  return mockBase(
    'Esta é a sua área de perfil, com um resumo das suas preferências. Para mudar letra ou contraste, use a aba Personalização. Quando precisar guardar algo importante no perfil, use o botão Salvar que está destacado.',
    ASSISTANT_IDS.BTN_SAVE_PROFILE,
    ui
  );
}

/**
 * Monta a resposta de fallback (mock) com regras por tela e dicas de contexto.
 */
function buildMockResponse(request: AiAssistantRequest): AiAssistantResponse {
  const ui = request.ui_elements ?? [];
  const hints = request.hints;

  switch (request.screen_name) {
    case 'TasksScreen':
      return buildTasksMock(hints, ui);
    case 'PersonalizationScreen':
      return buildPersonalizationMock(hints, ui);
    case 'ProfileScreen':
      return buildProfileMock(ui);
    case 'TutorScreen': {
      const n = hints?.openPendingCount ?? 0;
      if (n > 0) {
        return mockBase(
          `Você tem ${n} notificaç${n > 1 ? 'ões' : 'ão'} aguardando nesta aba. Role até a seção Pedidos e aprovações para confirmar baixas de tarefas ou marcar como visto. O botão de ajuda está destacado.`,
          ASSISTANT_IDS.BTN_TUTOR_AJUDA,
          ui
        );
      }
      const guide = screenGuides.TutorScreen;
      return mockBase(guide.message, guide.highlightId, ui);
    }
    case 'CreateTaskScreen':
    default: {
      const guide: ScreenGuide | undefined = screenGuides[request.screen_name];
      return mockBase(
        guide?.message ?? 'Posso te ajudar! Olhe o botão destacado na tela.',
        guide?.highlightId ?? '',
        ui
      );
    }
  }
}

// ─── Serviço principal ────────────────────────────────────────────────────────

export const AiIntegrationService = {
  /**
   * Solicita orientação contextual ao Gemini via backend PHP.
   *
   * @param request - Contexto da tela e elementos disponíveis
   * @returns Resposta da IA ou fallback do mock local
   */
  async getAssistance(request: AiAssistantRequest): Promise<AiAssistantResponse> {
    try {
      const fetchPromise = fetch(AI_ENDPOINT, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(request),
      });

      const response = await withTimeout(fetchPromise, TIMEOUT_MS);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Validação mínima da resposta
      if (!data.highlight_id || !data.voice_response) {
        throw new Error('Resposta da IA incompleta ou malformada.');
      }

      return {
        voice_response: data.voice_response,
        highlight_id:   data.highlight_id,
        next_step:      data.next_step ?? '',
        source:         'ai',
        usedNetworkFallback: false,
      };
    } catch (error) {
      if (__DEV__) {
        console.warn('[AiIntegrationService] Falha na chamada à IA, usando mock:', error);
      }
      return { ...buildMockResponse(request), usedNetworkFallback: true };
    }
  },

  /**
   * Verifica rapidamente se o backend está acessível.
   * Útil para exibir indicadores offline na UI.
   */
  async isBackendAvailable(): Promise<boolean> {
    try {
      const response = await withTimeout(
        fetch(`${API_BASE_URL}/api/health.php`, { method: 'GET' }),
        3_000
      );
      return response.ok;
    } catch {
      return false;
    }
  },
};
