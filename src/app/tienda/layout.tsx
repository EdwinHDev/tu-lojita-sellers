import { AuthGuard } from "@/components/auth/auth-guard";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { StoreAccessGuard } from "@/components/auth/store-access-guard";

export default function TiendaLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <StoreAccessGuard requiredStatus="has-store" redirectTo="/crear-tienda">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            {children}
          </SidebarInset>
        </SidebarProvider>
      </StoreAccessGuard>
    </AuthGuard>
  );
}
