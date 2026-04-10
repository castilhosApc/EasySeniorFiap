import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import * as Speech from 'expo-speech';
import { useAccessibilityContext } from '../context/AccessibilityContext';

const APPROVAL_DELAY_MS = 4_000; // 4 segundos simulando resposta do tutor

type ApprovalPhase = 'waiting' | 'approved';

/**
 * TutorApprovalModal — "Anjo da Guarda"
 *
 * Abre em tela cheia sempre que `security.isWaitingTutorApproval` for true.
 * Fase 1: exibe mensagem de aguardando + spinner animado (4 s).
 * Fase 2: exibe mensagem de aprovação + botão "Confirmar".
 */
export function TutorApprovalModal() {
  const { security, approveCriticalAction, cancelCriticalAction, pendingApprovedCallback } =
    useAccessibilityContext();

  const [phase, setPhase] = useState<ApprovalPhase>('waiting');
  const spinAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Reinicia estado ao abrir
  useEffect(() => {
    if (!security.isWaitingTutorApproval) {
      setPhase('waiting');
      return;
    }

    setPhase('waiting');
    fadeAnim.setValue(0);

    // Fade-in do modal
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Spinner contínuo
    const spin = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    );
    spin.start();

    // Lê mensagem de espera
    Speech.speak(
      'Estamos validando isso com seu tutor para sua segurança. Aguarde um instante.',
      { language: 'pt-BR', rate: 0.85 }
    );

    // Após 4 s, passa para fase "approved"
    const timer = setTimeout(() => {
      spin.stop();
      spinAnim.setValue(0);
      setPhase('approved');

      Speech.speak(
        'Tudo certo! Seu tutor autorizou. Clique em confirmar para continuar.',
        { language: 'pt-BR', rate: 0.9 }
      );
    }, APPROVAL_DELAY_MS);

    return () => {
      clearTimeout(timer);
      spin.stop();
      Speech.stop();
    };
  }, [security.isWaitingTutorApproval]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConfirm = () => {
    const run = pendingApprovedCallback;
    approveCriticalAction();
    run?.();
  };

  const handleCancel = () => {
    cancelCriticalAction();
    Speech.stop();
  };

  const spinInterpolation = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!security.isWaitingTutorApproval) return null;

  return (
    <Modal
      visible={security.isWaitingTutorApproval}
      transparent={false}
      animationType="fade"
      statusBarTranslucent
    >
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* Ícone central */}
        <View style={styles.iconContainer}>
          {phase === 'waiting' ? (
            <Animated.Text
              style={[styles.iconEmoji, { transform: [{ rotate: spinInterpolation }] }]}
            >
              🔄
            </Animated.Text>
          ) : (
            <Text style={styles.iconEmoji}>✅</Text>
          )}
        </View>

        {/* Título */}
        <Text style={styles.title}>
          {phase === 'waiting' ? 'Verificando segurança...' : 'Autorizado pelo tutor!'}
        </Text>

        {/* Ação que foi interceptada */}
        {security.currentCriticalAction && (
          <View style={styles.actionBadge}>
            <Text style={styles.actionBadgeText}>📌 {security.currentCriticalAction}</Text>
          </View>
        )}

        {/* Mensagem */}
        <Text style={styles.message}>
          {phase === 'waiting'
            ? 'Estamos validando isso com seu tutor para sua segurança. Aguarde um instante...'
            : 'Tudo certo! Seu tutor autorizou. Clique em "Confirmar" para continuar.'}
        </Text>

        {/* Indicador de progresso (fase de espera) */}
        {phase === 'waiting' && (
          <View style={styles.dotsRow}>
            {[0, 1, 2].map((i) => (
              <BouncingDot key={i} delay={i * 200} />
            ))}
          </View>
        )}

        {/* Botões */}
        <View style={styles.buttonsContainer}>
          {phase === 'approved' && (
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              accessibilityRole="button"
              accessibilityLabel="Confirmar ação autorizada pelo tutor"
            >
              <Text style={styles.confirmButtonText}>✓ Confirmar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            accessibilityRole="button"
            accessibilityLabel="Cancelar ação"
          >
            <Text style={styles.cancelButtonText}>✕ Cancelar</Text>
          </TouchableOpacity>
        </View>

        {/* Rodapé */}
        <Text style={styles.footer}>🛡️ SeniorEase — Sua segurança em primeiro lugar</Text>
      </Animated.View>
    </Modal>
  );
}

// ─── Ponto animado (loading dots) ─────────────────────────────────────────────

function BouncingDot({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: -10,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.delay(600 - delay),
      ])
    );
    bounce.start();
    return () => bounce.stop();
  }, [anim, delay]);

  return (
    <Animated.View style={[styles.dot, { transform: [{ translateY: anim }] }]} />
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  iconEmoji: {
    fontSize: 52,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  actionBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginBottom: 24,
  },
  actionBadgeText: {
    color: '#c7d2fe',
    fontSize: 15,
    fontWeight: '600',
  },
  message: {
    fontSize: 18,
    color: '#e2e8f0',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 36,
    maxWidth: 320,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
    alignItems: 'center',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#818cf8',
  },
  buttonsContainer: {
    width: '100%',
    gap: 14,
    maxWidth: 320,
  },
  confirmButton: {
    backgroundColor: '#6366f1',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    minHeight: 60,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  cancelButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: 56,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cancelButtonText: {
    color: '#e2e8f0',
    fontSize: 17,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 32,
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
  },
});
