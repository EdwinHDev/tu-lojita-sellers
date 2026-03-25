import {
  DashboardSquare01Icon,
  PackageIcon,
  Invoice01Icon,
  Settings02Icon,
} from "hugeicons-react";

export interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
}

export const navMain: NavItem[] = [
  {
    title: "Dashboard",
    url: "/tienda",
    icon: DashboardSquare01Icon,
  },
  {
    title: "Inventario",
    url: "/tienda/inventario",
    icon: PackageIcon,
  },
  {
    title: "Ventas",
    url: "/tienda/ventas",
    icon: Invoice01Icon,
  },
];

export const navSecondary: NavItem[] = [
  {
    title: "Configuración",
    url: "/tienda/configuracion",
    icon: Settings02Icon,
  },
];
