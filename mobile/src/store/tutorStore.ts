import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TutorProfile, TutorPendingItem, TutorPendingType } from '@/shared/domain/entities/Tutor';

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Histórico de lembretes enviados ao idoso (simulação). */
export interface TutorReminderLogEntry {
  id: string;
  taskId: string;
  taskTitle: string;
  sentAt: string;
}

interface TutorState {
  tutors: TutorProfile[];
  pendingItems: TutorPendingItem[];
  reminderHistory: TutorReminderLogEntry[];
  addTutor: (name: string, phone?: string, email?: string) => void;
  removeTutor: (id: string) => void;
  setPrimaryTutor: (id: string) => void;
  /** Simula notificação quando o idoso aciona fluxo de aprovação */
  notifyCriticalAction: (title: string, detail?: string) => void;
  /** Simula notificação quando o idoso pede conclusão de tarefa obrigatória */
  notifyMandatoryTask: (taskId: string, title: string) => void;
  dismissPending: (id: string) => void;
  clearClosedPending: () => void;
  logReminderSent: (taskId: string, taskTitle: string) => void;
}

export const useTutorStore = create<TutorState>()(
  persist(
    (set, get) => ({
      tutors: [],
      pendingItems: [],
      reminderHistory: [],

      addTutor: (name, phone, email) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        const tutors = get().tutors;
        const profile: TutorProfile = {
          id: newId(),
          name: trimmed,
          phone: phone?.trim() || undefined,
          email: email?.trim() || undefined,
          isPrimary: tutors.length === 0,
          createdAt: new Date().toISOString(),
        };
        set({ tutors: [...tutors, profile] });
      },

      removeTutor: (id) => {
        const tutors = get().tutors.filter((t) => t.id !== id);
        if (tutors.length && !tutors.some((t) => t.isPrimary)) {
          tutors[0] = { ...tutors[0], isPrimary: true };
        }
        set({ tutors });
      },

      setPrimaryTutor: (id) => {
        set({
          tutors: get().tutors.map((t) => ({
            ...t,
            isPrimary: t.id === id,
          })),
        });
      },

      notifyCriticalAction: (title, detail) => {
        const item: TutorPendingItem = {
          id: newId(),
          type: 'critical_action' as TutorPendingType,
          title,
          detail,
          createdAt: new Date().toISOString(),
          status: 'open',
        };
        set({ pendingItems: [item, ...get().pendingItems] });
      },

      notifyMandatoryTask: (taskId, title) => {
        const dup = get().pendingItems.some(
          (p) =>
            p.status === 'open' && p.type === 'mandatory_task_completion' && p.taskId === taskId
        );
        if (dup) return;
        const item: TutorPendingItem = {
          id: newId(),
          type: 'mandatory_task_completion',
          title: `Conclusão pendente: ${title}`,
          detail: 'O idoso marcou esta tarefa obrigatória como feita. Confirme ou recuse.',
          taskId,
          createdAt: new Date().toISOString(),
          status: 'open',
        };
        set({ pendingItems: [item, ...get().pendingItems] });
      },

      dismissPending: (id) => {
        set({
          pendingItems: get().pendingItems.map((p) =>
            p.id === id ? { ...p, status: 'closed' as const } : p
          ),
        });
      },

      clearClosedPending: () => {
        set({ pendingItems: get().pendingItems.filter((p) => p.status === 'open') });
      },

      logReminderSent: (taskId, taskTitle) => {
        const entry: TutorReminderLogEntry = {
          id: newId(),
          taskId,
          taskTitle,
          sentAt: new Date().toISOString(),
        };
        const prev = get().reminderHistory ?? [];
        const next = [entry, ...prev].slice(0, 30);
        set({ reminderHistory: next });
      },
    }),
    {
      name: 'seniorease-tutor',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
