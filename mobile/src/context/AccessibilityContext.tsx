import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

import { useTutorStore } from '../store/tutorStore';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type FontSizeLevel = 'small' | 'medium' | 'large';
export type ContrastMode = 'normal' | 'high';

export interface AiLoadingState {
  /** true enquanto o app aguarda resposta do Gemini */
  isAiThinking: boolean;
}

export interface UIConfig {
  fontSize: FontSizeLevel;
  contrastMode: ContrastMode;
  isSimplifiedMode: boolean;
}

export interface CopilotState {
  /** ID do componente que deve pulsar/brilhar */
  activeAssistantId: string | null;
  /** Texto que será lido em voz pelo TTS */
  lastVoiceMessage: string | null;
}

export interface SecurityState {
  /** Indica que o app está aguardando aprovação do tutor */
  isWaitingTutorApproval: boolean;
  /** Descrição da ação crítica que está em espera */
  currentCriticalAction: string | null;
}

interface AccessibilityContextValue {
  // UI
  uiConfig: UIConfig;
  setUIConfig: (config: Partial<UIConfig>) => void;

  // Co-piloto
  copilot: CopilotState;
  /** Acende o brilho em um componente e dispara TTS */
  triggerAssistant: (assistantId: string, message: string) => void;
  /** Apaga o brilho */
  clearAssistant: () => void;

  // Estado de loading da IA
  aiLoading: AiLoadingState;
  /** Liga/desliga o indicador de "IA pensando" */
  setAiThinking: (thinking: boolean) => void;

  // Segurança / Tutor
  security: SecurityState;
  /** Intercepta uma ação crítica — abre o modal de aprovação */
  requestTutorApproval: (actionLabel: string, onApproved: () => void) => void;
  /** Resolve a aprovação (após delay simulado) */
  approveCriticalAction: () => void;
  /** Cancela a ação crítica */
  cancelCriticalAction: () => void;
  /** Callback guardado da ação aprovada */
  pendingApprovedCallback: (() => void) | null;

  /** Aviso quando a IA na nuvem falhou (dicas locais ativas). null = oculto */
  aiAssistNotice: string | null;
  setAiAssistNotice: (message: string | null) => void;
}

// ─── Valores padrão ───────────────────────────────────────────────────────────

const defaultUIConfig: UIConfig = {
  fontSize: 'medium',
  contrastMode: 'normal',
  isSimplifiedMode: true,
};

const defaultCopilot: CopilotState = {
  activeAssistantId: null,
  lastVoiceMessage: null,
};

const defaultSecurity: SecurityState = {
  isWaitingTutorApproval: false,
  currentCriticalAction: null,
};

// ─── Context ──────────────────────────────────────────────────────────────────

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

const defaultAiLoading: AiLoadingState = { isAiThinking: false };

export function AccessibilityContextProvider({ children }: { children: ReactNode }) {
  const [uiConfig, setUIConfigState] = useState<UIConfig>(defaultUIConfig);
  const [copilot, setCopilot] = useState<CopilotState>(defaultCopilot);
  const [security, setSecurity] = useState<SecurityState>(defaultSecurity);
  const [aiLoading, setAiLoadingState] = useState<AiLoadingState>(defaultAiLoading);
  const [pendingApprovedCallback, setPendingApprovedCallback] = useState<(() => void) | null>(null);
  const [aiAssistNotice, setAiAssistNotice] = useState<string | null>(null);

  // ── UI ──────────────────────────────────────────────────────────────────────
  const setUIConfig = useCallback((partial: Partial<UIConfig>) => {
    setUIConfigState((prev) => ({ ...prev, ...partial }));
  }, []);

  // ── Co-piloto ───────────────────────────────────────────────────────────────
  const triggerAssistant = useCallback((assistantId: string, message: string) => {
    setCopilot({ activeAssistantId: assistantId, lastVoiceMessage: message });
  }, []);

  const clearAssistant = useCallback(() => {
    setCopilot(defaultCopilot);
  }, []);

  // ── IA Loading ──────────────────────────────────────────────────────────────
  const setAiThinking = useCallback((thinking: boolean) => {
    setAiLoadingState({ isAiThinking: thinking });
  }, []);

  // ── Segurança ───────────────────────────────────────────────────────────────
  const requestTutorApproval = useCallback((actionLabel: string, onApproved: () => void) => {
    useTutorStore.getState().notifyCriticalAction(actionLabel);
    setPendingApprovedCallback(() => onApproved);
    setSecurity({ isWaitingTutorApproval: true, currentCriticalAction: actionLabel });
  }, []);

  const approveCriticalAction = useCallback(() => {
    setSecurity({ isWaitingTutorApproval: false, currentCriticalAction: null });
    setPendingApprovedCallback(null);
  }, []);

  const cancelCriticalAction = useCallback(() => {
    setSecurity({ isWaitingTutorApproval: false, currentCriticalAction: null });
    setPendingApprovedCallback(null);
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        uiConfig,
        setUIConfig,
        copilot,
        triggerAssistant,
        clearAssistant,
        aiLoading,
        setAiThinking,
        security,
        requestTutorApproval,
        approveCriticalAction,
        cancelCriticalAction,
        pendingApprovedCallback,
        aiAssistNotice,
        setAiAssistNotice,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

// ─── Hook de consumo ──────────────────────────────────────────────────────────

export function useAccessibilityContext(): AccessibilityContextValue {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error('useAccessibilityContext deve ser usado dentro de AccessibilityContextProvider');
  }
  return ctx;
}
