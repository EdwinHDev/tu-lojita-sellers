"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Wallet01Icon,
  PercentIcon,
  Calendar01Icon,
  CheckmarkCircle01Icon,
  Loading03Icon,
  HelpSquareIcon,
  InformationCircleIcon,
  CreditCardIcon,
  BankIcon,
  Cash01Icon,
  SmartPhone01Icon
} from "hugeicons-react";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { StoreRepositoryImpl } from "@/infrastructure/repositories/store.repository.impl";
import { GetStoreUseCase } from "@/application/use-cases/store/get-store.use-case";
import { UpdateStoreUseCase } from "@/application/use-cases/store/update-store.use-case";
import { Store } from "@/domain/entities/store.entity";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const paymentSchema = z.object({
  allowPartialPayments: z.boolean(),
  partialPaymentsFeePercentage: z.number().min(0).max(100),
  minInitialPaymentPercentage: z.number().min(0).max(100),
  maxInstallments: z.number().min(1).max(36),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentSettingsFormProps {
  storeId: string;
}

const storeRepository = new StoreRepositoryImpl();
const getStoreUseCase = new GetStoreUseCase(storeRepository);
const updateStoreUseCase = new UpdateStoreUseCase(storeRepository);

export function PaymentSettingsForm({ storeId }: PaymentSettingsFormProps) {
  const [store, setStore] = useState<Store | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      allowPartialPayments: false,
      partialPaymentsFeePercentage: 0,
      minInitialPaymentPercentage: 0,
      maxInstallments: 1,
    }
  });

  const allowPartialPayments = watch("allowPartialPayments");

  useEffect(() => {
    const loadData = async () => {
      try {
        const storeData = await getStoreUseCase.execute(storeId);
        setStore(storeData);
        
        reset({
          allowPartialPayments: storeData.allowPartialPayments ?? false,
          partialPaymentsFeePercentage: Number(storeData.partialPaymentsFeePercentage) || 0,
          minInitialPaymentPercentage: Number(storeData.minInitialPaymentPercentage) || 0,
          maxInstallments: storeData.maxInstallments || 1,
        });
      } catch (error) {
        console.error("Error loading payment settings:", error);
      }
    };
    loadData();
  }, [storeId, reset]);

  const onSubmit = async (data: PaymentFormData) => {
    try {
      setIsSubmitting(true);
      setSuccessMessage(null);

      await updateStoreUseCase.execute(storeId, {
        allowPartialPayments: data.allowPartialPayments,
        partialPaymentsFeePercentage: data.partialPaymentsFeePercentage,
        minInitialPaymentPercentage: data.minInitialPaymentPercentage,
        maxInstallments: data.maxInstallments,
      });

      setSuccessMessage("Configuración de pagos actualizada");
      reset(data);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error updating payment settings:", error);
      alert("Error al actualizar la configuración de pagos");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!store) {
    return (
      <div className="space-y-6">
        <div className="h-64 w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />
        <div className="h-48 w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8 pb-32">
      {/* Pagos Parciales (Financiamiento Propio) */}
      <Card className="rounded-3xl shadow-none border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 overflow-hidden">
        <CardHeader className="border-b border-gray-50 dark:border-gray-800/50 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
                <Wallet01Icon size={20} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Pagos Parciales</CardTitle>
                <CardDescription className="text-xs">Permite a tus clientes pagar en cuotas (Financiamiento Propio).</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest transition-colors",
                allowPartialPayments ? "text-emerald-500" : "text-gray-400"
              )}>
                {allowPartialPayments ? "Activo" : "Inactivo"}
              </span>
              <button
                type="button"
                onClick={() => setValue("allowPartialPayments", !allowPartialPayments, { shouldDirty: true })}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                  allowPartialPayments ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-800"
                )}
              >
                <span className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  allowPartialPayments ? "translate-x-6" : "translate-x-1"
                )} />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <AnimatePresence mode="wait">
            {allowPartialPayments ? (
              <motion.div
                key="partial-enabled"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Field>
                    <FieldLabel className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-2">
                      Recargo por Financiamiento (%)
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpSquareIcon size={14} className="text-gray-300" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[200px]">Porcentaje adicional aplicado al total por el servicio de pago en cuotas.</TooltipContent>
                      </Tooltip>
                    </FieldLabel>
                    <div className="relative group">
                      <PercentIcon size={16} className="absolute left-3 top-3 text-gray-400" />
                      <Input
                        type="number"
                        step="0.01"
                        {...register("partialPaymentsFeePercentage", { valueAsNumber: true })}
                        className="pl-10 h-11 rounded-xl border-gray-200 dark:border-gray-800 font-bold"
                        placeholder="0.00"
                      />
                    </div>
                    <FieldError errors={[errors.partialPaymentsFeePercentage]} />
                  </Field>

                  <Field>
                    <FieldLabel className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-2">
                      Abono Inicial Mínimo (%)
                    </FieldLabel>
                    <div className="relative group">
                      <Wallet01Icon size={16} className="absolute left-3 top-3 text-gray-400" />
                      <Input
                        type="number"
                        step="0.01"
                        {...register("minInitialPaymentPercentage", { valueAsNumber: true })}
                        className="pl-10 h-11 rounded-xl border-gray-200 dark:border-gray-800 font-bold"
                        placeholder="0.00"
                      />
                    </div>
                    <FieldError errors={[errors.minInitialPaymentPercentage]} />
                  </Field>

                  <Field>
                    <FieldLabel className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-2">
                      Máximo de Cuotas
                    </FieldLabel>
                    <div className="relative group">
                      <Calendar01Icon size={16} className="absolute left-3 top-3 text-gray-400" />
                      <Input
                        type="number"
                        {...register("maxInstallments", { valueAsNumber: true })}
                        className="pl-10 h-11 rounded-xl border-gray-200 dark:border-gray-800 font-bold"
                        placeholder="1"
                      />
                    </div>
                    <FieldError errors={[errors.maxInstallments]} />
                  </Field>
                </div>

                <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-800/30 flex gap-4">
                  <div className="shrink-0 text-blue-500">
                    <InformationCircleIcon size={20} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-widest">Resumen de Cobro</h4>
                    <p className="text-[11px] text-blue-700/70 dark:text-blue-400/70 leading-relaxed font-medium">
                      Al activar pagos parciales, el sistema permitirá a los clientes reservar productos pagando al menos el {watch("minInitialPaymentPercentage")}% del total. 
                      Se aplicará un recargo del {watch("partialPaymentsFeePercentage")}% calculado sobre el subtotal bruto.
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="partial-disabled"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-8 text-center space-y-3"
              >
                <div className="h-12 w-12 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-300">
                  <Wallet01Icon size={24} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-gray-400">Pagos Parciales Deshabilitados</h4>
                  <p className="text-[11px] text-gray-500 max-w-[300px]">Tus clientes deberán pagar el total de la orden en una sola transacción.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Métodos de Pago Disponibles (Próximamente) */}
      <Card className="rounded-3xl shadow-none border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50">
        <CardHeader className="border-b border-gray-50 dark:border-gray-800/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl">
              <CreditCardIcon size={20} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">Métodos de Cobro</CardTitle>
              <CardDescription className="text-xs">Configura cómo deseas recibir los pagos de tus clientes.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { id: "transferencia", label: "Zelle / Transferencia", icon: BankIcon, active: true },
            { id: "pagomovil", label: "Pago Móvil", icon: SmartPhone01Icon, active: true },
            { id: "efectivo", label: "Efectivo / Divisas", icon: Cash01Icon, active: true },
          ].map((method) => (
            <div key={method.id} className="relative group">
              <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30 flex flex-col items-center text-center gap-3 grayscale opacity-60">
                <div className="p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm">
                  <method.icon size={24} className="text-gray-400" />
                </div>
                <span className="text-xs font-bold text-gray-500">{method.label}</span>
                <Badge variant="ghost" className="text-[9px] font-black uppercase text-gray-300 tracking-tighter">Próximamente</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-between gap-4 p-4 sm:p-6 bg-white dark:bg-black/40 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-3xl sticky bottom-4 sm:bottom-8 shadow-2xl z-20">
        <div className="flex-1 min-w-0">
          {successMessage ? (
            <p className="text-xs sm:text-sm font-black text-green-600 flex items-center gap-2">
              <CheckmarkCircle01Icon size={18} /> {successMessage}
            </p>
          ) : isDirty ? (
            <p className="text-xs sm:text-sm font-bold text-amber-500 truncate">Tienes cambios pendientes en la configuración</p>
          ) : (
            <p className="text-xs sm:text-sm font-medium text-gray-400 truncate">Configuración al día</p>
          )}
        </div>
        <Button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all text-sm shrink-0"
        >
          {isSubmitting ? <Loading03Icon className="animate-spin size-4" /> : "Actualizar Pagos"}
        </Button>
      </div>
    </form>
  );
}
