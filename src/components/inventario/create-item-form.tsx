"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store01Icon,
  PackageIcon,
  ShoppingBasket01Icon,
  Image01Icon,
  Configuration01Icon,
  PlusSignIcon,
  CheckmarkCircle01Icon,
  Loading03Icon,
  Delete02Icon,
  DeliveryTruck01Icon,
  Calendar01Icon
} from "hugeicons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ItemType } from "@/domain/entities/item.entity";
import { StoreCategory } from "@/domain/entities/store-category.entity";
import { ItemRepositoryImpl } from "@/infrastructure/repositories/item.repository.impl";
import { StoreCategoryRepositoryImpl } from "@/infrastructure/repositories/store-category.repository.impl";
import { CreateItemUseCase } from "@/application/use-cases/item/create-item.use-case";
import { GetStoreCategoriesUseCase } from "@/application/use-cases/category/get-store-categories.use-case";
import { CreateCategorySheet } from "./create-category-sheet";
import { ImageCropper } from "@/components/ui/image-cropper";
import { uploadImagesAction, deleteImagesAction } from "@/app/actions/media.actions";
import { getOptimizedImageUrl, IMAGE_PRESETS } from "@/lib/images";
import { StarIcon } from "hugeicons-react";

// ─── Schema ───────────────────────────────────────────────────────────────────

const itemSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres").max(100),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres").max(2000),
  itemType: z.nativeEnum(ItemType),
  price: z.preprocess((val) => (val === "" || val === null || (typeof val === "number" && isNaN(val)) ? undefined : Number(val)), z.number().min(0).optional()) as any,
  categoryId: z.string().uuid("Seleccione una categoría válida").optional().or(z.literal("")),
  trackInventory: z.boolean(),
  stockQuantity: z.preprocess((val) => (val === "" || val === null || (typeof val === "number" && isNaN(val)) ? undefined : Number(val)), z.number().min(0).optional()) as any,
  requiresBooking: z.boolean(),
});

export type ItemFormValues = {
  title: string;
  description: string;
  itemType: ItemType;
  price?: number;
  categoryId?: string;
  trackInventory: boolean;
  stockQuantity?: number;
  requiresBooking: boolean;
};

// ─── Components ───────────────────────────────────────────────────────────────

const itemRepository = new ItemRepositoryImpl();
const categoryRepository = new StoreCategoryRepositoryImpl();
const createItemUseCase = new CreateItemUseCase(itemRepository);
const getCategoriesUseCase = new GetStoreCategoriesUseCase(categoryRepository);

interface CreateItemFormProps {
  storeId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateItemForm({ storeId, onSuccess, onCancel }: CreateItemFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [pendingImages, setPendingImages] = useState<{ file: File; preview: string }[]>([]);
  const [primaryIndex, setPrimaryIndex] = useState(0);
  const [imageError, setImageError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema) as any,
    defaultValues: {
      itemType: ItemType.PRODUCT,
      trackInventory: true,
      requiresBooking: false,
    },
  });

  const selectedType = watch("itemType");
  const isTrackingInventory = watch("trackInventory");
  const titleValue = watch("title") || "";
  const descriptionValue = watch("description") || "";

  // Load categories
  const loadCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const data = await getCategoriesUseCase.execute(storeId);
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading categories:", error);
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [storeId]);

  const handleImageAdd = (file: File) => {
    const preview = URL.createObjectURL(file);
    setPendingImages((prev) => [...prev, { file, preview }]);
    setImageError(null);
  };

  const removeImage = (index: number) => {
    setPendingImages((prev) => {
      const newImages = prev.filter((_, i) => i !== index);
      // Clean up object URL to avoid memory leaks
      URL.revokeObjectURL(prev[index].preview);
      return newImages;
    });
    
    // Adjust primary index if needed
    if (primaryIndex === index) {
      setPrimaryIndex(0);
    } else if (primaryIndex > index) {
      setPrimaryIndex(primaryIndex - 1);
    }
  };

  const onSubmit = async (values: ItemFormValues) => {
    if (pendingImages.length === 0) {
      setImageError("Debe subir al menos una imagen.");
      const imagesSection = document.getElementById("images-section");
      imagesSection?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsSubmitting(true);
    let uploadedIds: string[] = [];

    try {
      // 1. Bulk Upload Images
      const formData = new FormData();
      pendingImages.forEach((item) => formData.append("files", item.file));
      formData.append("primaryIndex", primaryIndex.toString());

      const uploadResult = await uploadImagesAction(formData);
      
      if (uploadResult.status !== "success") {
        throw new Error(uploadResult.error || "Error al subir imágenes");
      }

      const uploadedData = uploadResult.data as { id: string; url: string; isPrimary: boolean }[];
      uploadedIds = uploadedData.map(img => img.id);
      
      // Backend expects absolute URLs for @IsUrl validation
      const SERVER_URL = process.env.NEXT_PUBLIC_API_URL_IMAGES || "http://localhost:4200";
      const imageUrls = uploadedData.map(img => `${SERVER_URL}${img.url}`);
      const mainImage = uploadedData.find(img => img.isPrimary) 
        ? `${SERVER_URL}${uploadedData.find(img => img.isPrimary)?.url}` 
        : imageUrls[0];

      // Clean categoryId if it's empty string
      const finalValues = {
        ...values,
        categoryId: values.categoryId === "" ? undefined : values.categoryId,
        trackInventory: values.itemType === ItemType.PRODUCT ? values.trackInventory : false,
        requiresBooking: values.itemType === ItemType.SERVICE ? true : values.requiresBooking,
      };

      // 2. Create Item with URLs
      await createItemUseCase.execute({
        ...finalValues,
        storeId,
        mainImage,
        images: imageUrls,
        attributes: {},
      });
      
      onSuccess();
    } catch (error) {
      console.error("Submission error:", error);
      
      // Rollback: Delete uploaded images if item creation failed
      if (uploadedIds.length > 0) {
        console.warn("Rolling back uploaded images:", uploadedIds);
        await deleteImagesAction(uploadedIds);
      }

      alert(error instanceof Error ? error.message : "Error al crear el item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onInvalid = (errors: any) => {
    console.warn("Validation errors:", errors);
    const firstError = Object.keys(errors)[0];
    const element = document.getElementsByName(firstError)[0];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      (element as HTMLElement).focus();
    }
    
    if (pendingImages.length === 0) {
      setImageError("Debe subir al menos una imagen.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      <form 
        id="create-item-form"
        onSubmit={handleSubmit(onSubmit, onInvalid)} 
        className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 pb-24"
      >
        
        {/* Section: Basic Info */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
              <Configuration01Icon size={18} className="text-indigo-600" />
            </div>
            <h2 className="text-lg font-bold">Información General</h2>
          </div>

          <Field>
            <div className="flex items-center justify-between mb-2">
              <FieldLabel>Título del {selectedType === ItemType.PRODUCT ? "Producto" : "Servicio"}</FieldLabel>
              <span className={cn(
                "text-[10px] font-bold",
                titleValue.length > 100 ? "text-red-500" : "text-gray-400"
              )}>
                {titleValue.length}/100
              </span>
            </div>
            <Input 
              {...register("title")} 
              placeholder="Ej. iPhone 15 Pro, Limpieza Dental, Torta de Chocolate..." 
              className={cn(
                "rounded-xl border-gray-200 dark:border-gray-800",
                errors.title && "border-red-500 ring-1 ring-red-500/20"
              )}
            />
            <FieldError errors={[errors.title]} />
          </Field>

          <Field>
            <div className="flex items-center justify-between mb-2">
              <FieldLabel>Descripción Detallada</FieldLabel>
              <span className={cn(
                "text-[10px] font-bold",
                descriptionValue.length > 1000 ? "text-red-500" : "text-gray-400"
              )}>
                {descriptionValue.length}/1000
              </span>
            </div>
            <textarea 
              {...register("description")} 
              className={cn(
                "min-h-[100px] w-full rounded-xl border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 resize-none",
                errors.description ? "border-red-500 ring-1 ring-red-500/20" : "border-gray-200 dark:border-gray-800"
              )}
              placeholder="Describe las características principales..."
            />
            <FieldError errors={[errors.description]} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setValue("itemType", ItemType.PRODUCT)}
              className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                selectedType === ItemType.PRODUCT 
                ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20" 
                : "border-gray-100 dark:border-gray-800 hover:border-indigo-200"
              }`}
            >
              <PackageIcon className={selectedType === ItemType.PRODUCT ? "text-indigo-600" : "text-gray-400"} />
              <div className="text-left">
                <p className="text-sm font-bold">Producto</p>
                <p className="text-[10px] text-gray-400">Físico y tangible</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setValue("itemType", ItemType.SERVICE)}
              className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                selectedType === ItemType.SERVICE 
                ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20" 
                : "border-gray-100 dark:border-gray-800 hover:border-indigo-200"
              }`}
            >
              <Calendar01Icon className={selectedType === ItemType.SERVICE ? "text-indigo-600" : "text-gray-400"} />
              <div className="text-left">
                <p className="text-sm font-bold">Servicio</p>
                <p className="text-[10px] text-gray-400">Agendas y tiempo</p>
              </div>
            </button>
          </div>
        </section>

        <Separator className="bg-gray-100 dark:bg-gray-800" />

        {/* Section: Categorization */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                <ShoppingBasket01Icon size={18} className="text-indigo-600" />
              </div>
              <h2 className="text-lg font-bold">Categoría</h2>
            </div>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              onClick={() => setIsCategorySheetOpen(true)}
              className="text-indigo-600 hover:text-indigo-700 font-bold gap-1.5"
            >
              <PlusSignIcon size={14} />
              Nueva
            </Button>
          </div>

          <Field>
            <select
              {...register("categoryId")}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <FieldError errors={[errors.categoryId]} />
          </Field>
        </section>

        <Separator className="bg-gray-100 dark:bg-gray-800" />

        {/* Section: Price & Inventory */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
              <DeliveryTruck01Icon size={18} className="text-indigo-600" />
            </div>
            <h2 className="text-lg font-bold">Precio e Inventario</h2>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Field>
              <FieldLabel>Precio Base ($)</FieldLabel>
              <Input 
                type="number" 
                step="0.01" 
                {...register("price", { valueAsNumber: true })} 
                placeholder="0.00"
                className="rounded-xl border-gray-200 dark:border-gray-800"
              />
              <FieldError errors={[errors.price]} />
            </Field>

            {selectedType === ItemType.PRODUCT && (
              <Field>
                <FieldLabel>Stock Disponible</FieldLabel>
                <Input 
                  type="number" 
                  {...register("stockQuantity", { valueAsNumber: true })} 
                  placeholder="0"
                  disabled={!isTrackingInventory}
                  className="rounded-xl border-gray-200 dark:border-gray-800"
                />
              </Field>
            )}
          </div>
        </section>

        <Separator className="bg-gray-100 dark:bg-gray-800" />

        {/* Section: Images */}
        <section id="images-section" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                <Image01Icon size={18} className="text-indigo-600" />
              </div>
              <h2 className="text-lg font-bold">Imágenes</h2>
            </div>
            <div className="flex items-center gap-3">
              {imageError && (
                <p className="text-[10px] font-bold text-red-500 animate-bounce">
                  {imageError}
                </p>
              )}
              <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                  {pendingImages.length} / 5 fotos
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
            <AnimatePresence>
              {pendingImages.map((img, i) => (
                <motion.div 
                  key={img.preview}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={cn(
                    "relative aspect-square rounded-2xl border overflow-hidden group shadow-sm transition-all",
                    primaryIndex === i 
                      ? "border-indigo-500 ring-2 ring-indigo-500/20" 
                      : "border-gray-100 dark:border-gray-800"
                  )}
                >
                  <img 
                    src={img.preview} 
                    alt="Producto" 
                    className="h-full w-full object-cover" 
                  />
                  
                  {/* Primary Selector Overlay */}
                  <button
                    type="button"
                    onClick={() => setPrimaryIndex(i)}
                    className={cn(
                      "absolute top-2 left-2 p-1.5 rounded-lg backdrop-blur-md transition-all",
                      primaryIndex === i
                        ? "bg-indigo-600 text-white shadow-lg"
                        : "bg-black/20 text-white/50 hover:bg-black/40 opacity-0 group-hover:opacity-100"
                    )}
                    title="Marcar como imagen principal"
                  >
                    <StarIcon size={14} fill={primaryIndex === i ? "currentColor" : "none"} />
                  </button>

                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 p-1.5 bg-black/20 hover:bg-red-500/80 text-white rounded-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Delete02Icon size={14} />
                  </button>

                  {primaryIndex === i && (
                    <div className="absolute bottom-0 left-0 right-0 bg-indigo-600 py-1 px-2">
                       <p className="text-[8px] font-black text-white uppercase text-center tracking-widest">Portada</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {pendingImages.length < 5 && (
              <ImageCropper
                onCropComplete={handleImageAdd}
                outputSize={{ width: 800, height: 800 }}
                label="Añadir"
                className="aspect-square"
                hidePreviewAfterCrop={true}
              />
            )}
          </div>
        </section>

      </form>

      {/* Footer Actions */}
      <div className="sticky bottom-0 left-0 right-0 p-6 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3 z-10 -mx-8 -mb-8 mt-8">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={onCancel}
          className="font-bold text-gray-500 h-12 px-6 rounded-2xl"
        >
          Descartar
        </Button>
        <Button 
          type="submit" 
          form="create-item-form"
          disabled={isSubmitting}
          className="bg-indigo-600 hover:bg-indigo-700 text-white h-12 px-8 rounded-2xl font-black shadow-xl shadow-indigo-600/20"
        >
          {isSubmitting ? (
            <Loading03Icon className="animate-spin" />
          ) : (
            <div className="flex items-center gap-2">
              <CheckmarkCircle01Icon size={18} strokeWidth={2.5} />
              Guardar {selectedType === ItemType.PRODUCT ? "Producto" : "Servicio"}
            </div>
          )}
        </Button>
      </div>

      <CreateCategorySheet
        isOpen={isCategorySheetOpen}
        onClose={() => setIsCategorySheetOpen(false)}
        storeId={storeId}
        onSuccess={(newCat) => {
          setCategories((prev) => [...prev, newCat]);
          setValue("categoryId", newCat.id);
        }}
      />
    </div>
  );
}
