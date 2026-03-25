import { IAuthRepository } from "@/domain/repositories/auth.repository.interface";

export class CheckStatusUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  /**
   * Revalida la salud de la sesión a través del servidor seguro.
   */
  async execute(): Promise<any> {
    return await this.authRepository.checkStatus();
  }
}
