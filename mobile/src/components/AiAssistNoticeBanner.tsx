import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, AccessibilityInfo } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAccessibilityContext } from '../context/AccessibilityContext';
import { VisualTheme } from '../theme/visualTheme';

const AUTO_DISMISS_MS = 14_000;

/**
 * Faixa informativa quando a API de IA falhou e o app usou o guia local.
 */
export function AiAssistNoticeBanner() {
  const insets = useSafeAreaInsets();
  const { aiAssistNotice, setAiAssistNotice } = useAccessibilityContext();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!aiAssistNotice) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setAiAssistNotice(null);
      timerRef.current = null;
    }, AUTO_DISMISS_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [aiAssistNotice, setAiAssistNotice]);

  if (!aiAssistNotice) return null;

  return (
    <View
      style={[styles.wrap, { top: insets.top + 4 }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <View style={styles.inner}>
        <Text style={styles.text}>{aiAssistNotice}</Text>
        <TouchableOpacity
          onPress={() => {
            setAiAssistNotice(null);
            AccessibilityInfo.announceForAccessibility('Aviso fechado');
          }}
          style={styles.closeTouch}
          accessibilityRole="button"
          accessibilityLabel="Fechar aviso sobre a assistente"
        >
          <Text style={styles.close}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 1000,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: VisualTheme.slate800,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.5)',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  text: {
    flex: 1,
    color: '#f1f5f9',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  closeTouch: {
    padding: 4,
    minWidth: 36,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  close: {
    color: '#94a3b8',
    fontSize: 18,
    fontWeight: '700',
  },
});
