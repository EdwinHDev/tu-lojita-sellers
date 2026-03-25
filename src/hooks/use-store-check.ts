"use client";

import { useEffect, useState } from "react";
import { StoreRepositoryImpl } from "@/infrastructure/repositories/store.repository.impl";
import { CheckHasStoreUseCase } from "@/application/use-cases/store/check-has-store.use-case";

export type StoreStatus = "checking" | "has-store" | "no-store";

/**
 * Hook para centralizar la comprobación de la existencia de una tienda para el usuario.
 * @returns StoreStatus
 */
export function useStoreCheck() {
  const [status, setStatus] = useState<StoreStatus>("checking");

  useEffect(() => {
    let isMounted = true;
    const storeRepository = new StoreRepositoryImpl();
    const checkHasStoreUseCase = new CheckHasStoreUseCase(storeRepository);

    checkHasStoreUseCase.execute()
      .then((result) => {
        if (!isMounted) return;
        setStatus(result.hasStore ? "has-store" : "no-store");
      })
      .catch(() => {
        // En caso de error (ej: no autenticado), se asume no-store.
        // El AuthGuard padre es el responsable de redirigir al login si es necesario.
        if (isMounted) setStatus("no-store");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return status;
}
