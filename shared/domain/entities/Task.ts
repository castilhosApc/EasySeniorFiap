/** Conclusão com verificação obrigatória pelo tutor */
export type TutorVerificationStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  steps: TaskStep[];
  category?: string;
  createdAt: Date;
  updatedAt: Date;
  /**
   * Se true, o idoso só conclui de fato após o tutor confirmar na aba Tutor.
   * Pode ser definido na criação ou alterado pelo tutor.
   */
  mandatoryVerification?: boolean;
  /** Fluxo de confirmação pelo tutor */
  tutorVerificationStatus?: TutorVerificationStatus;
}

export interface TaskStep {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  order: number;
}

export interface TaskHistory {
  id: string;
  taskId: string;
  action: 'created' | 'completed' | 'updated' | 'deleted';
  timestamp: Date;
  details?: string;
}
