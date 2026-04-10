import { UserPreferences } from '../entities/User';

export interface IPreferencesRepository {
  load(userId: string): Promise<UserPreferences | null>;
  save(userId: string, preferences: UserPreferences): Promise<void>;
}
