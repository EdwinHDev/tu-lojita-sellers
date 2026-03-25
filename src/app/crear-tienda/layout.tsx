import { AuthGuard } from "@/components/auth/auth-guard";
import { StoreAccessGuard } from "@/components/auth/store-access-guard";

/**
 * Layout de /crear-tienda: protegido con AuthGuard (sesión) + StoreAccessGuard (sin tienda previa).
 */
export default function CrearTiendaLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <StoreAccessGuard requiredStatus="no-store" redirectTo="/tienda">
        {children}
      </StoreAccessGuard>
    </AuthGuard>
  );
}
