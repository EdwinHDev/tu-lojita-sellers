"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthRepositoryImpl } from "@/infrastructure/repositories/auth.repository.impl";
import { CheckStatusUseCase } from "@/application/use-cases/auth/check-status.use-case";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const repository = new AuthRepositoryImpl();
    const checkStatusUseCase = new CheckStatusUseCase(repository);

    // Timeout de seguridad: 10 segundos
    const timeoutId = setTimeout(() => {
      if (isMounted && status === "loading") {
        setStatus("unauthenticated");
        repository.logout();
        router.push("/");
      }
    }, 10000);

    checkStatusUseCase.execute()
      .then(() => {
        if (!isMounted) return;
        setStatus("authenticated");
      })
      .catch(() => {
        if (!isMounted) return;
        setStatus("unauthenticated");
        repository.logout();
        router.push("/");
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="relative mb-6">
          <div className="h-12 w-12 rounded-full border-t-2 border-b-2 border-indigo-600 animate-spin"></div>
          <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-indigo-600/10"></div>
        </div>
        <div className="space-y-2 text-center">
          <p className="text-gray-900 dark:text-white font-semibold">Verificando acceso...</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm animate-pulse">Armando su espacio seguro...</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Si la página no carga en 10 segundos, recargue la página</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
}
