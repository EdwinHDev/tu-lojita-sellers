import { AuthSession } from "../entities/auth.entity";

export interface IAuthRepository {
  loginWithGoogle(idToken: string): Promise<AuthSession | any>;
  checkStatus(): Promise<AuthSession | any>;
  logout(): void;
}
