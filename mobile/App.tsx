import React, { useEffect, useState, useCallback } from 'react';
import { Text, TouchableWithoutFeedback, View, ActivityIndicator } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Providers
import { AccessibilityProvider } from './src/providers/AccessibilityProvider';
import { AccessibilityContextProvider } from './src/context/AccessibilityContext';

// Telas
import { TasksScreen } from './src/screens/TasksScreen';
import { PersonalizationScreen } from './src/screens/PersonalizationScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { TutorScreen } from './src/screens/TutorScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';

// Componentes globais
import { TutorApprovalModal } from './src/components/TutorApprovalModal';
import { CopilotBubble } from './src/components/CopilotBubble';
import { AiLoadingIndicator } from './src/components/AiLoadingIndicator';
import { AiAssistNoticeBanner } from './src/components/AiAssistNoticeBanner';

// Context do co-piloto (para resetar o timer globalmente)
import { useAccessibilityContext } from './src/context/AccessibilityContext';
import { TAB_BAR_STYLE } from './src/navigation/tabBarStyle';
import { initSimulatedNotificationHandler } from './src/services/simulatedNotifications';
import { prepareCopilotAudio } from './src/services/copilotSpeech';
import { isOnboardingComplete } from './src/storage/onboardingStorage';
import { VisualTheme } from './src/theme/visualTheme';
import { useAccessibilityStore } from './src/store/accessibilityStore';

const Tab = createBottomTabNavigator();

export const navigationRef = createNavigationContainerRef();

// ─── Root com detecção de toque global ────────────────────────────────────────

function AppRoot() {
  const { clearAssistant } = useAccessibilityContext();
  const showTutorTab = useAccessibilityStore((s) => s.preferences.interfaceMode === 'advanced');

  useEffect(() => {
    initSimulatedNotificationHandler();
    void prepareCopilotAudio();
  }, []);

  useEffect(() => {
    if (!showTutorTab && navigationRef.isReady()) {
      const r = navigationRef.getCurrentRoute();
      if (r?.name === 'Tutor') {
        navigationRef.navigate('Tasks' as never);
      }
    }
  }, [showTutorTab]);

  /**
   * Qualquer toque na tela é capturado aqui.
   * O reset do timer de hesitação é feito dentro de cada tela
   * via useLatencyDetector.onUserInteraction(), mas também
   * limpamos o brilho se o usuário tocar em qualquer lugar.
   */
  const handleGlobalTouch = () => {
    // Não limpa o brilho imediatamente para não interromper o feedback
    // O hook de cada tela gerencia o reset do timer
  };

  return (
    <TouchableWithoutFeedback onPress={handleGlobalTouch} accessible={false}>
      <View style={{ flex: 1 }}>
        <NavigationContainer ref={navigationRef}>
          <StatusBar style="light" />
          <Tab.Navigator
            screenOptions={{
              tabBarActiveTintColor: '#6366f1',
              tabBarInactiveTintColor: '#94a3b8',
              tabBarStyle: TAB_BAR_STYLE,
              tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '700',
                letterSpacing: 0.2,
              },
              tabBarHideOnKeyboard: true,
              headerStyle: {
                backgroundColor: '#0f172a',
                elevation: 0,
                shadowOpacity: 0,
                borderBottomWidth: 0,
              },
              headerTintColor: '#ffffff',
              headerTitleStyle: {
                fontSize: 20,
                fontWeight: '700',
                letterSpacing: -0.3,
                color: '#ffffff',
              },
              headerShadowVisible: false,
            }}
          >
            <Tab.Screen
              name="Tasks"
              component={TasksScreen}
              options={{
                title: 'Tarefas',
                tabBarLabel: 'Tarefas',
                tabBarAccessibilityLabel: 'Aba Tarefas, organizador de atividades',
                tabBarIcon: ({ color }) => <TabIcon emoji="📋" color={color} />,
              }}
            />
            <Tab.Screen
              name="Personalization"
              component={PersonalizationScreen}
              options={{
                title: 'Personalização',
                tabBarLabel: 'Personalização',
                tabBarAccessibilityLabel: 'Aba Personalização, acessibilidade e aparência',
                tabBarIcon: ({ color }) => <TabIcon emoji="⚙️" color={color} />,
              }}
            />
            <Tab.Screen
              name="Tutor"
              component={TutorScreen}
              options={{
                title: 'Tutor',
                tabBarLabel: 'Tutor',
                tabBarAccessibilityLabel: 'Aba Tutor, aprovações e apoio',
                tabBarIcon: ({ color }) => <TabIcon emoji="🛡️" color={color} />,
                tabBarButton: showTutorTab ? undefined : () => null,
              }}
            />
            <Tab.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                title: 'Meu Perfil',
                tabBarLabel: 'Perfil',
                tabBarAccessibilityLabel: 'Aba Perfil e contato de apoio',
                tabBarIcon: ({ color }) => <TabIcon emoji="👤" color={color} />,
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>

        {/* ── Componentes globais de overlay ── */}
        <AiAssistNoticeBanner />
        <AiLoadingIndicator />
        <CopilotBubble />
        <TutorApprovalModal />
      </View>
    </TouchableWithoutFeedback>
  );
}

// ─── Raiz da aplicação ────────────────────────────────────────────────────────

function AppGate() {
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    void isOnboardingComplete().then(setOnboarded);
  }, []);

  const handleOnboardingDone = useCallback(() => {
    setOnboarded(true);
  }, []);

  if (onboarded === null) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: VisualTheme.slate50,
        }}
        accessibilityLabel="A carregar o aplicativo"
      >
        <ActivityIndicator size="large" color={VisualTheme.accent} />
      </View>
    );
  }

  if (!onboarded) {
    return <OnboardingScreen onComplete={handleOnboardingDone} />;
  }

  return <AppRoot />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AccessibilityContextProvider>
        <AccessibilityProvider>
          <AppGate />
        </AccessibilityProvider>
      </AccessibilityContextProvider>
    </SafeAreaProvider>
  );
}

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  return <Text style={{ fontSize: 24 }}>{emoji}</Text>;
}
