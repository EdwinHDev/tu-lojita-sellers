"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStoreCheck, type StoreStatus } from "@/hooks/use-store-check";

interface StoreAccessGuardProps {
  children: React.ReactNode;
  requiredStatus: "has-store" | "no-store";
  redirectTo: string;
}

/**
 * Guard genérico para controlar el acceso basado en la existencia de una tienda.
 * @param requiredStatus El estado requerido para permitir el acceso.
 * @param redirectTo La ruta a la que redirigir si no se cumple el estado.
 */
export function StoreAccessGuard({ 
  children, 
  requiredStatus, 
  redirectTo 
}: StoreAccessGuardProps) {
  const status = useStoreCheck();
  const router = useRouter();

  useEffect(() => {
    if (status !== "checking" && status !== requiredStatus) {
      router.replace(redirectTo);
    }
  }, [status, requiredStatus, redirectTo, router]);

  if (status === "checking") {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="relative mb-6">
          <div className="h-12 w-12 rounded-full border-t-2 border-b-2 border-indigo-600 animate-spin"></div>
          <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-indigo-600/10"></div>
        </div>
        <div className="space-y-2 text-center">
          <p className="text-gray-900 dark:text-white font-semibold tracking-tight">Verificando tienda...</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Validando la propiedad de su comercio</p>
        </div>
      </div>
    );
  }

  // Si no coincide el estatus, retornamos null mientras se ejecuta la redirección
  if (status !== requiredStatus) {
    return null;
  }

  return <>{children}</>;
}
