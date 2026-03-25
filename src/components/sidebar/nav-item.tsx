"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { SidebarMenuItem } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/components/sidebar/config/navigation";

interface SidebarNavItemProps {
  item: NavItem;
  isActive: boolean;
}

/**
 * SidebarNavItem — Two-layer architecture:
 *
 * Layer 1 — `motion.div`: handles ONLY transforms (x, scale).
 *            whileHover is disabled when item is active → zero delay, zero background change.
 *
 * Layer 2 — `Link`: handles ONLY visual states via CSS/Tailwind.
 *            No Framer Motion color props → instant transitions, no conflicts.
 */
export function SidebarNavItem({ item, isActive }: SidebarNavItemProps) {
  return (
    <SidebarMenuItem>
      {/* Layer 1: transforms only */}
      <motion.div
        className="w-full"
        whileHover={isActive ? undefined : { x: 4 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "tween", duration: 0.1 }}
      >
        {/* Layer 2: all visual state via CSS */}
        <Link
          href={item.url}
          data-sidebar="menu-button"
          data-active={isActive}
          className={cn(
            "flex items-center gap-3 px-4 h-11 w-full rounded-xl font-bold transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
            isActive
              ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50"
              : "text-gray-400 hover:text-gray-900 hover:bg-gray-100/60 dark:hover:text-white dark:hover:bg-gray-800/30"
          )}
        >
          <item.icon
            size={18}
            strokeWidth={isActive ? 2.5 : 2}
            className="shrink-0"
          />
          <span className="truncate">{item.title}</span>
        </Link>
      </motion.div>
    </SidebarMenuItem>
  );
}
