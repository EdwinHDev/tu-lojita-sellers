"use client";

import { useState, useEffect } from "react";
import { 
  PackageIcon, 
  PlusSignIcon, 
  ShoppingBasket01Icon, 
  ZapIcon, 
  Search01Icon, 
  MoreHorizontalIcon,
  StarIcon,
  Ticket01Icon
} from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { useStoreCheck } from "@/hooks/use-store-check";
import { ItemRepositoryImpl } from "@/infrastructure/repositories/item.repository.impl";
import { GetItemsUseCase } from "@/application/use-cases/item/get-items.use-case";
import { Item, ItemType } from "@/domain/entities/item.entity";
import { CreateItemForm } from "@/components/inventario/create-item-form";
import { ColumnSelector, ColumnConfig } from "@/components/inventario/column-selector";
import { getOptimizedImageUrl, IMAGE_PRESETS } from "@/lib/images";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const itemRepository = new ItemRepositoryImpl();
const getItemsUseCase = new GetItemsUseCase(itemRepository);

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: "item", label: "Item", visible: true, alwaysVisible: true },
  { id: "type", label: "Tipo", visible: true },
  { id: "category", label: "Categoría", visible: true },
  { id: "price", label: "Precio", visible: true },
  { id: "stock", label: "Stock", visible: true },
  { id: "marketing", label: "Promoción", visible: true },
  { id: "actions", label: "Acciones", visible: true, alwaysVisible: true },
];

export default function InventarioPage() {
  const { storeId } = useStoreCheck();
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);

  // Persistence for user preferences
  useEffect(() => {
    const saved = localStorage.getItem("inventory_columns_v1");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Sync with default to ensure new columns are added if we update the app
        const synced = DEFAULT_COLUMNS.map(def => {
          const match = parsed.find((p: ColumnConfig) => p.id === def.id);
          return match ? { ...def, visible: match.visible } : def;
        });
        setColumns(synced);
      } catch (e) {
        console.error("Error loading column preferences");
      }
    }
  }, []);

  const handleColumnsChange = (newColumns: ColumnConfig[]) => {
    setColumns(newColumns);
    localStorage.setItem("inventory_columns_v1", JSON.stringify(newColumns));
  };

  const isVisible = (id: string) => columns.find(c => c.id === id)?.visible;

  const fetchItems = async () => {
    if (!storeId) return;
    try {
      setIsLoading(true);
      const response = await getItemsUseCase.execute(storeId, {
        q: searchTerm || undefined,
        limit: 50,
      });
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems();
    }, 500);
    return () => clearTimeout(timer);
  }, [storeId, searchTerm]);

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
            <span className="text-gray-900 dark:text-white font-bold">Inventario</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 space-y-8 p-4 sm:p-8 overflow-y-auto custom-scrollbar">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">Inventario</h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">Administra tus productos, servicios y stock en tiempo real.</p>
          </div>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 px-6 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-95 gap-2"
          >
            <PlusSignIcon size={18} strokeWidth={2.5} />
            Crear Item
          </Button>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex-1 flex items-center gap-3 bg-white dark:bg-gray-900 p-2 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all focus-within:ring-4 focus-within:ring-indigo-500/5">
            <div className="pl-3 text-gray-400">
              <Search01Icon size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Buscar por nombre o descripción..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm font-medium py-2"
            />
          </div>
          <ColumnSelector columns={columns} onChange={handleColumnsChange} />
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex h-[450px] shrink-0 items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center p-8">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-indigo-50 dark:bg-indigo-950/30 mb-6 group">
                <PackageIcon className="h-12 w-12 text-indigo-400 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Tu escaparate está vacío</h3>
              <p className="mt-3 text-sm text-gray-500 font-medium leading-relaxed">
                Comienza agregando productos físicos o servicios profesionales para que tus clientes puedan comprarlos.
              </p>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                variant="outline" 
                className="mt-8 rounded-xl border-gray-200 dark:border-gray-800 font-bold hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cargar mi primer producto
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[700px] lg:min-w-full">
              <thead>
                <tr className="border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                  {columns.filter(c => c.visible).map((col) => (
                    <th 
                      key={col.id} 
                      className={cn(
                        "px-4 sm:px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400",
                        col.id === "price" && "text-right sm:text-left",
                        col.id === "stock" && "text-center",
                        col.id === "actions" && "text-right"
                      )}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="group hover:bg-gray-50/50 dark:hover:bg-indigo-950/5 transition-colors">
                    {isVisible("item") && (
                      <td className="px-4 sm:px-6 py-4 sm:py-5">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0 border border-gray-100 dark:border-gray-800">
                            {item.mainImage ? (
                              <img 
                                src={getOptimizedImageUrl(item.mainImage, IMAGE_PRESETS.THUMBNAIL_MD)} 
                                alt="" 
                                className="h-full w-full object-cover" 
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <PackageIcon size={16} className="text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate max-w-[120px] sm:max-w-none">{item.title}</p>
                            <p className="hidden sm:block text-[10px] font-medium text-gray-400 truncate max-w-[200px]">{item.description}</p>
                          </div>
                        </div>
                      </td>
                    )}

                    {isVisible("type") && (
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight
                          ${item.itemType === ItemType.PRODUCT 
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" 
                            : "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"}`}
                        >
                          {item.itemType === ItemType.PRODUCT ? <ShoppingBasket01Icon size={12} /> : <ZapIcon size={12} />}
                          {item.itemType}
                        </span>
                      </td>
                    )}

                    {isVisible("category") && (
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                           <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                           <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                             {item.category?.name || "Sin categoría"}
                           </span>
                        </div>
                      </td>
                    )}

                    {isVisible("price") && (
                      <td className="px-4 sm:px-6 py-5 text-right sm:text-left">
                        <div className="flex flex-col">
                          {item.discountPrice ? (
                            <>
                              <span className="text-xs sm:text-sm font-black text-indigo-600 dark:text-indigo-400">
                                ${item.discountPrice.toFixed(2)}
                              </span>
                              <span className="text-[10px] font-bold text-gray-400 line-through decoration-red-500/50">
                                ${item.price.toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="text-xs sm:text-sm font-black text-gray-900 dark:text-white">
                              ${item.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </td>
                    )}

                    {isVisible("stock") && (
                      <td className="px-4 sm:px-6 py-5 text-center">
                        {item.trackInventory ? (
                          <span className={`text-[10px] sm:text-xs font-bold ${item.stockQuantity === 0 ? "text-red-500 animate-pulse" : "text-gray-600 dark:text-gray-400"}`}>
                            {item.stockQuantity} <span className="hidden sm:inline">unid.</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">∞</span>
                        )}
                      </td>
                    )}

                    {isVisible("marketing") && (
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          {item.isFeatured && (
                            <Tooltip>
                              <TooltipTrigger>
                                <div className="p-1.5 bg-amber-50 dark:bg-amber-950/30 rounded-lg shadow-sm border border-amber-100 dark:border-amber-900/30">
                                  <StarIcon size={14} className="text-amber-500" fill="currentColor" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="font-bold">Producto Destacado</TooltipContent>
                            </Tooltip>
                          )}
                          {item.discountPrice && (
                            <Tooltip>
                              <TooltipTrigger>
                                <div className="p-1.5 bg-red-50 dark:bg-red-950/30 rounded-lg shadow-sm border border-red-100 dark:border-red-900/30">
                                  <Ticket01Icon size={14} className="text-red-500" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="font-bold">En Oferta Activa</TooltipContent>
                            </Tooltip>
                          )}
                          {!item.isFeatured && !item.discountPrice && (
                            <span className="text-[10px] font-bold text-gray-300">-</span>
                          )}
                        </div>
                      </td>
                    )}

                    {isVisible("actions") && (
                      <td className="px-4 sm:px-6 py-5 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                          <MoreHorizontalIcon size={18} className="text-gray-400" />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar p-0">
          <DialogHeader className="p-8 border-b border-gray-50 dark:border-gray-900 bg-white/50 dark:bg-black/40 backdrop-blur-md sticky top-0 z-10 sm:text-left flex-row items-center gap-4">
             <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center shrink-0">
                <PlusSignIcon size={24} className="text-indigo-600" />
             </div>
             <div>
                <DialogTitle className="text-2xl font-black tracking-tight">Crear Nuevo Item</DialogTitle>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Añadir producto o servicio</p>
             </div>
          </DialogHeader>
          <div className="p-8 pb-32">
            {storeId && (
              <CreateItemForm 
                storeId={storeId} 
                onSuccess={() => {
                  setIsDialogOpen(false);
                  fetchItems();
                }} 
                onCancel={() => setIsDialogOpen(false)} 
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
