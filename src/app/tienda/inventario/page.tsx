"use client";

import { useState, useEffect, useMemo } from "react";
import {
  PackageIcon,
  PlusSignIcon,
  ShoppingBasket01Icon,
  ZapIcon,
  Search01Icon,
  MoreHorizontalIcon,
  StarIcon,
  Ticket01Icon,
  Delete02Icon,
  PencilEdit01Icon,
  Sorting05Icon,
  FilterIcon,
  InformationCircleIcon,
  Refresh01Icon,
  PackageAdd01Icon
} from "hugeicons-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence, Variants } from "framer-motion";


import { Button } from "@/components/ui/button";
import { useStoreCheck } from "@/hooks/use-store-check";
import { useIsXl } from "@/hooks/use-breakpoints";
import { ItemRepositoryImpl } from "@/infrastructure/repositories/item.repository.impl";
import { GetItemsUseCase } from "@/application/use-cases/item/get-items.use-case";
import { Item, ItemType, PriceType } from "@/domain/entities/item.entity";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Card, CardContent } from "@/components/ui/card";

const itemRepository = new ItemRepositoryImpl();
const getItemsUseCase = new GetItemsUseCase(itemRepository);

interface StatCard {
  label: string;
  value: number | string;
  icon: any;
  color: string;
  sub?: string;
}


const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: "item", label: "Item / Detalle", visible: true, alwaysVisible: true },
  { id: "type", label: "Categorización", visible: true },
  { id: "price", label: "Precio y Oferta", visible: true },
  { id: "stock", label: "Existencias", visible: true },
  { id: "actions", label: "Acciones", visible: true, alwaysVisible: true },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 25 }
  }
};


export default function InventarioPage() {
  const { storeId } = useStoreCheck();
  const isXl = useIsXl();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
  const [filterType, setFilterType] = useState<ItemType | "ALL">("ALL");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const saved = localStorage.getItem("inventory_columns_v2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setColumns(parsed);
      } catch (e) {
        console.error("Error loading column preferences");
      }
    }
  }, []);

  const handleColumnsChange = (newColumns: ColumnConfig[]) => {
    setColumns(newColumns);
    localStorage.setItem("inventory_columns_v2", JSON.stringify(newColumns));
  };

  const isVisible = (id: string) => columns.find(c => c.id === id)?.visible;

  // TanStack Query for items
  const { data: items = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ["inventory", storeId, debouncedSearch],
    queryFn: async () => {
      if (!storeId) return [];
      const response = await getItemsUseCase.execute(storeId, {
        q: debouncedSearch || undefined,
        limit: 100,
      });
      return response.data;
    },
    enabled: !!storeId,
  });

  // Derived Stats
  const stats = useMemo(() => {
    const total = items.length;
    const lowStock = items.filter(i => i.trackInventory && (i.stockQuantity || 0) < 5).length;
    const productsCount = items.filter(i => i.itemType === ItemType.PRODUCT).length;
    const servicesCount = items.filter(i => i.itemType === ItemType.SERVICE).length;
    const itemsInOffer = items.filter(i => i.discountPrice).length;

    return { total, lowStock, productsCount, servicesCount, itemsInOffer };
  }, [items]);

  // Filtering Logic
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (filterType === "ALL") return true;
      return item.itemType === filterType;
    });
  }, [items, filterType]);

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await itemRepository.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-black/20 transition-colors duration-300">
      {/* ─── Premium Header ─── */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white/70 backdrop-blur-xl px-6 dark:bg-slate-950/80 z-20 sticky top-0 border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger render={<SidebarTrigger className="-ml-1 text-slate-500 hover:text-indigo-600 transition-colors" />} />
            <TooltipContent side="bottom" align="start" className="font-bold">Menú Lateral</TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="h-4 bg-slate-200 dark:bg-slate-800" />
          <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
            <span className="hover:text-indigo-600 cursor-pointer transition-colors">Tienda</span>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-indigo-600 dark:text-indigo-400">Inventario</span>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            iconSize="lg"
            onClick={() => refetch()}
            className={cn("rounded-xl text-slate-500 hover:bg-white dark:hover:bg-slate-800", isFetching && "animate-spin text-indigo-600")}
          >
            <Refresh01Icon size={20} />
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-8">

        {/* ─── Page Title ─── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              Gestión de Inventario
              <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse hidden sm:inline-block" />
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-slate-500 font-medium">Controla el stock, precios y promociones de tu catálogo digital.</p>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            size="lg"
            iconSize="lg"
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-black h-14 px-8 rounded-2xl shadow-2xl shadow-indigo-600/30 transition-all hover:-translate-y-1 active:scale-95 gap-3"
          >
            <PlusSignIcon size={20} />
            Crear Nuevo Item
          </Button>
        </div>

        {/* ─── Stats Section ─── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {[
            { label: "Total Catálogo", value: stats.total, icon: PackageIcon, color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30" },
            { label: "Alerta Stock", value: stats.lowStock, icon: InformationCircleIcon, color: "bg-red-50 text-red-600 dark:bg-red-950/30", sub: "Menos de 5 unid." },
            { label: "Servicios", value: stats.servicesCount, icon: ZapIcon, color: "bg-purple-50 text-purple-600 dark:bg-purple-950/30" },
            { label: "En Oferta", value: stats.itemsInOffer, icon: Ticket01Icon, color: "bg-amber-50 text-amber-600 dark:bg-amber-950/30" },
          ].map((stat: StatCard, idx) => (

            <motion.div key={idx} variants={cardVariants}>
              <Card className="border-none shadow-sm hover:shadow-md transition-shadow group cursor-default h-full">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                      {isLoading ? <Skeleton className="h-8 w-12" /> : stat.value}
                    </h3>
                    {stat.sub && <p className="text-[10px] font-bold text-red-500/80">{stat.sub}</p>}
                  </div>
                  <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500", stat.color)}>
                    <stat.icon size={28} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* ─── Advanced Toolbar ─── */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-4 bg-white/50 dark:bg-slate-900/50 p-3 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 backdrop-blur-sm shadow-sm group/toolbar overflow-hidden w-full">
          <div className="relative w-full xl:w-80 transition-all duration-300 focus-within:xl:w-96">
            <Search01Icon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Busca por nombre, descripción o SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-xl pl-12 pr-4 h-11 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
            />
          </div>

          <Separator orientation="vertical" className="hidden xl:block h-8 my-auto opacity-50" />

          {/* Wrapper for Filters and Actions on Mobile */}
          <div className="flex flex-row items-center justify-between w-full xl:contents">
            {/* Mobile Scrollable Filters */}
            <div className="w-auto xl:w-auto overflow-x-auto no-scrollbar py-0.5">
              <div className="flex items-center gap-2 min-w-max xl:min-w-0">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant={filterType === "ALL" ? "default" : (isXl ? "ghost" : "outline")}
                        onClick={() => setFilterType("ALL")}
                        size={isXl ? "lg" : "icon-xl"}
                        iconSize="md"
                        className={cn("rounded-xl font-bold shrink-0", filterType === "ALL" ? "bg-indigo-600 shadow-lg shadow-indigo-600/20 text-white" : "text-slate-500", isXl && "px-4")}
                      >
                        <PackageIcon
                          {...(isXl && { "data-icon": "inline-start" })}
                        />
                        {isXl && <span>Todos</span>}
                      </Button>
                    }
                  />
                  <TooltipContent className="font-bold">Todos los Items</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant={filterType === ItemType.PRODUCT ? "default" : (isXl ? "ghost" : "outline")}
                        onClick={() => setFilterType(ItemType.PRODUCT)}
                        size={isXl ? "lg" : "icon-xl"}
                        iconSize="md"
                        className={cn("rounded-xl font-bold shrink-0", filterType === ItemType.PRODUCT ? "bg-indigo-600 shadow-lg shadow-indigo-600/20 text-white" : "text-slate-500", isXl && "px-4")}
                      >
                        <ShoppingBasket01Icon
                          {...(isXl && { "data-icon": "inline-start" })}
                        />
                        {isXl && <span>Productos</span>}
                      </Button>
                    }
                  />
                  <TooltipContent className="font-bold">Filtrar por Productos</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant={filterType === ItemType.SERVICE ? "default" : (isXl ? "ghost" : "outline")}
                        onClick={() => setFilterType(ItemType.SERVICE)}
                        size={isXl ? "lg" : "icon-xl"}
                        iconSize="md"
                        className={cn("rounded-xl font-bold shrink-0", filterType === ItemType.SERVICE ? "bg-indigo-600 shadow-lg shadow-indigo-600/20 text-white" : "text-slate-500", isXl && "px-4")}
                      >
                        <ZapIcon
                          {...(isXl && { "data-icon": "inline-start" })}
                        />
                        {isXl && <span>Servicios</span>}
                      </Button>
                    }
                  />
                  <TooltipContent className="font-bold">Filtrar por Servicios</TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className="xl:ml-auto flex items-center gap-3 w-auto sm:w-auto overflow-x-auto no-scrollbar xl:overflow-visible py-0.5">
              <ColumnSelector columns={columns} onChange={handleColumnsChange} />
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="outline"
                      size={isXl ? "lg" : "icon-xl"}
                      iconSize="md"
                      className={cn("rounded-xl font-bold text-slate-600 hover:bg-slate-50 shrink-0", isXl && "px-4")}
                    >
                      <Sorting05Icon
                        {...(isXl && { "data-icon": "inline-start" })}
                      />
                      {isXl && <span>Ordenar</span>}
                    </Button>
                  }
                />
                <TooltipContent className="font-bold">Ordenar Catálogo</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* ─── Data Section ─── */}
        <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl shadow-indigo-600/5 overflow-hidden min-h-[500px]">
          {isLoading ? (
            <div className="p-8 space-y-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="flex items-center gap-6 animate-pulse">
                  <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-900" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-1/3 bg-slate-100 dark:bg-slate-900 rounded-lg" />
                    <div className="h-3 w-1/4 bg-slate-50 dark:bg-slate-900/50 rounded-lg" />
                  </div>
                  <div className="h-10 w-24 bg-slate-50 dark:bg-slate-900 rounded-lg" />
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center p-20 text-center space-y-6"
              >
                <div className="h-32 w-32 rounded-3xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center relative group">
                  <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <PackageIcon size={64} className="text-slate-300 dark:text-slate-700" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Tu escaparate está esperando</h3>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto font-medium">Añade productos o servicios para que tus clientes puedan empezar a comprar en tu tienda "Tu Lojita".</p>
                </div>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="gap-2 bg-indigo-600 hover:bg-slate-900 dark:hover:bg-white dark:hover:text-slate-950 font-bold px-8 py-6 rounded-2xl transition-all text-white"
                >
                  <PackageAdd01Icon size={20} className="text-current w-5!" />
                  Subir mi primer item ahora
                </Button>

              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="overflow-x-auto no-scrollbar">
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                  <TableRow className="hover:bg-transparent">
                    {columns.filter(c => c.visible).map((col) => (
                      <TableHead
                        key={col.id}
                        className={cn(
                          "px-6 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-400",
                          col.id === "price" && "text-right lg:text-left",
                          col.id === "stock" && "text-center",
                          col.id === "actions" && "text-right"
                        )}
                      >
                        {col.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {filteredItems.map((item) => (
                      <motion.tr
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={item.id}
                        className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/40 border-b border-slate-50 dark:border-slate-900/50 transition-colors cursor-default"
                      >
                        {isVisible("item") && (
                          <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800 shadow-sm relative group/img">
                                {item.mainImage ? (
                                  <img
                                    src={getOptimizedImageUrl(item.mainImage, IMAGE_PRESETS.THUMBNAIL_MD)}
                                    alt={item.title}
                                    className="h-full w-full object-cover group-hover/img:scale-125 transition-transform duration-700 ease-in-out"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-slate-300">
                                    <PackageIcon size={20} />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-black text-slate-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{item.title}</p>
                                <p className="text-[10px] font-bold text-slate-400 truncate max-w-[200px] uppercase tracking-wider">{item.category?.name || "Sin Categoría"}</p>
                              </div>
                            </div>
                          </TableCell>
                        )}

                        {isVisible("type") && (
                          <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              {item.itemType === ItemType.PRODUCT ? (
                                <Badge variant="secondary" className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 gap-1.5 font-black uppercase text-[10px] px-2.5 py-1 rounded-lg border-none">
                                  <ShoppingBasket01Icon size={12} strokeWidth={3} />
                                  Producto
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400 gap-1.5 font-black uppercase text-[10px] px-2.5 py-1 rounded-lg border-none">
                                  <ZapIcon size={12} strokeWidth={3} />
                                  Servicio
                                </Badge>
                              )}
                              {item.isFeatured && (
                                <Tooltip>
                                  <TooltipTrigger render={<div className="text-amber-500 animate-pulse"><StarIcon size={16} fill="currentColor" /></div>} />
                                  <TooltipContent className="font-bold">Item Destacado</TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </TableCell>
                        )}

                        {isVisible("price") && (
                          <TableCell className="px-6 py-4">
                            <div className="flex flex-col text-right lg:text-left">
                              {item.priceType === PriceType.FREE ? (
                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 font-black uppercase text-[10px] w-fit">Gratis</Badge>
                              ) : item.priceType === PriceType.ON_DEMAND ? (
                                <Badge variant="secondary" className="bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 font-black uppercase text-[10px] w-fit">A Consultar</Badge>
                              ) : (
                                <>
                                  {item.discountPrice ? (
                                    <>
                                      <div className="flex items-center gap-1.5">
                                        {item.priceType === PriceType.STARTING_AT && <span className="text-[9px] font-black uppercase text-indigo-400">Desde</span>}
                                        <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                                          ${item.discountPrice.toLocaleString()}
                                        </span>
                                      </div>
                                      <span className="text-[10px] font-bold text-slate-400 line-through opacity-60">
                                        ${item.price.toLocaleString()}
                                      </span>
                                    </>
                                  ) : (
                                    <div className="flex items-center gap-1.5 font-black text-slate-900 dark:text-white">
                                      {item.priceType === PriceType.STARTING_AT && <span className="text-[9px] font-black uppercase text-slate-400">Desde</span>}
                                      {item.priceType === PriceType.NEGOTIABLE && <span className="text-[9px] font-black uppercase text-slate-400">Negociable</span>}
                                      <span className="text-sm">
                                        ${item.price.toLocaleString()}
                                      </span>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </TableCell>
                        )}

                        {isVisible("stock") && (
                          <TableCell className="px-6 py-4 text-center">
                            {item.trackInventory ? (
                              <div className="inline-flex flex-col items-center min-w-[60px]">
                                <span className={cn(
                                  "text-xs font-black",
                                  item.stockQuantity === 0 ? "text-red-500" : (item.stockQuantity || 0) < 5 ? "text-amber-500" : "text-slate-600 dark:text-slate-400"
                                )}>
                                  {item.stockQuantity} <span className="text-[9px] uppercase tracking-tighter">u.</span>
                                </span>
                                <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                                  <div
                                    className={cn(
                                      "h-full transition-all duration-1000",
                                      item.stockQuantity === 0 ? "bg-red-500 w-0" : (item.stockQuantity || 0) < 5 ? "bg-amber-500 w-1/3" : "bg-emerald-500 w-full"
                                    )}
                                  />
                                </div>
                              </div>
                            ) : (
                              <Badge variant="ghost" className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] bg-transparent">Unlimited</Badge>
                            )}
                          </TableCell>
                        )}

                        {isVisible("actions") && (
                          <TableCell className="px-6 py-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <Button variant="ghost" size="icon" iconSize="lg" className="h-10 w-10 rounded-2xl hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 shadow-none">
                                    <MoreHorizontalIcon size={20} className="text-slate-400" />
                                  </Button>
                                }
                              />
                              <DropdownMenuContent align="end" className="w-56 rounded-[1.5rem] p-2 shadow-2xl shadow-indigo-600/10 border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                                <DropdownMenuGroup>
                                  <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-3 py-2">Opciones de Item</DropdownMenuLabel>
                                  <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                                  <DropdownMenuItem className="rounded-xl gap-3 font-bold py-2.5 cursor-pointer text-slate-600 dark:text-slate-300 focus:bg-indigo-50 dark:focus:bg-indigo-950/20 focus:text-indigo-600">
                                    <PencilEdit01Icon size={20} />
                                    Detalles y Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                                  <DropdownMenuItem
                                    className="rounded-xl gap-3 font-bold py-2.5 cursor-pointer text-red-500 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
                                    onClick={() => deleteMutation.mutate(item.id)}
                                  >
                                    <Delete02Icon size={20} />
                                    Eliminar del Catálogo
                                  </DropdownMenuItem>
                                </DropdownMenuGroup>
                              </DropdownMenuContent>

                            </DropdownMenu>
                          </TableCell>
                        )}
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* ─── Standard Dialog for Creation ─── */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-4xl p-0 bg-white dark:bg-slate-950 border-none rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-slate-200 dark:ring-white/10">
            {storeId && (
              <CreateItemForm
                storeId={storeId}
                onSuccess={() => {
                  setIsDialogOpen(false);
                  queryClient.invalidateQueries({ queryKey: ["inventory"] });
                }}
                onCancel={() => setIsDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>



      </main >
    </div >
  );
}
