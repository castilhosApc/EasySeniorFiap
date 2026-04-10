import React, { useState, useCallback, useLayoutEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Alert,
} from 'react-native';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAccessibilityStore } from '../store/accessibilityStore';
import { useAccessibilityContext } from '../context/AccessibilityContext';
import { useLatencyDetector } from '../hooks/useLatencyDetector';
import { useTutorStore } from '../store/tutorStore';
import { SmartButton } from '../components/SmartButton';
import { SmartCard } from '../components/SmartCard';
import { ASSISTANT_IDS, CRITICAL_ACTIONS } from '../data/mockAssistantData';
import { Task, TaskStep } from '@/shared/domain/entities/Task';
import { TAB_BAR_STYLE } from '../navigation/tabBarStyle';
import { loadTasksFromStorage, saveTasksToStorage } from '../storage/tasksStorage';
import { getContrastTheme } from '../theme/contrastTheme';
import { useElderInboxStore } from '../store/elderInboxStore';
import { simulateTutorApprovalNotification } from '../services/simulatedNotifications';
import { syncTaskDueReminders } from '../services/taskDueReminders';

export function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const navigation = useNavigation();
  const preferences = useAccessibilityStore((state) => state.preferences);
  const { requestTutorApproval } = useAccessibilityContext();
  const theme = getContrastTheme(preferences.contrast);
  const elderBanner = useElderInboxStore((s) => s.banner);
  const clearElderBanner = useElderInboxStore((s) => s.clearBanner);

  const modalAberto = showCreateModal || showHistory;
  useLayoutEffect(() => {
    navigation.setOptions({
      tabBarStyle: modalAberto ? { display: 'none' } : TAB_BAR_STYLE,
    });
  }, [navigation, modalAberto]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        const t = await loadTasksFromStorage();
        if (cancelled) return;
        setTasks(t);
        await syncTaskDueReminders(t, preferences.reminderPreferences.enabled);
      })();
      return () => {
        cancelled = true;
      };
    }, [preferences.reminderPreferences.enabled])
  );

  const copilotHints = useMemo(
    () => ({
      taskCount: tasks.length,
      incompleteTaskCount: tasks.filter((t) => !t.completed).length,
      awaitingTutorVerificationCount: tasks.filter((t) => t.tutorVerificationStatus === 'pending')
        .length,
    }),
    [tasks]
  );

  const { onUserInteraction } = useLatencyDetector({
    screenName: 'TasksScreen',
    uiElements: [
      { id: ASSISTANT_IDS.BTN_NOVA_TAREFA, label: 'Nova Tarefa' },
      { id: ASSISTANT_IDS.BTN_HISTORICO, label: 'Ver Histórico' },
    ],
    userContext: 'Tela principal de tarefas do SeniorEase',
    hints: copilotHints,
    enabled: !modalAberto,
  });

  const saveTasks = async (newTasks: Task[]) => {
    setTasks(newTasks);
    await saveTasksToStorage(newTasks);
    await syncTaskDueReminders(newTasks, preferences.reminderPreferences.enabled);
  };

  // ── Ações ─────────────────────────────────────────────────────────────────

  const handleCreateTask = (
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'>
  ) => {
    const newTask: Task = {
      ...taskData,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      mandatoryVerification: Boolean(taskData.mandatoryVerification),
      tutorVerificationStatus: taskData.tutorVerificationStatus ?? 'none',
    };
    saveTasks([...tasks, newTask]);
    setShowCreateModal(false);
  };

  const applyCompleteTask = (taskId: string) => {
    const updated = tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            completed: true,
            steps: t.steps.map((s) => ({ ...s, completed: true })),
            tutorVerificationStatus: 'none' as const,
            updatedAt: new Date(),
          }
        : t
    );
    saveTasks(updated);
  };

  const handleCompleteTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (task.mandatoryVerification) {
      if (task.tutorVerificationStatus === 'pending') {
        Alert.alert(
          'Aguardando o tutor',
          'Esta tarefa só será concluída depois que o tutor confirmar na aba Tutor.'
        );
        return;
      }
      const updated = tasks.map((t) =>
        t.id === taskId
          ? { ...t, tutorVerificationStatus: 'pending' as const, updatedAt: new Date() }
          : t
      );
      saveTasks(updated);
      useTutorStore.getState().notifyMandatoryTask(taskId, task.title);
      void simulateTutorApprovalNotification(task.title, taskId);
      Alert.alert(
        'Enviado ao tutor',
        'Sua conclusão foi enviada para confirmação. Uma notificação de aprovação também foi simulada neste aparelho.'
      );
      return;
    }

    if (preferences.extraConfirmations) {
      requestTutorApproval(CRITICAL_ACTIONS.COMPLETE_TASK, () => applyCompleteTask(taskId));
    } else {
      applyCompleteTask(taskId);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const runDelete = () => saveTasks(tasks.filter((t) => t.id !== taskId));
    if (preferences.extraConfirmations) {
      requestTutorApproval(CRITICAL_ACTIONS.DELETE_TASK, runDelete);
    } else {
      runDelete();
    }
  };

  const handleCompleteStep = (taskId: string, stepId: string) => {
    const updated = tasks.map((t) =>
      t.id === taskId
        ? { ...t, steps: t.steps.map((s) => (s.id === stepId ? { ...s, completed: true } : s)) }
        : t
    );
    saveTasks(updated);
  };

  // ── Estilos dinâmicos ─────────────────────────────────────────────────────

  const fontSize = getFontSize(preferences.fontSize);
  const spacing = getSpacing(preferences.spacing);

  const summary = useMemo(() => {
    const incomplete = tasks.filter((t) => !t.completed);
    const pendingTutor = incomplete.filter((t) => t.tutorVerificationStatus === 'pending').length;
    const weekAgo = subDays(new Date(), 7);
    const doneThisWeek = tasks.filter(
      (t) => t.completed && new Date(t.updatedAt).getTime() >= weekAgo.getTime()
    ).length;
    return { open: incomplete.length, pendingTutor, doneThisWeek };
  }, [tasks]);

  const summaryA11y = `Resumo: ${summary.open} tarefa${
    summary.open === 1 ? '' : 's'
  } em aberto, ${summary.pendingTutor} aguardando o tutor, ${summary.doneThisWeek} concluída${
    summary.doneThisWeek === 1 ? '' : 's'
  } nos últimos sete dias.`;

  return (
    <TouchableWithoutFeedback onPress={onUserInteraction} accessible={false}>
      <View style={[styles.flex, { backgroundColor: theme.screenBg }]}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={{ padding: spacing, paddingBottom: spacing + 8 }}
          onScrollBeginDrag={onUserInteraction}
          onTouchStart={onUserInteraction}
          keyboardShouldPersistTaps="handled"
        >
          {elderBanner ? (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={clearElderBanner}
              style={[styles.elderBanner, { borderColor: theme.cardBorder, marginBottom: spacing }]}
              accessibilityRole="summary"
              accessibilityLabel={`${elderBanner.title}. ${elderBanner.body}. Toque para fechar.`}
            >
              <Text style={[styles.elderBannerTitle, { fontSize: fontSize + 1, color: theme.textPrimary }]}>
                {elderBanner.title}
              </Text>
              <Text style={[styles.elderBannerBody, { fontSize, color: theme.textSecondary }]}>
                {elderBanner.body}
              </Text>
              <Text style={[styles.elderBannerDismiss, { fontSize: fontSize - 2, color: '#4f46e5' }]}>
                Toque para dispensar
              </Text>
            </TouchableOpacity>
          ) : null}

          <SmartCard id="card_resumo_semana" style={{ marginBottom: spacing }}>
            <View accessibilityRole="text" accessibilityLabel={summaryA11y}>
              <Text
                style={[styles.summaryTitle, { fontSize: fontSize + 2, color: theme.sectionTitle }]}
              >
                Resumo
              </Text>
              <Text style={[styles.summaryLine, { fontSize, color: theme.textSecondary }]}>
                • Em aberto: <Text style={{ fontWeight: '800', color: theme.textPrimary }}>{summary.open}</Text>
              </Text>
              <Text style={[styles.summaryLine, { fontSize, color: theme.textSecondary }]}>
                • Aguardando o tutor:{' '}
                <Text style={{ fontWeight: '800', color: theme.textPrimary }}>{summary.pendingTutor}</Text>
              </Text>
              <Text style={[styles.summaryLine, { fontSize, color: theme.textSecondary }]}>
                • Concluídas nos últimos 7 dias:{' '}
                <Text style={{ fontWeight: '800', color: theme.textPrimary }}>{summary.doneThisWeek}</Text>
              </Text>
            </View>
          </SmartCard>

          {/* Cabeçalho + Ações */}
          <View style={{ marginBottom: spacing * 1.5 }}>
            <Text
              style={[
                styles.title,
                { fontSize: fontSize + 8, marginBottom: spacing, color: theme.textPrimary },
              ]}
              accessibilityRole="header"
            >
              Organizador de Atividades
            </Text>
            <View style={styles.buttonRow}>
              <SmartButton
                id={ASSISTANT_IDS.BTN_NOVA_TAREFA}
                label="➕  Nova Tarefa"
                onPress={() => { onUserInteraction(); setShowCreateModal(true); }}
                variant="success"
                accessibilityHint="Abre o formulário para criar uma nova tarefa"
              />
              <SmartButton
                id={ASSISTANT_IDS.BTN_HISTORICO}
                label="📜  Histórico"
                onPress={() => { onUserInteraction(); setShowHistory(true); }}
                variant="primary"
                accessibilityHint="Mostra tarefas já concluídas"
              />
            </View>
          </View>

          {/* Lista de tarefas */}
          {tasks.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={[styles.emptyText, { fontSize, color: theme.textSecondary }]}>
                Você ainda não tem tarefas cadastradas.
              </Text>
              <SmartButton
                id={ASSISTANT_IDS.BTN_NOVA_TAREFA}
                label="Criar Primeira Tarefa"
                onPress={() => { onUserInteraction(); setShowCreateModal(true); }}
                variant="success"
              />
            </View>
          ) : (
            tasks.map((task) => (
              <SmartCard key={task.id} id={`card_task_${task.id}`}>
                <TaskCardContent
                  task={task}
                  fontSize={fontSize}
                  spacing={spacing}
                  theme={theme}
                  onComplete={handleCompleteTask}
                  onDelete={handleDeleteTask}
                  onCompleteStep={handleCompleteStep}
                  onInteraction={onUserInteraction}
                />
              </SmartCard>
            ))
          )}
        </ScrollView>

        {showCreateModal && (
          <CreateTaskModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateTask}
            fontSize={fontSize}
            spacing={spacing}
            theme={theme}
          />
        )}

        {showHistory && (
          <TaskHistoryModal
            tasks={tasks}
            onClose={() => setShowHistory(false)}
            fontSize={fontSize}
            spacing={spacing}
            theme={theme}
          />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function TaskCardContent({
  task,
  fontSize,
  spacing,
  theme,
  onComplete,
  onDelete,
  onCompleteStep,
  onInteraction,
}: {
  task: Task;
  fontSize: number;
  spacing: number;
  theme: ReturnType<typeof getContrastTheme>;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onCompleteStep: (taskId: string, stepId: string) => void;
  onInteraction: () => void;
}) {
  const done = task.steps.filter((s) => s.completed).length;
  const total = task.steps.length;
  const progress = total > 0 ? (done / total) * 100 : 0;
  const pendingTutor = task.tutorVerificationStatus === 'pending';

  return (
    <>
      <Text
        style={[
          styles.cardTitle,
          { fontSize: fontSize + 2, color: theme.textPrimary },
          task.completed && styles.strikethrough,
        ]}
      >
        {task.title}
      </Text>
      {task.mandatoryVerification ? (
        <View style={[styles.mandatoryBadge, { borderColor: theme.cardBorder }]}>
          <Text style={{ fontSize: fontSize - 2, fontWeight: '700', color: theme.textPrimary }}>
            🛡️ Conclusão confirmada pelo tutor
          </Text>
        </View>
      ) : null}
      {pendingTutor ? (
        <Text style={{ fontSize, color: '#b45309', fontWeight: '600', marginBottom: 6 }}>
          ⏳ Aguardando o tutor confirmar a conclusão…
        </Text>
      ) : null}
      {task.description ? (
        <Text style={[styles.cardDesc, { fontSize, color: theme.textSecondary }]}>
          {task.description}
        </Text>
      ) : null}
      {task.dueDate ? (
        <Text style={[styles.cardDate, { fontSize: fontSize - 2, color: theme.textMuted }]}>
          Prazo: {format(new Date(task.dueDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </Text>
      ) : null}
      {task.category ? (
        <View style={[styles.badge, { backgroundColor: theme.badgeBg }]}>
          <Text style={[styles.badgeText, { color: theme.badgeText }]}>{task.category}</Text>
        </View>
      ) : null}

      {total > 0 && (
        <View style={{ marginTop: spacing / 2, marginBottom: spacing / 2 }}>
          <Text style={[styles.stepsLabel, { fontSize, color: theme.textSecondary }]}>
            Etapas: {done} de {total} concluídas
          </Text>
          <View style={[styles.progressTrack, { backgroundColor: theme.progressTrack }]}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          {task.steps.map((step) => (
            <TouchableOpacity
              key={step.id}
              style={styles.stepRow}
              onPress={() => { onInteraction(); !step.completed && onCompleteStep(task.id, step.id); }}
              disabled={step.completed}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: step.completed }}
            >
              <Text style={styles.stepCheck}>{step.completed ? '✅' : '⬜'}</Text>
              <Text
                style={[
                  styles.stepText,
                  { fontSize, color: theme.textSecondary },
                  step.completed && styles.strikethrough,
                ]}
              >
                {step.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={[styles.buttonRow, { marginTop: spacing / 2 }]}>
        {!task.completed && (
          <SmartButton
            id={`btn_complete_${task.id}`}
            label={pendingTutor ? '⏳  Aguardando tutor' : '✓  Concluir'}
            onPress={() => { onInteraction(); onComplete(task.id); }}
            variant="success"
            minHeight={50}
            disabled={pendingTutor}
          />
        )}
        <SmartButton
          id={`btn_delete_${task.id}`}
          label="🗑️  Excluir"
          onPress={() => { onInteraction(); onDelete(task.id); }}
          variant="danger"
          minHeight={50}
        />
      </View>
    </>
  );
}

function CreateTaskModal({
  onClose,
  onCreate,
  fontSize,
  spacing,
  theme,
}: {
  onClose: () => void;
  onCreate: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'>) => void;
  fontSize: number;
  spacing: number;
  theme: ReturnType<typeof getContrastTheme>;
}) {
  const insets = useSafeAreaInsets();
  const interfaceMode = useAccessibilityStore((s) => s.preferences.interfaceMode);
  const allowMandatory = interfaceMode === 'advanced';
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [mandatoryVerification, setMandatoryVerification] = useState(false);
  const [dueDateInput, setDueDateInput] = useState('');
  const [stepRows, setStepRows] = useState<{ title: string; description: string }[]>([]);

  const submit = () => {
    if (!title.trim()) return;
    const due = parseOptionalDueDate(dueDateInput);
    const mandatory = allowMandatory && mandatoryVerification;
    const taskSteps: TaskStep[] = stepRows
      .filter((r) => r.title.trim())
      .map((r, index) => ({
        id: `step-${Date.now()}-${index}`,
        title: r.title.trim(),
        description: r.description.trim() || undefined,
        completed: false,
        order: index + 1,
      }));
    onCreate({
      title: title.trim(),
      description: description.trim() || undefined,
      category: category.trim() || undefined,
      steps: taskSteps,
      mandatoryVerification: mandatory,
      tutorVerificationStatus: 'none',
      dueDate: due,
    });
  };

  const inputStyle = [
    styles.input,
    {
      fontSize,
      minHeight: 52,
      borderColor: theme.inputBorder,
      backgroundColor: theme.inputBg,
      color: theme.inputText,
    },
  ];

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalKeyboardRoot}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalOverlay}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={[
                styles.modalContent,
                { paddingBottom: Math.max(insets.bottom, 20), backgroundColor: theme.cardBg },
              ]}
            >
              <Text style={[styles.modalTitle, { fontSize: fontSize + 6, color: theme.textPrimary }]}>
                Criar Nova Tarefa
              </Text>
              <TextInput
                style={inputStyle}
                placeholder="Título da Tarefa *"
                value={title}
                onChangeText={setTitle}
                placeholderTextColor={theme.placeholder}
              />
              <TextInput
                style={[inputStyle, { height: 90, textAlignVertical: 'top' }]}
                placeholder="Descrição (opcional)"
                value={description}
                onChangeText={setDescription}
                multiline
                placeholderTextColor={theme.placeholder}
              />
              <TextInput
                style={inputStyle}
                placeholder="Categoria (opcional)"
                value={category}
                onChangeText={setCategory}
                placeholderTextColor={theme.placeholder}
              />
              <TextInput
                style={inputStyle}
                placeholder="Prazo opcional: AAAA-MM-DD"
                value={dueDateInput}
                onChangeText={setDueDateInput}
                placeholderTextColor={theme.placeholder}
                keyboardType="numbers-and-punctuation"
                accessibilityLabel="Data limite da tarefa opcional"
                accessibilityHint="Formato ano mês dia com traços, por exemplo 2025-12-25"
              />
              <Text style={[styles.dueHint, { fontSize: fontSize - 2, color: theme.hint }]}>
                Se preencher, o app pode lembrar às 9h desse dia (com notificações ativas).
              </Text>

              <Text style={[styles.stepsLabel, { fontSize, color: theme.textPrimary, marginTop: 8 }]}>
                Passos da tarefa (opcional)
              </Text>
              <Text style={[styles.dueHint, { fontSize: fontSize - 2, color: theme.hint, marginBottom: 8 }]}>
                Divida em pequenas etapas: faça uma de cada vez e marque ao concluir na lista.
              </Text>
              {stepRows.map((row, index) => (
                <View key={index} style={{ marginBottom: 12 }}>
                  <TextInput
                    style={inputStyle}
                    placeholder={`Passo ${index + 1} — título`}
                    value={row.title}
                    onChangeText={(t) => {
                      const next = [...stepRows];
                      next[index] = { ...next[index], title: t };
                      setStepRows(next);
                    }}
                    placeholderTextColor={theme.placeholder}
                  />
                  <TextInput
                    style={[inputStyle, { minHeight: 44 }]}
                    placeholder="Detalhe deste passo (opcional)"
                    value={row.description}
                    onChangeText={(t) => {
                      const next = [...stepRows];
                      next[index] = { ...next[index], description: t };
                      setStepRows(next);
                    }}
                    placeholderTextColor={theme.placeholder}
                  />
                </View>
              ))}
              <SmartButton
                id="btn_add_step_create"
                label="➕  Adicionar passo"
                onPress={() => setStepRows([...stepRows, { title: '', description: '' }])}
                variant="secondary"
                minHeight={48}
                style={{ marginBottom: 12 }}
              />

              <View style={styles.switchRow}>
                <Text style={{ flex: 1, fontSize, color: theme.textPrimary, fontWeight: '600' }}>
                  Tarefa obrigatória (tutor confirma a conclusão)
                </Text>
                <Switch
                  value={allowMandatory ? mandatoryVerification : false}
                  onValueChange={allowMandatory ? setMandatoryVerification : () => {}}
                  disabled={!allowMandatory}
                  trackColor={{ false: '#cbd5e1', true: '#c7d2fe' }}
                  thumbColor={mandatoryVerification && allowMandatory ? '#6366f1' : '#f8fafc'}
                />
              </View>
              {!allowMandatory ? (
                <Text style={[styles.dueHint, { fontSize: fontSize - 2, color: theme.hint }]}>
                  No modo simples esta opção fica desligada. Ative o modo avançado em Personalização
                  para usar confirmação do tutor.
                </Text>
              ) : null}
              <View style={[styles.buttonRow, { marginTop: spacing }]}>
                <SmartButton id="btn_cancel_create" label="Cancelar" onPress={onClose} variant="secondary" />
                <SmartButton id="btn_confirm_create" label="✓  Criar Tarefa" onPress={submit} variant="success" />
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function TaskHistoryModal({
  tasks,
  onClose,
  fontSize,
  spacing,
  theme,
}: {
  tasks: Task[];
  onClose: () => void;
  fontSize: number;
  spacing: number;
  theme: ReturnType<typeof getContrastTheme>;
}) {
  const completed = [...tasks]
    .filter((t) => t.completed)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const insets = useSafeAreaInsets();

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalKeyboardRoot}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                maxHeight: '85%',
                paddingBottom: Math.max(insets.bottom, 16),
                backgroundColor: theme.cardBg,
              },
            ]}
          >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { fontSize: fontSize + 4, color: theme.textPrimary }]}>
              Histórico
            </Text>
            <SmartButton id="btn_close_history" label="Fechar" onPress={onClose} variant="secondary" minHeight={44} />
          </View>
          <ScrollView keyboardShouldPersistTaps="handled">
            {completed.length === 0 ? (
              <Text style={[styles.emptyText, { fontSize, marginTop: spacing, color: theme.textSecondary }]}>
                Nenhuma tarefa concluída ainda.
              </Text>
            ) : (
              completed.map((task) => (
                <View key={task.id} style={styles.historyItem}>
                  <Text style={[styles.historyTitle, { fontSize: fontSize + 2 }]}>
                    ✓ {task.title}
                  </Text>
                  {task.updatedAt && (
                    <Text style={{ fontSize: fontSize - 2, color: '#065f46' }}>
                      {format(new Date(task.updatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </Text>
                  )}
                </View>
              ))
            )}
          </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Prazo no formato AAAA-MM-DD (calendário local). */
function parseOptionalDueDate(s: string): Date | undefined {
  const t = s.trim();
  if (!t) return undefined;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
  if (!m) return undefined;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!y || mo < 1 || mo > 12 || d < 1 || d > 31) return undefined;
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return undefined;
  return dt;
}

function getFontSize(pref: string) {
  const map: Record<string, number> = { small: 14, medium: 16, large: 20, 'extra-large': 24 };
  return map[pref] ?? 16;
}

function getSpacing(pref: string) {
  const map: Record<string, number> = { compact: 8, normal: 16, comfortable: 24, spacious: 32 };
  return map[pref] ?? 16;
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: { flex: 1 },
  elderBanner: {
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  elderBannerTitle: { fontWeight: '800', marginBottom: 6 },
  elderBannerBody: { lineHeight: 22, marginBottom: 8 },
  elderBannerDismiss: { fontWeight: '600' },
  title: { fontWeight: '800' },
  summaryTitle: { fontWeight: '800', marginBottom: 10 },
  summaryLine: { marginBottom: 6 },
  buttonRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  emptyBox: { alignItems: 'center', padding: 32, gap: 16 },
  emptyText: { textAlign: 'center' },
  cardTitle: { fontWeight: '700', marginBottom: 4 },
  cardDesc: { marginBottom: 4 },
  cardDate: { marginBottom: 6 },
  mandatoryBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badgeText: { fontSize: 13 },
  stepsLabel: { fontWeight: '600', marginBottom: 6 },
  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: '#0d9488' },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  stepCheck: { fontSize: 20 },
  stepText: { flex: 1 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    paddingVertical: 8,
  },
  strikethrough: { textDecorationLine: 'line-through', color: '#94a3b8' },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  dueHint: { marginBottom: 12, lineHeight: 20 },
  modalKeyboardRoot: { flex: 1 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 28,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontWeight: '800', marginBottom: 16 },
  historyItem: {
    backgroundColor: '#f0fdfa',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#99f6e4',
    borderLeftWidth: 4,
    borderLeftColor: '#0d9488',
  },
  historyTitle: { fontWeight: '700', color: '#115e59', marginBottom: 4 },
});
