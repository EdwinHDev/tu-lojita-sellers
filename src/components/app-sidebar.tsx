"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Store01Icon, Logout01Icon } from "hugeicons-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { AuthRepositoryImpl } from "@/infrastructure/repositories/auth.repository.impl";
import { SidebarNavItem } from "@/components/sidebar/nav-item";
import { navMain, navSecondary } from "@/components/sidebar/config/navigation";

// ─── Entrance animation variants ──────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { x: -14, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 280, damping: 22 } as const,
  },
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const pathname = usePathname();
  const authRepository = new AuthRepositoryImpl();

  const handleLogout = () => {
    authRepository.logout();
    router.replace("/");
  };

  return (
    <Sidebar variant="inset" {...props}>
      {/* ── Header: brand logo ─────────────────────────────────────────────── */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="bg-transparent! hover:bg-transparent!"
              render={(props) => <div {...props} />}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <Store01Icon size={18} strokeWidth={2} />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate text-[10px] font-bold uppercase tracking-widest opacity-40">
                  Tu Lojita
                </span>
                <span className="truncate text-[13px] font-bold">Sellers Panel</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── Content: main + secondary navigation ───────────────────────────── */}
      <SidebarContent>
        {/* Main nav */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <SidebarMenu className="gap-1">
                {navMain.map((item) => (
                  <motion.div key={item.url} variants={itemVariants}>
                    <SidebarNavItem item={item} isActive={pathname === item.url} />
                  </motion.div>
                ))}
              </SidebarMenu>
            </motion.div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Secondary nav — pushed to bottom */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <SidebarMenu>
                {navSecondary.map((item) => (
                  <motion.div key={item.url} variants={itemVariants}>
                    <SidebarNavItem item={item} isActive={pathname === item.url} />
                  </motion.div>
                ))}
              </SidebarMenu>
            </motion.div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer: logout ─────────────────────────────────────────────────── */}
      <SidebarFooter className="border-t border-gray-100 dark:border-gray-800 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            {/*
             * Same two-layer pattern as SidebarNavItem:
             *  - motion.div  → transform only (x, scale)
             *  - button      → colors via CSS/Tailwind only
             */}
            <motion.div
              className="w-full"
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "tween", duration: 0.1 }}
            >
              <button
                onClick={handleLogout}
                className={cn(
                  "flex items-center gap-3 px-4 h-11 w-full rounded-xl",
                  "text-red-500 hover:bg-red-50/60 dark:hover:bg-red-950/40",
                  "transition-colors duration-150 cursor-pointer"
                )}
              >
                <Logout01Icon size={18} strokeWidth={2.5} className="shrink-0" />
                <span className="truncate">Cerrar Sesión</span>
              </button>
            </motion.div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
