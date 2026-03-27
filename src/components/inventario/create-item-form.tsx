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
import { ItemType } from "@/domain/entities/item.entity";
import { StoreCategory } from "@/domain/entities/store-category.entity";
import { ItemRepositoryImpl } from "@/infrastructure/repositories/item.repository.impl";
import { StoreCategoryRepositoryImpl } from "@/infrastructure/repositories/store-category.repository.impl";
import { CreateItemUseCase } from "@/application/use-cases/item/create-item.use-case";
import { GetStoreCategoriesUseCase } from "@/application/use-cases/category/get-store-categories.use-case";
import { CreateCategorySheet } from "./create-category-sheet";
import { ImageCropper } from "@/components/ui/image-cropper";
import { uploadImageAction } from "@/app/actions/media.actions";

// ─── Schema ───────────────────────────────────────────────────────────────────

const itemSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres").max(100),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres").max(1000),
  itemType: z.nativeEnum(ItemType),
  price: z.number().min(0, "El precio no puede ser negativo").optional(),
  categoryId: z.string().uuid("Seleccione una categoría válida").optional(),
  trackInventory: z.boolean(),
  stockQuantity: z.number().min(0).optional(),
  requiresBooking: z.boolean(),
});

type ItemFormValues = z.infer<typeof itemSchema>;

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
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      itemType: ItemType.PRODUCT,
      trackInventory: true,
      requiresBooking: false,
    },
  });

  const selectedType = watch("itemType");
  const isTrackingInventory = watch("trackInventory");

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

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadImageAction(formData);
      if (result.status === "success" && result.data?.url) {
        setImages((prev) => [...prev, result.data!.url!]);
      }
    } catch (error) {
      console.error("Image upload failed:", error);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: ItemFormValues) => {
    if (images.length === 0) {
      alert("Debe subir al menos una imagen.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createItemUseCase.execute({
        ...values,
        storeId,
        images,
        attributes: {}, // For now, empty attributes. Can be expanded per type.
      });
      onSuccess();
    } catch (error) {
      console.error("Error creating item:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 pb-24">
        
        {/* Section: Basic Info */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
              <Configuration01Icon size={18} className="text-indigo-600" />
            </div>
            <h2 className="text-lg font-bold">Información General</h2>
          </div>

          <Field>
            <FieldLabel>Título del {selectedType === ItemType.PRODUCT ? "Producto" : "Servicio"}</FieldLabel>
            <Input 
              {...register("title")} 
              placeholder="Ej. iPhone 15 Pro, Limpieza Dental, Torta de Chocolate..." 
              className="rounded-xl border-gray-200 dark:border-gray-800"
            />
            <FieldError errors={[errors.title]} />
          </Field>

          <Field>
            <FieldLabel>Descripción Detallada</FieldLabel>
            <textarea 
              {...register("description")} 
              className="min-h-[100px] w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 resize-none"
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
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
              <Image01Icon size={18} className="text-indigo-600" />
            </div>
            <h2 className="text-lg font-bold">Imágenes</h2>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
            <AnimatePresence>
              {images.map((url, i) => (
                <motion.div 
                  key={url}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative aspect-square rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden group shadow-sm"
                >
                  <img src={url} alt="Producto" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Delete02Icon className="text-white" size={20} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            
            <ImageCropper
              onCropComplete={handleImageUpload}
              outputSize={{ width: 800, height: 800 }}
              label="Añadir imagen"
              className="aspect-square"
            />
          </div>
        </section>

      </form>

      {/* Footer Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={onCancel}
          className="font-bold text-gray-500 py-6 px-8 rounded-2xl"
        >
          Descartar
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-6 px-10 rounded-2xl font-black shadow-xl shadow-indigo-600/20 min-w-[180px]"
          onClick={handleSubmit(onSubmit)}
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
