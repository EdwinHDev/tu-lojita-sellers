import { IAuthRepository } from "@/domain/repositories/auth.repository.interface";
import { axiosClient } from "../http/axios.client";
import Cookies from "js-cookie";

export class AuthRepositoryImpl implements IAuthRepository {
  /**
   * Envía la credencial cerrada (ID Token) al backend.
   */
  async loginWithGoogle(idToken: string): Promise<any> {
    const response = await axiosClient.post("/auth/google", {
      token: idToken,
    });
    return this.saveTokensAndReturn(response.data);
  }

  /**
   * Consulta al endpoint robusto /auth/check-status que puede renovar tokens
   */
  async checkStatus(): Promise<any> {
    // El axiosClient adjunta el token automáticamente. 
    // Si manda un 401, el retryQueue de axios intentará refrescarlo solo.
    const response = await axiosClient.get("/auth/check-status");
    return this.saveTokensAndReturn(response.data);
  }

  /**
   * Helper unificado para guardar cookies sin repetir lógica.
   */
  private saveTokensAndReturn(data: any): any {
    const accessToken = data?.access_token || data?.accessToken || data?.token;
    const refreshToken = data?.refresh_token || data?.refreshToken;
    
    const cookieOptions: Cookies.CookieAttributes = { 
      secure: process.env.NODE_ENV === "production", 
      sameSite: "Lax",
      path: "/"
    };

    if (typeof window !== "undefined") {
      if (accessToken) Cookies.set("access_token", accessToken, cookieOptions);
      if (refreshToken) Cookies.set("refresh_token", refreshToken, cookieOptions);
    }
    return data;
  }

  logout(): void {
    if (typeof window !== "undefined") {
      Cookies.remove("access_token");
      Cookies.remove("refresh_token");
    }
  }
}
