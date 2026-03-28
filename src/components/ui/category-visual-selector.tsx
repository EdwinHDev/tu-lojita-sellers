"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search01Icon,
  CheckmarkCircle01Icon,
  InformationCircleIcon,
  Store01Icon,
  ArrowLeft01Icon
} from "hugeicons-react";
import { Category, Subcategory } from "@/domain/entities/category.entity";
import { CategoryRepositoryImpl } from "@/infrastructure/repositories/category.repository.impl";
import { GetCategoriesUseCase } from "@/application/use-cases/category/get-categories.use-case";

const categoryRepository = new CategoryRepositoryImpl();
const getCategoriesUseCase = new GetCategoriesUseCase(categoryRepository);

interface CategoryVisualSelectorProps {
  value: string; // This is now subCategoryId
  onChange: (id: string) => void;
  error?: string;
}

export function CategoryVisualSelector({ value, onChange, error }: CategoryVisualSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // Controls which view we are on: null = Categories view, string = Subcategories view for that category id
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

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

  // Pre-fill parent category if value (subCategoryId) is provided initially 
  useEffect(() => {
    if (value && categories.length > 0 && !selectedCategoryId) {
      const parentCat = categories.find(cat => cat.subcategories?.some(sub => sub.id === value));
      if (parentCat) {
        setSelectedCategoryId(parentCat.id);
      }
    }
  }, [value, categories, selectedCategoryId]);

  const activeCategory = useMemo(() => {
    if (!selectedCategoryId) return null;
    return categories.find(cat => cat.id === selectedCategoryId) || null;
  }, [selectedCategoryId, categories]);

  const handleBackToCategories = () => {
    setSelectedCategoryId(null);
    setSearchTerm("");
    onChange(""); // Optionally reset selection when going back, or keep it. Let's reset.
  };

  const currentList = useMemo(() => {
    if (!selectedCategoryId) {
      return categories.filter((cat) =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      const subs = activeCategory?.subcategories || [];
      return subs.filter((sub) =>
        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  }, [categories, selectedCategoryId, activeCategory, searchTerm]);

  return (
    <div className="space-y-4">
      {/* Header / Search Area */}
      <div className="space-y-3">
        {selectedCategoryId && activeCategory && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-2"
          >
            <button
              type="button"
              onClick={handleBackToCategories}
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 transition-colors"
            >
              <ArrowLeft01Icon size={18} />
            </button>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Categoría Base</p>
              <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">{activeCategory.name}</p>
            </div>
          </motion.div>
        )}

        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
            <Search01Icon size={20} />
          </div>
          <input
            type="text"
            placeholder={selectedCategoryId ? "Buscar especialidades..." : "Buscar categorías principales..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Grid Area */}
      <div className="p-2 grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[480px] min-h-[250px] overflow-y-auto pr-2 custom-scrollbar relative">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse border-2 border-transparent" />
          ))
        ) : (
          <AnimatePresence mode="popLayout">
            {currentList.length > 0 ? (
              currentList.map((item: any) => {
                // If we are in categories view, item is Category, isSelected is roughly checked if active
                const isCatView = !selectedCategoryId;
                const isSelected = isCatView 
                  ? false // Categorías no se seleccionan como final, abren el siguiente paso
                  : value === item.id;

                const imageSrc = isCatView ? item.image : item.imageUrl;

                return (
                  <motion.button
                    type="button"
                    key={item.id}
                    layout="position"
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
                    onClick={() => {
                      if (isCatView) {
                        setSelectedCategoryId(item.id);
                        setSearchTerm("");
                      } else {
                        onChange(item.id);
                      }
                    }}
                    className={`relative flex flex-col text-left p-5 rounded-2xl border-2 transition-colors duration-200 group h-full
                      ${isSelected
                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-lg shadow-indigo-500/10"
                        : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-indigo-200 dark:hover:border-indigo-900/50"}`}
                  >
                    {/* Selection Indicator for Subcategories */}
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
                      className="h-14 w-14 rounded-xl flex items-center justify-center mb-4 overflow-hidden border border-gray-100 dark:border-white/10 shadow-sm bg-gray-50 dark:bg-gray-900 bg-cover bg-center shrink-0" 
                      style={{ 
                        backgroundImage: imageSrc 
                          ? `url(${process.env.NEXT_PUBLIC_API_URL_IMAGES}${imageSrc})` 
                          : undefined 
                      }}
                    >
                      {!imageSrc && <Store01Icon size={24} className="text-gray-300 dark:text-gray-600" />}
                    </div>
                    
                    <div>
                      <h3 className={`text-sm font-black tracking-tight mb-1 transition-colors ${isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-gray-900 dark:text-white group-hover:text-indigo-600"}`}>
                        {item.name}
                      </h3>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                    
                    {/* Visual cue for categories to click forward */}
                    {isCatView && (
                      <div className="mt-auto pt-4 flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">
                        Ver especialidades →
                      </div>
                    )}
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
                <p className="font-bold text-sm">{fetchError || "No encontramos resultados"}</p>
                <p className="text-xs">{!selectedCategoryId ? "Prueba con otro término" : "Esta categoría no tiene especialidades aún"}</p>
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
