"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun01Icon, Moon01Icon } from "hugeicons-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * ThemeToggle Component
 * Provides a sleek switch between light/dark modes using next-themes, hugeicons, and framer-motion.
 * Tailored for Enterprise SaaS dashboards.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Evitar desajustes de hidratación
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`h-9 w-9 rounded-lg border border-gray-200 dark:border-gray-800 animate-pulse bg-gray-50 dark:bg-gray-900 ${className}`} />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`
        relative flex h-9 w-9 items-center justify-center rounded-lg border 
        border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950
        text-gray-500 dark:text-gray-400 transition-colors duration-300
        hover:border-indigo-500/50 hover:bg-gray-50 dark:hover:bg-gray-900
        group shadow-sm overflow-hidden
        ${className}
      `}
      aria-label="Alternar tema"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDark ? "dark" : "light"}
          initial={{ y: 20, opacity: 0, rotate: -45 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -20, opacity: 0, rotate: 45 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex items-center justify-center"
        >
          {isDark ? (
            <Sun01Icon
              size={20}
              strokeWidth={2}
              className="group-hover:text-indigo-600 transition-colors"
            />
          ) : (
            <Moon01Icon
              size={20}
              strokeWidth={2}
              className="group-hover:text-indigo-400 transition-colors"
            />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}

