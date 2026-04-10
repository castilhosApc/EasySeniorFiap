import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useAccessibilityStore } from '../store/accessibilityStore';
import { useTutorStore } from '../store/tutorStore';
import { loadTasksFromStorage, saveTasksToStorage } from '../storage/tasksStorage';
import { getContrastTheme } from '../theme/contrastTheme';
import { Task } from '@/shared/domain/entities/Task';
import { useFocusEffect } from '@react-navigation/native';

import {
  simulateTutorApprovalNotification,
  simulateElderTaskReminderNotification,
} from '../services/simulatedNotifications';
import { useElderInboxStore } from '../store/elderInboxStore';
import { useLatencyDetector } from '../hooks/useLatencyDetector';
import { SmartButton } from '../components/SmartButton';
import { ASSISTANT_IDS } from '../data/mockAssistantData';

export function TutorScreen() {
  const preferences = useAccessibilityStore((s) => s.preferences);
  const theme = getContrastTheme(preferences.contrast);
  const fontSize = getFontSize(preferences.fontSize);
  const spacing = getSpacing(preferences.spacing);

  const tutors = useTutorStore((s) => s.tutors);
  const pendingItems = useTutorStore((s) => s.pendingItems);
  const addTutor = useTutorStore((s) => s.addTutor);
  const removeTutor = useTutorStore((s) => s.removeTutor);
  const setPrimaryTutor = useTutorStore((s) => s.setPrimaryTutor);
  const dismissPending = useTutorStore((s) => s.dismissPending);
  const reminderHistory = useTutorStore((s) => s.reminderHistory ?? []);
  const logReminderSent = useTutorStore((s) => s.logReminderSent);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const reloadTasks = useCallback(async () => {
    setTasks(await loadTasksFromStorage());
  }, []);

  useFocusEffect(
    useCallback(() => {
      reloadTasks();
    }, [reloadTasks])
  );

  const openPendingCount = pendingItems.filter((p) => p.status === 'open').length;
  const tutorCopilotHints = useMemo(
    () => ({ openPendingCount }),
    [openPendingCount]
  );

  const { onUserInteraction } = useLatencyDetector({
    screenName: 'TutorScreen',
    uiElements: [{ id: ASSISTANT_IDS.BTN_TUTOR_AJUDA, label: 'O que é esta aba?' }],
    userContext: 'Área do tutor: aprovações e lembretes simulados',
    hints: tutorCopilotHints,
  });

  const persistTasks = async (next: Task[]) => {
    setTasks(next);
    await saveTasksToStorage(next);
  };

  const toggleMandatory = async (taskId: string, value: boolean) => {
    const next = tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            mandatoryVerification: value,
            tutorVerificationStatus: value ? t.tutorVerificationStatus ?? 'none' : 'none',
            updatedAt: new Date(),
          }
        : t
    );
    await persistTasks(next);
  };

  const handleApproveMandatory = async (taskId: string, pendingId: string) => {
    const next = tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            completed: true,
            steps: t.steps.map((s) => ({ ...s, completed: true })),
            tutorVerificationStatus: 'approved' as const,
            updatedAt: new Date(),
          }
        : t
    );
    await persistTasks(next);
    dismissPending(pendingId);
    Alert.alert('Confirmado', 'A tarefa foi marcada como concluída para o idoso.');
  };

  const handleRejectMandatory = async (taskId: string, pendingId: string) => {
    const next = tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            completed: false,
            tutorVerificationStatus: 'none' as const,
            updatedAt: new Date(),
          }
        : t
    );
    await persistTasks(next);
    dismissPending(pendingId);
    Alert.alert('Recusado', 'O idoso poderá tentar concluir novamente depois.');
  };

  const openItems = pendingItems.filter((p) => p.status === 'open');

  const incompleteForReminder = tasks.filter(
    (t) => !t.completed && t.tutorVerificationStatus !== 'pending'
  );

  const sendReminderToElder = async (task: Task) => {
    const sent = await simulateElderTaskReminderNotification(task.title);
    if (!sent) return;
    useElderInboxStore.getState().showBanner(
      'Lembrete do tutor',
      `Não esqueça de concluir: “${task.title}”.`
    );
    logReminderSent(task.id, task.title);
    Alert.alert('Lembrete enviado', 'Uma notificação foi disparada neste aparelho (simulação). Veja também o aviso na aba Tarefas.');
  };

  const sendApprovalPushSimulation = async (taskId: string, displayTitle: string) => {
    const ok = await simulateTutorApprovalNotification(displayTitle, taskId);
    if (ok) {
      Alert.alert(
        'Notificação simulada',
        'Um alerta de sistema pedindo aprovação da baixa foi enviado neste aparelho (como se o tutor recebesse um push).'
      );
    }
  };

  const inputStyle = [
    styles.input,
    {
      fontSize,
      minHeight: 48,
      borderColor: theme.inputBorder,
      backgroundColor: theme.inputBg,
      color: theme.inputText,
    },
  ];

  return (
    <TouchableWithoutFeedback onPress={onUserInteraction} accessible={false}>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.screenBg }]}
        contentContainerStyle={{ padding: spacing, paddingBottom: spacing * 2 }}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={onUserInteraction}
        onTouchStart={onUserInteraction}
      >
        <Text style={[styles.title, { fontSize: fontSize + 8, color: theme.textPrimary }]}>
          Área do Tutor
        </Text>
        <Text style={[styles.subtitle, { fontSize, color: theme.textSecondary }]}>
          Simulação local: cadastre tutores e acompanhe pedidos do idoso. Sem servidor, tudo fica neste aparelho.
        </Text>
        <SmartButton
          id={ASSISTANT_IDS.BTN_TUTOR_AJUDA}
          label="❓  O que é esta aba?"
          variant="secondary"
          onPress={() => {
            onUserInteraction();
            Alert.alert(
              'Área do Tutor',
              'Aqui você cadastra tutores, vê pedidos de aprovação de tarefas, envia lembretes ao idoso e ajusta tarefas obrigatórias. Tudo fica guardado neste celular até existir servidor.'
            );
          }}
          style={{ alignSelf: 'center', marginBottom: spacing }}
        />

        {/* Cadastro */}
        <Section title="Perfis de tutor" theme={theme} fontSize={fontSize} spacing={spacing}>
          <Text style={{ fontSize, color: theme.textSecondary, marginBottom: 8 }}>
            Quem “recebe” as notificações simuladas (defina o principal).
          </Text>
          <TextInput
            style={inputStyle}
            placeholder="Nome do tutor *"
            placeholderTextColor={theme.placeholder}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={inputStyle}
            placeholder="Telefone (opcional)"
            placeholderTextColor={theme.placeholder}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <TextInput
            style={inputStyle}
            placeholder="E-mail (opcional)"
            placeholderTextColor={theme.placeholder}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: '#6366f1' }]}
            onPress={() => {
              addTutor(name, phone, email);
              setName('');
              setPhone('');
              setEmail('');
            }}
            accessibilityRole="button"
            accessibilityLabel="Adicionar tutor"
          >
            <Text style={styles.primaryBtnText}>➕ Adicionar tutor</Text>
          </TouchableOpacity>

          {tutors.length === 0 ? (
            <Text style={{ fontSize, color: theme.textMuted, marginTop: 12 }}>Nenhum tutor cadastrado.</Text>
          ) : (
            tutors.map((t) => (
              <View
                key={t.id}
                style={[
                  styles.tutorCard,
                  { borderColor: theme.cardBorder, backgroundColor: theme.cardBg },
                ]}
              >
                <Text style={{ fontSize: fontSize + 1, fontWeight: '700', color: theme.textPrimary }}>
                  {t.name} {t.isPrimary ? '★ (principal)' : ''}
                </Text>
                {t.phone ? <Text style={{ fontSize, color: theme.textSecondary }}>📞 {t.phone}</Text> : null}
                {t.email ? <Text style={{ fontSize, color: theme.textSecondary }}>✉️ {t.email}</Text> : null}
                <View style={styles.tutorActions}>
                  {!t.isPrimary && (
                    <TouchableOpacity onPress={() => setPrimaryTutor(t.id)} style={styles.linkBtn}>
                      <Text style={styles.linkBtnText}>Definir como principal</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert('Remover tutor?', `Remover ${t.name}?`, [
                        { text: 'Cancelar', style: 'cancel' },
                        { text: 'Remover', style: 'destructive', onPress: () => removeTutor(t.id) },
                      ]);
                    }}
                    style={styles.linkBtn}
                  >
                    <Text style={[styles.linkBtnText, { color: '#dc2626' }]}>Remover</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </Section>

        {/* Fila simulada */}
        <Section title="Pedidos e aprovações" theme={theme} fontSize={fontSize} spacing={spacing}>
          <Text style={{ fontSize, color: theme.textSecondary, marginBottom: 12 }}>
            Quando o idoso pede baixa de tarefa obrigatória, o pedido aparece aqui. Use o sino para simular a
            notificação de aprovação no aparelho (push local).
          </Text>
          {openItems.length === 0 ? (
            <Text style={{ fontSize, color: theme.textMuted }}>Nada pendente no momento.</Text>
          ) : (
            openItems.map((p) => (
              <View
                key={p.id}
                style={[
                  styles.pendingCard,
                  { borderColor: theme.cardBorder, backgroundColor: theme.cardBg },
                ]}
              >
                <Text style={[styles.badge, { color: theme.badgeText }]}>
                  {p.type === 'critical_action' ? '🔐 Ação crítica' : '📋 Tarefa obrigatória'}
                </Text>
                <Text style={{ fontSize: fontSize + 1, fontWeight: '700', color: theme.textPrimary, marginTop: 6 }}>
                  {p.title}
                </Text>
                {p.detail ? (
                  <Text style={{ fontSize, color: theme.textSecondary, marginTop: 4 }}>{p.detail}</Text>
                ) : null}
                <Text style={{ fontSize: fontSize - 2, color: theme.textMuted, marginTop: 6 }}>
                  {format(new Date(p.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </Text>
                {p.type === 'mandatory_task_completion' && p.taskId ? (
                  <View style={styles.rowGap}>
                    <TouchableOpacity
                      style={[styles.smallBtn, { backgroundColor: '#7c2d12' }]}
                      onPress={() => {
                        const t = tasks.find((x) => x.id === p.taskId);
                        const title = t?.title ?? p.title.replace(/^Conclusão pendente: /, '');
                        sendApprovalPushSimulation(p.taskId!, title);
                      }}
                    >
                      <Text style={styles.smallBtnText}>🔔 Simular notificação de aprovação</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.smallBtn, { backgroundColor: '#10b981' }]}
                      onPress={() => handleApproveMandatory(p.taskId!, p.id)}
                    >
                      <Text style={styles.smallBtnText}>✓ Confirmar baixa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.smallBtn, { backgroundColor: '#dc2626' }]}
                      onPress={() => handleRejectMandatory(p.taskId!, p.id)}
                    >
                      <Text style={styles.smallBtnText}>✕ Recusar</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.smallBtn, { backgroundColor: '#6b7280', marginTop: 10 }]}
                    onPress={() => dismissPending(p.id)}
                  >
                    <Text style={styles.smallBtnText}>Marcar como visto</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </Section>

        {/* Acompanhar + lembretes */}
        <Section title="Acompanhar tarefas e lembrar o idoso" theme={theme} fontSize={fontSize} spacing={spacing}>
          <Text style={{ fontSize, color: theme.textSecondary, marginBottom: 12 }}>
            Tarefas ainda não concluídas (fora de “aguardando tutor”). Envie um lembrete por notificação neste
            aparelho.
          </Text>
          {incompleteForReminder.length === 0 ? (
            <Text style={{ fontSize, color: theme.textMuted }}>Nenhuma tarefa pendente para lembrete.</Text>
          ) : (
            incompleteForReminder.map((task) => (
              <View
                key={task.id}
                style={[
                  styles.taskRow,
                  { borderColor: theme.cardBorder, backgroundColor: theme.screenBg },
                ]}
              >
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={{ fontSize, fontWeight: '600', color: theme.textPrimary }} numberOfLines={2}>
                    {task.title}
                  </Text>
                  {task.mandatoryVerification ? (
                    <Text style={{ fontSize: fontSize - 2, color: theme.textMuted }}>Obrigatória (baixa pelo tutor)</Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  style={[styles.smallBtn, { backgroundColor: '#ea580c' }]}
                  onPress={() => sendReminderToElder(task)}
                >
                  <Text style={styles.smallBtnText}>📣 Lembrete</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </Section>

        {reminderHistory.length > 0 ? (
          <Section title="Lembretes enviados (histórico)" theme={theme} fontSize={fontSize} spacing={spacing}>
            {reminderHistory.slice(0, 15).map((h) => (
              <Text
                key={h.id}
                style={{ fontSize, color: theme.textSecondary, marginBottom: 8 }}
              >
                • {h.taskTitle}{' '}
                <Text style={{ color: theme.textMuted }}>
                  — {format(new Date(h.sentAt), "dd/MM HH:mm", { locale: ptBR })}
                </Text>
              </Text>
            ))}
          </Section>
        ) : null}

        {/* Obrigatoriedade por tarefa */}
        <Section title="Verificação obrigatória por tarefa" theme={theme} fontSize={fontSize} spacing={spacing}>
          <Text style={{ fontSize, color: theme.textSecondary, marginBottom: 12 }}>
            O tutor define se a conclusão precisa ser confirmada por você. (Tarefas pendentes de confirmação aparecem acima.)
          </Text>
          {tasks.length === 0 ? (
            <Text style={{ fontSize, color: theme.textMuted }}>Nenhuma tarefa. Crie na aba Tarefas.</Text>
          ) : (
            tasks.map((task) => (
              <View
                key={task.id}
                style={[
                  styles.taskRow,
                  { borderColor: theme.cardBorder, backgroundColor: theme.cardBg },
                ]}
              >
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={{ fontSize, fontWeight: '600', color: theme.textPrimary }} numberOfLines={2}>
                    {task.title}
                  </Text>
                  <Text style={{ fontSize: fontSize - 2, color: theme.textMuted }}>
                    {task.tutorVerificationStatus === 'pending' ? '⏳ Aguardando sua confirmação' : ' '}
                  </Text>
                </View>
                <Switch
                  value={Boolean(task.mandatoryVerification)}
                  onValueChange={(v) => toggleMandatory(task.id, v)}
                  trackColor={{ false: '#cbd5e1', true: '#c7d2fe' }}
                  thumbColor={task.mandatoryVerification ? '#6366f1' : '#f8fafc'}
                  accessibilityLabel={`Obrigatória: ${task.title}`}
                />
              </View>
            ))
          )}
        </Section>

        <Section title="Dica" theme={theme} fontSize={fontSize} spacing={spacing}>
          <Text style={{ fontSize, color: theme.textSecondary, lineHeight: 22 }}>
            Na primeira vez, o sistema pede permissão para notificações. Em Android, confira também as
            configurações do app se o alerta não aparecer.
          </Text>
        </Section>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

function Section({
  title,
  theme,
  fontSize,
  spacing,
  children,
}: {
  title: string;
  theme: ReturnType<typeof getContrastTheme>;
  fontSize: number;
  spacing: number;
  children: React.ReactNode;
}) {
  return (
    <View
      style={[
        styles.section,
        { padding: spacing, marginBottom: spacing, borderColor: theme.cardBorder, backgroundColor: theme.cardBg },
      ]}
    >
      <Text style={[styles.sectionTitle, { fontSize: fontSize + 2, color: theme.sectionTitle }]}>{title}</Text>
      {children}
    </View>
  );
}

function getFontSize(pref: string) {
  const map: Record<string, number> = { small: 14, medium: 16, large: 20, 'extra-large': 24 };
  return map[pref] ?? 16;
}

function getSpacing(pref: string) {
  const map: Record<string, number> = { compact: 8, normal: 16, comfortable: 24, spacious: 32 };
  return map[pref] ?? 16;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  subtitle: { textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  section: { borderRadius: 14, borderWidth: 1 },
  sectionTitle: { fontWeight: '700', marginBottom: 12 },
  input: {
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },
  primaryBtn: { borderRadius: 16, paddingVertical: 15, alignItems: 'center', marginTop: 4 },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  tutorCard: { borderWidth: 1, borderRadius: 12, padding: 14, marginTop: 10 },
  tutorActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10 },
  linkBtn: { paddingVertical: 4 },
  linkBtnText: { color: '#4f46e5', fontWeight: '600', fontSize: 15 },
  pendingCard: { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 12 },
  badge: { fontSize: 13, fontWeight: '700' },
  rowGap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  smallBtn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  smallBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
});
