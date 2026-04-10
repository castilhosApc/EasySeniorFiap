import { UserPreferences } from '../domain/entities/User';
import { IUserRepository } from '../domain/repositories/IUserRepository';

export class GetUserPreferences {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string): Promise<UserPreferences> {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return user.preferences;
  }
}
