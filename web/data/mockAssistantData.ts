/**
 * Dados de apoio local para o assistente (espelha o mobile).
 */

export type ScreenName =
  | 'TasksScreen'
  | 'PersonalizationScreen'
  | 'ProfileScreen'
  | 'CreateTaskScreen'
  | 'TutorScreen';

export interface ScreenGuide {
  message: string;
  highlightId: string;
  icon?: string;
}

export const screenGuides: Record<ScreenName, ScreenGuide> = {
  TasksScreen: {
    message:
      'Olá! Você está na lista de tarefas. Pode abrir o histórico ou criar algo novo no botão verde.',
    highlightId: 'btn_nova_tarefa',
    icon: '📋',
  },
  PersonalizationScreen: {
    message:
      'Experimente aumentar a fonte para deixar o texto maior e mais confortável de ler.',
    highlightId: 'btn_fonte_grande',
    icon: '⚙️',
  },
  ProfileScreen: {
    message:
      'Aqui ficam suas informações e o contato de apoio. Guarde o telefone de quem pode ajudar.',
    highlightId: 'btn_save_profile',
    icon: '👤',
  },
  CreateTaskScreen: {
    message: 'Para criar sua tarefa, primeiro preencha o título.',
    highlightId: 'input_task_title',
    icon: '✏️',
  },
  TutorScreen: {
    message:
      'Área do tutor: aprovações, lembretes e cadastro. Use o botão de ajuda se tiver dúvida.',
    highlightId: 'btn_tutor_ajuda',
    icon: '🛡️',
  },
};

export const ASSISTANT_IDS = {
  BTN_NOVA_TAREFA: 'btn_nova_tarefa',
  BTN_HISTORICO: 'btn_historico',
  BTN_FONTE_GRANDE: 'btn_fonte_grande',
  BTN_FONTE_EXTRA: 'btn_fonte_extra',
  BTN_CONTRASTE_ALTO: 'btn_contraste_alto',
  BTN_SAVE_PROFILE: 'btn_save_profile',
  BTN_TUTOR_AJUDA: 'btn_tutor_ajuda',
  INPUT_TASK_TITLE: 'input_task_title',
} as const;

export const CRITICAL_ACTIONS = {
  DELETE_TASK: 'Excluir tarefa',
  COMPLETE_TASK: 'Confirmar conclusão de tarefa',
  SAVE_PROFILE: 'Salvar alterações no perfil',
  ENROLL: 'Confirmar matrícula',
  TRANSFER: 'Realizar transferência',
} as const;
