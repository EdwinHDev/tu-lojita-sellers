"use client";

import { useEffect, useState } from "react";
import { StoreRepositoryImpl } from "@/infrastructure/repositories/store.repository.impl";
import { CheckHasStoreUseCase } from "@/application/use-cases/store/check-has-store.use-case";

export type StoreStatus = "checking" | "has-store" | "no-store";

export interface StoreState {
  status: StoreStatus;
  storeId: string | null;
  storeName: string | null;
}

/**
 * Hook para centralizar la comprobación de la existencia de una tienda para el usuario.
 */
export function useStoreCheck(): StoreState {
  const [state, setState] = useState<StoreState>({
    status: "checking",
    storeId: null,
    storeName: null,
  });

  useEffect(() => {
    let isMounted = true;
    const storeRepository = new StoreRepositoryImpl();
    const checkHasStoreUseCase = new CheckHasStoreUseCase(storeRepository);

    checkHasStoreUseCase.execute()
      .then((result) => {
        if (!isMounted) return;
        setState({
          status: result.hasStore ? "has-store" : "no-store",
          storeId: result.storeId,
          storeName: result.storeName,
        });
      })
      .catch(() => {
        if (isMounted) setState({ status: "no-store", storeId: null, storeName: null });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}
