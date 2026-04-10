import { UserPreferences } from '../domain/entities/User';
import { IUserRepository } from '../domain/repositories/IUserRepository';

export class UpdateUserPreferences {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const updatedPreferences: UserPreferences = {
      ...user.preferences,
      ...preferences,
    };

    const updatedUser = await this.userRepository.updatePreferences(userId, updatedPreferences);
    
    return updatedUser.preferences;
  }
}
