"use client";

import { useState } from "react";
import {
  Store01Icon,
  Settings02Icon,
  Shield01Icon,
  UserCircleIcon,
  ShoppingBasket01Icon,
  Wallet01Icon
} from "hugeicons-react";
import { useStoreCheck } from "@/hooks/use-store-check";
import { StoreProfileForm } from "@/components/configuracion/store-profile-form";
import { CategoryManagement } from "@/components/configuracion/category-management";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { PaymentSettingsForm } from "@/components/configuracion/payment-settings-form";

export default function ConfiguracionPage() {
  const { storeId } = useStoreCheck();
  const [activeTab, setActiveTab] = useState("perfil");

  const tabs = [
    { id: "perfil", label: "Perfil", icon: Store01Icon },
    { id: "categorias", label: "Categorías", icon: ShoppingBasket01Icon },
    { id: "pagos", label: "Pagos", icon: Wallet01Icon },
    { id: "seguridad", label: "Seguridad", icon: Shield01Icon },
    { id: "apariencia", label: "Apariencia", icon: UserCircleIcon },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50/50 dark:bg-black/20">
      {/* Universal Header - Standard Dashaboard Pattern */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white/50 backdrop-blur-md px-4 dark:bg-black/40 z-10 sticky top-0">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger render={<SidebarTrigger className="-ml-1" />} />
            <TooltipContent side="bottom" align="start" className="font-bold">
              Menú Lateral
            </TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2 px-4 text-sm font-medium text-gray-500">
            <span>Tienda</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 dark:text-white font-bold">Configuración</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-8">
          {/* Section Heading */}
          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Ajustes de la Tienda</h2>
            <p className="text-sm text-gray-500 font-medium font-mono uppercase text-[10px] tracking-widest">Store Settings</p>
          </div>

          {/* Simple Tab Switcher - Mobile Friendly */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit overflow-x-auto no-scrollbar max-w-full">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
                )}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {activeTab === "perfil" && storeId ? (
              <StoreProfileForm storeId={storeId} />
            ) : activeTab === "categorias" && storeId ? (
              <CategoryManagement storeId={storeId} />
            ) : activeTab === "pagos" && storeId ? (
              <PaymentSettingsForm storeId={storeId} />
            ) : (
              <div className="flex flex-col items-center justify-center h-[40vh] text-center space-y-4 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50">
                <div className="h-16 w-16 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-300">
                  <Settings02Icon size={32} />
                </div>
                <div className="space-y-1 p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">Próximamente</h3>
                  <p className="text-sm text-gray-500 max-w-[280px]">Estamos trabajando en los ajustes de {tabs.find(t => t.id === activeTab)?.label.toLowerCase()}.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
