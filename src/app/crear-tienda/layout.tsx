import { AuthGuard } from "@/components/auth/auth-guard";
import { StoreAccessGuard } from "@/components/auth/store-access-guard";
import { TokenRefreshProvider } from "@/components/auth/token-refresh-provider";

/**
 * Layout de /crear-tienda: protegido con AuthGuard (sesión) + StoreAccessGuard (sin tienda previa).
 */
export default function CrearTiendaLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <TokenRefreshProvider>
        <StoreAccessGuard requiredStatus="no-store" redirectTo="/tienda">
          {children}
        </StoreAccessGuard>
      </TokenRefreshProvider>
    </AuthGuard>
  );
}
