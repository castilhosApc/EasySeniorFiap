import { ContrastLevel } from '@/shared/domain/entities/User';

export interface ContrastTheme {
  screenBg: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  cardBg: string;
  cardBorder: string;
  sectionTitle: string;
  hint: string;
  inputBg: string;
  inputBorder: string;
  inputText: string;
  placeholder: string;
  badgeBg: string;
  badgeText: string;
  progressTrack: string;
}

export function getContrastTheme(level: ContrastLevel): ContrastTheme {
  switch (level) {
    case 'high':
      return {
        screenBg: '#ffffff',
        textPrimary: '#000000',
        textSecondary: '#1a1a1a',
        textMuted: '#374151',
        cardBg: '#f3f4f6',
        cardBorder: '#000000',
        sectionTitle: '#000000',
        hint: '#1f2937',
        inputBg: '#ffffff',
        inputBorder: '#000000',
        inputText: '#000000',
        placeholder: '#4b5563',
        badgeBg: '#e0e7ff',
        badgeText: '#1e1b4b',
        progressTrack: '#d1d5db',
      };
    case 'very-high':
      return {
        screenBg: '#000000',
        textPrimary: '#ffff00',
        textSecondary: '#ffffff',
        textMuted: '#fde047',
        cardBg: '#0a0a0a',
        cardBorder: '#ffff00',
        sectionTitle: '#ffff00',
        hint: '#fef08a',
        inputBg: '#171717',
        inputBorder: '#ffff00',
        inputText: '#ffffff',
        placeholder: '#a3a3a3',
        badgeBg: '#422006',
        badgeText: '#fef08a',
        progressTrack: '#404040',
      };
    default:
      return {
        screenBg: '#f8fafc',
        textPrimary: '#0f172a',
        textSecondary: '#475569',
        textMuted: '#94a3b8',
        cardBg: '#ffffff',
        cardBorder: '#e2e8f0',
        sectionTitle: '#0f172a',
        hint: '#64748b',
        inputBg: '#ffffff',
        inputBorder: '#cbd5e1',
        inputText: '#0f172a',
        placeholder: '#94a3b8',
        badgeBg: '#eef2ff',
        badgeText: '#4338ca',
        progressTrack: '#e2e8f0',
      };
  }
}
