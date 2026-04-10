import { User, UserPreferences } from '../entities/User';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
  updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<User>;
}
