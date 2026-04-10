import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  Animated,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useAccessibilityContext } from '../context/AccessibilityContext';
import { useAccessibilityStore } from '../store/accessibilityStore';
import { VisualTheme } from '../theme/visualTheme';

interface SmartButtonProps {
  /** ID único — quando igual ao activeAssistantId do contexto, pulsa */
  id: string;
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'secondary' | 'success';
  disabled?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  /** Tamanho mínimo do botão (default 54) */
  minHeight?: number;
  /** Texto extra para leitores de tela (VoiceOver / TalkBack) */
  accessibilityHint?: string;
}

const VARIANT_COLORS: Record<NonNullable<SmartButtonProps['variant']>, string> = {
  primary: VisualTheme.accent,
  danger: VisualTheme.danger,
  secondary: VisualTheme.secondary,
  success: VisualTheme.success,
};

/**
 * SmartButton
 *
 * Botão acessível que pulsa / brilha quando o co-piloto
 * indicar seu `id` como `activeAssistantId`.
 */
export function SmartButton({
  id,
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  labelStyle,
  minHeight = 54,
  accessibilityHint: accessibilityHintProp,
}: SmartButtonProps) {
  const { copilot } = useAccessibilityContext();
  const reduceMotion = useAccessibilityStore((s) => s.preferences.reduceMotion ?? false);
  const isHighlighted = copilot.activeAssistantId === id;
  const animateHighlight = isHighlighted && !reduceMotion;

  // ── Animações ───────────────────────────────────────────────────────────────
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current; // 0 = sem brilho, 1 = brilho máximo

  useEffect(() => {
    if (animateHighlight) {
      // Pulsação suave: escala 1.0 → 1.08 → 1.0, loop infinito
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.08,
            duration: 600,
            useNativeDriver: false,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.0,
            duration: 600,
            useNativeDriver: false,
          }),
        ])
      );

      // Glow opacity: 0 → 1 → 0, loop infinito
      const glow = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 700,
            useNativeDriver: false,
          }),
        ])
      );

      pulse.start();
      glow.start();

      return () => {
        pulse.stop();
        glow.stop();
        scaleAnim.setValue(1);
        glowAnim.setValue(0);
      };
    }
  }, [animateHighlight, scaleAnim, glowAnim]);

  const baseColor = VARIANT_COLORS[variant];

  // Borda vibrante animada via interpolação
  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', '#facc15'], // amarelo vibrante
  });

  const shadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.9],
  });

  const buttonInner = (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        {
          backgroundColor: disabled ? '#cbd5e1' : baseColor,
          minHeight,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHintProp}
      accessibilityState={{ disabled }}
    >
      <Text style={[styles.label, labelStyle]}>{label}</Text>
    </TouchableOpacity>
  );

  if (isHighlighted && reduceMotion) {
    return (
      <View
        style={[
          styles.wrapper,
          {
            borderWidth: 3,
            borderColor: '#facc15',
            shadowColor: '#facc15',
            shadowOpacity: 0.45,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 0 },
            elevation: 8,
          },
          style,
        ]}
      >
        {buttonInner}
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          transform: [{ scale: scaleAnim }],
          borderColor: isHighlighted ? borderColor : 'transparent',
          borderWidth: isHighlighted ? 3 : 0,
          shadowColor: isHighlighted ? '#facc15' : VisualTheme.slate900,
          shadowOpacity: isHighlighted ? shadowOpacity : 0.12,
          shadowRadius: isHighlighted ? 14 : 8,
          shadowOffset: { width: 0, height: isHighlighted ? 0 : 3 },
          elevation: isHighlighted ? 12 : 5,
        },
        style,
      ]}
    >
      {buttonInner}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: VisualTheme.radiusMd,
    overflow: 'visible',
  },
  button: {
    borderRadius: VisualTheme.radiusMd,
    paddingVertical: 15,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 110,
  },
  label: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
