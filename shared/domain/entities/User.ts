export interface User {
  id: string;
  name: string;
  email: string;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  fontSize: FontSize;
  contrast: ContrastLevel;
  spacing: SpacingLevel;
  interfaceMode: InterfaceMode;
  enhancedFeedback: boolean;
  extraConfirmations: boolean;
  reminderPreferences: ReminderPreferences;
  /**
   * Desativa animações de realce (pulsos) no mobile e reduz transições na web.
   * Recomendado para tonturas ou sensibilidade a movimento.
   */
  reduceMotion?: boolean;
}

export type FontSize = 'small' | 'medium' | 'large' | 'extra-large';
export type ContrastLevel = 'normal' | 'high' | 'very-high';
export type SpacingLevel = 'compact' | 'normal' | 'comfortable' | 'spacious';
export type InterfaceMode = 'basic' | 'advanced';

export interface ReminderPreferences {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'custom';
  customDays?: number[];
}
