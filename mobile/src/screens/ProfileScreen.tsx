import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  TextInput,
  TouchableOpacity,
  Linking,
  Platform,
  Alert,
  AccessibilityInfo,
} from 'react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useAccessibilityStore } from '../store/accessibilityStore';
import { useAccessibilityContext } from '../context/AccessibilityContext';
import { useLatencyDetector } from '../hooks/useLatencyDetector';
import { SmartButton } from '../components/SmartButton';
import { ASSISTANT_IDS, CRITICAL_ACTIONS } from '../data/mockAssistantData';
import { getContrastTheme } from '../theme/contrastTheme';
import { useTrustContactStore, phoneToDialString } from '../store/trustContactStore';
import { clearAllLocalAppData } from '../storage/clearAppStorage';

export function ProfileScreen() {
  const preferences = useAccessibilityStore((s) => s.preferences);
  const theme = getContrastTheme(preferences.contrast);
  const { requestTutorApproval } = useAccessibilityContext();
  const trustName = useTrustContactStore((s) => s.name);
  const trustPhone = useTrustContactStore((s) => s.phone);
  const setTrustContact = useTrustContactStore((s) => s.setTrustContact);
  const [draftTrustName, setDraftTrustName] = useState(trustName);
  const [draftTrustPhone, setDraftTrustPhone] = useState(trustPhone);

  useEffect(() => {
    setDraftTrustName(trustName);
    setDraftTrustPhone(trustPhone);
  }, [trustName, trustPhone]);
  const { onUserInteraction } = useLatencyDetector({
    screenName: 'ProfileScreen',
    uiElements: [
      { id: ASSISTANT_IDS.BTN_SAVE_PROFILE, label: 'Salvar Preferências' },
    ],
    userContext: 'Tela de perfil do usuário',
  });

  const fontSize = getFontSize(preferences.fontSize);
  const spacing = getSpacing(preferences.spacing);

  // Simula dados do usuário (em produção viria de um serviço)
  const userData = {
    name: 'Usuário SeniorEase',
    email: 'usuario@seniorease.com',
    memberSince: new Date('2024-01-01'),
  };

  const handleSaveProfile = () => {
    requestTutorApproval(CRITICAL_ACTIONS.SAVE_PROFILE, () => {
      // Aqui salvaria de verdade
    });
  };

  const confirmClearLocalData = () => {
    Alert.alert(
      'Limpar dados neste telemóvel?',
      'Serão apagadas tarefas, tutores, contacto de apoio, preferências e o estado do primeiro arranque. Os lembretes de prazo agendados também são cancelados. O app vai reiniciar.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar tudo',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              const reloaded = await clearAllLocalAppData();
              if (!reloaded) {
                Alert.alert(
                  'Reinicie o app',
                  'Os dados foram apagados. Feche o SeniorEase por completo e abra de novo.'
                );
              }
            })();
          },
        },
      ]
    );
  };

  const saveTrustContact = () => {
    setTrustContact(draftTrustName, draftTrustPhone);
    AccessibilityInfo.announceForAccessibility('Contato de apoio guardado');
    Alert.alert('Guardado', 'O contato de apoio foi atualizado.');
  };

  const dial = phoneToDialString(draftTrustPhone || trustPhone);

  const openCall = async () => {
    if (!dial) {
      Alert.alert('Telefone em falta', 'Preencha e guarde o número do contato de apoio primeiro.');
      return;
    }
    const url = `tel:${dial}`;
    const ok = await Linking.canOpenURL(url);
    if (!ok) {
      Alert.alert('Não foi possível ligar', 'Este aparelho não suporta chamadas com este número.');
      return;
    }
    await Linking.openURL(url);
  };

  const openSms = async () => {
    if (!dial) {
      Alert.alert('Telefone em falta', 'Preencha e guarde o número do contato de apoio primeiro.');
      return;
    }
    const body = encodeURIComponent('Olá, preciso de ajuda com o app SeniorEase.');
    const sep = Platform.OS === 'ios' ? '&' : '?';
    const url = `sms:${dial}${sep}body=${body}`;
    const ok = await Linking.canOpenURL(url);
    if (!ok) {
      Alert.alert('Mensagem', 'Não foi possível abrir o SMS neste aparelho.');
      return;
    }
    await Linking.openURL(url);
  };

  const inputTrustStyle = [
    styles.trustInput,
    {
      fontSize,
      borderColor: theme.inputBorder,
      backgroundColor: theme.inputBg,
      color: theme.inputText,
    },
  ];

  return (
    <TouchableWithoutFeedback onPress={onUserInteraction} accessible={false}>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.screenBg }]}
        contentContainerStyle={{ padding: spacing }}
        onScrollBeginDrag={onUserInteraction}
        onTouchStart={onUserInteraction}
        keyboardShouldPersistTaps="handled"
      >
        <Text
          style={[
            styles.title,
            { fontSize: fontSize + 8, marginBottom: spacing * 1.5, color: theme.textPrimary },
          ]}
        >
          Meu Perfil
        </Text>

        {/* ── Informações pessoais ── */}
        <View
          style={[
            styles.section,
            {
              padding: spacing,
              marginBottom: spacing,
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { fontSize: fontSize + 4, color: theme.sectionTitle }]}>
            Informações Pessoais
          </Text>
          <InfoRow label="Nome" value={userData.name} fontSize={fontSize} spacing={spacing} theme={theme} />
          <InfoRow label="E-mail" value={userData.email} fontSize={fontSize} spacing={spacing} theme={theme} />
          <InfoRow
            label="Membro desde"
            value={format(userData.memberSince, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            fontSize={fontSize}
            spacing={spacing}
            theme={theme}
          />
        </View>

        {/* ── Configurações de acessibilidade ── */}
        <View
          style={[
            styles.section,
            {
              padding: spacing,
              marginBottom: spacing,
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { fontSize: fontSize + 4, color: theme.sectionTitle }]}>
            Configurações de Acessibilidade
          </Text>
          <InfoRow label="Tamanho da Fonte" value={labelFontSize(preferences.fontSize)} fontSize={fontSize} spacing={spacing} theme={theme} />
          <InfoRow label="Contraste" value={labelContrast(preferences.contrast)} fontSize={fontSize} spacing={spacing} theme={theme} />
          <InfoRow label="Espaçamento" value={labelSpacing(preferences.spacing)} fontSize={fontSize} spacing={spacing} theme={theme} />
          <InfoRow
            label="Modo de Interface"
            value={preferences.interfaceMode === 'basic' ? 'Modo Básico' : 'Modo Avançado'}
            fontSize={fontSize}
            spacing={spacing}
            theme={theme}
          />
          <InfoRow
            label="Feedback Reforçado"
            value={preferences.enhancedFeedback ? '✓ Ativado' : 'Desativado'}
            fontSize={fontSize}
            spacing={spacing}
            theme={theme}
          />
          <InfoRow
            label="Confirmações Extras"
            value={preferences.extraConfirmations ? '✓ Ativado' : 'Desativado'}
            fontSize={fontSize}
            spacing={spacing}
            theme={theme}
          />
          <InfoRow
            label="Reduzir movimento"
            value={(preferences.reduceMotion ?? false) ? '✓ Ativado' : 'Desativado'}
            fontSize={fontSize}
            spacing={spacing}
            theme={theme}
          />
          <Text style={[styles.hint, { fontSize: fontSize - 2, color: theme.hint }]}>
            💡 Para alterar, acesse a aba "Personalização".
          </Text>
        </View>

        {/* ── Contato de apoio ── */}
        <View
          style={[
            styles.section,
            {
              padding: spacing,
              marginBottom: spacing,
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { fontSize: fontSize + 4, color: theme.sectionTitle }]}>
            Contato de apoio
          </Text>
          <Text style={[styles.hint, { fontSize: fontSize - 2, color: theme.hint, marginBottom: spacing }]}>
            Pessoa de confiança para ligar ou enviar mensagem com um toque (filho, tutor, etc.).
          </Text>
          <Text style={[styles.infoLabel, { fontSize: fontSize + 1, color: theme.textSecondary }]}>
            Nome
          </Text>
          <TextInput
            style={inputTrustStyle}
            value={draftTrustName}
            onChangeText={setDraftTrustName}
            placeholder="Ex.: Maria (filha)"
            placeholderTextColor={theme.placeholder}
            accessibilityLabel="Nome do contato de apoio"
          />
          <Text style={[styles.infoLabel, { fontSize: fontSize + 1, color: theme.textSecondary }]}>
            Telefone
          </Text>
          <TextInput
            style={inputTrustStyle}
            value={draftTrustPhone}
            onChangeText={setDraftTrustPhone}
            placeholder="Ex.: 11999999999 ou +5511999999999"
            placeholderTextColor={theme.placeholder}
            keyboardType="phone-pad"
            accessibilityLabel="Telefone do contato de apoio"
            accessibilityHint="Inclua o código de área"
          />
          <SmartButton
            id="btn_save_trust_contact"
            label="💾  Guardar contato"
            onPress={() => { onUserInteraction(); saveTrustContact(); }}
            variant="primary"
            style={{ marginTop: spacing * 0.5, marginBottom: spacing }}
            accessibilityHint="Memoriza o nome e o telefone neste aparelho"
          />
          <View style={styles.trustActions}>
            <TouchableOpacity
              style={[styles.trustActionBtn, { backgroundColor: '#0d9488' }]}
              onPress={() => { onUserInteraction(); void openCall(); }}
              accessibilityRole="button"
              accessibilityLabel="Ligar para o contato de apoio"
            >
              <Text style={styles.trustActionText}>📞  Ligar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.trustActionBtn, { backgroundColor: '#6366f1' }]}
              onPress={() => { onUserInteraction(); void openSms(); }}
              accessibilityRole="button"
              accessibilityLabel="Enviar mensagem de texto ao contato de apoio"
            >
              <Text style={styles.trustActionText}>💬  SMS</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Preferências de lembretes ── */}
        <View
          style={[
            styles.section,
            {
              padding: spacing,
              marginBottom: spacing,
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { fontSize: fontSize + 4, color: theme.sectionTitle }]}>
            Preferências de Lembretes
          </Text>
          <InfoRow
            label="Lembretes"
            value={preferences.reminderPreferences.enabled ? '✓ Ativados' : 'Desativados'}
            fontSize={fontSize}
            spacing={spacing}
            theme={theme}
          />
          {preferences.reminderPreferences.enabled && (
            <InfoRow
              label="Frequência"
              value={labelFrequency(preferences.reminderPreferences.frequency)}
              fontSize={fontSize}
              spacing={spacing}
              theme={theme}
            />
          )}
        </View>

        {/* ── Limpar cache / dados locais ── */}
        <View
          style={[
            styles.section,
            {
              padding: spacing,
              marginBottom: spacing,
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { fontSize: fontSize + 4, color: theme.sectionTitle }]}>
            Dados e cache
          </Text>
          <Text style={[styles.hint, { fontSize: fontSize - 2, color: theme.hint, marginBottom: spacing }]}>
            Apaga tudo o que está guardado neste aparelho (não afeta servidores na Internet). Útil antes de
            emprestar o telemóvel ou para recomeçar do zero.
          </Text>
          <SmartButton
            id="btn_clear_local_data"
            label="🗑️  Limpar dados e cache"
            onPress={() => { onUserInteraction(); confirmClearLocalData(); }}
            variant="danger"
            accessibilityHint="Remove tarefas, preferências e reinicia o aplicativo"
          />
        </View>

        {/* ── Botão Salvar (ação crítica) ── */}
        <SmartButton
          id={ASSISTANT_IDS.BTN_SAVE_PROFILE}
          label="💾  Salvar Perfil"
          onPress={() => { onUserInteraction(); handleSaveProfile(); }}
          variant="primary"
          style={{ marginBottom: spacing * 2 }}
          accessibilityHint="Pedir confirmação do tutor para guardar alterações do perfil"
        />
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

function InfoRow({
  label,
  value,
  fontSize,
  spacing,
  theme,
}: {
  label: string;
  value: string;
  fontSize: number;
  spacing: number;
  theme: ReturnType<typeof getContrastTheme>;
}) {
  return (
    <View style={{ marginBottom: spacing * 0.8 }}>
      <Text style={[styles.infoLabel, { fontSize: fontSize + 1, color: theme.textSecondary }]}>
        {label}
      </Text>
      <Text style={[styles.infoValue, { fontSize, color: theme.textMuted }]}>{value}</Text>
    </View>
  );
}

// ─── Helpers de label ─────────────────────────────────────────────────────────

function labelFontSize(v: string) {
  return ({ small: 'Pequeno', medium: 'Médio', large: 'Grande', 'extra-large': 'Muito Grande' } as Record<string, string>)[v] ?? v;
}
function labelContrast(v: string) {
  return (
    {
      normal: 'Normal',
      high: 'Alto',
      'very-high': 'Muito Alto',
    } as Record<string, string>
  )[v] ?? v;
}
function labelSpacing(v: string) {
  return ({ compact: 'Compacto', normal: 'Normal', comfortable: 'Confortável', spacious: 'Espaçoso' } as Record<string, string>)[v] ?? v;
}
function labelFrequency(v: string) {
  return ({ daily: 'Diário', weekly: 'Semanal', custom: 'Personalizado' } as Record<string, string>)[v] ?? v;
}
function getFontSize(pref: string) {
  return ({ small: 14, medium: 16, large: 20, 'extra-large': 24 } as Record<string, number>)[pref] ?? 16;
}
function getSpacing(pref: string) {
  return ({ compact: 8, normal: 16, comfortable: 24, spacious: 32 } as Record<string, number>)[pref] ?? 16;
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontWeight: '800', textAlign: 'center' },
  section: {
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: { fontWeight: '700', marginBottom: 12 },
  infoLabel: { fontWeight: '600' },
  infoValue: { marginTop: 2 },
  hint: { marginTop: 8, fontStyle: 'italic' },
  trustInput: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    minHeight: 52,
  },
  trustActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  trustActionBtn: {
    flex: 1,
    minWidth: 140,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  trustActionText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
