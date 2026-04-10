import { UserPreferences, FontSize, ContrastLevel, SpacingLevel } from '../entities/User';

export class AccessibilityService {
  static getFontSizeValue(size: FontSize): string {
    const sizes = {
      small: '14px',
      medium: '16px',
      large: '20px',
      'extra-large': '24px',
    };
    return sizes[size];
  }

  static getContrastClass(level: ContrastLevel): string {
    const classes = {
      normal: 'contrast-normal',
      high: 'contrast-high',
      'very-high': 'contrast-very-high',
    };
    return classes[level];
  }

  static getSpacingValue(level: SpacingLevel): string {
    const spacing = {
      compact: '0.5rem',
      normal: '1rem',
      comfortable: '1.5rem',
      spacious: '2rem',
    };
    return spacing[level];
  }

  static getButtonMinSize(preferences: UserPreferences): { width: string; height: string } {
    const baseSize = preferences.fontSize === 'extra-large' ? 60 : 
                     preferences.fontSize === 'large' ? 50 : 44;
    
    return {
      width: `${baseSize}px`,
      height: `${baseSize}px`,
    };
  }

  static shouldShowConfirmation(preferences: UserPreferences, actionType: 'delete' | 'complete' | 'update'): boolean {
    if (!preferences.extraConfirmations) return false;
    
    return actionType === 'delete' || actionType === 'complete';
  }
}
