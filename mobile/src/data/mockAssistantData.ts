/**
 * Engine de Mapeamento de IA (Simulador Offline)
 *
 * Mapeia cada tela para a mensagem de ajuda e o ID do componente
 * que deve "brilhar" quando o monitor de hesitação disparar.
 */

export type ScreenName =
  | 'TasksScreen'
  | 'PersonalizationScreen'
  | 'ProfileScreen'
  | 'CreateTaskScreen'
  | 'TutorScreen';

export interface ScreenGuide {
  /** Mensagem lida pelo TTS e exibida na bolha do co-piloto */
  message: string;
  /** ID do componente SmartButton/SmartCard que deve pulsar */
  highlightId: string;
  /** Ícone opcional exibido na bolha */
  icon?: string;
}

export const screenGuides: Record<ScreenName, ScreenGuide> = {
  /** Fallback genérico; em geral o serviço usa regras por contexto (tarefas vazias, pendentes, etc.). */
  TasksScreen: {
    message:
      'Olá! Você está na lista de tarefas. Pode tocar num cartão para ver etapas, abrir o histórico ou criar algo novo no botão verde.',
    highlightId: 'btn_nova_tarefa',
    icon: '📋',
  },
  PersonalizationScreen: {
    message:
      'Posso ajudar! Experimente aumentar a fonte para deixar o texto maior e mais confortável de ler. O botão "Grande" está se destacando.',
    highlightId: 'btn_fonte_grande',
    icon: '⚙️',
  },
  ProfileScreen: {
    message:
      'Precisa de ajuda para salvar suas informações? O botão de salvar está brilhando lá embaixo para você.',
    highlightId: 'btn_save_profile',
    icon: '👤',
  },
  CreateTaskScreen: {
    message:
      'Para criar sua tarefa, primeiro preencha o título no campo acima. O campo está destacado para você.',
    highlightId: 'input_task_title',
    icon: '✏️',
  },
  TutorScreen: {
    message:
      'Esta área é para quem apoia você: lembretes, aprovações e cadastro de tutores. Toque em “O que é esta aba?” se quiser uma explicação curta.',
    highlightId: 'btn_tutor_ajuda',
    icon: '🛡️',
  },
};

// ─── Constantes de IDs (evita typos nas telas) ────────────────────────────────

export const ASSISTANT_IDS = {
  // TasksScreen
  BTN_NOVA_TAREFA: 'btn_nova_tarefa',
  BTN_HISTORICO: 'btn_historico',

  // PersonalizationScreen
  BTN_FONTE_GRANDE: 'btn_fonte_grande',
  BTN_FONTE_EXTRA: 'btn_fonte_extra',
  BTN_CONTRASTE_ALTO: 'btn_contraste_alto',

  // ProfileScreen
  BTN_SAVE_PROFILE: 'btn_save_profile',

  // TutorScreen
  BTN_TUTOR_AJUDA: 'btn_tutor_ajuda',

  // CreateTaskScreen
  INPUT_TASK_TITLE: 'input_task_title',
} as const;

// ─── Ações críticas que ativam o Anjo da Guarda ───────────────────────────────

export const CRITICAL_ACTIONS = {
  DELETE_TASK: 'Excluir tarefa',
  COMPLETE_TASK: 'Confirmar conclusão de tarefa',
  SAVE_PROFILE: 'Salvar alterações no perfil',
  ENROLL: 'Confirmar matrícula',
  TRANSFER: 'Realizar transferência',
} as const;

export type CriticalActionKey = keyof typeof CRITICAL_ACTIONS;
