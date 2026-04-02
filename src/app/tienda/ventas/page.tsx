"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Invoice01Icon,
  Search01Icon,
  Refresh01Icon,
  DollarCircleIcon,
  PackageDeliveredIcon,
  AlertCircleIcon,
  Invoice01Icon as Receipt01Icon, // Aliased to keep rest of code unchanged or just replace below
  UserCircleIcon,
  MoreHorizontalIcon,
  EyeIcon,
  FilterIcon
} from "hugeicons-react";
import { motion, AnimatePresence, Variants } from "framer-motion";

import { useStoreCheck } from "@/hooks/use-store-check";
import { useIsXl } from "@/hooks/use-breakpoints";
import { OrderRepositoryImpl } from "@/infrastructure/repositories/order.repository.impl";
import { GetStoreOrdersUseCase } from "@/application/use-cases/order/get-store-orders.use-case";
import { Order, OrderStatus } from "@/domain/entities/order.entity";
import { OrderDetailsSheet } from "@/components/ventas/order-details-sheet";
import { getOptimizedImageUrl, IMAGE_PRESETS } from "@/lib/images";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatCurrency } from "@/lib/utils";

const orderRepository = new OrderRepositoryImpl();
const getOrdersUseCase = new GetStoreOrdersUseCase(orderRepository);

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

export default function VentasPage() {
  const { storeId } = useStoreCheck();
  const isXl = useIsXl();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Debounce search
  useMemo(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch Orders
  const { data: paginationData, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["orders", storeId, debouncedSearch, statusFilter],
    queryFn: async () => {
      if (!storeId) return null;
      return await getOrdersUseCase.execute({
        storeId,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        limit: 50,
      });
    },
    enabled: !!storeId,
  });

  // Handle difference if backend returns array vs pagination object
  // Based on the GetStoreOrdersUseCase, it returns whatever backend returns.
  // The DTO says it responds with PaginationDto array basically, but typically it's an object with `items`.
  // If it's just an array, we map it, if it has `items`, we extract.
  const rawOrders: Order[] = Array.isArray(paginationData) ? paginationData : paginationData?.items || [];
  
  // Local filter for search text since `q` might not be natively supported perfectly for user names in all backends
  const orders = useMemo(() => {
    if (!debouncedSearch) return rawOrders;
    const lowerQ = debouncedSearch.toLowerCase();
    return rawOrders.filter(order => 
      order.id.toLowerCase().includes(lowerQ) ||
      `${order.user?.firstName} ${order.user?.lastName}`.toLowerCase().includes(lowerQ) ||
      order.user?.email.toLowerCase().includes(lowerQ)
    );
  }, [rawOrders, debouncedSearch]);

  // Stats calculation
  const stats = useMemo(() => {
    let totalSales = 0;
    let pendingBalance = 0;
    let requiredValidations = 0; // We might not have direct payment info here, but we can guess by orders waiting. We'll simplify.
    
    // As we don't have all payments loaded upfront, we use the order data.
    // Backend order entity has `balance` and `finalAmount`.
    rawOrders.forEach(order => {
      if (order.status !== OrderStatus.CANCELLED) {
        totalSales += (order.finalAmount - order.balance); // What has been paid so far
        pendingBalance += order.balance; // What is owed
      }
    });

    return { 
      totalOrders: rawOrders.length,
      totalSales,
      pendingBalance,
      cancelled: rawOrders.filter(o => o.status === OrderStatus.CANCELLED).length
    };
  }, [rawOrders]);

  const handleOpenDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsSheetOpen(true);
  };

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
            <span className="text-indigo-600 dark:text-indigo-400">Ventas y Pagos</span>
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
              Gestión de Ventas
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-slate-500 font-medium">Controla tus ingresos, abonos y revisa el estatus financiero de cada orden.</p>
          </div>
        </div>

        {/* ─── Stats Section ─── */}
        <motion.div
           variants={containerVariants}
           initial="hidden"
           animate="visible"
           className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {[
            { label: "Ingresos Recibidos", value: formatCurrency(stats.totalSales), icon: DollarCircleIcon, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30", sub: "Cobrado con éxito" },
            { label: "Balance Pendiente", value: formatCurrency(stats.pendingBalance), icon: AlertCircleIcon, color: "bg-amber-50 text-amber-600 dark:bg-amber-950/30", sub: "Por cobrar en cuotas" },
            { label: "Órdenes Totales", value: stats.totalOrders, icon: PackageDeliveredIcon, color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30" },
            { label: "Órdenes Canceladas", value: stats.cancelled, icon: Invoice01Icon, color: "bg-red-50 text-red-600 dark:bg-red-950/30" },
          ].map((stat, idx) => (
             <motion.div key={idx} variants={cardVariants}>
               <Card className="border-none shadow-sm hover:shadow-md transition-shadow group cursor-default h-full">
                 <CardContent className="p-6 flex items-center justify-between">
                   <div className="space-y-1">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                     <h3 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white leading-none">
                       {isLoading ? <Skeleton className="h-8 w-20" /> : stat.value}
                     </h3>
                     {stat.sub && <p className="text-[10px] font-bold text-slate-400">{stat.sub}</p>}
                   </div>
                   <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shrink-0", stat.color)}>
                     <stat.icon size={28} />
                   </div>
                 </CardContent>
               </Card>
             </motion.div>
          ))}
        </motion.div>

        {/* ─── Toolbar ─── */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-4 bg-white/50 dark:bg-slate-900/50 p-3 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 backdrop-blur-sm shadow-sm overflow-hidden w-full">
          <div className="relative w-full xl:w-[400px]">
            <Search01Icon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por ID, nombre o correo del cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-xl pl-12 pr-4 h-11 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
            />
          </div>

          <Separator orientation="vertical" className="hidden xl:block h-8 my-auto opacity-50" />

          <div className="w-auto overflow-x-auto no-scrollbar py-0.5">
             <div className="flex items-center gap-2 min-w-max">
                {([
                  { id: "ALL", label: "Todas", icon: FilterIcon },
                  { id: OrderStatus.PENDING, label: "Pendientes", icon: AlertCircleIcon },
                  { id: OrderStatus.PARTIALLY_PAID, label: "Pago Parcial", icon: DollarCircleIcon },
                  { id: OrderStatus.FULLY_PAID, label: "Pagado", icon: PackageDeliveredIcon },
                ] as const).map(filter => (
                  <Button
                    key={filter.id}
                    variant={statusFilter === filter.id ? "default" : "outline"}
                    onClick={() => setStatusFilter(filter.id)}
                    size="lg"
                    className={cn("rounded-xl font-bold shrink-0 shadow-none border-transparent", 
                      statusFilter === filter.id 
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                        : "bg-transparent hover:bg-slate-100 border border-slate-200 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-500")}
                  >
                    <filter.icon size={16} className="mr-2" />
                    {filter.label}
                  </Button>
                ))}
             </div>
          </div>
        </div>

        {/* ─── Data Section ─── */}
        <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl shadow-indigo-600/5 overflow-hidden min-h-[500px]">
          {isLoading ? (
             <div className="p-8 space-y-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center gap-6 animate-pulse">
                    <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-900 shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-1/4 bg-slate-100 dark:bg-slate-900 rounded-lg" />
                      <div className="h-3 w-1/5 bg-slate-50 dark:bg-slate-900/50 rounded-lg" />
                    </div>
                    <div className="h-8 w-24 bg-slate-50 dark:bg-slate-900 rounded-lg" />
                  </div>
                ))}
             </div>
          ) : orders.length === 0 ? (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center p-20 text-center space-y-6"
              >
                <div className="h-32 w-32 rounded-3xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center relative group">
                  <div className="absolute inset-0 bg-indigo-500/10 rounded-[3rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Receipt01Icon size={64} className="text-slate-300 dark:text-slate-700" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Ninguna orden encontrada</h3>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto font-medium">Aún no hay registros de ventas que coincidan con estos filtros.</p>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="overflow-x-auto no-scrollbar">
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                  <TableRow className="hover:bg-transparent">
                     <TableHead className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">Cliente</TableHead>
                     <TableHead className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">Estatus</TableHead>
                     <TableHead className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">Fecha</TableHead>
                     <TableHead className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 text-right">Monto / Deuda</TableHead>
                     <TableHead className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                   <AnimatePresence mode="popLayout">
                     {orders.map((order) => (
                        <motion.tr
                           layout
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           exit={{ opacity: 0 }}
                           key={order.id}
                           className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/40 border-b border-slate-50 dark:border-slate-900/50 transition-colors"
                        >
                           {/* Cliente */}
                           <TableCell className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <div className="h-10 w-10 shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black rounded-full flex items-center justify-center">
                                   {order.user?.firstName.charAt(0)}{order.user?.lastName.charAt(0)}
                                </div>
                                <div>
                                   <p className="text-sm font-black text-slate-900 dark:text-white capitalize">{order.user?.firstName} {order.user?.lastName}</p>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{order.user?.email}</p>
                                   <p className="text-[9px] font-bold text-slate-300 dark:text-slate-600 tracking-wider">ID: {order.id.split('-')[0]}</p>
                                </div>
                              </div>
                           </TableCell>

                           {/* Estatus */}
                           <TableCell className="px-6 py-4">
                              <div className="flex flex-col gap-1.5 items-start">
                                 <Badge className={cn("text-[9px] font-black uppercase tracking-widest px-2.5 py-1 border-none",
                                    order.status === OrderStatus.FULLY_PAID ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" :
                                    order.status === OrderStatus.PARTIALLY_PAID ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400" :
                                    order.status === OrderStatus.CANCELLED ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400" :
                                    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                  )}>
                                    {order.status.replace("_", " ")}
                                 </Badge>
                                 {order.isPartialPayment && (
                                   <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded-md">Financiado</span>
                                 )}
                              </div>
                           </TableCell>

                           {/* Fecha */}
                           <TableCell className="px-6 py-4">
                              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                 {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                              {order.nextDueDate && order.status !== OrderStatus.FULLY_PAID && order.status !== OrderStatus.CANCELLED && (
                                <p className="text-[10px] font-black text-amber-500 mt-1 uppercase tracking-wider">
                                   Vence: {new Date(order.nextDueDate).toLocaleDateString()}
                                </p>
                              )}
                           </TableCell>

                           {/* Monto & Balance */}
                           <TableCell className="px-6 py-4 text-right">
                              <p className="text-sm font-black text-slate-900 dark:text-white">
                                 {formatCurrency(order.finalAmount)}
                              </p>
                              {order.isPartialPayment && order.balance > 0 && (
                                 <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mt-1">
                                    Deuda: {formatCurrency(order.balance)}
                                 </p>
                              )}
                           </TableCell>

                           {/* Acciones */}
                           <TableCell className="px-6 py-4 text-right">
                              <Button 
                                onClick={() => handleOpenDetails(order)}
                                variant="outline" 
                                size="sm" 
                                className="h-9 font-bold bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 shadow-sm gap-2 rounded-xl"
                              >
                                <EyeIcon size={16} /> Ver Detalles
                              </Button>
                           </TableCell>
                        </motion.tr>
                     ))}
                   </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>

      {/* Side Panel Form / Details */}
      <OrderDetailsSheet 
         order={selectedOrder} 
         isOpen={isSheetOpen} 
         onClose={() => setIsSheetOpen(false)} 
         storeId={storeId!} 
      />

    </div>
  );
}
