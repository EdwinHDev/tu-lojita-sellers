"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search01Icon,
  CheckmarkCircle01Icon,
  InformationCircleIcon,
  Loading03Icon,
  Store01Icon
} from "hugeicons-react";
import { Category } from "@/domain/entities/category.entity";
import { CategoryRepositoryImpl } from "@/infrastructure/repositories/category.repository.impl";
import { GetCategoriesUseCase } from "@/application/use-cases/category/get-categories.use-case";

const categoryRepository = new CategoryRepositoryImpl();
const getCategoriesUseCase = new GetCategoriesUseCase(categoryRepository);

interface CategoryVisualSelectorProps {
  value: string;
  onChange: (id: string) => void;
  error?: string;
}

export function CategoryVisualSelector({ value, onChange, error }: CategoryVisualSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        setIsLoading(true);
        const data = await getCategoriesUseCase.execute();
        setCategories(data);
      } catch (err) {
        setFetchError("No pudimos cargar las categorías.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCategories();
  }, []);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
          <Search01Icon size={20} />
        </div>
        <input
          type="text"
          placeholder="Buscar categorías..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
        />
      </div>

      {/* Grid */}
      <div className="p-2 grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse border-2 border-transparent" />
          ))
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => {
                const isSelected = value === category.id;

                return (
                  <motion.button
                    key={category.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 24
                    }}
                    onClick={() => onChange(category.id)}
                    className={`relative flex flex-col text-left p-5 rounded-2xl border-2 transition-colors duration-200 group h-full
                      ${isSelected
                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-lg shadow-indigo-500/10"
                        : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-indigo-200 dark:hover:border-indigo-900/50"}`}
                  >
                    {/* Selection Indicator */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0, rotate: -45 }}
                          animate={{ scale: 1, opacity: 1, rotate: 0 }}
                          exit={{ scale: 0, opacity: 0, rotate: -45 }}
                          transition={{ type: "spring", stiffness: 500, damping: 20 }}
                          className="absolute top-4 right-4 text-indigo-600 z-10"
                        >
                          <CheckmarkCircle01Icon size={24} strokeWidth={2.5} />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Image Container */}
                    <div 
                      className="h-14 w-14 rounded-xl flex items-center justify-center mb-4 overflow-hidden border border-gray-100 dark:border-white/10 shadow-sm bg-gray-50 dark:bg-gray-800 bg-cover bg-center" 
                      style={{ backgroundImage: category.image ? `url(${category.image})` : undefined }}
                    >
                      {!category.image && <Store01Icon size={24} className="text-gray-300 dark:text-gray-600" />}
                    </div>
                    
                    <div>
                      <h3 className={`text-sm font-black tracking-tight mb-1 transition-colors ${isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-gray-900 dark:text-white group-hover:text-indigo-600"}`}>
                        {category.name}
                      </h3>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                        {category.description}
                      </p>
                    </div>
                  </motion.button>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-12 flex flex-col items-center text-gray-400 text-center"
              >
                <InformationCircleIcon size={48} strokeWidth={1.5} className="mb-4 text-gray-200 dark:text-gray-800" />
                <p className="font-bold text-sm">{fetchError || "No encontramos esa categoría"}</p>
                <p className="text-xs">Prueba con otro término o revisa tu conexión</p>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-bold text-red-500 px-2"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
