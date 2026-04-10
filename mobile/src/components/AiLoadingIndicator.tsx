/**
 * AiLoadingIndicator
 *
 * Indicador visual discreto exibido enquanto o app aguarda a resposta do Gemini.
 * Aparece como um ícone de microfone no canto superior direito com animação
 * de pulso suave (opacity 0.4 → 1.0), sinalizando "estou ouvindo".
 *
 * Visível apenas quando isAiThinking === true no AccessibilityContext.
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  AccessibilityInfo,
} from 'react-native';

import { useAccessibilityContext } from '../context/AccessibilityContext';
import { VisualTheme } from '../theme/visualTheme';

const PULSE_DURATION_MS = 800; // duração de um ciclo de pulso

export function AiLoadingIndicator() {
  const { aiLoading } = useAccessibilityContext();
  const { isAiThinking } = aiLoading;

  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim  = useRef(new Animated.Value(0.8)).current;
  const pulseLoop  = useRef<Animated.CompositeAnimation | null>(null);

  // ── Animação de entrada / saída ──────────────────────────────────────────────
  useEffect(() => {
    if (isAiThinking) {
      // Entrada suave
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue:         1,
          duration:        300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue:         1,
          friction:        5,
          useNativeDriver: true,
        }),
      ]).start();

      // Pulso contínuo
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue:         0.35,
            duration:        PULSE_DURATION_MS,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue:         1,
            duration:        PULSE_DURATION_MS,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.current.start();

      // Acessibilidade: anuncia o estado
      AccessibilityInfo.announceForAccessibility(
        'Consultando assistente inteligente, aguarde...'
      );
    } else {
      // Para o pulso e oculta
      pulseLoop.current?.stop();
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue:         0,
          duration:        250,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue:         0.8,
          duration:        250,
          useNativeDriver: true,
        }),
      ]).start();
    }

    return () => {
      pulseLoop.current?.stop();
    };
  }, [isAiThinking]); // eslint-disable-line react-hooks/exhaustive-deps

  // Não ocupa espaço no layout quando inativo
  if (!isAiThinking) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
      ]}
      accessibilityLabel="Assistente inteligente processando"
      accessibilityRole="progressbar"
    >
      <View style={styles.bubble}>
        <Text style={styles.icon}>🎙️</Text>
        <Text style={styles.label}>IA pensando...</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position:  'absolute',
    top:       52,
    right:     16,
    zIndex:    999,
  },
  bubble: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: 'rgba(79, 70, 229, 0.94)',
    paddingVertical:   10,
    paddingHorizontal: 16,
    borderRadius:      999,
    gap:               8,
    borderWidth: 1,
    borderColor: 'rgba(199, 210, 254, 0.35)',
    shadowColor:   VisualTheme.slate900,
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius:  10,
    elevation:     8,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    color:      '#ffffff',
    fontSize:   14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
