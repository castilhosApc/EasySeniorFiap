import React, { useEffect, useRef } from 'react';
import {
  Animated,
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useAccessibilityContext } from '../context/AccessibilityContext';
import { useAccessibilityStore } from '../store/accessibilityStore';
import { VisualTheme } from '../theme/visualTheme';

interface SmartCardProps {
  /** ID único — quando igual ao activeAssistantId do contexto, pulsa */
  id: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * SmartCard
 *
 * Container que pulsa / brilha quando o co-piloto indicar seu `id`.
 * Use-o para envolver qualquer secção da tela que deva ser destacada.
 */
export function SmartCard({ id, children, style }: SmartCardProps) {
  const { copilot } = useAccessibilityContext();
  const reduceMotion = useAccessibilityStore((s) => s.preferences.reduceMotion ?? false);
  const isHighlighted = copilot.activeAssistantId === id;
  const animateHighlight = isHighlighted && !reduceMotion;

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animateHighlight) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.04,
            duration: 700,
            useNativeDriver: false,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.0,
            duration: 700,
            useNativeDriver: false,
          }),
        ])
      );

      const glow = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.2,
            duration: 800,
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

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [VisualTheme.slate200, VisualTheme.accent],
  });

  const shadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.06, 0.35],
  });

  if (isHighlighted && reduceMotion) {
    return (
      <View
        style={[
          styles.card,
          {
            borderColor: VisualTheme.accent,
            borderWidth: 2.5,
            shadowColor: VisualTheme.accent,
            shadowOpacity: 0.25,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 8,
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [{ scale: scaleAnim }],
          borderColor: isHighlighted ? borderColor : VisualTheme.slate200,
          borderWidth: isHighlighted ? 2.5 : 1,
          shadowColor: isHighlighted ? VisualTheme.accent : VisualTheme.slate900,
          shadowOpacity: isHighlighted ? shadowOpacity : 0.07,
          shadowRadius: isHighlighted ? 16 : 10,
          shadowOffset: { width: 0, height: isHighlighted ? 6 : 3 },
          elevation: isHighlighted ? 10 : 4,
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: VisualTheme.white,
    borderRadius: VisualTheme.radiusLg,
    padding: 18,
    marginBottom: 14,
  },
});
