"use client";

import { motion } from "framer-motion";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    } as const,
  },
};

export default function TiendaPage() {
  return (
    <div className="flex flex-col h-full bg-gray-50/50 dark:bg-black/20">
      <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white/50 backdrop-blur-md px-4 dark:bg-black/40 z-10 sticky top-0">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger className="-ml-1">
              <SidebarTrigger />
            </TooltipTrigger>
            <TooltipContent side="bottom" align="start" className="font-bold">
              Menú Lateral
            </TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2 px-4 text-sm font-medium text-gray-500">
            <span>Tienda</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 dark:text-white">Dashboard</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </header>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-1 flex-col gap-6 p-6 md:p-10 lg:p-12"
      >

        <div className="grid auto-rows-min gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <motion.div 
              key={i}
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="aspect-video rounded-2xl bg-white dark:bg-white/5 shadow-sm border border-gray-100 dark:border-white/10" 
            />
          ))}
        </div>
        <motion.div 
          variants={itemVariants}
          className="min-h-screen flex-1 rounded-2xl bg-white dark:bg-white/5 shadow-sm border border-gray-100 dark:border-white/10 md:min-h-min" 
        />
      </motion.div>
    </div>
  );
}

