/**
 * Tokens visuais globais — visual moderno (índigo + slate).
 * Acessibilidade: mantém contraste nas variantes de botão.
 */
export const VisualTheme = {
  accent: '#6366f1',
  accentHover: '#4f46e5',
  accentSoft: '#eef2ff',
  success: '#0d9488',
  successSoft: '#ccfbf1',
  danger: '#e11d48',
  secondary: '#64748b',
  secondarySoft: '#f1f5f9',
  slate900: '#0f172a',
  slate800: '#1e293b',
  slate200: '#e2e8f0',
  slate100: '#f1f5f9',
  slate50: '#f8fafc',
  white: '#ffffff',
  radiusSm: 12,
  radiusMd: 16,
  radiusLg: 20,
  radiusXl: 28,
  shadowCard: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;
