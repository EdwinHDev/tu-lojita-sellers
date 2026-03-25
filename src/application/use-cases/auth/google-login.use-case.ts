import { IAuthRepository } from "@/domain/repositories/auth.repository.interface";

export class GoogleLoginUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  /**
   * Ejecuta el caso de uso aislando toda la validación o transformaciones de negocio.
   * @param googleToken El token provisto por la cuenta de Google
   */
  async execute(googleToken: string): Promise<any> {
    if (!googleToken) {
      throw new Error("El token de acceso proporcionado por Google es inexistente.");
    }
    
    const backendSession = await this.authRepository.loginWithGoogle(googleToken);
    
    // Aquí puedes emitir eventos extra, adaptar los datos al formato AppStore, etc.
    return backendSession;
  }
}
