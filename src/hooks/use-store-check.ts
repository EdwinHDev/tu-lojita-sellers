"use client";

import { useEffect, useState } from "react";
import { StoreRepositoryImpl } from "@/infrastructure/repositories/store.repository.impl";
import { CheckHasStoreUseCase } from "@/application/use-cases/store/check-has-store.use-case";
import { GetStoreUseCase } from "@/application/use-cases/store/get-store.use-case";

export type StoreStatus = "checking" | "has-store" | "no-store";

export interface StoreState {
  status: StoreStatus;
  storeId: string | null;
  storeName: string | null;
  storeLogo: string | null;
}

/**
 * Hook para centralizar la comprobación de la existencia de una tienda para el usuario.
 */
export function useStoreCheck(): StoreState {
  const [state, setState] = useState<StoreState>({
    status: "checking",
    storeId: null,
    storeName: null,
    storeLogo: null,
  });

  useEffect(() => {
    let isMounted = true;
    const storeRepository = new StoreRepositoryImpl();
    const checkHasStoreUseCase = new CheckHasStoreUseCase(storeRepository);
    const getStoreUseCase = new GetStoreUseCase(storeRepository);

    const checkStore = async () => {
      try {
        const result = await checkHasStoreUseCase.execute();
        if (!isMounted) return;

        if (result.hasStore && result.storeId) {
          // Si el check rápido no trae el logo, intentamos obtenerlo de la tienda completa
          let logo = result.storeLogo || null;
          
          if (!logo) {
            try {
              const fullStore = await getStoreUseCase.execute(result.storeId);
              logo = fullStore.logo || null;
            } catch (e) {
              console.error("Error fetching full store for logo:", e);
            }
          }

          setState({
            status: "has-store",
            storeId: result.storeId,
            storeName: result.storeName,
            storeLogo: logo,
          });
        } else {
          setState({ status: "no-store", storeId: null, storeName: null, storeLogo: null });
        }
      } catch (error) {
        if (isMounted) setState({ status: "no-store", storeId: null, storeName: null, storeLogo: null });
      }
    };

    checkStore();

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}
