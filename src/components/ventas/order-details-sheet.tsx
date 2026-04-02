"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Order, OrderStatus } from "@/domain/entities/order.entity";
import { Payment, PaymentStatus } from "@/domain/entities/payment.entity";
import { PaymentRepositoryImpl } from "@/infrastructure/repositories/payment.repository.impl";
import { GetStorePaymentsUseCase } from "@/application/use-cases/payment/get-store-payments.use-case";
import { VerifyPaymentUseCase } from "@/application/use-cases/payment/verify-payment.use-case";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  CheckmarkBadge01Icon,
  Cancel01Icon,
  Invoice01Icon,
  UserCircleIcon,
  Loading03Icon,
  ShoppingBasket01Icon,
  CheckmarkCircle02Icon
} from "hugeicons-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getOptimizedImageUrl, IMAGE_PRESETS } from "@/lib/images";
import { useMemo, useState } from "react";

const paymentRepository = new PaymentRepositoryImpl();
const getPaymentsUseCase = new GetStorePaymentsUseCase(paymentRepository);
const verifyPaymentUseCase = new VerifyPaymentUseCase(paymentRepository);

interface OrderDetailsSheetProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
}

export function OrderDetailsSheet({ order, isOpen, onClose, storeId }: OrderDetailsSheetProps) {
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Fetch payments for this specific order
  const { data: paginationData, isLoading: isLoadingPayments } = useQuery({
    queryKey: ["payments", storeId, order?.id],
    queryFn: async () => {
      if (!storeId || !order?.id) return null;
      return await getPaymentsUseCase.execute(storeId);
    },
    enabled: !!order && isOpen,
  });

  const payments = useMemo(() => {
    if (!paginationData || !order) return [];
    const rawPayments: Payment[] = Array.isArray(paginationData) ? paginationData : (paginationData as any).items || [];
    return rawPayments.filter(p => p.order?.id === order.id);
  }, [paginationData, order]);

  const verifyMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: PaymentStatus }) => {
      return await verifyPaymentUseCase.execute(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", storeId, order?.id] });
      queryClient.invalidateQueries({ queryKey: ["orders", storeId] });
      // In a real app we might toast a success message here
    }
  });

  if (!order) return null;

  const handleVerify = (paymentId: string, status: PaymentStatus) => {
    if (confirm(`¿Estás seguro de que deseas marcar este pago como ${status === PaymentStatus.APPROVED ? 'APROBADO' : 'RECHAZADO'}?`)) {
      verifyMutation.mutate({ id: paymentId, status });
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="right" className="w-full sm:max-w-lg p-0 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
          <div className="flex flex-col h-full">
            <SheetHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/20">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-xl font-black flex items-center gap-2">
                   Detalles de Orden
                </SheetTitle>
              </div>
              <SheetDescription className="text-xs uppercase tracking-wider font-bold text-slate-500">
                 ID: <span className="text-slate-700 dark:text-slate-300 ml-1">{order.id}</span>
              </SheetDescription>
              <div className="mt-4 flex gap-2">
                <Badge className={cn("rounded-lg px-2.5 py-1 text-[10px] font-black uppercase border-none", 
                      order.status === OrderStatus.FULLY_PAID ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" :
                      order.status === OrderStatus.PARTIALLY_PAID ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400" :
                      order.status === OrderStatus.CANCELLED ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400" :
                      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    )}>
                  {order.status.replace("_", " ")}
                </Badge>
                {order.isPartialPayment && (
                  <Badge variant="outline" className="rounded-lg px-2.5 py-1 text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20">
                    Pago Parcial
                  </Badge>
                )}
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
              
              {/* Cliente */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  <UserCircleIcon size={16} /> Cliente
                </h4>
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 flex items-center gap-4 border border-slate-100 dark:border-slate-800/60">
                  <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-bold">
                    {order.user?.firstName.charAt(0)}{order.user?.lastName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{order.user?.firstName} {order.user?.lastName}</p>
                    <p className="text-xs font-medium text-slate-500">{order.user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  <ShoppingBasket01Icon size={16} /> Productos
                </h4>
                <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60 rounded-2xl overflow-hidden divide-y divide-slate-50 dark:divide-slate-800/50">
                  {order.orderItems?.map(item => (
                    <div key={item.id} className="p-3 flex items-start justify-between gap-4 group hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                       <div className="flex items-center gap-3">
                         <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                           {item.item?.mainImage ? (
                               <img src={getOptimizedImageUrl(item.item.mainImage, IMAGE_PRESETS.THUMBNAIL_SM)} className="h-full w-full object-cover rounded-xl" alt={item.title} />
                           ) : (
                              <ShoppingBasket01Icon size={16} />
                           )}
                         </div>
                         <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.title}</p>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">CANT: {item.quantity}</p>
                         </div>
                       </div>
                       <div className="text-right mt-1">
                          <p className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(item.price)}</p>
                       </div>
                    </div>
                  ))}
                  
                  {/* Totales */}
                  <div className="bg-slate-50 dark:bg-slate-900/30 p-4 space-y-2">
                     <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                        <span>Subtotal</span>
                        <span>{formatCurrency(order.totalAmount - order.feeAmount)}</span>
                     </div>
                     {order.feeAmount > 0 && (
                        <div className="flex justify-between items-center text-xs font-bold text-amber-600 dark:text-amber-500">
                          <span>Recargo (Financiamiento)</span>
                          <span>+ {formatCurrency(order.feeAmount)}</span>
                        </div>
                     )}
                     <Separator className="my-2 bg-slate-200 dark:bg-slate-800" />
                     <div className="flex justify-between items-center">
                        <span className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">Total</span>
                        <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{formatCurrency(order.finalAmount)}</span>
                     </div>
                     {order.isPartialPayment && (
                        <div className="flex justify-between items-center mt-1">
                           <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Saldo Pendiente</span>
                           <span className={cn("text-xs font-black", order.balance > 0 ? "text-red-500" : "text-emerald-500")}>
                              {formatCurrency(order.balance)}
                           </span>
                        </div>
                     )}
                  </div>
                </div>
              </div>

              {/* Pagos */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  <Invoice01Icon size={16} /> Historial de Pagos
                </h4>
                
                {isLoadingPayments ? (
                  <div className="flex items-center justify-center p-8 text-indigo-600">
                     <Loading03Icon className="animate-spin" size={24} />
                  </div>
                ) : payments.length === 0 ? (
                  <div className="text-center p-8 bg-slate-50 dark:bg-slate-900/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                     <Invoice01Icon className="mx-auto text-slate-400 mb-2" size={24} />
                     <p className="text-xs font-bold text-slate-500">No hay pagos registrados</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payments.map(payment => (
                      <div key={payment.id} className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60 rounded-2xl p-4 overflow-hidden shadow-sm">
                        <div className="flex items-center justify-between mb-3 border-b border-slate-50 dark:border-slate-800/50 pb-3">
                           <div className="flex items-center gap-2">
                             <Badge variant="outline" className={cn("text-[8px] font-black uppercase tracking-widest px-2",
                                payment.status === PaymentStatus.APPROVED ? "border-emerald-200 text-emerald-600 bg-emerald-50" :
                                payment.status === PaymentStatus.REJECTED ? "border-red-200 text-red-600 bg-red-50" :
                                "border-amber-200 text-amber-600 bg-amber-50 animate-pulse"
                              )}>
                                {payment.status.replace("_", " ")}
                             </Badge>
                           </div>
                           <p className="text-sm font-black text-slate-900 dark:text-white">
                             {formatCurrency(payment.amount)} {payment.currency}
                           </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                           <div>
                              <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Método</p>
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{payment.paymentMethod}</p>
                           </div>
                           <div>
                              <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Referencia</p>
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">{payment.reference || "N/A"}</p>
                           </div>
                           <div className="col-span-2">
                              <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Fecha</p>
                              <p className="text-xs font-bold text-slate-500">{new Date(payment.createdAt).toLocaleString()}</p>
                           </div>
                        </div>

                        {/* Recibo/Captura */}
                        {payment.receiptImage && (
                          <div className="mb-4">
                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-2">Comprobante</p>
                            <div 
                              className="w-full h-24 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden cursor-pointer group relative border border-slate-200 dark:border-slate-800"
                              onClick={() => setSelectedImage(payment.receiptImage!)}
                            >
                               <img src={getOptimizedImageUrl(payment.receiptImage, IMAGE_PRESETS.PREVIEW_LG)} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                               <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <p className="text-white text-xs font-bold uppercase">Ver Ampliado</p>
                               </div>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons for Waiting Verification */}
                        {payment.status === PaymentStatus.WAITING_VERIFICATION && (
                          <div className="flex gap-2 pt-2 border-t border-slate-50 dark:border-slate-800/50">
                             <Button 
                                onClick={() => handleVerify(payment.id, PaymentStatus.APPROVED)}
                                disabled={verifyMutation.isPending}
                                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-9 text-xs rounded-xl gap-1 shadow-sm shadow-emerald-500/20"
                              >
                                {verifyMutation.isPending ? <Loading03Icon className="animate-spin size-4" /> : <CheckmarkBadge01Icon size={14} />}
                                Aprobar
                             </Button>
                             <Button 
                                onClick={() => handleVerify(payment.id, PaymentStatus.REJECTED)}
                                disabled={verifyMutation.isPending}
                                variant="outline"
                                className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 dark:border-red-900/50 font-bold h-9 text-xs rounded-xl gap-1"
                              >
                                <Cancel01Icon size={14} /> Rechazar
                             </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Full Screen Image Viewer Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-100 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
           <Button 
             variant="ghost" 
             className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full h-12 w-12"
             onClick={() => setSelectedImage(null)}
           >
             <Cancel01Icon size={24} />
           </Button>
           <img src={getOptimizedImageUrl(selectedImage, IMAGE_PRESETS.PREVIEW_LG)} className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" />
        </div>
      )}
    </>
  );
}
