"use client";

import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useState } from "react";
import { AuthRepositoryImpl } from "@/infrastructure/repositories/auth.repository.impl";
import { StoreRepositoryImpl } from "@/infrastructure/repositories/store.repository.impl";
import { GoogleLoginUseCase } from "@/application/use-cases/auth/google-login.use-case";
import { CheckHasStoreUseCase } from "@/application/use-cases/store/check-has-store.use-case";
import { useRouter } from "next/navigation";

export function GoogleLoginButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const authRepository = new AuthRepositoryImpl();
  const storeRepository = new StoreRepositoryImpl();
  const googleLoginUseCase = new GoogleLoginUseCase(authRepository);
  const checkHasStoreUseCase = new CheckHasStoreUseCase(storeRepository);

  const handleSuccess = async (response: CredentialResponse) => {
    try {
      setIsLoading(true);

      const idToken = response.credential;
      if (!idToken) throw new Error("Google no ha devuelto un ID Token válido.");

      const session = await googleLoginUseCase.execute(idToken);
      if (!session) throw new Error("El backend no devolvió una sesión válida.");

      const storeCheck = await checkHasStoreUseCase.execute();

      if (storeCheck.hasStore) {
        router.push("/tienda");
      } else {
        router.push("/crear-tienda");
      }
    } catch (error) {
      console.log("Login fallido:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`transition-opacity duration-300 w-full sm:w-auto ${isLoading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => {
          console.log("Error emitido por la plataforma emergente de Google.");
        }}
        theme="outline"
        size="large"
        shape="pill"
        text="continue_with"
      />
      {isLoading && (
        <p className="text-sm font-medium text-gray-400 mt-2 text-center animate-pulse">
          Preparando tu espacio...
        </p>
      )}
    </div>
  );
}

