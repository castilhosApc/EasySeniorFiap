import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { useAccessibilityStore } from '../store/accessibilityStore';
import { useLatencyDetector } from '../hooks/useLatencyDetector';
import { SmartButton } from '../components/SmartButton';
import { ASSISTANT_IDS } from '../data/mockAssistantData';
import {
  FontSize,
  ContrastLevel,
  SpacingLevel,
  InterfaceMode,
} from '@/shared/domain/entities/User';
import { getContrastTheme } from '../theme/contrastTheme';

export function PersonalizationScreen() {
  const preferences = useAccessibilityStore((s) => s.preferences);
  const theme = getContrastTheme(preferences.contrast);
  const updateFontSize = useAccessibilityStore((s) => s.updateFontSize);
  const updateContrast = useAccessibilityStore((s) => s.updateContrast);
  const updateSpacing = useAccessibilityStore((s) => s.updateSpacing);
  const updateInterfaceMode = useAccessibilityStore((s) => s.updateInterfaceMode);
  const toggleEnhancedFeedback = useAccessibilityStore((s) => s.toggleEnhancedFeedback);
  const toggleExtraConfirmations = useAccessibilityStore((s) => s.toggleExtraConfirmations);
  const toggleReduceMotion = useAccessibilityStore((s) => s.toggleReduceMotion);

  const isAdvanced = preferences.interfaceMode === 'advanced';

  const copilotHints = useMemo(
    () => ({
      fontSize: preferences.fontSize,
      contrast: preferences.contrast,
    }),
    [preferences.fontSize, preferences.contrast]
  );

  const { onUserInteraction } = useLatencyDetector({
    screenName: 'PersonalizationScreen',
    uiElements: [
      { id: ASSISTANT_IDS.BTN_FONTE_GRANDE, label: 'Fonte Grande' },
      { id: ASSISTANT_IDS.BTN_FONTE_EXTRA, label: 'Fonte Extra Grande' },
      { id: ASSISTANT_IDS.BTN_CONTRASTE_ALTO, label: 'Alto Contraste' },
    ],
    userContext: 'Tela de personalização de acessibilidade',
    hints: copilotHints,
  });

  const fontSize = getFontSize(preferences.fontSize);
  const spacing = getSpacing(preferences.spacing);

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
          accessibilityRole="header"
        >
          Personalização da Experiência
        </Text>

        {!isAdvanced ? (
          <Text
            style={[
              styles.basicHint,
              {
                fontSize: fontSize - 1,
                color: theme.textSecondary,
                marginBottom: spacing,
                padding: spacing,
                backgroundColor: theme.badgeBg,
                borderRadius: 14,
              },
            ]}
          >
            Modo simples: menos botões na barra inferior (sem aba Tutor) e só as opções essenciais
            abaixo. Ative &quot;Modo avançado&quot; para tutores, confirmações finas e animações.
          </Text>
        ) : null}

        {/* ── Tamanho da Fonte ── */}
        <Section title="Tamanho da Fonte" fontSize={fontSize} spacing={spacing} theme={theme}>
          <View style={styles.optionRow}>
            {(['small', 'medium', 'large', 'extra-large'] as FontSize[]).map((size) => (
              <SmartButton
                key={size}
                id={
                  size === 'large'
                    ? ASSISTANT_IDS.BTN_FONTE_GRANDE
                    : size === 'extra-large'
                    ? ASSISTANT_IDS.BTN_FONTE_EXTRA
                    : `btn_font_${size}`
                }
                label={
                  size === 'small'
                    ? 'Pequeno'
                    : size === 'medium'
                    ? 'Médio'
                    : size === 'large'
                    ? 'Grande'
                    : 'Muito Grande'
                }
                onPress={() => { onUserInteraction(); updateFontSize(size); }}
                variant={preferences.fontSize === size ? 'primary' : 'secondary'}
              />
            ))}
          </View>
        </Section>

        {/* ── Contraste ── */}
        <Section title="Nível de Contraste" fontSize={fontSize} spacing={spacing} theme={theme}>
          <View style={styles.optionRow}>
            {(['normal', 'high', 'very-high'] as ContrastLevel[]).map((level) => (
              <SmartButton
                key={level}
                id={level === 'high' ? ASSISTANT_IDS.BTN_CONTRASTE_ALTO : `btn_contrast_${level}`}
                label={level === 'normal' ? 'Normal' : level === 'high' ? 'Alto' : 'Muito Alto'}
                onPress={() => { onUserInteraction(); updateContrast(level); }}
                variant={preferences.contrast === level ? 'primary' : 'secondary'}
              />
            ))}
          </View>
        </Section>

        {/* ── Espaçamento ── */}
        <Section title="Espaçamento entre Elementos" fontSize={fontSize} spacing={spacing} theme={theme}>
          <View style={styles.optionRow}>
            {(['compact', 'normal', 'comfortable', 'spacious'] as SpacingLevel[]).map((level) => (
              <SmartButton
                key={level}
                id={`btn_spacing_${level}`}
                label={
                  level === 'compact'
                    ? 'Compacto'
                    : level === 'normal'
                    ? 'Normal'
                    : level === 'comfortable'
                    ? 'Confortável'
                    : 'Espaçoso'
                }
                onPress={() => { onUserInteraction(); updateSpacing(level); }}
                variant={preferences.spacing === level ? 'primary' : 'secondary'}
              />
            ))}
          </View>
        </Section>

        {/* ── Modo de Interface ── */}
        <Section title="Modo de Interface" fontSize={fontSize} spacing={spacing} theme={theme}>
          <View style={styles.optionRow}>
            {(['basic', 'advanced'] as InterfaceMode[]).map((mode) => (
              <SmartButton
                key={mode}
                id={`btn_mode_${mode}`}
                label={mode === 'basic' ? 'Modo Básico' : 'Modo Avançado'}
                onPress={() => { onUserInteraction(); updateInterfaceMode(mode); }}
                variant={preferences.interfaceMode === mode ? 'primary' : 'secondary'}
              />
            ))}
          </View>
        </Section>

        {isAdvanced ? (
          <>
            <Section title="Feedback Visual Reforçado" fontSize={fontSize} spacing={spacing} theme={theme}>
              <SmartButton
                id="btn_toggle_feedback"
                label={preferences.enhancedFeedback ? '✓  Ativado' : '  Desativado'}
                onPress={() => { onUserInteraction(); toggleEnhancedFeedback(); }}
                variant={preferences.enhancedFeedback ? 'success' : 'secondary'}
              />
              <Text style={[styles.hint, { fontSize: fontSize - 2, color: theme.hint }]}>
                Mensagens e sombras mais visíveis após cada ação.
              </Text>
            </Section>

            <Section title="Confirmação Adicional" fontSize={fontSize} spacing={spacing} theme={theme}>
              <SmartButton
                id="btn_toggle_confirm"
                label={preferences.extraConfirmations ? '✓  Ativado' : '  Desativado'}
                onPress={() => { onUserInteraction(); toggleExtraConfirmations(); }}
                variant={preferences.extraConfirmations ? 'success' : 'secondary'}
              />
              <Text style={[styles.hint, { fontSize: fontSize - 2, color: theme.hint }]}>
                Pede confirmação antes de apagar ou concluir; no perfil pode enviar pedido ao tutor.
              </Text>
            </Section>

            <Section title="Reduzir movimento" fontSize={fontSize} spacing={spacing} theme={theme}>
              <SmartButton
                id="btn_toggle_reduce_motion"
                label={(preferences.reduceMotion ?? false) ? '✓  Ativado' : '  Desativado'}
                onPress={() => { onUserInteraction(); toggleReduceMotion(); }}
                variant={(preferences.reduceMotion ?? false) ? 'success' : 'secondary'}
              />
              <Text style={[styles.hint, { fontSize: fontSize - 2, color: theme.hint }]}>
                Sem pulsação nos botões realçados pelo assistente — recomendado se movimento na tela
                incomodar.
              </Text>
            </Section>
          </>
        ) : null}
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

function Section({
  title,
  fontSize,
  spacing,
  theme,
  children,
}: {
  title: string;
  fontSize: number;
  spacing: number;
  theme: ReturnType<typeof getContrastTheme>;
  children: React.ReactNode;
}) {
  return (
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
      <Text style={[styles.sectionTitle, { fontSize: fontSize + 2, color: theme.sectionTitle }]}>
        {title}
      </Text>
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
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  hint: { marginTop: 8 },
  basicHint: { lineHeight: 22, fontWeight: '600' },
});
