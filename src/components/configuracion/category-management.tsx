"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShoppingBasket01Icon,
  PlusSignIcon,
  Edit01Icon,
  Delete02Icon,
  Loading03Icon,
  Search01Icon,
  Archive02Icon,
  Alert01Icon
} from "hugeicons-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StoreCategoryRepositoryImpl } from "@/infrastructure/repositories/store-category.repository.impl";
import { GetStoreCategoriesUseCase } from "@/application/use-cases/category/get-store-categories.use-case";
import { DeleteStoreCategoryUseCase } from "@/application/use-cases/category/delete-store-category.use-case";
import { StoreCategory } from "@/domain/entities/store-category.entity";
import { CreateCategorySheet } from "../inventario/create-category-sheet";
import { cn } from "@/lib/utils";

interface CategoryManagementProps {
  storeId: string;
}

const repository = new StoreCategoryRepositoryImpl();
const getCategoriesUseCase = new GetStoreCategoriesUseCase(repository);
const deleteCategoryUseCase = new DeleteStoreCategoryUseCase(repository);

export function CategoryManagement({ storeId }: CategoryManagementProps) {
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<StoreCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getCategoriesUseCase.execute(storeId);
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setIsLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleEdit = (category: StoreCategory) => {
    setEditingCategory(category);
    setIsSheetOpen(true);
  };

  const handleCreateNew = () => {
    setEditingCategory(null);
    setIsSheetOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta categoría? Los productos asociados podrían quedar sin categoría.")) return;

    try {
      setIsDeleting(id);
      await deleteCategoryUseCase.execute(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("No se pudo eliminar la categoría. Asegúrate de que no tenga productos asociados.");
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl shadow-none border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 overflow-hidden">
        <CardHeader className="border-b border-gray-50 dark:border-gray-800/50 pb-6 pt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl">
                <ShoppingBasket01Icon size={24} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Categorías de Artículos</CardTitle>
                <CardDescription className="text-xs font-medium">Gestiona cómo agrupas tus productos y servicios.</CardDescription>
              </div>
            </div>

            <Button
              onClick={handleCreateNew}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/20 font-bold h-11 px-6 whitespace-nowrap active:scale-95 transition-all text-sm"
            >
              <PlusSignIcon size={16} className="mr-2" />
              Nueva Categoría
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="p-4 sm:p-6 border-b border-gray-50 dark:border-gray-800/50 bg-gray-50/30 dark:bg-black/20">
            <div className="relative group max-w-sm">
              <Search01Icon size={18} className="absolute left-3 top-3 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre o descripción..."
                className="pl-10 h-11 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:border-indigo-500 transition-all font-medium text-sm shadow-sm"
              />
            </div>
          </div>

          <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <Loading03Icon className="animate-spin text-indigo-600" size={32} />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cargando categorías...</p>
              </div>
            ) : filteredCategories.length > 0 ? (
              filteredCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-4 sm:p-6 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-12 w-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:group-hover:bg-indigo-900/20 transition-all shrink-0">
                      <Archive02Icon size={20} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-gray-900 dark:text-white truncate">{cat.name}</h4>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{cat.description || "Sin descripción"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                      onClick={() => handleEdit(cat)}
                    >
                      <Edit01Icon size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      disabled={isDeleting === cat.id}
                      onClick={() => handleDelete(cat.id)}
                    >
                      {isDeleting === cat.id ? (
                        <Loading03Icon className="animate-spin size-4" />
                      ) : (
                        <Delete02Icon size={16} />
                      )}
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
                <div className="h-16 w-16 rounded-3xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-200">
                  <ShoppingBasket01Icon size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-gray-900 dark:text-white">No se encontraron categorías</h3>
                  <p className="text-sm text-gray-500 max-w-[280px]">
                    {searchQuery ? "Prueba con otros términos de búsqueda." : "Comienza creando tu primera categoría para organizar tus productos."}
                  </p>
                </div>
                {!searchQuery && (
                  <Button
                    variant="outline"
                    onClick={handleCreateNew}
                    className="rounded-xl border-gray-200 dark:border-gray-800 font-bold"
                  >
                    <PlusSignIcon size={16} className="mr-2" />
                    Crear Categoría
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl">
        <Alert01Icon className="text-amber-500 shrink-0 mt-0.5" size={16} />
        <p className="text-[10px] sm:text-xs text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
          Las categorías internas ayudan a que tus clientes filtren tus productos más rápido. Cambiar el nombre de una categoría existente actualizará automáticamente la visualización en todos los productos asociados.
        </p>
      </div>

      <CreateCategorySheet
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setEditingCategory(null);
        }}
        storeId={storeId}
        initialData={editingCategory}
        onSuccess={() => {
          loadCategories();
        }}
      />
    </div>
  );
}
