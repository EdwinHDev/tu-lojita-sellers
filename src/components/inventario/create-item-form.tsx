"use client";

import { useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  PackageIcon,
  ZapIcon,
  PlusSignIcon,
  ShoppingBasket01Icon,
  InformationCircleIcon,
  Dollar01Icon,
  Task01Icon,
  CloudUploadIcon,
  Ticket01Icon,
  Refresh01Icon,
  Image02Icon
} from "hugeicons-react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldLabel,
  FieldError
} from "@/components/ui/field";
import { ItemType, PriceType } from "@/domain/entities/item.entity";
import { StoreCategoryRepositoryImpl } from "@/infrastructure/repositories/store-category.repository.impl";
import { ItemRepositoryImpl } from "@/infrastructure/repositories/item.repository.impl";
import { MultiImageSelector } from "@/components/ui/multi-image-selector";
import { cn } from "@/lib/utils";
import { uploadImagesAction, deleteImagesAction } from "@/app/actions/media.actions";
import { CreateCategorySheet } from "@/components/inventario/create-category-sheet";
import { StoreCategory } from "@/domain/entities/store-category.entity";

// ─── Schema Definition ───────────────────────────────────────────────────────
const itemSchema = z.object({
  title: z.string().min(3, "Mínimo 3 caracteres").max(100),
  description: z.string().min(10, "Describe mejor tu producto (mín. 10)").max(2000),
  itemType: z.nativeEnum(ItemType),
  priceType: z.nativeEnum(PriceType),
  price: z.union([z.number(), z.nan()]).optional(),
  categoryId: z.string().uuid("Seleccione una categoría válida").optional().or(z.literal("")),
  trackInventory: z.boolean(),
  stockQuantity: z.union([z.number(), z.nan()]).optional(),
  requiresBooking: z.boolean(),
  isFeatured: z.boolean(),
  discountPrice: z.union([z.number(), z.nan()]).optional(),
});

export type ItemFormValues = z.infer<typeof itemSchema>;

// ─── Repositories ───────────────────────────────────────────────────────────
const categoryRepository = new StoreCategoryRepositoryImpl();
const itemRepository = new ItemRepositoryImpl();

interface CreateItemFormProps {
  storeId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateItemForm({ storeId, onSuccess, onCancel }: CreateItemFormProps) {
  const [itemFiles, setItemFiles] = useState<File[]>([]);
  const [primaryIndex, setPrimaryIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const queryClient = useQueryClient();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      itemType: ItemType.PRODUCT,
      priceType: PriceType.FIXED,
      trackInventory: true,
      requiresBooking: false,
      isFeatured: false,
      categoryId: "",
    }
  });

  const selectedType = watch("itemType");
  const selectedPriceType = watch("priceType");
  const isTrackingInventory = watch("trackInventory");

  const { data: categories = [] } = useQuery({
    queryKey: ["store-categories", storeId],
    queryFn: () => categoryRepository.findByStoreId(storeId),
    enabled: !!storeId,
  });

  const mappedCategories = useMemo(() => [
    { label: "Sin Categoría", value: "" },
    ...categories.map((cat: any) => ({ label: cat.name, value: cat.id }))
  ], [categories]);

  const mutation = useMutation({
    mutationFn: (data: any) => itemRepository.create(data),
    onSuccess,
  });

  const handleImagesChange = useCallback((files: File[], index: number) => {
    setItemFiles(files);
    setPrimaryIndex(index);
  }, []);

  const handleCategoryCreated = (category: StoreCategory) => {
    queryClient.invalidateQueries({ queryKey: ["store-categories", storeId] });
    setValue("categoryId", category.id, { shouldValidate: true });
    setIsCategorySheetOpen(false);
  };

  const onSubmit = async (values: ItemFormValues) => {
    if (itemFiles.length === 0) {
      toast.error("Debes añadir al menos una imagen para tu producto.");
      return;
    }

    try {
      setIsUploading(true);

      const imageFormData = new FormData();
      itemFiles.forEach((file) => imageFormData.append("files", file));
      imageFormData.append("primaryIndex", primaryIndex.toString());

      const uploadResult = await uploadImagesAction(imageFormData);

      if (!uploadResult || uploadResult.error || uploadResult.status !== "success") {
        throw new Error(uploadResult?.error || "Error al subir las imágenes al procesador.");
      }

      // El procesador de imágenes devuelve { status: 'success', data: [{ id, url, isPrimary }, ...] }
      const imageData = uploadResult.data;
      const uploadedImageIds = imageData.map((img: any) => img.id);

      const mainImageObj = imageData.find((img: any) => img.isPrimary) || imageData[0];
      const mainImageUrl = mainImageObj.url;

      const payload = {
        title: values.title,
        description: values.description,
        itemType: values.itemType,
        storeId,
        mainImage: mainImageUrl,
        images: imageData.map((img: any) => img.url),
        attributes: {},
        trackInventory: values.trackInventory,
        requiresBooking: values.requiresBooking,
        isFeatured: values.isFeatured,
        priceType: values.priceType,
        price: (values.priceType === PriceType.FREE) ? 0 : ((typeof values.price === 'number') ? values.price : 0),
        discountPrice: (typeof values.discountPrice === 'number') ? values.discountPrice : undefined,
        stockQuantity: values.trackInventory
          ? (typeof values.stockQuantity === 'number' ? values.stockQuantity : 0)
          : undefined,
        categoryId: values.categoryId === "" ? undefined : values.categoryId,
      };

      try {
        await mutation.mutateAsync(payload);
      } catch (createError: any) {
        // 🛡️ ROLLBACK: Si falla la creación del item en el backend, borramos las imágenes subidas
        console.warn("Falla en creación de item. Ejecutando Rollback de imágenes...");
        toast.info("Falla detectada. Iniciando rollback de seguridad en el servidor de imágenes...");
        await deleteImagesAction(uploadedImageIds);
        throw createError;
      }

    } catch (error: any) {
      console.error("Error en el proceso de publicación:", error);

      const backendMessage = error.response?.data?.message || error.message || "Error desconocido";
      toast.error(`No se pudo completar la publicación: ${backendMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-[90vh] md:h-[85vh] overflow-hidden bg-white dark:bg-slate-950">
      {/* ─── Elite Header ─── */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
            <PlusSignIcon size={20} strokeWidth={3} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">Publicar Nuevo Item</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Configuración Detallada</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onCancel} className="h-10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg">Cancelar</Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={mutation.isPending || isUploading}
            className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-2 rounded-lg text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20"
          >
            {mutation.isPending || isUploading ? "Procesando..." : "Finalizar y Guardar"}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ─── Main Viewport ─── */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-20">

            {/* ────── SECTION 01: Identidad ────── */}
            <section className="space-y-10">
              <div className="flex flex-col gap-1">
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-600">01. Identidad Visual</h3>
                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />
              </div>

              <div className="grid grid-cols-1 gap-12">
                <Field>
                  <div className="flex items-center gap-3 mb-6 ml-1">
                    <Image02Icon size={20} className="text-indigo-400" />
                    <FieldLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500">Galería de Activos Digitales</FieldLabel>
                  </div>
                  <div className="bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 p-10 shadow-inner">
                    <MultiImageSelector
                      onImagesChange={handleImagesChange}
                      maxImages={10}
                    />
                  </div>
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <Field>
                    <FieldLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">Nombre Público del Ítem</FieldLabel>
                    <Input
                      {...register("title")}
                      placeholder="Ej. Pizza Fugazzeta XL"
                      className="h-16 rounded-lg border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950 px-8 font-bold text-lg focus:ring-8 focus:ring-indigo-600/5 outline-none transition-all shadow-sm"
                    />
                    <FieldError errors={[errors.title]} />
                  </Field>

                  <Field>
                    <FieldLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">Categoría Maestra</FieldLabel>
                    <Select
                      value={watch("categoryId") || ""}
                      items={mappedCategories}
                      onValueChange={(val) => {
                        if (val === "CREATE_NEW") setIsCategorySheetOpen(true);
                        else setValue("categoryId", val || "", { shouldValidate: true });
                      }}
                    >
                      <SelectTrigger className="!h-16 w-full rounded-lg border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950 px-8 font-bold text-lg transition-all focus:ring-8 focus:ring-indigo-600/5 data-placeholder:text-slate-400 group/select shadow-sm">
                        <SelectValue placeholder="Seleccione Categoría" />
                      </SelectTrigger>
                      <SelectContent
                        className="rounded-xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] bg-white/95 dark:bg-slate-950/95 backdrop-blur-3xl border-slate-100 dark:border-slate-800 p-3 min-w-[300px] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
                        sideOffset={10}
                      >
                        <SelectGroup className="space-y-1">
                          <SelectItem value="" label="Sin Categoría" className="h-14 px-6 rounded-lg font-bold text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer">
                            Sin Categoría
                          </SelectItem>
                          {categories.map((cat) => (
                            <SelectItem
                              key={cat.id}
                              value={cat.id}
                              label={cat.name}
                              className="h-14 px-6 rounded-lg font-bold text-slate-700 dark:text-slate-200 focus:bg-indigo-50 dark:focus:bg-indigo-950/30 focus:text-indigo-600 transition-all cursor-pointer"
                            >
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        <div className="border-t border-slate-100 dark:border-slate-800 mt-3 pt-3 px-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsCategorySheetOpen(true);
                            }}
                            className="w-full flex items-center gap-3 p-4 text-indigo-600 font-extrabold text-[10px] uppercase tracking-widest hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg transition-all group"
                          >
                            <div className="h-8 w-8 rounded-md bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                              <PlusSignIcon size={18} />
                            </div>
                            Crear nueva categoría técnica...
                          </button>
                        </div>
                      </SelectContent>
                    </Select>
                    <FieldError errors={[errors.categoryId]} />
                  </Field>
                </div>

                <Field>
                  <FieldLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">Descripción Detallada</FieldLabel>
                  <textarea
                    {...register("description")}
                    placeholder="Detalla los beneficios, ingredientes o características técnicas..."
                    className="min-h-[160px] w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950 p-8 text-base font-medium focus:ring-8 focus:ring-indigo-600/5 outline-none transition-all resize-none shadow-inner"
                  />
                  <FieldError errors={[errors.description]} />
                </Field>
              </div>
            </section>

            {/* ────── SECTION 02: Economía ────── */}
            <section className="space-y-10">
              <div className="flex flex-col gap-1">
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-600">02. Economía e Interacción</h3>
                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <Field>
                  <FieldLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">Tipo de Oferta</FieldLabel>
                  <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 h-16">
                    <button
                      type="button"
                      onClick={() => setValue("itemType", ItemType.PRODUCT)}
                      className={cn(
                        "flex items-center justify-center gap-3 rounded-lg transition-all font-black text-[11px] uppercase tracking-widest",
                        selectedType === ItemType.PRODUCT ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-xl" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      <ShoppingBasket01Icon size={20} /> Producto
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue("itemType", ItemType.SERVICE)}
                      className={cn(
                        "flex items-center justify-center gap-3 rounded-lg transition-all font-black text-[11px] uppercase tracking-widest",
                        selectedType === ItemType.SERVICE ? "bg-white dark:bg-slate-800 text-purple-600 shadow-xl" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      <ZapIcon size={20} /> Servicio
                    </button>
                  </div>
                </Field>

                <Field>
                  <FieldLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">Estructura de Cobro</FieldLabel>
                  <Select
                    value={selectedPriceType}
                    onValueChange={(val) => setValue("priceType", val as PriceType, { shouldValidate: true })}
                    items={[
                      { label: "Precio Fijo", value: PriceType.FIXED },
                      { label: "Desde (Base)", value: PriceType.STARTING_AT },
                      { label: "Negociable", value: PriceType.NEGOTIABLE },
                      { label: "A Consultar", value: PriceType.ON_DEMAND },
                      { label: "Gratis", value: PriceType.FREE },
                    ]}
                  >
                    <SelectTrigger className="!h-16 w-full rounded-xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950 px-8 font-bold text-lg transition-all focus:ring-8 focus:ring-emerald-600/5 group/select shadow-sm">
                      <SelectValue placeholder="Tipo de Precio" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-2xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-3xl border-slate-100 dark:border-slate-800 p-3 min-w-[240px]">
                      <SelectGroup className="space-y-1">
                        {[
                          { label: "Precio Fijo", value: PriceType.FIXED, desc: "El cliente paga el monto exacto" },
                          { label: "Desde (Base)", value: PriceType.STARTING_AT, desc: "El precio puede subir según opciones" },
                          { label: "Negociable", value: PriceType.NEGOTIABLE, desc: "Sujeto a oferta del cliente" },
                          { label: "A Consultar", value: PriceType.ON_DEMAND, desc: "No se muestra precio públicamente" },
                          { label: "Gratis / Donación", value: PriceType.FREE, desc: "Sin costo directo" },
                        ].map((pt) => (
                          <SelectItem
                            key={pt.value}
                            value={pt.value}
                            label={pt.label}
                            className="h-16 px-6 rounded-lg font-bold text-slate-700 dark:text-slate-200 focus:bg-emerald-50 dark:focus:bg-emerald-950/30 focus:text-emerald-600 transition-all cursor-pointer"
                          >
                            <div className="flex flex-col items-start gap-0.5">
                              <span className="text-sm">{pt.label}</span>
                              <span className="text-[9px] font-medium text-slate-400 group-focus:text-emerald-500/60 transition-colors uppercase tracking-widest">{pt.desc}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                <div className="grid grid-cols-2 gap-8">
                  <Field>
                    <FieldLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">
                      {selectedPriceType === PriceType.STARTING_AT ? "Precio Base (USD)" : "Precio Actual (USD)"}
                    </FieldLabel>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-lg">$</span>
                      <Input
                        type="number" step="0.01" {...register("price", { valueAsNumber: true })}
                        disabled={selectedPriceType === PriceType.FREE || selectedPriceType === PriceType.ON_DEMAND}
                        className={cn(
                          "h-16 pl-10 rounded-lg border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950 font-black text-2xl focus:ring-8 focus:ring-emerald-600/5 group-hover:scale-105 transition-all shadow-sm",
                          (selectedPriceType === PriceType.FREE || selectedPriceType === PriceType.ON_DEMAND) && "opacity-50 cursor-not-allowed bg-slate-100"
                        )}
                        placeholder="0.00"
                      />
                    </div>
                    <FieldError errors={[errors.price]} />
                  </Field>

                  <Field>
                    <FieldLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">Precio Oferta (USD)</FieldLabel>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/40 font-bold text-lg">$</span>
                      <Input
                        type="number" step="0.01" {...register("discountPrice", { valueAsNumber: true })}
                        disabled={selectedPriceType === PriceType.FREE || selectedPriceType === PriceType.ON_DEMAND || selectedPriceType === PriceType.NEGOTIABLE}
                        className={cn(
                          "h-16 pl-10 rounded-lg border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950 font-black text-2xl text-emerald-600 focus:ring-8 focus:ring-emerald-600/10 shadow-sm",
                          (selectedPriceType === PriceType.FREE || selectedPriceType === PriceType.ON_DEMAND || selectedPriceType === PriceType.NEGOTIABLE) && "opacity-50 cursor-not-allowed bg-slate-100"
                        )}
                        placeholder="0.00"
                      />
                    </div>
                  </Field>
                </div>
              </div>
            </section>

            {/* ────── SECTION 03: Logística ────── */}
            <section className="space-y-10">
              <div className="flex flex-col gap-1">
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-600">03. Logística e Inventario</h3>
                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className={cn(
                  "flex items-center justify-between p-8 rounded-xl border transition-all duration-700 group",
                  isTrackingInventory ? "bg-amber-500/5 border-amber-500/20 shadow-2xl shadow-amber-500/5 scale-[1.02]" : "bg-white/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800"
                )}>
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "h-14 w-14 rounded-lg flex items-center justify-center transition-all duration-700",
                      isTrackingInventory ? "bg-amber-500 text-white shadow-2xl shadow-amber-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-amber-400"
                    )}>
                      <Task01Icon size={28} />
                    </div>
                    <div>
                      <p className="text-base font-black text-slate-900 dark:text-white">Control de Existencias</p>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Gestionar el stock de forma manual</p>
                    </div>
                  </div>
                  <Checkbox
                    checked={isTrackingInventory}
                    onCheckedChange={(val) => setValue("trackInventory", val === true)}
                    className="h-8 w-8 rounded-lg border-2 border-slate-300 dark:border-slate-700 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500 transition-all shadow-sm"
                  />
                </div>

                <AnimatePresence>
                  {isTrackingInventory && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                      <Field>
                        <FieldLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">Unidades Disponibles</FieldLabel>
                        <Input
                          type="number" {...register("stockQuantity", { valueAsNumber: true })}
                          className="h-16 rounded-lg border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950 font-black text-3xl px-8 shadow-sm"
                          placeholder="000"
                        />
                      </Field>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between p-8 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 group hover:scale-[1.02] transition-all shadow-sm">
                  <div className="flex items-center gap-6">
                    <div className="h-14 w-14 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center text-indigo-500 shadow-xl border border-indigo-100 dark:border-indigo-800">
                      <Ticket01Icon size={28} />
                    </div>
                    <div>
                      <p className="text-base font-black text-slate-900 dark:text-white">Destacar en Vitrina</p>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Posición preferencial en la APP</p>
                    </div>
                  </div>
                  <Checkbox
                    checked={watch("isFeatured")}
                    onCheckedChange={(val) => setValue("isFeatured", val === true)}
                    className="h-8 w-8 rounded-lg border-2 border-indigo-200 dark:border-indigo-800 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 transition-all shadow-sm"
                  />
                </div>
              </div>
            </section>

          </form>
          <div className="h-32" />
        </main>
      </div>

      <CreateCategorySheet
        isOpen={isCategorySheetOpen}
        onClose={() => setIsCategorySheetOpen(false)}
        storeId={storeId}
        onSuccess={handleCategoryCreated}
      />
    </div>
  );
}
