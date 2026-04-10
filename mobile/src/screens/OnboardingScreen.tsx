import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  AccessibilityInfo,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAccessibilityStore } from '../store/accessibilityStore';
import { setOnboardingComplete } from '../storage/onboardingStorage';
import {
  FontSize,
  ContrastLevel,
  InterfaceMode,
  SpacingLevel,
} from '@/shared/domain/entities/User';
import { VisualTheme } from '../theme/visualTheme';
import { getContrastTheme } from '../theme/contrastTheme';

const STEPS = 5;

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const updateFontSize = useAccessibilityStore((s) => s.updateFontSize);
  const updateContrast = useAccessibilityStore((s) => s.updateContrast);
  const updateInterfaceMode = useAccessibilityStore((s) => s.updateInterfaceMode);
  const updateSpacing = useAccessibilityStore((s) => s.updateSpacing);

  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<{
    fontSize: FontSize;
    contrast: ContrastLevel;
    interfaceMode: InterfaceMode;
    spacing: SpacingLevel;
  }>({
    fontSize: 'large',
    contrast: 'normal',
    interfaceMode: 'basic',
    spacing: 'comfortable',
  });

  const theme = getContrastTheme(draft.contrast);
  const baseFont = 18;

  const finish = useCallback(async () => {
    updateFontSize(draft.fontSize);
    updateContrast(draft.contrast);
    updateInterfaceMode(draft.interfaceMode);
    updateSpacing(draft.spacing);
    await setOnboardingComplete();
    AccessibilityInfo.announceForAccessibility(
      'Configuração inicial concluída. Você pode mudar tudo depois na aba Personalização.'
    );
    onComplete();
  }, [
    draft,
    updateFontSize,
    updateContrast,
    updateInterfaceMode,
    updateSpacing,
    onComplete,
  ]);

  const next = () => setStep((s) => Math.min(s + 1, STEPS - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <View style={[styles.root, { backgroundColor: theme.screenBg, paddingTop: insets.top + 12 }]}>
      <Text
        style={[styles.progress, { color: theme.textMuted }]}
        accessibilityRole="text"
      >
        Passo {step + 1} de {STEPS}
      </Text>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        accessible={false}
      >
        {step === 0 && (
          <View>
            <Text
              style={[styles.title, { fontSize: baseFont + 10, color: theme.textPrimary }]}
              accessibilityRole="header"
            >
              Bem-vindo ao SeniorEase
            </Text>
            <Text style={[styles.body, { fontSize: baseFont + 2, color: theme.textSecondary }]}>
              Vamos ajustar letra, contraste e modo da interface em poucos toques. Tudo isso pode ser
              alterado depois em Personalização.
            </Text>
          </View>
        )}

        {step === 1 && (
          <View>
            <Text
              style={[styles.title, { fontSize: baseFont + 8, color: theme.textPrimary }]}
              accessibilityRole="header"
            >
              Tamanho do texto
            </Text>
            <Text style={[styles.body, { color: theme.textSecondary }]}>
              Escolha o tamanho que for mais confortável para ler.
            </Text>
            {(
              [
                ['small', 'Pequeno'],
                ['medium', 'Médio'],
                ['large', 'Grande'],
                ['extra-large', 'Muito grande'],
              ] as const
            ).map(([value, label]) => (
              <ChoiceRow
                key={value}
                label={label}
                selected={draft.fontSize === value}
                onPress={() => setDraft((d) => ({ ...d, fontSize: value }))}
                theme={theme}
                baseFont={baseFont + 2}
                hint={`Letra ${label.toLowerCase()}`}
              />
            ))}
          </View>
        )}

        {step === 2 && (
          <View>
            <Text
              style={[styles.title, { fontSize: baseFont + 8, color: theme.textPrimary }]}
              accessibilityRole="header"
            >
              Contraste
            </Text>
            <Text style={[styles.body, { color: theme.textSecondary }]}>
              Contraste alto deixa letras e botões mais nítidos.
            </Text>
            <ChoiceRow
              label="Normal"
              selected={draft.contrast === 'normal'}
              onPress={() => setDraft((d) => ({ ...d, contrast: 'normal' }))}
              theme={theme}
              baseFont={baseFont + 2}
              hint="Contraste normal"
            />
            <ChoiceRow
              label="Alto contraste"
              selected={draft.contrast === 'high'}
              onPress={() => setDraft((d) => ({ ...d, contrast: 'high' }))}
              theme={theme}
              baseFont={baseFont + 2}
              hint="Contraste alto para melhor leitura"
            />
          </View>
        )}

        {step === 3 && (
          <View>
            <Text
              style={[styles.title, { fontSize: baseFont + 8, color: theme.textPrimary }]}
              accessibilityRole="header"
            >
              Modo da interface
            </Text>
            <Text style={[styles.body, { color: theme.textSecondary }]}>
              O modo básico mostra menos opções de uma vez. O avançado oferece mais detalhes.
            </Text>
            <ChoiceRow
              label="Modo básico (recomendado)"
              selected={draft.interfaceMode === 'basic'}
              onPress={() => setDraft((d) => ({ ...d, interfaceMode: 'basic' }))}
              theme={theme}
              baseFont={baseFont + 2}
              hint="Menos opções na tela, mais simples"
            />
            <ChoiceRow
              label="Modo avançado"
              selected={draft.interfaceMode === 'advanced'}
              onPress={() => setDraft((d) => ({ ...d, interfaceMode: 'advanced' }))}
              theme={theme}
              baseFont={baseFont + 2}
              hint="Mais opções e detalhes"
            />
          </View>
        )}

        {step === 4 && (
          <View>
            <Text
              style={[styles.title, { fontSize: baseFont + 8, color: theme.textPrimary }]}
              accessibilityRole="header"
            >
              Espaçamento
            </Text>
            <Text style={[styles.body, { color: theme.textSecondary }]}>
              Mais espaço entre blocos ajuda a tocar com calma nos botões.
            </Text>
            <ChoiceRow
              label="Confortável (recomendado)"
              selected={draft.spacing === 'comfortable'}
              onPress={() => setDraft((d) => ({ ...d, spacing: 'comfortable' }))}
              theme={theme}
              baseFont={baseFont + 2}
              hint="Mais espaço entre elementos"
            />
            <ChoiceRow
              label="Normal"
              selected={draft.spacing === 'normal'}
              onPress={() => setDraft((d) => ({ ...d, spacing: 'normal' }))}
              theme={theme}
              baseFont={baseFont + 2}
              hint="Espaçamento padrão"
            />
            <ChoiceRow
              label="Espaçoso (ainda maior)"
              selected={draft.spacing === 'spacious'}
              onPress={() => setDraft((d) => ({ ...d, spacing: 'spacious' }))}
              theme={theme}
              baseFont={baseFont + 2}
              hint="Máximo espaço entre elementos"
            />
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        {step < STEPS - 1 ? (
          <View style={styles.footerRow}>
            {step > 0 ? (
              <TouchableOpacity
                onPress={back}
                style={[styles.secondaryBtn, { borderColor: theme.cardBorder }]}
                accessibilityRole="button"
                accessibilityLabel="Voltar para o passo anterior"
              >
                <Text style={[styles.secondaryBtnText, { color: theme.textSecondary }]}>Voltar</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.footerSpacer} />
            )}
            <TouchableOpacity
              onPress={next}
              style={[styles.primaryBtn, { backgroundColor: VisualTheme.accent }]}
              accessibilityRole="button"
              accessibilityLabel={step === 0 ? 'Começar configuração' : 'Próximo passo'}
            >
              <Text style={styles.primaryBtnText}>{step === 0 ? 'Começar' : 'Próximo'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.footerRow}>
            <TouchableOpacity
              onPress={back}
              style={[styles.secondaryBtn, { borderColor: theme.cardBorder }]}
              accessibilityRole="button"
              accessibilityLabel="Voltar para o passo anterior"
            >
              <Text style={[styles.secondaryBtnText, { color: theme.textSecondary }]}>Voltar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={finish}
              style={[styles.primaryBtn, { backgroundColor: VisualTheme.accent }]}
              accessibilityRole="button"
              accessibilityLabel="Entrar no aplicativo SeniorEase"
              accessibilityHint="Aplica as opções escolhidas e abre as tarefas"
            >
              <Text style={styles.primaryBtnText}>Entrar no app</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

function ChoiceRow({
  label,
  selected,
  onPress,
  theme,
  baseFont,
  hint,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  theme: ReturnType<typeof getContrastTheme>;
  baseFont: number;
  hint: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.choice,
        {
          borderColor: selected ? VisualTheme.accent : theme.cardBorder,
          backgroundColor: selected ? VisualTheme.accentSoft : theme.cardBg,
          borderWidth: selected ? 2 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      accessibilityHint={hint}
    >
      <Text style={{ fontSize: baseFont, fontWeight: '700', color: theme.textPrimary }}>{label}</Text>
      {selected ? <Text style={{ fontSize: baseFont - 2, color: VisualTheme.accent }}>✓</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  progress: { textAlign: 'center', fontSize: 14, marginBottom: 8, fontWeight: '600' },
  scroll: { paddingHorizontal: 20, paddingTop: 8 },
  title: { fontWeight: '800', marginBottom: 12 },
  body: { lineHeight: 26, marginBottom: 20 },
  choice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: VisualTheme.radiusMd,
    marginBottom: 12,
  },
  footer: {
    paddingHorizontal: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
    backgroundColor: '#ffffff',
  },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  footerSpacer: { flex: 1 },
  primaryBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: VisualTheme.radiusMd,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: VisualTheme.radiusMd,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  secondaryBtnText: { fontSize: 17, fontWeight: '700' },
});
