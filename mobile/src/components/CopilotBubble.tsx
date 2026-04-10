import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useAccessibilityContext } from '../context/AccessibilityContext';
import { prepareCopilotAudio, speakCopilotMessage } from '../services/copilotSpeech';
import { VisualTheme } from '../theme/visualTheme';

/**
 * CopilotBubble
 *
 * Bolha flutuante que aparece na parte inferior da tela quando
 * o co-piloto dispara uma mensagem de ajuda.
 * O usuário pode dispensá-la tocando no ✕.
 */
export function CopilotBubble() {
  const { copilot, clearAssistant } = useAccessibilityContext();
  const slideAnim = useRef(new Animated.Value(120)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const isVisible = Boolean(copilot.lastVoiceMessage);

  useEffect(() => {
    if (isVisible) {
      // Entra deslizando de baixo
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Sai deslizando para baixo
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 120,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, slideAnim, opacityAnim]);

  if (!copilot.lastVoiceMessage && !isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.row}>
        <Text style={styles.avatar}>🤖</Text>
        <View style={styles.messageCol}>
          <Text style={styles.message} numberOfLines={8}>
            {copilot.lastVoiceMessage}
          </Text>
          <TouchableOpacity
            onPress={() => {
              void prepareCopilotAudio();
              speakCopilotMessage(copilot.lastVoiceMessage ?? '');
            }}
            style={styles.repeatBtn}
            accessibilityRole="button"
            accessibilityLabel="Ouvir a mensagem de novo em voz alta"
          >
            <Text style={styles.repeatBtnText}>🔊 Ouvir de novo</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={clearAssistant}
          style={styles.closeBtn}
          accessibilityRole="button"
          accessibilityLabel="Fechar dica do assistente"
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    bottom: 92,
    left: 16,
    right: 16,
    backgroundColor: VisualTheme.slate900,
    borderRadius: VisualTheme.radiusLg,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.35)',
    shadowColor: VisualTheme.slate900,
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 16,
    zIndex: 999,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  messageCol: {
    flex: 1,
  },
  avatar: {
    fontSize: 28,
    lineHeight: 32,
  },
  message: {
    color: VisualTheme.slate200,
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '500',
    marginBottom: 10,
  },
  repeatBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(99, 102, 241, 0.22)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: VisualTheme.radiusSm,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.45)',
  },
  repeatBtnText: {
    color: '#c7d2fe',
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    fontWeight: '700',
  },
});
