/**
 * Perfil de tutor (simulado — persistência local até haver backend).
 */
export interface TutorProfile {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  /** Tutor que recebe as notificações simuladas neste dispositivo */
  isPrimary: boolean;
  createdAt: string;
}

export type TutorPendingType = 'critical_action' | 'mandatory_task_completion';

/** Item na fila que o tutor “recebe” (simulação). */
export interface TutorPendingItem {
  id: string;
  type: TutorPendingType;
  title: string;
  detail?: string;
  taskId?: string;
  createdAt: string;
  /** open = ainda na fila; fechado pelo tutor ou após ação */
  status: 'open' | 'closed';
}
